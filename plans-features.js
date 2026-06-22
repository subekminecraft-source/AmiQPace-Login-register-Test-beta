(function () {
  "use strict";

  var PLAN_DETAILS = {
    trial: {
      id: "trial",
      label: "Trial",
      price: "0 zł",
      period: "14 dni",
      tagline: "Pełny panel bez karty — idealny start",
      cta: { label: "Rozpocznij Trial", href: "Register.html" },
      features: [
        { ok: true, group: "Sklep i katalog", text: "Do 5 projektów sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Do 15 produktów w katalogu" },
        { ok: true, group: "Sklep i katalog", text: "Szablony Moda & Lookbook + Tech Store Pro" },
        { ok: true, group: "Sklep i katalog", text: "Edytor sklepu z podglądem live" },
        { ok: true, group: "Hosting", text: "Hosting i certyfikat SSL" },
        { ok: true, group: "Płatności", text: "Płatności demo: przelew + BLIK" },
        { ok: true, group: "Płatności", text: "Kreator płatności i dostaw" },
        { ok: true, group: "Płatności", text: "Portfel i wypłaty (tryb demo)" },
        { ok: true, group: "Płatności", text: "Prowizja platformy: 2,9% + 1 zł" },
        { ok: false, group: "Domena", text: "Własna domena" },
        { ok: false, group: "Płatności", text: "PayU / Przelewy24 / Stripe" },
        { ok: false, group: "Marketing", text: "Automatyzacje marketingowe" },
        { ok: false, group: "Wsparcie", text: "Priorytetowe wsparcie" }
      ]
    },
    starter: {
      id: "starter",
      label: "Starter",
      price: "19,99 zł",
      period: "/ mies.",
      tagline: "Pierwsze kroki w e-commerce",
      cta: { label: "Wybierz Starter", href: "Register.html" },
      features: [
        { ok: true, group: "Sklep i katalog", text: "Do 3 projektów sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Do 15 produktów (aktywny sklep)" },
        { ok: true, group: "Sklep i katalog", text: "Gotowe szablony sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Edytor, motyw i branża sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Zamówienia, klienci, analityka" },
        { ok: true, group: "Hosting", text: "Hosting i SSL w cenie" },
        { ok: true, group: "Płatności", text: "PayU i Przelewy24 w kreatorze" },
        { ok: true, group: "Płatności", text: "Eksport zamówień CSV" },
        { ok: true, group: "Płatności", text: "Prowizja platformy: 2,5% + 0,80 zł" },
        { ok: false, group: "Domena", text: "Własna domena + SSL" },
        { ok: false, group: "Płatności", text: "Stripe Connect" },
        { ok: false, group: "Marketing", text: "Automatyzacje sprzedaży" },
        { ok: false, group: "Enterprise", text: "API i raporty enterprise" }
      ]
    },
    "pro-seller": {
      id: "pro-seller",
      label: "Pro Seller",
      price: "39,99 zł",
      period: "/ mies.",
      tagline: "Skalowanie bez komplikacji",
      cta: { label: "Wybierz Pro Seller", href: "Register.html" },
      features: [
        { ok: true, group: "Sklep i katalog", text: "Do 5 projektów sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Do 50 produktów (aktywny sklep)" },
        { ok: true, group: "Sklep i katalog", text: "Warianty produktów i kategorie branżowe" },
        { ok: true, group: "Domena", text: "Własna domena + automatyczny SSL" },
        { ok: true, group: "Domena", text: "Konfigurator DNS w panelu" },
        { ok: true, group: "Hosting", text: "Kopie zapasowe i statystyki" },
        { ok: true, group: "Płatności", text: "Integracje: PayU, P24, Stripe" },
        { ok: true, group: "Płatności", text: "Portfel, Stripe Connect, wypłaty" },
        { ok: true, group: "Płatności", text: "Prowizja platformy: 2,2% + 0,60 zł" },
        { ok: true, group: "Płatności", text: "Niższa rezerwa rolling w portfelu" },
        { ok: false, group: "Marketing", text: "Automatyzacje kampanii e-mail" },
        { ok: false, group: "Wsparcie", text: "Dedykowany opiekun konta" }
      ]
    },
    biznes: {
      id: "biznes",
      label: "Biznes",
      price: "59,99 zł",
      period: "/ mies.",
      tagline: "Dla rosnących sklepów",
      cta: { label: "Rozpocznij z Biznes", href: "Register.html" },
      features: [
        { ok: true, group: "Sklep i katalog", text: "Do 10 projektów sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Do 200 produktów (aktywny sklep)" },
        { ok: true, group: "Sklep i katalog", text: "Wszystko z planu Pro Seller" },
        { ok: true, group: "Marketing", text: "Automatyzacje i kampanie sprzedażowe" },
        { ok: true, group: "Hosting", text: "Wyższa wydajność i częstsze kopie" },
        { ok: true, group: "Wsparcie", text: "Priorytetowe wsparcie po polsku" },
        { ok: true, group: "Sklep i katalog", text: "Szablony premium (Luxury, Enterprise — wkrótce)" },
        { ok: true, group: "Płatności", text: "Prowizja platformy: 1,9% + 0,50 zł" },
        { ok: true, group: "Marketing", text: "Marketplace partnerów (wkrótce)" },
        { ok: false, group: "Wsparcie", text: "Dedykowany menedżer konta" },
        { ok: false, group: "Enterprise", text: "Konsultacje wdrożeniowe 1:1" }
      ]
    },
    professional: {
      id: "professional",
      label: "Professional",
      price: "89,99 zł",
      period: "/ mies.",
      tagline: "Maksymalna kontrola i skala",
      cta: { label: "Wybierz Professional", href: "Register.html" },
      features: [
        { ok: true, group: "Sklep i katalog", text: "Nielimitowane projekty sklepu" },
        { ok: true, group: "Sklep i katalog", text: "Nielimitowane produkty" },
        { ok: true, group: "Sklep i katalog", text: "Wszystko z planu Biznes" },
        { ok: true, group: "Enterprise", text: "API i zaawansowane raporty" },
        { ok: true, group: "Enterprise", text: "Konsultacje wdrożeniowe" },
        { ok: true, group: "Wsparcie", text: "Dedykowany menedżer konta" },
        { ok: true, group: "Płatności", text: "Najniższa prowizja: 1,5% + 0,35 zł" },
        { ok: true, group: "Płatności", text: "Brak rezerwy rolling w portfelu" },
        { ok: true, group: "Enterprise", text: "Multi-brand Hub — portfolio marek i B2B" },
        { ok: true, group: "Wsparcie", text: "SLA i wsparcie enterprise" }
      ]
    }
  };

  var PLAN_ORDER = ["trial", "starter", "pro-seller", "biznes", "professional"];
  var PAID_PLAN_ORDER = ["starter", "pro-seller", "biznes", "professional"];

  var COMPARE_ROWS = [
    { label: "Projekty sklepu", trial: "5", starter: "3", "pro-seller": "5", biznes: "10", professional: "∞" },
    { label: "Produkty (aktywny sklep)", trial: "15", starter: "15", "pro-seller": "50", biznes: "200", professional: "∞" },
    { label: "Hosting + SSL", trial: true, starter: true, "pro-seller": true, biznes: true, professional: true },
    { label: "Własna domena", trial: false, starter: false, "pro-seller": true, biznes: true, professional: true },
    { label: "PayU / Przelewy24", trial: false, starter: true, "pro-seller": true, biznes: true, professional: true },
    { label: "Stripe Connect", trial: false, starter: false, "pro-seller": true, biznes: true, professional: true },
    { label: "Portfel i wypłaty", trial: "demo", starter: true, "pro-seller": true, biznes: true, professional: true },
    { label: "Prowizja platformy", trial: "2,9% + 1 zł", starter: "2,5% + 0,80 zł", "pro-seller": "2,2% + 0,60 zł", biznes: "1,9% + 0,50 zł", professional: "1,5% + 0,35 zł" },
    { label: "Automatyzacje marketingowe", trial: false, starter: false, "pro-seller": false, biznes: true, professional: true },
    { label: "API i raporty enterprise", trial: false, starter: false, "pro-seller": false, biznes: false, professional: true },
    { label: "Priorytetowe wsparcie", trial: false, starter: false, "pro-seller": false, biznes: true, professional: true },
    { label: "Dedykowany menedżer konta", trial: false, starter: false, "pro-seller": false, biznes: false, professional: true }
  ];

  var modal;
  var lastFocus;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderFeatureList(features) {
    var groups = [];
    var groupMap = {};
    features.forEach(function (item) {
      var g = item.group || "Inne";
      if (!groupMap[g]) {
        groupMap[g] = [];
        groups.push(g);
      }
      groupMap[g].push(item);
    });

    return groups
      .map(function (groupName) {
        return (
          '<section class="plan-details-modal__group">' +
          '<h3 class="plan-details-modal__group-title">' +
          escapeHtml(groupName) +
          "</h3>" +
          '<ul class="plan-details-modal__features">' +
          groupMap[groupName]
            .map(function (item) {
              return (
                '<li class="' +
                (item.ok ? "is-included" : "is-excluded") +
                '"><i class="fas ' +
                (item.ok ? "fa-check" : "fa-minus") +
                '" aria-hidden="true"></i><span>' +
                escapeHtml(item.text) +
                "</span></li>"
              );
            })
            .join("") +
          "</ul></section>"
        );
      })
      .join("");
  }

  function renderCompareCell(value) {
    if (value === true) {
      return '<span class="plan-compare__yes" aria-label="Tak"><i class="fas fa-check" aria-hidden="true"></i></span>';
    }
    if (value === false) {
      return '<span class="plan-compare__no" aria-label="Nie"><i class="fas fa-minus" aria-hidden="true"></i></span>';
    }
    return '<span class="plan-compare__text">' + escapeHtml(String(value)) + "</span>";
  }

  function renderComparisonTable() {
    var mount = document.querySelector("[data-plan-compare]");
    if (!mount) return;

    var headCells = PLAN_ORDER.map(function (id) {
      var plan = PLAN_DETAILS[id];
      return (
        '<th scope="col">' +
        escapeHtml(plan.label) +
        (id === "trial" ? '<span class="plan-compare__th-sub">14 dni</span>' : "") +
        "</th>"
      );
    }).join("");

    var bodyRows = COMPARE_ROWS.map(function (row) {
      return (
        "<tr><th scope=\"row\">" +
        escapeHtml(row.label) +
        "</th>" +
        PLAN_ORDER.map(function (id) {
          return "<td>" + renderCompareCell(row[id]) + "</td>";
        }).join("") +
        "</tr>"
      );
    }).join("");

    mount.innerHTML =
      '<div class="plan-compare__scroll">' +
      '<table class="plan-compare__table">' +
      "<thead><tr><th scope=\"col\">Funkcja</th>" +
      headCells +
      "</tr></thead>" +
      "<tbody>" +
      bodyRows +
      "</tbody></table></div>" +
      '<p class="plan-compare__note">Szczegółowy opis każdego planu — kliknij „Pokaż więcej funkcji” na karcie powyżej lub w bannerze Trial.</p>';
  }

  function renderPlanSwitcher(activeId) {
    return PLAN_ORDER.map(function (id) {
      var plan = PLAN_DETAILS[id];
      if (!plan) return "";
      return (
        '<button type="button" class="plan-details-modal__tab' +
        (id === activeId ? " is-active" : "") +
        '" role="tab" data-plan-details-switch="' +
        escapeHtml(id) +
        '" aria-selected="' +
        (id === activeId ? "true" : "false") +
        '">' +
        escapeHtml(plan.label) +
        "</button>"
      );
    }).join("");
  }

  function renderModalBody(planId) {
    var plan = PLAN_DETAILS[planId];
    if (!plan || !modal) return;
    var title = modal.querySelector("[data-plan-details-title]");
    var priceEl = modal.querySelector("[data-plan-details-price]");
    var tagline = modal.querySelector("[data-plan-details-tagline]");
    var body = modal.querySelector("[data-plan-details-body]");
    var switcher = modal.querySelector("[data-plan-details-switcher]");
    var cta = modal.querySelector("[data-plan-details-cta]");
    if (title) title.textContent = plan.label;
    if (priceEl) {
      priceEl.innerHTML =
        escapeHtml(plan.price) + ' <span class="plan-details-modal__period">' + escapeHtml(plan.period) + "</span>";
    }
    if (tagline) tagline.textContent = plan.tagline;
    if (body) body.innerHTML = renderFeatureList(plan.features);
    if (switcher) {
      switcher.setAttribute("role", "tablist");
      switcher.setAttribute("aria-label", "Wybierz plan");
      switcher.className = "plan-details-modal__switcher";
      switcher.innerHTML = renderPlanSwitcher(planId);
    }
    if (cta && plan.cta) {
      cta.textContent = plan.cta.label;
      cta.href = plan.cta.href;
      cta.hidden = false;
    }
    modal.setAttribute("data-active-plan", planId);
  }

  function ensureModal() {
    if (modal) return modal;
    var wrap = document.createElement("div");
    wrap.className = "plan-details-modal";
    wrap.id = "plan-details-modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "plan-details-title");
    wrap.setAttribute("aria-hidden", "true");
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="plan-details-modal__backdrop" data-plan-details-close tabindex="-1"></div>' +
      '<div class="plan-details-modal__dialog">' +
      '<header class="plan-details-modal__head">' +
      '<div><span class="plan-details-modal__eyebrow"><i class="fas fa-layer-group" aria-hidden="true"></i> Szczegóły planu</span>' +
      '<h2 id="plan-details-title" data-plan-details-title>Plan</h2>' +
      '<p class="plan-details-modal__tagline" data-plan-details-tagline></p></div>' +
      '<button type="button" class="plan-details-modal__close" data-plan-details-close aria-label="Zamknij"><span aria-hidden="true"></span></button>' +
      "</header>" +
      '<div class="plan-details-modal__price" data-plan-details-price></div>' +
      '<div data-plan-details-switcher></div>' +
      '<div class="plan-details-modal__body" data-plan-details-body></div>' +
      '<footer class="plan-details-modal__foot">' +
      '<button type="button" class="plan-details-modal__ghost" data-plan-details-close>Zamknij</button>' +
      '<a class="plan-details-modal__cta" data-plan-details-cta href="Register.html">Wybierz plan</a>' +
      "</footer></div>";
    document.body.appendChild(wrap);
    modal = wrap;
    return modal;
  }

  function syncBodyLock() {
    var open = modal && !modal.hidden;
    document.body.classList.toggle("is-plan-modal-open", open);
  }

  function openPlanDetails(planId) {
    if (!PLAN_DETAILS[planId]) planId = "starter";
    ensureModal();
    renderModalBody(planId);
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    syncBodyLock();
    var closeBtn = modal.querySelector(".plan-details-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closePlanDetails() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    syncBodyLock();
    window.setTimeout(function () {
      if (modal && !modal.classList.contains("is-open")) modal.hidden = true;
    }, 220);
    if (lastFocus && typeof lastFocus.focus === "function") {
      try {
        lastFocus.focus();
      } catch (e) {}
    }
  }

  function parsePlanFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("plan");
    if (fromQuery && PLAN_DETAILS[fromQuery]) return fromQuery;
    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash && PLAN_DETAILS[hash]) return hash;
    return null;
  }

  function handleDeepLink() {
    var planId = parsePlanFromUrl();
    if (planId && document.body.classList.contains("plans-page")) {
      window.setTimeout(function () {
        openPlanDetails(planId);
      }, 120);
    }
    if (window.location.hash === "#porownanie") {
      var compare = document.getElementById("porownanie");
      if (compare) {
        window.setTimeout(function () {
          compare.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    }
  }

  function initPlanDetailsButtons() {
    document.addEventListener("click", function (event) {
      var openBtn = event.target.closest("[data-plan-details]");
      if (openBtn) {
        event.preventDefault();
        openPlanDetails(openBtn.getAttribute("data-plan-details"));
        return;
      }
      var switchBtn = event.target.closest("[data-plan-details-switch]");
      if (switchBtn && modal && modal.classList.contains("is-open")) {
        event.preventDefault();
        openPlanDetails(switchBtn.getAttribute("data-plan-details-switch"));
        return;
      }
      if (event.target.closest("[data-plan-details-close]")) {
        event.preventDefault();
        closePlanDetails();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
        closePlanDetails();
      }
    });
  }

  function init() {
    renderComparisonTable();
    if (document.body.classList.contains("plans-page")) {
      ensureModal();
    }
    initPlanDetailsButtons();
    handleDeepLink();
  }

  window.AmiQPlanDetails = {
    open: openPlanDetails,
    close: closePlanDetails,
    plans: PLAN_DETAILS,
    order: PLAN_ORDER,
    paidOrder: PAID_PLAN_ORDER,
    compareRows: COMPARE_ROWS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
