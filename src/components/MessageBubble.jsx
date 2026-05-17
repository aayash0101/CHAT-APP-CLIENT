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
      return {
        bg: "bg-red-950/50",
        border: "border-red-900/40",
        text: "text-red-400",
        label: "PDF",
      };
    case "doc":
      return {
        bg: "bg-blue-950/50",
        border: "border-blue-900/40",
        text: "text-blue-400",
        label: "DOC",
      };
    default:
      return {
        bg: "bg-gray-900",
        border: "border-gray-700",
        text: "text-gray-400",
        label: "FILE",
      };
  }
};

export default function MessageBubble({ msg, isOwn }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const hasFile = !!msg.fileUrl;
  const isImage = msg.fileType === "image";
  const icon = getFileIcon(msg.fileType);

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
          <div
            className="cursor-pointer"
            onClick={() => setShowImageModal(true)}
          >
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
            <div
              className={`w-9 h-9 rounded-lg ${icon.bg} border ${icon.border} flex items-center justify-center shrink-0`}
            >
              <span className={`text-[10px] font-bold ${icon.text}`}>
                {icon.label}
              </span>
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  isOwn ? "text-white" : "text-gray-200"
                }`}
              >
                {msg.fileName}
              </p>
              <p
                className={`text-[10px] ${
                  isOwn ? "text-indigo-200" : "text-gray-600"
                }`}
              >
                {formatSize(msg.fileSize)}
              </p>
            </div>
            <svg
              className={`w-4 h-4 shrink-0 ${
                isOwn ? "text-indigo-200" : "text-gray-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        )}

        {/* Text content */}
        {msg.content && (
          <p className={`px-4 py-2 ${hasFile ? "border-t border-black/10" : ""}`}>
            {msg.content}
          </p>
        )}
      </div>

      {/* Full size image modal */}
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