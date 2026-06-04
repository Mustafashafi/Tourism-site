import { useEffect, useState } from "react";
import { apiService } from "../api";
import toast from "react-hot-toast";

const toSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const SubCategoriesPage = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, subs] = await Promise.all([
        apiService.listResource("/categories"),
        apiService.listResource("/sub-categories"),
      ]);
      setCategories(cats);
      setSubCategories(subs);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load subcategories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setCategory("");
    setEditingId(null);
    setSubmitting(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !category) {
      toast.error("Name and Category are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase() || toSlug(name),
      category,
    };

    try {
      if (editingId) {
        await apiService.updateResource("/sub-categories", editingId, payload);
        toast.success("SubCategory updated successfully! ✅");
      } else {
        await apiService.createResource("/sub-categories", payload);
        toast.success("SubCategory created successfully! 🎉");
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setName(item.name || "");
    setSlug(item.slug || "");
    setCategory(item.category?._id || item.category || "");
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await apiService.deleteResource("/sub-categories", id);
      toast.success("SubCategory deleted successfully.");
      await loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-surface-900">SubCategories</h2>
        <p className="text-sm text-surface-600">Manage sub-categories belonging to main categories.</p>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">
          {editingId ? "Edit SubCategory" : "Add SubCategory"}
        </h3>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-surface-500 uppercase">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desert Safari"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-surface-500 uppercase">Slug (Optional)</label>
            <input
              className="input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated if blank"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-surface-500 uppercase">Main Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary flex-1" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">SubCategory List</h3>
        {loading && subCategories.length === 0 ? (
          <p className="text-sm text-surface-500">Loading subcategories...</p>
        ) : (
          <div className="overflow-auto rounded-lg border border-surface-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-surface-50 text-left text-surface-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Main Category</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subCategories.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-surface-500 text-center" colSpan={4}>
                      No subcategories found.
                    </td>
                  </tr>
                )}
                {subCategories.map((item) => (
                  <tr key={item._id} className="border-t border-surface-100">
                    <td className="px-4 py-3 font-medium text-surface-900">{item.name}</td>
                    <td className="px-4 py-3 text-surface-600">{item.slug}</td>
                    <td className="px-4 py-3 text-surface-600">
                      {item.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="btn-secondary !px-3 !py-1"
                          onClick={() => onEdit(item)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-secondary !px-3 !py-1 text-red-600"
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
        )}
      </div>
    </section>
  );
};

export default SubCategoriesPage;
