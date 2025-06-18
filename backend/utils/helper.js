export const calculateNormalizedScore = (obj1, obj2, maxDiff = 10) => {
  const keys = Object.keys(obj1);
  let score = 0;
  let validKeys = 0;

  keys.forEach((key) => {
    const a = obj1[key];
    const b = obj2[key];
    if (a != null && b != null) {
      score += 1 - Math.abs(a - b) / maxDiff;
      validKeys++;
    }
  });

  return validKeys > 0 ? score / validKeys : 0;
};

export const calculateNonLinearScore = (obj1, obj2) => {
  const keys = Object.keys(obj1);
  let score = 0;
  let validKeys = 0;

  keys.forEach((key) => {
    const a = obj1[key];
    const b = obj2[key];
    if (a != null && b != null) {
      const diff = Math.abs(a - b);
      const nonLinearDiff = Math.pow(diff, 2) / 20;
      score += 1 - nonLinearDiff;
      validKeys++;
    }
  });

  return validKeys > 0 ? score / validKeys : 0;
};

export const calculateScoreWithThresholds = (obj1, obj2, threshold) => {
  const keys = Object.keys(obj1);
  let score = 0;
  let validKeys = 0;

  keys.forEach((key) => {
    const a = obj1[key];
    const b = obj2[key];
    if (a != null && b != null) {
      const diff = Math.abs(a - b);
      const thresholdedDiff = diff <= threshold ? diff : threshold;
      score += 1 - thresholdedDiff / 10;
      validKeys++;
    }
  });

  return validKeys > 0 ? score / validKeys : 0;
};
