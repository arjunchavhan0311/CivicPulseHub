import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export default function useAdminWebSocket() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log("WS:", str),

      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      onConnect: () => {
        console.log("✅ Admin WebSocket connected");

        client.subscribe("/topic/admin/complaints", (msg) => {
          const dto = JSON.parse(msg.body);
          setNotifications((prev) => [
            { complaintId: dto.complaintId, message: dto.status },
            ...prev,
          ]);
        });
      },

      onStompError: (frame) => console.error("❌ STOMP error:", frame.headers.message),
      onDisconnect: () => console.log("🔌 Admin WebSocket disconnected"),
    });

    client.activate();

    return () => client.deactivate();
  }, []);

  const deleteNotification = (idx) => {
    setNotifications((prev) => prev.filter((_, i) => i !== idx));
  };

  return { notifications, deleteNotification };
}