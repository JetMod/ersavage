(() => {
  const root = document.querySelector("[data-hero]");
  if (!root) return;

  const slides = [...root.querySelectorAll(".hero-slide")];
  const viewport = root.querySelector("[data-hero-viewport]");
  const prevBtn = root.querySelector("[data-hero-prev]");
  const nextBtn = root.querySelector("[data-hero-next]");
  const total = slides.length;
  if (!total) return;

  const AUTOPLAY_MS = 7000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let autoplayId = null;
  let isPaused = false;

  const apply = () => {
    slides.forEach((slide, j) => {
      const active = j === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      slide.querySelectorAll("a").forEach((link) => {
        link.tabIndex = active ? 0 : -1;
      });
    });
  };

  const clearAutoplay = () => {
    window.clearInterval(autoplayId);
    autoplayId = null;
  };

  const scheduleAutoplay = () => {
    if (reducedMotion || total <= 1) return;
    clearAutoplay();
    autoplayId = window.setInterval(() => {
      if (!isPaused) go(1);
    }, AUTOPLAY_MS);
  };

  const pauseAutoplay = () => {
    isPaused = true;
  };

  const resumeAutoplay = () => {
    isPaused = false;
  };

  const go = (delta) => {
    index = (index + delta + total) % total;
    apply();
    scheduleAutoplay();
  };

  prevBtn?.addEventListener("click", () => go(-1));
  nextBtn?.addEventListener("click", () => go(1));

  viewport?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  });

  let swipeStartX = null;
  viewport?.addEventListener(
    "touchstart",
    (event) => {
      swipeStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  viewport?.addEventListener(
    "touchend",
    (event) => {
      if (swipeStartX === null) return;
      const delta = event.changedTouches[0].clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
    },
    { passive: true }
  );

  root.addEventListener("mouseenter", pauseAutoplay);
  root.addEventListener("mouseleave", resumeAutoplay);
  root.addEventListener("focusin", pauseAutoplay);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) resumeAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAutoplay();
      clearAutoplay();
      return;
    }
    resumeAutoplay();
    scheduleAutoplay();
  });

  apply();
  scheduleAutoplay();
})();

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(() => {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const threshold = 8;
  let ticking = false;

  const updateScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > threshold);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScroll();
})();

(() => {
  const menuBtns = [...document.querySelectorAll("[data-header-menu]")];
  const drawer = document.getElementById("headerMobileDrawer");
  if (!menuBtns.length || !drawer) return;

  const panel = drawer.querySelector(".header-mobile-drawer-panel");
  const closeTriggers = drawer.querySelectorAll("[data-header-menu-close]");
  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let lastFocus = null;

  const getFocusable = () =>
    [...panel.querySelectorAll(focusableSelector)].filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );

  const setOpen = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    menuBtns.forEach((btn) => btn.setAttribute("aria-expanded", open ? "true" : "false"));
    document.body.classList.toggle("header-drawer-open", open);

    if (open) {
      lastFocus = document.activeElement;
      getFocusable()[0]?.focus();
      return;
    }

    lastFocus?.focus?.();
    lastFocus = null;
  };

  menuBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setOpen(!drawer.classList.contains("is-open"));
    });
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => setOpen(false));
  });

  drawer.querySelectorAll(".header-mobile-nav a, .header-mobile-catalog-link").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  drawer.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
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

