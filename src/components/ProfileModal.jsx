import { useState, useEffect } from "react";
import api from "../api/axios.js";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

export default function ProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl w-full max-w-sm overflow-hidden">

        {/* Banner */}
        <div className="h-16 bg-gradient-to-r from-indigo-950 to-[#0d1117] relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profile ? (
            <>
              {/* Avatar — overlaps the banner */}
              <div className="-mt-10 mb-4">
                {profile.avatar ? (
                  <img
                    src={`${BACKEND_URL}${profile.avatar}`}
                    alt={profile.username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#0d1117]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-600 border-4 border-[#0d1117] flex items-center justify-center text-white text-2xl font-semibold">
                    {profile.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + online status */}
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-lg font-semibold text-gray-100">
                  {profile.displayName || profile.username}
                </h2>
                {profile.isOnline && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Online
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">@{profile.username}</p>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-gray-400 leading-relaxed mb-4 p-3 bg-[#111827] border border-[#1f2937] rounded-xl">
                  {profile.bio}
                </p>
              )}

              {/* Member since */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {formatDate(profile.createdAt)}
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">User not found</p>
          )}
        </div>
      </div>
    </div>
  );
}