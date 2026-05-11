const API_URL = "http://localhost:5001/api/notifications";

export interface AppNotification {
  _id: string;
  userId: string;
  type: "price_drop";
  title: string;
  message: string;
  phoneId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    oldPrice?: number;
    newPrice?: number;
    dropPercent?: number;
  };
}

export const getMyNotifications = async (
  token: string,
  options?: { markRead?: boolean },
) => {
  const url = options?.markRead ? `${API_URL}?markRead=true` : API_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await response.json();
};

export const markNotificationRead = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return await response.json();
};

export const markAllNotificationsRead = async (token: string) => {
  const response = await fetch(`${API_URL}/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark notifications as read");
  }

  return await response.json();
};