import matchService from "../services/matchService.js";
import { getIO } from "../sockets/ioInstance.js";
import User from "../models/User.js";
import notificationService from "../services/notificationService.js";
import Match from "../models/Match.js";

const createMatch = async (req, res) => {
  const { user1, user2 } = req.body;

  if (!user1 || !user2) {
    return res.status(400).json({ message: "User IDs required" });
  }

  try {
    const existing = await Match.findOne({ users: { $all: [user1, user2] } });
    if (existing)
      return res.status(400).json({ message: "Match already exists" });

    const match = await Match.create({
      users: [user1, user2],
      messages: [],
      pinned: true,
      status: "active",
      unreadCounts: {
        [user1]: 0,
        [user2]: 0,
      },
    });

    res.status(201).json({ message: "Match created", match });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const userId = req.userId;
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

const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log("Fetching match with ID:", matchId); // 🪵 Add logging

    const match = await Match.findById(matchId).populate("users", "name _id");

    if (!match) {
      console.log("Match not found");
      return res.status(404).json({ message: "Match not found" });
    }

    console.log("Match found:", match);

    res.status(200).json({
      match,
      messages: match.messages || [],
    });
  } catch (err) {
    console.error("Error in getMatchById:", err);
    res.status(500).json({ message: "Failed to fetch match" });
  }
};

export default {
  getMatches,
  sendMessage,
  pinMatch,
  unpinMatch,
  giveFeedback,
  unlockVideoCall,
  getMatchById,
  createMatch,
};
