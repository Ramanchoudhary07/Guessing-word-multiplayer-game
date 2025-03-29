import { useEffect, useState } from "react";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  console.log("inside useSocket");

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_SERVER);

    ws.onopen = () => {
      console.log("socket is connected: ", ws);
      setSocket(ws);
    };
    ws.onclose = () => {
      console.log("socket is disconnected");
      setSocket(null);
    };

    return () => {
      console.log("inside cleanup func");
      ws.close();
    };
  }, []);

  return socket;
};
