(function () {
  const MARQUEE_SELECTOR = "[data-marquee]";

  function buildContent(phrases) {
    const block = document.createElement("div");
    block.className = "marquee__content";
    block.setAttribute("aria-hidden", "false");

    phrases.forEach((phrase, index) => {
      const span = document.createElement("span");
      span.textContent = phrase;
      block.appendChild(span);
    });

    return block;
  }

  function initMarquee(element) {
    let phrases = [];

    if (element.dataset.cloneFrom !== undefined) {
      const source = document.querySelectorAll(MARQUEE_SELECTOR)[0];
      if (!source || source === element) return;
      const track = source.querySelector(".marquee__track");
      if (!track) return;
      element.innerHTML = "";
      const clone = track.cloneNode(true);
      element.appendChild(clone);
      return;
    }

    const raw = element.dataset.text || "";
    phrases = raw.split("|").map((s) => s.trim()).filter(Boolean);
    if (!phrases.length) return;

    const track = document.createElement("div");
    track.className = "marquee__track";

    const first = buildContent(phrases);
    const second = buildContent(phrases);
    second.setAttribute("aria-hidden", "true");

    track.append(first, second);
    element.innerHTML = "";
    element.appendChild(track);
  }

  function initAll() {
    document.querySelectorAll(MARQUEE_SELECTOR).forEach(initMarquee);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
