import { useEffect } from "react";

export default function ImageModal({ src, fileName, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-4xl max-h-full flex flex-col gap-3">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 truncate">{fileName}</span>
          <div className="flex items-center gap-2 ml-4">

            {/* Download button */}
            <a
              href={src}
              download={fileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] border border-[#1f2937] rounded-lg text-gray-400 hover:text-white text-xs transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
              Download
            </a>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-7 h-7 bg-[#111827] border border-[#1f2937] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Image */}
        <img
          src={src}
          alt={fileName}
          className="max-h-[80vh] max-w-full object-contain rounded-xl"
        />
      </div>
    </div>
  );
}