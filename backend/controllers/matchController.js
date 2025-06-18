import matchService from "../services/matchService.js";

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

export default {
  getMatches,
  sendMessage,
};
