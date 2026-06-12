import { useEffect, useMemo, useState } from "react";
import { apiService } from "../api";
import toast from "react-hot-toast";
import RichTextEditor from "./RichTextEditor";

const makeEmptyImageSlot = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  url: "",
  publicId: "",
  uploading: false,
});

const defaultTransferOptions = () => [
  { name: "Without Transfer", type: "without_transfer", adultPrice: 0, childPrice: 0, infantPrice: 0 },
  { name: "Shared Transfer", type: "shared", adultPrice: 0, childPrice: 0, infantPrice: 0 },
  { name: "Private Transfer", type: "private", adultPrice: 0, childPrice: 0, infantPrice: 0 }
];

const initialProduct = {
  name: "",
  slug: "",
  category: "",
  subCategory: "",
  city: "",
  tourType: "",
  type: "activity",
  location: "",
  images: [makeEmptyImageSlot()],
  highlights: [{ title: "", description: "", icon: "" }, { title: "", description: "", icon: "" }],
  contentSections: [{ title: "", description: "" }, { title: "", description: "" }],
  actualPrice: "",
  discountPrice: "",
  childPrice: "",
  teenPrice: "",
  kidPrice: "",
  infantPrice: "",
  currency: "AED",
  rating: '',
  reviews: '',
  isProductNew: false,
  cruiseLine: "",
  departureCity: "",
  duration: "",
  durationInHours: "",
  durationInDays: "",
  manualCity: "",
  inclusions: "",
  exclusions: "",
  applicationSteps: [{ step: 1, title: "", description: "" }],
  documentsRequired: "",
  guestPolicy: "",
  importantInformation: "",
  faq: [{ question: "", answer: "" }],
  bookingType: "check_availability",
  itinerary: [{ day: 1, title: "", description: "" }],
  mapAddress: "",
  visaOptions: [{ title: "", description: "", processingTime: "" }],
  cabinOptions: [{ name: "", price: "" }],
  processingTypes: ["Normal", "Express"],
  seo: {
    metaTitle: "",
    metaDescription: "",
    focusKeyphrase: "",
  },
  transferOptions: defaultTransferOptions(),
};

const toSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const extractCloudinaryPublicId = (url = "") => {
  try {
    const cleanUrl = url.split("?")[0];
    const marker = "/upload/";
    const markerIndex = cleanUrl.indexOf(marker);
    if (markerIndex === -1) return "";
    const filePath = cleanUrl.slice(markerIndex + marker.length);
    const withoutVersion = filePath.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return "";
  }
};

