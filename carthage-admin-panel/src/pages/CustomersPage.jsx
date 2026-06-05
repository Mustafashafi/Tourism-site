import React, { useState, useEffect } from "react";
import { apiService } from "../api";
import { toast } from "react-hot-toast";
import { Search, Eye, X, User, Calendar, Mail, Phone, MapPin, ShoppingBag, Heart } from "lucide-react";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Wishlist state for popup
  const [customerWishlist, setCustomerWishlist] = useState([]);

  useEffect(() => {
    fetchCustomersAndBookings();
  }, []);

  const fetchCustomersAndBookings = async () => {
    try {
      setLoading(true);
      const [custs, books] = await Promise.all([
        apiService.listCustomers(),
        apiService.listBookings({ limit: 1000 })
      ]);
      setCustomers(custs || []);
      setBookings(books.items || []);
    } catch (err) {
      toast.error("Failed to load customer profiles");
    } finally {
      setLoading(false);
    }
  };

  // Get user booking statistics
  const getCustomerStats = (email) => {
    const userEmail = (email || "").toLowerCase().trim();
    const userBookings = bookings.filter(b => (b.customerDetails?.email || "").toLowerCase().trim() === userEmail);
    const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    return {
      bookingsCount: userBookings.length,
      totalSpent,
      bookingsList: userBookings
    };
  };

  const handleViewDetails = (customer) => {
    // Look up wishlist in mock profile context or locally if stored.
    // In typical setups, wishlist is saved in user schema, or in local storage of front-end.
    // We can check if we have wishlist field or mock a selection of products for detailed demonstration.
    setSelectedCustomer(customer);
    
    // Simulate/retrieve customer wishlist if available, or empty
    const wishlist = customer.wishlist || [];
    setCustomerWishlist(wishlist);
    
    setShowDetailModal(true);
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Customers Profiles</h2>
        <p className="text-sm text-surface-600">Browse customer registration details, wishlist portfolios, and order logs.</p>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search customer profiles by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-50 border border-surface-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <p className="text-surface-500 font-bold mb-2">No customers found</p>
          <p className="text-surface-400 text-xs">Customer profiles will appear here once registered.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-surface-200 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Bookings</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Profile Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-medium">
              {filteredCustomers.map((cust) => {
                const stats = getCustomerStats(cust.email);
                return (
                  <tr key={cust._id} className="hover:bg-surface-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">
                          {cust.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-surface-900 font-semibold">{cust.name}</p>
                          <p className="text-xs text-surface-400">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-surface-700">{cust.phone || "N/A"}</td>
                    <td className="p-4 text-surface-900">{stats.bookingsCount} orders</td>
                    <td className="p-4 text-surface-950 font-bold">AED {stats.totalSpent.toLocaleString()}</td>
                    <td className="p-4 text-xs text-surface-400">
                      {new Date(cust.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewDetails(cust)}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-brand-100"
                      >
                        Detailed Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Popup Modal */}
      {showDetailModal && selectedCustomer && (() => {
        const stats = getCustomerStats(selectedCustomer.email);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
            <div className="bg-white rounded-3xl w-full max-w-3xl relative z-10 p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold">
                    {selectedCustomer.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-surface-900">{selectedCustomer.name}</h3>
                    <p className="text-xs text-surface-500">Customer profile details & audit trail.</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-surface-400 hover:text-surface-900">
                  <X size={20} />
                </button>
              </div>

              {/* Grid with metadata */}
              <div className="grid sm:grid-cols-2 gap-6 bg-surface-50 p-4 rounded-2xl border border-surface-100">
                <div className="space-y-3">
                  <p className="text-xs flex items-center gap-2 text-surface-600">
                    <Mail size={14} className="text-surface-400" />
                    <strong>Email:</strong> {selectedCustomer.email}
                  </p>
                  <p className="text-xs flex items-center gap-2 text-surface-600">
                    <Phone size={14} className="text-surface-400" />
                    <strong>Phone:</strong> {selectedCustomer.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs flex items-center gap-2 text-surface-600">
                    <Calendar size={14} className="text-surface-400" />
                    <strong>Joined:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs flex items-center gap-2 text-surface-600">
                    <ShoppingBag size={14} className="text-surface-400" />
                    <strong>Orders Placed:</strong> {stats.bookingsCount} orders (AED {stats.totalSpent.toLocaleString()})
                  </p>
                </div>
              </div>

              {/* Bookings History Listing */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider">Booking Logs</h4>
                {stats.bookingsList.length === 0 ? (
                  <p className="text-xs text-surface-500 bg-surface-50 p-4 rounded-xl text-center">This customer has no orders yet.</p>
                ) : (
                  <div className="border rounded-2xl overflow-hidden divide-y divide-surface-100">
                    {stats.bookingsList.map((book) => (
                      <div key={book._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white hover:bg-surface-50/20 text-xs">
                        <div>
                          <p className="font-bold text-[#CC1422]">{book.bookingId}</p>
                          <p className="text-[10px] text-surface-400 mt-1 uppercase font-semibold">
                            {new Date(book.createdAt).toLocaleDateString()} | {book.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2">
                          <p className="font-bold text-surface-900">AED {book.totalAmount}</p>
                          <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            book.bookingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {book.bookingStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </section>
  );
};

export default CustomersPage;
