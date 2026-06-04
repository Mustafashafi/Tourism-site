import React from 'react';

const SectionWrapper = ({ children, className = "" }) => {
  return (
    <section className={`mx-auto my-8 md:my-12 w-[95%] lg:w-[80%] max-w-[1400px] bg-[#f5f5f5] rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-sm transition-all duration-300 ${className}`}>
      {children}
    </section>
  );
};

export default SectionWrapper;
