import { useCall } from "../context/CallContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import IncomingCallModal from "./IncomingCallModal.jsx";
import CallModal from "./CallModal.jsx";

export default function CallManager() {
  const { incomingCall, activeCall, callStatus, acceptCall, rejectCall } = useCall();
  const { user } = useAuth();

  // Show incoming call screen
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
    const targetId = activeCall.callerId || activeCall.targetUserId;
    const isInitiator = !activeCall.callerId; // if callerId exists we are the callee

    return (
      <CallModal
        targetId={targetId}
        isInitiator={isInitiator}
      />
    );
  }

  return null;
}