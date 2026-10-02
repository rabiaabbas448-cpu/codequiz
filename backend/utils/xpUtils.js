// Calculates level from total XP
const getLevelFromXP = (xp) => {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
};

// Returns { current, next, progressPercent } for the XP bar
const getXPProgress = (xp) => {
  const thresholds = [0, 100, 250, 500, 1000];
  const level = getLevelFromXP(xp);

  if (level === 5) {
    return { current: xp, next: null, progressPercent: 100 };
  }

  const lower = thresholds[level - 1];
  const upper = thresholds[level];
  const progressPercent = Math.round(((xp - lower) / (upper - lower)) * 100);

  return { current: xp, next: upper, progressPercent };
};

module.exports = { getLevelFromXP, getXPProgress };
