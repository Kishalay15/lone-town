import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pinned: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  unpinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  unpinTimestamp: { type: Date },
  videoUnlocked: { type: Boolean, default: false },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  feedback: [
    {
      to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
    },
  ],
  status: {
    type: String,
    enum: ["active", "unmatched", "expired", "frozen"],
    default: "active",
  },
  firstMessageTimestamp: { type: Date },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {},
  },
});

export default mongoose.model("Match", MatchSchema);
