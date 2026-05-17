import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function SearchBar({ onRoomSelect, rooms }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ rooms: [], messages: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search — wait 300ms after typing stops
  useEffect(() => {
    if (!query.trim()) {
      setResults({ rooms: [], messages: [] });
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${query}`);
        setResults(data);
        setOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleRoomClick = (room) => {
    onRoomSelect(room);
    setQuery("");
    setOpen(false);
  };

  const handleMessageClick = (message) => {
    // Find the room in our existing rooms list and select it
    const room = rooms.find((r) => r._id === message.room._id);
    if (room) {
      onRoomSelect(room);
    }
    setQuery("");
    setOpen(false);
  };

  const hasResults = results.rooms.length > 0 || results.messages.length > 0;

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div ref={wrapperRef} className="relative px-3 py-2 border-b border-[#1f2937]">

      {/* Input */}
      <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] focus-within:border-indigo-600 rounded-xl px-3 py-2 transition-colors">
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rooms & messages"
          className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-700 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-[#0d1117] border border-[#1f2937] rounded-xl overflow-hidden z-50 shadow-xl shadow-black/50">

          {!hasResults ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-gray-700">No results for "{query}"</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">

              {/* Rooms section */}
              {results.rooms.length > 0 && (
                <div>
                  <div className="px-3 py-2 border-b border-[#1f2937]">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                      Rooms
                    </span>
                  </div>
                  {results.rooms.map((room) => (
                    <button
                      key={room._id}
                      onClick={() => handleRoomClick(room)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#111827] transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-900/40 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-indigo-400">#</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-200 truncate">{room.name}</p>
                        {room.description && (
                          <p className="text-[10px] text-gray-600 truncate">{room.description}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-700 shrink-0 ml-auto">
                        {room.members?.length ?? 0} members
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Messages section */}
              {results.messages.length > 0 && (
                <div>
                  <div className={`px-3 py-2 border-b border-[#1f2937] ${results.rooms.length > 0 ? "border-t" : ""}`}>
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                      Messages
                    </span>
                  </div>
                  {results.messages.map((msg) => (
                    <button
                      key={msg._id}
                      onClick={() => handleMessageClick(msg)}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-[#111827] transition-colors text-left"
                    >
                      {/* Sender initial */}
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0 mt-0.5">
                        {msg.sender?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-medium text-indigo-400">
                            {msg.sender?.username}
                          </span>
                          <span className="text-[10px] text-gray-700">in</span>
                          <span className="text-[10px] text-gray-600">#{msg.room?.name}</span>
                          <span className="text-[10px] text-gray-700 ml-auto shrink-0">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        {/* Highlight matching query in message */}
                        <p className="text-xs text-gray-400 truncate">{msg.content}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
