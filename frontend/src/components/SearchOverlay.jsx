import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowLeft, Sparkles, MapPin, 
  Binoculars, Palmtree, Ship, 
  ChevronRight, X, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { homeApi } from '../services/homeApi';
import { toCategoryRoute } from '../utils/mapping';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Activities');
  const [cities, setCities] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const categoryIcons = {
    'Activities': Binoculars,
    'Cruises': Ship,
    'Holidays': Palmtree,
  };

  // Fetch all categories & all products once when overlay opens
  useEffect(() => {
    if (isOpen) {
      homeApi.getCategories().then(setAllCategories).catch(console.error);
      homeApi.getProducts({ limit: 1000 }).then(setAllProducts).catch(console.error);
    }
  }, [isOpen]);

  // Fetch category-specific data when tab changes
  useEffect(() => {
    if (isOpen && allCategories.length > 0) {
      fetchCategoryData();
    }
  }, [isOpen, activeCategory, allCategories]);

  // Handle Local AI Search Suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        handleLocalSearch();
      } else {
        setSuggestions([]);
      }
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, allProducts]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const category = allCategories.find(c => 
        c.name.toLowerCase().includes(activeCategory.toLowerCase().replace('s', ''))
      );
      
      const params = { limit: 10 };
      if (category) params.category = category._id;

      const [citiesData, productsData] = await Promise.all([
        homeApi.getCities(),
        homeApi.getProducts(params)
      ]);

      setCities(citiesData.slice(0, 10));
      setTrendingProducts(productsData.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch category data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSearch = () => {
    setSearching(true);
    const query = searchQuery.toLowerCase().trim();
    
    // 1. Detect budget (e.g., "under 500", "less than 500", "500 aed", "budget 500")
    let maxBudget = null;
    const budgetMatch = query.match(/(?:under|less than|below|budget|max|up to)?\s*(\d+)\s*(?:aed|dhs|dirhams)?/i);
    if (budgetMatch) {
      const hasLimitIndicator = /under|less|below|budget|max|cheapest|cheap|up to/i.test(query) || query.includes("aed") || query.includes("dhs");
      if (hasLimitIndicator) {
        maxBudget = parseInt(budgetMatch[1], 10);
      }
    }

    // 2. Tokenize query words
    const queryTokens = query
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 1 && !["under", "less", "than", "below", "budget", "aed", "dhs", "dirham", "dirhams", "with", "tours", "tour", "and", "the", "for", "in"].includes(w));

    // 3. Score products
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      const matchReasons = [];

      const productName = (product.name || "").toLowerCase();
      const productDesc = (product.description || "").toLowerCase();
      const city = (product.city?.name || product.manualCity || "").toLowerCase();
      const categoryName = (product.category?.name || "").toLowerCase();

      const discountPrice = product.pricing?.discountPrice;
      const actualPrice = product.pricing?.actualPrice;
      const price = discountPrice ?? actualPrice ?? 0;

      // Budget scoring
      if (maxBudget !== null) {
        if (price <= maxBudget) {
          score += 70;
          matchReasons.push(`Under ${maxBudget} AED`);
        } else {
          score -= 120; // Penalize strongly if over budget
        }
      }

      // Exact phrase match in title
      if (productName.includes(query)) {
        score += 100;
        matchReasons.push("Title match");
      }

      // City matching
      if (city && query.includes(city)) {
        score += 80;
        matchReasons.push(`City: ${product.city?.name || product.manualCity}`);
      }

      // Category matching
      if (categoryName && (query.includes(categoryName) || query.includes(categoryName.replace('s', '')))) {
        score += 50;
        matchReasons.push(`Category: ${product.category?.name}`);
      }

      // Keyword token matching
      let tokensMatched = 0;
      queryTokens.forEach(token => {
        if (productName.includes(token)) {
          score += 30;
          tokensMatched++;
        } else if (productDesc.includes(token)) {
          score += 10;
          tokensMatched++;
        }
      });

      if (tokensMatched > 0 && matchReasons.length === 0) {
        matchReasons.push(`Matched ${tokensMatched} keywords`);
      }

      return {
        ...product,
        searchScore: score,
        matchReasons: matchReasons.slice(0, 2)
      };
    });

    const filtered = scoredProducts
      .filter(p => p.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 8);

    setSuggestions(filtered);
    setSearching(false);
  };

  const getHeadings = () => {
    switch (activeCategory) {
      case 'Cruises':
        return { 
          loc: 'Cruises from', 
          prod: 'Special Saver Cruise Packages',
          moreLoc: 18,
          moreProd: 4
        };
      case 'Holidays':
        return { 
          loc: 'Holidays in', 
          prod: 'Best Selling Holiday Deals',
          moreLoc: 12,
          moreProd: 6
        };
      default:
        return { 
          loc: 'Things to do in', 
          prod: 'Trending Activities',
          moreLoc: 12,
          moreProd: 4
        };
    }
  };

  const headings = getHeadings();

  const categoryRouteMap = {
    'Activities': '/activity',
    'Cruises': '/cruises',
    'Holidays': '/holiday'
  };
  const currentCategoryRoute = categoryRouteMap[activeCategory] || '/activity';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[999] bg-[#111118]/65 backdrop-blur-md flex justify-center items-start pt-[8vh] pb-[5vh] px-4 overflow-y-auto"
          onClick={onClose}
        >
          {/* Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_30px_70px_rgba(17,17,24,0.28)] border border-gray-100 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Section inside Card */}
            <div className="p-6 pb-4 bg-white border-b border-gray-100/80 space-y-4 shrink-0">
              <div className="flex items-center gap-4">
                {/* Search Input Bar */}
                <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3.5 transition-all focus-within:bg-white focus-within:border-[#CC1422] focus-within:shadow-[0_0_0_4px_rgba(204,20,34,0.1)]">
                  <Search size={20} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search for ${activeCategory.toLowerCase()}...`}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 font-bold placeholder-gray-400 text-base"
                  />
                  {searching ? (
                    <Loader2 size={18} className="text-[#CC1422] animate-spin" />
                  ) : searchQuery ? (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X size={18} />
                    </button>
                  ) : (
                    <Sparkles size={18} className="text-gray-400 animate-pulse" />
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-2xl transition-colors border border-gray-100"
                >
                  <X size={20} />
                </button>
              </div>



              {/* Category Tabs */}
              <div className="flex items-center gap-6 border-b border-gray-100 pt-1">
                {Object.keys(categoryIcons).map((name) => {
                  const Icon = categoryIcons[name];
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        setActiveCategory(name);
                        setSearchQuery('');
                      }}
                      className={`flex items-center gap-2 pb-3 transition-all relative cursor-pointer
                        ${activeCategory === name 
                          ? 'text-[#CC1422] font-bold' 
                          : 'text-gray-400 font-medium hover:text-gray-600'
                        }`}
                    >
                      <Icon size={16} className={activeCategory === name ? 'text-[#CC1422]' : 'text-gray-400'} />
                      <span className="text-sm">{name}</span>
                      {activeCategory === name && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#CC1422] rounded-full" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Body Section */}
            <div className="flex-1 overflow-y-auto max-h-[55vh] p-6 bg-gray-50/30">
              
              {searchQuery.trim().length > 1 ? (
                /* Live Search Results */
                <div>
                  <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Search Results for "{searchQuery}"
                  </h2>
                  {searching ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="text-[#CC1422] animate-spin" />
                      <p className="text-sm text-gray-500 font-medium animate-pulse">Searching the database...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                      {suggestions.map((item) => (
                        <Link
                          key={item._id}
                          to={`/${toCategoryRoute(item.category?.slug)}/${item.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200/80 transition-all group shadow-sm"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                            <img src={item.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#CC1422] transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} className="text-gray-400 shrink-0" /> 
                              <span className="truncate">{item.city?.name || item.manualCity}</span>
                            </p>
                            {item.matchReasons?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.matchReasons.map((reason, idx) => (
                                  <span key={idx} className="text-[9px] font-bold bg-[#CC1422]/10 text-[#CC1422] px-2 py-0.5 rounded-full uppercase tracking-wider scale-95 origin-left">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 font-medium">from</p>
                            <p className="text-sm font-bold text-gray-900">AED {(item.pricing?.discountPrice ?? item.pricing?.actualPrice ?? 0).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
                      <Binoculars size={40} className="text-gray-300 mb-3" />
                      <p className="text-base font-bold text-gray-900">No results found</p>
                      <p className="text-sm text-gray-500 mt-1">We couldn't find any tours matching "{searchQuery}". Try searching for something else!</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Categories & Locations Section */
                <div className="space-y-8 animate-in fade-in duration-200">
                  
                  {/* Cities/Locations Section */}
                  <section className={loading ? 'opacity-50 pointer-events-none' : ''}>
                    <h2 className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-4">{headings.loc}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {cities.map((city) => (
                        <Link 
                          key={city._id} 
                          to={`/tours?category=${activeCategory.toLowerCase()}&city=${city.slug}`}
                          onClick={onClose}
                          className="group flex items-center gap-3 p-2 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#CC1422] group-hover:text-white transition-all">
                            <MapPin size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[13px] font-bold text-gray-900 leading-tight truncate group-hover:text-[#CC1422] transition-colors">
                              {city.name}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                              {city.country_name || 'UAE'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>

                  {/* Products Section */}
                  <section className={loading ? 'opacity-50 pointer-events-none' : ''}>
                    <h2 className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-4">{headings.prod}</h2>
                    {loading ? (
                      <div className="py-12 flex items-center justify-center">
                        <Loader2 size={24} className="text-[#CC1422] animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {trendingProducts.map((product) => {
                          const discountPrice = product.pricing?.discountPrice;
                          const actualPrice = product.pricing?.actualPrice;
                          const finalPrice = discountPrice ?? actualPrice ?? 0;

                          const savePct = discountPrice && actualPrice && actualPrice > 0 && discountPrice < actualPrice
                            ? Math.round(((actualPrice - discountPrice) / actualPrice) * 100)
                            : 0;

                          return (
                            <Link 
                              key={product._id} 
                              to={`/${toCategoryRoute(product.category?.slug)}/${product.slug}`}
                              onClick={onClose}
                              className="group flex gap-4 p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-sm"
                            >
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative border border-gray-100">
                                <img 
                                  src={product.images?.[0] || 'https://via.placeholder.com/120'} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="text-[13px] font-bold text-gray-900 leading-snug mb-1 group-hover:text-[#CC1422] transition-colors truncate">
                                  {product.name}
                                </h3>
                                <div className="flex items-baseline gap-1.5 mb-0.5">
                                  <span className="text-[10px] text-gray-400 font-medium">from</span>
                                  {discountPrice && actualPrice && (
                                    <span className="text-[10px] text-gray-400 line-through font-medium">
                                      AED {actualPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-gray-900">
                                    AED {finalPrice.toLocaleString()}
                                  </span>
                                  {savePct > 0 && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md">
                                      Save {savePct}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </section>

                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
