import React from "react";
import { FaLinkedinIn } from "react-icons/fa";

// You can replace these placeholder images with the actual Carthage Travel & Tourism executive images later
// The organic clip-path mask will look great when you drop in transparent cutout images!
const leaders = [
  { name: "Manoj Tulsani", role: "Founder · Carthage Travel & Tourism", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop" },
  { name: "Senthil Velan", role: "CEO", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" },
  { name: "Prateek Tulsani", role: "CFO", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
  { name: "Rinki Tulsani", role: "Head of Contracting · Travel Desks", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" },
  { name: "Parizad Shah", role: "Head · Human Resource", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop" },
  { name: "Sandra Lobo", role: "Business Head · Cruises", image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop" },
  { name: "Ranjan Kumar Singh", role: "Sales Head · B2B India", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  { name: "Rajkumar Gaikwad", role: "Sales head · Retail", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" }
];

const AboutLeadership = () => {
  return (
    <section id="leadership" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="px-8 py-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-3">Our Leadership Team</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-5xl">
            Our leadership is built on vision, collaboration, and accountability. We believe in empowering people, encouraging innovation, and leading by example. Through clear direction and shared goals, we inspire our teams to perform at their best and deliver lasting results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-8">
          {leaders.map((leader, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center pt-8 pb-6 px-4 hover:shadow-md transition-shadow">

              <div className="relative w-full flex justify-center mb-6">
                <div className="relative w-36 h-36">
                  {/* Organic painted blob background style - will pop behind cutouts */}
                  <div className="absolute inset-0 bg-red-50 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] scale-125 rotate-12 -z-10"></div>

                  {/* Organic image cutout styling */}
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover rounded-[30%_70%_70%_30%/30%_30%_70%_70%] z-10 relative"
                  />

                  {/* LinkedIn Logo Tag */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                    <a href="#" className="w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-600 hover:text-blue-600 shadow-sm transition-colors">
                      <FaLinkedinIn size={14} />
                    </a>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1">{leader.name}</h3>
              <p className="text-[11px] text-gray-400 uppercase font-medium tracking-wide">{leader.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutLeadership;
