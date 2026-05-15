import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import JoinRoom from "../components/JoinRoom.jsx";

export default function ChatPage() {
  const socket = useSocket();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isMember, setIsMember] = useState(false);  // ← new

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

  useEffect(() => {
    if (!socket) return;

    socket.on("message:receive", (message) => {
      setMessages((prev) => {
        if (message.roomId === activeRoom?._id) {
          return [...prev, message];
        }
        return prev;
      });
    });

    socket.on("user:online", (data) => {
      if (data.userId !== user._id) {
        setOnlineUsers((prev) => {
          const exists = prev.find((u) => u.userId === data.userId);
          return exists ? prev : [...prev, data];
        });
      }
    });

    socket.on("user:offline", (data) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    socket.on("typing:update", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) return prev.includes(username) ? prev : [...prev, username];
        return prev.filter((u) => u !== username);
      });
    });

    return () => {
      socket.off("message:receive");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("typing:update");
    };
  }, [socket, activeRoom, user._id]);

  // Check if current user is a member of the selected room
  const checkMembership = useCallback((room) => {
    return room.members.some(
      (memberId) =>
        memberId === user._id ||
        memberId._id === user._id ||
        memberId.toString?.() === user._id
    );
  }, [user._id]);

  const enterRoom = useCallback(async (room) => {
    if (activeRoom) socket?.emit("room:leave", activeRoom._id);

    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);
    socket?.emit("room:join", room._id);

    try {
      const { data } = await api.get(`/rooms/${room._id}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [socket, activeRoom]);

  const handleRoomSelect = useCallback((room) => {
    const member = checkMembership(room);
    setIsMember(member);
    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);

    // Only join socket room and load messages if already a member
    if (member) {
      if (activeRoom) socket?.emit("room:leave", activeRoom._id);
      socket?.emit("room:join", room._id);
      api.get(`/rooms/${room._id}/messages`)
        .then(({ data }) => setMessages(data))
        .catch((err) => console.error("Failed to fetch messages:", err));
    }
  }, [socket, activeRoom, checkMembership]);

  const handleJoinRoom = async () => {
    try {
      await api.post(`/rooms/${activeRoom._id}/join`);

      // Update rooms list so membership is reflected immediately
      const updatedRoom = {
        ...activeRoom,
        members: [...activeRoom.members, user._id],
      };
      setRooms((prev) =>
        prev.map((r) => (r._id === activeRoom._id ? updatedRoom : r))
      );

      setIsMember(true);
      enterRoom(updatedRoom);
    } catch (err) {
      console.error("Failed to join room:", err.response?.data?.message);
    }
  };

  const handleCreateRoom = async (name) => {
    try {
      const { data } = await api.post("/rooms", { name });
      setRooms((prev) => [...prev, data]);
      setIsMember(true);
      enterRoom(data);
    } catch (err) {
      console.error("Failed to create room:", err.response?.data?.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={handleCreateRoom}
        onlineUsers={onlineUsers}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {activeRoom && (
          <div className="px-5 py-3 bg-[#0d1117] border-b border-[#1f2937] flex items-center gap-2 shrink-0">
            <span className="text-gray-600">#</span>
            <span className="text-sm font-semibold text-gray-100">{activeRoom.name}</span>
            {activeRoom.description && (
              <>
                <span className="text-[#1f2937] mx-1">|</span>
                <span className="text-xs text-gray-600">{activeRoom.description}</span>
              </>
            )}
          </div>
        )}

        {/* Show join screen OR chat depending on membership */}
        {activeRoom && !isMember ? (
          <JoinRoom room={activeRoom} onJoin={handleJoinRoom} />
        ) : (
          <>
            <ChatWindow
              messages={messages}
              typingUsers={typingUsers}
              activeRoom={activeRoom}
            />
            <MessageInput activeRoom={activeRoom} />
          </>
        )}
      </div>
    </div>
  );
}