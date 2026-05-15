import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import CreateRoomModal from "./CreateRoomModal.jsx";

export default function Sidebar({ rooms, activeRoom, onRoomSelect, onCreateRoom, onlineUsers }) {
  const { user, logout } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

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
              className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${
                activeRoom?._id === room._id
                  ? "bg-indigo-950 text-indigo-200"
                  : "text-gray-500 hover:bg-[#111827] hover:text-gray-300"
              }`}
            >
              <span className={`text-xs ${activeRoom?._id === room._id ? "text-indigo-400" : "text-gray-600"}`}>#</span>
              <span className="truncate font-medium">{room.name}</span>
            </button>
          ))}
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
                <div key={u.userId} className="flex items-center gap-2.5 px-3 py-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{u.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#1f2937] flex items-center gap-2.5">
        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="text-xs text-gray-400 truncate flex-1 font-medium">{user?.username}</span>
        <button onClick={logout} title="Sign out" className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Modal */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={async (name, description) => {
            await onCreateRoom(name, description);
            setShowCreate(false);
          }}
        />
      )}
    </aside>
  );
}