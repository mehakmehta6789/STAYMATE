/**
 * Common helper utilities
 */

module.exports = {
  /**
   * Generate a unique conversation ID for chat
   * Ensures same ID for same two users
   */
  generateConversationId(userId1, userId2) {
    return [userId1.toString(), userId2.toString()]
      .sort()
      .join("_");
  },

  /**
   * Format rent with currency
   */
  formatCurrency(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  },

  /**
   * Check if PG rent fits student budget
   */
  isBudgetMatch(pgRent, budgetMin, budgetMax) {
    if (budgetMin == null || budgetMax == null) return true;
    return pgRent >= budgetMin && pgRent <= budgetMax;
  },

  /**
   * Convert compatibility score to label
   */
  compatibilityLabel(score) {
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  },
};