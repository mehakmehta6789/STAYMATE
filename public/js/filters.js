/**
 * filters.js
 * Generic filter logic for PG listings and roommate finder
 */

document.addEventListener("DOMContentLoaded", () => {
  const filterForm = document.querySelector("#filterForm");
  if (!filterForm) return;

  filterForm.addEventListener("change", () => {
    applyFilters();
  });

  function applyFilters() {
    const cards = document.querySelectorAll(".filter-card");

    const minRent = Number(
      document.querySelector("#minRent")?.value || 0
    );
    const maxRent = Number(
      document.querySelector("#maxRent")?.value || Infinity
    );

    const gender = document.querySelector("#gender")?.value;

    cards.forEach((card) => {
      const rent = Number(card.dataset.rent);
      const cardGender = card.dataset.gender;

      let visible = true;

      if (rent < minRent || rent > maxRent) visible = false;
      if (gender && gender !== "any" && cardGender !== gender)
        visible = false;

      card.style.display = visible ? "block" : "none";
    });
  }
});