import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;

export const connectWebSocket = ({
  onCitizenNotify,
  onAdminNotify,
}) => {
  if (isConnected) {
    console.warn("⚠️ WebSocket already connected, skipping...");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ No JWT token found");
    return;
  }

  console.log("🔌 Opening WebSocket connection...");

  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS("http://localhost:8081/ws"),

    connectHeaders: {
      Authorization: `Bearer ${token}`, // ✅ JWT
    },

    debug: (str) => {
      console.log("🟢 WS:", str);
    },

    onConnect: () => {
      console.log("✅ WebSocket connected");
      isConnected = true;

      // ================= Citizen Notifications =================
      if (onCitizenNotify) {
        stompClient.subscribe("/user/queue/notify", (msg) => {
          try {
            onCitizenNotify(JSON.parse(msg.body));
          } catch (e) {
            console.error("❌ Citizen WS parse error", e);
          }
        });
      }

      // ================= Admin Broadcast =================
      if (onAdminNotify) {
        stompClient.subscribe("/topic/admin/complaints", (msg) => {
          try {
            onAdminNotify(JSON.parse(msg.body));
          } catch (e) {
            console.error("❌ Admin WS parse error", e);
          }
        });
      }
    },

    onStompError: (frame) => {
      console.error("❌ Broker error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },

    onWebSocketError: (error) => {
      console.error("❌ WebSocket transport error", error);
      isConnected = false;
    },

    onDisconnect: () => {
      console.log("🔌 WebSocket disconnected");
      isConnected = false;
      stompClient = null;
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient && isConnected) {
    stompClient.deactivate();
  } else {
    console.warn("⚠️ WebSocket not connected, skipping disconnect");
  }
};
