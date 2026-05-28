import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocket } from "./SocketContext.jsx";
import { useAuth } from "./AuthContext.jsx";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();

  const [incomingCall, setIncomingCall] = useState(null);  // incoming call data
  const [activeCall, setActiveCall] = useState(null);      // current active call
  const [callStatus, setCallStatus] = useState(null);      // "calling" | "connected" | "ended"

  useEffect(() => {
    if (!socket) return;

    // Someone is calling you
    socket.on("call:incoming", (data) => {
      setIncomingCall(data);
    });

    // Your call was accepted
    socket.on("call:accepted", (data) => {
      setCallStatus("connected");
      setActiveCall((prev) => ({ ...prev, ...data }));
    });

    // Your call was rejected
    socket.on("call:rejected", ({ username }) => {
      setCallStatus("ended");
      setActiveCall(null);
      setIncomingCall(null);
    });

    // Call ended by other party
    socket.on("call:ended", () => {
      setCallStatus("ended");
      setActiveCall(null);
      setIncomingCall(null);
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
    };
  }, [socket]);

  const initiateCall = ({ targetUserId, roomId, isGroup }) => {
    if (!socket) return;
    setCallStatus("calling");
    setActiveCall({ targetUserId, roomId, isGroup });
    socket.emit("call:initiate", {
      targetUserId,
      roomId,
      callerName: user?.username,
      callerAvatar: user?.avatar,
      isGroup,
    });
  };

  const acceptCall = () => {
    if (!socket || !incomingCall) return;
    setCallStatus("connected");
    setActiveCall(incomingCall);
    setIncomingCall(null);
    socket.emit("call:accepted", {
      callerId: incomingCall.callerId,
      roomId: incomingCall.roomId,
    });
  };

  const rejectCall = () => {
    if (!socket || !incomingCall) return;
    socket.emit("call:rejected", { callerId: incomingCall.callerId });
    setIncomingCall(null);
    setCallStatus(null);
  };

  const endCall = () => {
    if (!socket || !activeCall) return;
    socket.emit("call:ended", {
      targetId: activeCall.targetUserId,
      roomId: activeCall.roomId,
    });
    setActiveCall(null);
    setCallStatus(null);
    setIncomingCall(null);
  };

  return (
    <CallContext.Provider value={{
      incomingCall,
      activeCall,
      callStatus,
      initiateCall,
      acceptCall,
      rejectCall,
      endCall,
      setCallStatus,
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);