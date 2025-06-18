import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { getIO } from "../sockets/ioInstance.js";
import { FREEZE_DURATION_MS } from "../config/constants.js";

const registerUser = async (userData) => {
  const { password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ ...userData, password: hashedPassword });

  await newUser.save();

  const { password: _, ...userWithoutPassword } = newUser.toObject();

  return userWithoutPassword;
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

export default {
  registerUser,
  loginUser,
  updateUserProfile,
  toggleFreeze,
};
