import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Heart, History, Compass, LogOut, Mail, Phone, Calendar, 
  MapPin, Ticket, ShieldAlert, Award, Star, ArrowRight, ExternalLink 
} from "lucide-react";
import { toast } from "react-hot-toast";
import TourCard from "../components/TourCard";
import { mapProductToCard } from "../utils/mapping";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings", "wishlist", "profile"
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Compute unique destinations from all booked item names (each booking item is a tour/destination)
  const uniqueDestinations = new Set(
    bookings.flatMap(b => b.items.map(item => item.name))
  ).size;

  const stats = {
    toursBooked: bookings.length,
    countriesVisited: uniqueDestinations || 0,
    reviewsWritten: 0,
    memberSince: "2026"
  };

  useEffect(() => {
    // Read user details from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchBookings(parsedUser.email);
    } else {
      // Fallback default guest info if not logged in
      setUser({
        name: "Valued Traveler",
        email: "traveler@example.com",
        phone: "+971 50 000 0000",
        location: "Dubai, UAE"
      });
    }

    // Read wishlist
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(savedWishlist);
  }, []);

  const fetchBookings = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings?search=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.data) {
        const mappedBookings = data.data.map(b => ({
          id: b.bookingId,
          date: b.createdAt,
          items: b.items.map(item => ({
            name: item.product?.name || "Product Name",
            image: item.product?.images?.[0] || "https://via.placeholder.com/100",
            price: item.price,
            details: item.transferOption || "Standard Booking"
          })),
          paymentMethod: b.paymentMethod,
          total: b.totalAmount,
          status: b.bookingStatus === 'new' ? (b.paymentStatus === 'pending' ? 'Pending Payment' : 'Paid & Confirmed') : b.bookingStatus
        }));
        setBookings(mappedBookings);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Successfully logged out");
    navigate("/");
    window.location.reload();
  };

  const clearBookings = () => {
    toast.error("Cannot delete real booking records.");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── HERO BANNER & USER HEADER ────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-red-950 rounded-[32px] p-6 md:p-10 text-white overflow-hidden shadow-xl">
          {/* Abstract circles */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 -mb-20 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between z-10">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                {user?.name?.charAt(0) || <User size={40} />}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user?.name}</h1>
                  <span className="bg-[#CC1422] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                    <Award size={10} /> Explorer Member
                  </span>
                </div>
                <p className="text-white/60 text-sm flex items-center justify-center md:justify-start gap-2">
                  <Mail size={13} /> {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-white/60 text-sm flex items-center justify-center md:justify-start gap-2">
                    <Phone size={13} /> {user?.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shrink-0 w-full md:w-auto">
              <div className="text-center px-2 py-2 sm:py-0">
                <span className="block text-2xl font-black text-white">{stats.toursBooked}</span>
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Bookings</span>
              </div>
              <div className="text-center px-2 py-2 sm:py-0 sm:border-x border-white/10">
                <span className="block text-2xl font-black text-white">{stats.countriesVisited}</span>
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Destinations</span>
              </div>
              <div className="text-center px-2 py-2 sm:py-0">
                <span className="block text-2xl font-black text-white">{wishlist.length}</span>
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Wishlist</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT: SIDEBAR + CONTENT ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Nav tabs */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-2">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "bookings"
                    ? "bg-[#CC1422]/10 text-[#CC1422]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <History size={18} />
                <span>Booking History</span>
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "wishlist"
                    ? "bg-[#CC1422]/10 text-[#CC1422]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Heart size={18} />
                <span>My Wishlist</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-[#CC1422]/10 text-[#CC1422]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <User size={18} />
                <span>Profile Settings</span>
              </button>

              <div className="h-px bg-gray-100 my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Content Area */}
          <div className="lg:col-span-3">
            
            {/* Tab Content: Booking History */}
            {activeTab === "bookings" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Booking History</h2>
                    <p className="text-xs text-gray-500 mt-1">Review your recent activities and upcoming experiences.</p>
                  </div>
                  {bookings.length > 0 && (
                    <button
                      onClick={clearBookings}
                      className="text-xs text-red-600 hover:text-red-700 font-bold border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <Compass size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-800">No bookings yet</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">You haven't booked any experiences yet. Start exploring active packages and activities!</p>
                    </div>
                    <Link
                      to="/tours"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#CC1422] text-white font-bold text-sm rounded-xl hover:bg-[#b0101c] transition-all shadow-md cursor-pointer"
                    >
                      Explore Tours <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-50 pb-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#CC1422]">Order ID: {booking.id}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span>{new Date(booking.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            booking.status.includes("Paid") ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        {/* Booking items */}
                        <div className="space-y-3">
                          {booking.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                <img
                                  src={item.image || "https://via.placeholder.com/100"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://via.placeholder.com/100";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-bold text-gray-800 truncate">{item.name}</h4>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <span className="text-xs text-gray-500">Total Payable</span>
                          <span className="text-sm font-extrabold text-gray-900">AED {booking.total?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
                  <p className="text-xs text-gray-500 mt-1">Keep track of your dream activities and packages.</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-red-400">
                      <Heart size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-800">Your wishlist is empty</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">Browse tours and click the heart icon to save products to your personal list.</p>
                    </div>
                    <Link
                      to="/tours"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#CC1422] text-white font-bold text-sm rounded-xl hover:bg-[#b0101c] transition-all shadow-md cursor-pointer"
                    >
                      Explore Tours <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {wishlist.map((prod) => (
                      <TourCard key={prod._id} {...mapProductToCard(prod)} isGrid={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage your customer information and preferences.</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem("user", JSON.stringify(user));
                  toast.success("Profile details saved!");
                }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={user?.name || ""}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-xs font-semibold text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={user?.email || ""}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-xs font-semibold text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={user?.phone || ""}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-xs font-semibold text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Location / City</label>
                      <input
                        type="text"
                        value={user?.location || ""}
                        onChange={(e) => setUser({ ...user, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-xs font-semibold text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all shadow-md cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default UserProfile;
