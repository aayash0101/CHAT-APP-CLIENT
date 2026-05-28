import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";

export const useWebRTC = ({ isInitiator, targetId, onCallEnded }) => {
  const socket = useSocket();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

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
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    if (!socket || !targetId) return;

    let pc;

    const init = async () => {
      try {
        // 1. Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        // 2. Create RTCPeerConnection with public STUN servers
        pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        pcRef.current = pc;

        // 3. Add local tracks to the connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 4. When remote track arrives, set remote stream
        pc.ontrack = (event) => {
          console.log("📹 Got remote track");
          setRemoteStream(event.streams[0]);
        };

        // 5. Send ICE candidates to the other peer via socket
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("🧊 Sending ICE candidate");
            socket.emit("call:signal", {
              targetId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", pc.connectionState);
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed" ||
            pc.connectionState === "closed"
          ) {
            cleanup();
            if (onCallEnded) onCallEnded();
          }
        };

        // 6. Initiator creates and sends the offer
        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("📤 Sending offer");
          socket.emit("call:signal", {
            targetId,
            signal: { type: "offer", sdp: offer },
          });
        }
      } catch (err) {
        console.error("WebRTC init error:", err);
        if (onCallEnded) onCallEnded();
      }
    };

    // 7. Handle incoming signals
    const handleSignal = async ({ signal, senderId }) => {
      console.log("📥 Received signal:", signal.type, "from:", senderId);
      if (!pcRef.current) return;

      if (signal.type === "offer") {
        // Callee receives offer — sends back answer
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        console.log("📤 Sending answer");
        socket.emit("call:signal", {
          targetId: senderId,
          signal: { type: "answer", sdp: answer },
        });
      } else if (signal.type === "answer") {
        // Caller receives answer
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );
      } else if (signal.type === "candidate") {
        // Both sides receive ICE candidates
        try {
          await pcRef.current.addIceCandidate(
            new RTCIceCandidate(signal.candidate)
          );
        } catch (err) {
          console.error("ICE candidate error:", err);
        }
      }
    };

    socket.on("call:signal-received", handleSignal);
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