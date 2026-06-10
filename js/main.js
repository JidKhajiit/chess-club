(function () {
  const revealElements = document.querySelectorAll(".reveal");
  const animatedSections = document.querySelectorAll(".session, .stages");
  const desktopMQ = window.matchMedia("(min-width: 1024px)");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
    animatedSections.forEach((el) => el.classList.add("is-animated"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  function getContentBottom(element, rect) {
    const paddingBottom = parseFloat(getComputedStyle(element).paddingBottom) || 0;
    return rect.bottom - paddingBottom;
  }

  function mergeBounds(bounds, rect) {
    if (rect.width === 0 && rect.height === 0) return bounds;

    if (!bounds) {
      return { top: rect.top, bottom: rect.bottom };
    }

    return {
      top: Math.min(bounds.top, rect.top),
      bottom: Math.max(bounds.bottom, rect.bottom),
    };
  }

  function getCollageBounds(session) {
    const collage = session.querySelector(".session__collage");
    if (!collage) return null;

    let bounds = mergeBounds(null, collage.getBoundingClientRect());
    collage.querySelectorAll(".session__image").forEach((image) => {
      bounds = mergeBounds(bounds, image.getBoundingClientRect());
    });

    return bounds;
  }

  function getStagesPlaneBounds(stages) {
    const plane = stages.querySelector(".stages__plane");
    if (!plane) return null;
    return mergeBounds(null, plane.getBoundingClientRect());
  }

  function isBottomEdgeVisible(bounds) {
    const viewportBottom = window.innerHeight;
    return bounds.bottom > 0 && bounds.bottom <= viewportBottom;
  }

  function markAnimated(section) {
    section.classList.add("is-animated");
  }

  const RESIZE_DEBOUNCE_MS = 100;

  function watchBottomTrigger(section, getBounds, observeTarget) {
    let done = false;
    let targetObserver = null;
    let resizeTimer = null;

    function tryAnimate() {
      if (done) return;
      const bounds = getBounds(section);
      if (!bounds || !isBottomEdgeVisible(bounds)) return;
      done = true;
      markAnimated(section);
      cleanup();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(tryAnimate, RESIZE_DEBOUNCE_MS);
    }

    function cleanup() {
      window.removeEventListener("scroll", tryAnimate, { passive: true });
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      targetObserver?.disconnect();
    }

    if (observeTarget) {
      targetObserver = new IntersectionObserver(
        () => tryAnimate(),
        { threshold: [0, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 1] }
      );
      targetObserver.observe(observeTarget);
    }

    window.addEventListener("scroll", tryAnimate, { passive: true });
    window.addEventListener("resize", onResize);
    tryAnimate();
  }

  function isReadyToAnimate(entry) {
    if (!entry.isIntersecting) return false;

    if (desktopMQ.matches) {
      const viewportBottom = entry.rootBounds?.bottom ?? window.innerHeight;
      const contentBottom = getContentBottom(entry.target, entry.boundingClientRect);
      return contentBottom <= viewportBottom;
    }

    return entry.intersectionRatio >= 0.12;
  }

  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (isReadyToAnimate(entry)) {
          markAnimated(entry.target);
          animateObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: [0, 0.12, 0.25, 0.5, 0.75, 1],
      rootMargin: "0px",
    }
  );

  animatedSections.forEach((section) => {
    if (desktopMQ.matches && section.classList.contains("session")) {
      watchBottomTrigger(
        section,
        getCollageBounds,
        section.querySelector(".session__collage")
      );
      return;
    }

    if (desktopMQ.matches && section.classList.contains("stages")) {
      watchBottomTrigger(
        section,
        getStagesPlaneBounds,
        section.querySelector(".stages__plane")
      );
      return;
    }

    animateObserver.observe(section);
  });
})();
