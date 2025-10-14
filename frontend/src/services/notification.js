import api from "../api/api";

// -------------------- GET USER NOTIFICATIONS --------------------
export const getUserNotifications = async (userId) => {
  try {
    const res = await api.get(`/notifications/${userId}`);
    return res.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// -------------------- MARK NOTIFICATION AS READ --------------------
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await api.put(`/notifications/${notificationId}/read`);
    return res.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// -------------------- DELETE NOTIFICATION --------------------
export const deleteNotification = async (notificationId) => {
  try {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
