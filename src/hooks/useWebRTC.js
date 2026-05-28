import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
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
        if (!socket || !targetId) return; // don't start if no targetId

        const startCall = async () => {
            try {
                console.log("🎥 Starting WebRTC, isInitiator:", isInitiator, "targetId:", targetId);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                localStreamRef.current = stream;
                setLocalStream(stream);

                const peer = new SimplePeer({
                    initiator: isInitiator,
                    trickle: false,
                    stream,
                });

                peer.on("signal", (signal) => {
                    console.log("📤 Sending signal to:", targetId, signal.type);
                    socket.emit("call:signal", { targetId, signal });
                });

                peer.on("stream", (remoteStream) => {
                    console.log("📹 Got remote stream!");
                    setRemoteStream(remoteStream);
                });

                peer.on("connect", () => {
                    console.log(" Peer connected!");
                });

                peer.on("error", (err) => {
                    console.error("Peer error:", err);
                    cleanup();
                    if (onCallEnded) onCallEnded();
                });

                peer.on("close", () => {
                    console.log("🔌 Peer closed");
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

        const handleSignal = ({ signal, senderId }) => {
            console.log(" Received signal from:", senderId, "expected:", targetId);
            if (peerRef.current) {
                peerRef.current.signal(signal);
            }
        };

        socket.on("call:signal-received", handleSignal);

        return () => {
            socket.off("call:signal-received", handleSignal);
            cleanup();
        };
    }, [socket, targetId, isInitiator]); // ← targetId in deps so it reruns when set

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