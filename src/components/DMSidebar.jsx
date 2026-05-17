import { useAuth } from "../context/AuthContext.jsx";

const BACKEND_URL = "https://chat-app-api-y5fo.onrender.com";

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `${BACKEND_URL}${avatar}`;
};

export default function DMSidebar({ dms, activeDM, onDMSelect, onNewDM }) {
    const { user } = useAuth();

    // Get the other participant in a DM (not the current user)
    const getOtherUser = (dm) => {
        return dm.participants.find((p) => p._id.toString() !== user._id.toString());
    };

    return (
        <aside className="w-56 bg-[#0d1117] border-r border-[#1f2937] flex flex-col h-full shrink-0">

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-[#1f2937] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-100 tracking-tight">Messages</span>
                </div>
                <button
                    onClick={onNewDM}
                    className="text-gray-600 hover:text-indigo-400 transition-colors text-base leading-none"
                    title="New message"
                >
                    +
                </button>
            </div>

            {/* DM list */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
                {dms.length === 0 ? (
                    <div className="px-3 py-8 text-center">
                        <p className="text-xs text-gray-700">No conversations yet</p>
                        <p className="text-xs text-gray-800 mt-1">Click + to start one</p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {dms.map((dm) => {
                            const other = getOtherUser(dm);
                            if (!other) return null;
                            const avatarUrl = getAvatarUrl(other.avatar);

                            return (
                                <button
                                    key={dm._id}
                                    onClick={() => onDMSelect(dm)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${activeDM?._id === dm._id
                                            ? "bg-indigo-950 text-indigo-200"
                                            : "text-gray-500 hover:bg-[#111827] hover:text-gray-300"
                                        }`}
                                >
                                    {/* Avatar with online dot */}
                                    <div className="relative shrink-0">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={other.username} className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                                                {other.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        {other.isOnline && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0d1117]" />
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">
                                            {other.displayName || other.username}
                                        </p>
                                        <p className="text-[10px] text-gray-700 truncate">
                                            @{other.username}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}