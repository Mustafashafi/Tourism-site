import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ChevronRight, 
  CreditCard, 
  Clock, 
  MapPin, 
  MessageSquare,
  ChevronLeft,
  Lock,
  Trash2,
  Check,
  Info,
  X,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+971', iso: 'ae', name: 'UAE' },
  { code: '+92', iso: 'pk', name: 'Pakistan' },
  { code: '+91', iso: 'in', name: 'India' },
  { code: '+1', iso: 'us', name: 'USA' },
  { code: '+44', iso: 'gb', name: 'UK' },
  { code: '+966', iso: 'sa', name: 'Saudi Arabia' },
  { code: '+968', iso: 'om', name: 'Oman' },
  { code: '+974', iso: 'qa', name: 'Qatar' },
];

const Checkout = () => {
  const { cartItems, cartCount, clearCart, removeFromCart } = useCart();
  const { currencySymbol, convertPrice } = useLanguageCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef(null);

  // Form States
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+971'
  });

  const [additionalDetails, setAdditionalDetails] = useState({
    pickupLocation: '',
    remarks: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const [promoCode, setPromoCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (cartCount === 0) {
      navigate('/');
    }
    window.scrollTo(0, 0);

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserDetails(prev => ({
        ...prev,
        fullName: parsed.name || '',
        email: parsed.email || ''
      }));
    }

    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartCount, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.options?.totalPrice || 0), 0);
  const taxes = subtotal * 0.05;
  const total = subtotal + taxes;

  const handlePayment = async () => {
    if (!userDetails.fullName || !userDetails.email || !userDetails.phone) {
      toast.error('Please fill in your details');
      return;
    }
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast.error('Please fill in card details');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Payment Successful! Your booking is confirmed.');
      clearCart();
      navigate('/');
    }, 2000);
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === userDetails.countryCode) || COUNTRY_CODES[0];

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-6 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link to="/cart" className="hover:text-gray-700 transition-colors">Cart</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-600 font-medium">Cart Payment</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Enter Your Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Enter Your Details</h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    value={userDetails.fullName}
                    onChange={(e) => setUserDetails({...userDetails, fullName: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-sm font-medium"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Email</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="relative shrink-0" ref={countryRef}>
                        <button 
                          type="button"
                          onClick={() => setIsCountryOpen(!isCountryOpen)}
                          className="h-full flex items-center gap-2.5 pl-3 pr-3 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-sm font-bold cursor-pointer min-w-[105px]"
                        >
                          <img 
                            src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
                            alt={selectedCountry.name}
                            className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                          />
                          <span>{selectedCountry.code}</span>
                          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isCountryOpen && (
                          <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {COUNTRY_CODES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setUserDetails({...userDetails, countryCode: c.code});
                                  setIsCountryOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                              >
                                <img 
                                  src={`https://flagcdn.com/w40/${c.iso}.png`} 
                                  alt={c.name}
                                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                />
                                <span className="text-sm font-bold text-gray-700">{c.code}</span>
                                <span className="text-[11px] text-gray-400 font-medium truncate">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input 
                        type="tel" 
                        placeholder="Phone number"
                        value={userDetails.phone}
                        onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                        className="flex-1 px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-4.5 h-4.5 border-2 border-gray-200 rounded-md bg-white transition-all peer-checked:bg-gray-800 peer-checked:border-gray-800"></div>
                    <Check size={10} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium group-hover:text-gray-600 transition-colors">
                    Do not send me offers via Email, SMS, RCS, WhatsApp and other electronic channels
                  </span>
                </label>
              </div>
            </div>

            {/* 2. Additional Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-1.5">Update Additional Details</h2>
              <p className="text-[11px] text-gray-400 font-bold mb-6 uppercase tracking-wider">Dubai City Tour</p>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400" /> Pickup Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your pickup location"
                    value={additionalDetails.pickupLocation}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, pickupLocation: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare size={13} className="text-gray-400" /> Remarks
                  </label>
                  <textarea 
                    rows="3"
                    placeholder="Enter your remarks"
                    value={additionalDetails.remarks}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, remarks: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-sm font-medium resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 3. Payment Options */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Options</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-3 block">Payment Method</label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-gray-400 transition-all">
                          <input 
                            type="radio" 
                            name="payment" 
                            className="peer sr-only"
                            checked={paymentMethod === 'etihad'}
                            onChange={() => setPaymentMethod('etihad')}
                          />
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-800 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-600">Pay with Etihad Guest Pay</span>
                      </div>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Etihad_Airways_logo.svg/1280px-Etihad_Airways_logo.svg.png" className="h-5 object-contain grayscale opacity-50" alt="Etihad" />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-800 bg-gray-50/20 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="payment" 
                            className="peer sr-only"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                          />
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-800"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-800">Credit or Debit Card</span>
                      </div>
                      <CreditCard size={18} className="text-gray-400" />
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name on Card</label>
                        <input 
                          type="text" 
                          placeholder="Name on card"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                          className="w-full px-4 py-3.5 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-800 transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                            className="w-full px-4 py-3.5 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-800 transition-all text-sm font-bold pr-10"
                          />
                          <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expiry</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          className="w-full px-4 py-3.5 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-800 transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CVV</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            placeholder="CVV"
                            maxLength="4"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            className="w-full px-4 py-3.5 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-800 transition-all text-sm font-bold pr-10"
                          />
                          <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50/30 rounded-xl flex items-center gap-3 border border-green-100/30">
                      <ShieldCheck size={18} className="text-green-600" />
                      <span className="text-[12px] font-bold text-green-600">Secure payment assurance.</span>
                    </div>

                    <p className="text-[11px] text-gray-400 font-medium">
                      Your card will be charged in <span className="font-bold text-gray-500 underline">AED</span> <Info size={12} className="inline ml-1" />
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      By clicking "Confirm & pay" you agree to our <Link to="#" className="text-gray-600 font-bold underline">terms and conditions</Link> and <Link to="#" className="text-gray-600 font-bold underline">privacy policy</Link>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Button */}
            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full md:w-80 py-4 bg-gray-800 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Pay {currencySymbol} {convertPrice(total).toFixed(2)} with
                  <div className="bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Clock size={12} />
                    <span className="text-[12px] font-black">{formatTime(timeLeft)}</span>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-800">Details</h3>
                <span className="text-[10px] text-gray-400 font-bold tracking-tight">All prices in ({currencySymbol})</span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3.5 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 pb-3.5 border-b border-gray-50 last:border-0 last:pb-0 group relative">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <img 
                        src={item.product?.images?.[0] || item.product?.image || 'https://via.placeholder.com/100'} 
                        className="w-full h-full object-cover"
                        alt={item.product?.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-[12px] font-bold text-gray-800 leading-tight line-clamp-2">{item.product?.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400 font-medium">{item.options?.transfer?.name || 'Private Transfers'}</span>
                        <span className="text-[12px] font-bold text-gray-800">{convertPrice(item.options?.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {cartItems.length > 1 && (
                      <button 
                        onClick={() => setItemToDelete(item)}
                        className="absolute right-0 top-0 text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-[12px] font-bold">
                  <span className="text-gray-400">All Taxes</span>
                  <span className="text-gray-600">{currencySymbol} {convertPrice(taxes).toFixed(2)}</span>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-4 pr-16 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-all text-xs font-bold"
                  />
                  <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-gray-300 transition-colors uppercase">
                    Apply
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-5 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-gray-800">Balance Payable</span>
                  <span className="text-lg font-black text-gray-800">{convertPrice(total).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <span className="underline cursor-pointer">Charged in {currencySymbol}</span>
                  <Info size={10} />
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Pay {currencySymbol} {convertPrice(total).toFixed(2)} with
                      <div className="bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock size={12} />
                        <span className="text-[12px] font-black">{formatTime(timeLeft)}</span>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setItemToDelete(null)}></div>
          <div className="bg-white rounded-[24px] w-full max-w-[400px] relative z-10 p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <button onClick={() => setItemToDelete(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} className="text-red-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Remove from Checkout?</h3>
            <p className="text-sm text-gray-500 mb-8 px-4">
              This item will be removed from your order. You can always re-add it later.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  removeFromCart(itemToDelete.id || itemToDelete._id);
                  setItemToDelete(null);
                  toast.success('Item removed');
                }} 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
