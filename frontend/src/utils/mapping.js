/**
 * Universal mapper to convert backend product objects into the props expected by the TourCard component.
 * Supports activity, holiday, visa, and cruise variants.
 */

/**
 * Maps a category slug (from DB) to the frontend plural URL segment.
 * e.g. "activity" → "activities", "holiday" → "holidays"
 */
export const toCategoryRoute = (categorySlug = "") => {
  const s = (categorySlug || "").toLowerCase().trim();
  if (s.includes("activity") || s.includes("activities") || s.includes("tour")) return "activities";
  if (s.includes("holiday") || s.includes("holidays")) return "holidays";
  if (s.includes("cruise") || s.includes("cruises")) return "cruises";
  if (s.includes("visa") || s.includes("visas")) return "visas";
  // Fallback: naively pluralise
  return s.endsWith("s") ? s : `${s}s`;
};

export const mapProductToCard = (product) => {
  if (!product) return {};

  const pricing = product.pricing || {};
  const discountPrice = pricing.discountPrice;
  const actualPrice = pricing.actualPrice;
  const fromPrice = pricing.fromPrice;

  // Primary price (discount > actual > fromPrice)
  const price = discountPrice ?? actualPrice ?? fromPrice ?? 0;

  let discountPercentage = undefined;
  if (
    typeof discountPrice === "number" &&
    typeof actualPrice === "number" &&
    actualPrice > 0 &&
    discountPrice < actualPrice
  ) {
    discountPercentage = Math.round(((actualPrice - discountPrice) / actualPrice) * 100);
  }

  // Handle images (array or single string)
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const rawCategorySlug = product.category?.slug || "";

  return {
    _id: product._id,
    rawProduct: product,
    title: product.name || "",
    image: images,
    subtext: product.city?.name || product.manualCity || "",
    price,
    originalPrice: actualPrice,
    childPrice: pricing.childPrice,
    infantPrice: pricing.infantPrice,
    discountPercentage,
    rating: product.rating,
    reviews: product.reviews,
    isNew: product.isProductNew,
    // Cruise-specific fields
    shipName: product.cruiseLine,
    departure: product.departureCity,
    duration: product.duration,
    departures: product.departures,
    itinerary: product.itinerary,
    // Navigation — used by TourCard to build its <Link>
    slug: product.slug,
    categorySlug: toCategoryRoute(rawCategorySlug),
  };
};
