import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Globe, Search, ShoppingCart, User, X, Menu, ChevronDown, ChevronRight } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaWhatsapp } from "react-icons/fa";
import logo from "../assets/Horizontal Full Logo.webp";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import { useCart } from "../context/CartContext";
import SearchOverlay from "./SearchOverlay";

// Mega Menu Static Configuration
import { homeApi } from "../services/homeApi";

const buildMenuData = (hierarchy) => {
  const base = {
    activities: { title: "Activities", route: "/tours?category=activities", destinations: [] },
    cruises: { title: "Cruises", route: "/tours?category=cruises", destinations: [] },
    holidays: { title: "Holidays", route: "/tours?category=holidays", destinations: [] }
  };

  const cityImages = {
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
    "abu-dhabi": "https://images.unsplash.com/photo-1544913716-6081a2fd3791?auto=format&fit=crop&w=400&q=80",
    "sharjah": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80",
    "ras-al-khaimah": "https://images.unsplash.com/photo-1616391444190-845f061266e7?auto=format&fit=crop&w=400&q=80"
  };

  const subCategoryImages = {
    "desert-safari": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80",
    "city-tours": "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=400&q=80",
    "adventure-tours": "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=400&q=80",
    "luxury-yacht-tours": "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80",
    "dhow-cruise": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
    "holiday-city-tours": "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=400&q=80",
    "holiday-adventure-tours": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80"
  };

  const defaultSubcatImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";

  for (const city of hierarchy) {
    const citySlug = city.slug.toLowerCase();
    const cityImage = cityImages[citySlug] || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80";

    for (const cat of city.categories) {
      const catSlug = cat.slug.toLowerCase();
      const targetKey = catSlug.includes("activ") ? "activities" : catSlug.includes("cruise") ? "cruises" : catSlug.includes("holiday") ? "holidays" : null;
      if (!targetKey || !base[targetKey]) continue;

      const destinationsList = base[targetKey].destinations;
      let destNode = destinationsList.find(d => d.id === citySlug);
      if (!destNode) {
        destNode = {
          id: citySlug,
          name: city.name,
          image: cityImage,
          categories: []
        };
        destinationsList.push(destNode);
      }

      for (const sub of cat.subCategories) {
        const subSlug = sub.slug.toLowerCase();
        const subImage = subCategoryImages[subSlug] || defaultSubcatImage;

        const links = sub.tourTypes.map(t => {
          const baseRoute = base[targetKey].route;
          const separator = baseRoute.includes("?") ? "&" : "?";
          return {
            label: t.name,
            to: `${baseRoute}${separator}city=${citySlug}&subCategory=${subSlug}&tourType=${t.slug}`
          };
        });

        destNode.categories.push({
          title: sub.name,
          image: subImage,
          links: links
        });
      }
    }
  }

  return base;
};

