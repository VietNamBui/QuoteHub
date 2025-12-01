import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../config/api";

// Kết nối WebSocket cho việc cập nhật feed khi moderation thay đổi
export const connectFeedModerationSocket = (onEvent) => {
  const socket = new SockJS(`${API_BASE_URL}/ws`);
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe("/topic/feed/moderation", (message) => {
      try {
        const body = message.body;
        const data = body ? JSON.parse(body) : null;
        if (data && typeof onEvent === "function") {
          onEvent(data);
        }
      } catch (e) {
        console.error("Lỗi parse feed moderation event", e);
      }
    });
  };

  client.activate();

  // Hàm disconnect để cleanup trong useEffect
  return () => {
    try {
      client.deactivate();
    } catch (e) {
      // ignore
    }
  };
};
