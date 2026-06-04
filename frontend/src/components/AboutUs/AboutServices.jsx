import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

// Images
import s1 from "../../assets/service1.webp";
import s2 from "../../assets/service2.webp";
import s3 from "../../assets/service3.jpg";
import s4 from "../../assets/service4.jpg";
import s5 from "../../assets/service5.webp";
import s6 from "../../assets/service6.jpg";
import s7 from "../../assets/service7.webp";
import s8 from "../../assets/service8.jpg";
import s9 from "../../assets/service9.webp";
import s10 from "../../assets/service10.webp";

// Logos
import l1 from "../../assets/Horizontal Full Logo.webp"; // Since Carthage Travel & Tourism is the first one, let's use the main logo or fallback
import l2 from "../../assets/service2-logo.webp";
import l3 from "../../assets/service3-logo.webp";
import l4 from "../../assets/service4-logo.webp";
import l5 from "../../assets/service5-logo.webp";
import l6 from "../../assets/service6-logo.webp";
import l7 from "../../assets/service7-logo.webp";
import l8 from "../../assets/service8-logo.webp";
import l9 from "../../assets/service9-logo.webp";
import l10 from "../../assets/service10-logo.webp";

const servicesTextData = [
  {
    title: "Carthage Travel & Tourism",
    img: s1,
    logo: l1,
    desc: "Carthage Travel & Tourism is the flagship brand under the Carthage Group umbrella, specializing in inbound tourism to the UAE and offering a comprehensive range of travel services. Since 2009, it has evolved into one of the UAE's leading destination management companies, providing everything from visa processing and holiday bookings to hotel accommodations, airport transfers, sightseeing tours, and attraction tickets. Under the leadership of Senthil Velan and backed by a team of 924 employees, Carthage Travel & Tourism delivers professional, personalized travel experiences that embody Carthage Group's commitment to excellence and innovation in the tourism industry.",
    tags: ["Hotels", "Holidays", "Cruise", "Sightseeing", "attractions", "Visa Services", "activities", "visas"]
  },
  { title: "Arabian Explorers", img: s2, logo: l2, desc: "A premium B2B platform bridging global travel professionals with the Middle East's unparalleled luxury destinations. Arabian Explorers is a boutique destination management company specializing in bespoke, luxury travel experiences. It crafts tailor-made itineraries across the Middle East and beyond, ensuring high-end travelers enjoy exclusive journeys with personalized service. As part of Carthage Group, Arabian Explorers leverages decades of expertise to deliver seamless travel arrangements and unforgettable adventures.", tags: ["B2B Portal", "Agents", "Reservations"] },
  { title: "Deep Sea Adventures", img: s3, logo: l3, desc: "Exhilarating aquatic experiences and professional diving excursions in the pristine waters of the UAE. Balloon Flights offers a one-of-a-kind desert journey from the sky. Specializing in hot air balloon experiences, it provides guests with luxurious and unforgettable aerial tours over the UAE’s scenic landscapes. Each flight is operated by experienced pilots and backed by top-notch safety standards, ensuring a serene yet exhilarating sunrise adventure above the dunes.Tags: Hot Air Balloon, Aerial Tours, Desert Sunrise, Adventure, Scenic", tags: ["Diving", "Watersports", "Adventure"] },
  { title: "Balloon Flights", img: s4, logo: l4, desc: "Soar above the golden dunes in hot air balloons, offering a breathtaking aerial perspective of the desert at dawn.Balloon Flights offers a one-of-a-kind desert journey from the sky. Specializing in hot air balloon experiences, it provides guests with luxurious and unforgettable aerial tours over the UAE’s scenic landscapes. Each flight is operated by experienced pilots and backed by top-notch safety standards, ensuring a serene yet exhilarating sunrise adventure above the dunes.Tags: Hot Air Balloon, Aerial Tours, Desert Sunrise, Adventure, Scenic", tags: ["Aerial", "Luxury", "Sightseeing"] },
  { title: "Drive the Thrill", img: s5, logo: l5, desc: "Premium automobile experiences delivering adrenaline-pumping rides and luxury car rentals. Drive The Thrill delivers heart-pounding adventures across the dunes. This service lets adrenaline seekers take on the desert in all-terrain vehicles – from high-powered dune buggies to quad bikes – along with classic touches like camel rides. Guided by experts, every excursion balances excitement with safety, giving travelers an electrifying taste of off-road desert fun.", tags: ["Rentals", "Luxury Cars", "Experience"] },
  { title: "SkyraSoft", img: s6, logo: l6, desc: "An advanced IT solutions provider serving the travel industry with cutting-edge booking engines and travel software. Skyra Soft is the technology backbone of Carthage Group. As a market-leading travel IT company, it delivers holistic software solutions that power the group’s tourism operations. From online booking platforms to back-end integrations, Skyra Soft’s innovations enhance efficiency and create seamless digital experiences for both the business and its customers.", tags: ["IT Solutions", "Software", "Development"] },
  { title: "To & FRO", img: s7, logo: l7, desc: "Reliable and luxurious transportation networks ensuring seamless transfers across destinations. To&Fro is Carthage Group’s dedicated transportation arm. It operates a modern fleet of vehicles across the UAE, providing everything from airport transfers to chauffeured city tours. With professional drivers and round-the-clock service, To&Fro ensures each journey is comfortable, punctual, and stress-free for travelers.", tags: ["Transfers", "Chauffeur", "Transport"] },
  { title: "Carthage Events", img: s8, logo: l8, desc: "Crafting memorable corporate and social events with end-to-end planning and world-class execution. Carthage Events is the dedicated events and experiences division of the Carthage Group, specializing in curating, managing, and executing seamless corporate, social, and private events across the UAE and beyond. With a team of creative planners and operational experts, Carthage Events brings visions to life-be it grand product launches, destination weddings, gala dinners, or incentive trips", tags: ["Events", "Corporate", "MICE"] },
  { title: "Carthage Properties", img: s9, logo: l9, desc: "Expert real estate consulting and property management services under the Carthage Group. Carthage Properties is the real estate arm of the Carthage Group, bridging tourism and property investment. It was established to meet the rising demand from international investors seeking exceptional opportunities in Dubai’s real estate market. The division provides end-to-end consulting for acquiring luxury residences and investment properties. Backed by a network of top developers and deep market insight, Carthage Properties serves as a one-stop solution for clients looking to make Dubai their next investment destination or home", tags: ["Real Estate", "Consulting", "Management"] },
  { title: "Water Links", img: s10, logo: l10, desc: "Exceptional yacht charters and premium maritime experiences along iconic coastlines. Water Link is the marine leisure brand under Carthage Group, offering an exciting range of water-based adventures and experiences. From luxury yacht charters and deep-sea fishing to adrenaline-pumping watersports and scenic cruises, Water Link redefines aquatic exploration in the UAE. Whether it's a family getaway, romantic sunset cruise, or group celebration, Water Link ensures safety, thrill, and luxury all in one package. Operated by seasoned professionals and backed by premium fleets, Water Link is your gateway to unforgettable marine experiences.", tags: ["Yachts", "Charters", "Luxury"] }
];

