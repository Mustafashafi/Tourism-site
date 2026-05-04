import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useCart } from '../context/CartContext';

const LoginModal = ({ isOpen, onClose }) => {
  const [showEmailField, setShowEmailField] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const { fetchCartData } = useCart();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsSending(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await axios.post(`${API_BASE_URL}/auth/google`, {
          token: tokenResponse.access_token,
          isAccessToken: true
        });

        // Store user data and token
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        await fetchCartData();

        // Reload to reflect changes or handle state locally
        window.location.reload(); 
        onClose();
      } catch (err) {
        console.error("Google Auth Error:", err);
        setError("Google authentication failed. Please try again.");
      } finally {
        setIsSending(false);
      }
    },
    onError: () => {
      setError("Google Login was unsuccessful. Try again.");
    }
  });

  // Reset modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowEmailField(false);
        setEmail('');
        setIsSent(false);
        setError('');
        setIsSending(false);
      }, 300); // Wait for the close animation to finish
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendLink = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      await axios.post(`${API_BASE_URL}/auth/magiclink/send`, { email });
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send link. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenInbox = () => {
    if (!email) {
      onClose();
      return;
    }
    const domain = email.split('@')[1]?.toLowerCase();
    const encodedEmail = encodeURIComponent(email);
    
    if (domain === 'gmail.com') {
      window.open(`https://accounts.google.com/AccountChooser?Email=${encodedEmail}&continue=https://mail.google.com/`, '_blank');
    } else if (domain === 'yahoo.com' || domain === 'ymail.com') {
      window.open(`https://login.yahoo.com/config/login?login=${encodedEmail}&.done=https://mail.yahoo.com`, '_blank');
    } else if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
      window.open(`https://login.live.com/login.srf?wa=wsignin1.0&wreply=https://outlook.live.com/mail/0/inbox&login_hint=${encodedEmail}`, '_blank');
    } else if (['icloud.com', 'me.com', 'mac.com'].includes(domain)) {
      window.open('https://www.icloud.com/mail', '_blank');
    } else {
      // Fallback
      window.open(`https://${domain}`, '_blank');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
          >
            {isSent ? (
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your email!</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  To sign in, tap the button in the email we sent to
                  <br />
                  <span className="font-semibold text-gray-800">{email}</span>
                </p>
                <button 
                  onClick={handleOpenInbox}
                  className="w-full bg-[#2D2D2D] hover:bg-black text-white font-bold py-4 rounded-2xl transition-colors cursor-pointer text-lg"
                >
                  Go to Inbox
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                  <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Google Button */}
                <button 
                  onClick={() => handleGoogleLogin()}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-gray-800 font-semibold mb-6 disabled:opacity-50"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>{isSending ? 'Authenticating...' : 'Continue with Google'}</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <span className="text-gray-500 text-sm font-medium">or</span>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                {/* Email Section */}
                {!showEmailField ? (
                  <button 
                    onClick={() => setShowEmailField(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-gray-800 font-semibold mb-2"
                  >
                    <Mail size={22} className="text-gray-800" strokeWidth={2} />
                    <span>Continue with Email</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        placeholder="Enter Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200'}`}
                      />
                      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <button 
                      onClick={handleSendLink}
                      disabled={isSending}
                      className="w-full bg-[#333333] hover:bg-black disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors cursor-pointer"
                    >
                      {isSending ? 'Sending...' : 'Send Link'}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
