import mongoose, { mongo } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emotionalIntelligence: { type: Number, required: false, default: 0 },
  psychologicalTraits: { type: Object, required: false, default: {} },
  behavioralPatterns: { type: Object, required: false, default: {} },
  relationshipValues: { type: Object, required: false, default: {} },
  currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  state: {
    type: String,
    enum: ["available", "matched", "pinned", "frozen"],
    default: "available",
  },
  freezeEndTime: { type: Date },
  matchStartTime: { type: Date },
  messageCount: { type: Number, default: 0 },
  messageMilestoneReached: { type: Boolean, default: false },
  freezeReason: { type: String, default: null },
  analytics: {
    initiations: { type: Number, default: 0 },
    unpins: { type: Number, default: 0 },
    freezes: { type: Number, default: 0 },
    avgReplyTime: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
  },
});

export default mongoose.model("User", UserSchema);
