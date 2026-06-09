import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Briefcase, Globe, Languages, FileText, ShieldCheck, Info, Phone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const UserSidebar = ({ isOpen, onClose }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const { clearCart, cartCount } = useCart();

  useEffect(() => {
    if (isOpen) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Fetch real booking count from the backend (same as UserProfile)
        fetchBookingCount(parsedUser.email);
      } else {
        setUser(null);
        setBookingCount(0);
      }
    }
  }, [isOpen]);

  const fetchBookingCount = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings?search=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.data) {
        setBookingCount(data.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch booking count", err);
      setBookingCount(0);
    }
  };

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-60 backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed right-0 top-0 h-full w-full max-w-100 bg-white z-70 shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">My Account</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Login Promo Box */}
            <div className="p-4">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex justify-between items-center">
                {user ? (
                  <>
                    <div className="flex flex-col">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Logged in as</p>
                      <p className="text-gray-800 font-bold text-sm truncate max-w-[180px]">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 font-semibold text-sm">Already have an account?</p>
                    <button 
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        onClose();
                      }}
                      className="bg-[#2D2D2D] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors cursor-pointer"
                    >
                      Login Now
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Menu Sections */}
            <div className="flex-1 px-6 space-y-8 pb-10">
              {/* Section: My Account */}
              <div className='border-t border-b w-full border-gray-100 py-4'>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">My Account</h3>
                <div className="space-y-1">
                  <SidebarItem to="/cart" onClick={onClose} icon={<ShoppingCart size={20}/>} label="Cart" value={cartCount > 0 ? `${cartCount} Item${cartCount > 1 ? 's' : ''}` : "Empty"} />
                  <SidebarItem to="/profile" onClick={onClose} icon={<Briefcase size={20}/>} label="My Bookings" value={bookingCount > 0 ? `${bookingCount} Booking${bookingCount > 1 ? 's' : ''}` : "None"} />
                  <SidebarItem icon={<Globe size={20}/>} label="Currency" value="AED" />
                  <SidebarItem icon={<Languages size={20}/>} label="Language" value="English" />
                </div>
              </div>

              {/* Section: Compliance */}
              <div className=' border-b w-full border-gray-100 pb-4'>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Compliance</h3>
                <div className="space-y-1">
                  <SidebarItem to="/terms-conditions" onClick={onClose} icon={<FileText size={20}/>} label="Terms & Conditions" />
                  <SidebarItem to="/privacy-policy" onClick={onClose} icon={<ShieldCheck size={20}/>} label="Privacy Policy" />
                </div>
              </div>

              {/* Section: Help & Support */}
              <div className='w-full border-gray-100 pb-1'>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Help & Support</h3>
                <div className="space-y-1">
                  <SidebarItem to="/about-us" onClick={onClose} icon={<Info size={20}/>} label="About Us" />
                  <SidebarItem to="/contact" onClick={onClose} icon={<Phone size={20}/>} label="Contact Us" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

// Reusable Menu Item Component
const SidebarItem = ({ icon, label, value, to, onClick }) => {
  const content = (
    <div className="w-full flex items-center justify-between py-4 hover:bg-gray-50 rounded-xl px-2 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="text-gray-400 group-hover:text-gray-800 transition-colors">{icon}</div>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-gray-400 text-sm">{value}</span>}
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
};

export default UserSidebar;