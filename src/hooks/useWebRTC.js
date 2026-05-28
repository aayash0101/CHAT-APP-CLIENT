import { useEffect, useRef, useState, useCallback } from "react";
import Peer from "peerjs";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export const useWebRTC = ({ isInitiator, targetId, onCallEnded }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const callRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peerId, setPeerId] = useState(null);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    if (!socket || !targetId) return;

    const init = async () => {
      try {
        // Get camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        // Create PeerJS instance — use user ID as peer ID so we can find each other
        const peer = new Peer(String(user._id), {
          host: "0.peerjs.com",
          port: 443,
          secure: true,
        });

        peerRef.current = peer;

        peer.on("open", (id) => {
          console.log("✅ PeerJS connected, my ID:", id);
          setPeerId(id);

          if (isInitiator) {
            // Caller — initiate the call to the target
            console.log("📞 Calling peer:", targetId);
            const call = peer.call(String(targetId), stream);
            callRef.current = call;

            call.on("stream", (remote) => {
              console.log("📹 Got remote stream");
              setRemoteStream(remote);
            });

            call.on("close", () => {
              cleanup();
              if (onCallEnded) onCallEnded();
            });

            call.on("error", (err) => {
              console.error("Call error:", err);
              cleanup();
              if (onCallEnded) onCallEnded();
            });
          } else {
            // Callee — wait for the caller to call us
            peer.on("call", (call) => {
              console.log("📲 Receiving call from:", call.peer);
              callRef.current = call;
              call.answer(stream); // answer with our stream

              call.on("stream", (remote) => {
                console.log("📹 Got remote stream");
                setRemoteStream(remote);
              });

              call.on("close", () => {
                cleanup();
                if (onCallEnded) onCallEnded();
              });
            });
          }
        });

        peer.on("error", (err) => {
          console.error("PeerJS error:", err);
          // If peer ID already taken (user has another tab open), use a random ID
          if (err.type === "unavailable-id") {
            console.log("ID taken, retrying with random ID...");
          }
          cleanup();
          if (onCallEnded) onCallEnded();
        });

      } catch (err) {
        console.error("Failed to get media:", err);
        if (onCallEnded) onCallEnded();
      }
    };

    init();

    return () => cleanup();
  }, [socket, targetId, isInitiator, user._id]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
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
    peerId,
  };
};