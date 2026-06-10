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
          entry.target.classList.add("is-animated");
          animateObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: [0, 0.12, 0.25, 0.5, 0.75, 1],
      rootMargin: "0px",
    }
  );

  animatedSections.forEach((el) => animateObserver.observe(el));
})();
