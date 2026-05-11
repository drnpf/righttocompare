import { Response } from "express";
import { AuthRequest } from "../middleware/authentication";
import * as NotificationService from "../services/inAppNotificationService";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const shouldMarkRead = req.query.markRead === "true";

        let notifications = await NotificationService.getNotificationsForUser(uid);
        let unreadCount = await NotificationService.getUnreadNotificationCount(uid);

        if (shouldMarkRead && unreadCount > 0) {
            await NotificationService.markAllNotificationsAsRead(uid);

            notifications = notifications.map((notification: any) => ({
                ...notification,
                isRead: true,
            }));

            unreadCount = 0;
        }

        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error fetching notifications" });
    }
};

export const markOneRead = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!uid) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (!notificationId) {
      res.status(400).json({ message: "Missing notification ID" });
      return;
    }

    const notification = await NotificationService.markNotificationAsRead(uid, notificationId);
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;

        if (!uid) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        await NotificationService.markAllNotificationsAsRead(uid);
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        res.status(500).json({ message: "Server error updating notifications" });
    }
};