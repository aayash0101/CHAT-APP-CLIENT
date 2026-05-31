import { useCall } from "../context/CallContext.jsx";
import IncomingCallModal from "./IncomingCallModal.jsx";
import CallModal from "./CallModal.jsx";

export default function CallManager() {
  const { incomingCall, activeCall, callStatus, acceptCall, rejectCall } = useCall();

  if (incomingCall && callStatus !== "connected") {
    return (
      <IncomingCallModal
        call={incomingCall}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    );
  }

  if (activeCall && (callStatus === "connected" || callStatus === "calling")) {
    const isInitiator = !!activeCall.targetUserId;
    const targetId = isInitiator
      ? String(activeCall.targetUserId)
      : String(activeCall.callerId);

    console.log("CallModal targetId:", targetId, "isInitiator:", isInitiator);

    if (!targetId || targetId === "undefined") return null;

    return (
      <CallModal
        targetId={targetId}
        isInitiator={isInitiator}
      />
    );
  }

  return null;
}