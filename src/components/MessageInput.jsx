import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext.jsx";

export default function MessageInput({ activeRoom }) {
  const [message, setMessage] = useState("");
  const socket = useSocket();
  const typingTimeoutRef = useRef(null); // track typing timeout to auto-stop
  const isTypingRef = useRef(false);

  // Cleanup typing timeout when component unmounts
  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const handleTyping = (value) => {
    setMessage(value);
    if (!socket || !activeRoom) return;

    // Start typing if not already
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing:start", { roomId: activeRoom._id });
    }

    // Reset the stop-typing timer on every keystroke
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing:stop", { roomId: activeRoom._id });
    }, 1500); // stop typing after 1.5s of no keystrokes
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !activeRoom) return;

    socket.emit("message:send", {
      roomId: activeRoom._id,
      content: message.trim(),
    });

    // Stop typing indicator immediately on send
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    socket.emit("typing:stop", { roomId: activeRoom._id });

    setMessage("");
  };

  if (!activeRoom) return null;

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-800">
      <form onSubmit={handleSend} className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder={`Message #${activeRoom.name}`}
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}