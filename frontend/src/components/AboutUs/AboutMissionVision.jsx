import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import missionImg from "../../assets/mission.webp";
import visionImg from "../../assets/vision.webp";

const AboutMissionVision = () => {
  const [activeTab, setActiveTab] = useState("mission");

  const data = {
    mission: {
      title: "Our Mission",
      image: missionImg,
      content: "At Carthage Group, our mission is to redefine the travel experience by offering seamless, innovative, and fully customizable solutions for both industry partners and individual travelers. We strive to empower travel agencies, corporate clients, and leisure explorers with advanced tools, real-time access, and comprehensive support that simplifies travel planning from start to finish.\n\nThrough unwavering commitment to service excellence, transparent operations, and cutting-edge technology, we aim to create long-term value for our clients. Every interaction reflects our dedication to quality, trust, and meaningful customer relationships, ensuring that every journey—no matter the destination—is smooth, enriching, and memorable."
    },
    vision: {
      title: "Our Vision",
      image: visionImg,
      content: "Our vision is to be recognized as a global leader in travel and tourism, distinguished by our customer centric approach, technology first mindset, and strong ethical foundation. We envision a connected world where travel is accessible, personalized, and inspiring for all whether for business, leisure, or adventure.\n\nBy continuously expanding our global network and enhancing our service capabilities, we aim to set new benchmarks in the industry. We see ourselves not just as a service provider, but as a trusted partner that brings people closer to the world, promotes cultural exchange, and shapes the future of travel through innovation and integrity."
    }
  };

  const handleNext = () => setActiveTab("vision");
  const handlePrev = () => setActiveTab("mission");

  const currentData = data[activeTab];

  return (
    <section id="company" className="py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Company Overview */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">About Carthage Travel & Tourism</h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
            Carthage Group, a pioneer in the global travel and tourism industry since 2006, proudly presents its two flagship platforms: Carthage B2B and Carthage B2C. Headquartered in Dubai with a growing global footprint, we deliver world-class travel experiences to both end-users and travel professionals through cutting-edge technology, vast service offerings, and a relentless commitment to excellence. 
            <br className="hidden md:block" /><br className="hidden md:block" />
            Our platforms are the culmination of years of industry expertise, driven by innovation, professionalism, and a passion for travel. Whether you’re a travel agency, a corporate client, or an individual explorer, Carthage is your trusted partner in seamless, enriching travel.
          </p>
        </div>

        {/* Mission & Vision Interactive Slider Area */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mt-12">
          
          {/* Left Column: Image */}
          <div className="md:w-1/2 flex flex-col gap-6">
            <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img 
                src={currentData.image} 
                alt={currentData.title} 
                className="w-full h-full object-cover transition-opacity duration-500 animate-fadeIn"
              />
            </div>
          </div>

          {/* Right Column: Title, Dynamic Text, & Buttons */}
          <div className="md:w-1/2 flex flex-col justify-center animate-fadeIn">
            
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-bold text-gray-700 transition-all duration-300">
                {currentData.title}
              </h3>
              
              {/* Left/Right Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={handlePrev}
                  disabled={activeTab === "mission"}
                  className={`p-1 cursor-pointer rounded-full border transition-all ${
                    activeTab === "mission" 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-200  bg-white "
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleNext}
                  disabled={activeTab === "vision"}
                  className={`p-1 cursor-pointer rounded-full border transition-all ${
                    activeTab === "vision" 
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-200  bg-white "
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
              {currentData.content}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutMissionVision;
