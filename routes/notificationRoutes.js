import express from "express";
import {
  deleteNotification,
  getAllUnreadNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notifications.js";
import { isUser, isAdmin, isSuperAdmin } from "../middleware/auth.js";
import cache from "../middleware/redisMiddleware.js";

const router = express.Router();

router.get(
  "/",
  isUser,
  isAdmin,
  cache("All Notifications: "),
  getAllNotifications
);
router.get("/unread", isUser, isAdmin, getAllUnreadNotifications);
router.patch("/mark/:id", isUser, isAdmin, markAsRead);
router.patch("/mark-all", isUser, isAdmin, markAllAsRead);
router.delete("/delete/:id", isUser, isAdmin, isSuperAdmin, deleteNotification);

export default router;
