import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";

export const useWebRTC = ({ isInitiator, targetId, onCallEnded }) => {
  const socket = useSocket();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingSignalsRef = useRef([]); // ← use ref so it persists across renders

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingSignalsRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const processSignal = useCallback(async (signal, senderId) => {
    if (!pcRef.current) return;
    try {
      console.log("⚙️ Processing signal:", signal.type, "from:", senderId);
      if (signal.type === "offer") {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        console.log("📤 Sending answer to:", senderId);
        socket.emit("call:signal", {
          targetId: String(senderId),
          signal: { type: "answer", sdp: answer },
        });
      } else if (signal.type === "answer") {
        console.log("📥 Setting remote answer");
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );
      } else if (signal.type === "candidate") {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(signal.candidate)
        );
      }
    } catch (err) {
      console.error("Signal processing error:", err);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket || !targetId) return;

    // Register signal handler immediately — before init
    const handleSignal = ({ signal, senderId }) => {
      console.log("📥 Received signal:", signal.type, "from:", senderId);
      if (!pcRef.current) {
        console.log("⏳ PC not ready, buffering:", signal.type);
        pendingSignalsRef.current.push({ signal, senderId });
        return;
      }
      processSignal(signal, senderId);
    };

    socket.on("call:signal-received", handleSignal);

    const init = async () => {
      try {
        console.log("🎥 Starting WebRTC, isInitiator:", isInitiator, "targetId:", targetId);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          console.log("📹 Got remote track!");
          setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("🧊 Sending ICE candidate to:", targetId);
            socket.emit("call:signal", {
              targetId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", pc.connectionState);
          if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
            cleanup();
            if (onCallEnded) onCallEnded();
          }
        };

        if (isInitiator) {
          // Caller creates offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("📤 Sending offer to:", targetId);
          socket.emit("call:signal", {
            targetId,
            signal: { type: "offer", sdp: offer },
          });
        } else {
          // Callee — process any buffered signals that arrived before pc was ready
          console.log("⏳ Processing", pendingSignalsRef.current.length, "buffered signals");
          for (const { signal, senderId } of pendingSignalsRef.current) {
            await processSignal(signal, senderId);
          }
          pendingSignalsRef.current = [];
        }
      } catch (err) {
        console.error("WebRTC init error:", err);
        if (onCallEnded) onCallEnded();
      }
    };

    init();

    return () => {
      socket.off("call:signal-received", handleSignal);
      cleanup();
    };
  }, [socket, targetId, isInitiator]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !t.enabled));
      setIsMuted((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getVideoTracks()
        .forEach((t) => (t.enabled = !t.enabled));
      setIsVideoOff((prev) => !prev);
    }
  }, []);

  return {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    cleanup,
  };
};