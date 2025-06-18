import Match from "../models/Match.js";
import { getIO } from "../sockets/ioInstance.js";
import notificationService from "./notificationService.js";

const getMatches = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  const matches = await Match.find({ users: userId }).populate(
    "users",
    "name email"
  );

  return matches;
};

const sendMessage = async (matchId, senderId, content) => {
  if (!matchId || !senderId || !content?.trim()) {
    throw new Error("Match ID, Sender ID, and Content are required");
  }

  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");

  const newMessage = {
    sender: senderId,
    content: content.trim(),
    timeStamp: new Date(),
  };

  match.messages.push(newMessage);
  await match.save();

  return newMessage;
};

const pinMatch = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");

  match.pinned = true;
  match.unpinnedBy = null;
  match.unpinTimestamp = null;

  await match.save();

  return match;
};

const unpinMatch = async (matchId, userId) => {
  const match = await Match.findById(matchId).populate("users");
  if (!match) throw new Error("Match not found");

  match.pinned = false;
  match.unpinnedBy = userId;
  match.unpinTimestamp = new Date();
  match.status = "unmatched";

  await match.save();

  const io = getIO();

  for (const user of match.users) {
    const isUnpinner = user._id.toString() === userId;

    user.currentMatch = null;
    user.state = isUnpinner ? "frozen" : "available";
    user.freezeEndTime = isUnpinner
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;

    await user.save();

    io.to(user._id.toString()).emit("stateUpdated", {
      state: user.state,
    });
  }

  const freezer = match.users.find((u) => u._id.toString() === userId);
  const partner = match.users.find((u) => u._id.toString() !== userId);

  io.to(partner._id.toString()).emit("matchFrozen", {
    by: userId,
    matchId: match._id,
  });

  await notificationService.createNotification(
    partner._id,
    "freeze",
    `${freezer.name} has frozen the match.`,
    { relatedUser: freezer._id, matchId: match._id }
  );

  return match;
};

const giveFeedback = async (matchId, to, reason) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");

  match.feedback.push({ to, reason });
  await match.save();

  return match;
};

const unlockVideoCall = async (matchId) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");

  match.videoUnlocked = true;
  await match.save();

  return match;
};

export default {
  getMatches,
  sendMessage,
  pinMatch,
  unpinMatch,
  giveFeedback,
  unlockVideoCall,
};
