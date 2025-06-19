import cron from "node-cron";
import User from "../models/User.js";
import dailyMatchmaker from "../services/dailyMatchmaker.js";

const scheduleRematches = () => {
  cron.schedule("*/10 * * * *", async () => {
    const now = new Date();

    const eligibleUsers = await User.find({
      state: "available",
      freezeEndTime: { $lte: now },
      currentMatch: null,
    });

    if (eligibleUsers.length > 0) {
      console.log(
        `Rematch Scheduler: ${eligibleUsers.length} users eligible for rematch.`
      );
    }

    for (const user of eligibleUsers) {
      user.freezeEndTime = null;
      await user.save();
    }

    await dailyMatchmaker();
  });
};

export default scheduleRematches;
