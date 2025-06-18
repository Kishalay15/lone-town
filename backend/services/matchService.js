import Match from "../models/Match.js";

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
  if (!match) {
    throw new Error("Match not found");
  }

  const newMessage = {
    sender: senderId,
    content: content.trim(),
    timeStamp: new Date(),
  };

  match.messages.push(newMessage);
  await match.save();

  return newMessage;
};

export default {
  getMatches,
  sendMessage,
};
