import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TabIcon from './TabIcon';
import { homeApi } from '../services/homeApi';
import SectionWrapper from './SectionWrapper';

const ExploreMore = ({ citySlug, categorySlug }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  
  // State to manage arrow visibility
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 0);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Build tags dynamically from backend
  useEffect(() => {
    let active = true;
    const fetchAndBuildTags = async () => {
      try {
        setLoading(true);
        // Fetch products (limit to 100 to get a good catalog of tags)
        const products = await homeApi.getProducts({ limit: 100 });
        if (!active) return;

        // Filter products based on props
        let filtered = products;
        if (citySlug) {
          filtered = filtered.filter(p => p.city?.slug === citySlug);
        }

        const s = (categorySlug || "").toLowerCase().trim();
        const isActivityPage = s.includes("activity") || s.includes("activities");
        const isHolidayPage = s.includes("holiday") || s.includes("holidays");
        const isCruisePage = s.includes("cruise") || s.includes("cruises");

        const tabGroups = {};

        filtered.forEach((product) => {
          const prodCatSlug = (product.category?.slug || "").toLowerCase();
          const prodCatName = product.category?.name || "Other";

          const isProdActivity = prodCatSlug.includes("activity") || prodCatSlug.includes("activities") || prodCatSlug.includes("tour");
          const isProdHoliday = prodCatSlug.includes("holiday") || prodCatSlug.includes("holidays");
          const isProdCruise = prodCatSlug.includes("cruise") || prodCatSlug.includes("cruises");

          // Determine whether this product should be included based on page context
          let shouldInclude = false;
          if (isActivityPage) {
            // Include only Cruises and Holidays
            shouldInclude = isProdCruise || isProdHoliday;
          } else if (isHolidayPage) {
            // Include only Activities and Cruises
            shouldInclude = isProdActivity || isProdCruise;
          } else if (isCruisePage) {
            // Include only Activities and Holidays
            shouldInclude = isProdActivity || isProdHoliday;
          } else {
            // Homepage: include everything
            shouldInclude = true;
          }

          if (!shouldInclude) return;

          // Group by Category Name
          if (!tabGroups[prodCatName]) {
            let icon = "Globe";
            if (isProdActivity) icon = "MapPin";
            else if (isProdCruise) icon = "Ship";
            else if (isProdHoliday) icon = "Palmtree";

            tabGroups[prodCatName] = {
              tabHeading: prodCatName,
              icon: icon,
              links: []
            };
          }

          const path = `/${isProdActivity ? "activities" : isProdCruise ? "cruises" : "holidays"}/${product.slug}`;
          const exists = tabGroups[prodCatName].links.some(l => l.label === product.name);
          if (!exists) {
            tabGroups[prodCatName].links.push({
              label: product.name,
              url: path
            });
          }
        });

        const tabsArray = Object.values(tabGroups);
        setTabs(tabsArray);
        setActiveTab(0);
      } catch (err) {
        console.error("Failed to build explore more tags dynamically:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAndBuildTags();
    return () => {
      active = false;
    };
  }, [citySlug, categorySlug]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  if (loading) {
    return (
      <section className="py-12 px-4 max-w-[97%] mx-auto border-t border-gray-100 animate-pulse">
        <div className="h-7 w-48 bg-gray-200 rounded mb-8"></div>
        <div className="h-10 w-full bg-gray-100 rounded mb-8"></div>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-32 bg-gray-150 rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  if (tabs.length === 0) return null;

  return (
    <SectionWrapper>
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Explore more with us</h2>

      <div className="relative border-b border-gray-200 mb-8 group">
        
        {/* LEFT ARROW - Only shown if showLeftBtn is true */}
        {showLeftBtn && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-3/4 z-10 bg-white shadow-lg border border-gray-100 p-2 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
        )}

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-2 transition-all"
        >
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center pb-2 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 transition-all ${
                activeTab === index 
                ? 'border-gray-800 text-gray-900 font-bold' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span><TabIcon name={tab.icon} /></span>
              <span className="font-heading text-secondary">{tab.tabHeading}</span>
            </button>
          ))}
        </div>

        {/* RIGHT ARROW - Only shown if showRightBtn is true */}
        {showRightBtn && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-3/4 z-10 bg-white shadow-lg border border-gray-100 p-2 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Sublinks Grid */}
      <div className="flex flex-wrap gap-3">
        {tabs[activeTab]?.links.map((link, idx) => (
          <Link
            key={idx}
            to={link.url}
            className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-normal"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ExploreMore;