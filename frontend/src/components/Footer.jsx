import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import logo from '../assets/carthage-logo.jpg';
import { Link } from 'react-router-dom';
import { homeApi } from '../services/homeApi';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [tourTypes, setTourTypes] = useState([]);

  useEffect(() => {
    homeApi.getSettings()
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load footer settings:", err));

    Promise.all([
      homeApi.getSubCategories(),
      homeApi.getTourTypes(),
      homeApi.getProducts({ limit: 100 })
    ]).then(([subs, types, prods]) => {
      const activeSubIds = new Set(prods.map(p => p.subCategory?._id || p.subCategory));
      const activeTypeIds = new Set(prods.map(p => p.tourType?._id || p.tourType));
      
      setSubCategories(Array.isArray(subs) ? subs.filter(s => activeSubIds.has(s._id)) : []);
      setTourTypes(Array.isArray(types) ? types.filter(t => activeTypeIds.has(t._id)) : []);
    }).catch(err => console.error("Failed to load footer lists:", err));
  }, []);

  const socialLinks = settings?.socialLinks || {};
  const contactDetails = settings?.contactDetails || {};
  const footerLogo = settings?.logos?.footerLogo || logo;

  const phoneVal = contactDetails.phone || "+971 4 208 7444";
  const emailVal = contactDetails.email || "info@carthagetravel.com";
  const addressVal = contactDetails.address || "Dubai, UAE";
  const descVal = contactDetails.description || "Your premier travel partner in the UAE, offering curated day tours, luxury cruises, and holiday packages.";

  return (
    <footer className="bg-[#111118] text-gray-300 border-t border-gray-800 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-[95%] lg:max-w-[80%] max-w-[1400px] mx-auto">
        
        {/* Top Tier: 5 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Column 1: Destinations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={footerLogo} alt="Carthage Travel" className="h-16 object-contain rounded-md" />
            </div>
            <h4 className="font-bold text-white text-base tracking-wider uppercase">Destinations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tours?city=dubai" className="hover:text-white transition-colors">Dubai</Link></li>
              <li><Link to="/tours?city=abu-dhabi" className="hover:text-white transition-colors">Abu Dhabi</Link></li>
              <li><Link to="/tours?city=sharjah" className="hover:text-white transition-colors">Sharjah</Link></li>
              <li><Link to="/tours?city=ras-al-khaimah" className="hover:text-white transition-colors">Ras Al Khaimah</Link></li>
            </ul>
          </div>

          {/* Column 2: Subcategories */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base tracking-wider uppercase">Subcategories</h4>
            <ul className="space-y-2 text-sm">
              {subCategories.map(sub => (
                <li key={sub._id}>
                  <Link to={`/tours?subCategory=${sub.slug}`} className="hover:text-white transition-colors">
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Tour Types */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base tracking-wider uppercase">Tour Types</h4>
            <ul className="space-y-2 text-sm">
              {tourTypes.map(t => (
                <li key={t._id}>
                  <Link to={`/tours?tourType=${t.slug}`} className="hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base tracking-wider uppercase">Legal & Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Return Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base tracking-wider uppercase">Contact Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#CC1422] mt-0.5 shrink-0" />
                <a href={`tel:${phoneVal.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {phoneVal}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#CC1422] mt-0.5 shrink-0" />
                <a href={`mailto:${emailVal}`} className="hover:text-white transition-colors">
                  {emailVal}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#CC1422] mt-0.5 shrink-0" />
                <span className="leading-snug">{addressVal}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Second Tier: Copyright, Socials, Payments */}
        <div className="border-t border-gray-800 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          
          {/* Left: Copyright */}
          <div className="text-sm text-gray-500 text-center lg:text-left">
            <span>© {new Date().getFullYear()} Carthage Travel & Tourism. All rights reserved.</span>
          </div>

          {/* Center: Payment Icons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
              alt="Mastercard" 
              className="h-7 w-10 bg-white/5 border border-white/10 rounded p-1 object-contain" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" 
              alt="Amex" 
              className="h-7 w-10 bg-white/5 border border-white/10 rounded p-1 object-contain" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
              alt="PayPal" 
              className="h-7 w-10 bg-white/5 border border-white/10 rounded p-1 object-contain" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" 
              alt="Apple Pay" 
              className="h-7 w-10 bg-white/5 border border-white/10 rounded p-1 object-contain" 
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" 
              alt="Google Pay" 
              className="h-7 w-10 bg-white/5 border border-white/10 rounded p-1 object-contain" 
            />
          </div>

          {/* Right: Dynamic Social Icons */}
          <div className="flex gap-3">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#CC1422] hover:text-white transition-all text-gray-400">
                <FaFacebookF size={14} />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#CC1422] hover:text-white transition-all text-gray-400">
                <FaInstagram size={14} />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#CC1422] hover:text-white transition-all text-gray-400">
                <FaTwitter size={14} />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#CC1422] hover:text-white transition-all text-gray-400">
                <FaYoutube size={14} />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#CC1422] hover:text-white transition-all text-gray-400">
                <FaLinkedinIn size={14} />
              </a>
            )}
            {socialLinks.whatsapp && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#CC1422] hover:text-white transition-all text-gray-400">
                <FaWhatsapp size={14} />
              </a>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;