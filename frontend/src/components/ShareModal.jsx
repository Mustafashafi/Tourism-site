import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Mail, Cloud, QrCode, Link as LinkIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, url, productName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: 'Nearby Sharing', icon: <Share2 size={24} />, color: 'bg-blue-500' },
    { name: 'WhatsApp', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ), color: 'bg-green-500', shareUrl: `https://wa.me/?text=${encodeURIComponent(productName + ' ' + url)}` },
    { name: 'Outlook', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10-10-4.48-10-10 4.48-10 10-10zm0 18c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    ), color: 'bg-blue-600', shareUrl: `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(url)}` },
    { name: 'Gmail', icon: <Mail size={24} />, color: 'bg-red-500', shareUrl: `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ), color: 'bg-blue-700', shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter', icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ), color: 'bg-black', shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ), color: 'bg-blue-800', shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'iCloud', icon: <Cloud size={24} />, color: 'bg-sky-400' },
  ];

  const recentContacts = [
    { name: 'Muhammad Bilal (You)', initial: 'MB', subIcon: 'gmail' },
    { name: 'outlook_20DA1...', initial: 'O', subIcon: 'outlook' },
    { name: 'Muhammad Bilal (You)', initial: 'MB', subIcon: 'whatsapp' },
    { name: 'Meraj G', initial: 'MG', subIcon: 'whatsapp' },
    { name: 'Rafi Cxn', initial: 'RC', subIcon: 'whatsapp', img: 'https://i.pravatar.cc/150?u=rafi' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] bg-[#202124] rounded-[28px] border border-white/10 shadow-2xl z-[101] overflow-hidden text-white font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Share2 size={20} />
                </div>
                <h2 className="text-lg font-medium">Share link</h2>
              </div>
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?u=bilal" alt="User" className="w-8 h-8 rounded-full border border-white/20" />
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* URL Input */}
            <div className="px-6 py-2">
              <div className="flex items-center gap-3 bg-[#2d2e31] p-3 rounded-2xl border border-white/5 group focus-within:border-blue-500/50 transition-all">
                <div className="p-2 bg-white/5 rounded-xl">
                  <LinkIcon size={20} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  readOnly 
                  value={url} 
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-300 overflow-hidden text-ellipsis"
                />
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                    <QrCode size={18} />
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 relative"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Contacts */}
            <div className="px-6 py-6">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {recentContacts.map((contact, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer">
                    <div className="relative">
                      {contact.img ? (
                        <img src={contact.img} alt={contact.name} className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-lg font-semibold border-2 border-transparent group-hover:border-blue-500 transition-all">
                          {contact.initial}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#202124] flex items-center justify-center border border-white/10">
                        {contact.subIcon === 'whatsapp' && (
                          <div className="w-4 h-4 text-green-500">
                             <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          </div>
                        )}
                        {contact.subIcon === 'gmail' && <Mail size={12} className="text-red-500" />}
                        {contact.subIcon === 'outlook' && <div className="w-3 h-3 bg-blue-600 rounded-sm" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-center text-gray-400 line-clamp-2 max-w-[64px]">
                      {contact.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/5 mx-6" />

            {/* Share Using */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-medium text-gray-400 mb-6">Share using</h3>
              <div className="grid grid-cols-4 gap-y-8">
                {shareOptions.map((option, i) => (
                  <button 
                    key={i} 
                    onClick={() => option.shareUrl && window.open(option.shareUrl, '_blank')}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${option.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95`}>
                      {option.icon}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium group-hover:text-white transition-colors">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer shadow/gradient */}
            <div className="h-4 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
