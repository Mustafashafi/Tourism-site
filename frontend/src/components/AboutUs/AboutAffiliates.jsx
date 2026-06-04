import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const affiliationCards = [
  {
    title: "Boost Your Income as an...",
    desc: "Earn commissions from day one with access to all Carthage's brands and powerful, easy-to-use tools...",
    bgImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop",
    btnText: "Start earning with us"
  },
  {
    title: "Connect With High-Value...",
    desc: "Partner with us to reach travelers who stay longer, cancel less, and spend more.f 70,000+...",
    bgImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
    btnText: "Start earning with us"
  },
  {
    title: "Scale Your Business, Maximiz...",
    desc: "Access Carthage's exclusive global inventory, broad portfolio, and instant availability to drive strong...",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    btnText: "Start earning with us"
  }
];

const AboutAffiliates = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header with Navigation */}
        <div className="flex justify-between items-start mb-8">
          <div className="">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Affiliation</h2>
            <p className="text-gray-500 text-sm border-gray-200 p-2 leading-relaxed">
              Empowering you with innovative solutions and data-driven insights to not just meet your goals—but surpass them.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {affiliationCards.map((card, idx) => (
            <div
              key={idx}
              className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={card.bgImage}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-white text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-white text-sm mb-6 leading-relaxed">
                  {card.desc}
                </p>
                <button className="self-start px-6 py-3 bg-[#222222] text-white text-sm font-semibold rounded-lg hover:bg-black cursor-pointer transition-colors">
                  {card.btnText}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutAffiliates;
