import { useState } from "react";
import ImageModal from "./ImageModal.jsx";

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType) => {
  switch (fileType) {
    case "pdf":
      return { bg: "bg-red-950/50", border: "border-red-900/40", text: "text-red-400", label: "PDF" };
    case "doc":
      return { bg: "bg-blue-950/50", border: "border-blue-900/40", text: "text-blue-400", label: "DOC" };
    default:
      return { bg: "bg-gray-900", border: "border-gray-700", text: "text-gray-400", label: "FILE" };
  }
};

// Single tick = sent, Double tick = read
function ReadTick({ isRead }) {
  if (isRead) {
    // Double tick — blue/indigo
    return (
      <span className="inline-flex items-center ml-1 shrink-0" title="Read">
        <svg className="w-3.5 h-3.5 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0.41 13.41L6 19l1.41-1.42L0.41 11 0.41 13.41zM22.59 
            4L11.66 14.92l-3.25-3.25L6.5 13.09l5.16 5.16L24 5.41 22.59 4zM
            18 7L16.59 5.58l-7.93 7.93 1.41 1.41L18 7z"/>
        </svg>
      </span>
    );
  }

  // Single tick — gray
  return (
    <span className="inline-flex items-center ml-1 shrink-0" title="Sent">
      <svg className="w-3 h-3 text-indigo-300/60" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
    </span>
  );
}

export default function MessageBubble({ msg, isOwn, currentUserId }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const hasFile = !!msg.fileUrl;
  const isImage = msg.fileType === "image";
  const icon = getFileIcon(msg.fileType);

  // Check if anyone other than sender has read this message
  const isRead = msg.readBy?.some(
    (id) => id !== msg.sender._id && id !== msg.sender
  );

  return (
    <>
      <div
        className={`px-0 py-0 text-sm leading-relaxed overflow-hidden ${
          isOwn
            ? "bg-indigo-600 text-white rounded-2xl rounded-br-md"
            : "bg-[#111827] text-gray-200 border border-[#1f2937] rounded-2xl rounded-bl-md"
        }`}
      >
        {/* Image attachment */}
        {hasFile && isImage && (
          <div className="cursor-pointer" onClick={() => setShowImageModal(true)}>
            <img
              src={msg.fileUrl}
              alt={msg.fileName || "image"}
              className="max-w-[240px] max-h-[200px] object-cover w-full"
            />
          </div>
        )}

        {/* File attachment */}
        {hasFile && !isImage && (
          <a
            href={msg.fileUrl}
            target="_blank"
            rel="noreferrer"
            download={msg.fileName}
            className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
          >
            <div className={`w-9 h-9 rounded-lg ${icon.bg} border ${icon.border} flex items-center justify-center shrink-0`}>
              <span className={`text-[10px] font-bold ${icon.text}`}>{icon.label}</span>
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-medium truncate ${isOwn ? "text-white" : "text-gray-200"}`}>
                {msg.fileName}
              </p>
              <p className={`text-[10px] ${isOwn ? "text-indigo-200" : "text-gray-600"}`}>
                {formatSize(msg.fileSize)}
              </p>
            </div>
            <svg
              className={`w-4 h-4 shrink-0 ${isOwn ? "text-indigo-200" : "text-gray-600"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        )}

        {/* Text content + tick */}
        {msg.content && (
          <p className={`px-4 py-2 ${hasFile ? "border-t border-black/10" : ""} flex items-end gap-1`}>
            <span className="flex-1">{msg.content}</span>
            {isOwn && <ReadTick isRead={isRead} />}
          </p>
        )}

        {/* Tick for file-only messages */}
        {isOwn && !msg.content && hasFile && (
          <div className="flex justify-end px-2 pb-1">
            <ReadTick isRead={isRead} />
          </div>
        )}
      </div>

      {showImageModal && (
        <ImageModal
          src={msg.fileUrl}
          fileName={msg.fileName}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}