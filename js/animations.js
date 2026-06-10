(function () {
  const ONE_SHOT_SELECTOR = [
    ".hero__horse",
    ".hero__pawn",
    ".session .session__overlay .session__image--hand",
    ".session .session__core .session__image--boom-lg",
    ".session .session__overlay .session__image--boom-sm",
    ".session .session__overlay .session__image--horse",
    ".stages .stages__plane",
    ".stages .stages__plane-overlay",
  ].join(", ");

  const started = new WeakSet();
  const reducedMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finalize(el) {
    if (el.classList.contains("animation-done")) return;
    el.classList.add("animation-done");
  }

  function bindOneShot(el) {
    if (el.dataset.oneShotBound === "true") return;
    el.dataset.oneShotBound = "true";

    el.addEventListener("animationstart", () => {
      started.add(el);
    });

    el.addEventListener("animationend", () => {
      finalize(el);
    });

    el.addEventListener("animationcancel", () => {
      finalize(el);
    });
  }

  function bindAll(root) {
    (root || document).querySelectorAll(ONE_SHOT_SELECTOR).forEach(bindOneShot);
  }

  function finalizeStarted() {
    document.querySelectorAll(ONE_SHOT_SELECTOR).forEach((el) => {
      if (started.has(el)) finalize(el);
    });
  }

  function finalizeSection(section) {
    section.querySelectorAll(ONE_SHOT_SELECTOR).forEach(finalize);
  }

  function handleReducedMotion(section) {
    if (!reducedMotionMQ.matches) return;
    if (section) {
      finalizeSection(section);
      return;
    }
    document.querySelectorAll(ONE_SHOT_SELECTOR).forEach(finalize);
  }

  bindAll();
  handleReducedMotion();

  document.querySelectorAll(".session, .stages").forEach((section) => {
    const observer = new MutationObserver(() => {
      if (!section.classList.contains("is-animated")) return;
      bindAll(section);
      if (reducedMotionMQ.matches) finalizeSection(section);
    });

    observer.observe(section, { attributes: true, attributeFilter: ["class"] });

    if (section.classList.contains("is-animated")) {
      bindAll(section);
      handleReducedMotion(section);
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(finalizeStarted, 100);
  });
})();
