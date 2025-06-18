import cron from "node-cron";
import Match from "../models/Match.js";
import { getIO } from "../sockets/ioInstance.js";
import notificationService from "../services/notificationService.js";

const milestoneTracker = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const io = getIO();

      const matches = await Match.find({
        videoUnlocked: false,
        createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      }).populate("users");

      for (const match of matches) {
        if ((match.messages.length || 0) >= 100) {
          match.videoUnlocked = true;
          await match.save();

          const [user1, user2] = match.users;

          io.to(user1._id.toString()).emit("videoUnlocked", {
            matchId: match._id,
          });
          io.to(user2._id.toString()).emit("videoUnlocked", {
            matchId: match._id,
          });

          await notificationService.createNotification(
            user1._id,
            "milestone",
            `You and ${user2.name} unlocked video calling!`,
            { relatedUser: user2._id, matchId: match._id }
          );

          await notificationService.createNotification(
            user2._id,
            "milestone",
            `You and ${user1.name} unlocked video calling!`,
            { relatedUser: user1._id, matchId: match._id }
          );

          console.log(`Video call unlocked for match ${match._id}`);
        }
      }
    } catch (err) {
      console.error("Error in milestoneTracker:", err);
    }
  });
};

export default milestoneTracker;
