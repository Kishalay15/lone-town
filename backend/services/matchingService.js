import User from "../models/User.js";
import Match from "../models/Match.js";
import {
  calculateScoreWithThresholds,
  calculateNonLinearScore,
} from "../utils/helper.js";

const calculateCompatibilityScore = (user1, user2) => {
  const weights = {
    emotionalIntelligence: 0.3,
    psychologicalTraits: 0.25,
    behavioralPatterns: 0.2,
    relationshipValues: 0.25,
  };

  const emotionalIntelligenceDiff = Math.abs(
    user1.emotionalIntelligence - user2.emotionalIntelligence
  );

  const emotionalIntelligenceScore =
    emotionalIntelligenceDiff <= 2 ? 1 - emotionalIntelligenceDiff / 10 : 0;

  const psychologicalTraitsScore = calculateNonLinearScore(
    user1.psychologicalTraits,
    user2.psychologicalTraits
  );

  const behavioralPatternsScore = calculateScoreWithThresholds(
    user1.behavioralPatterns,
    user2.behavioralPatterns,
    0.5
  );

  const relationshipValuesScore = calculateNonLinearScore(
    user1.relationshipValues,
    user2.relationshipValues
  );

  const compatibilityScore =
    emotionalIntelligenceScore * weights.emotionalIntelligence +
    psychologicalTraitsScore * weights.psychologicalTraits +
    behavioralPatternsScore * weights.behavioralPatterns +
    relationshipValuesScore * weights.relationshipValues;

  return compatibilityScore;
};

const findBestMatch = async (user) => {
  const potentialMatches = await User.find({
    _id: { $ne: user._id },
    state: "available",
  });

  let bestMatch = null;
  let bestScore = -1;
  const minCompatibilityThreshold = 0.7;

  for (const potentialMatch of potentialMatches) {
    const score = calculateCompatibilityScore(user, potentialMatch);
    if (score > bestScore && score >= minCompatibilityThreshold) {
      bestScore = score;
      bestMatch = potentialMatch;
    }
  }

  return bestMatch;

  //   const users = await User.find({
  //     _id: { $ne: user._id },
  //     state: "available",
  //   });

  //   let bestMatch = null;
  //   let bestScore = -1;

  //   for (const potentialMatch of users) {
  //     const score = calculateCompatibilityScore(user, potentialMatch);
  //     if (score > bestScore) {
  //       bestScore = score;
  //       bestMatch = potentialMatch;
  //     }
  //   }

  //   return bestMatch;
};

const createMatch = async (user1Id, user2Id) => {
  const user1 = await User.findById(user1Id);
  const user2 = await User.findById(user2Id);

  const now = new Date();

  const match = new Match({
    users: [user1Id, user2Id],
    pinned: true,
    createdAt: now,
    firstMessageTimestamp: now,
  });

  await match.save();

  user1.currentMatch = match._id;
  user2.currentMatch = match._id;

  user1.state = "matched";
  user2.state = "matched";

  user1.matchStartTime = now;
  user2.matchStartTime = now;

  user1.messageCount = 0;
  user2.messageCount = 0;

  user1.messageMilestoneReached = false;
  user2.messageMilestoneReached = false;

  await user1.save();
  await user2.save();

  return match;
};

export { calculateCompatibilityScore, findBestMatch, createMatch };
