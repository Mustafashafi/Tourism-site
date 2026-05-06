import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { homeApi } from "../services/homeApi";

import { toCategoryRoute } from "../utils/mapping";
import {
  Star, MapPin, Clock, ChevronLeft, ChevronRight, Check, X,
  FileText, Phone, Calendar, Shield, ChevronDown, ChevronUp,
  Loader2, AlertTriangle, Ship, Users, Info, BookOpen,
  Zap, Smartphone, Globe, History, Map, ShieldCheck, Languages,
  HelpCircle, Heart, RotateCcw, ThumbsUp, MessageSquare, ListFilter, Image as ImageIcon, Send, Share
} from "lucide-react";
import { reviewApi } from "../services/reviewApi";
import ReviewSummary from "../components/Review/ReviewSummary";
import ReviewItem from "../components/Review/ReviewItem";
import ReviewForm from "../components/Review/ReviewForm";
import ExploreMore from "../components/ExploreMore";
import { homeTabs, holidayTabs, visaTabs, cruiseTabs } from "../data/exploreMoreData/exploreMoreData";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";
import { useCart } from "../context/CartContext";

const ICON_MAP = {
  Clock, Zap, Smartphone, Globe, History, Map, ShieldCheck, Languages, Check, Star, Info, Shield, Ship, Users, Heart, RotateCcw, MapPin
};

const DynamicIcon = ({ name, size = 16, className = "" }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};


// ─── Utility ────────────────────────────────────────────────────────────────
const categoryLabel = (slug = "") => {
  const s = (slug || "").toLowerCase();
  if (s.includes("activit") || s.includes("tour")) return "Activities";
  if (s.includes("holiday")) return "Holidays";
  if (s.includes("cruise")) return "Cruises";
  if (s.includes("visa")) return "Visas";
  return slug;
};

const TABS = {
  OVERVIEW: "Overview",
  ITINERARY: "Itinerary",
  INCLUSIONS: "Inclusions",
  VISA: "Requirements",
  FAQ: "FAQ",
  POLICY: "Policy",
};

