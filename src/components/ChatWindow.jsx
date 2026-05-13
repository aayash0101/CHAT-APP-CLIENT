import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatWindow({ messages, typingUsers, activeRoom }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!activeRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-500 text-sm">Select a room to start chatting</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 space-y-1">

      {/* Room name header hint */}
      <div className="text-center mb-4">
        <span className="text-xs text-gray-600 bg-gray-900 px-3 py-1 rounded-full">
          #{activeRoom.name} — beginning of history
        </span>
      </div>

      {messages.map((msg, index) => {
        const isOwn = msg.sender._id === user._id;
        const prevMsg = messages[index - 1];
        // Group consecutive messages from the same sender
        const isGrouped = prevMsg && prevMsg.sender._id === msg.sender._id;

        return (
          <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"}`}>
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? "items-end" : "items-start"} flex flex-col`}>

              {/* Show sender name only on first of a group */}
              {!isOwn && !isGrouped && (
                <span className="text-xs text-indigo-400 font-medium mb-1 px-1">
                  {msg.sender.username}
                </span>
              )}

              <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                isOwn
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-100 rounded-bl-sm"
              }`}>
                {msg.content}
              </div>

              {/* Timestamp — only show on last of a group or single message */}
              {(!messages[index + 1] || messages[index + 1]?.sender._id !== msg.sender._id) && (
                <span className="text-xs text-gray-600 mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start mt-3">
          <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-gray-500">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Invisible div to scroll to */}
      <div ref={bottomRef} />
    </div>
  );
}