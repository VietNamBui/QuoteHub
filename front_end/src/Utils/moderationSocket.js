import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let moderationClient = null;

export const connectModerationSocket = (onMessage) => {
  if (moderationClient && moderationClient.connected) {
    moderationClient.deactivate();
  }

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:5454/ws"),
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => {
    client.subscribe("/topic/admin/moderation", () => {
      onMessage && onMessage();
    });
  };

  client.activate();
  moderationClient = client;

  return () => {
    client.deactivate();
  };
};
