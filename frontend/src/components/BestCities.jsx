import React, { useMemo, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import TourCard from "./TourCard";
import { citiesApi } from "../services/citiesApi";

export default function BestCities({
  mainHeading = "Best Cities to Visit",
  cardHeadingPrefix = "Things to do in",
  category,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const location = useLocation();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fallbackImage = "https://via.placeholder.com/600x400?text=Carthage+Tours";

  const currentCategory = useMemo(() => {
    if (typeof category === "string" && category.trim()) return category.trim().toLowerCase();
    const path = location?.pathname?.toLowerCase?.() || "";
    if (path === "/" || path.includes("activity") || path.includes("activities")) return "activity";
    if (path.includes("holiday") || path.includes("holidays")) return "holiday";
    if (path.includes("cruise") || path.includes("cruises")) return "cruise";
    return "";
  }, [category, location?.pathname]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [cities]);

  useEffect(() => {
    if (!currentCategory) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await citiesApi.getBestCities(currentCategory);
        if (cancelled) return;
        // Don’t clear first (prevents blinking). Replace once we have data.
        setCities(
          (Array.isArray(result) ? result : []).filter((c) => {
            const catsRaw = c?.categories ?? c?.category ?? [];
            const cats = Array.isArray(catsRaw) ? catsRaw : catsRaw ? [catsRaw] : [];
            const isInCategory = cats.map((x) => String(x || "").toLowerCase()).some(cat => {
              const cleanCat = cat.trim();
              return cleanCat === currentCategory ||
                     (currentCategory === "activity" && cleanCat === "activities") ||
                     (currentCategory === "holiday" && cleanCat === "holidays") ||
                     (currentCategory === "cruise" && cleanCat === "cruises") ||
                     (currentCategory === "activities" && cleanCat === "activity") ||
                     (currentCategory === "holidays" && cleanCat === "holiday") ||
                     (currentCategory === "cruises" && cleanCat === "cruise");
            });
            const isActive = String(c?.status || "").toLowerCase() === "active";
            return isInCategory && isActive;
          })
        );
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Failed to fetch cities.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentCategory]);

  return (
    <section className="py-6 px-4 max-w-[97%] mx-auto font-sans">
      {/* CSS to hide scrollbar across all browsers while keeping scroll active */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header Row */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
          {mainHeading}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-gray-200 transition-all shadow-sm ${
              !canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 text-gray-800"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border border-gray-200 transition-all shadow-sm ${
              !canScrollRight ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 text-gray-800"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto pb-6 snap-x no-scrollbar scroll-smooth"
      >
        {cities.map((item, idx) => (
          <TourCard
            key={`${item?.city_name || "city"}-${item?.country_name || "country"}-${idx}`}
            image={item?.image || fallbackImage}
            fallbackImage={fallbackImage}
            title={`${cardHeadingPrefix} ${item?.city_name || ""}`.trim()}
            subtext={item?.country_name || ""}
            variant="city"
            citySlug={item?.slug || ""}
          />
        ))}
      </div>
      {loading && cities.length === 0 && (
        <div className="pt-2">
          <p className="text-sm text-gray-500">Loading cities...</p>
        </div>
      )}
      {!loading && cities.length === 0 && (
        <div className="pt-2">
          <p className="text-sm text-gray-500">No cities found.</p>
        </div>
      )}
      {error && (
        <div className="pt-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </section>
  );
}