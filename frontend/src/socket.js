import { io } from "socket.io-client";

const URL = "http://localhost:9090";
const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
