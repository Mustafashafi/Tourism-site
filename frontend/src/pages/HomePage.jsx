import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ExploreMore from "../components/ExploreMore";
import MainCarousel from "../components/MainCarousel";
import { homeSlides } from "../data/carouselData";
import { homeApi } from "../services/homeApi";
import BestCities from "../components/BestCities";
import TourCard from "../components/TourCard";
import SectionWrapper from "../components/SectionWrapper";
import { mapProductToCard } from "../utils/mapping";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Inline helper to render horizontal scrollable section for 8 tours with custom navigation buttons (like BestCities)
const ProductSliderSection = ({ title, categoryTag, productsList, themeColor, ctaText, ctaLink }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, [productsList]);

  return (
    <SectionWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full`} style={{ color: themeColor, backgroundColor: `${themeColor}15` }}>
            {categoryTag}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-3 mb-2">
            {title}
          </h2>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
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

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto pb-6 snap-x no-scrollbar scroll-smooth"
      >
        {productsList.map(item => (
          <TourCard key={item._id} {...mapProductToCard(item)} isGrid={false} />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Link
          to={ctaLink}
          className="px-6 py-3 text-white font-bold rounded-xl transition-all text-sm shadow-sm cursor-pointer hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          {ctaText}
        </Link>
      </div>
    </SectionWrapper>
  );
};

const HomePage = () => {
  const [cities, setCities] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Testimonials Slider state
  const testimonialScrollRef = useRef(null);
  const [canScrollTestimonialLeft, setCanScrollTestimonialLeft] = useState(false);
  const [canScrollTestimonialRight, setCanScrollTestimonialRight] = useState(true);

  const checkTestimonialScroll = () => {
    if (testimonialScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = testimonialScrollRef.current;
      setCanScrollTestimonialLeft(scrollLeft > 0);
      setCanScrollTestimonialRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scrollTestimonial = (direction) => {
    if (testimonialScrollRef.current) {
      const { clientWidth } = testimonialScrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      testimonialScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkTestimonialScroll();
    window.addEventListener("resize", checkTestimonialScroll);
    return () => window.removeEventListener("resize", checkTestimonialScroll);
  }, [testimonials]);

  // Load all necessary data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [fetchedCities, fetchedProducts, fetchedTestimonials, fetchedSettings] = await Promise.all([
          homeApi.getCities(),
          homeApi.getProducts({ limit: 250 }), // Get a broader product catalog for curated display
          homeApi.getTestimonials(),
          homeApi.getSettings(),
        ]);

        const activeCities = (fetchedCities || []).filter((c) => c.status === "active");
        setCities(activeCities);
        setProducts(fetchedProducts || []);
        setSettings(fetchedSettings || null);

        // Match up to 12 reviews
        setTestimonials((fetchedTestimonials || []).slice(0, 12));
      } catch (err) {
        setError(err.message || "Failed to load homepage data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter products by category - Slice up to 8 tours instead of 4
  const getCuratedList = (section, fallbackSelector) => {
    const curatedIds = settings?.homepageCuration?.[section] || [];
    const normalizedIds = Array.isArray(curatedIds) ? curatedIds.map((id) => String(id)) : [];
    if (normalizedIds.length > 0) {
      const curated = normalizedIds
        .map((id) => products.find((product) => String(product._id) === id))
        .filter(Boolean);
      if (curated.length > 0) return curated.slice(0, 8);
    }
    return fallbackSelector().slice(0, 8);
  };

  const activities = useMemo(() => {
    return getCuratedList("activities", () =>
      products.filter((p) => {
        const slug = p.category?.slug?.toLowerCase() || "";
        return slug.includes("activity") || slug.includes("activities") || slug.includes("tour");
      })
    );
  }, [products, settings]);

  const cruises = useMemo(() => {
    return getCuratedList("cruises", () =>
      products.filter((p) => {
        const slug = p.category?.slug?.toLowerCase() || "";
        return slug.includes("cruise") || slug.includes("cruises");
      })
    );
  }, [products, settings]);

  const holidays = useMemo(() => {
    return getCuratedList("holidays", () =>
      products.filter((p) => {
        const slug = p.category?.slug?.toLowerCase() || "";
        return slug.includes("holiday") || slug.includes("holidays");
      })
    );
  }, [products, settings]);

  // Construct dynamic hero slider slides based on active cities
  const heroSlides = useMemo(() => {
    if (cities.length === 0) return homeSlides;
    return cities.map(city => ({
      url: city.image,
      title: city.name,
      subtext: "Destinations in UAE",
      description: `Unveil the secrets of ${city.name} with our curated tours, luxury cruises, and holiday packages.`,
      linkTo: `/tours?city=${city.slug}`
    }));
  }, [cities]);

  // Premium FAQ Accordion data
  const faqs = settings?.faq?.length > 0
    ? settings.faq.map((item) => ({ q: item.question, a: item.answer }))
    : [
      {
        q: "How can I book a tour or activity with Carthage Travel?",
        a: "For all activities and excursions, you can instantly check online availability via our booking form. For other products like cruises and holiday packages, click on 'Send Inquiry' to submit an email request directly to our reservations team."
      },
      {
        q: "What payment methods are supported?",
        a: "We support booking and inquiry checkout options, integrating secure standard credit/debit card processing interfaces. For direct custom requests, we can also assist with offline bank transfers."
      },
      {
        q: "Can I customize a travel itinerary?",
        a: "Absolutely! Contact us via our support page or send an direct inquiry through the Holiday Packages page, and one of our dedicated UAE destination experts will tailor an itinerary to your specific needs."
      },
      {
        q: "Are hotel transfers included in the packages?",
        a: "Many of our holiday packages and activities offer shared or private transfers. Check the specific 'What is Included' details on each product page for exact information."
      },
      {
        q: "What is the cancellation policy for bookings?",
        a: "Cancellation policies vary depending on the specific activity or package booked. Generally, activities cancelled 24-48 hours in advance are eligible for a full refund. Please review the refund policy on the checkout screen."
      },
      {
        q: "Do I need a visa to enter the UAE for these tours?",
        a: "Visa requirements depend on your nationality. Most visitors receive a 30-day or 90-day visa on arrival. We recommend verifying entry requirements with your local embassy prior to travel."
      },
      {
        q: "Is travel insurance included in my holiday package?",
        a: "Travel insurance is not included in our default packages. We highly recommend purchasing comprehensive travel insurance independently to cover health, delays, and unexpected cancellations."
      },
      {
        q: "Can I book activities for a large private group?",
        a: "Yes, we specialize in corporate travel, group tours, and private yacht charters. Reach out via our Contact Us form with your group size and requirements to get a custom quote."
      },
      {
        q: "What is the best time of year to visit the UAE?",
        a: "The best travel season is between October and April when temperatures are cool, ranging from 18°C to 30°C, making it ideal for outdoor excursions, cruises, and desert safaris."
      },
      {
        q: "Who should I contact if I need urgent help during a tour?",
        a: "Once booked, you will receive our 24/7 hotline support contact number. Our ground assistance team is always available to help you resolve any on-trip issues instantly."
      }
    ];

  return (
    <div className="font-sans bg-gray-50/50 pb-12">
      {/* CSS to hide scrollbar across all browsers while keeping scroll active */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Section 1: Hero Slider */}
      <MainCarousel slides={heroSlides} />

      {error && (
        <div className="px-4 max-w-[97%] mx-auto my-4">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        </div>
      )}

      {/* Section 2: Destinations Overview */}
      <SectionWrapper>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CC1422] bg-[#CC1422]/10 px-3 py-1.5 rounded-full">
            Destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-3 mb-2">
            Best Cities to Visit in the UAE
          </h2>
          <p className="text-base text-gray-600 max-w-4xl leading-relaxed">
            Embark on a journey through the most dazzling destinations in the United Arab Emirates. From the futuristic skylines of Dubai and Abu Dhabi to the rich cultural heritage of Sharjah and breathtaking escapes of Ras Al Khaimah.
          </p>
        </div>

        {/* Best Cities Slider */}
        <BestCities
          mainHeading=""
          cardHeadingPrefix="Things to do in"
          category="activities"
        />
      </SectionWrapper>

      {/* Section 3: Activities Section */}
      {loading ? (
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-[#CC1422] border-gray-200 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Loading Activities...</p>
          </div>
        </SectionWrapper>
      ) : (
        activities.length > 0 && (
          <ProductSliderSection
            title="Popular Activities & Excursions"
            categoryTag="Day Tours & Adventures"
            productsList={activities}
            themeColor="#CC1422"
            ctaText="Explore All Activities"
            ctaLink="/tours?category=activities"
          />
        )
      )}

      {/* Section 4: Cruises Section */}
      {loading ? (
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-[#CC1422] border-gray-200 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Loading Cruises...</p>
          </div>
        </SectionWrapper>
      ) : (
        cruises.length > 0 && (
          <ProductSliderSection
            title="Premium Cruises & Dhow Cruises"
            categoryTag="Ocean Cruises & Yacht Charters"
            productsList={cruises}
            themeColor="#CC1422"
            ctaText="Explore All Cruises"
            ctaLink="/tours?category=cruises"
          />
        )
      )}

      {/* Section 5: Holidays Section */}
      {loading ? (
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-[#CC1422] border-gray-200 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Loading Holiday Packages...</p>
          </div>
        </SectionWrapper>
      ) : (
        holidays.length > 0 && (
          <ProductSliderSection
            title="Exclusive Holiday Packages"
            categoryTag="Curated Travel Packages"
            productsList={holidays}
            themeColor="#CC1422"
            ctaText="Browse Holiday Packages"
            ctaLink="/tours?category=holidays"
          />
        )
      )}

      {/* Section 6: Testimonials Section (Slider layout displaying up to 12 reviews) */}
      {loading ? (
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-[#CC1422] border-gray-200 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Loading Testimonials...</p>
          </div>
        </SectionWrapper>
      ) : (
        testimonials.length > 0 && (
          <SectionWrapper>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CC1422] bg-[#CC1422]/10 px-3.5 py-1.5 rounded-full">
                  Testimonials
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-4">
                  What Our Travelers Say
                </h2>
                <p className="text-gray-500 mt-2">
                  Real stories and reviews from travelers who explored the UAE with Carthage Travel.
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => scrollTestimonial("left")}
                  disabled={!canScrollTestimonialLeft}
                  className={`p-2 rounded-full border border-gray-200 transition-all shadow-sm ${
                    !canScrollTestimonialLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollTestimonial("right")}
                  disabled={!canScrollTestimonialRight}
                  className={`p-2 rounded-full border border-gray-200 transition-all shadow-sm ${
                    !canScrollTestimonialRight ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={testimonialScrollRef}
              onScroll={checkTestimonialScroll}
              className="flex gap-5 overflow-x-auto pb-6 snap-x no-scrollbar scroll-smooth"
            >
              {testimonials.map((t, idx) => (
                <div key={idx} className="shrink-0 w-80 md:w-96 snap-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-orange-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 italic text-sm leading-relaxed mb-6">
                      "{t.comment}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-gray-50 pt-4 mt-auto">
                    {t.userImage ? (
                      <img src={t.userImage} alt={t.userName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 font-bold flex items-center justify-center text-sm">
                        {t.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{t.userName}</h4>
                      {t.location && <p className="text-gray-400 text-xs">{t.location}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        )
      )}

      {/* Dedicated FAQ Accordion Section */}
      <SectionWrapper>
        <div className="max-w-[97%] md:max-w-6xl mx-auto my-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CC1422] bg-[#CC1422]/10 px-3.5 py-1.5 rounded-full">
              Information Desk
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 mt-2">
              Everything you need to know about planning and booking your UAE experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-4 h-fit">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-3 font-bold text-gray-800 hover:text-[#CC1422] transition-colors text-[15px]"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl font-light text-gray-400 shrink-0 ml-4">{openFaq === idx ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-48 mt-2 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div
                    className="text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl prose prose-sm prose-gray"
                    dangerouslySetInnerHTML={{ __html: faq.a || "" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Prominent CTA Banner */}
      <SectionWrapper>
        <div className="relative w-full max-w-[1400px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-r from-[#CC1422] to-red-800 text-white shadow-xl py-12 px-8 md:px-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Ready to Explore the UAE?
            </h2>
            <p className="text-white/80 text-sm md:text-base">
              Get customized holiday planning and instant activity tickets designed to create lifetime memories. Connect with our experts today.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-4">
            <Link
              to="/tours"
              className="px-8 py-4 bg-white text-[#CC1422] font-black rounded-xl hover:bg-gray-100 transition-all text-sm shadow-md cursor-pointer text-center"
            >
              Browse All Tours
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm cursor-pointer text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* Section 7: Explore More With Us */}
      <ExploreMore />
    </div>
  );
};

export default HomePage;
