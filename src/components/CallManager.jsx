import { useCall } from "../context/CallContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import IncomingCallModal from "./IncomingCallModal.jsx";
import CallModal from "./CallModal.jsx";

export default function CallManager() {
  const { incomingCall, activeCall, callStatus, acceptCall, rejectCall } = useCall();
  const { user } = useAuth();

  // Show incoming call screen — only when not yet connected
  if (incomingCall && callStatus !== "connected") {
    return (
      <IncomingCallModal
        call={incomingCall}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    );
  }

  // Show active call screen
  if (activeCall && (callStatus === "connected" || callStatus === "calling")) {
    // Caller: targetUserId is who we called
    // Callee: callerId is who called us
    const targetId = activeCall.targetUserId || activeCall.callerId;
    const isInitiator = !!activeCall.targetUserId && !activeCall.callerId;

    console.log("CallModal targetId:", targetId, "isInitiator:", isInitiator);

    if (!targetId) return null; // don't render if no target yet

    return (
      <CallModal
        targetId={String(targetId)}
        isInitiator={isInitiator}
      />
    );
  }

  return null;
}