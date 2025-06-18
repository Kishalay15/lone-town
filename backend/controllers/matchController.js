import matchService from "../services/matchService.js";
import { getIO } from "../sockets/ioInstance.js";
import User from "../models/User.js";
import notificationService from "../services/notificationService.js";

const getMatches = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const matches = await matchService.getMatches(userId);

    res.status(200).json(matches);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { matchId, senderId, content } = req.body;
    if (!matchId || !senderId || !content?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const message = await matchService.sendMessage(matchId, senderId, content);

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const pinMatch = async (req, res) => {
  const { matchId } = req.body;

  try {
    await matchService.pinMatch(matchId);

    res.status(200).json({ message: "Match pinned." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const unpinMatch = async (req, res) => {
  const { matchId, userId } = req.body;

  try {
    const match = await matchService.unpinMatch(matchId, userId);
    const io = getIO();
    const partner = match.users.find((u) => u._id.toString() !== userId);
    const partnerId = partner._id;
    const unpinUser = await User.findById(userId);

    io.to(partnerId.toString()).emit("matchUnpinned", { by: userId });

    for (const user of match.users) {
      if (user._id.toString() !== userId) {
        io.to(user._id.toString()).emit("matchUnpinned", { by: userId });
      }
    }

    await notificationService.createNotification(
      partnerId,
      "unpinned",
      `${unpinUser.name} has unpinned from your match.`,
      { relatedUser: unpinUser._id, matchId }
    );

    res.status(200).json({ message: "Match unpinned." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const giveFeedback = async (req, res) => {
  const { matchId, to, reason, from } = req.body;

  try {
    await matchService.giveFeedback(matchId, to, reason);

    const io = getIO();
    io.to(to.toString()).emit("feedbackGiven", { reason, matchId });

    await notificationService.createNotification(
      to,
      "feedback",
      "Feedback received on your previous match.",
      { relatedUser: from, matchId }
    );

    res.status(201).json({ message: "Feedback submitted." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const unlockVideoCall = async (req, res) => {
  const { matchId } = req.body;

  try {
    await matchService.unlockVideoCall(matchId);

    res.status(200).json({ message: "Video call unlocked." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export default {
  getMatches,
  sendMessage,
  pinMatch,
  unpinMatch,
  giveFeedback,
  unlockVideoCall,
};
