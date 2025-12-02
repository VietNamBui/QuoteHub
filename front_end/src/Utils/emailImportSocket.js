import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let emailImportClient = null;

export const connectEmailImportSocket = (userId, onMessage) => {
  if (!userId) return () => {};

  // Ngắt kết nối cũ nếu còn
  if (emailImportClient && emailImportClient.connected) {
    emailImportClient.deactivate();
  }

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:5454/ws"),
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => {
    client.subscribe(`/topic/email/import-history/${userId}`, (message) => {
      try {
        const body = message.body ? JSON.parse(message.body) : null;
        onMessage && onMessage(body);
      } catch (e) {
        console.error("Lỗi parse email import message", e);
      }
    });
  };

  client.activate();
  emailImportClient = client;

  return () => {
    client.deactivate();
  };
};
