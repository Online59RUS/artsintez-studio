// js/pricing-render.js
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}


const SPECIAL_IDS = new Set(["extended-day", "birthday"]);

function pickItems(mode, rootId) {
  const all = (window.PRICING || []);

  // Главная: показываем только showOnHome
  if (mode === "home") return all.filter((x) => x.showOnHome);

  // Полный прайс: делим на 2 блока (обычные карточки + большие программы)
  if (mode === "all" && rootId === "pricingAllGrid") {
    return all.filter((x) => !SPECIAL_IDS.has(x.id));
  }
  if (mode === "all" && rootId === "pricingSpecialGrid") {
    return all.filter((x) => SPECIAL_IDS.has(x.id));
  }

  // Фолбек: всё
  return all;
}

function renderPricing(containerId, mode = "home") {
  const root = document.getElementById(containerId);
  if (!root) return;

    const items = pickItems(mode, containerId);


  const cardHtml = (x) => {
    const classes = [
      "price-card",
      x.featured ? "price-card--accent" : "",
      x.wide ? "price-card--wide" : ""
    ].filter(Boolean).join(" ");

    const badge = x.badge
      ? `<div class="sale-badge ${x.badge === "Бесплатно" ? "sale-badge--free" : ""}">${escapeHtml(x.badge)}</div>`
      : "";

    const oldPrice = x.priceOld ? `<span class="price__old">${escapeHtml(x.priceOld)}</span>` : "";
    const nowPrice = x.priceNow ? `<span class="price__now">${escapeHtml(x.priceNow)}</span>` : "";

    const bullets = (x.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");

    const detailsBody = x.detailsHtml
      ? x.detailsHtml
      : `<div class="details__content">${escapeHtml(x.detailsText || "")}</div>`;

    return `
      <article class="${classes}">
        <div class="price-card__top">
          <h3 class="price-card__title">${escapeHtml(x.title)}</h3>
          <div class="price">
            ${oldPrice}
            ${badge}
            ${nowPrice}
          </div>
        </div>

        ${x.tag ? `<div class="tag">${escapeHtml(x.tag)}</div>` : ""}

        <ul class="mini">${bullets}</ul>

        <details class="details">
          <summary>${escapeHtml(x.detailsTitle || "Подробнее")}</summary>
          ${detailsBody}
        </details>

        <div class="price-actions">
          <a class="btn ${x.featured ? "btn--primary" : "btn--ghost"} btn--full" href="${escapeHtml(x.ctaHref || "index.html#lead")}">
            ${escapeHtml(x.ctaText || "Записаться")}
          </a>

          ${x.link ? `
            <a class="btn btn--ghost btn--full" href="${escapeHtml(x.link)}">
              ${escapeHtml(x.linkText || "Подробнее")}
            </a>
          ` : ""}
        </div>

      </article>
    `;
  };

  root.innerHTML = items.map(cardHtml).join("");
}

// Автозапуск для страниц
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("pricingHomeGrid")) renderPricing("pricingHomeGrid", "home");
  if (document.getElementById("pricingAllGrid")) renderPricing("pricingAllGrid", "all");
  if (document.getElementById("pricingSpecialGrid")) renderPricing("pricingSpecialGrid", "all");
});
