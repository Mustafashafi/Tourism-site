import React, { useState, useEffect } from "react";
import { Phone, User, ShoppingCart, Search, X } from "lucide-react";
import logo from "../assets/raynatourslogo.webp";
import { Link, NavLink, useLocation } from "react-router-dom";
import { homeApi } from "../services/homeApi";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import { useCart } from "../context/CartContext";
import SearchOverlay from "./SearchOverlay";

// Icon map: matches a category slug or lowercased name to an emoji icon
const ICON_MAP = {
  activities: "🔭",
  activity: "🔭",
  holidays: "⛱️",
  holiday: "⛱️",
  visas: "💳",
  visa: "💳",
  cruises: "🚢",
  cruise: "🚢",
  tours: "🗺️",
  desert: "🏜️",
  adventure: "🧗",
  water: "🌊",
  safari: "🦁",
  city: "🏙️",
  culture: "🏛️",
  food: "🍽️",
  family: "👨‍👩‍👧",
  luxury: "💎",
  budget: "💰",
};

const getCategoryIcon = (name, slug) => {
  const key = (slug || name || "").toLowerCase();
  // Try full slug/name first, then first word
  return (
    ICON_MAP[key] ||
    ICON_MAP[key.split("-")[0]] ||
    ICON_MAP[key.split(" ")[0]] ||
    "🏷️"
  );
};

const ROUTE_MAP = {
  activities: "/activity",
  activity: "/activity",
  holidays: "/holiday",
  holiday: "/holiday",
  visas: "/visa",
  visa: "/visa",
  cruises: "/cruises",
  cruise: "/cruises",
};

const getCategoryRoute = (slug = "") => {
  const key = String(slug || "").toLowerCase();
  return ROUTE_MAP[key] || `/${key}`;
};

