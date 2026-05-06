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
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50 px-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Looks like you haven't added any tours or activities to your cart yet. Explore our top destinations and find your next adventure!
        </p>
        <Link
          to="/"
          className="px-8 py-3.5 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-all shadow shadow-gray-800 flex items-center gap-2"
        >
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white min-h-screen pb-20 pt-6">
        <div className="max-w-[1100px] mx-auto px-6">
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-[13px] text-gray-500 mb-8">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-2 text-gray-400" />
            <span className="text-gray-400">Cart</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Cart Items */}
            <div className="flex-1 space-y-6 w-full">
              {cartItems.map((item) => (
                <div key={item.id || item._id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100/50 flex flex-col gap-4 relative">
                  
                  {/* 3 Dots Menu */}
                  <div className="absolute top-5 right-5 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = item.id || item._id;
                        setActiveMenu(activeMenu === id ? null : id);
                      }}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === (item.id || item._id) && (
                      <div 
                        className="absolute right-0 top-6 w-52 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link 
                          to={`/booking/${item.product?.slug}?edit=${item.id || item._id}`}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3 text-gray-800">
                            <Edit size={18} strokeWidth={2} />
                            <span className="text-[14.5px] font-medium">Update Details</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-800" />
                        </Link>
                        
                        <div className="h-px bg-gray-100 mx-4 my-0.5"></div>
                        
                        <button 
                          onClick={() => {
                            setItemToDelete(item.id || item._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3 text-red-600">
                            <Trash2 size={18} strokeWidth={2} />
                            <span className="text-[14.5px] font-medium">Delete</span>
                          </div>
                          <ChevronRight size={16} className="text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Top Section */}
                  <div className="flex gap-4">
                    <div className="w-[100px] h-[100px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img 
                        src={item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1512453979436-5a50ce8c6d18?w=800&q=80'} 
                        alt={item.product?.name || 'Experience'} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 pr-8 pt-1">
                      <p className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5">
                        {item.product?.category?.name || 'TOUR'}
                      </p>
                      <h3 className="text-[16px] font-bold text-gray-900 leading-snug mb-2">
                        {item.product?.name || 'Experience Title'}
                      </h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-[12px] text-gray-500 gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {item.options?.date 
                              ? new Date(item.options.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '30 Apr 2026'
                            }
                          </span>
                        </div>
                        <div className="flex items-center text-[12px] text-gray-500 gap-1.5">
                          <MapPin size={13} className="text-gray-400" />
                          <span className="truncate">Location <span className="underline decoration-gray-300">{item.product?.location || '1 Sheikh Mohammed bin...'}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 w-full my-1"></div>

                  {/* Bottom Section */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-[12px] text-gray-400 gap-1.5">
                        <Car size={13} className="text-gray-300" />
                        <span>{item.options?.transfer?.name || item.options?.transfer || 'Private Transfers'}</span>
                      </div>
                      <div className="flex items-center text-[12px] text-gray-500 gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span>{item.product?.duration || '04:00 hours (Approx)'}</span>
                      </div>
                      <div className="flex items-center text-[12px] text-gray-500 gap-1.5">
                        <Users size={13} className="text-gray-400" />
                        <span>
                          {item.options?.guests?.adult || item.options?.adults ? `${item.options?.guests?.adult || item.options?.adults} Adult ` : '1 Adult '}
                          {item.options?.guests?.child || item.options?.children ? `${item.options?.guests?.child || item.options?.children} Child ` : ''}
                          {item.options?.guests?.infant || item.options?.infants ? `${item.options?.guests?.infant || item.options?.infants} Infant ` : ''}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <p className="text-[15px] font-extrabold text-gray-900">
                          {currency} {((item.options.totalPrice || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pb-6">
                      <button className="px-3.5 py-1.5 border border-gray-300 rounded-[10px] text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        Apply Cashback
                      </button>
                    </div>
                  </div>

                  {/* Footer Message */}
                  <div className="mt-1 bg-[#FDFDFD] border border-gray-100 rounded-[12px] px-3.5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[12px]">
                      <AlertCircle size={13} className="text-gray-400" />
                      <span>Free Cancellation Until</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">
                      12:59 PM 29 Apr 2026
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[360px] shrink-0 space-y-4">
              
              {/* Steps Tracker */}
              <div className="bg-white rounded-[16px] px-5 py-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center text-[12px] font-semibold text-gray-400">
                <span className="text-gray-800">1. View/Edit Cart</span>
                <ChevronRight size={13} className="mx-2" />
                <span>2. Confirm and Pay</span>
              </div>

              {/* Cart Details Box */}
              <div className="bg-white rounded-[16px] p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
                <h2 className="text-[19px] font-extrabold text-gray-900 mb-5">Cart Details</h2>

                {/* Breakdown */}
                <div className="space-y-3.5 mb-5">
                  <div className="flex justify-between items-center text-gray-700">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-gray-600">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      <span>Activities × {cartCount}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-[14px]">{currency} {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="text-[14px] text-gray-600">All Taxes</span>
                    <span className="font-bold text-gray-900 text-[14px]">{currency} {taxesAndFees.toFixed(2)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 w-full my-5"></div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[15px] text-gray-600 font-medium">Total Payable</p>
                  <p className="text-[19px] font-extrabold text-gray-900">{currency} {total.toFixed(2)}</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <Link
                    to="/"
                    className="flex-1 py-3 border border-gray-200 text-gray-700 text-[13px] font-bold rounded-[8px] hover:bg-gray-50 transition-colors text-center"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="/checkout"
                    className="flex-1 py-3 bg-[#2d2d2d] text-white text-[13px] font-bold rounded-[8px] hover:bg-black transition-colors text-center"
                  >
                    Next
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
          
          <div className="bg-white rounded-[24px] w-full max-w-[440px] relative z-10 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setItemToDelete(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-[22px] font-bold text-gray-900 mb-8">Remove from Cart?</h2>

            <div className="flex justify-center mb-8">
              <div className="w-40 h-32 bg-red-50 rounded-2xl flex items-center justify-center">
                <Trash2 size={48} className="text-red-400" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-[17px] font-bold text-gray-900 mb-2 leading-tight">
              Are you sure you want to remove this from your cart?
            </h3>
            
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              This item will no longer appear at checkout. Once removed, you'll need to re-add it to purchase
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-[14px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  removeFromCart(itemToDelete);
                  setItemToDelete(null);
                }}
                className="flex-1 py-3.5 bg-[#DC2626] text-white font-bold rounded-[14px] hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
