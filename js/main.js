(() => {
  const root = document.querySelector("[data-hero]");
  if (!root) return;

  const slides = [...root.querySelectorAll(".hero-slide")];
  const viewport = root.querySelector("[data-hero-viewport]");
  const prevBtn = root.querySelector("[data-hero-prev]");
  const nextBtn = root.querySelector("[data-hero-next]");
  const footPrimary = root.querySelector("[data-hero-foot-primary]");
  const footSecondary = root.querySelector("[data-hero-foot-secondary]");
  const counter = root.querySelector("[data-hero-counter]");
  const dots = [...root.querySelectorAll("[data-hero-dot]")];
  const total = slides.length;
  if (!total) return;

  let index = 0;

  const pad2 = (n) => String(n).padStart(2, "0");

  const apply = () => {
    slides.forEach((slide, j) => {
      const active = j === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    const activeSlide = slides[index];
    if (footPrimary) footPrimary.textContent = activeSlide.dataset.footPrimary || "";
    if (footSecondary) footSecondary.textContent = activeSlide.dataset.footSecondary || "";
    if (counter) counter.textContent = `${pad2(index + 1)} — ${pad2(total)}`;
    dots.forEach((dot, j) => {
      const on = j === index;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  const go = (delta) => {
    index = (index + delta + total) % total;
    apply();
  };

  prevBtn?.addEventListener("click", () => go(-1));
  nextBtn?.addEventListener("click", () => go(1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const j = Number(dot.dataset.heroDot);
      if (Number.isFinite(j) && j >= 0 && j < total) {
        index = j;
        apply();
      }
    });
  });

  viewport?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  });

  apply();
})();

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(() => {
  const promo = document.querySelector(".header-promo");
  const closeBtn = document.querySelector(".header-promo-close");
  if (!promo || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    if (promo.classList.contains("is-closing")) return;
    promo.classList.add("is-closing");

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      promo.removeEventListener("transitionend", onEnd);
      try {
        sessionStorage.setItem("ersavagePromoDismissed", "1");
      } catch (_) {
        /* private mode / quota */
      }
      document.documentElement.classList.add("header-promo-dismissed");
    };

    const onEnd = (event) => {
      if (event.target !== promo) return;
      finish();
    };

    promo.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 520);
  });
})();

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

const subscribeForm = document.querySelector(".subscribe-form");
if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitButton = subscribeForm.querySelector("button");
    submitButton.textContent = "Спасибо!";
    submitButton.disabled = true;
    setTimeout(() => {
      submitButton.textContent = "Подписаться";
      submitButton.disabled = false;
      subscribeForm.reset();
    }, 1800);
  });
}
