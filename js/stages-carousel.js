(function () {
  const DESKTOP_MQ = window.matchMedia("(min-width: 1024px)");

  const track = document.querySelector("[data-stages-track]");
  const prevBtn = document.querySelector("[data-stages-prev]");
  const nextBtn = document.querySelector("[data-stages-next]");
  const dotsContainer = document.querySelector("[data-stages-dots]");

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = Array.from(track.children);
  const total = slides.length;
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Этап ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function isCarouselMode() {
    return !DESKTOP_MQ.matches;
  }

  function update() {
    if (!isCarouselMode()) {
      track.style.transform = "";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    track.style.transform = `translateX(-${index * 100}%)`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function goTo(i) {
    if (!isCarouselMode()) return;
    index = Math.max(0, Math.min(total - 1, i));
    update();
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  DESKTOP_MQ.addEventListener("change", () => {
    if (!isCarouselMode()) {
      index = 0;
    }
    update();
  });

  update();
})();
