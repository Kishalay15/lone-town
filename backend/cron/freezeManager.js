import cron from "node-cron";
import User from "../models/User.js";

const freezeManager = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("Running freeze manager");

    const now = new Date();

    try {
      const frozenUsers = await User.find({ state: "frozen" });

      for (const user of frozenUsers) {
        if (!user.frozenAt) continue;

        const timeDiff = now - new Date(user.frozenAt);
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed >= 24) {
          user.state = "available";
          user.frozenAt = null;
          await user.save();

          const io = getIO();
          io.to(user._id.toString()).emit("unfrozen");

          await notificationService.createNotification(
            user._id,
            "unfreeze",
            "You're now available again and eligible for matching."
          );

          console.log(`User ${user.name} (${user._id}) has been unfrozen.`);
        }
      }
    } catch (error) {
      console.error("Error in freezeManager:", error);
    }
  });
};

export default freezeManager;