const ProductSection = ({ categories, cities, subCategories = [], tourTypes = [] }) => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter criteria states
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [filterTourType, setFilterTourType] = useState("");

  const filteredSubCategories = useMemo(() => {
    if (!form.category) return [];
    return subCategories.filter(
      (sub) =>
        sub.category === form.category ||
        (sub.category && sub.category._id === form.category)
    );
  }, [form.category, subCategories]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.name &&
        (form.slug || toSlug(form.name))
      ),
    [form]
  );

  const fetchProducts = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await apiService.listProducts({ page: nextPage, limit: 100 }); // Increase limit so local search/filter works better
      setProducts(result.items);
      setMeta(result.meta);
    } catch (err) {
      toast.error(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const onChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && (!prev.slug || prev.slug === toSlug(prev.name))) {
        next.slug = toSlug(value);
      }
      return next;
    });
  };

  const onSEOChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [key]: value,
      },
    }));
  };

  const onTransferPriceChange = (index, field, value) => {
    setForm((prev) => {
      const nextOptions = [...prev.transferOptions];
      nextOptions[index] = {
        ...nextOptions[index],
        [field]: value
      };
      return {
        ...prev,
        transferOptions: nextOptions
      };
    });
  };

  const reset = () => {
    setForm({ ...initialProduct, images: [makeEmptyImageSlot()], transferOptions: defaultTransferOptions() });
    setEditingId(null);
  };

  const buildPayload = (images = []) => ({
    name: form.name.trim(),
    slug: (form.slug.trim() || toSlug(form.name)).toLowerCase(),
    category: form.category,
    city: form.manualCity ? null : form.city,
    manualCity: form.manualCity.trim() || undefined,
    location: form.location.trim(),
    images,
    highlights: form.highlights
      .filter((h) => h.title)
      .map((h) => ({ title: h.title, description: h.description || "", icon: h.icon })),
    contentSections: form.contentSections
      .filter((c) => c.title)
      .map((c) => ({ title: c.title, description: c.description || "" })),
    pricing: {
      actualPrice: form.actualPrice !== "" ? Number(form.actualPrice) : undefined,
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      childPrice: form.childPrice !== "" ? Number(form.childPrice) : undefined,
      teenPrice: form.teenPrice !== "" ? Number(form.teenPrice) : undefined,
      kidPrice: form.kidPrice !== "" ? Number(form.kidPrice) : undefined,
      infantPrice: form.infantPrice !== "" ? Number(form.infantPrice) : undefined,
      currency: form.currency || "AED",
    },
    cabinOptions: form.cabinOptions.filter(c => c.name).map(c => ({
      name: c.name.trim(),
      price: Number(c.price) || 0
    })),
    rating: Number(form.rating),
    reviews: Number(form.reviews),
    isProductNew: !!form.isProductNew,
    cruiseLine: form.cruiseLine?.trim() || undefined,
    departureCity: form.departureCity?.trim() || undefined,
    duration: form.duration?.trim() || undefined,
    durationInHours: form.durationInHours !== "" ? Number(form.durationInHours) : undefined,
    durationInDays: form.durationInDays !== "" ? Number(form.durationInDays) : undefined,
    inclusions: form.inclusions ? form.inclusions.split(",").map(s => s.trim()).filter(Boolean) : [],
    exclusions: form.exclusions ? form.exclusions.split(",").map(s => s.trim()).filter(Boolean) : [],
    applicationSteps: form.applicationSteps.filter(s => s.title || s.description),
    documentsRequired: form.documentsRequired ? form.documentsRequired.split(",").map(s => s.trim()).filter(Boolean) : [],
    guestPolicy: form.guestPolicy?.trim() || undefined,
    importantInformation: form.importantInformation?.trim() || undefined,
    faq: form.faq.filter(f => f.question || f.answer),
    bookingType: form.bookingType || "check_availability",
    itinerary: form.itinerary.filter(i => i.title || i.description),
    mapAddress: form.mapAddress?.trim() || undefined,
    visaOptions: form.visaOptions.filter(v => v.title).map(v => ({
      title: v.title.trim(),
      description: v.description?.trim() || "",
      processingTime: v.processingTime?.trim() || ""
    })),
    processingTypes: form.processingTypes?.length ? form.processingTypes : ["Normal"],
    tourType: form.tourType || undefined,
    subCategory: form.subCategory || undefined,
    type: form.type || "activity",
    seo: {
      metaTitle: form.seo.metaTitle.trim(),
      metaDescription: form.seo.metaDescription.trim(),
      focusKeyphrase: form.seo.focusKeyphrase.trim(),
    },
    transferOptions: form.transferOptions.map(t => ({
      name: t.name,
      type: t.type,
      adultPrice: Number(t.adultPrice) || 0,
      childPrice: Number(t.childPrice) || 0,
      infantPrice: Number(t.infantPrice) || 0
    })),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setImageBusy(true);
    try {
      const filledImageSlots = form.images.filter((slot) => slot.url || slot.file);
      const keptRemoteUrls = filledImageSlots
        .filter(
          (slot) => !slot.file && slot.url && !String(slot.url).startsWith("blob:")
        )
        .map((slot) => String(slot.url).trim())
        .filter(Boolean);

      const localFiles = filledImageSlots.filter(
        (slot) => slot.file && (slot.file instanceof File || slot.file instanceof Blob)
      );

      const uploadedResults = await Promise.all(
        localFiles.map((slot) => apiService.uploadImage(slot.file))
      );

      const uploadedUrls = uploadedResults
        .map((result) => result?.url)
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter(Boolean);

      if (localFiles.length !== uploadedUrls.length) {
        throw new Error("One or more product image uploads failed. Please try again.");
      }

      const payload = buildPayload([...keptRemoteUrls, ...uploadedUrls]);
      if (editingId) {
        await apiService.updateProduct(editingId, payload);
        toast.success('Product updated successfully! ✅');
      } else {
        await apiService.createProduct(payload);
        toast.success('Product created successfully! 🎉');
      }
      reset();
      setIsModalOpen(false);
      fetchProducts(page);
    } catch (err) {
      toast.error(`Failed to save product: ${err.message}`);
      console.error('[ProductSection] Submit error:', err);
    } finally {
      setImageBusy(false);
    }
  };

  const onEdit = (product) => {
    const imageSlots =
      (product.images || [])
        .map((entry) =>
          typeof entry === "string"
            ? entry
            : entry && typeof entry === "object"
               ? entry.url || entry.secure_url || ""
               : ""
        )
        .map((url) => String(url || "").trim())
        .filter(Boolean)
        .map((url) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url,
          publicId: extractCloudinaryPublicId(url),
          uploading: false,
        })) || [];

    if (imageSlots.length === 0 || imageSlots[imageSlots.length - 1].url) {
      imageSlots.push(makeEmptyImageSlot());
    }

    const tOptions = product.transferOptions?.length ? product.transferOptions.map(t => ({
      name: t.name || "",
      type: t.type || "without_transfer",
      adultPrice: t.adultPrice ?? 0,
      childPrice: t.childPrice ?? 0,
      infantPrice: t.infantPrice ?? 0
    })) : defaultTransferOptions();

    setEditingId(product._id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category?._id || "",
      subCategory: product.subCategory?._id || "",
      city: product.city?._id || "",
      tourType: product.tourType?._id || "",
      location: product.location || "",
      images: imageSlots,
      highlights: (product.highlights || []).map((item) => ({ title: item.title, description: item.description, icon: item.icon })),
      contentSections: (product.contentSections || []).map((item) => ({ title: item.title, description: item.description })),
      actualPrice: product.pricing?.actualPrice ?? "",
      discountPrice: product.pricing?.discountPrice ?? "",
      childPrice: product.pricing?.childPrice ?? "",
      teenPrice: product.pricing?.teenPrice ?? "",
      kidPrice: product.pricing?.kidPrice ?? "",
      infantPrice: product.pricing?.infantPrice ?? "",
      currency: product.pricing?.currency || "AED",
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      isProductNew: !!product.isProductNew,
      cruiseLine: product.cruiseLine || "",
      departureCity: product.departureCity || "",
      duration: product.duration || "",
      durationInHours: product.durationInHours ?? "",
      durationInDays: product.durationInDays ?? "",
      manualCity: product.manualCity || "",
      inclusions: (product.inclusions || []).join(", "),
      exclusions: (product.exclusions || []).join(", "),
      applicationSteps: product.applicationSteps?.length ? product.applicationSteps.map(s => ({ step: s.step, title: s.title, description: s.description })) : [{ step: 1, title: "", description: "" }],
      documentsRequired: (product.documentsRequired || []).join(", "),
      guestPolicy: product.guestPolicy || "",
      importantInformation: product.importantInformation || "",
      faq: product.faq?.length ? product.faq.map(f => ({ question: f.question, answer: f.answer })) : [{ question: "", answer: "" }],
      bookingType: product.bookingType || "check_availability",
      itinerary: product.itinerary?.length ? product.itinerary.map(i => ({ day: i.day, title: i.title, description: i.description })) : [{ day: 1, title: "", description: "" }],
      mapAddress: product.mapAddress || "",
      visaOptions: product.visaOptions?.length ? product.visaOptions.map(v => ({ title: v.title, description: v.description, processingTime: v.processingTime || "" })) : [{ title: "", description: "", processingTime: "" }],
      cabinOptions: product.cabinOptions?.length ? product.cabinOptions.map(c => ({ name: c.name, price: c.price })) : [{ name: "", price: "" }],
      processingTypes: product.processingTypes?.length ? product.processingTypes : ["Normal", "Express"],
      seo: {
        metaTitle: product.seo?.metaTitle || "",
        metaDescription: product.seo?.metaDescription || "",
        focusKeyphrase: product.seo?.focusKeyphrase || "",
      },
      transferOptions: tOptions,
    });
    setIsModalOpen(true);
  };

  const upsertTrailingEmptySlot = (nextImages) => {
    const cleaned = nextImages.filter(
      (item, idx) =>
        item.url || idx === nextImages.length - 1 || !item.publicId || item.uploading
    );
    if (cleaned.length === 0 || cleaned[cleaned.length - 1].url) {
      cleaned.push(makeEmptyImageSlot());
    }
    return cleaned;
  };

  const onImageSelect = async (slotId, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    setError("");
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      images: upsertTrailingEmptySlot(
        prev.images.map((slot) =>
          slot.id === slotId
            ? { ...slot, uploading: false, url: previewUrl, file, publicId: "" }
            : slot
        )
      ),
    }));
  };

  const removeImage = async (slotId) => {
    const slot = form.images.find((item) => item.id === slotId);
    if (!slot) return;

    setError("");
    setImageBusy(true);
    try {
      if (slot.publicId) {
        await apiService.deleteImage(slot.publicId);
      }
      setForm((prev) => {
        const next = prev.images
          .filter((item) => item.id !== slotId)
          .map((item) => ({ ...item, uploading: false }));
        return { ...prev, images: upsertTrailingEmptySlot(next) };
      });
    } catch (err) {
      toast.error(`Failed to remove image: ${err.message}`);
    } finally {
      setImageBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setError("");
    try {
      await apiService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts(page);
    } catch (err) {
      toast.error(`Failed to delete product: ${err.message}`);
    }
  };

  // Client-side filtering list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = filterSearch.toLowerCase();
      const matchSearch =
        !filterSearch ||
        p.name?.toLowerCase().includes(term) ||
        p.slug?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term);

      const matchCat = !filterCategory || p.category?._id === filterCategory || p.category === filterCategory;
      const matchCity = !filterCity || p.city?._id === filterCity || p.city === filterCity || p.manualCity?.toLowerCase().includes(filterCity.toLowerCase());
      const matchSubCat = !filterSubCategory || p.subCategory?._id === filterSubCategory || p.subCategory === filterSubCategory;
      const matchTourType = !filterTourType || p.tourType?._id === filterTourType || p.tourType === filterTourType;

      return matchSearch && matchCat && matchCity && matchSubCat && matchTourType;
    });
  }, [products, filterSearch, filterCategory, filterCity, filterSubCategory, filterTourType]);

  return (
    <section className="card p-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Products Management</h2>
          <p className="text-xs text-surface-500">Add, edit, filter and customize all your catalog items.</p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto !px-5 !py-2.5 font-semibold flex items-center gap-2"
          type="button"
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
        >
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 mb-6 bg-surface-50 p-4 rounded-xl border border-surface-200">
        <input
          type="text"
          className="input bg-white"
          placeholder="🔍 Search products..."
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
        />
        <select
          className="input bg-white"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setFilterSubCategory("");
          }}
        >
          <option value="">Filter by Category</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input bg-white"
          value={filterSubCategory}
          onChange={(e) => setFilterSubCategory(e.target.value)}
        >
          <option value="">Filter by Subcategory</option>
          {subCategories
            .filter(sc => !filterCategory || sc.category === filterCategory || sc.category?._id === filterCategory)
            .map(sc => (
              <option key={sc._id} value={sc._id}>{sc.name}</option>
            ))
          }
        </select>
        <select
          className="input bg-white"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <option value="">Filter by City</option>
          {cities.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input bg-white"
          value={filterTourType}
          onChange={(e) => setFilterTourType(e.target.value)}
        >
          <option value="">Filter by Tour Type</option>
          {tourTypes.map(tt => (
            <option key={tt._id} value={tt._id}>{tt.name}</option>
          ))}
        </select>
      </div>

      {/* Popup modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-lg font-bold text-surface-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                type="button"
                className="text-surface-400 hover:text-surface-600 font-bold p-1 rounded-full hover:bg-surface-100 transition"
                onClick={() => {
                  reset();
                  setIsModalOpen(false);
                }}
              >
                ✕
              </button>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Product Name</label>
                <input className="input" placeholder="Product name" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Slug</label>
                <input className="input" placeholder="Slug (optional)" value={form.slug} onChange={(e) => onChange("slug", e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Category</label>
                <select className="input" value={form.category} onChange={(e) => {
                  onChange("category", e.target.value);
                  onChange("subCategory", "");
                }} required>
                  <option value="">Select category</option>
                  {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">City</label>
                <select className="input" value={form.city} onChange={(e) => onChange("city", e.target.value)} disabled={!!form.manualCity}>
                  <option value="">Select city</option>
                  {cities.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">SubCategory</label>
                <select
                  className="input"
                  value={form.subCategory}
                  onChange={(e) => onChange("subCategory", e.target.value)}
                  disabled={!form.category}
                >
                  <option value="">Select subcategory</option>
                  {filteredSubCategories.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Tour Type</label>
                <select
                  className="input"
                  value={form.tourType}
                  onChange={(e) => onChange("tourType", e.target.value)}
                >
                  <option value="">Select tour type</option>
                  {tourTypes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-surface-200 rounded-xl bg-surface-50/50">
                  <input
                    type="checkbox"
                    checked={!!form.manualCity || form.isManualMode}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setForm(prev => ({ ...prev, manualCity: "", isManualMode: false }));
                      } else {
                        setForm(prev => ({ ...prev, city: "", isManualMode: true }));
                      }
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-surface-700">New City (Manual)</span>
                </label>
                {(form.manualCity || form.isManualMode) && (
                  <input
                    className="input border-orange-200 focus:border-orange-500"
                    placeholder="Enter City Name Manually"
                    value={form.manualCity}
                    onChange={(e) => onChange("manualCity", e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Booking Type</label>
                <select className="input" value={form.bookingType} onChange={(e) => onChange("bookingType", e.target.value)}>
                  <option value="book_now">Book Now (Standard)</option>
                  <option value="check_availability">Check Availability (Inquiry)</option>
                  <option value="email">Email Inquiry (Direct)</option>
                </select>
              </div>

              {/* Pricing Grid */}
              <div className="md:col-span-2 border border-surface-200 p-4 rounded-xl bg-surface-50 space-y-4">
                <h4 className="text-sm font-bold text-surface-800 border-b pb-2">Pricing Details</h4>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-500">Actual Price (AED)</label>
                    <input className="input bg-white" type="number" value={form.actualPrice} onChange={(e) => onChange("actualPrice", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-500">Discount Price (AED)</label>
                    <input className="input bg-white" type="number" value={form.discountPrice} onChange={(e) => onChange("discountPrice", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-500">Child Price</label>
                    <input className="input bg-white" type="number" value={form.childPrice} onChange={(e) => onChange("childPrice", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-500">Infant Price</label>
                    <input className="input bg-white" type="number" value={form.infantPrice} onChange={(e) => onChange("infantPrice", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-500">Currency</label>
                    <input className="input bg-white" value={form.currency} onChange={(e) => onChange("currency", e.target.value)} />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border">
                      <input
                        type="checkbox"
                        checked={form.isProductNew}
                        onChange={(e) => onChange("isProductNew", e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-surface-700">Mark as "New"</span>
                    </label>
                  </div>
                </div>

                {/* Transfer option pricing setup */}
                <div className="border-t pt-4 space-y-3">
                  <h5 className="text-xs font-bold text-surface-700 uppercase tracking-wider">Transfer Options Custom Pricing</h5>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {form.transferOptions.map((opt, idx) => (
                      <div key={idx} className="bg-white border rounded-xl p-3 space-y-2 shadow-sm">
                        <span className="text-xs font-bold text-gray-800">{opt.name}</span>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-500">Adult Price Add-on</label>
                          <input
                            type="number"
                            className="input !py-1 text-xs"
                            value={opt.adultPrice}
                            onChange={(e) => onTransferPriceChange(idx, "adultPrice", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration Settings */}
              <div className="md:col-span-2 border border-surface-200 p-4 rounded-xl bg-surface-50 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-600 font-semibold">Duration (Days)</label>
                  <select
                    className="input bg-white"
                    value={form.durationInDays || 0}
                    onChange={(e) => {
                      const days = Number(e.target.value);
                      const hours = form.durationInHours || 0;
                      let durString = "";
                      if (days > 0) durString += `${days} Day${days > 1 ? 's' : ''} `;
                      if (hours > 0) durString += `${hours} Hour${hours > 1 ? 's' : ''}`;
                      
                      setForm(prev => ({ 
                        ...prev, 
                        durationInDays: days,
                        durationInHours: hours,
                        duration: durString.trim()
                      }));
                    }}
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i} value={i}>{i} Days</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-600 font-semibold">Duration (Hours)</label>
                  <select
                    className="input bg-white"
                    value={form.durationInHours || 0}
                    onChange={(e) => {
                      const hours = Number(e.target.value);
                      const days = form.durationInDays || 0;
                      let durString = "";
                      if (days > 0) durString += `${days} Day${days > 1 ? 's' : ''} `;
                      if (hours > 0) durString += `${hours} Hour${hours > 1 ? 's' : ''}`;
                      
                      setForm(prev => ({ 
                        ...prev, 
                        durationInDays: days,
                        durationInHours: hours,
                        duration: durString.trim()
                      }));
                    }}
                  >
                    {[...Array(25)].map((_, i) => (
                      <option key={i} value={i}>{i} Hours</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="md:col-span-2 border border-surface-200 p-4 rounded-xl bg-surface-50 space-y-3">
                <h4 className="text-sm font-bold text-surface-800 border-b pb-2">Yoast SEO Settings</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-600 font-semibold">Meta Title</label>
                    <input className="input bg-white text-xs" placeholder="SEO title..." value={form.seo.metaTitle} onChange={(e) => onSEOChange("metaTitle", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-surface-600 font-semibold">Focus Keyphrase</label>
                    <input className="input bg-white text-xs" placeholder="Focus keywords..." value={form.seo.focusKeyphrase} onChange={(e) => onSEOChange("focusKeyphrase", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs text-surface-600 font-semibold">Meta Description</label>
                    <textarea className="input bg-white text-xs min-h-[60px]" placeholder="SEO meta description..." value={form.seo.metaDescription} onChange={(e) => onSEOChange("metaDescription", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Statistics & Ratings */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Rating (0 - 5)</label>
                <input className="input" type="number" step="0.1" max="5" placeholder="Rating" value={form.rating} onChange={(e) => onChange("rating", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Review Count</label>
                <input className="input" type="number" placeholder="Reviews count" value={form.reviews} onChange={(e) => onChange("reviews", e.target.value)} />
              </div>

              {/* Cruise Specific Fields */}
              {categories.find(c => c._id === form.category)?.name?.toLowerCase() === "cruises" && (
                <div className="md:col-span-2 space-y-6 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/20">
                  <div className="grid gap-3 md:grid-cols-2">
                    <h3 className="md:col-span-2 text-sm font-bold text-blue-700 uppercase tracking-wider">Cruise Details</h3>
                    <input className="input border-blue-200 focus:border-blue-500" placeholder="Cruise Line (e.g. MSC, Costa)" value={form.cruiseLine} onChange={(e) => onChange("cruiseLine", e.target.value)} />
                    <input className="input border-blue-200 focus:border-blue-500" placeholder="Departure City" value={form.departureCity} onChange={(e) => onChange("departureCity", e.target.value)} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <h3 className="md:col-span-2 text-sm font-bold text-blue-700 uppercase tracking-wider">Additional Pricing (Cruise)</h3>
                    <input className="input border-blue-200 focus:border-blue-500" type="number" placeholder="Teen price" value={form.teenPrice} onChange={(e) => onChange("teenPrice", e.target.value)} />
                    <input className="input border-blue-200 focus:border-blue-500" type="number" placeholder="Kid price" value={form.kidPrice} onChange={(e) => onChange("kidPrice", e.target.value)} />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Cabin Options</h3>
                    {form.cabinOptions.map((cabin, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                        <div className="md:col-span-11">
                          <input className="input border-blue-100" placeholder="Cabin Name" value={cabin.name} onChange={(e) => {
                            const next = [...form.cabinOptions];
                            next[idx].name = e.target.value;
                            setForm(p => ({ ...p, cabinOptions: next }));
                          }} />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button type="button" className="text-red-500 hover:text-red-700 font-bold" onClick={() => {
                            const next = form.cabinOptions.filter((_, i) => i !== idx);
                            setForm(p => ({ ...p, cabinOptions: next }));
                          }}>✕</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary text-xs border-blue-300 text-blue-600 hover:bg-blue-50" onClick={() => setForm(p => ({ ...p, cabinOptions: [...p.cabinOptions, { name: "" }] }))}>+ Add Cabin Option</button>
                  </div>
                </div>
              )}

              {/* Visa Specific Fields */}
              {categories.find(c => c._id === form.category)?.name?.toLowerCase() === "visas" && (
                <div className="md:col-span-2 space-y-4 py-4 border-t border-surface-100">
                  <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider">Visa Processing Details</h3>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-surface-500">Documents Required (Comma separated)</p>
                    <textarea className="input" value={form.documentsRequired} onChange={(e) => onChange("documentsRequired", e.target.value)} placeholder="Passport Copy, Photo, etc." />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Application Steps</p>
                    {form.applicationSteps.map((step, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-surface-50/50 rounded-xl border border-surface-200">
                        <div className="md:col-span-1">
                          <input type="number" className="input" value={step.step} onChange={(e) => {
                            const next = [...form.applicationSteps];
                            next[idx].step = e.target.value;
                            setForm(p => ({ ...p, applicationSteps: next }));
                          }} />
                        </div>
                        <div className="md:col-span-10">
                          <input className="input mb-2" placeholder="Step Title" value={step.title} onChange={(e) => {
                            const next = [...form.applicationSteps];
                            next[idx].title = e.target.value;
                            setForm(p => ({ ...p, applicationSteps: next }));
                          }} />
                          <textarea className="input" placeholder="Step Description" value={step.description} onChange={(e) => {
                            const next = [...form.applicationSteps];
                            next[idx].description = e.target.value;
                            setForm(p => ({ ...p, applicationSteps: next }));
                          }} />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button type="button" className="text-red-500 hover:text-red-700 font-bold" onClick={() => {
                            const next = form.applicationSteps.filter((_, i) => i !== idx);
                            setForm(p => ({ ...p, applicationSteps: next }));
                          }}>✕</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary text-xs" onClick={() => setForm(p => ({ ...p, applicationSteps: [...p.applicationSteps, { step: p.applicationSteps.length + 1, title: "", description: "" }] }))}>+ Add Step</button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-surface-100">
                    <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider">Processing Types</h3>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.processingTypes?.includes("Normal")}
                          onChange={(e) => {
                            const types = form.processingTypes || [];
                            setForm(p => ({
                              ...p,
                              processingTypes: e.target.checked ? [...types, "Normal"] : types.filter(t => t !== "Normal")
                            }));
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-surface-700">Normal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.processingTypes?.includes("Express")}
                          onChange={(e) => {
                            const types = form.processingTypes || [];
                            setForm(p => ({
                              ...p,
                              processingTypes: e.target.checked ? [...types, "Express"] : types.filter(t => t !== "Express")
                            }));
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-surface-700">Express</span>
                      </label>
                    </div>

                    <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider pt-2 border-t border-surface-100">Visa Types / Options</h3>
                    {form.visaOptions.map((opt, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-white rounded-xl border border-surface-200 shadow-sm relative group">
                        <div className="md:col-span-6 space-y-2">
                          <label className="text-[10px] font-bold text-surface-400 uppercase">Visa Title</label>
                          <input className="input" placeholder="e.g. 30 Days Single Entry" value={opt.title} onChange={(e) => {
                            const next = [...form.visaOptions];
                            next[idx].title = e.target.value;
                            setForm(p => ({ ...p, visaOptions: next }));
                          }} />
                        </div>
                        <div className="md:col-span-5 space-y-2">
                          <label className="text-[10px] font-bold text-surface-400 uppercase">Processing Time</label>
                          <input className="input" placeholder="e.g. 4-5 working days" value={opt.processingTime} onChange={(e) => {
                            const next = [...form.visaOptions];
                            next[idx].processingTime = e.target.value;
                            setForm(p => ({ ...p, visaOptions: next }));
                          }} />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center pt-6">
                          <button type="button" className="text-red-500 hover:text-red-700 font-bold" onClick={() => {
                            const next = form.visaOptions.filter((_, i) => i !== idx);
                            setForm(p => ({ ...p, visaOptions: next }));
                          }}>✕</button>
                        </div>
                        <div className="md:col-span-12 space-y-2 mt-2">
                          <label className="text-[10px] font-bold text-surface-400 uppercase">Short Description (Optional)</label>
                          <input className="input text-xs" placeholder="Get by in 4-5 working days" value={opt.description} onChange={(e) => {
                            const next = [...form.visaOptions];
                            next[idx].description = e.target.value;
                            setForm(p => ({ ...p, visaOptions: next }));
                          }} />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary text-xs" onClick={() => setForm(p => ({ ...p, visaOptions: [...p.visaOptions, { title: "", description: "", processingTime: "" }] }))}>+ Add Visa Option</button>
                  </div>
                </div>
              )}

              {/* Images */}
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-surface-700">Images</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {form.images.map((slot) => (
                    <div
                      key={slot.id}
                      className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-surface-300 bg-surface-50"
                    >
                      {slot.url ? (
                        <>
                          <img
                            src={slot.url}
                            alt="Product"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                            onClick={() => removeImage(slot.id)}
                            disabled={imageBusy}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <label className="flex h-full cursor-pointer flex-col items-center justify-center px-2 text-center text-xs text-surface-500">
                          {slot.uploading ? "Uploading..." : "Upload image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onImageSelect(slot.id, e.target.files?.[0])}
                            disabled={imageBusy || slot.uploading}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-surface-700">Highlights</p>
                  <div className="text-[10px] text-surface-400 bg-surface-50 px-2 py-1 rounded-lg border border-surface-200">
                    <span className="font-bold text-surface-600 uppercase">Icons:</span> Clock, Zap, Smartphone, Globe, History, Map, ShieldCheck, Languages, Check, Star, Info, Shield, Ship, Users
                  </div>
                </div>
                {form.highlights.map((h, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      className="input text-xs"
                      placeholder="Icon (e.g. Clock)"
                      value={h.icon}
                      onChange={(e) => {
                        const newHighlights = [...form.highlights];
                        newHighlights[idx].icon = e.target.value;
                        setForm((prev) => ({ ...prev, highlights: newHighlights }));
                      }}
                    />
                    <input
                      className="input text-xs"
                      placeholder="Title"
                      value={h.title}
                      onChange={(e) => {
                        const newHighlights = [...form.highlights];
                        newHighlights[idx].title = e.target.value;
                        setForm((prev) => ({ ...prev, highlights: newHighlights }));
                      }}
                    />
                    <input
                      className="input text-xs"
                      placeholder="Description"
                      value={h.description}
                      onChange={(e) => {
                        const newHighlights = [...form.highlights];
                        newHighlights[idx].description = e.target.value;
                        setForm((prev) => ({ ...prev, highlights: newHighlights }));
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => setForm((prev) => ({ ...prev, highlights: [...prev.highlights, { title: "", description: "", icon: "" }] }))}
                >
                  + Add Highlight
                </button>
              </div>

              {/* Itinerary */}
              <div className="md:col-span-2 space-y-3 py-4 border-t border-surface-100">
                <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider">Day-wise Itinerary</h3>
                {form.itinerary.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-surface-50/50 rounded-xl border border-surface-200">
                    <div className="md:col-span-1">
                      <input type="number" className="input" placeholder="Day" value={item.day} onChange={(e) => {
                        const next = [...form.itinerary];
                        next[idx].day = e.target.value;
                        setForm(p => ({ ...p, itinerary: next }));
                      }} />
                    </div>
                    <div className="md:col-span-4">
                      <input className="input" placeholder="Title" value={item.title} onChange={(e) => {
                        const next = [...form.itinerary];
                        next[idx].title = e.target.value;
                        setForm(p => ({ ...p, itinerary: next }));
                      }} />
                    </div>
                    <div className="md:col-span-6">
                      <div className="bg-white rounded-xl overflow-hidden border border-surface-200">
                        <RichTextEditor
                          placeholder="Description"
                          value={item.description}
                          onChange={(content) => {
                            const next = [...form.itinerary];
                            next[idx].description = content;
                            setForm(p => ({ ...p, itinerary: next }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <button type="button" className="text-red-500 hover:text-red-700 font-bold" onClick={() => {
                        const next = form.itinerary.filter((_, i) => i !== idx);
                        setForm(p => ({ ...p, itinerary: next }));
                      }}>✕</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-secondary text-xs" onClick={() => setForm(p => ({ ...p, itinerary: [...p.itinerary, { day: p.itinerary.length + 1, title: "", description: "" }] }))}>+ Add Day</button>
              </div>

              {/* Rich Content Sections */}
              <div className="md:col-span-2 space-y-4">
                <p className="mb-2 text-sm font-medium text-surface-700 uppercase tracking-widest border-b pb-1">Content Sections (Rich Text)</p>
                {form.contentSections.map((c, idx) => (
                  <div key={idx} className="space-y-3 p-4 bg-surface-50/30 rounded-2xl border border-surface-100 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-surface-400 uppercase">Section {idx + 1}</span>
                      <button
                        type="button"
                        className="text-red-500 text-xs font-semibold"
                        onClick={() => {
                          const next = form.contentSections.filter((_, i) => i !== idx);
                          setForm(p => ({ ...p, contentSections: next }));
                        }}
                      >
                        Remove Section
                      </button>
                    </div>
                    <input
                      className="input font-bold"
                      placeholder="Section Title (e.g. Terms & Conditions)"
                      value={c.title}
                      onChange={(e) => {
                        const newSections = [...form.contentSections];
                        newSections[idx].title = e.target.value;
                        setForm((prev) => ({ ...prev, contentSections: newSections }));
                      }}
                    />
                    <div className="bg-white rounded-xl overflow-hidden border border-surface-200">
                      <RichTextEditor
                        value={c.description}
                        onChange={(content) => {
                          const newSections = [...form.contentSections];
                          newSections[idx].description = content;
                          setForm((prev) => ({ ...prev, contentSections: newSections }));
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => setForm((prev) => ({ ...prev, contentSections: [...prev.contentSections, { title: "", description: "" }] }))}
                >
                  + Add Section
                </button>
              </div>

              {/* Map location address */}
              <div className="md:col-span-2 p-4 bg-indigo-50/30 rounded-2xl border-2 border-dashed border-indigo-200 space-y-3">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest text-center">Map & Location Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-surface-500 uppercase">1. Location Label (Shows on card)</label>
                    <input className="input bg-white" placeholder="e.g. Downtown, Dubai" value={form.location} onChange={(e) => onChange("location", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-indigo-500 uppercase">2. Map Address (Points at Map)</label>
                    <input className="input bg-white border-indigo-300 focus:border-indigo-600" placeholder="e.g. Burj Khalifa, Dubai" value={form.mapAddress} onChange={(e) => onChange("mapAddress", e.target.value)} />
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

              <div className="flex justify-end gap-2 border-t pt-4 md:col-span-2">
                <button
                  className="btn-secondary font-semibold"
                  type="button"
                  onClick={() => {
                    reset();
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button className="btn-primary font-semibold" type="submit" disabled={!canSubmit || imageBusy}>
                  {imageBusy ? "Processing..." : editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product List Table */}
      <div className="overflow-auto rounded-lg border border-surface-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-surface-50 text-left text-surface-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">SubCategory</th>
              <th className="px-4 py-3 font-semibold">Tour Type</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredProducts.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-surface-500 text-center" colSpan={7}>
                  No products found.
                </td>
              </tr>
            )}
            {filteredProducts.map((item) => (
              <tr key={item._id} className="border-t border-surface-100 hover:bg-surface-50 transition">
                <td className="px-4 py-3 font-medium text-surface-900">{item.name}</td>
                <td className="px-4 py-3 text-surface-600">{item.category?.name || "-"}</td>
                <td className="px-4 py-3 text-surface-600">{item.subCategory?.name || "-"}</td>
                <td className="px-4 py-3 text-surface-600">
                  {item.tourType?.name ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">{item.tourType.name}</span>
                  ) : "-"}
                </td>
                <td className="px-4 py-3 text-surface-600">{item.city?.name || item.manualCity || "-"}</td>
                <td className="px-4 py-3 text-surface-900 font-semibold">
                  {item.pricing?.currency || "AED"}{" "}
                  {(item.pricing?.discountPrice ?? item.pricing?.actualPrice ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-secondary !px-3 !py-1 text-xs font-semibold"
                      type="button"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-secondary !px-3 !py-1 text-red-600 text-xs font-semibold"
                      type="button"
                      onClick={() => onDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-surface-600">
        <p>
          Page {meta.page || 1} of {meta.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            className="btn-secondary !px-3 !py-1 text-xs"
            type="button"
            disabled={(meta.page || 1) <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="btn-secondary !px-3 !py-1 text-xs"
            type="button"
            disabled={(meta.page || 1) >= (meta.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
