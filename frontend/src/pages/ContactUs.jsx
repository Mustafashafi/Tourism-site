import React, { useEffect, useState } from "react";
import { homeApi } from "../services/homeApi";
import SectionWrapper from "../components/SectionWrapper";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";

const ContactUs = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    homeApi.getSettings()
      .then(data => {
        setSettings(data);
      })
      .catch(err => {
        console.error("Failed to load settings on contact page:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent successfully. ✅");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1200);
  };

  const phoneVal = settings?.contactDetails?.phone || "+971 4 208 7444";
  const emailVal = settings?.contactDetails?.email || "info@carthagetravel.com";
  const addressVal = settings?.contactDetails?.address || "Dubai, United Arab Emirates";
  const descVal = settings?.contactDetails?.description || "Have questions about our tours or need help planning your trip? Get in touch with our team of experts.";

  return (
    <div className="min-h-screen bg-gray-50/30 py-8 font-sans">
      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#CC1422] bg-[#CC1422]/10 px-3 py-1 rounded-full">
                Get In Touch
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-3 mb-2">Contact Us</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                {descVal}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-[#CC1422] rounded-xl">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Call Us</h4>
                  <a href={`tel:${phoneVal.replace(/\s+/g, '')}`} className="text-base font-bold text-gray-800 hover:text-[#CC1422] transition-colors">
                    {phoneVal}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-[#CC1422] rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Email Us</h4>
                  <a href={`mailto:${emailVal}`} className="text-base font-bold text-gray-800 hover:text-[#CC1422] transition-colors">
                    {emailVal}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-[#CC1422] rounded-xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Our Office</h4>
                  <p className="text-base font-bold text-gray-800 leading-snug">
                    {addressVal}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-850 mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="input w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Your Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry topic"
                  className="input w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="input w-full min-h-[120px] py-3"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#CC1422] hover:bg-[#b0101c] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} />
                {submitting ? "Sending message..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default ContactUs;
