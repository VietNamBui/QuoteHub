import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export const connectNotificationSocket = (userId, onMessage) => {
  if (!userId) return () => {};

  // Nếu đã có kết nối cũ thì ngắt trước
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
  }

  const client = new Client({
    // Backend Spring Boot đang chạy trên port 5454 (server.port=5454)
    webSocketFactory: () => new SockJS("http://localhost:5454/ws"),
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => {
    client.subscribe(`/topic/notifications/${userId}`, (message) => {
      try {
        const body = JSON.parse(message.body);
        onMessage && onMessage(body);
      } catch (e) {
        console.error("Lỗi parse notification", e);
      }
    });
  };

  client.activate();
  stompClient = client;

  return () => {
    client.deactivate();
  };
};
