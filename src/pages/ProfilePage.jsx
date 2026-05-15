import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Back button */}
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors text-sm mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to chat
        </button>

        <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl overflow-hidden">

          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-indigo-950 to-[#0d1117]" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-10 mb-4">
              {user?.avatar ? (
                <img
                  src={`${BACKEND_URL}${user.avatar}`}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#0d1117]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-600 border-4 border-[#0d1117] flex items-center justify-center text-white text-2xl font-semibold">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-xl font-semibold text-gray-100 mb-1">
              {user?.displayName || user?.username}
            </h1>
            <p className="text-sm text-gray-600 mb-4">@{user?.username}</p>

            {/* Bio */}
            {user?.bio ? (
              <p className="text-sm text-gray-400 leading-relaxed mb-5 p-3 bg-[#111827] border border-[#1f2937] rounded-xl">
                {user.bio}
              </p>
            ) : (
              <p className="text-sm text-gray-700 italic mb-5">No bio yet.</p>
            )}

            {/* Member since */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Member since {formatDate(user?.createdAt)}
            </div>

            {/* Edit button */}
            <button
              onClick={() => setShowEdit(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
    </div>
  );
}