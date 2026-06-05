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
import { homeApi } from '../services/homeApi';

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
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    homeApi.getSettings().then(setSettings).catch(console.error);
  }, []);

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
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error('Please fill in card details');
        return;
      }
      if (settings?.stripe?.enabled) {
        console.log("Stripe payment initiated with PK:", settings.stripe.publicKey);
      }
    }
    if (paymentMethod === 'etihad') {
      if (settings?.etihadPay?.enabled) {
        console.log("Etihad Guest Pay initiated with Merchant ID:", settings.etihadPay.merchantId);
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Save booking to booking history in localStorage
      const newBooking = {
        id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        items: cartItems.map(item => ({
          name: item.product?.name,
          image: item.product?.images?.[0] || item.product?.image,
          price: item.options?.totalPrice || 0,
          details: item.options?.transfer?.name || item.options?.visaOption?.title || 'Standard Booking'
        })),
        paymentMethod,
        total: total,
        status: paymentMethod === 'spot' ? 'Pending Payment (On the spot)' : 'Paid & Confirmed'
      };
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      bookings.unshift(newBooking);
      localStorage.setItem("bookings", JSON.stringify(bookings));

      toast.success(
        paymentMethod === 'spot'
          ? 'Booking Confirmed! You can pay on the spot.'
          : 'Payment Successful! Your booking is confirmed.'
      );
      clearCart();
      navigate('/profile');
    }, 2000);
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === userDetails.countryCode) || COUNTRY_CODES[0];

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-6 pb-20">
      <div className="max-w-[97%] mx-auto px-6">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link to="/cart" className="hover:text-gray-900 transition-colors">Cart</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-900">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Enter Your Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-5">Enter Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={userDetails.fullName}
                    onChange={(e) => setUserDetails({ ...userDetails, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="relative shrink-0" ref={countryRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryOpen(!isCountryOpen)}
                          className="h-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 cursor-pointer min-w-[90px]"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                              alt={selectedCountry.name}
                              className="w-4 h-3 object-cover rounded-sm shadow-sm"
                            />
                            <span>{selectedCountry.code}</span>
                          </div>
                          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCountryOpen && (
                          <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {COUNTRY_CODES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setUserDetails({ ...userDetails, countryCode: c.code });
                                  setIsCountryOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                              >
                                <img
                                  src={`https://flagcdn.com/w40/${c.iso}.png`}
                                  alt={c.name}
                                  className="w-4 h-3 object-cover rounded-sm shadow-sm"
                                />
                                <span className="text-[13px] font-medium text-gray-900">{c.code}</span>
                                <span className="text-[11px] text-gray-500 truncate">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={userDetails.phone}
                        onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer group mt-2">
                  <div className="mt-0.5 relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-4 h-4 border border-gray-300 rounded bg-white transition-all peer-checked:bg-gray-900 peer-checked:border-gray-900"></div>
                    <Check size={10} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                    Opt-out of promotional offers via Email, SMS, WhatsApp, and other channels.
                  </span>
                </label>
              </div>
            </div>

            {/* 2. Additional Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-5">Additional Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" /> Pickup Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your hotel name or address"
                    value={additionalDetails.pickupLocation}
                    onChange={(e) => setAdditionalDetails({ ...additionalDetails, pickupLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-gray-400" /> Remarks (Optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Any special requests?"
                    value={additionalDetails.remarks}
                    onChange={(e) => setAdditionalDetails({ ...additionalDetails, remarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 3. Payment Options */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-5">Payment Method</h2>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-gray-900 bg-gray-50/50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <input
                          type="radio"
                          name="payment"
                          className="peer sr-only"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <div className={`w-2 h-2 rounded-full ${paymentMethod === 'card' ? 'bg-gray-900' : 'bg-transparent'}`}></div>
                      </div>
                      <span className={`text-[13px] font-medium ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-600'}`}>Credit / Debit Card</span>
                    </div>
                    <CreditCard size={16} className={paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-400'} />
                  </label>

                  <label className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'etihad' ? 'border-gray-900 bg-gray-50/50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <input
                          type="radio"
                          name="payment"
                          className="peer sr-only"
                          checked={paymentMethod === 'etihad'}
                          onChange={() => setPaymentMethod('etihad')}
                        />
                        <div className={`w-2 h-2 rounded-full ${paymentMethod === 'etihad' ? 'bg-gray-900' : 'bg-transparent'}`}></div>
                      </div>
                      <span className={`text-[13px] font-medium ${paymentMethod === 'etihad' ? 'text-gray-900' : 'text-gray-600'}`}>Etihad Guest Pay</span>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Etihad_Airways_logo.svg/1280px-Etihad_Airways_logo.svg.png" className={`h-3.5 object-contain ${paymentMethod === 'etihad' ? '' : 'grayscale opacity-50'}`} alt="Etihad" />
                  </label>

                  <label className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'spot' ? 'border-gray-900 bg-gray-50/50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <input
                          type="radio"
                          name="payment"
                          className="peer sr-only"
                          checked={paymentMethod === 'spot'}
                          onChange={() => setPaymentMethod('spot')}
                        />
                        <div className={`w-2 h-2 rounded-full ${paymentMethod === 'spot' ? 'bg-gray-900' : 'bg-transparent'}`}></div>
                      </div>
                      <span className={`text-[13px] font-medium ${paymentMethod === 'spot' ? 'text-gray-900' : 'text-gray-600'}`}>Pay on the Spot</span>
                    </div>
                    <MapPin size={16} className={paymentMethod === 'spot' ? 'text-gray-900' : 'text-gray-400'} />
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Name on Card</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400 pr-10"
                          />
                          <CreditCard size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Security Code</label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="CVV"
                            maxLength="4"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[13px] text-gray-900 placeholder:text-gray-400 pr-10"
                          />
                          <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-lg p-3 mt-4 border border-gray-100 flex items-start gap-2.5">
                      <ShieldCheck size={16} className="text-gray-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-medium text-gray-900">Secure 256-bit SSL encryption.</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Your card will be charged securely in AED. By confirming, you agree to our Terms & Conditions.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Pay Button */}
            <div className="lg:hidden mt-6">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3.5 bg-gray-900 text-white rounded-lg font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock size={14} />
                    Pay {currencySymbol} {convertPrice(total).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
                <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-medium text-gray-600">
                  <Clock size={10} />
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4 mb-5 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 relative group">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                      <img
                        src={item.product?.images?.[0] || item.product?.image || 'https://via.placeholder.com/100'}
                        className="w-full h-full object-cover"
                        alt={item.product?.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-5">
                      <h4 className="text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2">{item.product?.name}</h4>
                      <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                        {item.options?.transfer?.name || item.options?.visaOption?.title || 'Standard Booking'}
                      </div>
                      <div className="text-[12px] font-semibold text-gray-900 mt-1">
                        {currencySymbol} {convertPrice(item.options?.totalPrice || 0).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="absolute right-0 top-0 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 mb-5 border-t border-gray-50 pt-4">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-medium">{currencySymbol} {convertPrice(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-500">Taxes & Fees</span>
                  <span className="text-gray-900 font-medium">{currencySymbol} {convertPrice(taxes).toFixed(2)}</span>
                </div>

                <div className="relative mt-2 pt-2">
                  <input
                    type="text"
                    placeholder="Have a promo code?"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-3.5 pr-16 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all text-[12px] placeholder:text-gray-400"
                  />
                  <button className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-900 font-semibold px-2 py-1 text-[11px] hover:bg-gray-50 rounded transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-end mb-5">
                  <span className="text-[13px] font-semibold text-gray-900">Total Payable</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900 block leading-none">{currencySymbol} {convertPrice(total).toFixed(2)}</span>
                    <span className="text-[9px] text-gray-400 mt-1 block">Includes all taxes and charges</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="hidden lg:flex w-full py-3.5 bg-gray-900 text-white rounded-lg font-semibold text-[13px] items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock size={14} />
                      Confirm & Pay
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
          <div className="bg-white rounded-xl w-full max-w-[360px] relative z-10 p-6 shadow-xl animate-in zoom-in-95 duration-200 text-center">
            <button onClick={() => setItemToDelete(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
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
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  removeFromCart(itemToDelete.id || itemToDelete._id);
                  setItemToDelete(null);
                  toast.success('Item removed');
                }}
                className="flex-1 py-2.5 bg-red-600 text-white text-[13px] font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
