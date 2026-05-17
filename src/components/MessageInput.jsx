import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import api from "../api/axios.js";
import FilePreview from "./FilePreview.jsx";

export default function MessageInput({ activeRoom }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    // Determine file type
    if (selected.type.startsWith("image/")) {
      setFileType("image");
      setFilePreviewUrl(URL.createObjectURL(selected));
    } else if (selected.type === "application/pdf") {
      setFileType("pdf");
      setFilePreviewUrl("");
    } else if (selected.type.includes("word")) {
      setFileType("doc");
      setFilePreviewUrl("");
    } else {
      setFileType("other");
      setFilePreviewUrl("");
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreviewUrl("");
    setFileType("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || !socket || !activeRoom) return;

    // Stop typing indicator
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    socket.emit("typing:stop", { roomId: activeRoom._id });

    let fileData = {};

    // Upload file first if one is selected
    if (file) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileData = {
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
          fileSize: data.fileSize,
        };
      } catch (err) {
        console.error("File upload failed:", err);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Emit message with optional file data
    socket.emit("message:send", {
      roomId: activeRoom._id,
      content: message.trim(),
      ...fileData,
    });

    setMessage("");
    handleRemoveFile();
  };

  if (!activeRoom) return null;

  return (
    <div className="bg-[#0d1117] border-t border-[#1f2937]">

      {/* File preview — shown above input when file is selected */}
      {file && (
        <FilePreview
          file={file}
          previewUrl={filePreviewUrl}
          fileType={fileType}
          onRemove={handleRemoveFile}
        />
      )}

      <div className="px-4 py-3.5">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] focus-within:border-indigo-800 rounded-xl px-4 py-2.5 transition-colors">

          {/* File attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-600 hover:text-indigo-400 transition-colors shrink-0"
            title="Attach file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            className="hidden"
          />

          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={file ? "Add a caption..." : `Message #${activeRoom.name}`}
            className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-700 focus:outline-none"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && !file) || uploading}
            className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all shrink-0"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}