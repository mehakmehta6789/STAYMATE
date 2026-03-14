/**
 * Calculate compatibility score between two profiles (student/roommate)
 * @param {Object} userA - StudentProfile of current user
 * @param {Object} userB - StudentProfile or RoommatePost
 * @returns {Number} percentage compatibility (0–100)
 */

module.exports = function compatibilityScore(userA, userB) {
  let score = 0;
  let total = 0;

  // Food preference
  if (userA.foodPreference && userB.foodPreference) {
    total += 10;
    if (userA.foodPreference === userB.foodPreference) score += 10;
  }

  // Lifestyle
  if (userA.lifestyle && userB.lifestyle) {
    total += 10;
    if (userA.lifestyle === userB.lifestyle) score += 10;
  }

  // Smoking habit
  if (
    userA.habits?.smoking !== undefined &&
    userB.habits?.smoking !== undefined
  ) {
    total += 10;
    if (userA.habits.smoking === userB.habits.smoking) score += 10;
  }

  // Drinking habit
  if (
    userA.habits?.drinking !== undefined &&
    userB.habits?.drinking !== undefined
  ) {
    total += 5;
    if (userA.habits.drinking === userB.habits.drinking) score += 5;
  }

  // Cleanliness
  if (
    userA.habits?.cleanliness &&
    userB.habits?.cleanliness
  ) {
    total += 10;
    if (userA.habits.cleanliness === userB.habits.cleanliness) score += 10;
  }

  // Sleep time
  if (
    userA.habits?.sleepTime &&
    userB.habits?.sleepTime
  ) {
    total += 5;
    if (userA.habits.sleepTime === userB.habits.sleepTime) score += 5;
  }

  // Study hours
  if (userA.studyHours && userB.studyHours) {
    total += 5;
    if (userA.studyHours === userB.studyHours) score += 5;
  }

  // Social scale
  if (userA.socialScale && userB.socialScale) {
    total += 5;
    if (userA.socialScale === userB.socialScale) score += 5;
  }

  // Budget compatibility
  if (
    userA.budgetMin !== undefined && userA.budgetMax !== undefined &&
    userB.rentShare !== undefined
  ) {
    total += 10;
    if (userB.rentShare >= userA.budgetMin && userB.rentShare <= userA.budgetMax) score += 10;
  }

  // Tags
  if (userA.tags && userB.tags) {
    total += 10;
    const commonTags = userA.tags.filter(tag => userB.tags.includes(tag));
    score += Math.min(commonTags.length * 2, 10);
  }

  // Return percentage
  return total ? Math.round((score / total) * 100) : 0;
}