// ——— Новые поступления — слайдер ———
(() => {
  const slider = document.querySelector("[data-na-slider]");
  if (!slider) return;

  const track = document.getElementById("naTrack");
  const allCards = [...slider.querySelectorAll(".na-card")];
  const prevBtn = document.getElementById("naPrev");
  const nextBtn = document.getElementById("naNext");
  const overlayPrevBtn = document.getElementById("naOverlayPrev");
  const overlayNextBtn = document.getElementById("naOverlayNext");
  const dotsContainer = document.getElementById("naDots");
  const tabs = [...document.querySelectorAll(".na-tab")];

  if (!track || !allCards.length) return;

  let currentIndex = 0;
  let visibleCards = [...allCards];

  const getPerPage = () => {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const resizeCards = () => {
    const perPage = getPerPage();
    const sliderWidth = slider.offsetWidth;
    const gap = 18;
    const cardWidth = (sliderWidth - gap * (perPage - 1)) / perPage;
    allCards.forEach((card) => {
      card.style.width = `${cardWidth}px`;
      card.style.flexBasis = `${cardWidth}px`;
    });
  };

  const buildDots = () => {
    dotsContainer.innerHTML = "";
    const perPage = getPerPage();
    const total = visibleCards.length;
    const maxIndex = Math.max(0, total - perPage);
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "na-dot" + (i === currentIndex ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Слайд ${i + 1}`);
      dot.setAttribute("aria-selected", String(i === currentIndex));
      dot.addEventListener("click", () => {
        currentIndex = i;
        update();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const update = () => {
    const perPage = getPerPage();
    const total = visibleCards.length;
    const maxIndex = Math.max(0, total - perPage);
    currentIndex = Math.min(Math.max(0, currentIndex), maxIndex);

    const cardWidth = visibleCards[0] ? visibleCards[0].offsetWidth : 0;
    const gap = 18;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    if (overlayPrevBtn) overlayPrevBtn.disabled = currentIndex === 0;
    if (overlayNextBtn) overlayNextBtn.disabled = currentIndex >= maxIndex;

    [...dotsContainer.querySelectorAll(".na-dot")].forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
      dot.setAttribute("aria-selected", String(i === currentIndex));
    });
  };

  const filterCards = (category) => {
    currentIndex = 0;
    allCards.forEach((card) => {
      const match = category === "all" || card.dataset.naCategory === category;
      card.style.display = match ? "" : "none";
    });
    visibleCards = allCards.filter((c) => c.style.display !== "none");
    resizeCards();
    buildDots();
    update();
  };

  const goPrev = () => {
    currentIndex = Math.max(0, currentIndex - 1);
    update();
  };

  const goNext = () => {
    const perPage = getPerPage();
    const maxIndex = Math.max(0, visibleCards.length - perPage);
    currentIndex = Math.min(currentIndex + 1, maxIndex);
    update();
  };

  prevBtn?.addEventListener("click", goPrev);
  nextBtn?.addEventListener("click", goNext);
  overlayPrevBtn?.addEventListener("click", goPrev);
  overlayNextBtn?.addEventListener("click", goNext);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      filterCards(tab.dataset.naTab);
    });
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCards();
      buildDots();
      update();
    }, 120);
  });

  slider.querySelectorAll(".na-wish").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("is-active");
    });
  });

  resizeCards();
  buildDots();
  update();
})();

// ——— Магазины — переключение вкладок городов ———
(() => {
  const tabs = document.querySelectorAll("[data-stores-tab]");
  const panels = document.querySelectorAll("[data-stores-panel]");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.storesTab;

      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach((p) => p.classList.remove("is-active"));

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add("is-active");
    });
  });
})();

(() => {
  let toastEl = null;
  let toastTimer = null;

  const showToast = (message) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "siteToast";
      toastEl.className = "site-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 3200);
  };

  const subscribeForm = document.querySelector(".subscribe-form");
  if (!subscribeForm) return;

  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = subscribeForm.querySelector('input[type="email"]');
    if (emailInput && !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    showToast("Спасибо! Мы отправим письмо с подтверждением.");
    subscribeForm.reset();
  });
})();

// ——— Выбор города ———
(() => {
  const wrap = document.getElementById("cityPickerWrap");
  const btn = document.getElementById("cityPickerBtn");
  const dropdown = document.getElementById("cityPickerDropdown");
  const nameEl = document.getElementById("cityPickerName");
  if (!wrap || !btn || !dropdown || !nameEl) return;

  const STORAGE_KEY = "ersavage_city";
  const DEFAULT_CITY = "Симферополь";

  const setCity = (city) => {
    nameEl.textContent = city;
    localStorage.setItem(STORAGE_KEY, city);
    dropdown.querySelectorAll("li").forEach((li) => {
      const selected = li.dataset.city === city;
      li.setAttribute("aria-selected", selected ? "true" : "false");
    });
  };

  const close = () => {
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    wrap.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    wrap.classList.contains("is-open") ? close() : open();
  });

  dropdown.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      setCity(li.dataset.city);
      close();
    });
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  const saved = localStorage.getItem(STORAGE_KEY);
  setCity(saved || DEFAULT_CITY);
})();

// ——— Рекомендации — избранное ———
document.querySelectorAll(".recs-wish").forEach((btn) => {
  btn.addEventListener("click", () => btn.classList.toggle("is-active"));
});
