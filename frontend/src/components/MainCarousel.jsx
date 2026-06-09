import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MainCarousel = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  const formatImagePath = (imgSrc) => {
    if (!imgSrc) return "";
    if (imgSrc.startsWith("http://") || imgSrc.startsWith("https://")) {
      return imgSrc;
    }
    const base = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "") : "http://localhost:5000";
    const cleanSrc = imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`;
    return `${base}${cleanSrc}`;
  };

  // Preload images to avoid any flicker when transitioning
  useEffect(() => {
    if (slides && slides.length > 0) {
      slides.forEach((slide) => {
        if (slide.url) {
          const img = new Image();
          img.src = formatImagePath(slide.url);
        }
      });
    }
  }, [slides]);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-[95%] lg:w-[80%] max-w-[1400px] mx-auto my-6 rounded-[24px] md:rounded-[32px] h-[250px] md:h-[500px] overflow-hidden bg-black shadow-lg">
      <AnimatePresence initial={false} mode="fade">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Zooming background image */}
          <motion.img
            src={formatImagePath(slides[current].url)}
            alt={slides[current].title}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

          {/* Text Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 max-w-2xl text-left">
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[#CC1422] font-extrabold tracking-widest uppercase text-xs md:text-sm mb-2"
            >
              {slides[current].subtext}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white text-3xl md:text-5xl font-black mb-4 leading-tight"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/80 text-sm md:text-base mb-6 line-clamp-3 md:line-clamp-none"
            >
              {slides[current].description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {slides[current].linkTo ? (
                <Link to={slides[current].linkTo}>
                  <button className="px-6 py-3 bg-[#CC1422] hover:bg-[#b0101c] text-white font-bold rounded-xl transition-all text-xs md:text-sm shadow-md cursor-pointer">
                    Explore Destination
                  </button>
                </Link>
              ) : (
                <button className="px-6 py-3 bg-[#CC1422] hover:bg-[#b0101c] text-white font-bold rounded-xl transition-all text-xs md:text-sm shadow-md cursor-pointer">
                  Explore Destination
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all cursor-pointer hidden md:block"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all cursor-pointer hidden md:block"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${idx === current ? "w-8 bg-[#CC1422]" : "w-2.5 bg-white/50 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainCarousel;