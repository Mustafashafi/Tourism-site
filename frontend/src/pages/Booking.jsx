import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Users, Calendar,
  Check, Info, ChevronDown, ChevronUp, Clock,
  MapPin, Star, AlertCircle, X
} from "lucide-react";
import { homeApi } from "../services/homeApi";
import { useCart } from "../context/CartContext";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import { toast } from "react-hot-toast";

const Booking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currencySymbol, convertPrice } = useLanguageCurrency();
  const [searchParams] = useSearchParams();
  const editItemId = searchParams.get('edit');
  const { addToCart, cartItems, updateCartItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for selections
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guests, setGuests] = useState({
    adult: 1,
    child: 0,
    infant: 0
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const isLoggedIn = !!localStorage.getItem("user");

  // Dates generation
  const [dates, setDates] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    homeApi.getProductBySlug(slug)
      .then(data => {
        setProduct(data);

        // If in edit mode, populate state from cart item
        if (editItemId) {
          const itemToEdit = cartItems.find(item => (item.id || item._id) === editItemId);
          if (itemToEdit) {
            if (itemToEdit.options?.date) {
              const d = new Date(itemToEdit.options.date);
              setSelectedDate({
                date: d,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                monthName: d.toLocaleDateString('en-US', { month: 'short' }),
                dayNum: d.getDate(),
                price: itemToEdit.options.totalPrice / (itemToEdit.options.guests?.adult || 1) // rough estimate or use base price
              });
            }
            if (itemToEdit.options?.guests) {
              setGuests(itemToEdit.options.guests);
            }
            if (itemToEdit.options?.transfer) {
              setSelectedTransfer(itemToEdit.options.transfer);
            }
            setIsExpanded(true);
          }
        } else {
          // Default select first option
          if (data.contentSections?.length > 0) {
            setSelectedOption(0);
          }

          // Set default transfer option if available
          if (data.transferOptions?.length > 0) {
            setSelectedTransfer(data.transferOptions[0]);
          } else {
            // Fallback if no transfer options
            setSelectedTransfer({
              name: "Private Transfer",
              type: "private",
              adultPrice: data.pricing?.discountPrice || data.pricing?.actualPrice || 0,
              childPrice: data.pricing?.childPrice || 0,
              infantPrice: data.pricing?.infantPrice || 0
            });
          }

          // Generate next 6 days
          const generatedDates = [];
          const today = new Date();
          for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            generatedDates.push({
              date: d,
              dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
              monthName: d.toLocaleDateString('en-US', { month: 'short' }),
              dayNum: d.getDate(),
              price: data.pricing?.discountPrice || data.pricing?.fromPrice || data.pricing?.actualPrice
            });
          }
          setDates(generatedDates);
          setSelectedDate(generatedDates[1]); // Default to tomorrow
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, editItemId]);

  // Prevent body scroll when calendar is open
  useEffect(() => {
    if (isCalendarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCalendarOpen]);

  const updateGuests = (type, delta) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(type === 'adult' ? 1 : 0, prev[type] + delta)
    }));
  };

  const basePrice = selectedTransfer?.adultPrice || selectedDate?.price || product?.pricing?.discountPrice || product?.pricing?.actualPrice || 0;
  const childPrice = selectedTransfer?.childPrice != null ? selectedTransfer.childPrice : (product?.pricing?.childPrice != null ? product.pricing.childPrice : basePrice);
  const infantPrice = selectedTransfer?.infantPrice != null ? selectedTransfer.infantPrice : (product?.pricing?.infantPrice != null ? product.pricing.infantPrice : 0);

  const totalPrice = product ? (
    (guests.adult * basePrice) +
    (guests.child * childPrice) +
    (guests.infant * infantPrice)
  ) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading booking...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to={`/activity/${product.slug}`} className="hover:text-gray-900 transition-colors">{product.name}</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">Tour Booking</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Select Date Section */}
            <section>
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-[22px] font-bold text-gray-900">Select Date</h2>
                <span className="text-xs text-gray-400">All prices are in ( {currencySymbol} )</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-6 pt-2 px-2 scrollbar-hide">
                {dates.map((d, i) => {
                  const isSelected = selectedDate?.date.toDateString() === d.date.toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      className={`flex flex-col items-center justify-center min-w-[85px] py-4 rounded-xl border-2 transition-all ${isSelected
                        ? "border-[#374151] border-[3px] bg-white shadow-xl scale-105 z-10"
                        : "border-gray-100 bg-white hover:border-gray-300"
                        }`}
                    >
                      <span className="text-[10px] font-semibold text-gray-400 mb-1">{d.dayName}</span>
                      <span className="text-[13px] font-semibold text-gray-700">{d.monthName} {d.dayNum}</span>
                      <span className="text-[11px] font-semibold text-gray-400 mt-1">{convertPrice(d.price).toFixed(2)}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex flex-col items-center justify-center min-w-[85px] py-4 rounded-xl border-2 border-gray-100 bg-white hover:border-gray-300"
                >
                  <Calendar size={18} className="text-gray-400 mb-1" />
                  <span className="text-[11px] font-bold text-gray-600 underline">More<br />dates</span>
                </button>
              </div>
            </section>

            {/* Calendar Modal */}
            <AnimatePresence>
              {isCalendarOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCalendarOpen(false)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-[760px] rounded-[32px] overflow-hidden shadow-2xl"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4">
                      <h2 className="text-[22px] font-bold text-gray-900">More Dates</h2>
                      <button onClick={() => setIsCalendarOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={24} />
                      </button>
                    </div>

                    {/* Months Grid */}
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[0, 1].map((monthOffset) => {
                        const baseDate = new Date();
                        baseDate.setMonth(baseDate.getMonth() + monthOffset);
                        const monthName = baseDate.toLocaleString('en-US', { month: 'long' });
                        const year = baseDate.getFullYear();

                        const firstDay = new Date(year, baseDate.getMonth(), 1).getDay();
                        const daysInMonth = new Date(year, baseDate.getMonth() + 1, 0).getDate();
                        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                        const blanks = Array.from({ length: firstDay }, (_, i) => i);

                        return (
                          <div key={monthOffset} className="space-y-4">
                            <div className="flex items-center justify-between">
                              {monthOffset === 0 && <ChevronLeft size={24} className="text-gray-300 cursor-pointer" />}
                              <h3 className="text-lg font-bold text-gray-800">{monthName} {year}</h3>
                              {monthOffset === 1 && <ChevronRight size={24} className="text-gray-300 cursor-pointer" />}
                              {monthOffset === 0 && <div className="w-6" />}
                              {monthOffset === 1 && <div className="w-6 order-first" />}
                            </div>

                            <div className="grid grid-cols-7 gap-y-2 text-center">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <span key={d} className="text-[13px] font-bold text-gray-400 mb-2">{d}</span>
                              ))}
                              {blanks.map(i => <div key={`b-${i}`} />)}
                              {days.map(d => {
                                const dateObj = new Date(year, baseDate.getMonth(), d);
                                const isSelected = selectedDate?.date.toDateString() === dateObj.toDateString();
                                const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                                return (
                                  <button
                                    key={d}
                                    disabled={isPast}
                                    onClick={() => {
                                      setSelectedDate({
                                        date: dateObj,
                                        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                                        monthName: dateObj.toLocaleDateString('en-US', { month: 'short' }),
                                        dayNum: dateObj.getDate(),
                                        price: product.pricing?.discountPrice || product.pricing?.fromPrice || product.pricing?.actualPrice
                                      });
                                      setIsCalendarOpen(false);
                                    }}
                                    className={`group flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${isSelected ? "border-2 border-gray-900 bg-white shadow-md z-10" : ""
                                      } ${isPast ? "opacity-20 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                  >
                                    <span className={`text-[14px] font-bold ${isSelected ? "text-gray-900" : "text-gray-600"}`}>{d}</span>
                                    {!isPast && (
                                      <span className="text-[10px] font-medium text-gray-400 mt-0.5">
                                        {convertPrice(product.pricing?.fromPrice || product.pricing?.actualPrice).toFixed(0)}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100/80 px-6 py-3 flex justify-between items-center text-[11px] font-bold">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                          <span className="text-gray-600">Non Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                          <span className="text-gray-600">Unavailable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-gray-600">Sold Out</span>
                        </div>
                      </div>
                      <div className="text-gray-600">
                        All prices are in {product.pricing?.currency || 'AED'}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Select Number of Guests */}
            <section>
              <h2 className="text-[22px] font-bold text-gray-900 mb-6">Select Number of Guests</h2>
              <div className="space-y-3">
                {[
                  { id: 'adult', label: 'Adult', sub: '' },
                  { id: 'child', label: 'Child', sub: '' },
                  { id: 'infant', label: 'Infant', sub: '' }
                ].map((row) => (
                  <div key={row.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-base font-bold text-gray-800">{row.label}</span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateGuests(row.id, -1)}
                        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all active:scale-95"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">{guests[row.id]}</span>
                      <button
                        onClick={() => updateGuests(row.id, 1)}
                        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[22px] font-bold text-gray-900 mb-6">Choose from 1 available</h2>
              <div className="space-y-4">
                <div className={`bg-white rounded-[24px] overflow-hidden border transition-all duration-300 ${isExpanded ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100 shadow-sm'}`}>
                  {/* Header */}
                  <div className="bg-gray-50/80 p-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Non Refundable</p>
                    </div>
                    <button className="text-[11px] font-bold text-gray-500 flex items-center gap-1 hover:text-gray-900 transition-colors">
                      More Details <ChevronRight size={14} />
                    </button>
                  </div>

                  {!isExpanded ? (
                    <div className="p-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[11px] text-gray-400 font-medium">from</span>
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-black text-gray-900">{currencySymbol} {convertPrice(basePrice).toFixed(2)}</div>
                            {product?.pricing?.discountPrice && (
                              <div className="text-[13px] text-gray-400 line-through">{currencySymbol} {convertPrice(product.pricing.actualPrice).toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsExpanded(true)}
                        className="px-10 py-3 bg-white border-2 border-gray-900 rounded-xl font-bold text-[13px] hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                      >
                        Select
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-8">
                      {/* Transfer Selection */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900">Select Transfer</h4>
                        <div className="flex flex-wrap gap-3">
                          {(product.transferOptions?.length > 0 ? product.transferOptions : [
                            { name: "Without Transfer", type: "without_transfer", adultPrice: product.pricing?.discountPrice || product.pricing?.actualPrice },
                            { name: "Shared Transfer", type: "shared", adultPrice: (product.pricing?.discountPrice || product.pricing?.actualPrice) + 50 },
                            { name: "Private Transfer", type: "private", adultPrice: (product.pricing?.discountPrice || product.pricing?.actualPrice) + 100 }
                          ]).map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTransfer(opt)}
                              className={`px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all border-2 ${selectedTransfer?.name === opt.name
                                  ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                                  : "bg-white border-gray-100 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Details */}
                      <div className="space-y-4 pt-4 border-t border-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px] font-bold text-gray-700">
                          <div>{guests.adult} Adult × {currencySymbol} {convertPrice(selectedTransfer?.adultPrice || basePrice).toFixed(0)}</div>
                          {guests.child > 0 && <div>{guests.child} Child × {currencySymbol} {convertPrice(selectedTransfer?.childPrice || childPrice).toFixed(0)}</div>}
                          {guests.infant > 0 && <div>{guests.infant} Infant × {currencySymbol} {convertPrice(selectedTransfer?.infantPrice || infantPrice).toFixed(0)}</div>}
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium italic">All taxes and fees included</p>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 gap-6">
                          <div className="space-y-1">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Amount</span>
                            <div className="text-[28px] font-black text-gray-900 leading-none">{currencySymbol} {convertPrice(totalPrice).toFixed(0)}</div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            {!isAddedToCart ? (
                              <>
                                <button
                                  onClick={() => {
                                    if (!isLoggedIn) {
                                      toast.error("Please login to add tours to your cart", {
                                        duration: 3000,
                                        position: "top-center",
                                        style: {
                                          background: "#333",
                                          color: "#fff",
                                          borderRadius: "10px",
                                          fontSize: "14px",
                                          fontWeight: "bold"
                                        }
                                      });
                                      return;
                                    }
                                    if (editItemId) {
                                      updateCartItem(editItemId, {
                                        options: {
                                          date: selectedDate?.date,
                                          guests,
                                          transfer: selectedTransfer,
                                          totalPrice
                                        }
                                      });
                                      navigate('/cart');
                                    } else {
                                      addToCart(product, {
                                        date: selectedDate?.date,
                                        guests,
                                        transfer: selectedTransfer,
                                        totalPrice
                                      });
                                      setIsAddedToCart(true);
                                    }
                                  }}
                                  className="p-3.5 border-2 border-gray-100 rounded-xl text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="md:hidden font-bold">{editItemId ? "Update Cart" : "Add to Cart"}</span>
                                    {editItemId ? <Check width="20" height="20" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>}
                                  </div>
                                </button>
                                <button
                                  onClick={() => {
                                    if (!isLoggedIn) {
                                      toast.error("Please login to proceed with booking", {
                                        duration: 3000,
                                        position: "top-center",
                                        style: {
                                          background: "#333",
                                          color: "#fff",
                                          borderRadius: "10px",
                                          fontSize: "14px",
                                          fontWeight: "bold"
                                        }
                                      });
                                      return;
                                    }
                                    if (editItemId) {
                                      updateCartItem(editItemId, {
                                        options: {
                                          date: selectedDate?.date,
                                          guests,
                                          transfer: selectedTransfer,
                                          totalPrice
                                        }
                                      });
                                    } else {
                                      addToCart(product, {
                                        date: selectedDate?.date,
                                        guests,
                                        transfer: selectedTransfer,
                                        totalPrice
                                      });
                                    }
                                    setTimeout(() => navigate('/checkout'), 0);
                                  }}
                                  className="flex-1 md:flex-none px-10 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                >
                                  {editItemId ? <Check width="20" height="20" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14l2 2 4-4" /></svg>}
                                  {editItemId ? "Update Details" : "Proceed to pay"}
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  to="/"
                                  className="flex-1 md:flex-none px-10 py-3.5 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold text-[14px] flex items-center justify-center hover:border-gray-900 transition-all active:scale-95"
                                >
                                  Continue Shopping
                                </Link>
                                <Link
                                  to="/cart"
                                  className="flex-1 md:flex-none px-10 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                  View Cart
                                  <span className="w-5 h-5 bg-white text-gray-900 rounded-full flex items-center justify-center text-[11px] font-black">{cartItems.length}</span>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-x-8 gap-y-3">
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          <p className="text-[11px] text-gray-500 font-medium">
                            <span className="font-bold text-gray-700">Activity Start Time:</span> Pick up will be done between 08:30 am to 09:00 am
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          <p className="text-[11px] text-gray-500 font-medium">
                            <span className="font-bold text-gray-700">Duration:</span> {product.duration || "09:00 hours"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Step Indicator */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-tight">
                <span className="text-gray-900">1. Check Availability</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="text-gray-400">2. Confirm and Pay</span>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              <div className="flex gap-4">
                <div className="w-[85px] h-[85px] rounded-[20px] overflow-hidden bg-gray-50 shrink-0 shadow-sm border border-gray-50">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-1 flex-1">
                  <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                      <Calendar size={14} className="text-gray-400" />
                      {selectedDate?.date.toLocaleDateString('en-CA')}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                      <Users size={14} className="text-gray-400" />
                      {guests.adult} Adult {guests.child > 0 ? `, ${guests.child} Child` : ''} {guests.infant > 0 ? `, ${guests.infant} Infant` : ''}
                    </div>
                    {selectedTransfer && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                        {selectedTransfer.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown Accordion */}
              <div className="border-t border-gray-50 pt-5 space-y-4">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                  <span className="text-[13px] font-bold text-gray-800">Price Breakdown</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[12px] font-medium text-gray-500">
                    <span>{guests.adult} Adult x {currencySymbol} {convertPrice(selectedTransfer?.adultPrice || basePrice).toFixed(0)}</span>
                    <span className="text-gray-900 font-bold">{currencySymbol} {convertPrice(guests.adult * (selectedTransfer?.adultPrice || basePrice)).toFixed(0)}</span>
                  </div>
                  {guests.child > 0 && (
                    <div className="flex justify-between text-[12px] font-medium text-gray-500">
                      <span>{guests.child} Child x {currencySymbol} {convertPrice(selectedTransfer?.childPrice || childPrice).toFixed(0)}</span>
                      <span className="text-gray-900 font-bold">{currencySymbol} {convertPrice(guests.child * (selectedTransfer?.childPrice || childPrice)).toFixed(0)}</span>
                    </div>
                  )}
                  {guests.infant > 0 && (
                    <div className="flex justify-between text-[12px] font-medium text-gray-500">
                      <span>{guests.infant} Infant x {currencySymbol} {convertPrice(selectedTransfer?.infantPrice || infantPrice).toFixed(0)}</span>
                      <span className="text-gray-900 font-bold">{currencySymbol} {convertPrice(guests.infant * (selectedTransfer?.infantPrice || infantPrice)).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-50 pt-5 flex justify-between items-baseline">
                <span className="text-[15px] font-bold text-gray-900">Total Payable</span>
                <span className="text-[22px] font-black text-gray-900">{currencySymbol} {convertPrice(totalPrice).toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                {!isAddedToCart ? (
                  <>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          toast.error("Please login to add tours to your cart", {
                            duration: 3000,
                            position: "top-center",
                            style: {
                              background: "#333",
                              color: "#fff",
                              borderRadius: "10px",
                              fontSize: "14px",
                              fontWeight: "bold"
                            }
                          });
                          return;
                        }
                        if (editItemId) {
                          updateCartItem(editItemId, {
                            options: {
                              date: selectedDate?.date,
                              guests,
                              transfer: selectedTransfer,
                              totalPrice
                            }
                          });
                          navigate('/cart');
                        } else {
                          addToCart(product, {
                            date: selectedDate?.date,
                            guests,
                            transfer: selectedTransfer,
                            totalPrice
                          });
                          setIsAddedToCart(true);
                        }
                      }}
                      className="w-full py-3.5 border-2 border-gray-100 rounded-xl font-bold text-[13px] text-gray-700 flex items-center justify-center gap-2 hover:border-gray-900 hover:text-gray-900 transition-all"
                    >
                      {editItemId ? <Check size={18} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>}
                      {editItemId ? "Update Cart" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          toast.error("Please login to proceed with booking", {
                            duration: 3000,
                            position: "top-center",
                            style: {
                              background: "#333",
                              color: "#fff",
                              borderRadius: "10px",
                              fontSize: "14px",
                              fontWeight: "bold"
                            }
                          });
                          return;
                        }
                        if (editItemId) {
                          updateCartItem(editItemId, {
                            options: {
                              date: selectedDate?.date,
                              guests,
                              transfer: selectedTransfer,
                              totalPrice
                            }
                          });
                        } else {
                          addToCart(product, {
                            date: selectedDate?.date,
                            guests,
                            transfer: selectedTransfer,
                            totalPrice
                          });
                        }
                        setTimeout(() => navigate('/checkout'), 0);
                      }}
                      className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-100"
                    >
                      {editItemId ? <Check size={18} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14l2 2 4-4" /></svg>}
                      {editItemId ? "Update Details" : "Proceed To Book"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold text-[13px] flex items-center justify-center hover:border-gray-900 transition-all active:scale-95"
                    >
                      Continue Shopping
                    </Link>
                    <Link
                      to="/cart"
                      className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-gray-100"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                      View Cart
                      <span className="w-5 h-5 bg-white text-gray-900 rounded-full flex items-center justify-center text-[11px] font-black">{cartItems.length}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;
