const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BACKEND_URL}${avatar}`;
};

export default function IncomingCallModal({ call, onAccept, onReject }) {
  const avatarUrl = getAvatarUrl(call.callerAvatar);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl w-full max-w-xs p-6 flex flex-col items-center gap-5">

        {/* Pulsing ring animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping" />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={call.callerName}
              className="relative w-20 h-20 rounded-full object-cover border-4 border-[#0d1117]"
            />
          ) : (
            <div className="relative w-20 h-20 rounded-full bg-indigo-600 border-4 border-[#0d1117] flex items-center justify-center text-white text-2xl font-semibold">
              {call.callerName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Caller info */}
        <div className="text-center">
          <p className="text-white font-semibold text-lg">{call.callerName}</p>
          <p className="text-gray-500 text-sm mt-1">
            {call.isGroup ? "Inviting you to a group call" : "Incoming video call..."}
          </p>
        </div>

        {/* Accept / Reject buttons */}
        <div className="flex gap-6">
          {/* Reject */}
          <button
            onClick={onReject}
            className="w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Decline"
          >
            <svg className="w-6 h-6 text-white rotate-135" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Accept"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}