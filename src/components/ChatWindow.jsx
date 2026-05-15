import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatWindow({ messages, typingUsers, activeRoom }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#030712] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0d1117] border border-[#1f2937] flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">Pick a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#030712] px-5 py-4 space-y-0.5">

      {/* History start label */}
      <div className="flex justify-center mb-5">
        <span className="text-xs text-gray-700 bg-[#0d1117] border border-[#1f2937] px-3 py-1 rounded-full">
          Start of #{activeRoom.name}
        </span>
      </div>

      {messages.map((msg, index) => {
        const isOwn = msg.sender._id === user._id;
        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];
        const isGrouped = prevMsg && prevMsg.sender._id === msg.sender._id;
        const isLastInGroup = !nextMsg || nextMsg.sender._id !== msg.sender._id;

        return (
          <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-4"}`}>
            <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-xs lg:max-w-md`}>

              {/* Sender label — only first in group */}
              {!isOwn && !isGrouped && (
                <span className="text-[11px] text-indigo-400 font-semibold mb-1 px-1">
                  {msg.sender.username}
                </span>
              )}

              {/* Bubble */}
              <div className={`px-4 py-2 text-sm leading-relaxed ${
                isOwn
                  ? "bg-indigo-600 text-white rounded-2xl rounded-br-md"
                  : "bg-[#111827] text-gray-200 border border-[#1f2937] rounded-2xl rounded-bl-md"
              }`}>
                {msg.content}
              </div>

              {/* Timestamp — last in group only */}
              {isLastInGroup && (
                <span className="text-[10px] text-gray-700 mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start mt-4">
          <div className="bg-[#111827] border border-[#1f2937] px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2.5">
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}