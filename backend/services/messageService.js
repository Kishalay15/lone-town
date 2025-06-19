import Match from "../models/Match.js";

const markMessagesAsRead = async (matchId, userId) => {
  const match = await Match.findById(matchId);
  if (!match) return;

  if (!match.unreadCounts) match.unreadCounts = new Map();

  match.unreadCounts.set(userId, 0);
  await match.save();
};

export default { markMessagesAsRead };
