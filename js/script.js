// ================================
// script.js — FINAL, CLEAN, SAFE (FIXED)
// ================================

// ---------- Year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Mobile menu ----------
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

function openMenu() {
  if (!burger || !mobileMenu) return;
  mobileMenu.classList.add("is-open");
  burger.setAttribute("aria-expanded", "true");
  mobileMenu.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  if (!burger || !mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
}

if (burger) {
  burger.addEventListener("click", (e) => {
    e.preventDefault();
    if (!mobileMenu) return;
    mobileMenu.classList.contains("is-open") ? closeMenu() : openMenu();
  });
}

if (mobileMenu) {
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
}

document.addEventListener("click", (e) => {
  if (!mobileMenu || !burger) return;
  const clickInsideMenu = mobileMenu.contains(e.target);
  const clickOnBurger = burger.contains(e.target);
  if (!clickInsideMenu && !clickOnBurger) closeMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// ===== Lead form -> Yandex API Gateway -> Yandex Cloud Function -> Telegram =====
const leadForm = document.getElementById("leadForm");
const hint = document.getElementById("formHint");
const submitBtn = document.getElementById("leadSubmit");

// !!! ВАЖНО: твой рабочий endpoint (API Gateway) !!!
const FORM_ENDPOINT = "https://d5dunvkrpltoq7ostgp.apigw.yandexcloud.net/lead";

function setHint(text, ok = true) {
  if (!hint) return;
  hint.textContent = text;
  hint.style.color = ok ? "" : "#b91c1c";
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizePhonePlain(phone) {
  return String(phone || "").trim();
}

async function sendLead(payload) {
  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // читаем как текст, чтобы увидеть и JSON и текст ошибок
  const raw = await res.text();

  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    // если не JSON — оставим raw
  }

  if (!res.ok) {
    const msg = data?.error || raw || `HTTP ${res.status}`;
    throw new Error(`Server error (${res.status}): ${msg}`);
  }

  if (!data || data.ok !== true) {
    throw new Error(data?.error || "Ошибка отправки");
  }

  return data;
}

if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // важно: иначе форма может “прыгать”

    const fd = new FormData(leadForm);
    const name = String(fd.get("name") || "").trim();
    const phone = normalizePhonePlain(fd.get("phone"));
    const age = String(fd.get("age") || "").trim();

    if (!name || !phone) {
      setHint("Заполните имя и телефон.", false);
      return;
    }

    // Отправляем только нужное
    const payload = {
      name: escapeHtml(name),
      phone: escapeHtml(phone),
      age: escapeHtml(age || "не указан"),
    };

    try {
      if (submitBtn) submitBtn.disabled = true;
      setHint("Отправляем заявку...");

      await sendLead(payload);

      leadForm.reset();
      setHint("Спасибо! Заявка принята. Мы свяжемся с вами.");
    } catch (err) {
      console.error(err);
      setHint(`Не удалось отправить: ${err?.message || "ошибка сети"}`, false);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// ---------- Branches ----------
const BRANCHES = [
  {
    id: "landau",
    name: "Филиал - Академика Ландау",
    badge: "Основной",
    address: "ул. Академика Ландау, д.51, пом.183, Екатеринбург",
    phone: "+79221779204",
    hours: "Пн-Вс 10:00-20:00",
    mapYandex: "https://yandex.ru/maps/-/CLxARN9A",
    map2gis: "https://go.2gis.com/Z7mpl",
  },
  {
    id: "repina",
    name: "Филиал - Репина",
    badge: "Кировский",
    address: "ул. Репина, д.79а, Екатеринбург",
    phone: "+79221779204",
    hours: "Чт 14:00-20:00",
    mapYandex: "https://yandex.ru/maps/-/CLxAVMyN",
    map2gis: "https://go.2gis.com/kTeV5",
  },
  {
    id: "sovetskaya",
    name: "Филиал - Советская",
    badge: "Пионерский",
    address: "ул. Советская, д.60, Екатеринбург",
    phone: "+79221779204",
    hours: "Вт/Пт 14:00-20:00",
    mapYandex: "https://yandex.ru/maps/-/CLxAZI4b",
    map2gis: "https://go.2gis.com/ca0A4",
  },
  {
    id: "bisertskaya",
    name: "Филиал - Бисертская",
    badge: "Чкаловский",
    address: "ул. Бисертская, д.128, Екатеринбург",
    phone: "+79221779204",
    hours: "Сб 10:00-16:00",
    mapYandex: "https://yandex.ru/maps/-/CLxAZCiO",
    map2gis: "https://go.2gis.com/AD1Pn",
  },
];

function normalizePhoneForTel(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function renderBranches() {
  const tabs = document.getElementById("branchesTabs");
  const card = document.getElementById("branchCard");
  if (!tabs || !card) return;

  let activeId = BRANCHES[0]?.id || "";

  const render = () => {
    tabs.innerHTML = BRANCHES.map(
      (b) => `
      <button class="branch-tab ${b.id === activeId ? "is-active" : ""}" type="button" data-id="${b.id}">
        <div class="branch-tab__title">${b.name}</div>
        <div class="branch-tab__meta">${b.address}</div>
      </button>
    `
    ).join("");

    const b = BRANCHES.find((x) => x.id === activeId) || BRANCHES[0];
    const tel = normalizePhoneForTel(b.phone);

    card.innerHTML = `
      <div class="branch-card__top">
        <h3 class="branch-card__name">${b.name}</h3>
        <div class="branch-badge">${b.badge}</div>
      </div>
      <p class="branch-card__addr">${b.address}</p>
      <div class="branch-row">
        <div class="branch-info">
          <div class="branch-info__label">График</div>
          <div class="branch-info__value">${b.hours}</div>
        </div>
        <div class="branch-info">
          <div class="branch-info__label">Телефон</div>
          <div class="branch-info__value"><a href="tel:${tel}">${b.phone}</a></div>
        </div>
      </div>
      <div class="branch-row" style="margin-top:12px; gap:12px;">
        <a class="btn btn--ghost btn--full" href="${b.mapYandex}" target="_blank" rel="noopener">Яндекс Карты</a>
        <a class="btn btn--ghost btn--full" href="${b.map2gis}" target="_blank" rel="noopener">2ГИС</a>
      </div>
    `;
  };

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    activeId = btn.dataset.id || activeId;
    render();
  });

  render();
}

renderBranches();

// ================================
// LIGHTBOX — NO SCROLL JUMP (FIXED NAV)
// ================================
(() => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const imgEl = lightbox.querySelector(".lightbox__img");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".lightbox__nav--next");
  const backdrop = lightbox.querySelector(".lightbox__backdrop");

  if (!imgEl || !closeBtn || !prevBtn || !nextBtn || !backdrop) return;

  let gallery = [];
  let index = 0;

  let savedScrollY = 0;
  let isLocked = false;
  let savedScrollBehavior = "";

  const collect = () => {
    gallery = Array.from(document.querySelectorAll(".work-card__img"));
  };

  const lockScroll = () => {
    if (isLocked) return;

    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;

    savedScrollBehavior = document.documentElement.style.scrollBehavior || "";
    document.documentElement.style.scrollBehavior = "auto";

    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    isLocked = true;
  };

  const unlockScroll = () => {
    if (!isLocked) return;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, savedScrollY);
    document.documentElement.style.scrollBehavior = savedScrollBehavior;

    isLocked = false;
  };

  const showByIndex = (i) => {
    if (!gallery.length) collect();
    if (!gallery.length) return;

    index = (i + gallery.length) % gallery.length;

    const src = gallery[index].getAttribute("data-full") || gallery[index].src;
    imgEl.src = src;
    imgEl.alt = gallery[index].alt || "";
  };

  const open = (i) => {
    if (!lightbox.classList.contains("is-open")) {
      lockScroll();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }
    showByIndex(i);
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    unlockScroll();
  };

  const next = () => showByIndex(index + 1);
  const prev = () => showByIndex(index - 1);

  document.addEventListener("click", (e) => {
    if (lightbox.classList.contains("is-open")) return;

    const img = e.target.closest(".work-card__img");
    if (!img) return;

    e.preventDefault();

    collect();
    const i = gallery.indexOf(img);
    open(i >= 0 ? i : 0);
  });

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onClose = (e) => { stop(e); close(); };
  const onNext = (e) => { stop(e); next(); };
  const onPrev = (e) => { stop(e); prev(); };

  closeBtn.addEventListener("click", onClose);
  backdrop.addEventListener("click", onClose);
  nextBtn.addEventListener("click", onNext);
  prevBtn.addEventListener("click", onPrev);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  let sx = 0, sy = 0;

  imgEl.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0];
    sx = t.clientX;
    sy = t.clientY;
  }, { passive: true });

  imgEl.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;

    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx < -40) next();
    if (dx > 40) prev();
  }, { passive: true });

  window.addEventListener("load", collect);
})();
