import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Match from "../models/Match.js";
import jwt from "jsonwebtoken";
import { getIO } from "../sockets/ioInstance.js";
import { FREEZE_DURATION_MS } from "../config/constants.js";

const registerUser = async (userData) => {
  const { password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ ...userData, password: hashedPassword });

  await newUser.save();

  const { password: _, ...userWithoutPassword } = newUser.toObject();

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token, user: userWithoutPassword };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const { password: _, ...userWithoutPassword } = user.toObject();

  return { token, user: userWithoutPassword };
};

const updateUserProfile = async (userId, userData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    new: true,
  });
  if (!updatedUser) {
    throw new Error("User not found");
  }
  return updatedUser;
};

const toggleFreeze = async (userId, reason) => {
  if (!userId) throw new Error("User ID is required");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const io = getIO();

  if (user.state === "available") {
    user.state = "frozen";
    user.freezeEndTime = new Date(Date.now() + FREEZE_DURATION_MS);
    if (reason) user.freezeReason = reason;

    await user.save();

    io.to(userId).emit("freezeStatusChanged", {
      state: "frozen",
      freezeEndTime: user.freezeEndTime,
    });

    await notificationService.createNotification(
      userId,
      "freeze",
      `You are now in a reflection freeze for 24h.`
    );

    return {
      message: "User frozen for 24h.",
      state: "frozen",
      freezeEndTime: user.freezeEndTime,
    };
  }

  if (user.state === "frozen") {
    if (user.freezeEndTime && user.freezeEndTime <= new Date()) {
      user.state = "available";
      user.freezeEndTime = null;
      user.freezeReason = null;

      await user.save();

      io.to(userId).emit("freezeStatusChanged", {
        state: "available",
        freezeEndTime: null,
      });

      await notificationService.createNotification(
        userId,
        "freeze",
        `Your freeze period has ended. You're now available for new matches.`
      );

      return { message: "User is now available.", state: "available" };
    } else {
      throw new Error(
        `User is frozen and cannot unfreeze before ${user.freezeEndTime}`
      );
    }
  }

  throw new Error(`Cannot toggle freeze from state: ${user.state}`);
};

const computeUserAnalytics = async (userId) => {
  const matches = await Match.find({ users: userId });

  let messageCount = 0;
  let replyCount = 0;
  let replyTimeTotal = 0;
  let initiations = 0;

  for (const match of matches) {
    const messages = match.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Count messages sent by user
    const userMessages = messages.filter((m) => m.sender.toString() === userId);
    messageCount += userMessages.length;

    // Count initiations
    if (messages[0]?.sender?.toString() === userId) {
      initiations += 1;
    }

    // Compute reply time
    for (let i = 1; i < messages.length; i++) {
      const prev = messages[i - 1];
      const curr = messages[i];

      if (
        prev.sender.toString() !== userId &&
        curr.sender.toString() === userId
      ) {
        const diffSec =
          (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;
        replyTimeTotal += diffSec;
        replyCount += 1;
      }
    }
  }
  const avgReplyTime = replyCount ? Math.round(replyTimeTotal / replyCount) : 0;

  const user = await User.findById(userId);
  if (user) {
    user.messageCount = messageCount;
    user.analytics.initiations = initiations;
    user.analytics.replyCount = replyCount;
    user.analytics.avgReplyTime = avgReplyTime;

    await user.save();
  }

  return {
    messageCount,
    analytics: {
      initiations,
      replyCount,
      avgReplyTime,
      freezes: user?.analytics?.freezes || 0,
      unpins: user?.analytics?.unpins || 0,
    },
  };
};

export default {
  registerUser,
  loginUser,
  updateUserProfile,
  toggleFreeze,
  computeUserAnalytics,
};
