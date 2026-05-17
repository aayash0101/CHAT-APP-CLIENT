import { useState, useEffect } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BACKEND_URL}${avatar}`;
};

export default function NewDMModal({ onClose, onSelectUser }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${query}`);
        // Filter out current user from results
        setResults(data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce — wait 300ms after typing stops

    return () => clearTimeout(timeout);
  }, [query, user._id]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">New Message</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#1f2937]">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] focus-within:border-indigo-600 rounded-xl px-3 py-2 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            results.map((u) => {
              const avatarUrl = getAvatarUrl(u.avatar);
              return (
                <button
                  key={u._id}
                  onClick={() => { onSelectUser(u._id); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#111827] transition-colors"
                >
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {u.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0d1117]" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-600 truncate">@{u.username}</p>
                  </div>
                </button>
              );
            })
          ) : query.trim() ? (
            <p className="text-center text-xs text-gray-700 py-6">No users found</p>
          ) : (
            <p className="text-center text-xs text-gray-700 py-6">Type a username to search</p>
          )}
        </div>
      </div>
    </div>
  );
}