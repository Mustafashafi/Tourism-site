import React, { useEffect, useState } from "react";
import { homeApi } from "../services/homeApi";
import SectionWrapper from "../components/SectionWrapper";

const TermsAndConditions = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    homeApi.getSettings()
      .then(settings => {
        if (settings?.termsAndConditions) {
          setContent(settings.termsAndConditions);
        } else {
          setContent("<p>Terms & Conditions content is currently being updated. Please check back later.</p>");
        }
      })
      .catch(() => {
        setContent("<p>Failed to load Terms & Conditions. Please try again later.</p>");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <SectionWrapper>
        <div className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
          <p className="text-sm text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        {loading ? (
          <div className="py-20 text-center text-gray-500 animate-pulse">Loading terms and conditions...</div>
        ) : (
          <div 
            className="prose max-w-none text-gray-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        )}
      </SectionWrapper>
    </div>
  );
};

export default TermsAndConditions;
