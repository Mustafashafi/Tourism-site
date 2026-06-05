import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { homeApi } from "../services/homeApi";

const AboutUs = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    homeApi.getSettings()
      .then((data) => setSettings(data))
      .catch(() => {
        // ignore load failure
      });
  }, []);

  const aboutUs = settings?.siteContent?.aboutUs || {};
  const contact = settings?.contactDetails || {};
  const heroImage = aboutUs.heroImageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop";
  const sectionImage = aboutUs.sectionImageUrl || "";

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-900 text-white">
        <img
          src={heroImage}
          alt="About Carthage Travel"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-28">
          <p className="mb-4 inline-flex rounded-full bg-brand-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-200">
            About Us
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {aboutUs.title || "Carthage Travel & Tourism"}
          </h1>
          <div
            className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg prose prose-invert"
            dangerouslySetInnerHTML={{ __html: aboutUs.content || "<p>We design simple, reliable travel experiences across the UAE for both leisure and business guests.</p>" }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Our mission</h2>
            <p className="mt-4 text-slate-600">
              {aboutUs.mission || "To deliver trusted UAE travel experiences with expert planning, strong local support, and transparent pricing."}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Our vision</h2>
            <p className="mt-4 text-slate-600">
              {aboutUs.vision || "To become the most recommended travel partner for guests exploring the UAE."}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Why choose us</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>• UAE local expertise with premium tour curation.</li>
              <li>• Flexible booking and payment options.</li>
              <li>• Customer-first support across every itinerary.</li>
            </ul>
          </div>

          {sectionImage && (
            <div className="overflow-hidden rounded-[28px] border border-slate-200/70 shadow-sm">
              <img src={sectionImage} alt="About section" className="h-[360px] w-full object-cover" />
            </div>
          )}
        </div>

        <aside className="space-y-6 rounded-[28px] border border-slate-200/70 bg-slate-950 p-8 text-white shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Contact</p>
            <h3 className="mt-3 text-2xl font-bold">Let’s plan your next UAE trip</h3>
            <p className="mt-4 text-slate-300">{contact.description || "Share your goals and our travel experts will build a seamless itinerary for you."}</p>
          </div>

          {contact.phone && (
            <div className="rounded-[24px] bg-slate-900/90 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Phone</p>
              <p className="mt-2 flex items-center gap-3 text-lg font-semibold text-white">
                <Phone size={18} /> {contact.phone}
              </p>
            </div>
          )}

          {contact.email && (
            <div className="rounded-[24px] bg-slate-900/90 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
              <p className="mt-2 flex items-center gap-3 text-lg font-semibold text-white">
                <Mail size={18} /> {contact.email}
              </p>
            </div>
          )}

          {contact.address && (
            <div className="rounded-[24px] bg-slate-900/90 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Office</p>
              <p className="mt-2 flex items-start gap-3 text-sm leading-7 text-slate-300">
                <MapPin size={18} className="mt-1" /> {contact.address}
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default AboutUs;
