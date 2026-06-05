import { useEffect, useState } from "react";
import { apiService } from "../api";
import { API_BASE_URL } from "../config/appConfig";

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (/^(http|https|data|blob):/.test(url)) return url;
  const baseUrl = API_BASE_URL.replace(/\/api$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const toSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/** Stable unique id for each slot so React keys don't change */
let _uid = 0;
const uid = () => `slot-${++_uid}-${Date.now()}`;

/** Empty slot template */
const emptySlot = () => ({
  id: uid(),
  /** Cloudinary / remote URL (authoritative on save) */
  remoteUrl: "",
  /** Temporary blob URL shown in the UI before upload */
  previewUrl: "",
  /** Actual File object – present only for newly picked files */
  file: null,
  title: "",
  subtext: "",
  description: "",
});

/**
 * Converts a raw banner value from the server (string or object) into a slot.
 */
const bannerToSlot = (raw) => {
  const url = typeof raw === "string" ? raw : String(raw?.url || "").trim();
  if (!url) return null;
  const resolvedUrl = resolveImageUrl(url);
  return {
    id: uid(),
    remoteUrl: resolvedUrl,
    previewUrl: resolvedUrl,
    file: null,
    title: typeof raw === "object" ? String(raw?.title || "") : "",
    subtext: typeof raw === "object" ? String(raw?.subtext || "") : "",
    description: typeof raw === "object" ? String(raw?.description || "") : "",
  };
};

const ResourceSection = ({
  title,
  resourcePath,
  enableBanner = false,
  enableCityCards = false,
}) => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slots, setSlots] = useState([emptySlot()]);
  const [countryName, setCountryName] = useState("");
  const [cityCategories, setCityCategories] = useState(["activity"]);
  const [cityStatus, setCityStatus] = useState("active");
  const [cityImageUrl, setCityImageUrl] = useState("");
  const [cityImagePreview, setCityImagePreview] = useState("");
  const [cityImageFile, setCityImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await apiService.listResource(resourcePath));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setSlots([emptySlot()]);
    setCountryName("");
    setCityCategories(["activity"]);
    setCityStatus("active");
    setCityImageUrl("");
    setCityImagePreview("");
    setCityImageFile(null);
    setSubmitting(false);
    setEditingId(null);
  };

  const onPickCityImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    setError("");
    setCityImageFile(file);
    const preview = URL.createObjectURL(file);
    setCityImagePreview(preview);
  };

  // ── Slot helpers ────────────────────────────────────────────────────────────

  /** Ensures there is always exactly one trailing empty slot */
  const withTrailingEmpty = (list) => {
    const last = list[list.length - 1];
    if (!last || last.remoteUrl || last.previewUrl) {
      return [...list, emptySlot()];
    }
    return list;
  };

  const updateSlot = (id, patch) =>
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeSlot = (id) =>
    setSlots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return withTrailingEmpty(next.length ? next : []);
    });

  const onPickFile = (id, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    setError("");
    const previewUrl = URL.createObjectURL(file);
    setSlots((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, previewUrl, file } : s
      );
      return withTrailingEmpty(next);
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase() || toSlug(name),
      };

      if (enableCityCards) {
        payload.city_name = name.trim();
        payload.country_name = countryName.trim();
        payload.categories = cityCategories;
        payload.status = cityStatus;

        if (cityImageFile) {
          const result = await apiService.uploadImage(cityImageFile);
          const url = result?.url;
          if (!url) throw new Error("Image upload failed. Please try again.");
          payload.image = url;
        } else if (cityImageUrl) {
          payload.image = cityImageUrl;
        }
      }

      if (enableBanner) {
        // Only process slots that have an image (either an existing remote URL or a new file)
        const filled = slots.filter((s) => s.remoteUrl || s.file);

        // Upload any newly picked files first
        const withUrls = await Promise.all(
          filled.map(async (s) => {
            if (s.file) {
              const result = await apiService.uploadImage(s.file);
              const cloudUrl = result?.url;
              if (!cloudUrl) throw new Error("Image upload failed. Please try again.");
              return { ...s, remoteUrl: cloudUrl };
            }
            return s; // already has remoteUrl
          })
        );

        payload.banners = withUrls
          .filter((s) => s.remoteUrl)
          .map((s) => ({
            url: s.remoteUrl,
            title: s.title.trim(),
            subtext: s.subtext.trim(),
            description: s.description.trim(),
          }));
      }

      if (editingId) {
        await apiService.updateResource(resourcePath, editingId, payload);
      } else {
        await apiService.createResource(resourcePath, payload);
      }

      resetForm();
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────

  const onEdit = (item) => {
    setEditingId(item._id);
    setName(item.name || "");
    setSlug(item.slug || "");
    setCountryName(item.country_name || "");
    const rawCats = item.categories || item.category || [];
    const cats = Array.isArray(rawCats)
      ? rawCats
      : rawCats
      ? [rawCats]
      : [];
    setCityCategories(cats.length ? cats : ["activity"]);
    setCityStatus(item.status || "active");
    setCityImageUrl(item.image || "");
    setCityImagePreview(resolveImageUrl(item.image || ""));
    setCityImageFile(null);

    const existing = Array.isArray(item.banners)
      ? item.banners.map(bannerToSlot).filter(Boolean)
      : [];

    setSlots(withTrailingEmpty(existing.length ? existing : []));
    setIsModalOpen(true);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const onDelete = async (id) => {
    setError("");
    if (!window.confirm("Delete this item?")) return;
    try {
      await apiService.deleteResource(resourcePath, id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const term = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.slug && item.slug.toLowerCase().includes(term)) ||
      (item.country_name && item.country_name.toLowerCase().includes(term))
    );
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <section className="card p-6">
      {/* Header with Add Button */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900">{title}</h2>
          <p className="text-xs text-surface-500">Add, edit, or delete items instantly.</p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto !px-5 !py-2.5 font-semibold flex items-center gap-2"
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <span>+ Add New</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="🔍 Search items..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Popup Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-lg font-bold text-surface-900">
                {editingId ? `Edit ${title}` : `Add New ${title}`}
              </h3>
              <button
                type="button"
                className="text-surface-400 hover:text-surface-600 font-bold p-1 rounded-full hover:bg-surface-100 transition"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-surface-600">Name</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-surface-600">Slug</label>
                  <input
                    className="input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Slug (auto-generated if left blank)"
                  />
                </div>
              </div>

              {enableCityCards && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-surface-600">Country Name</label>
                    <input
                      className="input"
                      value={countryName}
                      onChange={(e) => setCountryName(e.target.value)}
                      placeholder="Country Name"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-surface-600">City Status</label>
                    <select
                      className="input"
                      value={cityStatus}
                      onChange={(e) => setCityStatus(e.target.value)}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-surface-600">City Categories</label>
                    <select
                      className="input min-h-[80px]"
                      multiple
                      value={cityCategories}
                      onChange={(e) =>
                        setCityCategories(
                          Array.from(e.target.selectedOptions).map((o) => o.value)
                        )
                      }
                    >
                      <option value="activity">activity</option>
                      <option value="holiday">holiday</option>
                      <option value="cruise">cruise</option>
                    </select>
                    <p className="text-[11px] text-surface-500">Hold Ctrl (Cmd on Mac) to select multiple categories</p>
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-2 rounded-xl border border-surface-200 bg-surface-50 p-4">
                    <p className="text-sm font-medium text-surface-700">City Image</p>
                    <div className="flex gap-4 items-start flex-wrap">
                      <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-dashed border-surface-300 bg-white">
                        {cityImagePreview ? (
                          <img
                            src={cityImagePreview}
                            alt="City"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-surface-500 px-2 text-center">
                            No image selected
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="btn-secondary w-fit cursor-pointer text-xs font-semibold">
                          Upload image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={submitting}
                            onChange={(e) => onPickCityImage(e.target.files?.[0])}
                          />
                        </label>
                        {cityImagePreview && (
                          <button
                            type="button"
                            className="btn-secondary w-fit text-red-600 text-xs font-semibold"
                            disabled={submitting}
                            onClick={() => {
                              setCityImageFile(null);
                              setCityImagePreview("");
                              setCityImageUrl("");
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Banner slots */}
              {enableBanner && (
                <div className="border-t pt-4">
                  <p className="mb-3 text-sm font-medium text-surface-700">
                    Banners — upload an image then fill in the slide text
                  </p>

                  <div className="flex flex-col gap-4">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4"
                      >
                        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-dashed border-surface-300 bg-white">
                          {slot.previewUrl ? (
                            <>
                              <img
                                src={slot.previewUrl}
                                alt="Banner"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => removeSlot(slot.id)}
                                className="absolute right-1 top-1 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white hover:bg-black"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-center text-xs text-surface-500 px-2">
                              <span>Click to upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={submitting}
                                onChange={(e) => onPickFile(slot.id, e.target.files?.[0])}
                              />
                            </label>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-2 min-w-0">
                          <input
                            className="input text-sm"
                            placeholder="Title  (e.g. Dubai Skyline & Luxury Cruises)"
                            value={slot.title}
                            disabled={submitting}
                            onChange={(e) => updateSlot(slot.id, { title: e.target.value })}
                          />
                          <input
                            className="input text-sm"
                            placeholder="Subtext  (e.g. Sail across the globe)"
                            value={slot.subtext}
                            disabled={submitting}
                            onChange={(e) => updateSlot(slot.id, { subtext: e.target.value })}
                          />
                          <textarea
                            className="input text-sm resize-none"
                            rows={2}
                            placeholder="Description  (short paragraph shown on the slide)"
                            value={slot.description}
                            disabled={submitting}
                            onChange={(e) => updateSlot(slot.id, { description: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="mt-5 overflow-auto rounded-lg border border-surface-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-surface-50 text-left text-surface-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              {enableCityCards && <th className="px-4 py-3">Category</th>}
              {enableCityCards && <th className="px-4 py-3">Status</th>}
              {enableCityCards && <th className="px-4 py-3">Image</th>}
              {enableBanner && <th className="px-4 py-3">Banners</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredItems.length === 0 && (
              <tr>
                <td
                  className="px-4 py-4 text-surface-500"
                  colSpan={
                    (enableBanner ? 1 : 0) +
                    (enableCityCards ? 3 : 0) +
                    3
                  }
                >
                  No records found.
                </td>
              </tr>
            )}
            {filteredItems.map((item) => (
              <tr key={item._id} className="border-t border-surface-100 hover:bg-surface-50 transition">
                <td className="px-4 py-3 font-medium text-surface-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-surface-600">{item.slug}</td>
                {enableCityCards && (
                  <td className="px-4 py-3 text-surface-600">
                    {Array.isArray(item.categories) && item.categories.length > 0
                      ? item.categories.join(", ")
                      : item.category || "—"}
                  </td>
                )}
                {enableCityCards && (
                  <td className="px-4 py-3 text-surface-600">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface-100 text-surface-600'
                    }`}>
                      {item.status || "active"}
                    </span>
                  </td>
                )}
                {enableCityCards && (
                  <td className="px-4 py-3">
                    {item.image ? (
                      <img
                        src={resolveImageUrl(item.image)}
                        alt="City"
                        className="h-10 w-16 rounded object-cover shadow-sm border border-surface-200"
                      />
                    ) : (
                      <span className="text-xs text-surface-400">—</span>
                    )}
                  </td>
                )}
                {enableBanner && (
                  <td className="px-4 py-3">
                    {item.banners?.length > 0 ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {item.banners.slice(0, 4).map((b, i) => {
                          const rawSrc = typeof b === "string" ? b : b?.url;
                          const src = resolveImageUrl(rawSrc);
                          return src ? (
                            <img
                              key={i}
                              src={src}
                              alt={`Banner ${i + 1}`}
                              className="h-10 w-16 rounded object-cover shadow-sm"
                            />
                          ) : null;
                        })}
                        {item.banners.length > 4 && (
                          <span className="self-center text-xs text-surface-500">
                            +{item.banners.length - 4}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-surface-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-secondary !px-3 !py-1 text-xs font-semibold"
                      onClick={() => onEdit(item)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-secondary !px-3 !py-1 text-red-600 text-xs font-semibold"
                      onClick={() => onDelete(item._id)}
                      type="button"
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
    </section>
  );
};

export default ResourceSection;
