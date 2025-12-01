import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let analyticsClient = null;

export const connectAnalyticsSocket = (onMessage) => {
  // Nếu đã có kết nối cũ thì ngắt trước
  if (analyticsClient && analyticsClient.connected) {
    analyticsClient.deactivate();
  }

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:5454/ws"),
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => {
    client.subscribe("/topic/admin/analytics", (message) => {
      try {
        const body = message.body ? JSON.parse(message.body) : message.body;
        onMessage && onMessage(body || "ANALYTICS_UPDATED");
      } catch (e) {
        console.error("Lỗi parse analytics message", e);
        onMessage && onMessage("ANALYTICS_UPDATED");
      }
    });
  };

  client.activate();
  analyticsClient = client;

  return () => {
    client.deactivate();
  };
};
