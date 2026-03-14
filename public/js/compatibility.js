/**
 * compatibility.js
 * Handles UI rendering for compatibility score
 * Works with utils/compatibilityScore.js output
 */

document.addEventListener("DOMContentLoaded", () => {
  const badges = document.querySelectorAll("[data-compatibility]");

  badges.forEach((badge) => {
    const score = Number(badge.dataset.compatibility);

    let label = "Low";
    let className = "match-low";

    if (score >= 80) {
      label = "High";
      className = "match-high";
    } else if (score >= 60) {
      label = "Medium";
      className = "match-medium";
    }

    badge.textContent = `${score}% • ${label}`;
    badge.classList.add("compatibility", className);
  });
});