import { useEffect } from "react";
import { socket } from "../../socket";

export const useSocketNotifications = () => {
  useEffect(() => {
    socket.on("notification", (data) => {
      console.log("📩 New Notification:", data);

      // İstersen toast gösterebilirsin
      // toast.success(data.message);
    });

    return () => {
      socket.off("notification");
    };
  }, []);
};