const AboutServices = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = servicesTextData[activeIndex];

  return (
    <section id="services" className="py-10 bg-white shrink-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Services - Omnipresent at every holiday touchpoint</h2>
          <p className="text-gray-500 text-sm">Our brand presence</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

          {/* Left Column: Vertical Tabs */}
          <div className="w-full lg:w-[350px] shrink-0 flex flex-col">
            {servicesTextData.map((service, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${activeIndex === idx ? "bg-gray-50/80 font-medium" : "bg-white hover:bg-gray-50/50"
                  }`}
              >
                <span className="text-[15px] text-gray-800">{service.title}</span>
                <ChevronRight size={18} className={`${activeIndex === idx ? "text-gray-600" : "text-gray-400"}`} />
              </div>
            ))}
          </div>

          {/* Right Column: Content Viewer */}
          <div className="flex-1 flex flex-col animate-fadeIn">
            {/* Logo */}
            {activeService.logo && (
              <img
                src={activeService.logo}
                alt={`${activeService.title} Logo`}
                className="h-10 object-contain mb-2 self-start"
              />
            )}

            {/* Description */}
            <p className="text-sm text-gray-600 leading-7 mb-2">
              {activeService.desc}
            </p>

            {/* Main Image */}
            <div className="w-full h-[250px] rounded-2xl overflow-hidden mb-2">
              <img
                src={activeService.img}
                alt={activeService.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tags / Pills */}
            <div className="flex flex-wrap gap-3">
              {activeService.tags.map((tag, tagIdx) => (
                <span
                  key={tagIdx}
                  className="px-4 py-2 border border-gray-200 rounded text-xs font-medium text-gray-700 bg-white"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutServices;
