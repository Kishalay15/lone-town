import User from "../models/User.js";
import Match from "../models/Match.js";

const incrementInitiation = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.analytics.initiations = (user.analytics.initiations || 0) + 1;
  await user.save();
};

const incrementUnpins = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.analytics.unpins = (user.analytics.unpins || 0) + 1;
  await user.save();
};

const incrementFreezes = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.analytics.freezes = (user.analytics.freezes || 0) + 1;
  await user.save();
};

const recordReplyTime = async (matchId, senderId, timestamp) => {
  const match = await Match.findById(matchId);
  if (!match || match.messages.length < 2) return;

  const lastMsg = match.messages[match.messages.length - 2];
  if (!lastMsg || lastMsg.sender.toString() === senderId.toString()) return;

  const replyDelay = new Date(timestamp) - new Date(lastMsg.timeStamp);
  const replyMinutes = replyDelay / (1000 * 60);

  const user = await User.findById(senderId);
  if (!user) return;

  const totalReplies = user.analytics.replyCount || 0;
  const currentAvg = user.analytics.avgReplyTime || 0;
  const newAvg =
    (currentAvg * totalReplies + replyMinutes) / (totalReplies + 1);

  user.analytics.avgReplyTime = newAvg;
  user.analytics.replyCount = totalReplies + 1;

  await user.save();
};

export default {
  incrementInitiation,
  incrementUnpins,
  incrementFreezes,
  recordReplyTime,
};
