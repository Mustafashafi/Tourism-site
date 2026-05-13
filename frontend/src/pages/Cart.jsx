import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShoppingBag, 
  Calendar, MapPin, Clock, Users, MoreHorizontal, 
  ChevronRight, Car, AlertCircle, Edit, Trash2, X
} from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

const Cart = () => {
  const { cartItems, removeFromCart, cartCount } = useCart();
  const { currency } = useLanguageCurrency();
  const [activeMenu, setActiveMenu] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', closeMenu);
    }
    return () => document.removeEventListener('click', closeMenu);
  }, [activeMenu]);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.options.totalPrice * item.quantity);
  }, 0);

  // Taxes calculation informational
  const taxesAndFees = subtotal * 0.0476; 
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8f9fb] px-6">
        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">Your cart is empty</h2>
        <p className="text-[13px] text-gray-500 mb-8 max-w-md text-center">
          Looks like you haven't added any tours or activities to your cart yet. Explore our top destinations and find your next adventure!
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f8f9fb] pb-20 pt-6">
        <div className="max-w-[97%] mx-auto px-6">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-6 font-medium">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-gray-900">Cart</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Cart Items */}
            <div className="flex-1 space-y-4 w-full">
              {cartItems.map((item) => (
                <div key={item.id || item._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 relative">
                  
                  {/* 3 Dots Menu */}
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = item.id || item._id;
                        setActiveMenu(activeMenu === id ? null : id);
                      }}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === (item.id || item._id) && (
                      <div 
                        className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link 
                          to={`/booking/${item.product?.slug}?edit=${item.id || item._id}`}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-2.5 text-gray-700">
                            <Edit size={14} />
                            <span className="text-[12px] font-medium">Update Details</span>
                          </div>
                        </Link>
                        
                        <div className="h-px bg-gray-50 mx-4 my-1"></div>
                        
                        <button 
                          onClick={() => {
                            setItemToDelete(item.id || item._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-red-50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-2.5 text-red-600">
                            <Trash2 size={14} />
                            <span className="text-[12px] font-medium">Remove</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Top Section */}
                  <div className="flex gap-4">
                    <div className="w-[88px] h-[88px] rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                      <img 
                        src={item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1512453979436-5a50ce8c6d18?w=800&q=80'} 
                        alt={item.product?.name || 'Experience'} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 pr-8 pt-0.5">
                      <p className="text-[10px] font-medium text-gray-400 tracking-wide uppercase mb-1">
                        {item.product?.category?.name || 'TOUR'}
                      </p>
                      <h3 className="text-[14px] font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
                        {item.product?.name || 'Experience Title'}
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          <span>
                            {item.options?.date 
                              ? new Date(item.options.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '30 Apr 2026'
                            }
                          </span>
                        </div>
                        <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate">Location <span className="underline decoration-gray-300">{item.product?.location || 'Dubai'}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-50 w-full my-1"></div>

                  {/* Bottom Section */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                        <Car size={12} className="text-gray-400" />
                        <span>{item.options?.transfer?.name || item.options?.transfer || 'Private Transfers'}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        <span>{item.product?.duration || '04:00 hours (Approx)'}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                        <Users size={12} className="text-gray-400" />
                        <span>
                          {item.options?.guests?.adult || item.options?.adults ? `${item.options?.guests?.adult || item.options?.adults} Adult ` : '1 Adult '}
                          {item.options?.guests?.child || item.options?.children ? `${item.options?.guests?.child || item.options?.children} Child ` : ''}
                          {item.options?.guests?.infant || item.options?.infants ? `${item.options?.guests?.infant || item.options?.infants} Infant ` : ''}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <p className="text-[14px] font-bold text-gray-900">
                          {currency} {((item.options.totalPrice || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pb-1">
                      <button className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                        Apply Cashback
                      </button>
                    </div>
                  </div>

                  {/* Footer Message */}
                  <div className="mt-2 bg-gray-50/50 rounded-lg px-3 py-2 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                      <AlertCircle size={12} className="text-gray-400" />
                      <span>Free Cancellation Until</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700">
                      12:59 PM 29 Apr 2026
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-4">
              
              {/* Steps Tracker */}
              <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm flex items-center text-[11px] font-medium text-gray-400">
                <span className="text-gray-800 font-semibold">1. Cart</span>
                <ChevronRight size={12} className="mx-2" />
                <span>2. Checkout</span>
              </div>

              {/* Cart Details Box */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm sticky top-24">
                <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Cart Summary</h2>

                {/* Breakdown */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-500">Activities × {cartCount}</span>
                    <span className="font-medium text-gray-900">{currency} {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="font-medium text-gray-900">{currency} {taxesAndFees.toFixed(2)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 w-full my-4"></div>

                {/* Total */}
                <div className="flex justify-between items-end mb-5">
                  <span className="text-[13px] font-semibold text-gray-900">Total Payable</span>
                  <span className="text-lg font-bold text-gray-900 leading-none">{currency} {total.toFixed(2)}</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2.5">
                  <Link
                    to="/checkout"
                    className="w-full py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-black transition-colors text-center shadow-sm"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    to="/"
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setItemToDelete(null)}
          ></div>
          
          <div className="bg-white rounded-xl w-full max-w-[360px] relative z-10 p-6 shadow-xl animate-in zoom-in-95 duration-200 text-center">
            <button 
              onClick={() => setItemToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" strokeWidth={1.5} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-1.5">Remove Item?</h3>
            <p className="text-[13px] text-gray-500 mb-6">
              This item will be removed from your order. You can easily re-add it later.
            </p>

            <div className="flex gap-2">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  removeFromCart(itemToDelete);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white text-[13px] font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
