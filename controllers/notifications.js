import redisConfig from "../helpers/redis.js";
import Notification from "../models/notificationSchema.js";
import { getIO } from "../helpers/socketio.js";

const createNotification = async (body) => {
  try {
    const { title, content, about } = body;

    if (!title || !content || !about) {
      return {
        success: false,
        message: "All fields (title, content, about) are required",
      };
    }

    const newNotification = await Notification.create({
      title,
      content,
      about,
    });

    await redisConfig.flushall("ASYNC");

    return { success: true, notification: newNotification };
  } catch (error) {
    const err = new Error(error);
    return { success: false, message: err.message };
  }
};

const makeMessage = async (
  msgObj = {
    title: "New Registration",
    content: "Notifications work perfectly well",
    about: "Eventra Event Organization",
  }
) => {
  const createdNotify = await createNotification(msgObj);
  if (!createdNotify.success) return createdNotify.message;

  console.log("Message sent and notification created successfully.");
  try {
    const io = getIO();
    io.to("admin").emit("adminMessage", {
      user: "EVENTRA API",
      ...msgObj,
      createdAt: Date.now(),
    });
  } catch (socketErr) {
    console.error("Socket emit failed in makeMessage:", socketErr.message);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    next(error);
  }
};

const getAllUnreadNotifications = async (req, res, next) => {
  try {
    const unreadNotifications = await Notification.find({
      views: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      unreadNotifications: unreadNotifications || [],
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    if (!req.params.id)
      return res.status(400).json({
        success: false,
        message: "Notification id is required.",
      });

    if (!["admin", "superAdmin"].includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can read notifications",
      });

    const notification = await Notification.findById(req.params.id);

    if (!notification)
      return res.status(404).json({
        success: false,
        message: `Notification not found.`,
      });

    const alreadyRead = notification.views.some(
      (v) => v.toString() === req.user._id.toString()
    );

    if (alreadyRead)
      return res.status(400).json({
        success: false,
        message: "Notification has been read before now.",
      });

    await Notification.findByIdAndUpdate(req.params.id, {
      $push: { views: req.user._id },
    });

    await redisConfig.flushall("ASYNC");

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { views: { $ne: req.user._id } },
      { $push: { views: req.user._id } }
    );

    await redisConfig.flushall("ASYNC");

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    if (!req.params.id)
      return res.status(400).json({
        success: false,
        message: "The id of this notification is required",
      });

    if (req.user.role !== "superAdmin") {
      return res.status(403).json({
        message:
          "Access denied. Only the super admin is allowed to delete events.",
      });
    }

    const deletedNotification = await Notification.findByIdAndDelete(
      req.params.id
    );

    await redisConfig.flushall("ASYNC");

    if (!deletedNotification)
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  makeMessage,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
  getAllUnreadNotifications,
  deleteNotification,
};

export default {
  makeMessage,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
  getAllUnreadNotifications,
  deleteNotification,
};
