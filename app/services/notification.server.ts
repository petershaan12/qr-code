import { getDb } from "~/.server/db";
import { type NotificationData } from "~/types";

/**
 * Create a new notification
 */
export async function createNotification(data: {
  user_id: number;
  title: string;
  message: string;
  type: string;
}): Promise<NotificationData> {
  const db = getDb();

  const [result] = await db.query(
    "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
    [data.user_id, data.title, data.message, data.type],
  );

  const notificationId = (result as any).insertId;

  // Return the created notification
  const [notifications]: any = await db.query(
    "SELECT * FROM notifications WHERE id = ?",
    [notificationId],
  );

  return notifications[0];
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(
  userId: number,
): Promise<NotificationData[]> {
  const db = getDb();

  const [notifications]: any = await db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );

  return notifications;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const db = getDb();
  await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [
    notificationId,
  ]);
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: number,
): Promise<void> {
  const db = getDb();
  await db.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [
    userId,
  ]);
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: number,
): Promise<void> {
  const db = getDb();
  await db.query("DELETE FROM notifications WHERE id = ?", [notificationId]);
}
