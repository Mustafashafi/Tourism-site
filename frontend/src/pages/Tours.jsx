import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainCarousel from '../components/MainCarousel';
import { homeSlides, holidaySlides, cruiseSlides } from '../data/carouselData';
import { homeApi } from '../services/homeApi';
import { mapProductToCard } from '../utils/mapping';
import TourCard from '../components/TourCard';
import ExploreMore from '../components/ExploreMore';
import SectionWrapper from '../components/SectionWrapper';

const Tours = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Options State
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [tourTypes, setTourTypes] = useState([]);
  
  // Selection State (IDs)
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedTourTypeId, setSelectedTourTypeId] = useState("");

  // Price & Duration Filter States
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(24);

  // Loading States
  const [loadingData, setLoadingData] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // Load all metadata options on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoadingData(true);
        setError("");
        const [fetchedCities, fetchedCategories, fetchedSubCategories, fetchedTourTypes] = await Promise.all([
          homeApi.getCities(),
          homeApi.getCategories(),
          homeApi.getSubCategories(),
          homeApi.getTourTypes()
        ]);

        setCities((fetchedCities || []).filter(c => c.status === "active"));
        setCategories(fetchedCategories || []);
        setSubCategories(fetchedSubCategories || []);
        setTourTypes(fetchedTourTypes || []);
      } catch (err) {
        setError("Failed to initialize filters.");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    loadMetadata();
  }, []);

  // Sync URL Params to local filter state
  useEffect(() => {
    if (loadingData) return;

    const urlCitySlug = searchParams.get("city") || "";
    const urlCategorySlug = searchParams.get("category") || "";
    const urlSubCategorySlug = searchParams.get("subCategory") || "";
    const urlTourTypeSlug = searchParams.get("tourType") || "";
    const urlMinPrice = searchParams.get("minPrice") || "";
    const urlMaxPrice = searchParams.get("maxPrice") || "";
    const urlMinDuration = searchParams.get("minDuration") || "";
    const urlMaxDuration = searchParams.get("maxDuration") || "";

    const cityObj = cities.find(c => c.slug === urlCitySlug);
    const catObj = categories.find(c => c.slug === urlCategorySlug);
    const subObj = subCategories.find(s => s.slug === urlSubCategorySlug);
    const ttObj = tourTypes.find(t => t.slug === urlTourTypeSlug);

    const targetCityId = cityObj ? cityObj._id : "";
    const targetCategoryId = catObj ? catObj._id : "";
    const targetSubCategoryId = subObj ? subObj._id : "";
    const targetTourTypeId = ttObj ? ttObj._id : "";

    if (targetCityId !== selectedCityId) setSelectedCityId(targetCityId);
    if (targetCategoryId !== selectedCategoryId) setSelectedCategoryId(targetCategoryId);
    if (targetSubCategoryId !== selectedSubCategoryId) setSelectedSubCategoryId(targetSubCategoryId);
    if (targetTourTypeId !== selectedTourTypeId) setSelectedTourTypeId(targetTourTypeId);

    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setMinDuration(urlMinDuration);
    setMaxDuration(urlMaxDuration);

  }, [searchParams, loadingData, cities, categories, subCategories, tourTypes]);

  // Handle dropdown/input updates by syncing them to searchParams
  const updateFilter = (type, value) => {
    const newParams = {};
    searchParams.forEach((val, key) => {
      newParams[key] = val;
    });

    const getSlug = (list, id) => list.find(x => x._id === id)?.slug || "";

    if (type === "city") {
      const citySlug = getSlug(cities, value);
      if (citySlug) newParams.city = citySlug;
      else delete newParams.city;
    } else if (type === "category") {
      const categorySlug = getSlug(categories, value);
      if (categorySlug) newParams.category = categorySlug;
      else delete newParams.category;
      delete newParams.subCategory; // Clear subcat on cat change
    } else if (type === "subCategory") {
      const subCategorySlug = getSlug(subCategories, value);
      if (subCategorySlug) newParams.subCategory = subCategorySlug;
      else delete newParams.subCategory;
    } else if (type === "tourType") {
      const tourTypeSlug = getSlug(tourTypes, value);
      if (tourTypeSlug) newParams.tourType = tourTypeSlug;
      else delete newParams.tourType;
    } else if (type === "minPrice") {
      if (value) newParams.minPrice = value;
      else delete newParams.minPrice;
    } else if (type === "maxPrice") {
      if (value) newParams.maxPrice = value;
      else delete newParams.maxPrice;
    } else if (type === "minDuration") {
      if (value) newParams.minDuration = value;
      else delete newParams.minDuration;
    } else if (type === "maxDuration") {
      if (value) newParams.maxDuration = value;
      else delete newParams.maxDuration;
    }

    setSearchParams(newParams);
    setVisibleCount(24); // Reset pagination on filter change
  };

  // Filter subcategories selection options by active Category selection
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId) return subCategories;
    return subCategories.filter(s => s.category?._id === selectedCategoryId || s.category === selectedCategoryId);
  }, [subCategories, selectedCategoryId]);

  // Fetch products whenever filters are updated
  useEffect(() => {
    if (loadingData) return;

    const fetchFilteredProducts = async () => {
      try {
        setLoadingProducts(true);
        const queryParams = {};
        if (selectedCityId) queryParams.city = selectedCityId;
        if (selectedCategoryId) queryParams.category = selectedCategoryId;
        if (selectedSubCategoryId) queryParams.subCategory = selectedSubCategoryId;
        if (selectedTourTypeId) queryParams.tourType = selectedTourTypeId;
        if (minPrice) queryParams.minPrice = minPrice;
        if (maxPrice) queryParams.maxPrice = maxPrice;
        if (minDuration) queryParams.minDuration = minDuration;
        if (maxDuration) queryParams.maxDuration = maxDuration;
        
        queryParams.limit = 100;

        const data = await homeApi.getProducts(queryParams);
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load filtered products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCityId, selectedCategoryId, selectedSubCategoryId, selectedTourTypeId, minPrice, maxPrice, minDuration, maxDuration, loadingData]);

  // Determine active category banners
  const bannerSlides = useMemo(() => {
    if (loadingData) return homeSlides;
    
    let defaultSlides = homeSlides;
    if (selectedCategoryId) {
      const activeCatSlug = categories.find(c => c._id === selectedCategoryId)?.slug?.toLowerCase() || "";
      if (activeCatSlug.includes("cruise")) {
        defaultSlides = cruiseSlides;
      } else if (activeCatSlug.includes("holiday")) {
        defaultSlides = holidaySlides;
      } else {
        defaultSlides = homeSlides;
      }
    }

    if (!selectedCategoryId) return defaultSlides;
    const cat = categories.find(c => c._id === selectedCategoryId);
    if (!cat || !Array.isArray(cat.banners) || cat.banners.length === 0) return defaultSlides;

    return cat.banners.map((banner) => {
      const rawUrl = typeof banner === "string" ? banner : banner?.url;
      let url = rawUrl;
      if (rawUrl && !/^(http|https|data|blob):/.test(rawUrl)) {
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api$/, "");
        url = `${baseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
      }
      return {
        url,
        title: banner?.title || cat.name || "",
        subtext: banner?.subtext || "",
        description: banner?.description || ""
      };
    });
  }, [selectedCategoryId, categories, loadingData]);

  const activeCategorySlug = useMemo(() => {
    return categories.find(c => c._id === selectedCategoryId)?.slug || "activities";
  }, [categories, selectedCategoryId]);

  const headingText = useMemo(() => {
    if (!selectedCategoryId) return "Tours Available";
    const catName = categories.find(c => c._id === selectedCategoryId)?.name || "Tours";
    return `${catName} Available`;
  }, [categories, selectedCategoryId]);

  return (
    <div className="font-sans bg-gray-50/50 pb-12">
      {/* Category Banner Slides */}
      <MainCarousel slides={bannerSlides} />

      {error && (
        <div className="px-4 max-w-[97%] mx-auto my-4">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        </div>
      )}

      {/* Filters Bar Section */}
      <SectionWrapper className="!my-6">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Filter Experiences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Destination Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</label>
            <select
              value={selectedCityId}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer transition-all"
            >
              <option value="">All Destinations</option>
              {cities.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subcategory</label>
            <select
              value={selectedSubCategoryId}
              onChange={(e) => updateFilter("subCategory", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Subcategories</option>
              {filteredSubCategories.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Tour Type Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tour Type</label>
            <select
              value={selectedTourTypeId}
              onChange={(e) => updateFilter("tourType", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer transition-all"
            >
              <option value="">All Tour Types</option>
              {tourTypes.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Range (AED)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                className="w-1/2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-1/2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Duration Filter */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration (Hours)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Hours"
                value={minDuration}
                onChange={(e) => updateFilter("minDuration", e.target.value)}
                className="w-1/2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500"
              />
              <input
                type="number"
                placeholder="Max Hours"
                value={maxDuration}
                onChange={(e) => updateFilter("maxDuration", e.target.value)}
                className="w-1/2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

        </div>
      </SectionWrapper>

      {/* Products Listing Grid */}
      <SectionWrapper>
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {loadingProducts ? "Loading tours..." : `${products.length} ${headingText}`}
          </h2>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[340px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, visibleCount).map((product) => {
                const card = mapProductToCard(product);
                return (
                  <TourCard
                    key={product._id}
                    {...card}
                    isGrid={true}
                    variant={activeCategorySlug.includes("cruise") ? "cruise" : "activity"}
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < products.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="px-8 py-3.5 bg-[#111118] hover:bg-black text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm cursor-pointer"
                >
                  Load More Experiences
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-250">
            <p className="text-gray-500 font-bold mb-2 text-lg">No tours found matching your search</p>
            <p className="text-gray-400 text-sm">Try clearing or adjusting your filters above.</p>
          </div>
        )}
      </SectionWrapper>

      {/* Dynamic Explore More Section */}
      <ExploreMore categorySlug={activeCategorySlug} />
    </div>
  );
};

export default Tours;
