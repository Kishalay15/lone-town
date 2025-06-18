import userService from "../services/userService.js";

const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.registerUser(userData);

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await userService.loginUser(email, password);

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const updatedUser = await userService.updateUserProfile(userId, userData);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  registerUser,
  loginUser,
  updateUserProfile,
};