// ─── Simple date picker calendar for direct-booking ─────────────────────────
function BookingCalendar({ product, price, currency = "AED" }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(null);
  const [guests, setGuests] = useState({ adult: 1, child: 0, infant: 0 });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isPast = (d) => new Date(year, month, d) < new Date(today.setHours(0, 0, 0, 0));
  const isSelected = (d) =>
    selected?.d === d && selected?.m === month && selected?.y === year;

  const childPrice = product?.pricing?.childPrice != null ? product.pricing.childPrice : price;
  const infantPrice = product?.pricing?.infantPrice != null ? product.pricing.infantPrice : 0;

  const updateGuests = (type, delta) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(type === 'adult' ? 1 : 0, prev[type] + delta)
    }));
  };

  const totalRaw = price ? (
    (guests.adult * price) +
    (guests.child * childPrice) +
    (guests.infant * infantPrice)
  ) : 0;
  
  const total = totalRaw.toLocaleString();
  const totalGuests = guests.adult + guests.child + guests.infant;

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{monthName}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[10px] font-semibold text-gray-400 uppercase">
            {d}
          </span>
        ))}
        {/* Blank offset cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const past = isPast(day);
          const sel = isSelected(day);
          return (
            <button
              key={day}
              disabled={past}
              onClick={() => setSelected({ d: day, m: month, y: year })}
              className={`text-xs py-1.5 rounded-lg font-medium transition-all
                ${past ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-50 cursor-pointer"}
                ${sel ? "bg-orange-500 text-white hover:bg-orange-500 shadow-md" : "text-gray-700"}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Guests */}
      <div className="space-y-2">
        {[
          { id: 'adult', label: 'Adult' },
          { id: 'child', label: 'Child' },
          { id: 'infant', label: 'Infant' }
        ].map((row) => (
          <div key={row.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users size={15} className="text-gray-400" />
              <span>{row.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateGuests(row.id, -1)}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors text-lg leading-none"
              >
                −
              </button>
              <span className="text-sm font-semibold w-4 text-center">{guests[row.id]}</span>
              <button
                onClick={() => updateGuests(row.id, 1)}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {selected && total && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-600">Total ({totalGuests} guest{totalGuests > 1 ? "s" : ""})</span>
          <span className="text-base font-bold text-orange-600">
            {currency} {total}
          </span>
        </div>
      )}

      <button
        disabled={!selected}
        onClick={() => {
          if (!selected) return;
          addToCart(product, {
            date: new Date(year, month, selected.d).toISOString(),
            guests,
            totalPrice: totalRaw
          });
        }}
        className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all
          ${selected
            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-[.98]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
      >
        {selected ? "Add to Cart" : "Select a Date"}
      </button>
    </div>
  );
}

// ─── FAQ Item ────────────────────────────────────────────────────────────────
// function FaqItem({ question, answer }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="border border-gray-200 rounded-xl overflow-hidden">
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4"
//       >
//         <span className="text-sm font-semibold text-gray-800">{question}</span>
//         {open ? (
//           <ChevronUp size={16} className="text-gray-400 shrink-0" />
//         ) : (
//           <ChevronDown size={16} className="text-gray-400 shrink-0" />
//         )}
//       </button>
//       {open && (
//         <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
//           <div className="pt-3">{answer}</div>
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Gallery ─────────────────────────────────────────────────────────────────
function Gallery({ images }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const safeImages =
    images?.length > 0
      ? images
      : ["https://via.placeholder.com/900x500?text=No+Image"];

  // Left = index 0; Right grid = indices 1-4 (up to 4 cells shown)
  const heroImg = safeImages[0];
  const gridImgs = safeImages.slice(1, 5); // max 4 in right grid
  const extraCount = safeImages.length - 5; // images beyond what's shown

  const openLightbox = (i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const prevLightbox = () =>
    setLightboxIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  const nextLightbox = () =>
    setLightboxIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));

  // Close on backdrop click / Escape
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) setLightboxOpen(false);
  };

  return (
    <>
      {/* ── Mosaic grid ──────────────────────────────────────────────────── */}
      <div className="relative flex gap-2 rounded-2xl overflow-hidden h-[340px] md:h-[420px] lg:h-[460px] group/gallery">
        {/* Hero image — left half */}
        <div
          className="relative flex-1 cursor-pointer group overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <img
            src={heroImg}
            alt="Main"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/900x500?text=No+Image";
            }}
          />
          {/* subtle dark gradient at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Right 2×2 grid — only shown if there are additional images */}
        {gridImgs.length > 0 && (
          <div className="flex flex-col gap-2 w-[48%]">
            {/* Top row */}
            <div className="flex gap-2 flex-1">
              {gridImgs.slice(0, 2).map((img, i) => (
                <div
                  key={i}
                  className="relative flex-1 cursor-pointer group overflow-hidden rounded-sm"
                  onClick={() => openLightbox(i + 1)}
                >
                  <img
                    src={img}
                    alt={`Photo ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x250?text=Photo";
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex gap-2 flex-1">
              {gridImgs.slice(2, 4).map((img, i) => {
                const globalIdx = i + 3; // 3rd and 4th grid cell = index 3 & 4
                const isLast = i === gridImgs.slice(2, 4).length - 1;
                const showOverlay = isLast && extraCount > 0;

                return (
                  <div
                    key={i}
                    className="relative flex-1 cursor-pointer group overflow-hidden rounded-sm"
                    onClick={() => openLightbox(globalIdx)}
                  >
                    <img
                      src={img}
                      alt={`Photo ${globalIdx + 1}`}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${showOverlay ? "brightness-50" : ""
                        }`}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x250?text=Photo";
                      }}
                    />
                    {/* Extra count overlay on last cell */}
                    {showOverlay && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                        onClick={() => openLightbox(globalIdx)}
                      >
                        <span className="text-white font-bold text-xl md:text-2xl drop-shadow">
                          + {extraCount} Images
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View Gallery button — sits at right bottom corner of the gallery */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => openLightbox(0)}
            className="flex items-center gap-2 text-xs md:text-sm text-gray-700 bg-white/95 hover:bg-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            Show all photos ({safeImages.length})
          </button>
        </div>
      </div>




      {/* ── Lightbox Modal ────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleBackdrop}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {lightboxIndex + 1} / {safeImages.length}
          </div>

          {/* Prev */}
          <button
            onClick={prevLightbox}
            className="absolute left-3 md:left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={safeImages[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/900x500?text=No+Image";
              }}
            />
          </div>

          {/* Next */}
          <button
            onClick={nextLightbox}
            className="absolute right-3 md:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Thumbnail strip */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide">
              {safeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all
                    ${i === lightboxIndex
                      ? "border-orange-500 scale-110 shadow-lg"
                      : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Itinerary Timeline Card ───────────────────────────────────────────────────
function ItineraryDay({ item, isLast }) {
  let imgSrc = null;
  let cleanDescription = item.description || "";

  if (cleanDescription) {
    // Try to match an image wrapped in a p tag first
    const imgContainerRegex = /<p>\s*(<img[^>]+src="([^">]+)"[^>]*>)\s*<\/p>/i;
    const containerMatch = cleanDescription.match(imgContainerRegex);

    if (containerMatch) {
      imgSrc = containerMatch[2];
      cleanDescription = cleanDescription.replace(containerMatch[0], '');
    } else {
      // Fallback: match just the img tag
      const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/i;
      const match = cleanDescription.match(imgRegex);
      if (match) {
        imgSrc = match[1];
        cleanDescription = cleanDescription.replace(match[0], '');
      }
    }
  }

  return (
    <div className="relative flex gap-4 md:gap-5 pb-10">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[1.125rem] md:left-[1.375rem] top-10 bottom-0 w-px bg-gray-200"></div>
      )}

      {/* Day Badge */}
      <div className="relative z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#2d2d2d] text-white font-bold text-[10px] md:text-xs flex items-center justify-center shrink-0 shadow-sm">
        Day {item.day}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0">
        <div className="flex items-center gap-3 mb-3">
          {imgSrc && (
            <img
              src={imgSrc}
              alt={item.title}
              className="w-20 h-14 md:w-24 md:h-16 object-cover rounded-xl shadow-sm shrink-0"
            />
          )}
          <h3 className="text-sm md:text-base font-bold text-gray-800 uppercase tracking-wide">
            {item.title}
          </h3>
        </div>

        {cleanDescription && (
          <div
            className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed rich-text-itinerary"
            dangerouslySetInnerHTML={{ __html: cleanDescription }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currency: selectedCurrency, convertPrice, currencySymbol } = useLanguageCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState([0]); // First section open by default
  const [reviews, setReviews] = useState([]);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("Top Reviews");
  const [filterBy, setFilterBy] = useState(null); // null, '4+', '3', '<3', 'images'
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [dynamicExploreTabs, setDynamicExploreTabs] = useState([]);

  const sidebarRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);
    setError("");
    setProduct(null);
    homeApi
      .getProductBySlug(slug)
      .then((data) => {
        if (!data) throw new Error("Product not found.");
        setProduct(data);
        fetchReviews(data._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product?.category?._id) {
      homeApi.getProductsGroupedByCity(product.category._id).then(res => {
        const tabs = res.groupedByCity.map(group => ({
          cityName: group.cityName,
          tabHeading: `More in ${group.cityName}`,
          icon: "MapPin",
          links: group.products
            .filter(p => p._id !== product._id)
            .map(p => ({
              label: p.name,
              url: `/${toCategoryRoute(product.category.slug)}/${p.slug}`
            }))
        })).filter(tab => tab.links.length > 0);

        const productCity = product.city?.name || product.manualCity;
        if (productCity) {
          tabs.sort((a, b) => {
            if (a.cityName === productCity) return -1;
            if (b.cityName === productCity) return 1;
            return 0;
          });
        }

        setDynamicExploreTabs(tabs);
      }).catch(err => {
        console.error("Failed to load related products", err);
      });
    }
  }, [product]);

  const fetchReviews = async (productId) => {
    setReviewLoading(true);
    try {
      const response = await reviewApi.getProductReviews(productId);
      const reviewsData = response.data || [];
      setReviews(reviewsData);
      setSortedReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    console.log("Submitting review for product ID:", product?._id);
    console.log("Review Data:", reviewData);
    setIsSubmittingReview(true);
    try {
      if (!product?._id) throw new Error("Product ID is missing.");
      await reviewApi.submitReview(product._id, reviewData);
      fetchReviews(product._id);
      // Update product local state for immediate feedback
      setProduct(prev => ({
        ...prev,
        reviews: (prev.reviews || 0) + 1,
        rating: ((prev.rating * prev.reviews) + reviewData.rating) / (prev.reviews + 1)
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    let sorted = [...reviews];

    // Apply Filter first
    if (filterBy === "4+") {
      sorted = sorted.filter(r => r.rating >= 4);
    } else if (filterBy === "3") {
      sorted = sorted.filter(r => r.rating === 3);
    } else if (filterBy === "<3") {
      sorted = sorted.filter(r => r.rating < 3);
    } // 'images' filter ignored as per user request

    // Then Sort
    if (sortBy === "Most Recent") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "Highest Rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Lowest Rating") {
      sorted.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "Oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default / Top Reviews (highest rating first)
      sorted.sort((a, b) => b.rating - a.rating);
    }
    setSortedReviews(sorted);
    setVisibleReviewsCount(3); // Reset visible reviews when filter/sort changes
  }, [sortBy, filterBy, reviews]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 size={36} className="animate-spin text-orange-400" />
        <p className="text-sm font-medium">Loading product details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle size={40} className="text-orange-400" />
        <h2 className="text-lg font-bold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">{error || "We couldn't find this product."}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const pricing = product.pricing || {};
  const actualPriceAED = pricing.actualPrice ?? 0;
  const discountPriceAED = pricing.discountPrice;
  const actualPrice = Math.round(convertPrice(actualPriceAED));
  const discountPrice = typeof discountPriceAED === "number" ? Math.round(convertPrice(discountPriceAED)) : undefined;
  const currency = currencySymbol;
  const displayPrice = discountPrice ?? actualPrice;
  const hasDiscount = typeof discountPrice === "number" && discountPrice < actualPrice;
  const savePct = hasDiscount
    ? Math.round(((actualPrice - discountPrice) / actualPrice) * 100)
    : null;

  const catSlug = product.category?.slug || "";
  const catRoute = toCategoryRoute(catSlug);
  const catName = categoryLabel(catSlug);
  const hasRating = product.rating > 0 && product.reviews > 0;
  const isCruise = catRoute === "cruises";
  const isVisa = catRoute === "visas";
  const isHoliday = catRoute === "holidays";
  const isBookNow = product.bookingType === "book_now";
  const isCheckAvailability = product.bookingType === "check_availability";
  const isEmailOnly = product.bookingType === "email";

  // ── Determine available tabs ───────────────────────────────────────────────
  const availableTabs = [TABS.OVERVIEW];
  if ((isCruise || isHoliday) && product.itinerary?.length > 0) availableTabs.push(TABS.ITINERARY);
  if (product.inclusions?.length > 0 || product.exclusions?.length > 0) availableTabs.push(TABS.INCLUSIONS);
  if (isVisa && (product.documentsRequired?.length > 0 || product.applicationSteps?.length > 0))
    availableTabs.push(TABS.VISA);
  if (product.faq?.length > 0) availableTabs.push(TABS.FAQ);
  if (product.guestPolicy || product.importantInformation) availableTabs.push(TABS.POLICY);

  const exploreTabs =
    isHoliday ? holidayTabs :
      isCruise ? cruiseTabs :
        isVisa ? visaTabs :
          homeTabs;

  const finalExploreTabs = dynamicExploreTabs.length > 0 ? dynamicExploreTabs : exploreTabs;

  return (
    <div className="min-h-screen">
      {/* Inline styles for rich text images */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .rich-text-itinerary img {
          display: block;
          max-width: 100%;
          max-height: 400px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .rich-text-itinerary p {
          margin-bottom: 12px;
        }
        .rich-text img {
          display: block;
          width: 100%;
          border-radius: 12px;
          margin-top: 16px;
          margin-bottom: 16px;
        }
      `}} />
      <div className="bg-white">
        <div className="max-w-[97%] mx-auto px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="cursor-pointer font-medium">Home</Link>
            <span>/</span>
            <Link to={`/${catRoute}`} className="cursor-pointer font-medium capitalize">
              {catName}
            </Link>
            <span>/</span>
            {product.city?.name && (
              <>
                <span className="font-medium text-gray-400">{product.city.name}</span>
                <span>/</span>
              </>
            )}
            <span className="text-gray-800 font-semibold truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 cursor-pointer font-medium">
              <Share size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 cursor-pointer font-medium">
              <Heart size={16} />
              <span>Add to Wishlist</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[97%] mx-auto px-4 py-4 space-y-6">

        {/* ── FULL-WIDTH GALLERY ──────────────────────────────────────────── */}
        <Gallery images={product.images} />

        {/* ── TWO-COLUMN CONTENT GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN: Title + Tabs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title block */}
            <div className="bg-white rounded-2xl p-4">


              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-700 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                {hasRating && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-amber-500 text-amber-500" />
                      <span className="text-base font-bold text-gray-800">{Number(product.rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      ({product.reviews?.toLocaleString()} Reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">

                {product.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-400" />
                    {product.duration}
                  </span>
                )}
                {isCruise && product.cruiseLine && (
                  <span className="flex items-center gap-1.5">
                    <Ship size={14} className="text-orange-400" />
                    {product.cruiseLine}
                  </span>
                )}
                {isCruise && product.departureCity && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-400" />
                    Departure: {product.departureCity}
                  </span>
                )}
              </div>

              {/* Meta row remains here or we can merge it above, but keeping it for now as per current structure but refined */}

            </div>

            {/* ── Highlights Grid (Outside Tabs) ─────────────────────────────── */}
            {product.highlights?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.highlights.map((h, i) => {
                  // Generate some subtle colors for the icon background
                  const bgColors = [
                    "bg-emerald-50 text-emerald-600",
                    "bg-blue-50 text-blue-600",
                    "bg-orange-50 text-orange-600",
                    "bg-purple-50 text-purple-600",
                    "bg-rose-50 text-rose-600",
                    "bg-amber-50 text-amber-600",
                  ];
                  const colorClass = bgColors[i % bgColors.length];

                  return (
                    <div key={i} className="flex items-center gap-4 p-2 transition-all">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <DynamicIcon name={h.icon} size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-gray-900">{h.title}</p>
                        {h.description && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed truncate md:whitespace-normal">
                            {h.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}




            {/* ── Itinerary Timeline (Accordion) ────────────────────────────────────────── */}
            {product.itinerary?.length > 0 && (
              <div className="bg-gray-50/50 rounded-2xl overflow-hidden transition-all duration-300 mb-4">
                <button
                  onClick={() => setIsItineraryOpen(!isItineraryOpen)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100/50 transition-colors group"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-1.5 h-6 bg-orange-500 rounded-full transition-all duration-300 ${isItineraryOpen ? "scale-y-100" : "scale-y-75 opacity-50"}`} />
                    Tour Itinerary
                  </h2>
                  <div className={`p-2 rounded-full bg-white shadow-sm border border-gray-100 transition-transform duration-300 ${isItineraryOpen ? "rotate-180" : ""}`}>
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </button>

                <AnimatePresence>
                  {isItineraryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 md:px-8 pb-6 overflow-hidden break-words">
                        {product.itinerary.map((item, idx) => (
                          <ItineraryDay
                            key={idx}
                            item={item}
                            isLast={idx === product.itinerary.length - 1}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Content Sections (Accordion) ─────────────────────────── */}
            {product.contentSections?.length > 0 && (
              <div className="space-y-4 py-2">
                {product.contentSections.map((sec, i) => {
                  const isOpen = openSections.includes(i);
                  const toggleSection = () => {
                    setOpenSections(prev =>
                      prev.includes(i)
                        ? prev.filter(idx => idx !== i)
                        : [...prev, i]
                    );
                  };

                  return (
                    <div key={i} className="bg-gray-50/50 rounded-2xl overflow-hidden transition-all duration-300">
                      {/* Header/Toggle Button */}
                      <button
                        onClick={toggleSection}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100/50 transition-colors group"
                      >
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <span className={`w-1.5 h-6 bg-orange-500 rounded-full transition-all duration-300 ${isOpen ? "scale-y-100" : "scale-y-75 opacity-50"}`} />
                          {sec.title}
                        </h2>
                        <div className={`p-2 rounded-full bg-white shadow-sm border border-gray-100 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                          <ChevronDown size={18} className="text-gray-500" />
                        </div>
                      </button>

                      {/* Expandable Content */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div
                              className="px-6 pb-6 text-[15px] text-gray-600 leading-relaxed rich-text"
                              dangerouslySetInnerHTML={{ __html: sec.description }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}



            {/* ── Location Section ────────────────────────────────────────── */}
            {product.mapAddress && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-5">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                  Location
                </h2>

                <div className="bg-white rounded-2xl p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-800 leading-tight mb-1">
                        {product.mapAddress}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">
                        {product.location}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-[350px] rounded-2xl overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(product.mapAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                </div>
              </div>
            )}

            {/* ── Reviews Section ────────────────────────────────────────── */}
            <div className="mt-12 space-y-10 pb-12">
              <div className="flex items-center justify-between px-5">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  What our customers say
                </h2>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                  <MessageSquare size={16} />
                  {reviews.length} Reviews
                </div>
              </div>


              <div className="space-y-10 px-5">
                <div className="w-full">
                  <ReviewSummary
                    rating={product.rating}
                    totalReviews={product.reviews}
                    reviews={reviews}
                  />
                </div>

                {/* Visual Filters & Sort */}
                <div className="space-y-4 px-5">
                  <h4 className="text-lg font-bold text-gray-900 capitalize">Customer reviews</h4>
                  <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-gray-50 -mx-5 px-5">
                    <div className="flex flex-wrap gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-300 transition-all shadow-sm">
                        <ImageIcon size={14} /> With Images
                      </button>
                      <button
                        onClick={() => setFilterBy(filterBy === "4+" ? null : "4+")}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${filterBy === "4+" ? "bg-[#2D2D2D] text-white border-transparent" : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                          }`}
                      >
                        <Star size={14} /> 4+ Stars
                      </button>
                      <button
                        onClick={() => setFilterBy(filterBy === "3" ? null : "3")}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${filterBy === "3" ? "bg-[#2D2D2D] text-white border-transparent" : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                          }`}
                      >
                        <Star size={14} /> 3 Stars
                      </button>
                      <button
                        onClick={() => setFilterBy(filterBy === "<3" ? null : "<3")}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${filterBy === "<3" ? "bg-[#2D2D2D] text-white border-transparent" : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                          }`}
                      >
                        <Star size={14} /> &lt; 3 Stars
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setShowSort(!showSort)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[13px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        {sortBy} {showSort ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <AnimatePresence>
                        {showSort && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setShowSort(false)}
                            ></div>
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-[24px] shadow-2xl shadow-gray-200/50 border border-gray-50 z-50 p-3 space-y-1"
                            >
                              {["Top Reviews", "Most Recent", "Highest Rating", "Lowest Rating", "Oldest"].map((option) => (
                                <button
                                  key={option}
                                  onClick={() => {
                                    setSortBy(option);
                                    setShowSort(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${sortBy === option
                                    ? "bg-[#2D2D2D] text-white border-transparent shadow-lg shadow-gray-200"
                                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                                    }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* 2. Review Form (Collapsible Row) */}
                <div className="w-full space-y-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white text-[13px] font-extrabold rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <MessageSquare size={16} />
                      {showReviewForm ? "Cancel Review" : "Write a Review"}
                      <ChevronDown size={16} className={`transition-transform duration-300 ${showReviewForm ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ReviewForm
                          onSubmit={(data) => {
                            handleReviewSubmit(data);
                            setShowReviewForm(false);
                          }}
                          loading={isSubmittingReview}
                          currentUser={null}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Review List (Full Width Row) */}
                <div className="w-full space-y-4">
                  {/* Review List */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-lg">Recent Feedback</h4>

                    {reviewLoading ? (
                      <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                      </div>
                    ) : sortedReviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="divide-y divide-gray-50">
                          {sortedReviews.slice(0, visibleReviewsCount).map(review => (
                            <ReviewItem key={review._id} review={review} />
                          ))}
                        </div>
                        {visibleReviewsCount < sortedReviews.length && (
                          <div className="pt-2 pb-4 flex justify-center border-t border-gray-50">
                            <button
                              onClick={() => setVisibleReviewsCount(prev => prev + 3)}
                              className="px-6 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-[13px] font-bold rounded-xl transition-colors shadow-sm active:scale-95"
                            >
                              Load More Reviews
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-400">No reviews yet. Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Sticky Sidebar ─────────────────────────── */}
          <div className="lg:col-span-1">
            <div
              ref={sidebarRef}
              className="bg-white rounded-2xl border border-gray-200 lg:sticky lg:top-24 overflow-hidden"
            >

              {/* ── Price + CTA  */}
              <div className="p-5">
                <p className="text-xs text-gray-500 font-medium mb-1">From:</p>

                <div className="flex items-end gap-3 flex-wrap mb-1">
                  <span className="text-2xl font-extrabold text-gray-900">
                    {currency}{" "}
                    {displayPrice?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400 line-through">
                      {currency}{" "}
                      {actualPrice?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-md">
                      Save {savePct}%
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    {/* Primary Action Button */}
                    <button
                      onClick={() => {
                        if (isBookNow || isCheckAvailability) {
                          navigate(`/booking/${product.slug}`);
                        } else {
                          // Handle email inquiry (e.g. open whatsapp)
                          window.open(`https://wa.me/97142087444?text=I am interested in ${product.name}`, '_blank');
                        }
                      }}
                      className="flex-1 py-3.5 rounded-xl font-bold text-[15px] tracking-wide bg-[#2D2D2D] hover:bg-black text-white active:scale-[.98] transition-all shadow-sm"
                    >
                      {isBookNow ? "Book Now" : isCheckAvailability ? "Check Availability" : "Book Now"}
                    </button>

                    {/* Secondary Action Icons */}
                    <div className="flex items-center gap-2">
                      {!isCheckAvailability && (
                        <>
                          <a
                            href="tel:+97142087444"
                            className="w-[48px] h-[48px] rounded-full bg-[#EBF5FF] hover:bg-blue-100 flex items-center justify-center transition-colors"
                            title="Call Us"
                          >
                            <Phone size={20} className="text-[#3B82F6] fill-[#3B82F6]" />
                          </a>

                          {isBookNow && (
                            <a
                              href="mailto:info@raynatours.com"
                              className="w-[48px] h-[48px] rounded-full bg-[#F0F9FF] hover:bg-sky-100 flex items-center justify-center transition-colors"
                              title="Email Us"
                            >
                              <div className="bg-[#FF8A00] p-1 rounded-md">
                                <Send size={16} className="text-white fill-white" />
                              </div>
                            </a>
                          )}

                          <a
                            href="https://wa.me/97142087444"
                            className="w-[48px] h-[48px] rounded-full bg-[#F0FFF4] hover:bg-green-100 flex items-center justify-center transition-colors"
                            title="WhatsApp Us"
                          >
                            <svg viewBox="0 0 24 24" width="24" height="24" className="text-[#25D366] fill-[#25D366]">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mx-0" />

              {/* ── Why choose Rayna Tours? ───────────────────────────────── */}
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">
                  Why choose Rayna Tours?
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      emoji: "🪙",
                      title: "Best Price Guarantee",
                      desc: "Always the best deal—book with total confidence.",
                    },
                    {
                      emoji: "🛡️",
                      title: "Secure Online Transaction",
                      desc: "Your transactions are protected with advanced encryption.",
                    },
                    {
                      emoji: "💬",
                      title: "24X7 Live Chat Support",
                      desc: "Real humans, ready to help anytime.",
                    },
                    {
                      emoji: "👍",
                      title: "Happy Travelers Worldwide",
                      desc: "Trusted by millions of happy travelers.",
                    },
                  ].map(({ emoji, title, desc }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5 shrink-0">{emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
      <ExploreMore tabsData={finalExploreTabs} />
    </div>
  );
};

export default ProductDetail;
