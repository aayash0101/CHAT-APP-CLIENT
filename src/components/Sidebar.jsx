import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import CreateRoomModal from "./CreateRoomModal.jsx";
import EditProfileModal from "./EditProfileModal.jsx";
import SearchBar from "./SearchBar.jsx";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BACKEND_URL}${avatar}`;
};

export default function Sidebar({ rooms, activeRoom, onRoomSelect, onCreateRoom, onlineUsers }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <aside className="w-56 bg-[#0d1117] border-r border-[#1f2937] flex flex-col h-full shrink-0">

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#1f2937] flex items-center gap-2.5">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-100 tracking-tight">ChatApp</span>
      </div>

      {/* Search */}
      <SearchBar onRoomSelect={onRoomSelect} rooms={rooms} />

      <div className="flex-1 overflow-y-auto py-3">

        {/* Rooms label + add button */}
        <div className="flex items-center justify-between px-4 mb-1.5">
          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Rooms</span>
          <button
            onClick={() => setShowCreate(true)}
            className="text-gray-600 hover:text-indigo-400 transition-colors text-base leading-none font-light"
            title="New room"
          >
            +
          </button>
        </div>

        {/* Room list */}
        <div className="px-2 space-y-0.5">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => onRoomSelect(room)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${activeRoom?._id === room._id
                ? "bg-indigo-950 text-indigo-200"
                : "text-gray-500 hover:bg-[#111827] hover:text-gray-300"
                }`}
            >
              <span className={`text-xs ${activeRoom?._id === room._id ? "text-indigo-400" : "text-gray-600"}`}>#</span>
              <span className="truncate font-medium">{room.name}</span>
            </button>
          ))}
        </div>

        {/* DMs nav button */}
        <div className="px-2 mt-3">
          <button
            onClick={() => navigate("/dms")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${location.pathname === "/dms"
              ? "bg-indigo-950 text-indigo-200"
              : "text-gray-500 hover:bg-[#111827] hover:text-gray-300"
              }`}
          >
            <svg className={`w-3.5 h-3.5 shrink-0 ${location.pathname === "/dms" ? "text-indigo-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Direct Messages</span>
          </button>
        </div>

        {/* Online users */}
        {onlineUsers.length > 0 && (
          <div className="mt-5">
            <div className="px-4 mb-1.5">
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                Online — {onlineUsers.length}
              </span>
            </div>
            <div className="px-2 space-y-0.5">
              {onlineUsers.map((u) => (
                <button
                  key={u.userId}
                  onClick={() => navigate(`/dms?user=${u.userId}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#111827] transition-colors"
                  title={`DM ${u.username}`}
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{u.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#1f2937] flex items-center gap-2">

        {/* Avatar + name — click to edit profile */}
        <button
          onClick={() => setShowEditProfile(true)}
          className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          title="Edit profile"
        >
          {getAvatarUrl(user?.avatar) ? (
            <img
              src={getAvatarUrl(user.avatar)}
              alt={user.username}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-400 truncate font-medium">
            {user?.displayName || user?.username}
          </span>
        </button>

        {/* Profile page link */}
        <button
          onClick={() => navigate("/profile")}
          title="View profile"
          className="text-gray-600 hover:text-indigo-400 transition-colors shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {/* Logout */}
        <button onClick={logout} title="Sign out" className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={async (name, description) => {
            await onCreateRoom(name, description);
            setShowCreate(false);
          }}
        />
      )}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </aside>
  );
}