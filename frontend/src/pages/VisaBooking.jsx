import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ChevronRight, MapPin, Globe, Check, ChevronDown, Calendar, Search, X
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

  useEffect(() => {
    window.scrollTo(0, 0);
    homeApi.getProductBySlug(slug)
      .then(data => setProduct(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredResidence = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchResidence.toLowerCase()));
  const filteredNationality = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchNationality.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
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
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-[28px] font-bold text-gray-900 mb-10">Select Residence Of and Nationality</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Residence Of Dropdown */}
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

              {/* Nationality Dropdown */}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Steps Indicator */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <span className="text-gray-900">1. Check Availability</span>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-300">2. Confirm and Pay</span>
              </div>
            </div>

            {/* Product Summary Card */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl space-y-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 shadow-sm border border-gray-50">
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 py-1">
                  <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisaBooking;
