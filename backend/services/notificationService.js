import Notification from "../models/Notification";
import { getIO } from "../sockets/ioInstance.js";

const createNotification = async (userId, type, message, options = {}) => {
  const notifications = new Notification({
    user: userId,
    type,
    message,
    relatedUser: options.relatedUser || null,
    matchId: options.matchId || null,
  });

  await notification.save();

  const io = getIO();
  io.to(userId.toString()).emit("notification", notification);

  return notification;
};

const getUserNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
};

export default {
  createNotification,
  getUserNotifications,
  markAllAsRead,
};