const Navbar = ({ onOpenUserMenu }) => {
  const [menuData, setMenuData] = useState({
    activities: { title: "Activities", route: "/tours?category=activities", destinations: [] },
    cruises: { title: "Cruises", route: "/tours?category=cruises", destinations: [] },
    holidays: { title: "Holidays", route: "/tours?category=holidays", destinations: [] }
  });
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState(null);
  const [mobileExpandedTab, setMobileExpandedTab] = useState(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  const headerLogo = settings?.logos?.headerLogoDark || settings?.logos?.headerLogoLight || logo;
  
  const location = useLocation();
  const { language, setLanguage, currency, setCurrency, currencySymbol } = useLanguageCurrency();
  const { cartCount } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const hierarchy = await homeApi.getNavigationHierarchy();
        const formatted = buildMenuData(hierarchy);
        setMenuData(formatted);
      } catch (err) {
        console.error("Failed to load navigation menu hierarchy:", err);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await homeApi.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load navbar settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on path change
  useEffect(() => {
    setHoveredMenu(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMenuHover = (menuKey) => {
    setHoveredMenu(menuKey);
    if (menuKey && menuData[menuKey]?.destinations?.length > 0) {
      setActiveTab(menuData[menuKey].destinations[0].id);
    }
  };

  const socialLinks = settings?.socialLinks || {};
  const contactDetails = settings?.contactDetails || {};
  const phoneVal = contactDetails.phone || "+971 4 208 7444";
  const emailVal = contactDetails.email || "info@carthagetravel.com";

  return (
    <nav
      className={`sticky top-0 w-full z-50 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
      onMouseLeave={() => setHoveredMenu(null)}
    >
      {/* ── TIER 1: TOP UTILITY BAR (Desktop Only) ────────────────────── */}
      <div className="hidden lg:block bg-[#CC1422] text-white text-[13px] py-2 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: Contact Info */}
          <div className="flex items-center space-x-6">
            <a href={`tel:${phoneVal.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
              <Phone size={14} />
              <span>UAE: {phoneVal}</span>
            </a>
            <a href={`mailto:${emailVal}`} className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
              <Mail size={14} />
              <span>{emailVal}</span>
            </a>
            <div className="flex items-center gap-1.5 opacity-90">
              <MapPin size={14} />
              <span>{contactDetails.address || "Dubai, UAE"}</span>
            </div>
          </div>

          {/* Right: Language/Currency & Social Icons */}
          <div className="flex items-center space-x-6">
            {/* Language / Currency Selector */}
            <button
              onClick={() => setIsCurrencyOpen(true)}
              className="flex items-center gap-1.5 hover:text-white/80 transition-colors cursor-pointer"
            >
              <Globe size={14} />
              <span className="font-medium tracking-wide">
                {language} / {currency} ({currencySymbol})
              </span>
              <ChevronDown size={12} />
            </button>

            {/* Social Icons */}
            <div className="flex items-center space-x-4 border-l border-white/20 pl-6">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
                  <FaFacebookF size={13} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
                  <FaInstagram size={13} />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
                  <FaTwitter size={13} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
                  <FaYoutube size={13} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
                  <FaLinkedinIn size={13} />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
                  <FaWhatsapp size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TIER 2: MAIN NAVIGATION BAR ──────────────────────────────── */}
      <div className="bg-white py-4 px-6 relative z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: Logo */}
          <Link to="/" className="shrink-0">
            <img src={headerLogo} alt="Carthage Travel & Tourism" className="h-10 lg:h-12 w-auto object-contain" />
          </Link>

          {/* Center: Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-8">
            {Object.keys(menuData).map((key) => {
              const item = menuData[key];
              const menuCategory = new URLSearchParams(item.route.split("?")[1] || "").get("category");
              const currentCategory = new URLSearchParams(location.search).get("category");
              const isMatch = location.pathname === "/tours" && currentCategory === menuCategory;

              return (
                <div key={key} className="h-full py-2">
                  <NavLink
                    to={item.route}
                    onMouseEnter={() => handleMenuHover(key)}
                    className={
                      `text-[15px] font-semibold transition-colors duration-200 py-2 border-b-2 flex items-center gap-1 ${
                        isMatch || hoveredMenu === key
                          ? "border-[#CC1422] text-[#CC1422]"
                          : "border-transparent text-gray-700 hover:text-[#CC1422]"
                      }`
                    }
                  >
                    <span>{item.title}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${hoveredMenu === key ? "rotate-180" : ""}`} />
                  </NavLink>
                </div>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Search Input (Desktop) */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-gray-400 text-sm cursor-pointer hover:border-gray-300 transition-colors w-64"
            >
              <Search size={16} />
              <span>Search Tours..</span>
            </div>

            {/* Search Icon (Mobile) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-[#CC1422] transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#CC1422] transition-colors">
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CC1422] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <button
              onClick={onOpenUserMenu}
              className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors overflow-hidden"
            >
              {user ? (
                user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setUser({ ...user, profilePicture: null })}
                  />
                ) : (
                  <div className="w-full h-full bg-[#111118] text-white flex items-center justify-center font-bold text-sm uppercase">
                    {(user.name || user.email)?.[0]}
                  </div>
                )
              ) : (
                <User size={18} />
              )}
            </button>

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#CC1422] transition-colors cursor-pointer"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP MEGA MENU OVERLAY ────────────────────────────────── */}
      {hoveredMenu && menuData[hoveredMenu] && (
        <div
          onMouseEnter={() => setHoveredMenu(hoveredMenu)}
          className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[calc(100vw-3rem)] max-w-6xl bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(17,17,24,0.12)] z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-2 flex min-h-[380px] overflow-hidden"
        >
          {/* Left Column: Destinations List (Tabs) */}
          <div className="w-[260px] border-r border-gray-100 bg-gray-50/50 p-6 shrink-0 flex flex-col">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4 px-1">
              Destinations
            </h4>
            <div className="space-y-1.5 overflow-y-auto pr-1">
              {menuData[hoveredMenu].destinations.map((dest) => (
                <button
                  key={dest.id}
                  onMouseEnter={() => setActiveTab(dest.id)}
                  onClick={() => setActiveTab(dest.id)}
                  className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === dest.id
                      ? "bg-white text-[#CC1422] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.04)] border-l-4 border-[#CC1422]"
                      : "text-gray-600 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:text-[#CC1422]"
                  }`}
                >
                  <span>{dest.name}</span>
                  <ChevronRight size={14} className={`transition-all duration-200 ${activeTab === dest.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Categories Display */}
          <div className="flex-1 p-8 bg-transparent overflow-y-auto max-h-[500px]">
            {menuData[hoveredMenu].destinations.map((dest) => {
              if (dest.id !== activeTab) return null;

              return (
                <div key={dest.id} className="grid grid-cols-3 gap-8 animate-in fade-in duration-200">
                  {dest.categories.map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-3">
                      {/* Category Heading (Text Only) */}
                      <h5 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 uppercase tracking-wider">
                        {cat.title}
                      </h5>

                      {/* Sub Category Links */}
                      <div className="space-y-2">
                        {cat.links.map((link, linkIdx) => (
                          <Link
                            key={linkIdx}
                            to={link.to}
                            className="block text-[13px] text-gray-500 hover:text-[#CC1422] hover:translate-x-1 transition-all duration-200 truncate"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MOBILE MENU DRAWER ───────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[1000] flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-[85vw] max-w-sm ml-auto bg-white/98 backdrop-blur-md h-full shadow-2xl animate-in slide-in-from-right duration-300 z-10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <img src={logo} alt="Carthage" className="h-8 w-auto" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body (Navigation Accordion) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Object.keys(menuData).map((key) => {
                const item = menuData[key];
                const isExpanded = mobileExpandedMenu === key;

                return (
                  <div key={key} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => {
                        setMobileExpandedMenu(isExpanded ? null : key);
                        setMobileExpandedTab(null);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="bg-white p-3 space-y-2 border-t border-gray-50">
                        {item.destinations.map((dest) => {
                          const isTabExpanded = mobileExpandedTab === dest.id;

                          return (
                            <div key={dest.id} className="rounded-lg overflow-hidden">
                              <button
                                onClick={() => setMobileExpandedTab(isTabExpanded ? null : dest.id)}
                                className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 text-gray-700 font-semibold text-[14px]"
                              >
                                <span>{dest.name}</span>
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform duration-200 ${isTabExpanded ? "rotate-180" : ""}`}
                                />
                              </button>

                              {isTabExpanded && (
                                <div className="pl-6 pr-3 py-2 space-y-3 bg-gray-50/30 rounded-b-lg">
                                  {dest.categories.map((cat, catIdx) => (
                                    <div key={catIdx} className="space-y-1.5">
                                      <h6 className="text-[11px] font-bold uppercase tracking-wide text-[#CC1422]">
                                        {cat.title}
                                      </h6>
                                      {cat.links.map((link, linkIdx) => (
                                        <Link
                                          key={linkIdx}
                                          to={link.to}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="block text-[13px] text-gray-500 hover:text-[#CC1422] py-1 border-l border-gray-200 pl-2 hover:border-[#CC1422]"
                                        >
                                          {link.label}
                                        </Link>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer (Utility details & language switcher) */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 text-gray-500 space-y-4">
              {/* Language / Currency Switcher for Mobile */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCurrencyOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-500" />
                  <span>{language} / {currency} ({currencySymbol})</span>
                </span>
                <ChevronRight size={14} className="text-gray-400" />
              </button>

              <div className="space-y-2.5">
                <a href={`tel:${phoneVal.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 text-sm hover:text-[#CC1422] transition-colors">
                  <Phone size={16} className="text-gray-400" />
                  <span>UAE: {phoneVal}</span>
                </a>
                <a href={`mailto:${emailVal}`} className="flex items-center gap-2.5 text-sm hover:text-[#CC1422] transition-colors">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{emailVal}</span>
                </a>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{contactDetails.address || "Dubai, UAE"}</span>
                </div>
              </div>

              {/* Social Icons for Mobile */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200/50">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#CC1422] hover:text-white text-gray-500 transition-all">
                    <FaFacebookF size={14} />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#CC1422] hover:text-white text-gray-500 transition-all">
                    <FaInstagram size={14} />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#CC1422] hover:text-white text-gray-500 transition-all">
                    <FaTwitter size={14} />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#CC1422] hover:text-white text-gray-500 transition-all">
                    <FaYoutube size={14} />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#CC1422] hover:text-white text-gray-500 transition-all">
                    <FaLinkedinIn size={14} />
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-[#CC1422] hover:text-white text-gray-500 transition-all">
                    <FaWhatsapp size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LANGUAGE & CURRENCY MODAL DIALOG ──────────────────────────── */}
      {isCurrencyOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsCurrencyOpen(false)}
          />

          {/* Popup Panel */}
          <div className="fixed left-1/2 -translate-x-1/2 top-[10vh] md:top-20 z-[1200] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-100 w-[92vw] max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[80vh] md:max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setIsCurrencyOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer z-10 bg-white/80 rounded-full p-1 shadow-sm"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row w-full overflow-y-auto">
              {/* ── LEFT: Languages ───────────────────────────────── */}
              <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 p-6 bg-gray-50/30">
                <h3 className="text-lg font-bold text-gray-900 mb-4 md:mb-5">Languages</h3>
                <div className="flex flex-row md:flex-col gap-2">
                  {["English", "Arabic"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsCurrencyOpen(false);
                      }}
                      className={`flex-1 md:w-full text-left px-4 py-2.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-all ${
                        language === lang
                          ? "border-gray-900 text-gray-900 bg-gray-100/50"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-white"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Currencies ─────────────────────────────── */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[400px] md:max-h-[520px]">
                {/* Popular Currencies */}
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Currencies</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {[
                    { code: "AED", name: "Arab Emirates Dirham" },
                    { code: "INR", name: "Indian Rupee" },
                    { code: "USD", name: "American Dollar" },
                  ].map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setIsCurrencyOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] cursor-pointer transition-all ${
                        currency === c.code
                          ? "border-gray-900 bg-gray-50 font-bold"
                          : "border-gray-200 hover:border-gray-400 hover:bg-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-gray-500 shrink-0">{c.code}</span>
                      <span className="text-gray-700 truncate">{c.name}</span>
                    </button>
                  ))}
                </div>

                {/* More Currencies */}
                <h3 className="text-lg font-bold text-gray-900 mb-4">More Currencies</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  ].map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setIsCurrencyOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] cursor-pointer transition-all ${
                        currency === c.code
                          ? "border-gray-900 bg-gray-50 font-bold"
                          : "border-gray-200 hover:border-gray-400 hover:bg-white"
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

      {/* ── SEARCH OVERLAY ───────────────────────────────────────────── */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;
