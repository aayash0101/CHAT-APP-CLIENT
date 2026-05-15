import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

export default function Sidebar({ rooms, activeRoom, onRoomSelect, onCreateRoom, onlineUsers }) {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [showCreate, setShowCreate] = useState(false);


  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName.trim(), newRoomDesc.trim());
    setNewRoomName("");
    setNewRoomDesc("");  
    setShowCreate(false);
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0">

      {/* App Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">ChatApp</span>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rooms</span>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-5 h-5 text-gray-500 hover:text-indigo-400 transition-colors text-lg leading-none"
            title="Create room"
          >
            +
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreateRoom} className="mx-2 mb-2 p-2 bg-[#111827] border border-indigo-900/60 rounded-xl">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="room-name"
              autoFocus
              className="w-full bg-transparent text-gray-200 text-xs placeholder-gray-600 focus:outline-none mb-2"
            />
            <input
              type="text"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-transparent text-gray-200 text-xs placeholder-gray-600 focus:outline-none border-t border-[#1f2937] pt-2 mb-2"
            />
            <div className="flex gap-1.5">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg py-1.5 transition-colors font-medium">
                Create
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-[#1f2937] hover:bg-[#374151] text-gray-400 text-xs rounded-lg py-1.5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Room List */}
        <div className="space-y-0.5">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => onRoomSelect(room)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeRoom?._id === room._id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <span className="text-gray-500">#</span>
              <span className="truncate">{room.name}</span>
            </button>
          ))}
        </div>

        {/* Online Users Section */}
        {onlineUsers.length > 0 && (
          <div className="mt-6">
            <div className="px-1 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Online — {onlineUsers.length}
              </span>
            </div>
            <div className="space-y-0.5">
              {onlineUsers.map((u) => (
                <div key={u.userId} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                  <span className="text-sm text-gray-400 truncate">{u.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current User Footer */}
      <div className="p-3 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-300 truncate">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="text-gray-500 hover:text-red-400 transition-colors shrink-0 ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}