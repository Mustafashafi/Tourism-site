import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const historyData = [
  {
    year: "2006",
    title: "Creating Memories Since 2006",
    desc: "Carthage Travel & Tourism started with a single travel desk at Flora Grand Hotel in Dubai, marking the company's first step into the travel industry.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop" // Dubai Skyline
  },
  {
    year: "2008",
    title: "Rapid Expansion",
    desc: "Within less than two years, the company expanded its presence by opening more than 15 travel outlets inside various 4 and 5-star hotels across Dubai.",
    image: "https://images.unsplash.com/photo-1546412414-8035e1776c9a?q=80&w=1200&auto=format&fit=crop"
  },
  {
    year: "2009",
    title: "Incorporated as DMC",
    desc: "Carthage Travel & Tourism was incorporated as a Destination Management Company and established its formal headquarters in the Abu Hail area of Dubai.",
    image: "https://images.unsplash.com/photo-1582672093235-94943f5cf219?q=80&w=1200&auto=format&fit=crop"
  },
  {
    year: "2010",
    title: "Scaling Operations",
    desc: "Focused on solidifying infrastructure and scaling operations to better serve a growing global customer base across B2B and B2C platforms.",
    image: "https://images.unsplash.com/photo-1454165833762-02c34d93026a?q=80&w=1200&auto=format&fit=crop"
  },
  {
    year: "2012",
    title: "Technological Evolution",
    desc: "Substantial investment in technology led to the creation of an in-house technical wing, paving the way for advanced online booking solutions.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
  },
  {
    year: "2013",
    title: "Global Recognition",
    desc: "The company continued to build its global reputation, receiving industry recognition and awards for excellence in destination management.",
    image: "https://images.unsplash.com/photo-1449156059431-787c5bca9e2e?q=80&w=1200&auto=format&fit=crop"
  }
];

const AboutHistory = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = historyData[activeIndex];

  const handleNext = () => {
    if (activeIndex < historyData.length - 1) setActiveIndex(activeIndex + 1);
  };

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  return (
    <section id="history" className="py-10 bg-white shrink-0 scroll-mt-20 w-full overflow-hidden">
      {/* Section Header - Still padded to match site alignment */}
      <div className="px-6 md:px-16 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Carthage Travel & Tourism History - Creating Memories Since 2006</h2>
        <p className="text-gray-500 text-sm">History of Carthage Group of companies</p>
      </div>

      {/* Content Container - Edge to Edge */}
      <div className="relative h-[450px]  w-full overflow-hidden shadow-xl group">

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 transition-all duration-700">
          <img
            src={current.image}
            alt={current.year}
            className="w-full object-cover transition-transform duration-1000 scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative h-full flex items-center">

          {/* Left/Middle Content */}
          <div className="flex-1 pl-12 pr-24 md:pr-48 text-center md:text-left animate-fadeIn">
            <div className="mb-6">
              <span className="text-white text-5xl font-black  tracking-tighter">
                {current.year}
              </span>
              <h3 className="text-white text-3xl font-bold">
                {current.title}
              </h3>
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-xl">
              {current.desc}
            </p>
          </div>

          {/* Right Side Vertical Timeline */}
          <div className="absolute right-0 top-0 h-full w-24 md:w-32 border-l border-white/20 bg-black/20 flex flex-col items-center py-10 justify-between">

            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={`p-2 transition-all ${activeIndex === 0 ? "opacity-20 cursor-not-allowed" : "text-white hover:scale-125 cursor-pointer"}`}
            >
              <ChevronUp size={24} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
              {/* Timeline Vertical Line */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10 hidden md:block"></div>

              {historyData.map((item, idx) => (
                <div
                  key={item.year}
                  onClick={() => setActiveIndex(idx)}
                  className="relative flex items-center justify-center cursor-pointer group/item"
                >
                  <div className={`transition-all duration-300 ${activeIndex === idx ? "text-orange-500 font-bold scale-125" : "text-white/40 font-medium hover:text-white"}`}>
                    <span className="text-sm md:text-base">{item.year}</span>
                  </div>
                  {/* Tick mark node */}
                  <div className={`absolute left-[-18px] w-2 h-2 rounded-full border transition-all ${activeIndex === idx ? "bg-orange-500 border-orange-500" : "bg-transparent border-white/20 group-hover/item:border-white/50"}`}></div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={activeIndex === historyData.length - 1}
              className={`p-2 transition-all ${activeIndex === historyData.length - 1 ? "opacity-20 cursor-not-allowed" : "text-white hover:scale-125 cursor-pointer"}`}
            >
              <ChevronDown size={24} />
            </button>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutHistory;
