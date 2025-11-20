import Notification from "../models/Notification.js";
import { emitToRoom } from "../utils/socket.js";

/**
 * Create + emit real-time notification
 */
export async function sendNotification({ title, message, toUser, room, data }) {
  const note = await Notification.create({
    title,
    message,
    to: toUser || null,
    room: room || null,
    data: data || null,
  });

  if (room) emitToRoom(room, "notification", note);
  if (toUser) emitToRoom(`user_${toUser}`, "notification", note);

  return note;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId) {
  return await Notification.find({ to: userId })
    .sort({ createdAt: -1 })
    .limit(50);
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId) {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
}
