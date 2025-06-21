import notificationService from "../services/notificationService.js";

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await notificationService.getUserNotifications(
      userId
    );
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { getNotifications, markAsRead };
