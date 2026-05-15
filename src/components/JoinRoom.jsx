export default function JoinRoom({ room, onJoin }) {
  const memberCount = room.members?.length ?? 0;

  // Count online users — this is a rough indicator since we don't have
  // per-room online tracking yet, so we just show total members for now
  const createdBy = room.createdBy?.username ?? "someone";

  return (
    <div className="flex-1 flex items-center justify-center bg-[#030712]">
      <div className="bg-[#0d1117] border border-[#1f2937] rounded-2xl p-10 w-80 flex flex-col items-center">

        {/* Room icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0f1729] border border-indigo-900/60 flex items-center justify-center mb-5">
          <span className="text-3xl text-indigo-500 font-light leading-none">#</span>
        </div>

        {/* Online badge */}
        <div className="flex items-center gap-1.5 bg-[#0f1729] border border-indigo-900/40 rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span className="text-[11px] text-indigo-400 font-medium">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        {/* Room info */}
        <h2 className="text-xl font-semibold text-gray-100 tracking-tight mb-2">
          #{room.name}
        </h2>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
          {room.description || "No description yet."}
        </p>

        {/* Stats */}
        <div className="flex gap-2.5 mb-6">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-3 flex flex-col items-center gap-0.5">
            <span className="text-base font-semibold text-gray-200">{memberCount}</span>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Members</span>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-3 flex flex-col items-center gap-0.5">
            <span className="text-base font-semibold text-gray-200">0</span>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Online</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#1f2937] mb-5" />

        {/* Created by */}
        <p className="text-xs text-gray-600 mb-5">
          Created by{" "}
          <span className="text-indigo-400 font-medium">{createdBy}</span>
        </p>

        {/* Join button */}
        <button
          onClick={onJoin}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors tracking-tight"
        >
          Join #{room.name}
        </button>

        <button
          onClick={() => window.history.back()}
          className="mt-3 text-xs text-gray-600 hover:text-gray-500 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}