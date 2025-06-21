import User from "../models/User.js";
import { findBestMatch, createMatch } from "./matchingService.js";
import { getIO } from "../sockets/ioInstance.js";
import notificationService from "./notificationService.js";

const dailyMatchmaker = async () => {
  try {
    const matchedUserIds = new Set();
    const availableUsers = await User.find({ state: "available" });

    for (let i = availableUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableUsers[i], availableUsers[j]] = [
        availableUsers[j],
        availableUsers[i],
      ];
    }

    const io = getIO();

    for (const user of availableUsers) {
      if (matchedUserIds.has(user._id.toString())) continue;

      const bestMatch = await findBestMatch(user);

      if (
        bestMatch &&
        !matchedUserIds.has(bestMatch._id.toString()) &&
        bestMatch.state === "available"
      ) {
        const match = await createMatch(user._id, bestMatch._id);

        matchedUserIds.add(user._id.toString());
        matchedUserIds.add(bestMatch._id.toString());

        io.to(user._id.toString()).emit("matchMade", { with: bestMatch });
        io.to(bestMatch._id.toString()).emit("matchMade", { with: user });

        await notificationService.createNotification(
          user._id,
          "match",
          `You've been matched with ${bestMatch.name}`,
          { relatedUser: bestMatch._id, matchId: match._id }
        );

        await notificationService.createNotification(
          bestMatch._id,
          "match",
          `You've been matched with ${user.name}`,
          { relatedUser: user._id, matchId: match._id }
        );

        console.log(
          `Matched ${user.name} with ${bestMatch.name}`
        );
      }
    }
    console.log(
      `Daily matchmaking complete. Total matches: ${matchedUserIds.size / 2}`
    );
  } catch (err) {
    console.error("Error during matchmaking:", err);
    throw err;
  }
};

export default dailyMatchmaker;
