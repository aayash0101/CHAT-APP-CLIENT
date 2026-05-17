import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import DMSidebar from "../components/DMSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import NewDMModal from "../components/NewDMModal.jsx";
import ProfileModal from "../components/ProfileModal.jsx";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BACKEND_URL}${avatar}`;
};

export default function DMPage() {
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dms, setDMs] = useState([]);
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showNewDM, setShowNewDM] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);

  // Fetch all existing DMs on mount
  useEffect(() => {
    const fetchDMs = async () => {
      try {
        const { data } = await api.get("/dms");
        setDMs(data);
      } catch (err) {
        console.error("Failed to fetch DMs:", err);
      }
    };
    fetchDMs();
  }, []);

  // If ?user=id is in the URL, auto-open that DM
  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (targetUserId) {
      handleSelectUser(targetUserId);
      setSearchParams({}); // clear the query param after opening
    }
  }, [searchParams]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("message:receive", (message) => {
      setMessages((prev) => {
        if (message.roomId === activeDM?._id) {
          return [...prev, message];
        }
        return prev;
      });

      // Move the active DM to top of list when new message arrives
      setDMs((prev) => {
        const updated = prev.find((d) => d._id === message.roomId);
        if (!updated) return prev;
        return [updated, ...prev.filter((d) => d._id !== message.roomId)];
      });
    });

    socket.on("typing:update", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) return prev.includes(username) ? prev : [...prev, username];
        return prev.filter((u) => u !== username);
      });
    });

    return () => {
      socket.off("message:receive");
      socket.off("typing:update");
    };
  }, [socket, activeDM]);

  // Open a DM by selecting it from the list
  const handleDMSelect = useCallback(async (dm) => {
    if (activeDM) socket?.emit("room:leave", activeDM._id);

    setActiveDM(dm);
    setMessages([]);
    setTypingUsers([]);
    socket?.emit("room:join", dm._id);

    try {
      const { data } = await api.get(`/dms/${dm._id}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch DM messages:", err);
    }
  }, [socket, activeDM]);

  // Start or open a DM with a specific user ID
  const handleSelectUser = async (targetUserId) => {
    try {
      const { data: dm } = await api.post("/dms", { targetUserId });

      // Add to DM list if not already there
      setDMs((prev) => {
        const exists = prev.find((d) => d._id === dm._id);
        return exists ? prev : [dm, ...prev];
      });

      handleDMSelect(dm);
    } catch (err) {
      console.error("Failed to open DM:", err.response?.data?.message);
    }
  };

  // Get the other participant's info for the header
  const getOtherUser = (dm) => {
    return dm?.participants?.find((p) => p._id !== user._id);
  };

  const otherUser = activeDM ? getOtherUser(activeDM) : null;

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden">
      <DMSidebar
        dms={dms}
        activeDM={activeDM}
        onDMSelect={handleDMSelect}
        onNewDM={() => setShowNewDM(true)}
      />

      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        {otherUser ? (
          <div className="px-5 py-3 bg-[#0d1117] border-b border-[#1f2937] flex items-center justify-between shrink-0">
            <button
              onClick={() => setViewingUserId(otherUser._id)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                {getAvatarUrl(otherUser.avatar) ? (
                  <img src={getAvatarUrl(otherUser.avatar)} alt={otherUser.username} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                    {otherUser.username?.[0]?.toUpperCase()}
                  </div>
                )}
                {otherUser.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0d1117]" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-100">
                  {otherUser.displayName || otherUser.username}
                </p>
                <p className="text-xs text-gray-600">
                  {otherUser.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </button>

            {/* Back to chat */}
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-[#111827] transition-all text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Rooms
            </button>
          </div>
        ) : (
          <div className="px-5 py-3 bg-[#0d1117] border-b border-[#1f2937] flex items-center justify-between shrink-0">
            <span className="text-sm font-semibold text-gray-100">Direct Messages</span>
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-[#111827] transition-all text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Rooms
            </button>
          </div>
        )}

        {/* Chat area — reuse ChatWindow and MessageInput */}
        <ChatWindow
          messages={messages}
          typingUsers={typingUsers}
          activeRoom={activeDM}
          onUserClick={(userId) => setViewingUserId(userId)}
        />
        <MessageInput activeRoom={activeDM} />
      </div>

      {/* Modals */}
      {showNewDM && (
        <NewDMModal
          onClose={() => setShowNewDM(false)}
          onSelectUser={handleSelectUser}
        />
      )}
      {viewingUserId && (
        <ProfileModal
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  );
}