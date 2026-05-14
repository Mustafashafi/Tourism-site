import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Check, Users, Building2, Map, Ticket, Activity, Plane, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const SubmitRequest = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get passed state from booking page or default to null
  const bookingState = location.state || {};
  const { guests, selectedDate, flightStatus, totalPrice, product } = bookingState;

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    doNotSendOffers: false,
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If we land here without product data (e.g., direct link access or refresh), 
    // it's safer to redirect back to the product details to rebuild state.
    if (!product) {
      navigate(`/holidays/${slug}`);
    }
  }, [product, navigate, slug]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          productId: product._id,
          productName: product.name,
          bookingDetails: {
            date: selectedDate?.date?.toISOString() || null,
            guests: guests || { adult: 1, child: 0, infant: 0 },
            flightStatus: flightStatus || "Not specified",
            totalPrice: totalPrice || 0,
          },
        }),
      });

      // Handle non-JSON responses (like 404 HTML pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (response.ok) {
        toast.success("Request submitted successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message.includes("Server returned") 
        ? error.message 
        : "Network error. Please make sure the backend server is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">Loading...</div>;
  }

  const totalGuests = (guests?.adult || 0) + (guests?.child || 0) + (guests?.infant || 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Enter Your Details */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Enter Your Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center px-4 bg-white border border-gray-200 border-r-0 rounded-l-xl text-gray-600 font-medium">
                      <span className="mr-2">🇵🇰</span> +92
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="doNotSendOffers"
                    id="doNotSendOffers"
                    checked={formData.doNotSendOffers}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label htmlFor="doNotSendOffers" className="text-sm text-gray-600">
                    Do not send me offers via Email, SMS, RCS, WhatsApp and other electronic channels
                  </label>
                </div>
              </div>
            </div>

            {/* Update Additional Details */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Update Additional Details</h2>
              
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-4">{product.name}</p>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter Remarks"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-[#2D2D2D] hover:bg-black text-white rounded-xl font-bold text-[15px] transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>

          {/* Sidebar (Right Side) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Steps Indicator */}
            <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center text-sm font-medium">
              <div className="flex items-center text-green-500 gap-1.5">
                <Check size={16} /> <span>1. Check Availability</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 mx-3" />
              <div className="text-gray-500">
                2. Submit Request
              </div>
            </div>

            {/* Edit Preferences */}
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-semibold text-[14px] hover:bg-gray-50 transition-all shadow-sm"
            >
              Edit Preferences
            </button>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6">
              
              <div className="flex gap-4">
                <div className="w-[85px] h-[85px] rounded-2xl overflow-hidden bg-gray-50 shrink-0 shadow-sm">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-1 flex-1">
                  <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                      <Users size={14} className="text-gray-400" />
                      {guests?.adult || 1} Adult {guests?.child > 0 ? `, ${guests.child} Child` : ''}
                    </div>
                    {flightStatus && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                        <Plane size={14} className="text-gray-400" />
                        {flightStatus === "No, I haven't" ? "Flight not booked" : "Flight booked"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feature Icons Row */}
              <div className="flex flex-wrap gap-x-4 gap-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <Building2 size={14} className="text-gray-400" /> Hotels
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <Map size={14} className="text-gray-400" /> Sightseeing
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <Ticket size={14} className="text-gray-400" /> Entry Tickets
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <Activity size={14} className="text-gray-400" /> Activities
                </div>
              </div>

            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default SubmitRequest;
