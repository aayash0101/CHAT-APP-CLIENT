import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext.jsx";

export default function MessageInput({ activeRoom }) {
  const [message, setMessage] = useState("");
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const handleTyping = (value) => {
    setMessage(value);
    if (!socket || !activeRoom) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing:start", { roomId: activeRoom._id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing:stop", { roomId: activeRoom._id });
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !activeRoom) return;
    socket.emit("message:send", { roomId: activeRoom._id, content: message.trim() });
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    socket.emit("typing:stop", { roomId: activeRoom._id });
    setMessage("");
  };

  if (!activeRoom) return null;

  return (
    <div className="px-4 py-3.5 bg-[#0d1117] border-t border-[#1f2937]">
      <form onSubmit={handleSend} className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] focus-within:border-indigo-800 rounded-xl px-4 py-2.5 transition-colors">
        <input
          type="text" value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder={
            activeRoom.isDM
              ? `Send a message...`
              : `Message #${activeRoom.name}`
          } className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-700 focus:outline-none"
        />
        <button
          type="submit" disabled={!message.trim()}
          className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all shrink-0"
        >
          <svg className="w-3.5 h-3.5 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}