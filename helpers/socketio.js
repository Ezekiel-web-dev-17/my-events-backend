import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/config.js";

let io;

const allowedOrigins = [
  FRONTEND_URL || "http://localhost:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
];

export const init = (server) => {
  const socketio = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io = socketio;
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export default { init, getIO };
