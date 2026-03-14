(function setupHomeHeroCarousel() {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  const nextButton = root.querySelector("[data-hero-next]");
  const prevButton = root.querySelector("[data-hero-prev]");

  if (!slides.length) return;

  let currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active"))
  );

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === currentIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === currentIndex);
      dot.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
    });
  };

  let timerId;

  const restartAutoPlay = () => {
    clearInterval(timerId);
    timerId = setInterval(() => showSlide(currentIndex + 1), 4500);
  };

  nextButton?.addEventListener("click", () => {
    showSlide(currentIndex + 1);
    restartAutoPlay();
  });

  prevButton?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    restartAutoPlay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      showSlide(idx);
      restartAutoPlay();
    });
  });

  root.addEventListener("mouseenter", () => clearInterval(timerId));
  root.addEventListener("mouseleave", restartAutoPlay);

  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      showSlide(currentIndex + 1);
      restartAutoPlay();
    }

    if (event.key === "ArrowLeft") {
      showSlide(currentIndex - 1);
      restartAutoPlay();
    }
  });

  showSlide(currentIndex);
  restartAutoPlay();
})();
