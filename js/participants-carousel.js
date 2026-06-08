(function () {
  const DESKTOP_MQ = window.matchMedia("(min-width: 1024px)");
  const INTERVAL_MS = 4000;

  const viewport = document.querySelector("[data-participants-viewport]");
  const track = document.querySelector("[data-participants-track]");
  const counterEl = document.querySelector("[data-participants-counter]");
  const prevBtn = document.querySelector("[data-participants-prev]");
  const nextBtn = document.querySelector("[data-participants-next]");

  if (!viewport || !track || !counterEl) return;

  const originals = Array.from(track.querySelectorAll("[data-participant]"));
  const total = originals.length;
  let visibleCount = 1;
  let index = 0;
  let autoplayId = null;
  let isAnimating = false;

  function getVisibleCount() {
    return DESKTOP_MQ.matches ? 3 : 1;
  }

  function buildClones() {
    track.querySelectorAll("[data-clone]").forEach((el) => el.remove());

    const head = originals.slice(-visibleCount).map((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-clone", "head");
      clone.removeAttribute("data-participant");
      return clone;
    });

    const tail = originals.slice(0, visibleCount).map((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-clone", "tail");
      clone.removeAttribute("data-participant");
      return clone;
    });

    head.forEach((c) => track.insertBefore(c, track.firstChild));
    tail.forEach((c) => track.appendChild(c));
  }

  function getCardGap() {
    return parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
  }

  function slideWidth() {
    const gap = getCardGap();
    return (viewport.clientWidth - gap * (visibleCount - 1)) / visibleCount;
  }

  function slideStep() {
    return slideWidth() + getCardGap();
  }

  function applyCardWidths() {
    const width = slideWidth();
    Array.from(track.children).forEach((card) => {
      card.style.flexBasis = `${width}px`;
      card.style.width = `${width}px`;
      card.style.maxWidth = `${width}px`;
    });
  }

  function setTransform(position, animate) {
    track.classList.toggle("no-transition", !animate);
    track.style.transform = `translateX(-${position * slideStep()}px)`;
    if (!animate) {
      track.offsetHeight;
      track.classList.remove("no-transition");
    }
  }

  function logicalIndex() {
    const normalized = ((index - visibleCount) % total) + total;
    return normalized % total;
  }

  function updateCounter() {
    counterEl.textContent = `${logicalIndex() + 1} / ${total}`;
  }

  function goTo(newIndex, animate) {
    if (isAnimating && animate) return;
    index = newIndex;
    setTransform(index, animate);
    updateCounter();

    if (!animate) return;

    isAnimating = true;
    const onEnd = (event) => {
      if (event.target !== track || event.propertyName !== "transform") return;
      track.removeEventListener("transitionend", onEnd);
      isAnimating = false;

      if (index >= visibleCount + total) {
        index = visibleCount;
        setTransform(index, false);
      } else if (index < visibleCount) {
        index = visibleCount + total - 1;
        setTransform(index, false);
      }
      updateCounter();
    };

    track.addEventListener("transitionend", onEnd);
  }

  function next() {
    goTo(index + 1, true);
  }

  function prev() {
    goTo(index - 1, true);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = window.setInterval(next, INTERVAL_MS);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function initLayout() {
    visibleCount = getVisibleCount();
    buildClones();
    applyCardWidths();
    index = visibleCount;
    setTransform(index, false);
    updateCounter();
  }

  window.addEventListener("resize", () => {
    applyCardWidths();
    setTransform(index, false);
  });

  prevBtn?.addEventListener("click", () => {
    prev();
    resetAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    next();
    resetAutoplay();
  });

  viewport.addEventListener("mouseenter", stopAutoplay);
  viewport.addEventListener("mouseleave", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  DESKTOP_MQ.addEventListener("change", () => {
    initLayout();
    resetAutoplay();
  });

  initLayout();
  startAutoplay();
})();
