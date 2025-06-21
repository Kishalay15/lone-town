import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
