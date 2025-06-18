import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

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

export default {
  registerUser,
  loginUser,
  updateUserProfile,
};
