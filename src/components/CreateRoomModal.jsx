import { useState, useEffect } from "react";

export default function CreateRoomModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), description.trim());
    setLoading(false);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-100">Create a room</h2>
            <p className="text-xs text-gray-600 mt-0.5">Rooms are where conversations happen</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Room name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Room name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] focus-within:border-indigo-600 rounded-xl px-3 py-2.5 transition-colors">
              <span className="text-gray-600 text-sm">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="e.g. dev-talk"
                autoFocus
                required
                className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-700 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-700 mt-1.5 ml-1">
              Lowercase letters, numbers and dashes only
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Description <span className="text-gray-700 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
              rows={3}
              maxLength={120}
              className="w-full bg-[#111827] border border-[#1f2937] focus:border-indigo-600 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-700 focus:outline-none transition-colors resize-none"
            />
            <p className="text-[11px] text-gray-700 mt-1 ml-1 text-right">
              {description.length}/120
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-gray-400 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
            >
              {loading ? "Creating..." : "Create room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}