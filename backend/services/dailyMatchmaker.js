import User from "../models/User.js";
import { findBestMatch, createMatch } from "./matchingService.js";

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

    for (const user of availableUsers) {
      if (matchedUserIds.has(user._id.toString())) continue;

      const bestMatch = await findBestMatch(user);

      if (
        bestMatch &&
        !matchedUserIds.has(bestMatch._id.toString()) &&
        bestMatch.state === "available"
      ) {
        await createMatch(user._id, bestMatch._id);

        matchedUserIds.add(user._id.toString());
        matchedUserIds.add(bestMatch._id.toString());

        console.log(
          `Matched ${user.name} (${user._id}) with ${bestMatch.name} (${bestMatch._id})`
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
