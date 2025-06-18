import mongoose, { mongo } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emotionalIntelligence: { type: Number, required: true },
  psychologicalTraits: { type: Object, required: true },
  behavioralPatterns: { type: Object, required: true },
  relationshipValues: { type: Object, required: true },
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
});

export default mongoose.model("User", UserSchema);
