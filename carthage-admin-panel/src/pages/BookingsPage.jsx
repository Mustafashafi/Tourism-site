import React, { useState, useEffect } from "react";
import { apiService } from "../api";
import { toast } from "react-hot-toast";
import { 
  Plus, Search, Edit2, Check, X, Eye, 
  Trash2, Filter, DollarSign, Calendar, Clock, ArrowRight, User, ShoppingBag, PlusCircle, MinusCircle 
} from "lucide-react";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Manual Booking Form States
  const [newBooking, setNewBooking] = useState({
    customerDetails: { fullName: "", email: "", phone: "" },
    items: [],
    paymentMethod: "card",
    paymentStatus: "paid",
    bookingStatus: "new",
    pickupLocation: "",
    remarks: ""
  });

  // Edit Booking Form States
  const [editForm, setEditForm] = useState({
    paymentStatus: "paid",
    bookingStatus: "new",
    pickupLocation: "",
    remarks: ""
  });

  // Temporary single item compiler for manual bookings
  const [itemInput, setItemInput] = useState({
    product: "",
    transferOption: "without_transfer",
    guests: { adult: 1, child: 0, infant: 0 },
    price: 0,
    date: ""
  });

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  useEffect(() => {
    if (showAddModal) {
      apiService.listProducts({ limit: 1000 }).then(res => setProducts(res.items || [])).catch(console.error);
    }
  }, [showAddModal]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await apiService.listBookings({
        page,
        status: statusFilter,
        search,
        limit: 20
      });
      setBookings(res.items || []);
      setMeta(res.meta || {});
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      pickupLocation: booking.pickupLocation || "",
      remarks: booking.remarks || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateBooking(selectedBooking._id, editForm);
      toast.success("Booking updated successfully!");
      setShowEditModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.message || "Failed to update booking");
    }
  };

  const handleAddItemToBooking = () => {
    if (!itemInput.product || !itemInput.date || itemInput.price <= 0) {
      toast.error("Please select product, date, and valid price.");
      return;
    }
    const prodObj = products.find(p => p._id === itemInput.product);
    const item = {
      product: itemInput.product,
      productName: prodObj ? prodObj.name : "Selected Product",
      transferOption: itemInput.transferOption,
      guests: { ...itemInput.guests },
      price: Number(itemInput.price),
      date: new Date(itemInput.date).toISOString()
    };
    setNewBooking(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    // Reset item input
    setItemInput({
      product: "",
      transferOption: "without_transfer",
      guests: { adult: 1, child: 0, infant: 0 },
      price: 0,
      date: ""
    });
  };

  const handleRemoveItem = (idx) => {
    setNewBooking(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (newBooking.items.length === 0) {
      toast.error("Please add at least one booking item.");
      return;
    }
    const totalAmount = newBooking.items.reduce((sum, item) => sum + item.price, 0);
    try {
      await apiService.createBooking({
        ...newBooking,
        totalAmount
      });
      toast.success("Booking manually created!");
      setShowAddModal(false);
      // Reset newBooking
      setNewBooking({
        customerDetails: { fullName: "", email: "", phone: "" },
        items: [],
        paymentMethod: "card",
        paymentStatus: "paid",
        bookingStatus: "new",
        pickupLocation: "",
        remarks: ""
      });
      fetchBookings();
    } catch (err) {
      toast.error(err.message || "Failed to create booking");
    }
  };

  const handleProductChange = (prodId) => {
    const prod = products.find(p => p._id === prodId);
    if (prod) {
      const price = prod.pricing?.discountPrice ?? prod.pricing?.actualPrice ?? 0;
      setItemInput(prev => ({
        ...prev,
        product: prodId,
        price
      }));
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Bookings Management</h2>
          <p className="text-sm text-surface-600">Track online checkout orders and register manual bookings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Booking
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search booking ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
            className="w-full bg-surface-50 border border-surface-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm font-semibold text-surface-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            onClick={fetchBookings}
            className="btn-secondary text-sm px-4"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <p className="text-surface-500 font-bold mb-2">No bookings found</p>
          <p className="text-surface-400 text-xs">Try shifting your filters or add a manual booking.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-surface-200 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Booking Status</th>
                <th className="p-4">Placed Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-medium">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-surface-50/50">
                  <td className="p-4 text-xs font-bold text-[#CC1422]">{booking.bookingId}</td>
                  <td className="p-4">
                    <p className="text-surface-900">{booking.customerDetails?.fullName}</p>
                    <p className="text-xs text-surface-400">{booking.customerDetails?.email}</p>
                  </td>
                  <td className="p-4 text-surface-900">AED {booking.totalAmount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {booking.paymentStatus} ({booking.paymentMethod})
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      booking.bookingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      booking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-surface-400">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="p-1 text-surface-400 hover:text-brand-600 transition-colors inline-block"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <form onSubmit={handleCreateBooking} className="bg-white rounded-3xl w-full max-w-2xl relative z-10 p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-surface-900">Add Manual Booking</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-surface-400 hover:text-surface-900">
                <X size={20} />
              </button>
            </div>

            {/* Customer Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider">Customer Details</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newBooking.customerDetails.fullName}
                    onChange={(e) => setNewBooking({
                      ...newBooking,
                      customerDetails: { ...newBooking.customerDetails, fullName: e.target.value }
                    })}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newBooking.customerDetails.email}
                    onChange={(e) => setNewBooking({
                      ...newBooking,
                      customerDetails: { ...newBooking.customerDetails, email: e.target.value }
                    })}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newBooking.customerDetails.phone}
                    onChange={(e) => setNewBooking({
                      ...newBooking,
                      customerDetails: { ...newBooking.customerDetails, phone: e.target.value }
                    })}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Booking Items Compiler */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider">Add Booking Item</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Product</label>
                  <select
                    value={itemInput.product}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="">Select Tour...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Transfer Type</label>
                  <select
                    value={itemInput.transferOption}
                    onChange={(e) => setItemInput({ ...itemInput, transferOption: e.target.value })}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="without_transfer">Without Transfer</option>
                    <option value="shared">Shared Transfer</option>
                    <option value="private">Private Transfer</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Date</label>
                  <input
                    type="date"
                    value={itemInput.date}
                    onChange={(e) => setItemInput({ ...itemInput, date: e.target.value })}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Item Cost (Override)</label>
                  <input
                    type="number"
                    value={itemInput.price}
                    onChange={(e) => setItemInput({ ...itemInput, price: Number(e.target.value) })}
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItemToBooking}
                    className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-bold text-xs transition-colors cursor-pointer border border-brand-200"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Configured Items List */}
            {newBooking.items.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider">Configured Items ({newBooking.items.length})</h4>
                <div className="divide-y border rounded-xl overflow-hidden bg-surface-50/50">
                  {newBooking.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs">
                      <div>
                        <p className="font-bold text-surface-800">{item.productName}</p>
                        <p className="text-[10px] text-surface-400 uppercase font-semibold mt-0.5">
                          {item.transferOption.replace("_", " ")} | {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-surface-900">AED {item.price}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General parameters */}
            <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Payment Method</label>
                <select
                  value={newBooking.paymentMethod}
                  onChange={(e) => setNewBooking({ ...newBooking, paymentMethod: e.target.value })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="card">Card Payment</option>
                  <option value="etihad">Etihad Guest Pay</option>
                  <option value="spot">Pay on the Spot</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Booking Status</label>
                <select
                  value={newBooking.bookingStatus}
                  onChange={(e) => setNewBooking({ ...newBooking, bookingStatus: e.target.value })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Confirm Booking
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <form onSubmit={handleUpdateBooking} className="bg-white rounded-3xl w-full max-w-md relative z-10 p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-surface-900">Update Booking {selectedBooking?.bookingId}</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-surface-400 hover:text-surface-900">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Payment Status</label>
              <select
                value={editForm.paymentStatus}
                onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Booking Status</label>
              <select
                value={editForm.bookingStatus}
                onChange={(e) => setEditForm({ ...editForm, bookingStatus: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Pickup Location</label>
              <input
                type="text"
                value={editForm.pickupLocation}
                onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Remarks</label>
              <textarea
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                rows="3"
                className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Updates
              </button>
            </div>

          </form>
        </div>
      )}
    </section>
  );
};

export default BookingsPage;
