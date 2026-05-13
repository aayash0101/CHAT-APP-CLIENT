import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";

export default function ChatPage() {
  const socket = useSocket();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Fetch all rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get("/rooms");
        setRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  // Register all socket event listeners
  useEffect(() => {
    if (!socket) return;

    // New message received
    socket.on("message:receive", (message) => {
      // Only add to state if it's for the active room
      setMessages((prev) => {
        if (message.roomId === activeRoom?._id) {
          return [...prev, message];
        }
        return prev;
      });
    });

    // User came online
    socket.on("user:online", (data) => {
      if (data.userId !== user._id) {
        setOnlineUsers((prev) => {
          const exists = prev.find((u) => u.userId === data.userId);
          return exists ? prev : [...prev, data];
        });
      }
    });

    // User went offline
    socket.on("user:offline", (data) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Typing events
    socket.on("typing:update", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        }
        return prev.filter((u) => u !== username);
      });
    });

    // Cleanup: remove listeners when socket or activeRoom changes
    return () => {
      socket.off("message:receive");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("typing:update");
    };
  }, [socket, activeRoom, user._id]);

  // Handle switching rooms
  const handleRoomSelect = useCallback(async (room) => {
    // Leave previous room
    if (activeRoom) {
      socket?.emit("room:leave", activeRoom._id);
    }

    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);

    // Join new room via socket
    socket?.emit("room:join", room._id);

    // Fetch message history via REST
    try {
      const { data } = await api.get(`/rooms/${room._id}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [socket, activeRoom]);

  // Handle creating a new room
  const handleCreateRoom = async (name) => {
    try {
      const { data } = await api.post("/rooms", { name });
      setRooms((prev) => [...prev, data]);
      handleRoomSelect(data); // auto-join the new room
    } catch (err) {
      console.error("Failed to create room:", err.response?.data?.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={handleCreateRoom}
        onlineUsers={onlineUsers}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Room header */}
        {activeRoom && (
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-2 shrink-0">
            <span className="text-gray-500 text-lg">#</span>
            <span className="text-white font-semibold text-sm">{activeRoom.name}</span>
            {activeRoom.description && (
              <>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500 text-xs">{activeRoom.description}</span>
              </>
            )}
          </div>
        )}

        <ChatWindow
          messages={messages}
          typingUsers={typingUsers}
          activeRoom={activeRoom}
        />
        <MessageInput activeRoom={activeRoom} />
      </div>
    </div>
  );
}