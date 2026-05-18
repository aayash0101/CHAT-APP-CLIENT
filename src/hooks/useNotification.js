import { useEffect, useCallback } from "react";

export const useNotifications = () => {

  // Request permission on first call
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const notify = useCallback(({ title, body, icon, onClick }) => {
    // Don't show if permission not granted
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const notification = new Notification(title, {
      body,
      icon: icon || "/vite.svg", // fallback to vite icon
      badge: "/vite.svg",
      silent: false,
    });

    // Click brings user to the right place
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClick) onClick();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }, []);

  return { notify };
};