const Navbar = ({ onOpenUserMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, currency, setCurrency, currencySymbol } = useLanguageCurrency();
  const { cartCount } = useCart();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Hide categories row on product detail and cart pages
  const isCompactNavbar = /\/(activities|holidays|visas|cruises)\/[^/]+/.test(location.pathname) || location.pathname === '/cart' || location.pathname === '/checkout';

  // Detect city detail page and extract city name from slug
  const cityPageMatch = location.pathname.match(/^\/city\/([^/]+)/);
  const isCityPage = !!cityPageMatch;
  const citySlugFromUrl = cityPageMatch ? cityPageMatch[1] : "";
  const cityNameFromUrl = citySlugFromUrl
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    homeApi
      .getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch(() => {
        // On error keep categories empty — UI degrades gracefully
      })
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <nav
      className={`sticky top-0 w-full z-50 bg-white transition-all duration-300 ${isCompactNavbar ? "" : "pb-4"} ${isScrolled ? "shadow-md border-transparent" : "border-b border-gray-100"
        }`}
    >
      {/* Top Row: Logo & Actions */}
      <div className="relative z-[1001] bg-white">
        <div className="max-w-[99%] mx-auto px-6 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link to={"/"} className="">
          <img src={logo} alt="Rayna Tours" className="w-40" />
        </Link>

        {/* Top Right Controls */}
        <div className="flex items-center space-x-4">

          {/* Helpline Dropdown Wrapper */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 transition-colors cursor-pointer ${isOpen ? "relative z-50 bg-white" : "hover:bg-gray-50"}`}
            >
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">Helpline</span>
            </button>

            {isOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-black/50"
                  onClick={() => setIsOpen(false)}
                />

                {/* Dropdown Panel */}
                <div className="absolute right-0 mt-1 w-60 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2">
                    {/* UAE Contact */}
                    <a
                      href="tel:+97142087444"
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl group transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-500 group-hover:text-primary transition-colors">
                          <Phone size={18} />
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-gray-500">UAE</p>
                          <p className="text-sm text-gray-500 tracking-tight">+971 4 208 7444</p>
                        </div>
                      </div>
                    </a>

                    <div className="h-0.5 rounded-2xl bg-gray-200 mx-2" />

                    {/* India Contact */}
                    <a
                      href="tel:+912066838877"
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl group transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-500 group-hover:text-primary transition-colors">
                          <Phone size={18} />
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-gray-500">India</p>
                          <p className="text-sm text-gray-500 tracking-tight">+91 20 6683 8877</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Language / Currency Button */}
          <div className="relative">
            <button
              onClick={() => setIsCurrencyOpen(v => !v)}
              className={`notranslate px-4 py-2 border border-gray-200 rounded-lg transition-colors cursor-pointer ${
                isCurrencyOpen 
                  ? "relative z-50 bg-white" 
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="text-sm text-gray-500 font-medium">
                {language} / {currency}
              </span>
            </button>

            {isCurrencyOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setIsCurrencyOpen(false)}
                />

                {/* Popup Panel */}
                <div className="fixed left-1/2 -translate-x-1/2 top-20 z-50 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-100 w-[92vw] max-w-4xl overflow-hidden">
                  {/* Close button */}
                  <button
                    onClick={() => setIsCurrencyOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer z-10"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex min-h-[420px]">
                    {/* ── LEFT: Languages ───────────────────────────────── */}
                    <div className="w-56 shrink-0 border-r border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-5">Languages</h3>
                      {["English", "Arabic"].map(lang => (
                        <button
                          key={lang}
                          onClick={() => { setLanguage(lang); setIsCurrencyOpen(false); }}
                          className={`w-full text-left px-3 py-2 mb-1.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all ${
                            language === lang
                              ? "border-gray-900 text-gray-900 bg-gray-50"
                              : "border-gray-200 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>

                    {/* ── RIGHT: Currencies ─────────────────────────────── */}
                    <div className="flex-1 p-6 overflow-y-auto max-h-[520px]">
                      {/* Popular Currencies */}
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Currencies</h3>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {[
                          { code: "AED", name: "Arab Emirates Dirham" },
                          { code: "INR", name: "Indian Rupee" },
                          { code: "USD", name: "American Dollar" },
                        ].map(c => (
                          <button
                            key={c.code}
                            onClick={() => { setCurrency(c.code); setIsCurrencyOpen(false); }}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[13px] cursor-pointer transition-all ${
                              currency === c.code
                                ? "border-gray-900 bg-gray-50 font-semibold"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <span className="text-[11px] font-bold text-gray-500 shrink-0">{c.code}</span>
                            <span className="text-gray-700 truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* More Currencies */}
                      <h3 className="text-lg font-bold text-gray-900 mb-4">More Currencies</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { code: "AMD", name: "Armenian Dram" },
                          { code: "AUD", name: "Australian Dollar" },
                          { code: "DKK", name: "Denmark Krona" },
                          { code: "EUR", name: "Euro" },
                          { code: "GBP", name: "UK Pounds Sterling" },
                          { code: "GEL", name: "Georgian Lari" },
                          { code: "HKD", name: "Hong Kong Dollar" },
                          { code: "IDR", name: "Indonesian Rupiah" },
                          { code: "JPY", name: "Japanese Yen" },
                          { code: "KZT", name: "Kazakhstani Tenge" },
                          { code: "MOP", name: "Macau Pataca" },
                          { code: "MUR", name: "Mauritian Rupee" },
                          { code: "MYR", name: "Malaysian Ringgit" },
                          { code: "OMR", name: "Omani Rial" },
                          { code: "SAR", name: "Saudi Arabian Riyal" },
                          { code: "SGD", name: "Singapore Dollar" },
                          { code: "THB", name: "Thai Baht" },
                          { code: "TRY", name: "Turkish Lira" },
                          { code: "UZS", name: "Uzbekistani Som" },
                          { code: "VND", name: "Vietnamese Dong" },
                          { code: "ZAR", name: "South African Rand" },
                        ].map(c => (
                          <button
                            key={c.code}
                            onClick={() => { setCurrency(c.code); setIsCurrencyOpen(false); }}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[13px] cursor-pointer transition-all ${
                              currency === c.code
                                ? "border-gray-900 bg-gray-50 font-semibold"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <span className="text-[11px] font-bold text-gray-400 shrink-0">{c.code}</span>
                            <span className="text-gray-700 truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Icon */}
          <button
            onClick={onOpenUserMenu}
            className="flex items-center justify-center cursor-pointer w-10 h-10 rounded-full text-gray-500 bg-gray-200 transition-colors overflow-hidden"
          >
            {user ? (
              user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.target.src = ""; setUser({...user, profilePicture: null}); }}
                />
              ) : (
                <div className="w-full h-full bg-[#2D2D2D] text-white flex items-center justify-center font-bold text-lg uppercase">
                  {(user.name || user.email)?.[0]}
                </div>
              )
            ) : (
              <User size={20} />
            )}
          </button>

          {/* Cart Icon */}
          <Link to="/cart" className="relative text-gray-500 hover:text-gray-700 transition-colors pl-2 cursor-pointer flex items-center">
            <ShoppingCart size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>

      {/* Bottom Row: Categories & Search — hidden on product detail, cart, and booking pages */}
      {!isCompactNavbar && !location.pathname.startsWith('/booking') && (
        <div className="max-w-[99%] mx-auto px-6 flex justify-between items-center">
        {/* Left: Category Pills OR City Title */}
        {isCityPage ? (
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-800">
              Things to do in {cityNameFromUrl}
            </span>
          </div>
        ) : (
        <div className="flex items-center space-x-3">
          {loadingCats ? (
            // Skeleton placeholders while loading
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-10 w-28 rounded-xl bg-gray-100 animate-pulse"
              />
            ))
          ) : (
            categories.map((cat) => {
              const icon = getCategoryIcon(cat.name, cat.slug);
              const to = getCategoryRoute(cat.slug);

              return (
                <NavLink
                  to={to}
                  key={cat._id}
                  className={({ isActive }) => {
                    const isActivityHome = to === "/activity" && location?.pathname === "/";
                    const active = isActive || isActivityHome;
                    return `
                    flex items-center space-x-0.5 justify-center px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${active
                        ? "bg-white text-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                        : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                      }
                  `}
                  }
                  aria-current={
                    location?.pathname === to || (to === "/activity" && location?.pathname === "/")
                      ? "page"
                      : undefined
                  }
                >
                  <span>{icon}</span>
                  <span>{cat.name}</span>
                </NavLink>
              );
            })
          )}
        </div>
        )}

        {/* Right Search Bar */}
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="relative w-full max-w-86 cursor-pointer"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" strokeWidth={2} />
          </div>
          <div className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-400 text-sm select-none">
            Search Tours..
          </div>
        </div>
      </div>
      )}

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;

