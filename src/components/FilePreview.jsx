const formatSize = (bytes) => {
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

export default function FilePreview({ file, previewUrl, fileType, onRemove }) {
  const icon = getFileIcon(fileType);

  return (
    <div className="px-4 py-2 bg-[#0d1117] border-t border-[#1f2937]">
      <div className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-xl p-3">

        {/* Preview or icon */}
        {fileType === "image" && previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className={`w-12 h-12 rounded-lg ${icon.bg} border ${icon.border} flex items-center justify-center shrink-0`}>
            <span className={`text-xs font-bold ${icon.text}`}>{icon.label}</span>
          </div>
        )}

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-600">{formatSize(file.size)}</p>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-lg bg-[#1f2937] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors shrink-0"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}