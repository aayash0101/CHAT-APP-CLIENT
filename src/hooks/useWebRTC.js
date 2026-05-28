import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../context/SocketContext.jsx";

export const useWebRTC = ({ isInitiator, targetId, onCallEnded }) => {
  const socket = useSocket();
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const cleanup = useCallback(() => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    // Destroy peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    if (!socket || !targetId) return;

    const startCall = async () => {
      try {
        // Get camera and microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        // Create peer — initiator sends the offer
        const peer = new SimplePeer({
          initiator: isInitiator,
          trickle: false,
          stream,
        });

        // When peer generates signaling data, send it to the other user
        peer.on("signal", (signal) => {
          socket.emit("call:signal", { targetId, signal });
        });

        // When remote stream arrives, display it
        peer.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          cleanup();
          if (onCallEnded) onCallEnded();
        });

        peer.on("close", () => {
          cleanup();
          if (onCallEnded) onCallEnded();
        });

        peerRef.current = peer;
      } catch (err) {
        console.error("Failed to get media:", err);
        if (onCallEnded) onCallEnded();
      }
    };

    startCall();

    // Receive signaling data from the other peer
    const handleSignal = ({ signal, senderId }) => {
      if (peerRef.current && senderId === targetId) {
        peerRef.current.signal(signal);
      }
    };

    socket.on("call:signal-received", handleSignal);

    return () => {
      socket.off("call:signal-received", handleSignal);
      cleanup();
    };
  }, [socket, targetId, isInitiator]);

  // Toggle microphone
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, []);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
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
  };
};