import React, { useState } from "react";
import { Maximize2, MapPin } from "lucide-react";

const contactData = {
  India: {
    title: "India",
    address: "Carthage Travel & Tourism and Travels, Ashtavinayak Rd, MITCON Lane, Balewadi, Pune, Maharashtra, India",
    query: "Carthage Travel & Tourism and Travels, Ashtavinayak Rd, MITCON Lane, Balewadi, Pune, Maharashtra, India"
  },
  "South Africa": {
    title: "South Africa",
    address: "3 Botterblom Avenue, Grassy Park, Cape Town, 7941, South Africa",
    query: "3 Botterblom Avenue, Grassy Park, Cape Town, 7941, South Africa"
  },
  Singapore: {
    title: "Singapore",
    address: "180 Kitchener Road, #09-09 City Square Mall, Singapore 208539",
    query: "180 Kitchener Road, City Square Mall, Singapore 208539"
  }
};

const AboutContact = () => {
  const [activeTab, setActiveTab] = useState("India");
  const current = contactData[activeTab];

  return (
    <section id="contactus" className="py-12 px-4 bg-white shrink-0 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Contact Us - We Are Present Globally</h2>
          <p className="text-gray-500 text-sm">Reach out to us:</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {Object.keys(contactData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all border cursor-pointer ${activeTab === tab
                ? "bg-[#333333] text-white border-[#333333]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Map Area */}
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">

          {/* Live Google Map */}
          <iframe
            key={current.title}
            title={`Map for ${current.title}`}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(current.query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
            className="animate-fadeIn"
          ></iframe>

          {/* Info Card Overlay - Sitting on top like in the image */}
          {/* <div className="absolute top-8 left-8 z-20 w-80 bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-fadeIn pointer-events-none md:pointer-events-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{current.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              {current.address}
            </p>
          </div> */}

          {/* <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-md text-gray-600 hover:bg-gray-50 cursor-pointer lg:block hidden">
            <Maximize2 size={20} />
          </div> */}

        </div>

      </div>
    </section>
  );
};

export default AboutContact;
