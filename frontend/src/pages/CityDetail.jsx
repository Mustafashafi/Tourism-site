import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  MapPin,
  Check,
} from "lucide-react";
import { citiesApi } from "../services/citiesApi";
import { homeApi } from "../services/homeApi";
import { mapProductToCard } from "../utils/mapping";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import TourCard from "../components/TourCard";
import ExploreMore from "../components/ExploreMore";
import { homeTabs } from "../data/exploreMoreData/exploreMoreData";

// ─── Recently Viewed helpers ────────────────────────────────────
const RV_KEY = "rayna_recently_viewed";
const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(RV_KEY)) || [];
  } catch { return []; }
};

// ─── Hero Banner Carousel ───────────────────────────────────────
const HeroBanner = ({ slides, cityName }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-[95%] mx-auto mt-5 h-[320px] md:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#0f172a]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent z-[2]" />
        <div className="absolute inset-0 z-[3] flex flex-col justify-center px-6 md:px-12 max-w-[600px]">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-[0.7rem] font-bold text-white uppercase tracking-wider w-fit mb-3">
            <MapPin size={12} /> {cityName}
          </div>
          <h1 className="text-white text-2xl md:text-4xl font-extrabold leading-tight mb-2 drop-shadow-lg">
            Discover {cityName}
          </h1>
          <p className="text-white/80 text-sm md:text-base font-medium max-w-[420px] leading-relaxed">
            Explore top activities, attractions, and experiences in {cityName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[95%] mx-auto mt-5 h-[320px] md:h-[420px] rounded-2xl overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[current].url}
            alt={slides[current].title || cityName}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent z-[2]" />
      <div className="absolute inset-0 z-[3] flex flex-col justify-center px-6 md:px-12 max-w-[600px]">
        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-[0.7rem] font-bold text-white uppercase tracking-wider w-fit mb-3">
          <MapPin size={12} /> {cityName}
        </div>
        <motion.h1
          key={`title-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-2xl md:text-4xl font-extrabold leading-tight mb-2 drop-shadow-lg"
        >
          {slides[current].title || `Explore ${cityName}`}
        </motion.h1>
        {slides[current].subtext && (
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-wider mb-2"
          >
            {slides[current].subtext}
          </motion.p>
        )}
        {slides[current].description && (
          <motion.p
            key={`desc-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/80 text-sm md:text-base font-medium max-w-[420px] leading-relaxed mb-4"
          >
            {slides[current].description}
          </motion.p>
        )}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-bold px-6 py-3 rounded-lg w-fit uppercase tracking-wide hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => {
            const el = document.getElementById("city-activities-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Explore Activities
        </motion.button>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-[4]">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 ${
                idx === current ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Scroll Section wrapper ─────────────────────────────────────
const ScrollSection = ({ title, children, count }) => {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanLeft(scrollLeft > 0);
      setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  return (
    <div className="py-7 max-w-[97%] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-gray-900">
          {count != null && <span className="text-gray-500 font-semibold">{count} </span>}
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-700 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-25 disabled:cursor-not-allowed"
            disabled={!canLeft}
            onClick={() => scroll("left")}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-700 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-25 disabled:cursor-not-allowed"
            disabled={!canRight}
            onClick={() => scroll("right")}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto pb-3 snap-x scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ─── MAIN: CityDetail Page ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const CityDetail = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const { convertPrice, currencySymbol } = useLanguageCurrency();

  // ── Core State ────────────────────────────────────────────────
  const [city, setCity] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [bannerSlides, setBannerSlides] = useState([]);

  // ── UI State ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");

  // ── Fetch city data ───────────────────────────────────────────
  useEffect(() => {
    if (!citySlug) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [cityData, citiesList] = await Promise.all([
          citiesApi.getCityBySlug(citySlug),
          citiesApi.getAllCities(),
        ]);

        if (cancelled) return;

        if (!cityData) {
          setError("City not found.");
          setLoading(false);
          return;
        }

        setCity(cityData);
        setAllCities(
          citiesList.filter((c) => !c.status || c.status === "active")
        );

        const [productsData, reviewsData, slides] = await Promise.all([
          citiesApi.getProductsByCity(cityData._id, { limit: 50 }),
          citiesApi.getReviewsByCity(cityData._id),
          homeApi.getBannerSlides(),
        ]);

        if (cancelled) return;

        setProducts(productsData.products);
        setCategories(productsData.categories);
        setMeta(productsData.meta);
        setReviews(reviewsData.reviews);
        setReviewStats(reviewsData.stats);
        setBannerSlides(slides.length > 0 ? slides : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load city data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [citySlug]);

  // ── Filter products by category ───────────────────────────────
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(
      (p) => p.category?._id === activeCategory || p.category?.slug === activeCategory
    );
  }, [products, activeCategory]);

  // ── Top attractions (top-rated products) ──────────────────────
  const topAttractions = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }, [products]);

  // ── Recommended products ──────────────────────────────────────
  const recommended = useMemo(() => {
    return [...products]
      .filter((p) => (p.rating || 0) >= 3)
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 10);
  }, [products]);

  // ── Recently viewed (from localStorage) ───────────────────────
  const recentlyViewedProducts = useMemo(() => {
    const slugs = getRecentlyViewed();
    if (slugs.length === 0) return [];
    return products.filter((p) => slugs.includes(p.slug)).slice(0, 6);
  }, [products]);

  // ── City name helper ──────────────────────────────────────────
  const cityName = city?.city_name || city?.name || "";

  // ── Handle category change ────────────────────────────────────
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  // ── Pagination ────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 12;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const hasMore = paginatedProducts.length < filteredProducts.length;

  // ── LOADING STATE ─────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        {/* Hero skeleton */}
        <div className="w-[95%] mx-auto mt-5 h-[320px] md:h-[420px] rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-pulse" />
        <div className="max-w-[97%] mx-auto py-7">
          <div className="w-60 h-7 rounded-lg bg-gray-200 animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[280px] rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-[97%] mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">{error}</h2>
        <p className="text-gray-400 mb-6">The city you're looking for doesn't exist or couldn't be loaded.</p>
        <Link to="/" className="text-blue-600 font-semibold no-underline hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero Banner (mixed banners from all categories) ────── */}
      <HeroBanner slides={bannerSlides} cityName={cityName} />

      {/* ── Recently Viewed ────────────────────────────────────── */}
      {recentlyViewedProducts.length > 0 && (
        <ScrollSection title="Recently Viewed">
          {recentlyViewedProducts.map((product) => {
            const card = mapProductToCard(product);
            return (
              <div key={product._id} className="shrink-0 w-[270px] snap-start">
                <TourCard {...card} isGrid={false} variant="activity" />
              </div>
            );
          })}
        </ScrollSection>
      )}

      {/* ── Top Attractions ────────────────────────────────────── */}
      {topAttractions.length > 0 && (
        <ScrollSection title={`Top Attractions in ${cityName}`}>
          {topAttractions.map((product) => {
            const card = mapProductToCard(product);
            return (
              <div key={product._id} className="shrink-0 w-[270px] snap-start">
                <TourCard {...card} isGrid={false} variant="activity" />
              </div>
            );
          })}
        </ScrollSection>
      )}

      {/* ── All Activities Section with Category Tabs ──────────── */}
      <div className="py-7 max-w-[97%] mx-auto" id="city-activities-section">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">
            <span className="text-gray-500 font-semibold">{filteredProducts.length} </span>
            Activities in {cityName}
          </h2>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: "none" }}>
            <button
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all border-[1.5px] whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-800 hover:text-gray-800"
              }`}
              onClick={() => handleCategoryChange("all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all border-[1.5px] whitespace-nowrap ${
                  activeCategory === cat._id
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-800 hover:text-gray-800"
                }`}
                onClick={() => handleCategoryChange(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Activity Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
            {paginatedProducts.map((product) => {
              const card = mapProductToCard(product);
              return (
                <TourCard
                  key={product._id}
                  {...card}
                  isGrid={true}
                  variant="activity"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No activities found in this category.</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-6">
            <button
              className="px-10 py-3 rounded-lg border-[1.5px] border-gray-800 bg-white text-gray-800 text-sm font-bold cursor-pointer transition-all hover:bg-gray-800 hover:text-white"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Load More Activities
            </button>
          </div>
        )}
      </div>

      {/* ── Recommended things to do ──────────────────────────── */}
      {recommended.length > 0 && (
        <ScrollSection title="Recommended things to do">
          {recommended.map((product) => {
            const card = mapProductToCard(product);
            return (
              <div key={product._id} className="shrink-0 w-[270px] snap-start">
                <TourCard {...card} isGrid={false} variant="activity" />
              </div>
            );
          })}
        </ScrollSection>
      )}

      {/* ── Customer Reviews ──────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="py-7 max-w-[97%] mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900">
              Customer Reviews
              {reviewStats.totalReviews > 0 && (
                <span className="ml-3 text-sm font-semibold text-gray-500">
                  <Star size={14} className="inline fill-amber-400 text-amber-400 align-[-2px]" />
                  {" "}{reviewStats.avgRating.toFixed(1)} ({reviewStats.totalReviews} reviews)
                </span>
              )}
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x scroll-smooth" style={{ scrollbarWidth: "none" }}>
            {reviews.map((review) => (
              <div
                key={review._id}
                className="shrink-0 w-[340px] md:w-[360px] bg-white border border-gray-100 rounded-2xl p-5 snap-start transition-all hover:border-gray-200 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {review.userImage ? (
                      <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      review.userName?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{review.userName}</div>
                    <div className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                    />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-gray-700">{review.rating}/5</span>
                </div>
                {/* Comment */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{review.comment}</p>
                {review.product?.name && (
                  <p className="mt-2 text-xs text-gray-400 font-medium">📍 {review.product.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Explore More ──────────────────────────────────────── */}
      <ExploreMore tabsData={homeTabs} />
    </div>
  );
};

export default CityDetail;
