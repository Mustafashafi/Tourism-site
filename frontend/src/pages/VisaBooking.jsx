import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ChevronRight, MapPin, Globe, Check, ChevronDown, Calendar, Search, X, Users
} from "lucide-react";
import { homeApi } from "../services/homeApi";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";

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

  const calculateTotal = () => {
    if (!selectedVisaOption) return 0;
    const adultTotal = guests.adult * (selectedVisaOption.adultPrice || 0);
    const childTotal = guests.child * (selectedVisaOption.childPrice || 0);
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
      <div className="bg-white border-b border-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-400">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <Link to={`/visas/${product.slug}`} className="hover:text-gray-900 transition-colors">{product.name}</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-600 font-medium">Visa Booking</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            <section className="mb-16">
              {!showDateSection && <h1 className="text-[28px] font-bold text-gray-900 mb-10">Select Residence Of and Nationality</h1>}
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-gray-800">Residence Of</label>
                  <button 
                    onClick={() => setIsResidenceOpen(!isResidenceOpen)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-all text-left bg-gray-50/30"
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

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-gray-800">Nationality</label>
                  <button 
                    onClick={() => setIsNationalityOpen(!isNationalityOpen)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-all text-left bg-gray-50/30"
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
              <section className="mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-baseline mb-8">
                  <h2 className="text-[28px] font-bold text-gray-900">Select Expected Travel Date</h2>
                  <span className="text-xs text-gray-400 font-medium tracking-wide">All prices are in ({currencySymbol})</span>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {dates.map((d, i) => {
                    const isSelected = selectedDate?.date.toDateString() === d.date.toDateString();
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center justify-center min-w-[100px] py-5 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? "border-gray-900 bg-white shadow-xl scale-105 z-10"
                            : "border-gray-50 bg-white hover:border-gray-200"
                        }`}
                      >
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{d.dayName}</span>
                        <span className="text-[15px] font-bold text-gray-800">{d.monthName} {d.dayNum}</span>
                      </button>
                    );
                  })}
                  <button className="flex flex-col items-center justify-center min-w-[100px] py-5 rounded-2xl border-2 border-gray-50 bg-white hover:border-gray-200 group">
                    <Calendar size={20} className="text-gray-400 mb-2 group-hover:text-gray-600 transition-colors" />
                    <span className="text-[12px] font-bold text-gray-600 underline">More dates</span>
                  </button>
                </div>
              </section>
            )}

            {showGuestSection && (
              <div className="space-y-16 animate-in fade-in slide-in-from-top-4 duration-500">
                <section>
                  <h2 className="text-[28px] font-bold text-gray-900 mb-8">Select Number of Guests</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'adult', label: 'Adult' },
                      { id: 'child', label: 'Child' }
                    ].map((row) => (
                      <div key={row.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                        <span className="text-lg font-bold text-gray-800">{row.label}</span>
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => updateGuests(row.id, -1)}
                            className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-90"
                          >
                            <span className="text-2xl font-light">−</span>
                          </button>
                          <span className="w-8 text-center font-black text-gray-900 text-lg">{guests[row.id]}</span>
                          <button
                            onClick={() => updateGuests(row.id, 1)}
                            className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-90"
                          >
                            <span className="text-2xl font-light">+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-[28px] font-bold text-gray-900 mb-8">Select Processing Type</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {["Normal", "Express"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setProcessingType(type)}
                        className={`p-6 rounded-3xl border-2 text-left transition-all ${
                          processingType === type
                            ? "border-gray-900 bg-white shadow-xl ring-1 ring-gray-900"
                            : "border-gray-50 bg-white hover:border-gray-200"
                        }`}
                      >
                        <span className={`text-lg font-bold ${processingType === type ? 'text-gray-900' : 'text-gray-600'}`}>
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {showVisaTypeSection && product.visaOptions?.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-[28px] font-bold text-gray-900 mb-8">Select Visa Type</h2>
                    <div className="space-y-4">
                      {product.visaOptions.map((opt) => {
                        const isSelected = selectedVisaOption?._id === opt._id;
                        return (
                          <button
                            key={opt._id}
                            onClick={() => setSelectedVisaOption(opt)}
                            className={`w-full flex items-center justify-between p-6 bg-white border rounded-[32px] transition-all text-left ${
                              isSelected
                                ? "border-gray-900 shadow-xl ring-1 ring-gray-900"
                                : "border-gray-100 hover:border-gray-300 shadow-sm"
                            }`}
                          >
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">{opt.title}</h4>
                              <p className="text-sm text-gray-400 font-medium">{opt.description || `Get by in ${opt.processingTime || 'a few days'}`}</p>
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Price</span>
                              <span className="text-lg font-black text-gray-900">{currencySymbol} {Number(convertPrice(opt.adultPrice || 0)).toFixed(2)}</span>
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

          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <span className="text-gray-900">1. Check Availability</span>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-300">2. Confirm and Pay</span>
              </div>
            </div>

            {/* Product Summary Card */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-2xl space-y-8 sticky top-6">
              <div className="flex gap-5">
                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-50 shrink-0 shadow-sm border border-gray-50">
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 py-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-4">
                    {selectedVisaOption?.title || product.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {residenceOf && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-bold">
                        <MapPin size={16} className="text-gray-300" />
                        <span className="truncate">{residenceOf}</span>
                      </div>
                    )}
                    {nationality && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-bold">
                        <Globe size={16} className="text-gray-300" />
                        <span className="truncate">{nationality}</span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-bold col-span-2">
                        <Calendar size={16} className="text-gray-300" />
                        <span>{selectedDate.dayNum} {selectedDate.monthName} {selectedDate.date.getFullYear()}</span>
                      </div>
                    )}
                    {showGuestSection && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-bold col-span-2">
                        <Users size={16} className="text-gray-300" />
                        <span>{guests.adult} Adult {guests.child > 0 ? `, ${guests.child} Child` : ''}</span>
                      </div>
                    )}
                    {processingType && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-bold col-span-2">
                        <Check size={16} className="text-gray-300" />
                        <span>{processingType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {selectedVisaOption && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-50">
                    <button 
                      onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                      className="w-full flex items-center justify-between mb-4 group"
                    >
                      <span className="text-sm font-bold text-gray-700">Price Breakdown</span>
                      <ChevronDown 
                        size={18} 
                        className={`text-gray-400 transition-transform duration-300 ${isBreakdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    {isBreakdownOpen && (
                      <div className="space-y-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center text-[13px] font-medium text-gray-600">
                          <span>{guests.adult} Adult x {currencySymbol} {Number(convertPrice(selectedVisaOption.adultPrice || 0)).toFixed(2)}</span>
                          <span className="font-bold text-gray-900">{currencySymbol} {Number(convertPrice(guests.adult * (selectedVisaOption.adultPrice || 0))).toFixed(2)}</span>
                        </div>
                        {guests.child > 0 && (
                          <div className="flex justify-between items-center text-[13px] font-medium text-gray-600">
                            <span>{guests.child} Child x {currencySymbol} {Number(convertPrice(selectedVisaOption.childPrice || 0)).toFixed(2)}</span>
                            <span className="font-bold text-gray-900">{currencySymbol} {Number(convertPrice(guests.child * (selectedVisaOption.childPrice || 0))).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-gray-400">Total Payable</span>
                    <span className="text-2xl font-black text-gray-900">
                      {currencySymbol} {convertPrice(calculateTotal()).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-4 px-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-900 hover:border-gray-900 hover:shadow-lg transition-all active:scale-95 group">
                      <Search size={20} className="text-gray-400 group-hover:text-gray-900" />
                      Add to Cart
                    </button>
                    <button className="flex items-center justify-center gap-2 py-4 px-4 bg-gray-900 rounded-2xl font-bold text-white hover:bg-black hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-gray-200">
                      <Globe size={18} />
                      Proceed to pay
                    </button>
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
