import React, { useState } from "react";
import {
  Heart,
  Star,
  MapPin,
  Moon,
  Calendar,
  Map,
  Ship,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";

/**
 * TourCard — Universal card for the entire website.
 *
 * Props accepted (all optional — only rendered when provided):
 * ─────────────────────────────────────────────────────────────
 * @prop {string|string[]} image        - Single image URL or array of image URLs
 * @prop {string}          title        - Main title / card heading
 * @prop {string}          subtext      - Small subtitle below title (city cards)
 * @prop {number}          rating       - Star rating number
 * @prop {number}          reviews      - Number of reviews
 * @prop {number}          price        - Current price (AED)
 * @prop {number}          originalPrice- Original price before discount
 * @prop {number}          discountPercentage - % saved badge
 * @prop {boolean}         isNew        - Show "New" badge
 * @prop {string}          shipName     - Ship name (cruise cards)
 * @prop {string}          departure    - Departure city (cruise cards)
 * @prop {string}          duration     - Duration text e.g. "7 Nights" (cruise)
 * @prop {Array}           departures   - [{month, dates[]}] upcoming departure dates
 * @prop {string[]}        itinerary    - Array of port/stop names
 * @prop {string}          variant      - "city" | "cruise" | "activity" (auto-detected if omitted)
 * @prop {boolean}         hidePricing  - Force-hide the pricing block
 * @prop {boolean}         isGrid       - Use full-width grid layout instead of fixed scroll width
 * @prop {string}          slug         - Product slug for dynamic routing
 * @prop {string}          categorySlug - Category slug (e.g., 'activities', 'holidays')
 */
const TourCard = ({
  image,
  fallbackImage,
  title,
  subtext,
  rating,
  reviews,
  price,
  originalPrice,
  discountPercentage,
  isNew,
  shipName,
  departure,
  duration,
  departures,
  itinerary,
  variant,
  hidePricing = false,
  isGrid = false,
  slug,
  categorySlug,
  citySlug,
}) => {
  // ── Normalise images into an array ──────────────────────────────────────────
  const imageArray = Array.isArray(image)
    ? image
    : image
      ? [image]
      : [fallbackImage || "https://via.placeholder.com/600x400?text=Rayna+Tours"];

  const [currentImg, setCurrentImg] = useState(0);
  const { convertPrice, currencySymbol } = useLanguageCurrency();

  // ── Auto-detect variant ──────────────────────────────────────────────────────
  const isCruise =
    variant === "cruise" || !!(shipName || departure || duration || departures);
  const isCity = variant === "city" || (!isCruise && !title && !!subtext);

  // ── Derived flags ────────────────────────────────────────────────────────────
  const hasMultipleImages = imageArray.length > 1;
  const hasDiscount = originalPrice && discountPercentage;
  const hasReviews = rating > 0 && reviews > 0;
  const showPrice = !hidePricing && price != null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImg((p) => (p === 0 ? imageArray.length - 1 : p - 1));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImg((p) => (p === imageArray.length - 1 ? 0 : p + 1));
  };

  // ── Width class ──────────────────────────────────────────────────────────────
  const widthClass = isGrid
    ? "w-full"
    : isCruise
      ? "shrink-0 w-80 md:w-96"
      : isCity
        ? "shrink-0 w-52"
        : "shrink-0 w-72";

  // ── Image height ─────────────────────────────────────────────────────────────
  const imgHeight = isCruise ? "h-56" : isCity ? "h-48" : "h-48";

  // ── Card wrapper style ───────────────────────────────────────────────────────
  const wrapperClass = isCity
    ? "bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
    : isCruise
      ? "bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col"
      : "bg-white rounded-2xl";

  // ── Navigation Logic ────────────────────────────────────────────────────────
  const detailPath = slug && categorySlug ? `/${categorySlug}/${slug}` : null;
  const cityPath = isCity && citySlug ? `/city/${citySlug}` : null;

  const CardWrapper = ({ children }) => {
    const linkTo = cityPath || detailPath;
    if (!linkTo) {
      return (
        <div className={`group cursor-pointer ${widthClass} ${wrapperClass}`}>
          {children}
        </div>
      );
    }
    return (
      <Link to={linkTo} className={`group cursor-pointer block ${widthClass} ${wrapperClass}`}>
        {children}
      </Link>
    );
  };

  return (
    <CardWrapper>
      {/* ── Image Block ───────────────────────────────────────────────────── */}
      <div
        className={`relative ${imgHeight} w-full overflow-hidden ${isCity ? "m-2 rounded-2xl" : isCruise ? "" : "rounded-2xl"
          }`}
        style={isCity ? { width: "calc(100% - 16px)" } : {}}
      >
        <img
          src={imageArray[currentImg]}
          alt={title || subtext || "Tour"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const next = fallbackImage || "https://via.placeholder.com/600x400?text=Rayna+Tours";
            if (e.currentTarget.src !== next) e.currentTarget.src = next;
          }}
        />

        {/* Ship name badge (cruise) */}
        {shipName && (
          <div className="absolute top-3 left-3 bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold text-gray-700 shadow-sm z-10">
            {shipName}
          </div>
        )}

        {/* Wishlist heart — shown on non-city cards */}
        {!isCity && !hidePricing && (
          <button className="absolute top-3 right-3 z-10 transition-transform hover:scale-110">
            <Heart
              size={isCruise ? 24 : 18}
              className="text-white drop-shadow-md stroke-[1.5px]"
            />
          </button>
        )}

        {/* Image carousel controls — only when multiple images exist */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full text-white hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full text-white hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dot indicators */}
            <div className="absolute flex justify-center items-center gap-1.5 bottom-3 w-full">
              {imageArray.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 bg-white ${idx === currentImg ? "w-6 opacity-100" : "w-2 opacity-60"
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Content Block ─────────────────────────────────────────────────── */}
      <div
        className={`${isCity
          ? "p-4 pt-1 relative overflow-hidden"
          : isCruise
            ? "p-4 md:p-5 flex flex-col flex-grow"
            : "mt-3 space-y-1"
          }`}
      >
        {/* Title */}
        {title && (
          <h3
            className={`font-semibold leading-tight ${isCity
              ? "text-gray-800 text-sm mb-1 leading-4 md:leading-5 line-clamp-2"
              : isCruise
                ? "font-bold text-base text-gray-800 mb-2 line-clamp-2"
                : "text-sm md:text-base text-gray-800 truncate"
              }`}
          >
            {title}
          </h3>
        )}

        {/* Subtext / country (city cards) */}
        {subtext && (
          <p className="text-gray-400 text-xs font-medium">{subtext}</p>
        )}

        {/* ── "New" Badge ────────────────────────────────────────────────── */}
        {isNew && (
          <div className="flex items-center mt-1 mb-2">
            <span className="text-[14px] font-semibold">
              New
            </span>
          </div>
        )}

        {/* ── Cruise-specific info row ─────────────────────────────────── */}
        {isCruise && (shipName || departure || duration) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600 font-medium mb-4">
            {shipName && (
              <div className="flex items-center gap-1">
                <Ship size={14} strokeWidth={1.5} className="text-gray-500" />
                <span>{shipName}</span>
              </div>
            )}
            {departure && (
              <div className="flex items-center gap-1">
                <MapPin size={14} strokeWidth={1.5} className="text-gray-500" />
                <span>{departure}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Moon size={14} strokeWidth={1.5} className="text-gray-500" />
                <span>{duration}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Rating row ───────────────────────────────────────────────── */}
        {hasReviews && (
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-orange-300 text-orange-300" />
            <span className="font-bold text-gray-800">{rating}</span>
            <span className="text-gray-400">({reviews} Reviews)</span>
          </div>
        )}

        {/* ── Divider (cruise) ─────────────────────────────────────────── */}
        {isCruise && <div className="h-px w-full bg-gray-100 mb-4" />}

        {/* ── Upcoming Departures (cruise) ─────────────────────────────── */}
        {isCruise && departures && departures.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Calendar size={14} className="text-gray-600" />
              <span className="font-semibold text-xs text-gray-800">
                Upcoming Departures :
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2.5">
              {departures.map((dep, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    {dep.month}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dep.dates.map((date, dateIdx) => (
                      <span
                        key={dateIdx}
                        className="flex items-center justify-center w-6 h-6 rounded border border-gray-200 text-[10px] md:text-xs text-gray-700 bg-gray-50/50"
                      >
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Divider (cruise) ─────────────────────────────────────────── */}
        {isCruise && itinerary && itinerary.length > 0 && (
          <div className="h-px w-full bg-gray-100 mb-4" />
        )}

        {/* ── Itinerary (cruise) ───────────────────────────────────────── */}
        {isCruise && itinerary && itinerary.length > 0 && (
          <div className="mb-5 flex-grow">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Map size={14} className="text-gray-600" />
              <span className="font-semibold text-xs text-gray-800">
                Day Wise Itinerary
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {itinerary.map((stop, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full"
                >
                  {stop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Pricing block ────────────────────────────────────────────── */}
        {showPrice && (
          <div className={isCruise ? "mt-auto" : "pt-1"}>
            {isCruise ? (
              /* Cruise pricing layout */
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                  from
                </span>
                <span className="text-lg md:text-xl font-bold text-gray-800 leading-none mt-0.5">
                  {currencySymbol} {Math.floor(convertPrice(parseFloat(price)))}
                </span>
              </div>
            ) : (
              /* Activity/holiday pricing layout */
              <>
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-gray-400 font-medium">from</p>
                  {hasDiscount && (
                    <span className="text-gray-400 line-through text-sm">
                      {currencySymbol} {Math.floor(convertPrice(originalPrice))}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-left text-sm md:text-base line-clamp-1 text-gray-800">
                    {currencySymbol} {Math.floor(convertPrice(price))}
                  </p>
                  {hasDiscount && (
                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
                      Save {discountPercentage}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Hover arrow (city cards only) ────────────────────────────── */}
        {isCity && (
          <div className="absolute bottom-1 right-4 transition-all duration-300 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
            <ArrowRight size={18} className="text-gray-500" />
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

export default TourCard;
