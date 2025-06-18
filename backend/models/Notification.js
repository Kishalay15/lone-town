import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["match", "message", "unpinned", "feedback", "freeze", "milestone"],
      required: true,
    },
    message: { type: String, required: true },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
