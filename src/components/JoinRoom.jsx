export default function JoinRoom({ room, onJoin }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#030712] gap-5">

      {/* Room icon */}
      <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-[#1f2937] flex items-center justify-center">
        <span className="text-2xl text-gray-600 font-light">#</span>
      </div>

      {/* Info */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-100 mb-1">#{room.name}</h2>
        <p className="text-sm text-gray-600">
          {room.description || "No description yet."}
        </p>
        <p className="text-xs text-gray-700 mt-2">
          {room.members?.length ?? 0} {room.members?.length === 1 ? "member" : "members"}
        </p>
      </div>

      {/* Join button */}
      <button
        onClick={onJoin}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        Join #{room.name}
      </button>
    </div>
  );
}