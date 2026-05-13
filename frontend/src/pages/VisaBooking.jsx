import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight, MapPin, Globe, Check, ChevronDown, Calendar, Search, X, Users
} from "lucide-react";
import { homeApi } from "../services/homeApi";
import { useCart } from "../context/CartContext";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import { toast } from "react-hot-toast";

const COUNTRIES = [
  { name: "Afghanistan", code: "AF" }, { name: "Albania", code: "AL" }, { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" }, { name: "Angola", code: "AO" }, { name: "Argentina", code: "AR" },
  { name: "Australia", code: "AU" }, { name: "Austria", code: "AT" }, { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" }, { name: "Belgium", code: "BE" }, { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" }, { name: "China", code: "CN" }, { name: "Denmark", code: "DK" },
  { name: "Egypt", code: "EG" }, { name: "Finland", code: "FI" }, { name: "France", code: "FR" },
  { name: "Germany", code: "DE" }, { name: "Greece", code: "GR" }, { name: "Hong Kong", code: "HK" },
  { name: "India", code: "IN" }, { name: "Indonesia", code: "ID" }, { name: "Iran", code: "IR" },
  { name: "Iraq", code: "IQ" }, { name: "Ireland", code: "IE" }, { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" }, { name: "Jordan", code: "JO" }, { name: "Kuwait", code: "KW" },
  { name: "Malaysia", code: "MY" }, { name: "Mexico", code: "MX" }, { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" }, { name: "Nigeria", code: "NG" }, { name: "Norway", code: "NO" },
  { name: "Oman", code: "OM" }, { name: "Pakistan", code: "PK" }, { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" }, { name: "Portugal", code: "PT" }, { name: "Qatar", code: "QA" },
  { name: "Russia", code: "RU" }, { name: "Saudi Arabia", code: "SA" }, { name: "Singapore", code: "SG" },
  { name: "South Africa", code: "ZA" }, { name: "South Korea", code: "KR" }, { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" }, { name: "Sweden", code: "SE" }, { name: "Switzerland", code: "CH" },
  { name: "Thailand", code: "TH" }, { name: "Turkey", code: "TR" }, { name: "UAE", code: "AE" },
  { name: "UK", code: "GB" }, { name: "USA", code: "US" }, { name: "Vietnam", code: "VN" }
];

const VisaBooking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [residenceOf, setResidenceOf] = useState("");
  const [nationality, setNationality] = useState("");
  const [isResidenceOpen, setIsResidenceOpen] = useState(false);
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [searchResidence, setSearchResidence] = useState("");
  const [searchNationality, setSearchNationality] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [guests, setGuests] = useState({ adult: 1, child: 0 });
  const [processingType, setProcessingType] = useState("");
  const [selectedVisaOption, setSelectedVisaOption] = useState(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);
  const { currencySymbol, convertPrice } = useLanguageCurrency();
  const { addToCart, cartItems } = useCart();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const isLoggedIn = !!localStorage.getItem("user");

  const updateGuests = (type, delta) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(type === 'adult' ? 1 : 0, prev[type] + delta)
    }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    homeApi.getProductBySlug(slug)
      .then(data => {
        setProduct(data);
        const generatedDates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(today.getDate() + i);
          generatedDates.push({
            date: d,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            monthName: d.toLocaleDateString('en-US', { month: 'short' }),
            dayNum: d.getDate(),
            price: data.pricing?.discountPrice || data.pricing?.fromPrice || data.pricing?.actualPrice || 0
          });
        }
        setDates(generatedDates);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const getExpressMultiplier = () => processingType === "Express" ? (4 / 3) : 1;
  
  const getAdultPrice = () => {
    const base = product?.pricing?.discountPrice || product?.pricing?.actualPrice || 0;
    return base * getExpressMultiplier();
  };
  
  const getChildPrice = () => {
    const base = product?.pricing?.childPrice || 0;
    return base * getExpressMultiplier();
  };

  const calculateTotal = () => {
    if (!selectedVisaOption) return 0;
    const adultTotal = guests.adult * getAdultPrice();
    const childTotal = guests.child * getChildPrice();
    return adultTotal + childTotal;
  };

  const filteredResidence = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchResidence.toLowerCase()));
  const filteredNationality = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchNationality.toLowerCase()));

  const showDateSection = residenceOf && nationality;
  const showGuestSection = selectedDate;
  const showVisaTypeSection = processingType;

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading Visa Details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[97%] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <Link to={`/visas/${product.slug}`} className="hover:text-gray-900 transition-colors">{product.name}</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-gray-800 font-medium">Visa Booking</span>
          </div>
        </div>
      </div>

      <div className="max-w-[97%] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <section className="mb-12">
              {!showDateSection && <h1 className="text-xl font-semibold text-gray-900 mb-6">Select Residence Of and Nationality</h1>}

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-gray-700">Residence Of</label>
                  <button
                    onClick={() => setIsResidenceOpen(!isResidenceOpen)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-gray-400" />
                      <span className={`font-medium ${residenceOf ? 'text-gray-900' : 'text-gray-400'}`}>
                        {residenceOf || "Select"}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isResidenceOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isResidenceOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-gray-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={searchResidence}
                            onChange={(e) => setSearchResidence(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-0"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filteredResidence.map(c => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setResidenceOf(c.name);
                              setIsResidenceOpen(false);
                              setSearchResidence("");
                            }}
                            className="w-full px-5 py-3 text-left text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-gray-700">{c.name}</span>
                            {residenceOf === c.name && <Check size={16} className="text-green-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-gray-700">Nationality</label>
                  <button
                    onClick={() => setIsNationalityOpen(!isNationalityOpen)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-gray-400" />
                      <span className={`font-medium ${nationality ? 'text-gray-900' : 'text-gray-400'}`}>
                        {nationality || "Select"}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isNationalityOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isNationalityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-gray-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={searchNationality}
                            onChange={(e) => setSearchNationality(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-0"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filteredNationality.map(c => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setNationality(c.name);
                              setIsNationalityOpen(false);
                              setSearchNationality("");
                            }}
                            className="w-full px-5 py-3 text-left text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-gray-700">{c.name}</span>
                            {nationality === c.name && <Check size={16} className="text-green-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {showDateSection && (
              <section className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-baseline mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Select Expected Travel Date</h2>
                  <span className="text-[10px] text-gray-500 font-medium">All prices are in ({currencySymbol})</span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => {
                    const isSelected = selectedDate?.date.toDateString() === d.date.toDateString();
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center justify-center min-w-[80px] py-3 rounded-xl border transition-all ${isSelected
                          ? "border-gray-900 bg-gray-50 shadow-sm z-10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                      >
                        <span className="text-[10px] font-semibold text-gray-500 uppercase mb-1">{d.dayName}</span>
                        <span className="text-sm font-semibold text-gray-900">{d.monthName} {d.dayNum}</span>
                      </button>
                    );
                  })}
                  <button className="flex flex-col items-center justify-center min-w-[80px] py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 group">
                    <Calendar size={16} className="text-gray-400 mb-1 group-hover:text-gray-600 transition-colors" />
                    <span className="text-[10px] font-semibold text-gray-600">More dates</span>
                  </button>
                </div>
              </section>
            )}

            {showGuestSection && (
              <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Number of Guests</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'adult', label: 'Adult' },
                      { id: 'child', label: 'Child' }
                    ].map((row) => (
                      <div key={row.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                        <span className="text-sm font-semibold text-gray-800">{row.label}</span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateGuests(row.id, -1)}
                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all"
                          >
                            <span className="text-lg font-medium">−</span>
                          </button>
                          <span className="w-6 text-center font-semibold text-gray-900 text-sm">{guests[row.id]}</span>
                          <button
                            onClick={() => updateGuests(row.id, 1)}
                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all"
                          >
                            <span className="text-lg font-medium">+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Processing Type</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(product?.processingTypes?.length ? product.processingTypes : ["Normal", "Express"]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setProcessingType(type)}
                        className={`p-4 rounded-xl border text-left transition-all ${processingType === type
                          ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                          : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                      >
                        <span className={`text-sm font-semibold ${processingType === type ? 'text-gray-900' : 'text-gray-600'}`}>
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {showVisaTypeSection && product.visaOptions?.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Visa Type</h2>
                    <div className="space-y-3">
                      {product.visaOptions.map((opt) => {
                        const isSelected = selectedVisaOption?._id === opt._id;
                        const potentialTotal = (guests.adult * getAdultPrice()) + (guests.child * getChildPrice());
                        return (
                          <button
                            key={opt._id}
                            onClick={() => setSelectedVisaOption(opt)}
                            className={`w-full flex items-center justify-between p-4 bg-white border rounded-xl transition-all text-left ${isSelected
                              ? "border-gray-900 ring-1 ring-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{opt.title}</h4>
                              <p className="text-xs text-gray-500">{opt.description || `Get by in ${opt.processingTime || 'a few days'}`}</p>
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Total Price</span>
                              <span className="text-sm font-bold text-gray-900">{currencySymbol} {Number(convertPrice(potentialTotal)).toFixed(2)}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
                <span className="text-gray-900">1. Check Availability</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="text-gray-400">2. Confirm and Pay</span>
              </div>
            </div>

            {/* Product Summary Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-3">
                    {selectedVisaOption?.title || product.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {residenceOf && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">{residenceOf}</span>
                      </div>
                    )}
                    {nationality && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <Globe size={14} className="text-gray-400" />
                        <span className="truncate">{nationality}</span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium col-span-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{selectedDate.dayNum} {selectedDate.monthName} {selectedDate.date.getFullYear()}</span>
                      </div>
                    )}
                    {showGuestSection && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium col-span-2">
                        <Users size={14} className="text-gray-400" />
                        <span>{guests.adult} Adult {guests.child > 0 ? `, ${guests.child} Child` : ''}</span>
                      </div>
                    )}
                    {processingType && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium col-span-2">
                        <Check size={14} className="text-gray-400" />
                        <span>{processingType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {selectedVisaOption && (
                <div className="space-y-5 animate-in fade-in duration-500">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <button
                      onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                      className="w-full flex items-center justify-between mb-3 group"
                    >
                      <span className="text-xs font-semibold text-gray-700">Price Breakdown</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-300 ${isBreakdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isBreakdownOpen && (
                      <div className="space-y-2.5 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center text-xs font-medium text-gray-600">
                          <span>{guests.adult} Adult x {currencySymbol} {Number(convertPrice(getAdultPrice())).toFixed(2)}</span>
                          <span className="font-semibold text-gray-900">{currencySymbol} {Number(convertPrice(guests.adult * getAdultPrice())).toFixed(2)}</span>
                        </div>
                        {guests.child > 0 && (
                          <div className="flex justify-between items-center text-xs font-medium text-gray-600">
                            <span>{guests.child} Child x {currencySymbol} {Number(convertPrice(getChildPrice())).toFixed(2)}</span>
                            <span className="font-semibold text-gray-900">{currencySymbol} {Number(convertPrice(guests.child * getChildPrice())).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold text-gray-500">Total Payable</span>
                    <span className="text-lg font-bold text-gray-900">
                      {currencySymbol} {convertPrice(calculateTotal()).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {!isAddedToCart ? (
                      <>
                        <button 
                          onClick={() => {
                            if (!isLoggedIn) {
                              toast.error("Please login to add visas to your cart", { duration: 3000, style: { background: "#333", color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: "bold" } });
                              return;
                            }
                            addToCart(product, {
                              date: selectedDate?.date,
                              guests,
                              residence: residenceOf,
                              nationality,
                              processingType,
                              visaOption: selectedVisaOption,
                              totalPrice: calculateTotal()
                            });
                            setIsAddedToCart(true);
                          }}
                          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-white border border-gray-200 rounded-lg font-semibold text-xs text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95 group"
                        >
                          <Search size={16} className="text-gray-400 group-hover:text-gray-600" />
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => {
                            if (!isLoggedIn) {
                              toast.error("Please login to proceed with booking", { duration: 3000, style: { background: "#333", color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: "bold" } });
                              return;
                            }
                            addToCart(product, {
                              date: selectedDate?.date,
                              guests,
                              residence: residenceOf,
                              nationality,
                              processingType,
                              visaOption: selectedVisaOption,
                              totalPrice: calculateTotal()
                            });
                            setTimeout(() => navigate('/checkout'), 0);
                          }}
                          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-gray-900 rounded-lg font-semibold text-xs text-white hover:bg-gray-800 transition-all active:scale-95"
                        >
                          <Globe size={16} />
                          Proceed to pay
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/"
                          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-white border border-gray-200 rounded-lg font-semibold text-xs text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95 group"
                        >
                          Continue Shopping
                        </Link>
                        <Link
                          to="/cart"
                          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-gray-900 rounded-lg font-semibold text-xs text-white hover:bg-gray-800 transition-all active:scale-95 relative"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                          View Cart
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">{cartItems?.length || 1}</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisaBooking;
