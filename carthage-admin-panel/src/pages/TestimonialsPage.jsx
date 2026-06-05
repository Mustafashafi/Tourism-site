import { useEffect, useState } from "react";
import { apiService } from "../api";
import toast from "react-hot-toast";

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Testimonials uses lists resources under "/testimonials"
      const result = await apiService.listResource("/testimonials");
      setTestimonials(result);
    } catch (err) {
      toast.error("Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setUserName("");
    setUserImage("");
    setRating(5);
    setComment("");
    setLocation("");
    setEditingId(null);
    setSubmitting(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      toast.error("Name and comment are required.");
      return;
    }

    setSubmitting(true);
    const payload = {
      userName: userName.trim(),
      userImage: userImage.trim() || undefined,
      rating: Number(rating),
      comment: comment.trim(),
      location: location.trim() || undefined,
    };

    try {
      if (editingId) {
        await apiService.updateResource("/testimonials", editingId, payload);
        toast.success("Testimonial updated successfully! ✅");
      } else {
        await apiService.createResource("/testimonials", payload);
        toast.success("Testimonial added successfully! 🎉");
      }
      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to save testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setUserName(item.userName || "");
    setUserImage(item.userImage || "");
    setRating(item.rating || 5);
    setComment(item.comment || "");
    setLocation(item.location || "");
    setIsModalOpen(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await apiService.deleteResource("/testimonials", id);
      toast.success("Testimonial deleted successfully.");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to delete testimonial.");
    }
  };

  const filteredItems = testimonials.filter((item) => {
    const term = filterText.toLowerCase();
    return (
      (item.userName && item.userName.toLowerCase().includes(term)) ||
      (item.comment && item.comment.toLowerCase().includes(term)) ||
      (item.location && item.location.toLowerCase().includes(term))
    );
  });

  return (
    <section className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-surface-900 font-sans">Testimonials</h2>
          <p className="text-sm text-surface-600 font-sans">Manage customer testimonials and reviews.</p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto !px-5 !py-2.5 font-semibold"
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          + Add Testimonial
        </button>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="🔍 Search testimonials..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Popup Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-lg font-bold text-surface-900 font-sans">
                {editingId ? "Edit Testimonial" : "Add Testimonial"}
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

            <form onSubmit={onSubmit} className="space-y-4 font-sans">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">User Name</label>
                <input
                  className="input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">User Location</label>
                <input
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, UK"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Rating (1-5)</label>
                <select
                  className="input"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Avatar Image URL (Optional)</label>
                <input
                  className="input"
                  value={userImage}
                  onChange={(e) => setUserImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-surface-600">Comment / Review</label>
                <textarea
                  className="input min-h-[100px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write the customer's comment here..."
                  required
                />
              </div>

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
                  {submitting ? "Saving…" : editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="card p-6 bg-white rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-surface-900 mb-4 font-sans">Testimonials List</h3>
        {loading && testimonials.length === 0 ? (
          <p className="text-sm text-surface-500 font-sans">Loading testimonials...</p>
        ) : (
          <div className="overflow-auto rounded-lg border border-surface-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-surface-50 text-left text-surface-600">
                <tr>
                  <th className="px-4 py-3 font-semibold font-sans">User</th>
                  <th className="px-4 py-3 font-semibold font-sans">Location</th>
                  <th className="px-4 py-3 font-semibold font-sans">Rating</th>
                  <th className="px-4 py-3 font-semibold font-sans">Comment</th>
                  <th className="px-4 py-3 font-semibold font-sans text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-surface-500 text-center font-sans" colSpan={5}>
                      No testimonials found.
                    </td>
                  </tr>
                )}
                {filteredItems.map((item) => (
                  <tr key={item._id} className="border-t border-surface-100 hover:bg-surface-50 transition">
                    <td className="px-4 py-3 font-medium text-surface-900 flex items-center gap-3">
                      {item.userImage && (
                        <img src={item.userImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <span className="font-sans">{item.userName}</span>
                    </td>
                    <td className="px-4 py-3 text-surface-600 font-sans">{item.location || "—"}</td>
                    <td className="px-4 py-3 text-yellow-500 font-semibold font-sans">
                      {"★".repeat(item.rating)}
                    </td>
                    <td className="px-4 py-3 text-surface-600 max-w-xs truncate font-sans">{item.comment}</td>
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
        )}
      </div>
    </section>
  );
};

export default TestimonialsPage;
