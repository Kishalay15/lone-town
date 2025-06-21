import userService from "../services/userService.js";
import User from "../models/User.js";

const registerUser = async (req, res) => {
  try {
    const { token, user } = await userService.registerUser(req.body);
    res.status(201).json({
      success: true,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { token, user } = await userService.loginUser(req.body);
    res.status(200).json({
      success: true,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      user,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // console.log("Decoded userId from token:", req.user.userId);
    // console.log("User ID from URL params:", userId);

    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const userData = req.body;
    const updatedUser = await userService.updateUserProfile(userId, userData);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const toggleFreeze = async (req, res) => {
  const { userId, reason } = req.body;

  try {
    const result = await userService.toggleFreeze(userId, reason);

    res.status(200).json({
      success: true,
      message:
        result.state === "frozen"
          ? "User frozen for 24h."
          : "User is now available.",
      ...result,
    });
  } catch (error) {
    console.error("toggleFreeze error:", error.message);
    const status = error.message.includes("cannot unfreeze")
      ? 403
      : error.message.includes("not found")
      ? 404
      : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("analytics");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.analytics);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const refreshUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.id;

    const stats = await userService.computeUserAnalytics(userId);

    res.status(200).json({
      success: true,
      message: "Analytics refreshed",
      analytics: stats.analytics,
      messageCount: stats.messageCount,
    });
  } catch (err) {
    console.error("Error refreshing analytics:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to refresh analytics" });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token missing" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export default {
  registerUser,
  loginUser,
  updateUserProfile,
  toggleFreeze,
  getUserAnalytics,
  refreshUserAnalytics,
  refreshAccessToken,
};
