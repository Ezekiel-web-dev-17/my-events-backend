import "dotenv/config";
import {
  PORT as CONFIG_PORT,
  SESSION_SECRET,
  CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  MONGO_URL,
} from "./config/config.js";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import fileupload from "express-fileupload";
import passport from "passport";
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";

import { init } from "./helpers/socketio.js";
import "./config/passport.js";

import userRoutes from "./routes/userRoutes.js";
import eventraRoutes from "./routes/eventraRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import contactRoutes from "./routes/contactRoute.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import verifyQrcode from "./routes/qrcode.js";
import webhookRoutes from "./routes/webhookRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Import Error middleware to handle errors throughout the API.
import errorMiddleware from "./middleware/error.js";
// Import arcjet middleware to handle rate limiting throughout the API.
import arcjetMiddleware from "./middleware/arjectMiddleware.js";
import redisConfig from "./helpers/redis.js";
import socketAuth from "./middleware/socketMiddleware.js";
import { isUser } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = init(server);
const PORT = CONFIG_PORT || 5500;

// middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(
  fileupload({
    useTempFiles: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

// Configuration for Cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Arcjet rate limiter to prevent users from spamming the server by allowing a limited number of requests to be made by a user within a given time
app.use(arcjetMiddleware);

// ROUTES
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Events Server" });
});
app.use("/api/auth", userRoutes);
app.use("/api/eventra", eventraRoutes);
// make use of errorMiddleware as backup if ever any error occurs in any event route.
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/qrcode", verifyQrcode);
app.use("/api/webhook", webhookRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/auth", googleRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/contact", contactRoutes);

// Middleware: runs before each socket connection
io.use(socketAuth(isUser));

io.on("connection", (socket) => {
  socket.emit("connected", socket.user);
  console.log(`User connected: ${socket.id} (${socket.user?.firstname || "User"})`);

  socket.on("adminRoom", (room) => {
    const role = socket.user?.role;
    if (room !== "admin" || !["admin", "superAdmin"].includes(role)) {
      const err = new Error(
        `Dear ${socket.user?.firstname || "User"}, You are not allowed to join this chat room.`
      );
      socket.emit("error", err.message); // trigger the error event
      return;
    }

    socket.join(room);
    io.to(room).emit("adminRoom", `${socket.user?.firstname || "User"} joined ${room}`);
  });

  socket.on("adminMessage", ({ room, obj }) => {
    io.to(room).emit("adminMessage", {
      user: socket.user?.firstname || "Admin",
      ...obj,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.user?.firstname || "User"} disconnected`);
  });
});

// Serve static notification frontend
app.use("/notifications-app", express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "frontend")));

// error routes
app.use("/", (req, res) => {
  res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    redisConfig.flushall("ASYNC");
    await mongoose.connect(MONGO_URL, { dbName: "EVENTS-DB" });
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
