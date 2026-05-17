import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BACKEND_URL}${avatar}`;
};

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user?.avatar) || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const { data } = await api.post("/users/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updateUser({ avatar: data.avatar });
      }

      const { data } = await api.put("/users/profile", { displayName, bio });
      updateUser(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => user?.username?.[0]?.toUpperCase();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-100">Edit Profile</h2>
            <p className="text-xs text-gray-600 mt-0.5">Update your public profile</p>
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

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-20 h-20 rounded-full cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-[#1f2937]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-semibold border-2 border-[#1f2937]">
                  {getInitial()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarChange} className="hidden" />
            <p className="text-xs text-gray-600">Click avatar to change · Max 2MB</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Username</label>
            <div className="w-full bg-[#0d1117] border border-[#1f2937] text-gray-600 rounded-xl px-4 py-2.5 text-sm">@{user?.username}</div>
            <p className="text-[11px] text-gray-700 mt-1 ml-1">Username cannot be changed</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={user?.username} maxLength={30}
              className="w-full bg-[#111827] border border-[#1f2937] focus:border-indigo-600 text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder-gray-700" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people a bit about yourself..." maxLength={150} rows={3}
              className="w-full bg-[#111827] border border-[#1f2937] focus:border-indigo-600 text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder-gray-700 resize-none" />
            <p className="text-[11px] text-gray-700 mt-1 text-right">{bio.length}/150</p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-gray-400 text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors">
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}