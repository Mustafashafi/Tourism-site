import React, { useState, useEffect } from "react";
import { apiService } from "../api";
import { toast } from "react-hot-toast";
import { Save, FileText, Layout, CheckSquare, Settings, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";

const CmsEditorPage = () => {
  const [activeTab, setActiveTab] = useState("pages"); // "pages", "homepage_curation"
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  // Content form
  const [contentForm, setContentForm] = useState({
    privacyPolicy: "",
    termsAndConditions: "",
    refundPolicy: "",
    faq: [],
    aboutUs: { title: "", content: "", mission: "", vision: "", heroImageUrl: "", sectionImageUrl: "" }
  });

  // Homepage Curation lists
  const [curation, setCuration] = useState({
    activities: [],
    cruises: [],
    holidays: []
  });

  useEffect(() => {
    fetchCmsDetails();
  }, []);

  const fetchCmsDetails = async () => {
    try {
      setLoading(true);
      const [settingsData, productsRes] = await Promise.all([
        apiService.getSettings(),
        apiService.listProducts({ limit: 1000 })
      ]);
      setSettings(settingsData);
      setProducts(productsRes.items || []);

      if (settingsData) {
        setContentForm({
          privacyPolicy: settingsData.privacyPolicy || "",
          termsAndConditions: settingsData.termsAndConditions || "",
          refundPolicy: settingsData.refundPolicy || "",
          faq: Array.isArray(settingsData.faq) ? settingsData.faq : [],
          aboutUs: {
            title: settingsData.siteContent?.aboutUs?.title || "",
            content: settingsData.siteContent?.aboutUs?.content || "",
            mission: settingsData.siteContent?.aboutUs?.mission || "",
            vision: settingsData.siteContent?.aboutUs?.vision || "",
            heroImageUrl: settingsData.siteContent?.aboutUs?.heroImageUrl || "",
            sectionImageUrl: settingsData.siteContent?.aboutUs?.sectionImageUrl || ""
          }
        });

        // Initialize curation lists
        const curationLists = settingsData.homepageCuration || { activities: [], cruises: [], holidays: [] };
        setCuration({
          activities: (curationLists.activities || []).map(x => typeof x === "string" ? x : x._id || x),
          cruises: (curationLists.cruises || []).map(x => typeof x === "string" ? x : x._id || x),
          holidays: (curationLists.holidays || []).map(x => typeof x === "string" ? x : x._id || x)
        });
      }
    } catch (err) {
      toast.error("Failed to load CMS details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCmsContent = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateSettings({
        privacyPolicy: contentForm.privacyPolicy,
        termsAndConditions: contentForm.termsAndConditions,
        refundPolicy: contentForm.refundPolicy,
        faq: contentForm.faq,
        siteContent: {
          aboutUs: contentForm.aboutUs
        }
      });
      toast.success("Main page content saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save content");
    }
  };

  const handleSaveCuration = async () => {
    try {
      await apiService.updateSettings({
        homepageCuration: curation
      });
      toast.success("Homepage showcase selections saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save showcase curation");
    }
  };

  const toggleCurationItem = (listName, prodId) => {
    setCuration(prev => {
      const list = [...prev[listName]];
      const index = list.indexOf(prodId);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        if (list.length >= 8) {
          toast.error("You can select up to 8 tours per section.");
          return prev;
        }
        list.push(prodId);
      }
      return {
        ...prev,
        [listName]: list
      };
    });
  };

  const getFilteredProducts = (categorySlugSub) => {
    return products.filter(p => {
      const slug = p.category?.slug?.toLowerCase() || "";
      return slug.includes(categorySlugSub);
    });
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        <p className="text-sm text-surface-500 font-medium">Loading CMS Editor...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">CMS & Content Editor</h2>
        <p className="text-sm text-surface-600">Edit core website pages, policies, and curate homepage showcase sections.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-surface-200">
        <button
          onClick={() => setActiveTab("pages")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "pages" ? "border-brand-600 text-brand-600" : "border-transparent text-surface-400 hover:text-surface-600"
          }`}
        >
          <FileText size={16} /> Main Pages Content
        </button>
        <button
          onClick={() => setActiveTab("homepage_curation")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "homepage_curation" ? "border-brand-600 text-brand-600" : "border-transparent text-surface-400 hover:text-surface-600"
          }`}
        >
          <Layout size={16} /> Homepage Showcase Curation
        </button>
      </div>

      {/* Tab Content: Main Pages Content */}
      {activeTab === "pages" && (
        <form onSubmit={handleSaveCmsContent} className="bg-white border border-surface-200 rounded-xl p-6 shadow-sm space-y-6">
          
          {/* About Us */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider">About Us Page</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Heading Title</label>
                <input
                  type="text"
                  value={contentForm.aboutUs.title}
                  onChange={(e) => setContentForm({
                    ...contentForm,
                    aboutUs: { ...contentForm.aboutUs, title: e.target.value }
                  })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Mission Statement</label>
                <input
                  type="text"
                  value={contentForm.aboutUs.mission}
                  onChange={(e) => setContentForm({
                    ...contentForm,
                    aboutUs: { ...contentForm.aboutUs, mission: e.target.value }
                  })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Vision Statement</label>
                <input
                  type="text"
                  value={contentForm.aboutUs.vision}
                  onChange={(e) => setContentForm({
                    ...contentForm,
                    aboutUs: { ...contentForm.aboutUs, vision: e.target.value }
                  })}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Section Image URL</label>
                <input
                  type="text"
                  value={contentForm.aboutUs.sectionImageUrl}
                  onChange={(e) => setContentForm({
                    ...contentForm,
                    aboutUs: { ...contentForm.aboutUs, sectionImageUrl: e.target.value }
                  })}
                  placeholder="https://..."
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Description Content</label>
                <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
                  <RichTextEditor
                    value={contentForm.aboutUs.content}
                    onChange={(value) => setContentForm({
                      ...contentForm,
                      aboutUs: { ...contentForm.aboutUs, content: value }
                    })}
                    placeholder="Write the About Us content with headings, paragraphs, and formatting..."
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={contentForm.aboutUs.heroImageUrl}
                  onChange={(e) => setContentForm({
                    ...contentForm,
                    aboutUs: { ...contentForm.aboutUs, heroImageUrl: e.target.value }
                  })}
                  placeholder="https://..."
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Legal Policies */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Legal Policies Content</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Privacy Policy</label>
                <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
                  <RichTextEditor
                    value={contentForm.privacyPolicy}
                    onChange={(value) => setContentForm({ ...contentForm, privacyPolicy: value })}
                    placeholder="Enter the privacy policy using heading, paragraph, and list formatting..."
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Terms & Conditions</label>
                <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
                  <RichTextEditor
                    value={contentForm.termsAndConditions}
                    onChange={(value) => setContentForm({ ...contentForm, termsAndConditions: value })}
                    placeholder="Enter the terms and conditions with structured headings and paragraphs..."
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Refund & Return Policy</label>
                <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
                  <RichTextEditor
                    value={contentForm.refundPolicy}
                    onChange={(value) => setContentForm({ ...contentForm, refundPolicy: value })}
                    placeholder="Enter the refund and return policy with structured formatting..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Homepage FAQs</h3>
                  <p className="text-xs text-surface-400">Add and edit FAQ entries shown on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setContentForm((prev) => ({
                    ...prev,
                    faq: [...prev.faq, { question: "", answer: "" }],
                  }))}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-600 bg-brand-600/10 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-600/15 transition"
                >
                  <Plus size={14} /> Add FAQ
                </button>
              </div>

              {contentForm.faq.map((faqItem, index) => (
                <div key={index} className="rounded-2xl border border-surface-200 bg-surface-50 p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Question</label>
                      <input
                        type="text"
                        value={faqItem.question}
                        onChange={(e) => {
                          const nextFaq = [...contentForm.faq];
                          nextFaq[index] = { ...nextFaq[index], question: e.target.value };
                          setContentForm({ ...contentForm, faq: nextFaq });
                        }}
                        placeholder="Enter FAQ question"
                        className="w-full bg-white border border-surface-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextFaq = contentForm.faq.filter((_, idx) => idx !== index);
                        setContentForm({ ...contentForm, faq: nextFaq });
                      }}
                      className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface-300 bg-white text-surface-500 hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove FAQ item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Answer</label>
                    <div className="rounded-xl border border-surface-200 bg-white overflow-hidden">
                      <RichTextEditor
                        value={faqItem.answer}
                        onChange={(value) => {
                          const nextFaq = [...contentForm.faq];
                          nextFaq[index] = { ...nextFaq[index], answer: value };
                          setContentForm({ ...contentForm, faq: nextFaq });
                        }}
                        placeholder="Enter the FAQ answer with formatted text..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} /> Save CMS Content
            </button>
          </div>

        </form>
      )}

      {/* Tab Content: Homepage Showcase Curation */}
      {activeTab === "homepage_curation" && (
        <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-sm space-y-8">
          
          {/* Curation Sliders */}
          {[
            { key: "activities", label: "Activities & Excursions", filterKeyword: "activit" },
            { key: "cruises", label: "Premium Cruises", filterKeyword: "cruise" },
            { key: "holidays", label: "Holiday Packages", filterKeyword: "holiday" }
          ].map((slider) => {
            const availProds = getFilteredProducts(slider.filterKeyword);
            return (
              <div key={slider.key} className="space-y-3 pb-6 border-b last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-surface-900">{slider.label} Slider</h3>
                  <span className="text-[10px] font-black uppercase bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                    {curation[slider.key].length} / 8 Selected
                  </span>
                </div>
                
                {availProds.length === 0 ? (
                  <p className="text-xs text-surface-400 bg-surface-50 p-4 rounded-xl">No active products found under this category.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto p-2 border rounded-xl bg-surface-50/50">
                    {availProds.map((p) => {
                      const isSelected = curation[slider.key].includes(p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => toggleCurationItem(slider.key, p._id)}
                          className={`p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-between ${
                            isSelected 
                              ? "bg-brand-50/70 border-brand-400 text-brand-700" 
                              : "bg-white border-surface-200 text-surface-700 hover:bg-surface-50"
                          }`}
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          <span className="text-[10px] shrink-0 uppercase tracking-wider text-surface-400">
                            {isSelected ? "✓ Pin" : "+ Add"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveCuration}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} /> Save Showcase Curation
            </button>
          </div>

        </div>
      )}

    </section>
  );
};

export default CmsEditorPage;
