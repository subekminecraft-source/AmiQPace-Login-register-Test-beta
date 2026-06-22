(function () {
  "use strict";

  var STORAGE_PROJECTS = "amiqplace_projects";
  var STORAGE_PLAN = "amiqplace_plan";
  var STORAGE_ACTIVE = "amiqplace_active_project";
  var STORAGE_DELETED = "amiqplace_deleted_projects";
  var STORAGE_PANEL_PREFS = "amiqplace_panel_prefs";
  var STORAGE_USER = "amiqplace_user";
  var STORAGE_STORE_NOTIFICATIONS = "amiqplace_store_notifications";
  var DELETED_RETENTION_DAYS = 30;
  var DELETED_RETENTION_MS = DELETED_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  var PLAN_LIMITS = {
    trial: { maxProjects: 5, maxProducts: 15 },
    starter: { maxProjects: 3, maxProducts: 15 },
    "pro-seller": { maxProjects: 5, maxProducts: 50 },
    biznes: { maxProjects: 10, maxProducts: 200 },
    professional: { maxProjects: -1, maxProducts: -1 }
  };

  var PLAN_ORDER = ["trial", "starter", "pro-seller", "biznes", "professional"];
  var PLAN_LABELS = {
    trial: "Trial",
    starter: "Starter",
    "pro-seller": "Pro Seller",
    biznes: "Biznes",
    professional: "Professional"
  };

  var WALLET_PLATFORM_FEES = {
    trial: { percent: 0.029, fixed: 1.0, label: "2,9% + 1 zł" },
    starter: { percent: 0.025, fixed: 0.8, label: "2,5% + 0,80 zł" },
    "pro-seller": { percent: 0.022, fixed: 0.6, label: "2,2% + 0,60 zł" },
    biznes: { percent: 0.019, fixed: 0.5, label: "1,9% + 0,50 zł" },
    professional: { percent: 0.015, fixed: 0.35, label: "1,5% + 0,35 zł" }
  };

  var WALLET_RESERVE_BY_PLAN = {
    trial: 0.1,
    starter: 0.08,
    "pro-seller": 0.05,
    biznes: 0.03,
    professional: 0
  };

  var WALLET_HOLD_MS = 3 * 24 * 60 * 60 * 1000;

  var STRIPE_STATUS_META = {
    not_connected: { label: "Niepodłączone", icon: "fa-plug-circle-xmark", tone: "muted" },
    pending: { label: "Weryfikacja Stripe", icon: "fa-hourglass-half", tone: "warn" },
    active: { label: "Aktywne", icon: "fa-circle-check", tone: "ok" },
    restricted: { label: "Ograniczone", icon: "fa-triangle-exclamation", tone: "danger" }
  };

  var DOMAIN_STATUS_META = {
    not_connected: { label: "Niepodłączona", icon: "fa-plug-circle-xmark", tone: "muted" },
    pending_dns: { label: "Oczekuje na DNS", icon: "fa-server", tone: "warn" },
    verifying: { label: "Wystawianie SSL", icon: "fa-hourglass-half", tone: "warn" },
    active: { label: "Aktywna", icon: "fa-circle-check", tone: "ok" },
    error: { label: "Błąd konfiguracji", icon: "fa-triangle-exclamation", tone: "danger" }
  };

  var DOMAIN_PLAN_REQUIRED = "pro-seller";
  var DOMAIN_APEX_IP = "185.199.108.153";

  var TECH_HERO_LAYOUTS = [
    {
      id: "split",
      label: "Obok tekstu",
      desc: "Zdjęcie w kafelku po prawej — układ domyślny",
      icon: "fa-table-columns"
    },
    {
      id: "split-wide",
      label: "Szerokość desktop",
      desc: "Zdjęcie od napisu do prawej krawędzi ekranu",
      icon: "fa-panorama"
    },
    {
      id: "full",
      label: "Cały baner",
      desc: "Zdjęcie na pełną szerokość z tekstem na wierzchu",
      icon: "fa-image"
    }
  ];

  var THEMES = [
    { id: "blank", label: "Minimal", icon: "fa-border-all" },
    { id: "fashion", label: "Moda", icon: "fa-shirt" },
    { id: "food", label: "Gastro", icon: "fa-utensils" },
    { id: "tech", label: "Tech", icon: "fa-microchip" },
    { id: "lux", label: "Premium", icon: "fa-gem" },
    { id: "enterprise", label: "Enterprise", icon: "fa-building" }
  ];

  var SECTION_TOGGLE_META = {
    announcement: { label: "Komunikat górny", icon: "fa-bullhorn", templates: ["fashion", "tech", "generic", "lux", "enterprise"] },
    hero: { label: "Baner główny", icon: "fa-image", templates: ["fashion", "tech", "generic", "lux", "enterprise"] },
    heroStats: { label: "Statystyki w banerze", icon: "fa-chart-simple", templates: ["tech", "enterprise"] },
    trust: { label: "Pasek zaufania", icon: "fa-shield-halved", templates: ["fashion", "tech", "generic", "lux", "enterprise"] },
    lookbook: { label: "Lookbook / kolekcje", icon: "fa-layer-group", templates: ["fashion", "lux"] },
    categories: { label: "Kategorie", icon: "fa-grid-2", templates: ["tech"] },
    deals: { label: "Promocje tygodnia", icon: "fa-bolt", templates: ["tech"] },
    brandHub: { label: "Portfolio marek", icon: "fa-sitemap", templates: ["enterprise"] },
    entSolutions: { label: "Platforma B2B", icon: "fa-layer-group", templates: ["enterprise"] },
    entSegments: { label: "Segmenty klientów", icon: "fa-users-gear", templates: ["enterprise"] },
    products: { label: "Produkty", icon: "fa-box-open", templates: ["fashion", "tech", "generic", "lux", "enterprise"] },
    compare: { label: "Porównywarka", icon: "fa-table-columns", templates: ["tech"] },
    faq: { label: "FAQ", icon: "fa-circle-question", templates: ["tech"] },
    brands: { label: "Pasek marek", icon: "fa-copyright", templates: ["tech"] },
    entCases: { label: "Case studies", icon: "fa-chart-line", templates: ["enterprise"] },
    entPartners: { label: "Partnerzy integracji", icon: "fa-handshake", templates: ["enterprise"] },
    entFaq: { label: "FAQ B2B", icon: "fa-circle-question", templates: ["enterprise"] },
    entPortal: { label: "Portal B2B", icon: "fa-door-open", templates: ["enterprise"] },
    luxStory: { label: "Historia atelier", icon: "fa-book-open", templates: ["lux"] },
    luxCraft: { label: "Rzemiosło", icon: "fa-gem", templates: ["lux"] },
    luxExperience: { label: "Private shopping", icon: "fa-concierge-bell", templates: ["lux"] },
    luxPress: { label: "Prasa & opinie", icon: "fa-quote-left", templates: ["lux"] },
    about: { label: "O sklepie", icon: "fa-store", templates: ["fashion", "tech", "generic", "lux", "enterprise"] },
    newsletter: { label: "Newsletter", icon: "fa-envelope", templates: ["fashion", "tech", "generic", "lux", "enterprise"] }
  };

  var PANEL_NAV_SEARCH = [
    { view: "dashboard", label: "Pulpit", icon: "fa-gauge-high", keys: ["pulpit", "dashboard", "start"] },
    { view: "editor", label: "Sklep / edytor", icon: "fa-pen-to-square", keys: ["sklep", "edytor", "editor", "treść"] },
    { view: "theme", label: "Motyw sklepu", icon: "fa-palette", keys: ["motyw", "theme", "kolory", "baner"] },
    { view: "products", label: "Produkty", icon: "fa-box", keys: ["produkty", "products", "katalog"] },
    { view: "orders", label: "Zamówienia", icon: "fa-cart-shopping", keys: ["zamówienia", "zamowienia", "orders"] },
    { view: "customers", label: "Klienci", icon: "fa-users", keys: ["klienci", "customers"] },
    { view: "analytics", label: "Analityka", icon: "fa-chart-line", keys: ["analityka", "statystyki", "wykres"] },
    { view: "checkout", label: "Płatności i dostawy", icon: "fa-credit-card", keys: ["płatności", "platnosci", "dostawy", "checkout", "kasa"] },
    { view: "wallet", label: "Portfel", icon: "fa-wallet", keys: ["portfel", "wallet", "wypłaty", "stripe"] },
    { view: "plugins", label: "Wtyczki", icon: "fa-puzzle-piece", keys: ["wtyczki", "plugins", "integracje", "inpost", "moduły", "dropshipping"] },
    { view: "community", label: "Rynek społeczności", icon: "fa-store", keys: ["rynek", "marketplace", "społeczność", "spolecznosc", "community", "twórcy", "szablony"] },
    { view: "settings", label: "Ustawienia", icon: "fa-gear", keys: ["ustawienia", "settings", "domena"] }
  ];

  var CHECKLIST_ITEMS = [
    { key: "theme", icon: "fa-palette", title: "Wybierz motyw sklepu", sub: "Dopasuj wygląd do swojej marki.", action: "editor" },
    { key: "product", icon: "fa-box-open", title: "Dodaj pierwszy produkt", sub: "Nazwa, zdjęcia, warianty i cena.", action: "products" },
    { key: "payments", icon: "fa-credit-card", title: "Skonfiguruj płatności", sub: "Wybierz metody — integracja API po starcie produkcyjnym.", action: "checkout", checkoutStep: "payments" },
    { key: "shipping", icon: "fa-truck-fast", title: "Ustaw dostawy", sub: "Kurier, paczkomat, odbiór — stawki i darmowa dostawa.", action: "checkout", checkoutStep: "shipping" }
  ];

  var PAYMENT_PROVIDERS = [
    { id: "transfer", name: "Przelew bankowy", icon: "fa-building-columns", desc: "Numer konta i tytuł przelewu — gotowe od razu w demo.", tier: "trial" },
    { id: "cod", name: "Płatność za pobraniem", icon: "fa-money-bill-wave", desc: "Klient płaci kurierowi przy odbiorze — ustaw opłatę za pobranie.", tier: "trial" },
    { id: "blik", name: "BLIK", icon: "fa-mobile-screen-button", desc: "Płatności mobilne — symulacja, docelowo bramka płatnicza.", tier: "trial" },
    { id: "payu", name: "PayU", icon: "fa-bolt", desc: "Operator PayU — podłączysz klucze API po wdrożeniu produkcyjnym.", tier: "starter" },
    { id: "p24", name: "Przelewy24", icon: "fa-credit-card", desc: "Przelewy24 / PayPro — integracja w kolejnej wersji backendu.", tier: "starter" },
    { id: "stripe", name: "Stripe", icon: "fa-stripe-s", desc: "Karty i płatności międzynarodowe — tryb demo teraz.", tier: "pro-seller" }
  ];

  var PLUGIN_CATEGORIES = [
    { id: "all", label: "Wszystkie" },
    { id: "marketing", label: "Marketing" },
    { id: "shipping", label: "Dostawy" },
    { id: "payments", label: "Płatności" },
    { id: "analytics", label: "Analityka" },
    { id: "seo", label: "SEO" },
    { id: "support", label: "Obsługa klienta" },
    { id: "automation", label: "Automatyzacja" }
  ];

  var PLUGIN_CATALOG = [
    { id: "amiq-dropship-ai", name: "Dropshipping AI", desc: "Kalkulator marży, rekomendacje AI i mini kreator sklepu Quick Store — jak Shopify Start.", icon: "fa-robot", category: "automation", source: "amiq", tags: ["dropshipping", "marża", "ai", "kalkulator", "quick store"], tier: "trial", hasApp: true },
    { id: "amiq-reviews", name: "Opinie produktów", desc: "Zbieraj oceny i recenzje klientów na kartach produktów.", icon: "fa-star", category: "marketing", source: "amiq", tags: ["opinie", "reviews", "gwiazdki"], tier: "trial" },
    { id: "amiq-abandoned-cart", name: "Porzucone koszyki", desc: "Przypomnienia e-mail o niedokończonych zakupach — automatyczna sekwencja.", icon: "fa-cart-arrow-down", category: "marketing", source: "amiq", tags: ["koszyk", "remarketing", "e-mail"], tier: "starter" },
    { id: "amiq-newsletter-pro", name: "Newsletter Pro", desc: "Segmentacja listy, automatyczne tagi i raporty otwarć w panelu.", icon: "fa-envelope-open-text", category: "marketing", source: "amiq", tags: ["newsletter", "mailing"], tier: "trial" },
    { id: "amiq-seo-boost", name: "SEO Sklep", desc: "Meta tagi, mapa witryny i podgląd snippetów Google dla produktów.", icon: "fa-magnifying-glass-chart", category: "seo", source: "amiq", tags: ["seo", "google", "meta"], tier: "trial" },
    { id: "amiq-loyalty", name: "Program lojalnościowy", desc: "Punkty za zakupy, kupony i poziomy klienta VIP.", icon: "fa-gift", category: "marketing", source: "amiq", tags: ["lojalność", "punkty", "kupony"], tier: "starter" },
    { id: "amiq-live-stock", name: "Alerty magazynowe", desc: "Powiadomienia o niskim stanie i automatyczne ukrywanie wyprzedanych SKU.", icon: "fa-boxes-stacked", category: "automation", source: "amiq", tags: ["magazyn", "stock", "alert"], tier: "trial" },
    { id: "inpost", name: "InPost Paczkomaty", desc: "Mapa punktów, etykiety i śledzenie przesyłek InPost.", icon: "fa-box", category: "shipping", source: "partner", provider: "InPost", tags: ["inpost", "paczkomat", "dostawa"], tier: "trial" },
    { id: "dpd", name: "DPD Polska", desc: "Kurier DPD — stawki, etykiety i statusy doręczeń.", icon: "fa-truck-fast", category: "shipping", source: "partner", provider: "DPD", tags: ["dpd", "kurier", "dostawa"], tier: "starter" },
    { id: "payu", name: "PayU", desc: "Bramka płatności PayU — BLIK, karty i raty.", icon: "fa-bolt", category: "payments", source: "partner", provider: "PayU", tags: ["payu", "blik", "płatności"], tier: "starter" },
    { id: "p24", name: "Przelewy24", desc: "Przelewy24 / PayPro — szybkie płatności online.", icon: "fa-credit-card", category: "payments", source: "partner", provider: "Przelewy24", tags: ["p24", "przelewy24", "płatności"], tier: "starter" },
    { id: "stripe", name: "Stripe", desc: "Karty międzynarodowe, Apple Pay i Google Pay.", icon: "fa-stripe-s", category: "payments", source: "partner", provider: "Stripe", tags: ["stripe", "karty", "apple pay"], tier: "pro-seller" },
    { id: "ga4", name: "Google Analytics 4", desc: "Śledzenie konwersji, lejek zakupowy i raporty e-commerce.", icon: "fa-chart-line", category: "analytics", source: "partner", provider: "Google", tags: ["analytics", "ga4", "google"], tier: "trial" },
    { id: "meta-pixel", name: "Meta Pixel", desc: "Remarketing Facebook / Instagram i optymalizacja kampanii.", icon: "fa-facebook", category: "analytics", source: "partner", provider: "Meta", tags: ["facebook", "instagram", "pixel"], tier: "starter" },
    { id: "tidio", name: "Tidio Live Chat", desc: "Czat na żywo, boty FAQ i integracja z koszykiem.", icon: "fa-comments", category: "support", source: "partner", provider: "Tidio", tags: ["czat", "chat", "support"], tier: "trial" },
    { id: "baselinker", name: "BaseLinker", desc: "Synchronizacja zamówień i magazynu z marketplace’ami.", icon: "fa-arrows-rotate", category: "automation", source: "partner", provider: "BaseLinker", tags: ["baselinker", "marketplace", "sync"], tier: "biznes" },
    { id: "fakturownia", name: "Fakturownia", desc: "Automatyczne faktury VAT po opłaceniu zamówienia.", icon: "fa-file-invoice", category: "automation", source: "partner", provider: "Fakturownia", tags: ["faktura", "vat", "księgowość"], tier: "starter" },
    { id: "mailchimp", name: "Mailchimp", desc: "Synchronizacja klientów i list mailingowych ze sklepem.", icon: "fa-envelope", category: "marketing", source: "partner", provider: "Mailchimp", tags: ["mailchimp", "mailing", "crm"], tier: "starter" },
    { id: "hotjar", name: "Hotjar", desc: "Mapy ciepła i nagrania sesji na stronach produktów.", icon: "fa-fire", category: "analytics", source: "partner", provider: "Hotjar", tags: ["hotjar", "heatmap", "ux"], tier: "biznes" }
  ];

  var CHECKOUT_STEPS = [
    { id: "payments", label: "Płatności", icon: "fa-credit-card" },
    { id: "shipping", label: "Dostawy", icon: "fa-truck-fast" },
    { id: "summary", label: "Podsumowanie", icon: "fa-circle-check" }
  ];

  var AMIQ_TEMPLATES = [
    {
      id: "amiq-fashion",
      name: "Moda & Lookbook",
      desc: "Baner ze zdjęciem, lookbook sezonowy, tryb ciemny i paleta modowa — dostępny w każdym planie.",
      thumb: "fashion",
      coverImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80",
      planRequired: "trial",
      tag: "W każdym planie",
      featured: true,
      comingSoon: false
    },
    {
      id: "amiq-minimal",
      name: "AmiQPlace Classic",
      desc: "Oficjalny szablon startowy — nagłówki, sekcje produktów i baner gotowe do edycji.",
      thumb: "blank",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
      planRequired: "trial",
      tag: "Oficjalny",
      featured: false,
      comingSoon: true
    },
    {
      id: "amiq-food",
      name: "Gastro Box",
      desc: "Idealny pod catering, boxy lunchowe i dostawy lokalne.",
      thumb: "food",
      coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
      planRequired: "starter",
      tag: null,
      comingSoon: true
    },
    {
      id: "amiq-tech",
      name: "Tech Store Pro",
      desc: "Hero z wyszukiwarką, kategorie, promocje, porównywarka specyfikacji, FAQ i bestsellery — dostępny w trialu, po trialu plan Biznes.",
      thumb: "tech",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      planRequired: "biznes",
      tag: "Tech Pro",
      trialAccess: true,
      comingSoon: false
    },
    {
      id: "amiq-lux",
      name: "Maison Éclat",
      desc: "Luksusowy butik premium — hero cinematic, kolekcje editorial, atelier, concierge VIP i kuratorskie produkty.",
      thumb: "lux",
      coverImage: "https://images.unsplash.com/photo-1617137968427-85924c800a07?auto=format&fit=crop&w=900&q=80",
      planRequired: "biznes",
      tag: "Premium",
      featured: true,
      trialAccess: true,
      comingSoon: false
    },
    {
      id: "amiq-enterprise",
      name: "Multi-brand Hub",
      desc: "Portfolio marek, segmentacja B2B, raporty cross-brand i portal partnera — profesjonalny hub enterprise.",
      thumb: "enterprise",
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
      planRequired: "professional",
      tag: "Enterprise",
      trialAccess: true,
      comingSoon: false
    }
  ];

  var TEMPLATE_SOON_MESSAGES = {
    "amiq-minimal": "Wkrótce! AmiQPlace Classic dostaje ostatnie szlify — na dziś wjedź w Moda & Lookbook i buduj sklep bez czekania.",
    "amiq-food": "Wkrótce — Gastro Box dopiero się podgrzewa w kuchni. Na razie Moda & Lookbook poda Ci pełny flow sklepu.",
    "amiq-lux": "Maison Éclat — szablon premium jest aktywny. Edytuj hero, kolekcje i produkty w panelu.",
    "amiq-enterprise": "Multi-brand Hub jest aktywny — portfolio marek, B2B i raporty w jednym szablonie."
  };

  var modal;
  var productModal;
  var deleteModal;
  var customerModal;
  var lastFocus;
  var currentView = "dashboard";
  var currentSettingsTab = "general";
  var ordersFilter = "all";
  var editingProductId = null;
  var pendingDeleteProjectId = null;
  var previewDeviceMode = "desktop";
  var checkoutWizardStep = "payments";
  var checkoutDraft = null;
  var checkoutDraftProjectId = null;
  var analyticsRange = "7d";
  var analyticsMetric = "revenue";
  var walletLedgerFilter = "all";
  var pluginsSearchQuery = "";
  var pluginsSourceFilter = "all";
  var pluginsCategoryFilter = "all";
  var activePluginAppId = null;
  var templatePreviewModal;
  var publishModal;
  var pendingPreviewTemplateId = null;
  var collectionModal;
  var bannerLibraryModal;
  var bannerLibraryState = { search: "", category: "all" };
  var BANNER_PRESETS_INLINE_LIMIT = 6;
  var editingCollectionId = null;
  var MAX_COLLECTIONS = 15;
  var productVariantsDraft = [];
  var productSpecsDraft = [];
  var productSpecsVisibleDraft = true;
  var orderModal;
  var viewingOrderId = null;

  function parseVariantOptionsText(text) {
    return String(text || "")
      .split(/[,;|/]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function syncProductVariantsFromDOM() {
    $all("[data-variant-index]").forEach(function (row) {
      var idx = parseInt(row.getAttribute("data-variant-index"), 10);
      if (isNaN(idx) || !productVariantsDraft[idx]) return;
      var nameEl = row.querySelector("[data-variant-name]");
      var optsEl = row.querySelector("[data-variant-options]");
      productVariantsDraft[idx].name = nameEl ? nameEl.value.trim() : "";
      productVariantsDraft[idx].options = parseVariantOptionsText(optsEl ? optsEl.value : "");
    });
  }

  function renderProductVariantsEditor() {
    var root = $("[data-product-variants-editor]");
    if (!root) return;
    if (!productVariantsDraft.length) {
      root.innerHTML =
        '<p class="panel-variants-empty"><i class="fas fa-sliders" aria-hidden="true"></i> Brak wariantów — dodaj rozmiar, kolor lub inną opcję do wyboru przy zakupie.</p>';
      return;
    }
    root.innerHTML = productVariantsDraft
      .map(function (v, idx) {
        return (
          '<article class="panel-variant-group" data-variant-index="' +
          idx +
          '">' +
          '<div class="panel-form-row panel-form-row--variant">' +
          '<label class="panel-field"><span>Nazwa opcji</span>' +
          '<input type="text" data-variant-name maxlength="40" placeholder="np. Rozmiar, Kolor" value="' +
          escapeHtml(v.name || "") +
          '"></label>' +
          '<label class="panel-field panel-field--grow"><span>Wartości (po przecinku)</span>' +
          '<input type="text" data-variant-options maxlength="160" placeholder="S, M, L lub Czerwony, Niebieski" value="' +
          escapeHtml((v.options || []).join(", ")) +
          '"></label>' +
          '<button type="button" class="panel-project-card__btn panel-project-card__btn--danger" data-variant-remove="' +
          idx +
          '" aria-label="Usuń wariant"><i class="fas fa-trash" aria-hidden="true"></i></button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function readProductVariantsForSave() {
    syncProductVariantsFromDOM();
    return productVariantsDraft
      .map(function (v) {
        return {
          id: v.id || uid("var"),
          name: v.name || "Wariant",
          options: (v.options || []).slice()
        };
      })
      .filter(function (v) {
        return v.name && v.options.length;
      });
  }

  function getDefaultSpecLabelsForProject(project) {
    var keys =
      project && project.techCompare && project.techCompare.specKeys && project.techCompare.specKeys.length
        ? project.techCompare.specKeys.slice()
        : ["Chip / Procesor", "Pamięć", "Bateria", "Gwarancja", "Waga"];
    return keys;
  }

  function syncProductSpecsFromDOM() {
    $all("[data-spec-index]").forEach(function (row) {
      var idx = parseInt(row.getAttribute("data-spec-index"), 10);
      if (isNaN(idx) || !productSpecsDraft[idx]) return;
      var labelEl = row.querySelector("[data-spec-label]");
      var valueEl = row.querySelector("[data-spec-value]");
      productSpecsDraft[idx].label = labelEl ? labelEl.value.trim() : "";
      productSpecsDraft[idx].value = valueEl ? valueEl.value.trim() : "";
    });
    var visibleInput = $("[data-product-specs-visible]");
    if (visibleInput) productSpecsVisibleDraft = visibleInput.checked;
  }

  function renderProductSpecsEditor() {
    var root = $("[data-product-specs-editor]");
    var block = $("[data-product-specs-block]");
    var visibleInput = $("[data-product-specs-visible]");
    if (visibleInput) visibleInput.checked = productSpecsVisibleDraft !== false;
    if (block) {
      block.classList.toggle("is-specs-hidden", productSpecsVisibleDraft === false);
      var toggle = block.querySelector(".panel-subsection-visibility--specs");
      if (toggle) toggle.classList.toggle("is-on", productSpecsVisibleDraft !== false);
      var toggleLabel = toggle && toggle.querySelector(".panel-subsection-visibility__label");
      if (toggleLabel) toggleLabel.textContent = productSpecsVisibleDraft !== false ? "Widoczna" : "Ukryta";
    }
    if (!root) return;
    if (!productSpecsDraft.length) {
      root.innerHTML =
        '<p class="panel-specs-empty"><i class="fas fa-microchip" aria-hidden="true"></i> Brak parametrów — dodaj specyfikację lub włącz widoczność po uzupełnieniu.</p>';
      return;
    }
    root.innerHTML = productSpecsDraft
      .map(function (s, idx) {
        return (
          '<article class="panel-spec-row" data-spec-index="' +
          idx +
          '">' +
          '<label class="panel-field"><span>Parametr</span>' +
          '<input type="text" data-spec-label maxlength="60" placeholder="np. Procesor" value="' +
          escapeHtml(s.label || "") +
          '"></label>' +
          '<label class="panel-field panel-field--grow"><span>Wartość</span>' +
          '<input type="text" data-spec-value maxlength="120" placeholder="np. Apple M4" value="' +
          escapeHtml(s.value || "") +
          '"></label>' +
          '<button type="button" class="panel-project-card__btn panel-project-card__btn--danger" data-spec-remove="' +
          idx +
          '" aria-label="Usuń parametr"><i class="fas fa-trash" aria-hidden="true"></i></button>' +
          "</article>"
        );
      })
      .join("");
  }

  function readProductSpecsForSave() {
    syncProductSpecsFromDOM();
    return productSpecsDraft
      .map(function (s) {
        return { label: String(s.label || "").trim(), value: String(s.value || "").trim() };
      })
      .filter(function (s) {
        return s.label && s.value;
      });
  }

  function syncProductSpecsBlock(project) {
    var block = $("[data-product-specs-block]");
    if (!block) return;
    var show = project && isTechProject(project);
    block.hidden = !show;
  }

  function maybeSuggestProductSpecsFromTemplate(project) {
    if (!project || !isTechProject(project) || editingProductId) return;
    if (productSpecsDraft.length) return;
    productSpecsDraft = getDefaultSpecLabelsForProject(project).map(function (label) {
      return { label: label, value: "" };
    });
    productSpecsVisibleDraft = true;
    renderProductSpecsEditor();
  }

  function getLowStockProducts(project, threshold) {
    threshold = typeof threshold === "number" ? threshold : 5;
    if (!project) return [];
    return (project.products || []).filter(function (p) {
      return p.status === "active" && typeof p.stock === "number" && p.stock >= 0 && p.stock <= threshold;
    });
  }

  function formatOrderVariantSummary(order) {
    if (order.variantLabel) return order.variantLabel;
    if (Array.isArray(order.items) && order.items.length) {
      return order.items
        .map(function (item) {
          return item.variantLabel ? item.name + " (" + item.variantLabel + ")" : item.name;
        })
        .join("; ");
    }
    return "";
  }

  function openOrderModal(orderId) {
    var project = getActiveProject();
    if (!project) return;
    var order = (project.orders || []).find(function (o) {
      return o.id === orderId;
    });
    if (!order) return;
    viewingOrderId = orderId;
    if (!orderModal) orderModal = document.getElementById("order-detail-modal");
    if (!orderModal) return;
    var title = $("[data-order-modal-title]");
    if (title) title.textContent = "Zamówienie " + order.number;
    var body = $("[data-order-modal-body]");
    if (body) {
      var items = Array.isArray(order.items) && order.items.length
        ? order.items
        : [
            {
              name: order.productName || "Produkt",
              qty: order.itemCount || 1,
              price: Math.max(0, (order.total || 0) - (order.shippingCost || 0)),
              variantLabel: order.variantLabel || ""
            }
          ];
      body.innerHTML =
        '<div class="panel-order-detail">' +
        '<div class="panel-order-detail__meta">' +
        "<div><span>Klient</span><strong>" +
        escapeHtml(order.customer) +
        "</strong><small>" +
        escapeHtml(order.email || "") +
        "</small></div>" +
        "<div><span>Status</span><strong>" +
        escapeHtml({ new: "Nowe", processing: "W realizacji", done: "Zrealizowane" }[order.status] || order.status) +
        "</strong></div>" +
        "<div><span>Płatność</span><strong>" +
        escapeHtml(order.paymentMethod || "—") +
        "</strong></div>" +
        "<div><span>Dostawa</span><strong>" +
        escapeHtml(order.shippingMethod || "—") +
        "</strong></div></div>" +
        '<table class="panel-order-detail__table"><thead><tr><th>Produkt</th><th>Wariant</th><th>Ilość</th><th>Kwota</th></tr></thead><tbody>' +
        items
          .map(function (item) {
            return (
              "<tr><td>" +
              escapeHtml(item.name) +
              "</td><td>" +
              (item.variantLabel ? '<span class="panel-order-variant">' + escapeHtml(item.variantLabel) + "</span>" : "—") +
              "</td><td>" +
              escapeHtml(String(item.qty || 1)) +
              "</td><td>" +
              escapeHtml(formatPrice((item.price || 0) * (item.qty || 1))) +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table>" +
        '<div class="panel-order-detail__total"><span>Razem</span><strong>' +
        escapeHtml(formatPrice(order.total)) +
        "</strong></div></div>";
    }
    orderModal.hidden = false;
    orderModal.classList.add("is-open");
    orderModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
  }

  function closeOrderModal() {
    if (!orderModal || !orderModal.classList.contains("is-open")) return;
    orderModal.classList.remove("is-open");
    orderModal.setAttribute("aria-hidden", "true");
    viewingOrderId = null;
    syncBodyModalLock();
    window.setTimeout(function () {
      if (orderModal && !orderModal.classList.contains("is-open")) orderModal.hidden = true;
    }, 280);
  }

  function duplicateProduct(productId) {
    var project = getActiveProject();
    if (!project) return;
    if (!canAddProduct(project, true)) {
      showToast(getLimitMessage("product"));
      return;
    }
    var source = (project.products || []).find(function (p) {
      return p.id === productId;
    });
    if (!source) return;
    var copy = JSON.parse(JSON.stringify(source));
    copy.id = uid("prod");
    copy.name = source.name + " (kopia)";
    copy.sku = source.sku ? source.sku + "-K" : "";
    copy.status = "draft";
    copy.updatedAt = Date.now();
    var products = (project.products || []).slice();
    products.unshift(copy);
    updateProject(project.id, { products: products });
    pushActivity(project.id, 'Sklonowano produkt „' + source.name + '"');
    refreshUI();
    showToast("Utworzono kopię produktu — status: szkic.");
  }

  function exportOrdersCsv() {
    var project = getActiveProject();
    if (!project || !(project.orders || []).length) {
      showToast("Brak zamówień do eksportu.");
      return;
    }
    var rows = [
      ["Numer", "Klient", "Email", "Status", "Produkt", "Wariant", "Kwota", "Dostawa", "Data"].join(";")
    ];
    (project.orders || []).forEach(function (o) {
      rows.push(
        [
          o.number,
          o.customer,
          o.email || "",
          o.status,
          o.productName || "",
          formatOrderVariantSummary(o),
          String(o.total).replace(".", ","),
          o.shippingMethod || "",
          o.createdAt ? new Date(o.createdAt).toLocaleString("pl-PL") : ""
        ]
          .map(function (cell) {
            return '"' + String(cell || "").replace(/"/g, '""') + '"';
          })
          .join(";")
      );
    });
    var blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = (project.slug || "sklep") + "-zamowienia.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Pobrano plik CSV z zamówieniami.");
  }

  function renderDashboardInventoryAlerts(project) {
    var wrap = $("[data-dashboard-inventory-wrap]");
    var root = $("[data-dashboard-inventory]");
    if (!wrap || !root) return;
    if (!project) {
      wrap.hidden = true;
      return;
    }
    if (!shouldNotify("lowStock")) {
      wrap.hidden = true;
      return;
    }
    var low = getLowStockProducts(project, 5);
    wrap.hidden = !low.length;
    if (!low.length) return;
    root.innerHTML =
      '<div class="panel-inventory-alert">' +
      '<div class="panel-inventory-alert__icon"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i></div>' +
      "<div><strong>Niski stan magazynowy</strong><p>" +
      low.length +
      " " +
      (low.length === 1 ? "produkt wymaga uzupełnienia" : "produkty wymagają uzupełnienia") +
      ' (≤ 5 szt.).</p><ul class="panel-inventory-alert__list">' +
      low
        .slice(0, 4)
        .map(function (p) {
          return (
            "<li><span>" +
            escapeHtml(p.name) +
            '</span><strong>' +
            escapeHtml(String(p.stock)) +
            ' szt.</strong> <button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-edit-product="' +
            escapeHtml(p.id) +
            '">Edytuj</button></li>'
          );
        })
        .join("") +
      (low.length > 4 ? "<li>… i " + (low.length - 4) + " więcej</li>" : "") +
      '</ul><button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-panel-nav="products"><i class="fas fa-box" aria-hidden="true"></i> Katalog produktów</button></div></div>';
  }

  var STORE_CATEGORIES = [
    {
      id: "fashion",
      name: "Moda i odzież",
      icon: "fa-shirt",
      desc: "Odzież, obuwie, dodatki — rozmiary, kolory, lookbook i sezonowe kolekcje.",
      features: ["Rozmiary i warianty", "Lookbook", "Porady stylizacji"],
      questions: [
        {
          id: "audience",
          title: "Kto jest Twoim głównym klientem?",
          hint: "Pomoże nam dopasować domyślne filtry i pola produktu.",
          options: [
            { value: "women", label: "Kobiety", sub: "Damska odzież i dodatki" },
            { value: "men", label: "Mężczyźni", sub: "Męska odzież i obuwie" },
            { value: "unisex", label: "Unisex / mix", sub: "Oferta dla wszystkich" },
            { value: "kids", label: "Dzieci", sub: "Odzież dziecięca" }
          ]
        },
        {
          id: "sizing",
          title: "Jak chcesz obsługiwać rozmiary?",
          hint: "W kolejnej wersji włączymy odpowiednie pola w produkcie i koszyku.",
          options: [
            { value: "sizes", label: "Stała siatka rozmiarów", sub: "XS–XL, numery EU itd." },
            { value: "variants", label: "Rozmiar + kolor", sub: "Warianty jak w Shopify" },
            { value: "one-size", label: "Jeden uniwersalny", sub: "Bez wyboru rozmiaru" },
            { value: "custom", label: "Na zamówienie", sub: "Wymiary pod klienta" }
          ]
        },
        {
          id: "priceRange",
          title: "Typowy przedział cenowy?",
          hint: "Użyjemy tego w analityce demo i sugestiach marketingowych.",
          options: [
            { value: "budget", label: "Do 150 zł", sub: "Fast fashion, basics" },
            { value: "mid", label: "150–400 zł", sub: "Jakość i design" },
            { value: "premium", label: "400 zł+", sub: "Premium / designer" },
            { value: "mixed", label: "Mix cen", sub: "Od basic po premium" }
          ]
        }
      ]
    },
    {
      id: "food",
      name: "Gastronomia i żywność",
      icon: "fa-utensils",
      desc: "Catering, boxy lunchowe, produkty lokalne — dostawa, alergeny, data ważności.",
      features: ["Okna dostawy", "Alergeny", "Strefy dostawy"],
      questions: [
        {
          id: "fulfillment",
          title: "Jak realizujesz zamówienia?",
          options: [
            { value: "delivery", label: "Dostawa", sub: "Kurier lub własna flota" },
            { value: "pickup", label: "Odbiór osobisty", sub: "Punkt lub lokale" },
            { value: "both", label: "Dostawa i odbiór", sub: "Klient wybiera" },
            { value: "subscription", label: "Subskrypcja", sub: "Boxy cykliczne" }
          ]
        },
        {
          id: "productType",
          title: "Co głównie sprzedajesz?",
          options: [
            { value: "ready", label: "Dania gotowe", sub: "Posiłki na teraz" },
            { value: "mealbox", label: "Boxy / zestawy", sub: "Catering i lunch box" },
            { value: "grocery", label: "Produkty spożywcze", sub: "Składniki, przetwory" },
            { value: "beverage", label: "Napoje", sub: "Kawa, soki, alkohol" }
          ]
        },
        {
          id: "freshness",
          title: "Czy data ważności jest kluczowa?",
          options: [
            { value: "yes", label: "Tak, zawsze", sub: "Produkty świeże / krótki termin" },
            { value: "sometimes", label: "Czasami", sub: "Mix świeżych i suchych" },
            { value: "no", label: "Nie", sub: "Długi shelf life" }
          ]
        }
      ]
    },
    {
      id: "electronics",
      name: "Elektronika i tech",
      icon: "fa-microchip",
      desc: "Sprzęt, akcesoria, gadżety — specyfikacja, porównywarka, gwarancja.",
      features: ["Specyfikacja", "Porównanie", "Gwarancja"],
      questions: [
        {
          id: "catalog",
          title: "Jaki charakter ma Twój katalog?",
          options: [
            { value: "consumer", label: "B2C — konsumenci", sub: "Sklep detaliczny" },
            { value: "pro", label: "B2B / pro", sub: "Firmy i instalatorzy" },
            { value: "mixed", label: "Mix B2B i B2C", sub: "Oba segmenty" },
            { value: "refurb", label: "Outlet / refurb", sub: "Używany lub regenerowany sprzęt" }
          ]
        },
        {
          id: "specs",
          title: "Jak ważna jest specyfikacja techniczna?",
          options: [
            { value: "critical", label: "Kluczowa", sub: "Tabela parametrów przy każdym produkcie" },
            { value: "important", label: "Ważna", sub: "Kilka głównych cech" },
            { value: "minimal", label: "Minimalna", sub: "Krótki opis wystarczy" }
          ]
        },
        {
          id: "warranty",
          title: "Model gwarancji i serwisu?",
          options: [
            { value: "manufacturer", label: "Gwarancja producenta", sub: "Standardowe RMA" },
            { value: "shop", label: "Gwarancja sklepu", sub: "Własny serwis" },
            { value: "extended", label: "Przedłużona", sub: "Pakiety dodatkowe" },
            { value: "none", label: "Bez gwarancji", sub: "Akcesoria i consumables" }
          ]
        }
      ]
    },
    {
      id: "beauty",
      name: "Uroda i kosmetyki",
      icon: "fa-spa",
      desc: "Pielęgnacja, makijaż, perfumy — skład INCI, wolumeny, warianty odcieni.",
      features: ["Odcienie", "Skład INCI", "Zestawy próbek"],
      questions: [
        {
          id: "productForm",
          title: "Forma produktów?",
          options: [
            { value: "skincare", label: "Pielęgnacja", sub: "Kremy, serum, SPF" },
            { value: "makeup", label: "Makijaż", sub: "Kolory i odcienie" },
            { value: "fragrance", label: "Zapachy", sub: "Perfumy, wody" },
            { value: "mix", label: "Mix kategorii", sub: "Cała półka beauty" }
          ]
        },
        {
          id: "shades",
          title: "Czy produkty mają odcienie / warianty?",
          options: [
            { value: "many", label: "Tak, wiele odcieni", sub: "Paleta kolorów" },
            { value: "few", label: "Kilka wariantów", sub: "2–5 opcji" },
            { value: "volume", label: "Tylko pojemności", sub: "50 ml / 100 ml" },
            { value: "single", label: "Pojedyncze SKU", sub: "Bez wariantów" }
          ]
        },
        {
          id: "compliance",
          title: "Oznakowanie i zgodność UE?",
          options: [
            { value: "full", label: "Pełne INCI + PAO", sub: "Wymogi kosmetyczne" },
            { value: "basic", label: "Podstawowe info", sub: "Skład w opisie" },
            { value: "unsure", label: "Jeszcze ustalam", sub: "Pomożemy w checklist" }
          ]
        }
      ]
    },
    {
      id: "home",
      name: "Dom i wnętrza",
      icon: "fa-couch",
      desc: "Meble, dekoracje, tekstylia — gabaryty, personalizacja, dostawa paletowa.",
      features: ["Gabaryty", "Personalizacja", "Dostawa XL"],
      questions: [
        {
          id: "productType",
          title: "Co dominuje w ofercie?",
          options: [
            { value: "furniture", label: "Meble", sub: "Stoły, sofy, regały" },
            { value: "decor", label: "Dekoracje", sub: "Dodatki, świece, ramy" },
            { value: "textile", label: "Tekstylia", sub: "Pościel, zasłony" },
            { value: "mix", label: "Mix", sub: "Cały dom" }
          ]
        },
        {
          id: "customization",
          title: "Produkty na wymiar?",
          options: [
            { value: "yes", label: "Tak, często", sub: "Konfigurator / wymiary" },
            { value: "sometimes", label: "Czasami", sub: "Wybrane pozycje" },
            { value: "no", label: "Gotowe SKU", sub: "Standardowy katalog" }
          ]
        },
        {
          id: "shipping",
          title: "Logistyka wysyłki?",
          options: [
            { value: "parcel", label: "Paczki standard", sub: "Kurier / paczkomat" },
            { value: "freight", label: "Transport paletowy", sub: "Duże gabaryty" },
            { value: "assembly", label: "Z montażem", sub: "Dostawa + usługa" },
            { value: "local", label: "Tylko lokalnie", sub: "Własny transport" }
          ]
        }
      ]
    },
    {
      id: "services",
      name: "Usługi i digital",
      icon: "fa-briefcase",
      desc: "Konsulting, szkolenia, pliki, subskrypcje — rezerwacje, vouchery, faktury.",
      features: ["Rezerwacje", "Produkty cyfrowe", "Vouchery"],
      questions: [
        {
          id: "delivery",
          title: "Jak dostarczasz usługę?",
          options: [
            { value: "online", label: "Online", sub: "Wideokonsultacje, pliki" },
            { value: "onsite", label: "Na miejscu", sub: "U klienta / w biurze" },
            { value: "hybrid", label: "Hybrydowo", sub: "Mix form" },
            { value: "digital", label: "Tylko digital", sub: "PDF, kursy, licencje" }
          ]
        },
        {
          id: "booking",
          title: "Czy potrzebujesz rezerwacji terminów?",
          options: [
            { value: "required", label: "Tak, kluczowe", sub: "Kalendarz i sloty" },
            { value: "optional", label: "Opcjonalnie", sub: "Dla części oferty" },
            { value: "no", label: "Nie", sub: "Zakup bez terminu" }
          ]
        },
        {
          id: "billing",
          title: "Model rozliczeń?",
          options: [
            { value: "oneoff", label: "Jednorazowo", sub: "Płatność za usługę" },
            { value: "subscription", label: "Subskrypcja", sub: "Miesięczny abonament" },
            { value: "packages", label: "Pakiety", sub: "Karnety i vouchery" },
            { value: "quote", label: "Wycena indywidualna", sub: "Formularz zapytań" }
          ]
        }
      ]
    },
    {
      id: "general",
      name: "Uniwersalny",
      icon: "fa-store",
      desc: "Mix branż, rękodzieło, lokalny biznes — elastyczny katalog bez niszy.",
      features: ["Elastyczny katalog", "Proste warianty", "Szybki start"],
      questions: [
        {
          id: "catalogSize",
          title: "Ile produktów planujesz na start?",
          options: [
            { value: "small", label: "1–15", sub: "Mały, selekcjonowany katalog" },
            { value: "medium", label: "16–100", sub: "Rosnący sklep" },
            { value: "large", label: "100+", sub: "Szeroka oferta" },
            { value: "unsure", label: "Jeszcze nie wiem", sub: "Zaczynam od testów" }
          ]
        },
        {
          id: "primaryGoal",
          title: "Główny cel sklepu?",
          options: [
            { value: "sell", label: "Sprzedaż online", sub: "Klasyczny e-commerce" },
            { value: "brand", label: "Wizytówka marki", sub: "Prezentacja + kontakt" },
            { value: "launch", label: "Premiera produktu", sub: "Landing pod launch" },
            { value: "test", label: "Test pomysłu", sub: "Walidacja rynku" }
          ]
        },
        {
          id: "variants",
          title: "Czy produkty będą miały warianty?",
          options: [
            { value: "yes", label: "Tak", sub: "Rozmiary, kolory, opcje" },
            { value: "maybe", label: "Może później", sub: "Na razie proste SKU" },
            { value: "no", label: "Nie", sub: "Jeden wariant = jeden produkt" }
          ]
        }
      ]
    }
  ];

  var categoryModal;
  var categoryWizardStep = 0;
  var pendingCategoryId = null;
  var categoryWizardDraft = {};
  var categoryWizardIsFirstTime = false;
  var categoryEditorHintShown = false;

  var ACCENT_PRESETS = [
    { id: "violet", label: "Fiolet modowy", color: "#8b52c4" },
    { id: "rose", label: "Róż pudrowy", color: "#c45c8b" },
    { id: "sand", label: "Beż premium", color: "#b8956a" },
    { id: "graphite", label: "Grafit", color: "#4a4f5c" },
    { id: "forest", label: "Butelkowa zieleń", color: "#3d6b5e" },
    { id: "coral", label: "Koral", color: "#d4654a" }
  ];

  function storefrontApi() {
    return window.AmiqStorefront || null;
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function planLevel(planId) {
    var idx = PLAN_ORDER.indexOf(planId);
    return idx === -1 ? 0 : idx;
  }

  function getCurrentPlan() {
    try {
      var stored = sessionStorage.getItem(STORAGE_PLAN);
      if (stored && PLAN_ORDER.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return "trial";
  }

  function isTrialActive() {
    try {
      return (
        sessionStorage.getItem("amiqplace_trial_active") === "true" || localStorage.getItem("amiqplace_trial_active") === "true"
      );
    } catch (e) {
      return false;
    }
  }

  function isTechProject(project) {
    if (!project) return false;
    if (project.templateId) return project.templateId === "amiq-tech";
    return project.theme === "tech";
  }

  function isFashionProject(project) {
    if (!project) return false;
    if (project.templateId) return project.templateId === "amiq-fashion";
    return project.theme === "fashion";
  }

  function isLuxProject(project) {
    if (!project) return false;
    if (project.templateId) return project.templateId === "amiq-lux";
    return project.theme === "lux";
  }

  function isEnterpriseProject(project) {
    if (!project) return false;
    if (project.templateId) return project.templateId === "amiq-enterprise";
    return project.theme === "enterprise";
  }

  function getLockedThemeForTemplate(templateId) {
    if (templateId === "amiq-fashion") return "fashion";
    if (templateId === "amiq-tech") return "tech";
    if (templateId === "amiq-lux") return "lux";
    if (templateId === "amiq-enterprise") return "enterprise";
    return null;
  }

  function getProjectTemplateKind(project) {
    if (isTechProject(project)) return "tech";
    if (isLuxProject(project)) return "lux";
    if (isFashionProject(project)) return "fashion";
    if (isEnterpriseProject(project)) return "enterprise";
    return "generic";
  }

  function defaultSectionVisibilityForProject(project) {
    if (isTechProject(project)) {
      return {
        announcement: true,
        hero: true,
        heroStats: true,
        trust: true,
        categories: true,
        deals: true,
        products: true,
        compare: true,
        faq: true,
        brands: true,
        about: true,
        newsletter: true
      };
    }
    if (isFashionProject(project)) {
      return {
        announcement: true,
        hero: true,
        trust: true,
        lookbook: true,
        products: true,
        about: true,
        newsletter: true
      };
    }
    if (isLuxProject(project)) {
      return {
        announcement: true,
        hero: true,
        trust: true,
        lookbook: true,
        products: true,
        luxStory: true,
        luxCraft: true,
        luxExperience: true,
        luxPress: true,
        about: true,
        newsletter: true
      };
    }
    if (isEnterpriseProject(project)) {
      return {
        announcement: true,
        hero: true,
        heroStats: true,
        trust: true,
        brandHub: true,
        entSolutions: true,
        entSegments: true,
        products: true,
        entCases: true,
        entPartners: true,
        entFaq: true,
        entPortal: true,
        about: true,
        newsletter: true
      };
    }
    return {
      announcement: true,
      hero: true,
      trust: true,
      products: true,
      about: true,
      newsletter: true
    };
  }

  function normalizeSectionVisibility(raw, project) {
    var defaults = defaultSectionVisibilityForProject(project || {});
    var vis = raw && typeof raw === "object" ? raw : {};
    var out = {};
    Object.keys(defaults).forEach(function (key) {
      out[key] = vis[key] !== false;
    });
    return out;
  }

  function getThemesForProject(project) {
    var locked = project && project.templateId ? getLockedThemeForTemplate(project.templateId) : null;
    if (locked) {
      return THEMES.filter(function (t) {
        return t.id === locked;
      });
    }
    return THEMES;
  }

  function getProjectTemplateLabel(project) {
    if (!project) return "Projekt";
    var tpl = AMIQ_TEMPLATES.find(function (t) {
      return t.id === project.templateId;
    });
    if (tpl) return tpl.name;
    var themeMeta = THEMES.find(function (t) {
      return t.id === project.theme;
    });
    return themeMeta ? themeMeta.label : "Sklep";
  }

  function uniqueProjectName(baseName) {
    var projects = getProjects();
    var name = baseName;
    var suffix = 2;
    while (
      projects.some(function (p) {
        return p.name === name;
      })
    ) {
      name = baseName + " " + suffix;
      suffix += 1;
    }
    return name;
  }

  function selectProject(id, options) {
    options = options || {};
    var project = getProjectById(id);
    if (!project) return;
    setActiveProject(id);
    renderAllPanels();
    if (options.openEditor) {
      closeModal();
      switchView(isFashionProject(project) ? "theme" : "editor");
      showToast("Otwarto edytor: " + project.name);
    } else if (!options.silent) {
      showToast("Aktywny projekt: " + project.name);
    }
  }

  function slugify(name) {
    return String(name || "sklep")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "sklep";
  }

  function normalizePanelPrefs(raw) {
    var n = raw && typeof raw === "object" ? raw : {};
    var notify = n.notifications && typeof n.notifications === "object" ? n.notifications : {};
    return {
      language: n.language === "en" ? "en" : "pl",
      timezone: n.timezone || "Europe/Warsaw",
      compactSidebar: !!n.compactSidebar,
      reducedMotion: !!n.reducedMotion,
      notifications: {
        newOrder: notify.newOrder !== false,
        lowStock: notify.lowStock !== false,
        payout: notify.payout !== false,
        weeklyDigest: !!notify.weeklyDigest,
        sound: !!notify.sound
      }
    };
  }

  function normalizeStoreSettings(raw, project) {
    var n = raw && typeof raw === "object" ? raw : {};
    var baseName = (project && (project.storeName || project.name)) || "Sklep";
    return {
      contactEmail: n.contactEmail || "",
      contactPhone: n.contactPhone || "",
      seoTitle: n.seoTitle || baseName,
      seoDescription: n.seoDescription || "",
      maintenanceMode: !!n.maintenanceMode,
      hideFromSearch: !!n.hideFromSearch,
      returnPolicy: n.returnPolicy || "",
      supportHours: n.supportHours || "Pn–Pt 9:00–17:00"
    };
  }

  function getPanelPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_PANEL_PREFS);
      return normalizePanelPrefs(raw ? JSON.parse(raw) : {});
    } catch (e) {
      return normalizePanelPrefs({});
    }
  }

  function savePanelPrefs(prefs) {
    var normalized = normalizePanelPrefs(prefs);
    try {
      localStorage.setItem(STORAGE_PANEL_PREFS, JSON.stringify(normalized));
    } catch (e2) {}
    applyPanelPrefs();
    return normalized;
  }

  function shouldNotify(type) {
    var prefs = getPanelPrefs();
    return !!(prefs.notifications && prefs.notifications[type]);
  }

  function applyPanelPrefs() {
    var prefs = getPanelPrefs();
    var shell = document.querySelector(".panel-shell");
    if (shell) shell.classList.toggle("is-compact-sidebar", prefs.compactSidebar);
    document.documentElement.classList.toggle("is-reduced-motion", prefs.reducedMotion);
    document.documentElement.lang = prefs.language === "en" ? "en" : "pl";
  }

  function writeSessionUser(user) {
    if (!user) return;
    var json = JSON.stringify(user);
    try {
      sessionStorage.setItem(STORAGE_USER, json);
      localStorage.setItem(STORAGE_USER, json);
    } catch (e) {}
  }

  function syncAccountMenuUser() {
    var user = readSessionUser();
    $all("[data-account-menu] .account-user__name").forEach(function (el) {
      if (user && user.name) el.textContent = user.name;
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function isSlugAvailable(slug, excludeProjectId) {
    return !getProjects().some(function (p) {
      return p.slug === slug && p.id !== excludeProjectId;
    });
  }

  function downloadJsonFile(filename, data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function canUseCustomDomain() {
    return planLevel(getCurrentPlan()) >= planLevel(DOMAIN_PLAN_REQUIRED);
  }

  function isCustomDomainPlanLocked() {
    return !canUseCustomDomain();
  }

  function getDomainPlanLabel() {
    return PLAN_LABELS[DOMAIN_PLAN_REQUIRED] || "Pro Seller";
  }

  function normalizeDomainInput(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/\.$/, "");
  }

  function isValidCustomDomain(hostname) {
    if (!hostname || hostname.length < 4 || hostname.length > 253) return false;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(hostname)) return false;
    if (/\.amiqplace\.pl$/i.test(hostname)) return false;
    return true;
  }

  function buildDomainVerificationToken(project) {
    var seed = project && project.id ? project.id.replace(/[^a-z0-9]/gi, "").slice(-8) : "demo";
    return "amiq-verify-" + seed + "-" + Math.random().toString(36).slice(2, 10);
  }

  function buildDomainDnsRecords(hostname, project, token) {
    if (!hostname) return [];
    var slug = project && project.slug ? project.slug : "sklep";
    var verify = token || buildDomainVerificationToken(project || {});
    return [
      {
        id: "cname-www",
        type: "CNAME",
        host: "www",
        value: slug + ".amiqplace.pl",
        ttl: 3600,
        purpose: "Adres www sklepu"
      },
      {
        id: "a-apex",
        type: "A",
        host: "@",
        value: DOMAIN_APEX_IP,
        ttl: 3600,
        purpose: "Domena główna (apex) — docelowo anycast CDN"
      },
      {
        id: "txt-verify",
        type: "TXT",
        host: "_amiqplace-verification",
        value: verify,
        ttl: 3600,
        purpose: "Potwierdzenie właściciela domeny"
      }
    ];
  }

  function normalizeCustomDomain(raw, project) {
    var n = raw && typeof raw === "object" ? raw : {};
    var hostname = normalizeDomainInput(n.hostname);
    var status = n.status || "not_connected";
    if (!hostname) status = "not_connected";
    if (hostname && status === "not_connected" && n.requestedAt) status = "pending_dns";
    if (["not_connected", "pending_dns", "verifying", "active", "error"].indexOf(status) === -1) status = "not_connected";
    var token = n.verificationToken || (hostname ? buildDomainVerificationToken(project || {}) : "");
    return {
      hostname: hostname,
      status: status,
      primary: !!(hostname && status === "active" && n.primary !== false),
      sslStatus: n.sslStatus || (status === "active" ? "active" : status === "verifying" ? "pending" : "none"),
      verificationToken: token,
      dnsRecords: Array.isArray(n.dnsRecords) && n.dnsRecords.length ? n.dnsRecords : buildDomainDnsRecords(hostname, project, token),
      requestedAt: n.requestedAt || null,
      connectedAt: n.connectedAt || null,
      lastCheckedAt: n.lastCheckedAt || null,
      errorMessage: n.errorMessage || null,
      wwwRedirect: n.wwwRedirect !== false
    };
  }

  function getCustomDomainMeta(project) {
    return normalizeCustomDomain(project && project.customDomain, project);
  }

  function getDefaultStoreUrl(project) {
    if (!project) return "sklep.amiqplace.pl";
    return (project.slug || "sklep") + ".amiqplace.pl";
  }

  function copyTextToClipboard(text, okMessage) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showToast(okMessage || "Skopiowano do schowka.");
        })
        .catch(function () {
          showToast("Skopiuj ręcznie: " + text);
        });
    } else {
      showToast("Skopiuj ręcznie: " + text);
    }
  }

  function getDefaultCheckout() {
    var sf = storefrontApi();
    if (sf && sf.getDefaultStoreCheckout) {
      var base = JSON.parse(JSON.stringify(sf.getDefaultStoreCheckout()));
      base.payments.configured = false;
      base.shipping.configured = false;
      base.payments.enabled = ["transfer"];
      base.payments.primary = "transfer";
      base.shipping.methods.forEach(function (m) {
        m.enabled = false;
      });
      return base;
    }
    return {
      payments: {
        enabled: ["transfer"],
        primary: "transfer",
        bankAccount: "PL 00 0000 0000 0000 0000 0000 0000",
        codFee: 5,
        demoMode: true,
        configured: false
      },
      shipping: { methods: [], freeFrom: 150, configured: false }
    };
  }

  function normalizeCheckout(raw) {
    var sf = storefrontApi();
    if (sf && sf.normalizeStoreCheckout) {
      var checkout = sf.normalizeStoreCheckout(raw);
      if (!raw || !raw.payments) checkout.payments.configured = false;
      if (!raw || !raw.shipping) checkout.shipping.configured = false;
      return checkout;
    }
    return getDefaultCheckout();
  }

  function getDefaultWallet() {
    return {
      currency: "PLN",
      stripeAccountId: null,
      stripeStatus: "not_connected",
      stripeConnectedAt: null,
      payoutSchedule: "weekly",
      payoutMinimum: 50,
      reservePercent: null,
      bankAccount: {
        holder: "",
        iban: "",
        last4: "",
        verified: false
      },
      taxId: "",
      companyName: "",
      pendingPayoutAmount: 0,
      lifetimePayouts: 0,
      payouts: [],
      manualAdjustments: []
    };
  }

  function normalizeWallet(raw) {
    var defaults = getDefaultWallet();
    if (!raw) return defaults;
    return {
      currency: raw.currency || defaults.currency,
      stripeAccountId: raw.stripeAccountId || null,
      stripeStatus: raw.stripeStatus || defaults.stripeStatus,
      stripeConnectedAt: raw.stripeConnectedAt || null,
      payoutSchedule: raw.payoutSchedule || defaults.payoutSchedule,
      payoutMinimum: typeof raw.payoutMinimum === "number" ? raw.payoutMinimum : defaults.payoutMinimum,
      reservePercent: typeof raw.reservePercent === "number" ? raw.reservePercent : null,
      bankAccount: Object.assign({}, defaults.bankAccount, raw.bankAccount || {}),
      taxId: raw.taxId || "",
      companyName: raw.companyName || "",
      pendingPayoutAmount: typeof raw.pendingPayoutAmount === "number" ? raw.pendingPayoutAmount : 0,
      lifetimePayouts: typeof raw.lifetimePayouts === "number" ? raw.lifetimePayouts : 0,
      payouts: Array.isArray(raw.payouts) ? raw.payouts : [],
      manualAdjustments: Array.isArray(raw.manualAdjustments) ? raw.manualAdjustments : []
    };
  }

  function getWalletFeeConfig() {
    return WALLET_PLATFORM_FEES[getCurrentPlan()] || WALLET_PLATFORM_FEES.trial;
  }

  function getWalletReserveRate(project) {
    var wallet = project.wallet || getDefaultWallet();
    if (typeof wallet.reservePercent === "number") return wallet.reservePercent;
    return WALLET_RESERVE_BY_PLAN[getCurrentPlan()] != null ? WALLET_RESERVE_BY_PLAN[getCurrentPlan()] : 0.1;
  }

  function calcOrderNetAmount(order, feeConfig) {
    var gross = Number(order.total) || 0;
    return Math.max(0, gross - gross * feeConfig.percent - feeConfig.fixed);
  }

  function computeWalletSummary(project) {
    if (!project) return null;
    var wallet = normalizeWallet(project.wallet);
    var feeConfig = getWalletFeeConfig();
    var reserveRate = getWalletReserveRate(project);
    var orders = (project.orders || []).slice();
    var now = Date.now();

    var gross = 0;
    var fees = 0;
    var pendingHold = 0;
    var netTotal = 0;

    orders.forEach(function (order) {
      var orderGross = Number(order.total) || 0;
      var orderFee = orderGross * feeConfig.percent + feeConfig.fixed;
      var orderNet = Math.max(0, orderGross - orderFee);
      gross += orderGross;
      fees += orderFee;
      netTotal += orderNet;
      var age = now - (order.createdAt || now);
      if ((order.status === "new" || order.status === "processing") && age < WALLET_HOLD_MS) {
        pendingHold += orderNet;
      }
    });

    var reserve = netTotal * reserveRate;
    var pendingPayouts = wallet.pendingPayoutAmount || 0;
    var available = Math.max(0, netTotal - pendingHold - reserve - pendingPayouts);
    var lifetimePaid =
      wallet.lifetimePayouts ||
      (wallet.payouts || []).reduce(function (sum, p) {
        return sum + (p.status === "paid" ? Number(p.amount) || 0 : 0);
      }, 0);

    return {
      wallet: wallet,
      feeConfig: feeConfig,
      reserveRate: reserveRate,
      gross: gross,
      fees: fees,
      netTotal: netTotal,
      pendingHold: pendingHold,
      reserve: reserve,
      available: available,
      pendingPayouts: pendingPayouts,
      lifetimePaid: lifetimePaid,
      ordersCount: orders.length,
      currency: wallet.currency || "PLN"
    };
  }

  function buildWalletLedger(project, summary) {
    var feeConfig = summary.feeConfig;
    var entries = [];

    (project.orders || []).forEach(function (order) {
      var gross = Number(order.total) || 0;
      var fee = gross * feeConfig.percent + feeConfig.fixed;
      var net = Math.max(0, gross - fee);
      entries.push({
        id: "led_sale_" + order.id,
        type: "sale",
        label: "Sprzedaż " + (order.number || ""),
        sub: order.productName || order.customer || "",
        amount: net,
        gross: gross,
        fee: fee,
        ts: order.createdAt || Date.now(),
        status: order.status
      });
      if (fee > 0) {
        entries.push({
          id: "led_fee_" + order.id,
          type: "fee",
          label: "Prowizja AmiQPlace",
          sub: order.number || "",
          amount: -fee,
          ts: (order.createdAt || Date.now()) + 1
        });
      }
    });

    (summary.wallet.payouts || []).forEach(function (payout) {
      entries.push({
        id: "led_payout_" + payout.id,
        type: "payout",
        label: "Wypłata na konto",
        sub: payout.reference || payout.status || "",
        amount: -(Number(payout.amount) || 0),
        ts: payout.createdAt || Date.now(),
        status: payout.status
      });
    });

    (summary.wallet.manualAdjustments || []).forEach(function (adj) {
      entries.push({
        id: "led_adj_" + adj.id,
        type: adj.type || "adjustment",
        label: adj.label || "Korekta",
        sub: adj.note || "",
        amount: Number(adj.amount) || 0,
        ts: adj.ts || Date.now()
      });
    });

    return entries.sort(function (a, b) {
      return b.ts - a.ts;
    });
  }

  function formatWalletScheduleLabel(value) {
    return (
      { daily: "Codziennie", weekly: "Co tydzień (wtorek)", monthly: "Co miesiąc", manual: "Ręcznie" }[value] ||
      value
    );
  }

  function maskIban(iban) {
    var compact = String(iban || "").replace(/\s/g, "").toUpperCase();
    if (compact.length < 8) return compact || "—";
    return compact.slice(0, 2) + " •••• •••• •••• " + compact.slice(-4);
  }

  function updateWalletNavBadge(project) {
    var badge = $("[data-wallet-nav-balance]");
    if (!badge) return;
    if (!project) {
      badge.hidden = true;
      return;
    }
    var summary = computeWalletSummary(project);
    if (!summary || summary.available <= 0) {
      badge.hidden = true;
      return;
    }
    badge.hidden = false;
    badge.textContent = formatPrice(summary.available);
  }

  function saveWalletSettingsFromDOM() {
    var project = getActiveProject();
    if (!project) return null;
    var wallet = normalizeWallet(project.wallet);
    var holder = $("[data-wallet-bank-holder]");
    var iban = $("[data-wallet-bank-iban]");
    var taxId = $("[data-wallet-tax-id]");
    var company = $("[data-wallet-company]");
    var schedule = $("[data-wallet-payout-schedule]");
    var minimum = $("[data-wallet-payout-minimum]");
    if (holder) wallet.bankAccount.holder = holder.value.trim();
    if (iban) {
      wallet.bankAccount.iban = iban.value.trim();
      var compact = wallet.bankAccount.iban.replace(/\s/g, "");
      wallet.bankAccount.last4 = compact.length >= 4 ? compact.slice(-4) : "";
    }
    if (taxId) wallet.taxId = taxId.value.trim();
    if (company) wallet.companyName = company.value.trim();
    if (schedule) wallet.payoutSchedule = schedule.value || wallet.payoutSchedule;
    if (minimum) wallet.payoutMinimum = Math.max(0, parseFloat(minimum.value) || wallet.payoutMinimum);
    return updateProject(project.id, { wallet: wallet });
  }

  function connectStripeWallet() {
    var project = getActiveProject();
    if (!project) return;
    var wallet = normalizeWallet(project.wallet);
    if (wallet.stripeStatus === "active") {
      showToast("Konto Stripe Connect jest już aktywne.");
      return;
    }
    wallet.stripeStatus = "pending";
    wallet.stripeConnectedAt = Date.now();
    updateProject(project.id, { wallet: wallet });
    pushActivity(project.id, "Rozpoczęto podłączanie Stripe Connect (demo)");
    refreshUI();
    showToast("Tryb demo: rozpoczęto onboarding Stripe Connect. Po wdrożeniu API przekierujemy do weryfikacji KYC.");
  }

  function simulateStripeActivation() {
    var project = getActiveProject();
    if (!project) return;
    var wallet = normalizeWallet(project.wallet);
    if (wallet.stripeStatus === "not_connected") {
      showToast("Najpierw kliknij „Podłącz Stripe”.");
      return;
    }
    wallet.stripeStatus = "active";
    wallet.stripeAccountId = wallet.stripeAccountId || "acct_demo_" + project.id.slice(-8);
    updateProject(project.id, { wallet: wallet });
    pushActivity(project.id, "Aktywowano konto Stripe Connect (demo)");
    refreshUI();
    showToast("Konto Stripe aktywne (demo) — możesz testować wypłaty.");
  }

  function requestWalletPayout() {
    var project = getActiveProject();
    if (!project) return;
    var wallet = normalizeWallet(project.wallet);
    var summary = computeWalletSummary(project);
    if (wallet.stripeStatus !== "active") {
      showToast("Podłącz i aktywuj Stripe Connect, aby wypłacać środki.");
      return;
    }
    if (!wallet.bankAccount.iban || wallet.bankAccount.iban.replace(/\s/g, "").length < 10) {
      showToast("Uzupełnij numer konta w ustawieniach wypłat.");
      return;
    }
    if (summary.available < wallet.payoutMinimum) {
      showToast("Minimalna wypłata to " + formatPrice(wallet.payoutMinimum) + ".");
      return;
    }
    var amount = summary.available;
    var payout = {
      id: uid("pay"),
      amount: amount,
      currency: wallet.currency,
      status: "pending",
      reference: "PO-" + String((wallet.payouts || []).length + 1).padStart(4, "0"),
      destination: maskIban(wallet.bankAccount.iban),
      createdAt: Date.now(),
      expectedAt: Date.now() + 2 * 24 * 60 * 60 * 1000
    };
    wallet.payouts = [payout].concat(wallet.payouts || []);
    wallet.pendingPayoutAmount = (wallet.pendingPayoutAmount || 0) + amount;
    updateProject(project.id, { wallet: wallet });
    pushActivity(project.id, "Zlecono wypłatę " + formatPrice(amount) + " (demo)");
    refreshUI();
    showToast("Wypłata " + formatPrice(amount) + " zlecona — w produkcji obsłuży Stripe Payouts.");
  }

  function getPluginCategoryLabel(categoryId) {
    var cat = PLUGIN_CATEGORIES.find(function (c) {
      return c.id === categoryId;
    });
    return cat ? cat.label : categoryId;
  }

  function getProjectInstalledPlugins(project) {
    if (!project) return [];
    return Array.isArray(project.installedPlugins) ? project.installedPlugins.slice() : [];
  }

  function isPluginInstalled(project, pluginId) {
    return getProjectInstalledPlugins(project).indexOf(pluginId) !== -1;
  }

  function isPluginUnlocked(plugin) {
    if (!plugin || !plugin.tier) return true;
    var order = ["trial", "starter", "biznes", "pro-seller", "professional"];
    var userIdx = order.indexOf(getCurrentPlan());
    var needIdx = order.indexOf(plugin.tier);
    if (userIdx === -1) userIdx = 0;
    if (needIdx === -1) return true;
    return userIdx >= needIdx;
  }

  function pluginMatchesFilters(plugin, query, sourceFilter, categoryFilter) {
    if (sourceFilter === "amiq" && plugin.source !== "amiq") return false;
    if (sourceFilter === "partner" && plugin.source !== "partner") return false;
    if (categoryFilter !== "all" && plugin.category !== categoryFilter) return false;
    if (!query) return true;
    var hay = [
      plugin.name,
      plugin.desc,
      plugin.provider || "",
      plugin.category,
      getPluginCategoryLabel(plugin.category),
      plugin.source === "amiq" ? "amiqplace" : "partner",
      (plugin.tags || []).join(" ")
    ]
      .join(" ")
      .toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  function filterPluginCatalog() {
    var q = pluginsSearchQuery.trim().toLowerCase();
    return PLUGIN_CATALOG.filter(function (plugin) {
      return pluginMatchesFilters(plugin, q, pluginsSourceFilter, pluginsCategoryFilter);
    });
  }

  function togglePluginInstall(pluginId) {
    var project = getActiveProject();
    if (!project) {
      showToast("Wybierz aktywny sklep, aby instalować wtyczki.");
      openModal(getProjects().length ? "mine" : "create");
      return;
    }
    var plugin = PLUGIN_CATALOG.find(function (p) {
      return p.id === pluginId;
    });
    if (!plugin) return;
    if (!isPluginUnlocked(plugin)) {
      showToast("Ta wtyczka wymaga planu " + (PLAN_LABELS[plugin.tier] || plugin.tier) + ".");
      return;
    }
    var installed = getProjectInstalledPlugins(project);
    var on = installed.indexOf(pluginId) !== -1;
    if (on) {
      installed = installed.filter(function (id) {
        return id !== pluginId;
      });
      updateProject(project.id, { installedPlugins: installed });
      pushActivity(project.id, "Wyłączono wtyczkę: " + plugin.name);
      showToast("Wyłączono „" + plugin.name + "”.");
    } else {
      installed.unshift(pluginId);
      updateProject(project.id, { installedPlugins: installed });
      pushActivity(project.id, "Aktywowano wtyczkę: " + plugin.name);
      renderPlugins();
      if (plugin.hasApp) {
        showToast("Aktywowano „" + plugin.name + "” — otwieram wtyczkę…");
        window.setTimeout(function () {
          openPluginApp(pluginId);
        }, 120);
      } else {
        showToast("Aktywowano „" + plugin.name + "”.");
      }
      return;
    }
    renderPlugins();
  }

  function renderPlugins() {
    var root = $("[data-plugins-root]");
    if (!root) return;
    var project = getActiveProject();
    var grid = $("[data-plugins-grid]");
    var empty = $("[data-plugins-empty]");
    var countEl = $("[data-plugins-count]");
    var hint = $("[data-plugins-project-hint]");
    var categoriesEl = $("[data-plugins-categories]");
    var list = filterPluginCatalog();

    if (categoriesEl && !categoriesEl.dataset.rendered) {
      categoriesEl.innerHTML = PLUGIN_CATEGORIES.map(function (cat) {
        return (
          '<button type="button" class="panel-plugins-chip' +
          (pluginsCategoryFilter === cat.id ? " is-active" : "") +
          '" data-plugins-category="' +
          escapeHtml(cat.id) +
          '">' +
          escapeHtml(cat.label) +
          "</button>"
        );
      }).join("");
      categoriesEl.dataset.rendered = "1";
    } else if (categoriesEl) {
      $all("[data-plugins-category]", categoriesEl).forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-plugins-category") === pluginsCategoryFilter);
      });
    }

    $all("[data-plugins-source]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-plugins-source") === pluginsSourceFilter);
    });

    if (hint) hint.hidden = !project;
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " wtyczka" : list.length >= 2 && list.length <= 4 ? " wtyczki" : " wtyczek");

    if (!grid || !empty) return;

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    grid.innerHTML = list
      .map(function (plugin) {
        var unlocked = isPluginUnlocked(plugin);
        var installed = isPluginInstalled(project, plugin.id);
        var sourceLabel = plugin.source === "amiq" ? "AmiQPlace" : plugin.provider || "Partner";
        var categoryLabel = getPluginCategoryLabel(plugin.category);
        return (
          '<article class="panel-plugin-card' +
          (installed ? " is-installed" : "") +
          (unlocked ? "" : " is-locked") +
          '">' +
          '<div class="panel-plugin-card__top">' +
          '<span class="panel-plugin-card__icon"><i class="' +
          (String(plugin.icon).indexOf("fa-brands") === 0 ? plugin.icon : "fas " + plugin.icon) +
          '" aria-hidden="true"></i></span>' +
          '<div class="panel-plugin-card__badges">' +
          '<span class="panel-plugin-card__source panel-plugin-card__source--' +
          escapeHtml(plugin.source) +
          '">' +
          escapeHtml(sourceLabel) +
          "</span>" +
          '<span class="panel-plugin-card__cat">' +
          escapeHtml(categoryLabel) +
          "</span></div></div>" +
          "<h3>" +
          escapeHtml(plugin.name) +
          "</h3>" +
          "<p>" +
          escapeHtml(plugin.desc) +
          "</p>" +
          '<div class="panel-plugin-card__foot">' +
          (unlocked && installed && plugin.hasApp
            ? '<button type="button" class="panel-plugin-card__btn is-open" data-plugin-open="' +
              escapeHtml(plugin.id) +
              '"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Otwórz</button>'
            : "") +
          (unlocked
            ? '<button type="button" class="panel-plugin-card__btn' +
              (installed ? " is-on" : "") +
              '" data-plugin-install="' +
              escapeHtml(plugin.id) +
              '">' +
              (installed ? '<i class="fas fa-check" aria-hidden="true"></i> Aktywna' : '<i class="fas fa-plus" aria-hidden="true"></i> Aktywuj') +
              "</button>"
            : '<a href="plany.html" class="panel-plugin-card__lock">Plan ' + escapeHtml(PLAN_LABELS[plugin.tier] || plugin.tier) + "+</a>") +
          "</div></article>"
        );
      })
      .join("");
  }

  function openPluginApp(pluginId) {
    var project = getActiveProject();
    if (!project) {
      showToast("Wybierz aktywny sklep, aby otworzyć wtyczkę.");
      openModal(getProjects().length ? "mine" : "create");
      return;
    }
    if (pluginId !== "amiq-dropship-ai") {
      showToast("Ta wtyczka nie ma jeszcze interfejsu w panelu.");
      return;
    }
    if (!isPluginInstalled(project, pluginId)) {
      showToast("Najpierw aktywuj wtyczkę.");
      switchView("plugins");
      return;
    }
    activePluginAppId = pluginId;
    switchView("plugin-app");
  }

  function closePluginApp() {
    unmountPluginApp();
    switchView("plugins");
  }

  function unmountPluginApp() {
    activePluginAppId = null;
    if (window.AmiqDropshipAi && window.AmiqDropshipAi.unmount) {
      var mount = $("[data-plugin-app-mount]");
      if (mount) window.AmiqDropshipAi.unmount(mount);
    }
  }

  function renderPluginApp() {
    var mount = $("[data-plugin-app-mount]");
    if (!mount || activePluginAppId !== "amiq-dropship-ai") return;
    var project = getActiveProject();
    if (!window.AmiqDropshipAi || !window.AmiqDropshipAi.mount) {
      mount.innerHTML =
        '<div class="panel-editor__empty"><div class="panel-editor__empty-icon"><i class="fas fa-robot" aria-hidden="true"></i></div><strong>Nie wczytano modułu Dropshipping AI</strong><p>Odśwież stronę (F5). Jeśli problem zostaje, sprawdź czy plik <code>plugins/dropship-ai/frontend/dropship-ai.js</code> jest dostępny.</p></div>';
      return;
    }
    try {
      window.AmiqDropshipAi.mount(mount, {
        projectId: project ? project.id : null,
        projectName: project ? project.name : "Sklep",
        apiBase: (window.AmiqDropshipAiConfig && window.AmiqDropshipAiConfig.apiBase) || window.AmiqDropshipAi.DEFAULT_API,
        onBack: closePluginApp,
        onToast: showToast,
        onAddProduct: addProductFromDropshipCalc,
        onCreateStore: launchDropshipWizardStore
      });
    } catch (err) {
      mount.innerHTML =
        '<div class="panel-editor__empty"><strong>Błąd wtyczki</strong><p>' + escapeHtml(err.message || "Nie udało się uruchomić Dropshipping AI.") + "</p></div>";
    }
  }

  function addProductFromDropshipCalc(calc, options) {
    options = options || {};
    var project = getActiveProject();
    if (!project || !calc) return;
    if (!canAddProduct(project, true)) {
      showToast(getLimitMessage("product"));
      return;
    }
    var products = (project.products || []).slice();
    products.unshift({
      id: uid("prod"),
      name: calc.productName || "Produkt dropshipping",
      price: calc.suggestedPrice || calc.suggested_price || 0,
      stock: 99,
      status: "active",
      desc: "Dodano z Dropshipping AI · koszt " + formatPrice(calc.productCost || 0),
      sku: "",
      updatedAt: Date.now()
    });
    updateProject(project.id, { products: products });
    syncChecklistAuto(getProjectById(project.id));
    pushActivity(project.id, "Dodano produkt z wtyczki Dropshipping AI");
    showToast("Produkt „" + (calc.productName || "Produkt") + "” dodany do sklepu.");
    refreshUI();
    if (options.navigate !== false) switchView("products");
  }

  function launchDropshipWizardStore(wizard) {
    if (!wizard || !wizard.storeName) {
      showToast("Uzupełnij dane kreatora.");
      return;
    }
    if (!canCreateProject()) {
      showToast(getLimitMessage("project"));
      return;
    }
    var templateId = wizard.templateId === "blank" ? null : wizard.templateId;
    var thumb = wizard.templateId === "amiq-tech" ? "tech" : wizard.templateId === "amiq-fashion" ? "fashion" : "blank";
    var project;
    if (templateId && templateId !== "blank") {
      var template = AMIQ_TEMPLATES.find(function (t) {
        return t.id === templateId;
      });
      if (template && canAccessTemplate(template, getCurrentPlan()) && !isTemplateComingSoon(template)) {
        project = createProject({
          name: uniqueProjectName(wizard.storeName),
          source: "template",
          templateId: template.id,
          thumb: template.thumb,
          theme: template.thumb,
          defaults: storefrontApi() ? storefrontApi().getTemplateDefaults(template.id) : null
        });
      }
    }
    if (!project) {
      project = createProject({
        name: uniqueProjectName(wizard.storeName),
        source: "blank",
        thumb: "blank",
        theme: "blank"
      });
    }
    if (!project) return;
    var patch = {
      storeName: wizard.storeName,
      heroTitle: wizard.storeName,
      heroSubtitle: wizard.tagline || wizard.niche || "Sklep dropshippingowy na AmiQPlace",
      installedPlugins: getProjectInstalledPlugins(project).concat(["amiq-dropship-ai"]).filter(function (v, i, a) {
        return a.indexOf(v) === i;
      })
    };
    updateProject(project.id, patch);
    setActiveProject(project.id);
    project = getProjectById(project.id);
    var snap = wizard.marginSnapshot || (window.AmiqDropshipAi ? window.AmiqDropshipAi.computeMargin(wizard) : null);
    if (snap && !snap.error && wizard.productName) {
      addProductFromDropshipCalc(
        Object.assign({}, wizard, snap, { productName: wizard.productName }),
        { navigate: false }
      );
      pushActivity(project.id, "Uruchomiono sklep przez Dropshipping AI Quick Store");
    }
    unmountPluginApp();
    switchView("editor");
    showToast("Sklep „" + wizard.storeName + "” gotowy — edytuj wygląd i opublikuj.");
  }

  function renderWallet() {
    var project = getActiveProject();
    var empty = $("[data-wallet-empty]");
    var layout = $("[data-wallet-layout]");
    var content = $("[data-wallet-content]");
    if (!empty || !layout || !content) return;

    updateWalletNavBadge(project);

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;

    var summary = computeWalletSummary(project);
    var wallet = summary.wallet;
    var stripeMeta = STRIPE_STATUS_META[wallet.stripeStatus] || STRIPE_STATUS_META.not_connected;
    var ledger = buildWalletLedger(project, summary);
    var filteredLedger = ledger.filter(function (entry) {
      if (walletLedgerFilter === "all") return true;
      if (walletLedgerFilter === "sales") return entry.type === "sale";
      if (walletLedgerFilter === "payouts") return entry.type === "payout";
      if (walletLedgerFilter === "fees") return entry.type === "fee";
      return true;
    });

    var payouts = (wallet.payouts || []).slice();

    content.innerHTML =
      '<header class="panel-products-view__head panel-wallet-head">' +
      '<div><span class="panel-eyebrow"><i class="fas fa-wallet" aria-hidden="true"></i> Finanse sklepu</span>' +
      "<h1>Portfel — <span>" +
      escapeHtml(project.name) +
      "</span></h1>" +
      "<p>Saldo ze sprzedaży, prowizje platformy i wypłaty na konto. Integracja ze Stripe Connect — przygotowana pod produkcję.</p></div>" +
      '<div class="panel-products-view__actions">' +
      '<button type="button" class="panel-ghost-btn" data-wallet-export-ledger><i class="fas fa-file-csv" aria-hidden="true"></i> Eksport historii</button>' +
      '<button type="button" class="panel-primary-btn" data-wallet-request-payout' +
      (wallet.stripeStatus === "active" && summary.available >= wallet.payoutMinimum ? "" : " disabled") +
      '><i class="fas fa-money-bill-transfer" aria-hidden="true"></i> Wypłać teraz</button></div></header>' +
      '<section class="panel-wallet-kpis">' +
      '<article class="panel-wallet-kpi panel-wallet-kpi--primary"><span>Dostępne do wypłaty</span><strong>' +
      escapeHtml(formatPrice(summary.available)) +
      '</strong><small>Po rezerwie i oczekujących rozliczeniach</small></article>' +
      '<article class="panel-wallet-kpi"><span>W trakcie rozliczenia</span><strong>' +
      escapeHtml(formatPrice(summary.pendingHold)) +
      '</strong><small>Nowe zamówienia · ok. 3 dni</small></article>' +
      '<article class="panel-wallet-kpi"><span>Rezerwa rolling</span><strong>' +
      escapeHtml(formatPrice(summary.reserve)) +
      "</strong><small>" +
      Math.round(summary.reserveRate * 100) +
      "% · zabezpieczenie chargeback</small></article>" +
      '<article class="panel-wallet-kpi"><span>Wypłacono łącznie</span><strong>' +
      escapeHtml(formatPrice(summary.lifetimePaid)) +
      '</strong><small>Historia wypłat na konto</small></article></section>' +
      '<section class="panel-wallet-stripe panel-wallet-stripe--' +
      stripeMeta.tone +
      '">' +
      '<div class="panel-wallet-stripe__icon"><i class="fab fa-stripe" aria-hidden="true"></i></div>' +
      "<div><div class=\"panel-wallet-stripe__head\"><strong>Stripe Connect</strong><span class=\"panel-wallet-stripe__status\"><i class=\"fas " +
      stripeMeta.icon +
      '" aria-hidden="true"></i> ' +
      escapeHtml(stripeMeta.label) +
      "</span></div>" +
      (wallet.stripeStatus === "not_connected"
        ? "<p>Podłącz konto Stripe, aby przyjmować płatności kartą i wypłacać zarobki na konto bankowe. W produkcji użyjemy Stripe Connect Express z onboardingiem KYC.</p>"
        : wallet.stripeStatus === "pending"
          ? "<p>Trwa weryfikacja tożsamości i danych firmy. Uzupełnij brakujące dokumenty w panelu Stripe (docelowo).</p>"
          : wallet.stripeStatus === "active"
            ? "<p>Konto aktywne" +
              (wallet.stripeAccountId ? " · ID: " + escapeHtml(wallet.stripeAccountId) : "") +
              ". Wypłaty realizowane automatycznie wg harmonogramu.</p>"
            : "<p>Konto Stripe wymaga uwagi — skontaktuj się z supportem AmiQPlace.</p>") +
      '<ul class="panel-wallet-stripe__steps">' +
      '<li class="' +
      (wallet.stripeStatus !== "not_connected" ? "is-done" : "is-active") +
      '"><i class="fas fa-link" aria-hidden="true"></i> Połączenie konta</li>' +
      '<li class="' +
      (wallet.stripeStatus === "pending" || wallet.stripeStatus === "active" ? "is-done" : "") +
      (wallet.stripeStatus === "pending" ? " is-active" : "") +
      '"><i class="fas fa-id-card" aria-hidden="true"></i> Weryfikacja KYC</li>' +
      '<li class="' +
      (wallet.stripeStatus === "active" ? "is-done is-active" : "") +
      '"><i class="fas fa-money-bill-transfer" aria-hidden="true"></i> Wypłaty włączone</li></ul></div>' +
      '<div class="panel-wallet-stripe__actions">' +
      (wallet.stripeStatus === "not_connected"
        ? '<button type="button" class="panel-primary-btn" data-wallet-connect-stripe><i class="fab fa-stripe" aria-hidden="true"></i> Podłącz Stripe</button>'
        : wallet.stripeStatus === "pending"
          ? '<button type="button" class="panel-ghost-btn" data-wallet-simulate-stripe>Dokończ weryfikację (demo)</button>'
          : '<button type="button" class="panel-ghost-btn" data-wallet-manage-stripe>Zarządzaj w Stripe</button>') +
      "</div></section>" +
      '<div class="panel-wallet-grid">' +
      '<section class="panel-card panel-wallet-card">' +
      '<div class="panel-card__head"><div><h2>Historia operacji</h2><p>Przychody, prowizje i wypłaty powiązane ze sklepem.</p></div></div>' +
      '<div class="panel-card__body">' +
      '<div class="panel-orders-tabs panel-wallet-tabs" role="tablist">' +
      ["all", "sales", "fees", "payouts"]
        .map(function (key) {
          var labels = { all: "Wszystko", sales: "Sprzedaż", fees: "Prowizje", payouts: "Wypłaty" };
          return (
            '<button type="button" class="' +
            (walletLedgerFilter === key ? "is-active" : "") +
            '" data-wallet-ledger-filter="' +
            key +
            '">' +
            labels[key] +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      (filteredLedger.length
        ? '<div class="panel-wallet-ledger">' +
          filteredLedger
            .slice(0, 25)
            .map(function (entry) {
              var icon =
                entry.type === "sale"
                  ? "fa-arrow-trend-up"
                  : entry.type === "payout"
                    ? "fa-money-bill-transfer"
                    : entry.type === "fee"
                      ? "fa-percent"
                      : "fa-sliders";
              return (
                '<article class="panel-wallet-ledger__row panel-wallet-ledger__row--' +
                escapeHtml(entry.type) +
                '">' +
                '<span class="panel-wallet-ledger__icon"><i class="fas ' +
                icon +
                '" aria-hidden="true"></i></span>' +
                "<div><strong>" +
                escapeHtml(entry.label) +
                "</strong><small>" +
                escapeHtml(entry.sub || "") +
                " · " +
                escapeHtml(formatPublishedAt(entry.ts) || new Date(entry.ts).toLocaleDateString("pl-PL")) +
                "</small></div>" +
                '<span class="panel-wallet-ledger__amount' +
                (entry.amount < 0 ? " is-negative" : " is-positive") +
                '">' +
                (entry.amount >= 0 ? "+" : "") +
                escapeHtml(formatPrice(Math.abs(entry.amount))) +
                "</span></article>"
              );
            })
            .join("") +
          "</div>"
        : '<div class="panel-modal__empty"><strong>Brak operacji</strong>Symuluj zamówienia lub podłącz płatności, aby zobaczyć historię.</div>') +
      "</div></section>" +
      '<section class="panel-card panel-wallet-card">' +
      '<div class="panel-card__head"><div><h2>Ustawienia wypłat</h2><p>Dane rozliczeniowe przekazane do Stripe przy wypłacie.</p></div></div>' +
      '<div class="panel-card__body panel-wallet-settings">' +
      '<label class="panel-field"><span>Nazwa firmy / sprzedawcy</span><input type="text" data-wallet-company maxlength="120" placeholder="np. Twoja Marka Sp. z o.o." value="' +
      escapeHtml(wallet.companyName || "") +
      '"></label>' +
      '<label class="panel-field"><span>NIP (rozliczenia PL)</span><input type="text" data-wallet-tax-id maxlength="13" placeholder="np. 1234567890" value="' +
      escapeHtml(wallet.taxId || "") +
      '"></label>' +
      '<label class="panel-field"><span>Właściciel rachunku</span><input type="text" data-wallet-bank-holder maxlength="80" placeholder="Imię i nazwisko lub nazwa firmy" value="' +
      escapeHtml(wallet.bankAccount.holder || "") +
      '"></label>' +
      '<label class="panel-field panel-field--full"><span>Numer konta (IBAN)</span><input type="text" data-wallet-bank-iban maxlength="34" placeholder="PL XX XXXX XXXX XXXX XXXX XXXX XXXX" value="' +
      escapeHtml(wallet.bankAccount.iban || "") +
      '"></label>' +
      '<div class="panel-form-row">' +
      '<label class="panel-field"><span>Harmonogram wypłat</span><select data-wallet-payout-schedule>' +
      ["daily", "weekly", "monthly", "manual"]
        .map(function (opt) {
          return (
            '<option value="' +
            opt +
            '"' +
            (wallet.payoutSchedule === opt ? " selected" : "") +
            ">" +
            escapeHtml(formatWalletScheduleLabel(opt)) +
            "</option>"
          );
        })
        .join("") +
      "</select></label>" +
      '<label class="panel-field"><span>Minimalna wypłata (zł)</span><input type="number" min="10" step="1" data-wallet-payout-minimum value="' +
      escapeHtml(String(wallet.payoutMinimum || 50)) +
      '"></label></div>' +
      '<div class="panel-wallet-fee-box">' +
      '<strong>Prowizja AmiQPlace · plan ' +
      escapeHtml(PLAN_LABELS[getCurrentPlan()] || "Trial") +
      "</strong>" +
      "<p>" +
      escapeHtml(summary.feeConfig.label) +
      " od transakcji · Stripe pobiera osobną opłatę za przetwarzanie (docelowo).</p>" +
      "<ul><li>Przychód brutto: <strong>" +
      escapeHtml(formatPrice(summary.gross)) +
      "</strong></li>" +
      "<li>Prowizje platformy: <strong>" +
      escapeHtml(formatPrice(summary.fees)) +
      "</strong></li>" +
      "<li>Netto po prowizjach: <strong>" +
      escapeHtml(formatPrice(summary.netTotal)) +
      "</strong></li></ul></div>" +
      '<button type="button" class="panel-primary-btn" data-wallet-save-settings><i class="fas fa-floppy-disk" aria-hidden="true"></i> Zapisz ustawienia wypłat</button>' +
      "</div></section></div>" +
      '<section class="panel-card">' +
      '<div class="panel-card__head"><div><h2>Historia wypłat</h2><p>Status transferów na konto bankowe.</p></div></div>' +
      '<div class="panel-card__body">' +
      (payouts.length
        ? '<div class="panel-wallet-payouts">' +
          payouts
            .map(function (p) {
              var statusLabel = { pending: "Oczekuje", paid: "Wypłacono", failed: "Błąd" }[p.status] || p.status;
              return (
                '<article class="panel-wallet-payout panel-wallet-payout--' +
                escapeHtml(p.status) +
                '">' +
                "<div><strong>" +
                escapeHtml(formatPrice(p.amount)) +
                "</strong><small>" +
                escapeHtml(p.reference || "") +
                " · " +
                escapeHtml(p.destination || "") +
                "</small></div>" +
                '<span class="panel-wallet-payout__status">' +
                escapeHtml(statusLabel) +
                "</span>" +
                "<span class=\"panel-wallet-payout__date\">" +
                escapeHtml(formatPublishedAt(p.createdAt) || "") +
                "</span></article>"
              );
            })
            .join("") +
          "</div>"
        : '<div class="panel-modal__empty"><strong>Brak wypłat</strong>Po podłączeniu Stripe i zebraniu minimum ' +
          escapeHtml(formatPrice(wallet.payoutMinimum)) +
          " będziesz mógł zlecić pierwszą wypłatę.</div>") +
      "</div></section>";
  }

  function exportWalletLedgerCsv() {
    var project = getActiveProject();
    if (!project) return;
    var summary = computeWalletSummary(project);
    var ledger = buildWalletLedger(project, summary);
    if (!ledger.length) {
      showToast("Brak operacji do eksportu.");
      return;
    }
    var rows = [["Data", "Typ", "Opis", "Kwota", "Waluta"].join(";")];
    ledger.forEach(function (entry) {
      rows.push(
        [
          new Date(entry.ts).toISOString(),
          entry.type,
          entry.label + (entry.sub ? " — " + entry.sub : ""),
          String(entry.amount).replace(".", ","),
          summary.currency
        ]
          .map(function (cell) {
            return '"' + String(cell || "").replace(/"/g, '""') + '"';
          })
          .join(";")
      );
    });
    var blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = (project.slug || "sklep") + "-portfel.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Pobrano historię operacji portfela.");
  }

  function normalizeProjectCollections(raw) {
    var sf = storefrontApi();
    var banner0 =
      sf && sf.BANNER_PRESETS && sf.BANNER_PRESETS[0] ? sf.BANNER_PRESETS[0].url : "";
    var banner1 =
      sf && sf.BANNER_PRESETS && sf.BANNER_PRESETS[1] ? sf.BANNER_PRESETS[1].url : "";
    var defaults = [
      { title: "Nowa kolekcja", subtitle: "Wiosna 2026", image: banner0, productIds: [] },
      { title: "Essentials", subtitle: "Codzienne must-have", image: banner1, productIds: [] }
    ];
    if (!Array.isArray(raw) || !raw.length) return [];
    return raw.slice(0, MAX_COLLECTIONS).map(function (c, i) {
      var def = defaults[i] || defaults[0];
      return {
        id: c.id || uid("col"),
        title: c.title || def.title,
        subtitle: c.subtitle != null ? c.subtitle : def.subtitle,
        image: c.image || def.image,
        productIds: Array.isArray(c.productIds) ? c.productIds.slice() : []
      };
    });
  }

  function normalizeProject(raw) {
    if (!raw) return null;
    var lockedTheme = raw.templateId ? getLockedThemeForTemplate(raw.templateId) : null;
    var theme = lockedTheme || raw.theme || raw.thumb || "blank";
    var thumb = lockedTheme || raw.thumb || raw.theme || "blank";
    return {
      id: raw.id,
      name: raw.name || "Nowy sklep",
      source: raw.source || "blank",
      templateId: raw.templateId || null,
      thumb: thumb,
      theme: theme,
      createdAt: raw.createdAt || Date.now(),
      status: raw.status || "draft",
      publishedAt: raw.publishedAt || null,
      slug: raw.slug || slugify(raw.name),
      storeName: raw.storeName || raw.name || "Sklep",
      heroTitle: raw.heroTitle || "Witaj w naszym sklepie",
      heroSubtitle: raw.heroSubtitle || "Dodaj własne produkty i opublikuj sklep.",
      heroCta: raw.heroCta || "Zobacz ofertę",
      sectionTitle: raw.sectionTitle || "Nasze produkty",
      sectionSubtitle: raw.sectionSubtitle || "Przeglądaj aktualną ofertę sklepu.",
      aboutTitle: raw.aboutTitle || "O sklepie",
      aboutText: raw.aboutText || "Opowiedz klientom krótko o swojej marce i ofercie.",
      announcement: raw.announcement || null,
      heroBadge: raw.heroBadge || null,
      heroImage: raw.heroImage || null,
      heroLayout:
        isTechProject({ templateId: raw.templateId, theme: raw.theme || raw.thumb }) &&
        (raw.heroLayout === "full" || raw.heroLayout === "split-wide")
          ? raw.heroLayout
          : "split",
      heroOverlay: typeof raw.heroOverlay === "number" ? raw.heroOverlay : 45,
      colorMode: raw.colorMode === "dark" ? "dark" : "light",
      accentColor: raw.accentColor || null,
      cardRadius: raw.cardRadius || "soft",
      headingStyle: raw.headingStyle || "modern",
      lookbookTitle: raw.lookbookTitle || "Kolekcje sezonowe",
      lookbookSubtitle: raw.lookbookSubtitle || "Lookbook i stylizacje na każdą okazję.",
      collections: normalizeProjectCollections(raw.collections),
      techCompareTitle: raw.techCompareTitle || "Porównaj modele",
      techCompareSubtitle: raw.techCompareSubtitle || "Szybkie zestawienie kluczowych parametrów.",
      techCategoriesTitle: raw.techCategoriesTitle || "Przeglądaj kategorie",
      techCategoriesSubtitle: raw.techCategoriesSubtitle || "Szybki dostęp do segmentów oferty.",
      techFaqTitle: raw.techFaqTitle || "Najczęstsze pytania",
      techFaqSubtitle: raw.techFaqSubtitle || "Odpowiedzi przed zakupem.",
      techBrandsLabel: raw.techBrandsLabel || "Autoryzowani partnerzy",
      techCategories: Array.isArray(raw.techCategories) ? raw.techCategories : [],
      techFaqs: Array.isArray(raw.techFaqs) ? raw.techFaqs : [],
      techCompare:
        raw.techCompare && typeof raw.techCompare === "object"
          ? {
              productIds: Array.isArray(raw.techCompare.productIds) ? raw.techCompare.productIds.slice() : [],
              specKeys: Array.isArray(raw.techCompare.specKeys) ? raw.techCompare.specKeys.slice() : []
            }
          : { productIds: [], specKeys: [] },
      techBrands: Array.isArray(raw.techBrands) ? raw.techBrands.slice() : [],
      techHeroStats: Array.isArray(raw.techHeroStats) ? raw.techHeroStats : [],
      enterpriseBrandsTitle: raw.enterpriseBrandsTitle || "Portfolio marek",
      enterpriseBrandsSubtitle:
        raw.enterpriseBrandsSubtitle || "Każda marka ma własny katalog, branding i raporty — zarządzane centralnie.",
      enterpriseSolutionsTitle: raw.enterpriseSolutionsTitle || "Platforma B2B",
      enterpriseSolutionsSubtitle:
        raw.enterpriseSolutionsSubtitle || "Narzędzia dla zespołów handlowych, franczyz i partnerów dystrybucyjnych.",
      enterpriseSegmentsTitle: raw.enterpriseSegmentsTitle || "Segmenty klientów",
      enterpriseSegmentsSubtitle:
        raw.enterpriseSegmentsSubtitle || "Osobne cenniki, widoczność produktów i warunki płatności dla każdej grupy.",
      enterpriseCasesTitle: raw.enterpriseCasesTitle || "Historie sukcesu",
      enterpriseCasesSubtitle:
        raw.enterpriseCasesSubtitle || "Jak grupy retailowe skalują sprzedaż wielu marek w AmiQPlace.",
      enterprisePartnersLabel: raw.enterprisePartnersLabel || "Ekosystem partnerów",
      enterpriseFaqTitle: raw.enterpriseFaqTitle || "Pytania B2B",
      enterpriseFaqSubtitle: raw.enterpriseFaqSubtitle || "Wdrożenie, integracje, faktury i warunki współpracy.",
      enterprisePortalTitle: raw.enterprisePortalTitle || "Portal partnera B2B",
      enterprisePortalSubtitle:
        raw.enterprisePortalSubtitle || "Zamówienia hurtowe, statusy dostaw i raporty marży w jednym miejscu.",
      enterprisePortalCta: raw.enterprisePortalCta || "Poproś o dostęp",
      enterpriseBrands: Array.isArray(raw.enterpriseBrands) ? raw.enterpriseBrands : [],
      enterpriseSolutions: Array.isArray(raw.enterpriseSolutions) ? raw.enterpriseSolutions : [],
      enterpriseSegments: Array.isArray(raw.enterpriseSegments) ? raw.enterpriseSegments : [],
      enterpriseCaseStudies: Array.isArray(raw.enterpriseCaseStudies) ? raw.enterpriseCaseStudies : [],
      enterprisePartners: Array.isArray(raw.enterprisePartners) ? raw.enterprisePartners.slice() : [],
      enterpriseFaqs: Array.isArray(raw.enterpriseFaqs) ? raw.enterpriseFaqs : [],
      enterpriseHeroStats: Array.isArray(raw.enterpriseHeroStats) ? raw.enterpriseHeroStats : [],
      luxStoryTitle: raw.luxStoryTitle || "Atelier & savoir-faire",
      luxStoryText: raw.luxStoryText || "",
      luxStoryImage: raw.luxStoryImage || null,
      luxExperienceTitle: raw.luxExperienceTitle || "Private Shopping",
      luxExperienceText: raw.luxExperienceText || "",
      luxExperienceCta: raw.luxExperienceCta || "Umów konsultację",
      luxPillars: Array.isArray(raw.luxPillars) ? raw.luxPillars : [],
      luxPress: Array.isArray(raw.luxPress) ? raw.luxPress : [],
      sectionVisibility: normalizeSectionVisibility(raw.sectionVisibility, {
        templateId: raw.templateId,
        theme: theme
      }),
      logoMode: raw.logoMode === "image" ? "image" : "text",
      logoText: raw.logoText || raw.storeName || raw.name || "Sklep",
      logoImage: raw.logoImage || null,
      logoFont: raw.logoFont || "manrope",
      newsletterTitle: raw.newsletterTitle || "Bądź na bieżąco",
      newsletterSubtitle: raw.newsletterSubtitle || "Zapisz się po informacje o nowościach i promocjach.",
      checkout: normalizeCheckout(raw.checkout),
      wallet: normalizeWallet(raw.wallet),
      storeCategory: raw.storeCategory || null,
      categoryProfile: raw.categoryProfile && typeof raw.categoryProfile === "object" ? raw.categoryProfile : {},
      categoryFeatures: Array.isArray(raw.categoryFeatures) ? raw.categoryFeatures : [],
      categoryProductDefaults:
        raw.categoryProductDefaults && typeof raw.categoryProductDefaults === "object" ? raw.categoryProductDefaults : null,
      categoryOnboardingDone: !!raw.categoryOnboardingDone,
      categoryConfiguredAt: raw.categoryConfiguredAt || null,
      storeSettings: normalizeStoreSettings(raw.storeSettings, raw),
      customDomain: normalizeCustomDomain(raw.customDomain, raw),
      checklist: Object.assign({ theme: false, product: false, payments: false, shipping: false }, raw.checklist || {}),
      products: Array.isArray(raw.products) ? raw.products : [],
      orders: Array.isArray(raw.orders) ? raw.orders : [],
      customers: Array.isArray(raw.customers) ? raw.customers : [],
      activity: Array.isArray(raw.activity) ? raw.activity : [],
      installedPlugins: Array.isArray(raw.installedPlugins) ? raw.installedPlugins.slice() : []
    };
  }

  function getProjects() {
    try {
      var raw = sessionStorage.getItem(STORAGE_PROJECTS);
      if (!raw) {
        try {
          raw = localStorage.getItem(STORAGE_PROJECTS);
          if (raw) sessionStorage.setItem(STORAGE_PROJECTS, raw);
        } catch (e2) {}
      }
      var parsed = raw ? JSON.parse(raw) : [];
      var normalized = parsed.map(normalizeProject);
      var repaired = false;
      parsed.forEach(function (entry, index) {
        if (!entry || !entry.templateId) return;
        var locked = getLockedThemeForTemplate(entry.templateId);
        if (!locked) return;
        if (entry.theme !== locked || entry.thumb !== locked) {
          repaired = true;
        }
      });
      if (repaired) saveProjects(normalized);
      return normalized;
    } catch (e) {
      return [];
    }
  }

  function saveProjects(list) {
    var payload = JSON.stringify(list);
    sessionStorage.setItem(STORAGE_PROJECTS, payload);
    try {
      localStorage.setItem(STORAGE_PROJECTS, payload);
    } catch (e) {}
  }

  function getLimits() {
    return PLAN_LIMITS[getCurrentPlan()] || PLAN_LIMITS.trial;
  }

  function canCreateProject() {
    var limits = getLimits();
    if (limits.maxProjects < 0) return true;
    return getProjects().length < limits.maxProjects;
  }

  function canAddProduct(project, isNew) {
    var limits = getLimits();
    if (limits.maxProducts < 0) return true;
    var count = (project.products || []).length;
    if (!isNew) return true;
    return count < limits.maxProducts;
  }

  function getLimitMessage(type) {
    var limits = getLimits();
    var plan = PLAN_LABELS[getCurrentPlan()] || "Trial";
    if (type === "project") {
      return "Limit planu " + plan + ": max. " + limits.maxProjects + " projekt(ów). Ulepsz plan, aby dodać więcej.";
    }
    return "Limit planu " + plan + ": max. " + limits.maxProducts + " produktów na sklep.";
  }

  function getDeletedProjects() {
    try {
      var raw = sessionStorage.getItem(STORAGE_DELETED);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveDeletedProjects(list) {
    sessionStorage.setItem(STORAGE_DELETED, JSON.stringify(list));
  }

  function purgeExpiredDeleted() {
    var now = Date.now();
    var list = getDeletedProjects().filter(function (entry) {
      return now - entry.deletedAt < DELETED_RETENTION_MS;
    });
    if (list.length !== getDeletedProjects().length) saveDeletedProjects(list);
  }

  function daysUntilPermanent(deletedAt) {
    var left = DELETED_RETENTION_MS - (Date.now() - deletedAt);
    return Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)));
  }

  function getProjectById(id) {
    return getProjects().find(function (p) {
      return p.id === id;
    }) || null;
  }

  function updateProject(id, patch) {
    var list = getProjects();
    var idx = list.findIndex(function (p) {
      return p.id === id;
    });
    if (idx === -1) return null;
    list[idx] = normalizeProject(Object.assign({}, list[idx], patch));
    saveProjects(list);
    return list[idx];
  }

  function getActiveProjectId() {
    try {
      var id = sessionStorage.getItem(STORAGE_ACTIVE);
      if (id) return id;
      id = localStorage.getItem(STORAGE_ACTIVE);
      if (id) {
        sessionStorage.setItem(STORAGE_ACTIVE, id);
        return id;
      }
    } catch (e) {}
    return null;
  }

  function getActiveProject() {
    var id = getActiveProjectId();
    return id ? getProjectById(id) : null;
  }

  function setActiveProject(id) {
    if (!id) {
      sessionStorage.removeItem(STORAGE_ACTIVE);
      try {
        localStorage.removeItem(STORAGE_ACTIVE);
      } catch (e) {}
    } else {
      sessionStorage.setItem(STORAGE_ACTIVE, id);
      try {
        localStorage.setItem(STORAGE_ACTIVE, id);
      } catch (e2) {}
    }
    refreshUI();
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeCssUrl(url) {
    if (!url || typeof url !== "string") return "";
    var trimmed = url.trim();
    if (/^data:image\/(?:jpeg|jpg|png|webp|gif|svg\+xml);base64,/i.test(trimmed)) {
      return trimmed.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }
    if (!/^https?:\/\//i.test(trimmed)) return "";
    return trimmed.replace(/&/g, "%26").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  var MAX_PRODUCT_IMAGE_BYTES = 2 * 1024 * 1024;
  var MAX_PRODUCT_GALLERY = 5;
  var productGalleryDraft = [];

  function formatPrice(n) {
    return Number(n || 0).toFixed(2).replace(".", ",") + " zł";
  }

  function checklistDone(project) {
    if (!project || !project.checklist) return 0;
    return CHECKLIST_ITEMS.filter(function (item) {
      return project.checklist[item.key];
    }).length;
  }

  function pushActivity(projectId, text) {
    var p = getProjectById(projectId);
    if (!p) return;
    var activity = [{ text: text, ts: Date.now() }].concat(p.activity || []).slice(0, 8);
    updateProject(projectId, { activity: activity });
  }

  function showToast(message) {
    var toast = $("[data-panel-toast]");
    if (!toast) return;
    toast.innerHTML = '<i class="fas fa-circle-check" aria-hidden="true"></i><span>' + escapeHtml(message) + "</span>";
    toast.hidden = false;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () {
        toast.hidden = true;
      }, 280);
    }, 3400);
  }

  function readStoreNotifications() {
    var sf = storefrontApi();
    if (sf && sf.readStoreNotifications) return sf.readStoreNotifications();
    try {
      var raw = sessionStorage.getItem(STORAGE_STORE_NOTIFICATIONS);
      if (!raw) raw = localStorage.getItem(STORAGE_STORE_NOTIFICATIONS);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list)
        ? list.map(function (n) {
            return Object.assign({ read: false, ts: Date.now() }, n || {});
          })
        : [];
    } catch (e) {
      return [];
    }
  }

  function writeStoreNotifications(list) {
    var sf = storefrontApi();
    if (sf && sf.writeStoreNotifications) {
      sf.writeStoreNotifications(list);
      return;
    }
    var payload = JSON.stringify((list || []).slice(0, 80));
    try {
      sessionStorage.setItem(STORAGE_STORE_NOTIFICATIONS, payload);
      localStorage.setItem(STORAGE_STORE_NOTIFICATIONS, payload);
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("amiqplace:store-notification"));
    } catch (e2) {}
  }

  function syncStoreNotificationsStorage() {
    try {
      var localRaw = localStorage.getItem(STORAGE_STORE_NOTIFICATIONS);
      var sessionRaw = sessionStorage.getItem(STORAGE_STORE_NOTIFICATIONS);
      if (localRaw && !sessionRaw) sessionStorage.setItem(STORAGE_STORE_NOTIFICATIONS, localRaw);
      else if (sessionRaw && !localRaw) localStorage.setItem(STORAGE_STORE_NOTIFICATIONS, sessionRaw);
      else if (localRaw && sessionRaw && localRaw !== sessionRaw) {
        var merged = [];
        var seen = {};
        JSON.parse(localRaw)
          .concat(JSON.parse(sessionRaw))
          .forEach(function (n) {
            if (!n || !n.id || seen[n.id]) return;
            seen[n.id] = true;
            merged.push(n);
          });
        merged.sort(function (a, b) {
          return (b.ts || 0) - (a.ts || 0);
        });
        writeStoreNotifications(merged);
      }
    } catch (e) {}
  }

  function getNotificationsList() {
    return readStoreNotifications()
      .slice()
      .sort(function (a, b) {
        return (b.ts || 0) - (a.ts || 0);
      });
  }

  function getNotificationProjectLabel(projectId) {
    if (!projectId) return "";
    var project = getProjectById(projectId);
    return project ? project.name : "";
  }

  function countUnreadNotifications() {
    return getNotificationsList().filter(function (n) {
      return !n.read;
    }).length;
  }

  function renderPanelNotifications() {
    var listEl = $("[data-panel-notifications-list]");
    var countEl = $("[data-panel-notifications-count]");
    var toggle = $("[data-panel-notifications-toggle]");
    if (!listEl) return;
    var items = getNotificationsList();
    var unread = countUnreadNotifications();
    if (toggle) toggle.classList.toggle("has-unread", unread > 0);
    if (countEl) {
      countEl.hidden = true;
      countEl.textContent = unread > 9 ? "9+" : String(unread);
    }
    if (!items.length) {
      listEl.innerHTML =
        '<div class="panel-notifications__empty"><i class="fas fa-bell-slash" aria-hidden="true"></i><strong>Brak powiadomień</strong><span>Dodanie do koszyka i zakupy w podglądzie sklepu pojawią się tutaj.</span></div>';
      return;
    }
    listEl.innerHTML = items
      .slice(0, 30)
      .map(function (n) {
        var icon = n.type === "order" ? "fa-bag-shopping" : "fa-cart-plus";
        var when = formatNotificationTime(n.ts);
        var projectLabel = getNotificationProjectLabel(n.projectId);
        return (
          '<article class="panel-notifications__item' +
          (n.read ? "" : " is-unread") +
          '" data-notification-id="' +
          escapeHtml(n.id) +
          '" tabindex="0" role="button">' +
          '<span class="panel-notifications__item-icon"><i class="fas ' +
          icon +
          '" aria-hidden="true"></i></span>' +
          "<div><strong>" +
          escapeHtml(n.title || "Powiadomienie") +
          "</strong><span>" +
          escapeHtml(n.message || "") +
          "</span>" +
          (projectLabel ? '<em class="panel-notifications__project">' + escapeHtml(projectLabel) + "</em>" : "") +
          '<time class="panel-notifications__time" datetime="' +
          escapeHtml(new Date(n.ts || Date.now()).toISOString()) +
          '">' +
          escapeHtml(when) +
          "</time></div></article>"
        );
      })
      .join("");
  }

  function formatNotificationTime(ts) {
    var d = new Date(ts || Date.now());
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function markNotificationsRead(projectId, onlyIds) {
    var list = readStoreNotifications();
    list = list.map(function (n) {
      if (projectId && n.projectId !== projectId) return n;
      if (onlyIds && onlyIds.indexOf(n.id) === -1) return n;
      return Object.assign({}, n, { read: true, readAt: Date.now() });
    });
    writeStoreNotifications(list);
    renderPanelNotifications();
  }

  function toggleNotificationsDropdown(forceOpen) {
    var dropdown = $("[data-panel-notifications-dropdown]");
    var toggle = $("[data-panel-notifications-toggle]");
    if (!dropdown || !toggle) return;
    var isOpen = !dropdown.hidden;
    var open = typeof forceOpen === "boolean" ? forceOpen : !isOpen;
    dropdown.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      markNotificationsRead(null, null);
    } else {
      renderPanelNotifications();
    }
  }

  function runPanelGlobalSearch(query) {
    var resultsRoot = $("[data-panel-search-results]");
    var input = $("[data-panel-search]");
    if (!resultsRoot) return;
    var q = String(query || "").trim().toLowerCase();
    if (q.length < 2) {
      resultsRoot.hidden = true;
      resultsRoot.innerHTML = "";
      return;
    }
    var project = getActiveProject();
    var sections = [];
    PANEL_NAV_SEARCH.forEach(function (nav) {
      var hit =
        nav.label.toLowerCase().indexOf(q) !== -1 ||
        nav.keys.some(function (k) {
          return k.indexOf(q) !== -1 || q.indexOf(k) !== -1;
        });
      if (hit) {
        sections.push({
          type: "nav",
          view: nav.view,
          title: nav.label,
          sub: "Przejdź do sekcji panelu",
          icon: nav.icon
        });
      }
    });
    if (project) {
      (project.products || []).forEach(function (p) {
        var hay = ((p.name || "") + " " + (p.desc || "") + " " + (p.sku || "")).toLowerCase();
        if (hay.indexOf(q) !== -1) {
          sections.push({ type: "product", id: p.id, title: p.name, sub: "Produkt · " + formatPrice(p.price), icon: "fa-box" });
        }
      });
      (project.orders || []).forEach(function (o) {
        var hay = ((o.number || "") + " " + (o.customer || "") + " " + (o.email || "") + " " + (o.productName || "")).toLowerCase();
        if (hay.indexOf(q) !== -1) {
          sections.push({ type: "order", id: o.id, title: o.number + " · " + (o.customer || "Klient"), sub: formatPrice(o.total), icon: "fa-receipt" });
        }
      });
      syncCustomersFromOrders(project).forEach(function (c) {
        var hay = ((c.name || "") + " " + (c.email || "")).toLowerCase();
        if (hay.indexOf(q) !== -1) {
          sections.push({ type: "customer", id: c.id, title: c.name, sub: c.email || "Klient", icon: "fa-user" });
        }
      });
      (project.collections || []).forEach(function (col) {
        var hay = ((col.title || "") + " " + (col.subtitle || "")).toLowerCase();
        if (hay.indexOf(q) !== -1) {
          sections.push({ type: "collection", title: col.title, sub: col.subtitle || "Kolekcja / promocja", icon: "fa-layer-group" });
        }
      });
    }
    sections = sections.slice(0, 12);
    if (!sections.length) {
      resultsRoot.innerHTML = '<div class="panel-search-dropdown__empty">Brak wyników dla „' + escapeHtml(query) + "”</div>";
      resultsRoot.hidden = false;
      return;
    }
    resultsRoot.innerHTML =
      '<ul class="panel-search-dropdown__list">' +
      sections
        .map(function (item) {
          return (
            '<li><button type="button" class="panel-search-dropdown__item" data-panel-search-hit="' +
            escapeHtml(item.type) +
            '" data-panel-search-view="' +
            escapeHtml(item.view || "") +
            '" data-panel-search-id="' +
            escapeHtml(item.id || "") +
            '"><i class="fas ' +
            item.icon +
            '" aria-hidden="true"></i><span><strong>' +
            escapeHtml(item.title) +
            "</strong><em>" +
            escapeHtml(item.sub) +
            "</em></span></button></li>"
          );
        })
        .join("") +
      "</ul>";
    resultsRoot.hidden = false;
  }

  function handlePanelSearchHit(button) {
    var type = button.getAttribute("data-panel-search-hit");
    var view = button.getAttribute("data-panel-search-view");
    var id = button.getAttribute("data-panel-search-id");
    var resultsRoot = $("[data-panel-search-results]");
    if (resultsRoot) resultsRoot.hidden = true;
    if (type === "nav" && view) {
      switchView(view);
      return;
    }
    if (type === "product") {
      switchView("products");
      window.setTimeout(function () {
        var filter = $("[data-products-filter]");
        if (filter && $("[data-panel-search]")) filter.value = $("[data-panel-search]").value.trim();
        renderProductsList(filter ? filter.value : "");
        if (id) openProductModal(id);
      }, 80);
      return;
    }
    if (type === "order") {
      switchView("orders");
      if (id) window.setTimeout(function () { openOrderModal(id); }, 80);
      return;
    }
    if (type === "customer") {
      switchView("customers");
      window.setTimeout(function () {
        var filter = $("[data-customers-filter]");
        if (filter && $("[data-panel-search]")) filter.value = $("[data-panel-search]").value.trim();
        renderCustomers(filter ? filter.value : "");
      }, 80);
      return;
    }
    if (type === "collection") {
      switchView("editor");
      showToast("Kolekcje edytujesz w sekcji Lookbook / Promocje w edytorze sklepu.");
    }
  }

  function initPanelSearchAndNotifications() {
    var input = $("[data-panel-search]");
    if (input) {
      input.addEventListener("input", function () {
        window.clearTimeout(initPanelSearchAndNotifications._timer);
        initPanelSearchAndNotifications._timer = window.setTimeout(function () {
          runPanelGlobalSearch(input.value);
        }, 180);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          var resultsRoot = $("[data-panel-search-results]");
          if (resultsRoot) resultsRoot.hidden = true;
        }
      });
    }
    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-panel-search-hit]")) {
        event.preventDefault();
        handlePanelSearchHit(event.target.closest("[data-panel-search-hit]"));
        return;
      }
      if (event.target.closest("[data-panel-notifications-toggle]")) {
        event.preventDefault();
        toggleNotificationsDropdown();
        return;
      }
      if (event.target.closest("[data-panel-notifications-read-all]")) {
        event.preventDefault();
        markNotificationsRead(null, null);
        return;
      }
      var notificationItem = event.target.closest("[data-notification-id]");
      if (notificationItem) {
        event.preventDefault();
        markNotificationsRead(null, [notificationItem.getAttribute("data-notification-id")]);
        return;
      }
      if (event.target.closest("[data-panel-soon]")) {
        event.preventDefault();
        showToast("Ta sekcja będzie dostępna w kolejnej wersji panelu.");
        return;
      }
      if (!event.target.closest("[data-panel-search-wrap]")) {
        var resultsRoot = $("[data-panel-search-results]");
        if (resultsRoot) resultsRoot.hidden = true;
      }
      if (!event.target.closest("[data-panel-notifications]")) {
        toggleNotificationsDropdown(false);
      }
    });
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_STORE_NOTIFICATIONS || event.key === STORAGE_PROJECTS) {
        renderPanelNotifications();
        if (currentView === "products" || currentView === "orders" || currentView === "customers" || currentView === "wallet") refreshUI();
      }
    });
    window.addEventListener("amiqplace:store-notification", function () {
      renderPanelNotifications();
    });
    window.addEventListener("amiqplace:projects-updated", function () {
      renderPanelNotifications();
      if (currentView === "products" || currentView === "orders" || currentView === "customers" || currentView === "wallet" || currentView === "dashboard") refreshUI();
    });
    window.addEventListener("focus", function () {
      renderPanelNotifications();
    });
    var pluginsSearch = $("[data-plugins-search]");
    if (pluginsSearch) {
      pluginsSearch.addEventListener("input", function () {
        pluginsSearchQuery = pluginsSearch.value;
        window.clearTimeout(initPanelSearchAndNotifications._pluginsTimer);
        initPanelSearchAndNotifications._pluginsTimer = window.setTimeout(function () {
          renderPlugins();
        }, 160);
      });
    }
    renderPanelNotifications();
  }

  function canAccessTemplate(template, plan) {
    if (isTemplateComingSoon(template)) return false;
    if (template.trialAccess && isTrialActive()) return true;
    return planLevel(plan) >= planLevel(template.planRequired);
  }

  function templatePlanBadge(template, plan, unlocked) {
    if (isTemplateComingSoon(template)) return "Wkrótce";
    if (unlocked && template.trialAccess && isTrialActive() && planLevel(plan) < planLevel(template.planRequired)) {
      return "Dostępny w trialu";
    }
    if (unlocked) return "Dostępny";
    return "Plan " + (PLAN_LABELS[template.planRequired] || template.planRequired) + "+";
  }

  function isTemplateComingSoon(template) {
    return !!(template && template.comingSoon);
  }

  function showTemplateSoonToast(templateId) {
    var template = AMIQ_TEMPLATES.find(function (t) {
      return t.id === templateId;
    });
    var msg =
      TEMPLATE_SOON_MESSAGES[templateId] ||
      "Wkrótce — szablon «" +
        (template ? template.name : "Ten") +
        "» siedzi u nas w studiu. Tymczasem startuj z Moda & Lookbook — już w pełni gotowy.";
    showToast(msg);
  }

  function sortedTemplates() {
    return AMIQ_TEMPLATES.slice().sort(function (a, b) {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (isTemplateComingSoon(a) !== isTemplateComingSoon(b)) {
        return isTemplateComingSoon(a) ? 1 : -1;
      }
      return 0;
    });
  }

  function getTemplateById(templateId) {
    return AMIQ_TEMPLATES.find(function (t) {
      return t.id === templateId;
    });
  }

  function buildTemplateThumbStyle(template) {
    if (!template || !template.coverImage) return "";
    var cover = safeCssUrl(template.coverImage);
    if (!cover) return "";
    return (
      ' style="background-image:linear-gradient(180deg,rgba(8,10,18,0.06),rgba(8,10,18,0.58)),url(\'' +
      cover +
      "');background-size:cover,cover;background-position:center,center\""
    );
  }

  function resolveProjectTemplate(project) {
    if (!project) return null;
    if (project.templateId) {
      var byId = getTemplateById(project.templateId);
      if (byId) return byId;
    }
    var thumbKey = project.thumb || project.theme;
    if (!thumbKey) return null;
    return (
      AMIQ_TEMPLATES.find(function (t) {
        return t.thumb === thumbKey;
      }) || null
    );
  }

  function buildProjectThumbStyle(project) {
    return buildTemplateThumbStyle(resolveProjectTemplate(project));
  }

  function renderTemplateCardsHtml() {
    var plan = getCurrentPlan();
    var projects = getProjects();
    return sortedTemplates()
      .map(function (template) {
        var soon = isTemplateComingSoon(template);
        var unlocked = !soon && canAccessTemplate(template, plan);
        var added = projects.some(function (p) {
          return p.templateId === template.id;
        });
        var planBadge = templatePlanBadge(template, plan, unlocked);
        return (
          '<article class="panel-project-card' +
          (soon ? " is-soon is-locked" : unlocked ? "" : " is-locked") +
          (template.featured ? " is-featured-template" : "") +
          '"' +
          (soon ? ' data-soon-template="' + escapeHtml(template.id) + '"' : "") +
          '><div class="panel-project-card__thumb panel-project-card__thumb--' +
          escapeHtml(template.thumb) +
          '"' +
          buildTemplateThumbStyle(template) +
          ">" +
          (soon
            ? '<span class="panel-project-card__soon"><i class="fas fa-hourglass-half" aria-hidden="true"></i> Wkrótce</span>'
            : unlocked
              ? ""
              : '<span class="panel-project-card__lock"><i class="fas fa-lock"></i></span>') +
          (template.featured && !soon ? '<span class="panel-project-card__featured">Polecany start</span>' : "") +
          '</div><div class="panel-project-card__body"><div class="panel-project-card__meta">' +
          (template.tag ? '<span class="panel-project-card__tag">' + escapeHtml(template.tag) + "</span>" : "") +
          '<span class="panel-project-card__plan' +
          (soon ? " is-soon" : unlocked ? "" : " is-required") +
          '">' +
          escapeHtml(planBadge) +
          "</span></div><h3>" +
          escapeHtml(template.name) +
          "</h3><p>" +
          escapeHtml(template.desc) +
          '</p><div class="panel-project-card__actions panel-project-card__actions--split">' +
          (soon
            ? '<button type="button" class="panel-project-card__btn panel-project-card__btn--soon" data-soon-template="' +
              escapeHtml(template.id) +
              '"><i class="fas fa-sparkles" aria-hidden="true"></i> Wkrótce</button>' +
              '<button type="button" class="panel-project-card__btn" disabled aria-disabled="true">Podgląd</button>'
            : '<button type="button" class="panel-project-card__btn" data-preview-template="' +
              escapeHtml(template.id) +
              '"><i class="fas fa-eye"></i> Podgląd</button>' +
              (unlocked
                ? added
                  ? '<button type="button" class="panel-project-card__btn is-disabled" disabled>Już dodany</button>'
                  : '<button type="button" class="panel-project-card__btn panel-project-card__btn--primary" data-add-template="' +
                    escapeHtml(template.id) +
                    '"><i class="fas fa-download"></i> Dodaj</button>'
                : '<a href="plany.html" class="panel-project-card__btn panel-project-card__btn--primary">Ulepsz plan</a>')) +
          "</div></div></article>"
        );
      })
      .join("");
  }

  function syncChecklistAuto(project) {
    if (!project) return project;
    var checklist = Object.assign({}, project.checklist);
    checklist.theme = !!project.theme;
    checklist.product = (project.products || []).some(function (p) {
      return p.status === "active";
    });
    var checkout = project.checkout || getDefaultCheckout();
    checklist.payments = !!checkout.payments.configured && (checkout.payments.enabled || []).length > 0;
    checklist.shipping = !!checkout.shipping.configured && (checkout.shipping.methods || []).some(function (m) {
      return m.enabled;
    });
    if (JSON.stringify(checklist) === JSON.stringify(project.checklist)) return project;
    return updateProject(project.id, { checklist: checklist }) || project;
  }

  function isCheckoutProviderUnlocked(provider) {
    return planLevel(getCurrentPlan()) >= planLevel(provider.tier);
  }

  function getPaymentProviderLabel(id) {
    var p = PAYMENT_PROVIDERS.find(function (x) {
      return x.id === id;
    });
    return p ? p.name : id;
  }

  function getShippingMethodLabel(project, id) {
    var m = ((project.checkout || {}).shipping || {}).methods;
    if (!m) return id;
    var found = m.find(function (x) {
      return x.id === id;
    });
    return found ? found.label : id;
  }

  function isReadyToPublish(project) {
    return project && checklistDone(project) === CHECKLIST_ITEMS.length;
  }

  function getStoreDisplayUrl(project) {
    if (!project) return "sklep.amiqplace.pl";
    var domain = getCustomDomainMeta(project);
    if (domain.status === "active" && domain.hostname && domain.primary) return domain.hostname;
    return getDefaultStoreUrl(project);
  }

  function getStorePublicUrls(project) {
    var domain = getCustomDomainMeta(project);
    var defaultUrl = getDefaultStoreUrl(project);
    return {
      defaultUrl: defaultUrl,
      customUrl: domain.hostname || null,
      customActive: domain.status === "active",
      displayUrl: getStoreDisplayUrl(project),
      shareUrl: getStoreShareUrl(project)
    };
  }

  function openDomainSettings() {
    closePublishModal();
    switchView("settings");
    switchSettingsTab("domain");
  }

  function getStoreShareUrl(project) {
    if (!project) return "";
    var path = window.location.pathname.replace(/[^/]*$/, "");
    return window.location.origin + path + "sklep-podglad.html?id=" + encodeURIComponent(project.id);
  }

  function formatPublishedAt(ts) {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  }

  function getPublishBlockers(project) {
    if (!project) return CHECKLIST_ITEMS.slice();
    syncChecklistAuto(project);
    var fresh = getProjectById(project.id) || project;
    return CHECKLIST_ITEMS.filter(function (item) {
      return !fresh.checklist[item.key];
    });
  }

  function copyStoreShareLink(project) {
    var url = getStoreShareUrl(project);
    copyTextToClipboard(url, "Link skopiowany — wyślij go klientom lub znajomym.");
  }

  function openPublishedPreview(project) {
    if (!project) return;
    var sf = storefrontApi();
    if (sf && sf.savePreviewSnapshot) sf.savePreviewSnapshot(project);
    window.open(getStoreShareUrl(project), "_blank", "noopener");
  }

  function syncPublishButton(project) {
    var btn = $("[data-open-publish-modal]");
    if (!btn) return;
    var ready = project && isReadyToPublish(project);
    var live = project && project.status === "published";
    btn.classList.remove("panel-primary-btn", "panel-ghost-btn", "is-live");
    if (live) {
      btn.classList.add("panel-ghost-btn", "is-live");
    } else if (ready) {
      btn.classList.add("panel-primary-btn");
    } else {
      btn.classList.add("panel-ghost-btn");
    }
    var label = btn.querySelector("span");
    var icon = btn.querySelector("i");
    if (live) {
      if (label) label.textContent = "Udostępnij";
      if (icon) icon.className = "fas fa-share-nodes";
      btn.setAttribute("aria-label", "Udostępnij opublikowany sklep");
    } else if (ready) {
      if (label) label.textContent = "Opublikuj sklep";
      if (icon) icon.className = "fas fa-rocket";
      btn.setAttribute("aria-label", "Opublikuj sklep");
    } else {
      if (label) label.textContent = "Opublikuj";
      if (icon) icon.className = "fas fa-globe";
      btn.setAttribute("aria-label", "Publikacja sklepu");
    }
  }

  function renderPublishModalContent(project) {
    var body = $("[data-publish-modal-body]");
    var foot = $("[data-publish-modal-foot]");
    var title = $("[data-publish-modal-title]");
    var eyebrow = $("[data-publish-modal-eyebrow]");
    if (!body || !foot || !project) return;

    syncChecklistAuto(project);
    project = getProjectById(project.id) || project;
    var blockers = getPublishBlockers(project);
    var live = project.status === "published";
    var displayUrl = getStoreDisplayUrl(project);
    var shareUrl = getStoreShareUrl(project);
    var done = checklistDone(project);

    if (title) title.textContent = live ? "Sklep jest live" : blockers.length ? "Jeszcze chwila…" : "Opublikuj sklep";
    if (eyebrow) {
      eyebrow.innerHTML = live
        ? '<i class="fas fa-circle-check" aria-hidden="true"></i> Opublikowany'
        : blockers.length
          ? '<i class="fas fa-list-check" aria-hidden="true"></i> Checklist ' + done + "/4"
          : '<i class="fas fa-rocket" aria-hidden="true"></i> Gotowy do startu';
    }

    if (live) {
      var urls = getStorePublicUrls(project);
      var domain = getCustomDomainMeta(project);
      var domainBlock =
        domain.status === "active"
          ? '<div class="panel-publish-domain panel-publish-domain--active">' +
            '<span class="panel-publish-domain__badge"><i class="fas fa-globe" aria-hidden="true"></i> Własna domena aktywna</span>' +
            "<p>Sklep jest dostępny pod <strong>" +
            escapeHtml(domain.hostname) +
            "</strong>. Adres AmiQPlace pozostaje jako alias.</p></div>"
          : '<div class="panel-publish-domain">' +
            '<div class="panel-publish-domain__head"><strong><i class="fas fa-globe" aria-hidden="true"></i> Własna domena</strong><span class="panel-publish-domain__soon">' +
            escapeHtml(getDomainPlanLabel()) +
            "+</span></div>" +
            "<p>Podłącz adres typu <em>sklep.twojafirma.pl</em> — przygotowaliśmy konfigurator DNS i SSL pod przyszłą usługę.</p>" +
            '<button type="button" class="panel-ghost-btn" data-open-domain-settings><i class="fas fa-arrow-right" aria-hidden="true"></i> Skonfiguruj domenę</button></div>';
      body.innerHTML =
        '<div class="panel-publish-live">' +
        '<div class="panel-publish-live__badge"><span class="panel-publish-live__dot" aria-hidden="true"></span> Live · demo AmiQPlace</div>' +
        "<p>Twój sklep jest widoczny pod adresem demo. Wyślij link klientom lub podłącz własną domenę.</p>" +
        '<div class="panel-publish-url">' +
        '<span class="panel-publish-url__label">Adres publiczny</span>' +
        '<div class="panel-publish-url__row"><strong data-publish-display-url>' +
        escapeHtml(urls.displayUrl) +
        '</strong></div></div>' +
        (urls.customActive && urls.customUrl !== urls.displayUrl
          ? '<div class="panel-publish-url"><span class="panel-publish-url__label">Alias AmiQPlace</span><div class="panel-publish-url__row"><strong>' +
            escapeHtml(urls.defaultUrl) +
            "</strong></div></div>"
          : "") +
        '<div class="panel-publish-url panel-publish-url--share">' +
        '<span class="panel-publish-url__label">Link do udostępnienia (demo)</span>' +
        '<div class="panel-publish-url__row"><input type="text" readonly value="' +
        escapeHtml(shareUrl) +
        '" data-publish-share-input aria-label="Link do sklepu"><button type="button" class="panel-ghost-btn" data-copy-store-link><i class="fas fa-copy" aria-hidden="true"></i> Kopiuj</button></div></div>' +
        domainBlock +
        (project.publishedAt
          ? '<p class="panel-publish-note"><i class="fas fa-clock" aria-hidden="true"></i> Opublikowano: ' + escapeHtml(formatPublishedAt(project.publishedAt)) + "</p>"
          : "") +
        "</div>";
      foot.innerHTML =
        '<button type="button" class="panel-ghost-btn" data-close-publish-modal>Zamknij</button>' +
        '<button type="button" class="panel-ghost-btn" data-unpublish-store><i class="fas fa-eye-slash" aria-hidden="true"></i> Cofnij publikację</button>' +
        '<button type="button" class="panel-ghost-btn" data-open-published-preview><i class="fas fa-up-right-from-square" aria-hidden="true"></i> Otwórz sklep</button>' +
        '<button type="button" class="panel-primary-btn" data-copy-store-link><i class="fas fa-share-nodes" aria-hidden="true"></i> Kopiuj link</button>';
      return;
    }

    if (blockers.length) {
      body.innerHTML =
        '<p class="panel-publish-lead">Ukończ checklistę, aby opublikować sklep. Brakuje jeszcze <strong>' +
        blockers.length +
        "</strong> " +
        (blockers.length === 1 ? "kroku" : "kroków") +
        ":</p>" +
        '<ul class="panel-publish-blockers">' +
        blockers
          .map(function (item) {
            return (
              "<li><i class=\"fas " +
              item.icon +
              '" aria-hidden="true"></i><div><strong>' +
              escapeHtml(item.title) +
              "</strong><span>" +
              escapeHtml(item.sub) +
              "</span></div></li>"
            );
          })
          .join("") +
        "</ul>" +
        '<div class="panel-publish-progress" aria-hidden="true"><span style="width:' +
        Math.round((done / CHECKLIST_ITEMS.length) * 100) +
        '%"></span></div>';
      var first = blockers[0];
      var goBtn =
        first.action === "checkout"
          ? '<button type="button" class="panel-primary-btn" data-open-checkout="' + escapeHtml(first.checkoutStep) + '">Dokończ konfigurację</button>'
          : '<button type="button" class="panel-primary-btn" data-checklist-go="' + escapeHtml(first.action) + '">Przejdź do kroku</button>';
      foot.innerHTML = '<button type="button" class="panel-ghost-btn" data-close-publish-modal>Później</button>' + goBtn;
      return;
    }

    body.innerHTML =
      '<p class="panel-publish-lead">Checklist kompletna — możesz opublikować <strong>' +
      escapeHtml(project.storeName || project.name) +
      "</strong>. W trybie demo klient zobaczy sklep pod linkiem AmiQPlace (własna domena po wdrożeniu produkcyjnym).</p>" +
      '<ul class="panel-publish-checklist panel-publish-checklist--done">' +
      CHECKLIST_ITEMS.map(function (item) {
        return (
          '<li><i class="fas fa-circle-check" aria-hidden="true"></i> ' + escapeHtml(item.title) + "</li>"
        );
      }).join("") +
      "</ul>" +
      '<div class="panel-publish-url">' +
      '<span class="panel-publish-url__label">Po publikacji sklep będzie dostępny pod</span>' +
      '<div class="panel-publish-url__row"><strong>' +
      escapeHtml(displayUrl) +
      "</strong></div></div>" +
      '<p class="panel-publish-note"><i class="fas fa-circle-info" aria-hidden="true"></i> Możesz w każdej chwili cofnąć publikację i wrócić do trybu szkicu.</p>';
    foot.innerHTML =
      '<button type="button" class="panel-ghost-btn" data-close-publish-modal>Anuluj</button>' +
      '<button type="button" class="panel-primary-btn" data-confirm-publish><i class="fas fa-rocket" aria-hidden="true"></i> Opublikuj teraz</button>';
  }

  function openPublishModal() {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw stwórz lub wybierz projekt.");
      openModal(getProjects().length ? "mine" : "create");
      return;
    }
    if (!publishModal) publishModal = document.getElementById("publish-modal");
    if (!publishModal) return;
    renderPublishModalContent(project);
    publishModal.hidden = false;
    publishModal.classList.add("is-open");
    publishModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    var focusBtn = publishModal.querySelector("[data-confirm-publish], [data-copy-store-link], [data-close-publish-modal]");
    if (focusBtn) focusBtn.focus();
  }

  function closePublishModal() {
    if (!publishModal || !publishModal.classList.contains("is-open")) return;
    publishModal.classList.remove("is-open");
    publishModal.setAttribute("aria-hidden", "true");
    syncBodyModalLock();
    window.setTimeout(function () {
      if (publishModal && !publishModal.classList.contains("is-open")) publishModal.hidden = true;
    }, 280);
  }

  function publishStore() {
    var project = getActiveProject();
    if (!project || !isReadyToPublish(project)) {
      showToast("Ukończ checklistę przed publikacją.");
      renderPublishModalContent(project);
      return;
    }
    updateProject(project.id, { status: "published", publishedAt: Date.now() });
    pushActivity(project.id, "Opublikowano sklep — link demo gotowy do udostępnienia");
    renderPublishModalContent(getProjectById(project.id));
    renderEditor();
    refreshUI();
    showToast("Sklep opublikowany! Skopiuj link i wyślij go klientom.");
  }

  function unpublishStore() {
    var project = getActiveProject();
    if (!project || project.status !== "published") return;
    updateProject(project.id, { status: "draft" });
    pushActivity(project.id, "Przywrócono tryb szkicu");
    closePublishModal();
    renderEditor();
    refreshUI();
    showToast("Sklep wrócił w tryb szkicu — klienci nie zobaczą go jako live.");
  }

  function renderDashboardPublish(project) {
    var wrap = $("[data-dashboard-publish]");
    if (!wrap) return;
    if (!project) {
      wrap.hidden = true;
      return;
    }
    syncChecklistAuto(project);
    project = getProjectById(project.id) || project;
    var done = checklistDone(project);
    var live = project.status === "published";
    var ready = isReadyToPublish(project);
    var displayUrl = getStoreDisplayUrl(project);
    wrap.hidden = false;

    if (live) {
      var urls = getStorePublicUrls(project);
      var domain = getCustomDomainMeta(project);
      wrap.className = "panel-card panel-publish-card panel-publish-card--live";
      wrap.innerHTML =
        '<div class="panel-card__head"><div><h2>Sklep opublikowany</h2><p>Udostępnij link klientom — w demo działa od razu.</p></div>' +
        '<span class="panel-publish-live__badge panel-publish-live__badge--compact"><span class="panel-publish-live__dot" aria-hidden="true"></span> Live</span></div>' +
        '<div class="panel-card__body panel-publish-card__body">' +
        '<div class="panel-publish-url panel-publish-url--inline">' +
        '<strong>' +
        escapeHtml(urls.displayUrl) +
        '</strong><button type="button" class="panel-ghost-btn" data-copy-store-link><i class="fas fa-copy" aria-hidden="true"></i> Kopiuj link</button></div>' +
        (domain.status === "active"
          ? '<p class="panel-publish-card__domain-note"><i class="fas fa-globe" aria-hidden="true"></i> Własna domena aktywna · alias: ' + escapeHtml(urls.defaultUrl) + "</p>"
          : domain.status === "pending_dns" || domain.status === "verifying"
            ? '<p class="panel-publish-card__domain-note panel-publish-card__domain-note--warn"><i class="fas fa-server" aria-hidden="true"></i> Domena ' +
              escapeHtml(domain.hostname) +
              " — dokończ konfigurację DNS</p>"
            : '<p class="panel-publish-card__domain-note"><i class="fas fa-globe" aria-hidden="true"></i> Domyślny adres AmiQPlace — możesz podłączyć własną domenę.</p>') +
        '<div class="panel-publish-card__actions">' +
        '<button type="button" class="panel-ghost-btn" data-open-published-preview><i class="fas fa-up-right-from-square" aria-hidden="true"></i> Otwórz sklep</button>' +
        '<button type="button" class="panel-ghost-btn" data-open-domain-settings><i class="fas fa-globe" aria-hidden="true"></i> Domena</button>' +
        '<button type="button" class="panel-ghost-btn" data-open-publish-modal>Zarządzaj</button></div></div>';
      return;
    }

    if (ready) {
      wrap.className = "panel-card panel-publish-card panel-publish-card--ready";
      wrap.innerHTML =
        '<div class="panel-card__head"><div><h2>Gotowe do publikacji</h2><p>Checklist ukończona — wystartuj ze sklepem demo.</p></div>' +
        '<span class="panel-ghost-btn panel-ghost-btn--static"><i class="fas fa-circle-check" aria-hidden="true"></i> 4/4</span></div>' +
        '<div class="panel-card__body panel-publish-card__body">' +
        "<p>Po publikacji udostępnisz link <strong>" +
        escapeHtml(displayUrl) +
        "</strong> (demo). Możesz wrócić do szkicu w dowolnym momencie.</p>" +
        '<button type="button" class="panel-primary-btn panel-publish-card__cta" data-open-publish-modal><i class="fas fa-rocket" aria-hidden="true"></i> Opublikuj sklep</button></div>';
      return;
    }

    wrap.className = "panel-card panel-publish-card";
    wrap.innerHTML =
      '<div class="panel-card__head"><div><h2>Droga do publikacji</h2><p>Ukończ checklistę, aby udostępnić sklep klientom.</p></div>' +
      '<span class="panel-ghost-btn panel-ghost-btn--static">' +
      done +
      "/4</span></div>" +
      '<div class="panel-card__body panel-publish-card__body">' +
      '<div class="panel-publish-progress" role="progressbar" aria-valuenow="' +
      done +
      '" aria-valuemin="0" aria-valuemax="4"><span style="width:' +
      Math.round((done / CHECKLIST_ITEMS.length) * 100) +
      '%"></span></div>' +
      "<p>" +
      (done === 0
        ? "Zacznij od motywu i pierwszego produktu."
        : "Jeszcze " + (CHECKLIST_ITEMS.length - done) + " krok" + (CHECKLIST_ITEMS.length - done === 1 ? "" : "y") + " do startu.") +
      '</p><button type="button" class="panel-ghost-btn" data-open-publish-modal><i class="fas fa-globe" aria-hidden="true"></i> Zobacz checklistę publikacji</button></div>';
  }

  function getStoreCategoryById(id) {
    return STORE_CATEGORIES.find(function (c) {
      return c.id === id;
    });
  }

  function getCategoryAnswerLabel(meta, questionId, value) {
    if (!meta || !value) return "";
    var question = meta.questions.find(function (q) {
      return q.id === questionId;
    });
    if (!question) return value;
    var option = question.options.find(function (o) {
      return o.value === value;
    });
    return option ? option.label : value;
  }

  function buildCategoryProfileSummaryHtml(meta, profile) {
    if (!meta || !profile) return "";
    return meta.questions
      .map(function (q) {
        var answer = getCategoryAnswerLabel(meta, q.id, profile[q.id]);
        if (!answer) return "";
        return (
          '<div class="panel-category-profile-row"><dt>' +
          escapeHtml(q.title) +
          "</dt><dd>" +
          escapeHtml(answer) +
          "</dd></div>"
        );
      })
      .filter(Boolean)
      .join("");
  }

  function isCategoryAnswerValid(meta, questionId, value) {
    if (!meta || !questionId || !value) return false;
    var question = meta.questions.find(function (q) {
      return q.id === questionId;
    });
    if (!question) return false;
    return question.options.some(function (o) {
      return o.value === value;
    });
  }

  function sanitizeCategoryWizardDraft(meta, draft) {
    var clean = {};
    if (!meta || !draft) return clean;
    meta.questions.forEach(function (q) {
      var val = draft[q.id];
      if (isCategoryAnswerValid(meta, q.id, val)) clean[q.id] = val;
    });
    return clean;
  }

  function getCurrentCategoryWizardStep() {
    var meta = getStoreCategoryById(getPendingCategoryId());
    if (!meta) return null;
    var steps = getCategoryWizardSteps(meta);
    return steps[categoryWizardStep] || null;
  }

  function isCurrentCategoryStepAnswered() {
    var step = getCurrentCategoryWizardStep();
    var meta = getStoreCategoryById(getPendingCategoryId());
    if (!step || step.type !== "question" || !meta) return true;
    syncCategoryAnswerFromDOM(step.id);
    return isCategoryAnswerValid(meta, step.id, categoryWizardDraft[step.id]);
  }

  function ensureCategoryModal() {
    if (!categoryModal) categoryModal = document.getElementById("category-onboarding-modal");
    return categoryModal;
  }

  function getPendingCategoryId() {
    if (pendingCategoryId) return pendingCategoryId;
    var modal = ensureCategoryModal();
    return modal ? modal.getAttribute("data-pending-category") : null;
  }

  function getCategoryWizardFoot() {
    var modal = ensureCategoryModal();
    return modal ? modal.querySelector("[data-category-wizard-foot]") : null;
  }

  function getCategoryWizardBody() {
    var modal = ensureCategoryModal();
    return modal ? modal.querySelector("[data-category-wizard-body]") : null;
  }

  function readCategoryAnswerFromDOM(questionId) {
    var body = getCategoryWizardBody();
    if (!body || !questionId) return "";
    var picks = body.querySelectorAll("[data-category-pick]");
    for (var i = 0; i < picks.length; i++) {
      var btn = picks[i];
      if (btn.getAttribute("data-category-pick") === questionId && btn.classList.contains("is-selected")) {
        return btn.getAttribute("data-category-value") || "";
      }
    }
    return "";
  }

  function syncAllCategoryAnswersFromDOM(meta) {
    var body = getCategoryWizardBody();
    if (!body || !meta) return;
    body.querySelectorAll("[data-category-pick].is-selected").forEach(function (btn) {
      var qid = btn.getAttribute("data-category-pick");
      var val = btn.getAttribute("data-category-value");
      if (isCategoryAnswerValid(meta, qid, val)) categoryWizardDraft[qid] = val;
    });
  }

  function syncCategoryAnswerFromDOM(questionId) {
    var meta = getStoreCategoryById(getPendingCategoryId());
    if (!meta || !questionId) return false;
    var value = readCategoryAnswerFromDOM(questionId);
    if (!isCategoryAnswerValid(meta, questionId, value)) return false;
    categoryWizardDraft[questionId] = value;
    return true;
  }

  function syncCategoryWizardNextButton() {
    var foot = getCategoryWizardFoot();
    if (!foot) return;
    var nextBtn = foot.querySelector("[data-category-wizard-next]");
    if (!nextBtn) return;
    var step = getCurrentCategoryWizardStep();
    if (!step || step.type !== "question") {
      nextBtn.disabled = false;
      nextBtn.removeAttribute("aria-disabled");
      return;
    }
    var answered = isCurrentCategoryStepAnswered() || syncCategoryAnswerFromDOM(step.id);
    nextBtn.disabled = false;
    nextBtn.setAttribute("aria-disabled", answered ? "false" : "true");
    nextBtn.classList.toggle("is-muted-next", !answered);
  }

  function selectCategoryWizardAnswer(questionId, value) {
    var meta = getStoreCategoryById(getPendingCategoryId());
    if (!meta || !isCategoryAnswerValid(meta, questionId, value)) return;
    categoryWizardDraft[questionId] = value;
    var body = getCategoryWizardBody();
    if (body) {
      body.querySelectorAll("[data-category-pick]").forEach(function (btn) {
        if (btn.getAttribute("data-category-pick") !== questionId) return;
        var isMatch = btn.getAttribute("data-category-value") === value;
        btn.classList.toggle("is-selected", isMatch);
        btn.setAttribute("aria-checked", isMatch ? "true" : "false");
      });
    }
    syncCategoryWizardNextButton();
  }

  function bindCategoryWizardFoot() {
    syncCategoryWizardNextButton();
  }

  function initCategoryWizardModal() {
    var modal = ensureCategoryModal();
    if (!modal || modal._categoryWizardBound) return;
    modal._categoryWizardBound = true;

    modal.addEventListener(
      "click",
      function (event) {
        if (!modal.classList.contains("is-open")) return;

        var pick = event.target.closest("[data-category-pick]");
        if (pick) {
          event.preventDefault();
          selectCategoryWizardAnswer(pick.getAttribute("data-category-pick"), pick.getAttribute("data-category-value"));
          return;
        }

        if (event.target.closest("[data-category-wizard-next]")) {
          event.preventDefault();
          categoryWizardNext();
          return;
        }

        if (event.target.closest("[data-category-wizard-back]")) {
          event.preventDefault();
          categoryWizardBack();
          return;
        }

        if (event.target.closest("[data-category-wizard-finish]")) {
          event.preventDefault();
          finishCategoryWizard();
          return;
        }

        if (event.target.closest(".panel-modal__backdrop[data-close-category-modal]")) {
          event.preventDefault();
          closeCategoryModal();
          return;
        }

        if (event.target.closest(".panel-modal__close[data-close-category-modal]")) {
          event.preventDefault();
          closeCategoryModal();
          return;
        }

        if (event.target.closest("[data-close-category-modal]")) {
          event.preventDefault();
          closeCategoryModal();
        }
      },
      true
    );

    modal.addEventListener("mousedown", function (event) {
      var pick = event.target.closest("[data-category-pick]");
      if (pick && modal.classList.contains("is-open")) pick.classList.add("is-pressing");
    });

    modal.addEventListener("mouseup", function (event) {
      modal.querySelectorAll("[data-category-pick].is-pressing").forEach(function (btn) {
        btn.classList.remove("is-pressing");
      });
    });
  }

  function deriveCategoryEnabledFeatures(meta, profile) {
    if (!meta || !profile) return [];
    var enabled = [];
    var p = profile;

    function add(id, label, desc) {
      enabled.push({ id: id, label: label, desc: desc, status: "active" });
    }

    if (meta.id === "fashion") {
      if (p.sizing === "sizes" || p.sizing === "variants") add("size-grid", "Siatka rozmiarów", "Warianty rozmiaru w produkcie i koszyku");
      if (p.sizing === "variants") add("color-variants", "Kolor + rozmiar", "Podwójne warianty jak w Shopify");
      if (p.sizing === "custom") add("made-to-order", "Na zamówienie", "Pole wymiarów pod klienta w formularzu");
      if (p.audience === "kids") add("kids-taxonomy", "Odzież dziecięca", "Filtry wieku i kategorii kids");
      if (p.priceRange === "premium") add("premium-merch", "Strefa premium", "Wyróżnione kolekcje i lookbook VIP");
    } else if (meta.id === "food") {
      if (p.fulfillment === "delivery" || p.fulfillment === "both") add("delivery-slots", "Okna dostawy", "Godziny i strefy dostawy w checkout");
      if (p.fulfillment === "pickup" || p.fulfillment === "both") add("pickup-points", "Odbiór osobisty", "Punkty odbioru w zamówieniu");
      if (p.fulfillment === "subscription") add("meal-subscription", "Subskrypcja boxów", "Cykliczne zamówienia cateringowe");
      if (p.freshness === "yes" || p.freshness === "sometimes") add("expiry-labels", "Data ważności", "Etykieta świeżości przy produkcie");
      if (p.productType === "ready" || p.productType === "mealbox") add("allergen-fields", "Alergeny", "Pola alergenów w opisie produktu");
    } else if (meta.id === "electronics") {
      if (p.specs === "critical" || p.specs === "important") add("spec-table", "Specyfikacja techniczna", "Tabela parametrów na karcie produktu");
      if (p.catalog === "pro" || p.catalog === "mixed") add("b2b-quotes", "Wyceny B2B", "Formularz zapytania ofertowego");
      if (p.warranty && p.warranty !== "none") add("warranty-badge", "Gwarancja", "Badge okresu gwarancji przy SKU");
      if (p.catalog === "refurb") add("condition-grade", "Stan produktu", "Klasa A/B/C dla outletu");
    } else if (meta.id === "beauty") {
      if (p.shades === "many" || p.shades === "few") add("shade-picker", "Wybór odcienia", "Paleta kolorów w wariantach");
      if (p.shades === "volume") add("volume-variants", "Pojemności", "Warianty ml / g");
      if (p.compliance === "full" || p.compliance === "basic") add("inci-block", "Skład INCI", "Sekcja składu w opisie produktu");
      if (p.productForm === "fragrance") add("fragrance-notes", "Nuty zapachowe", "Piramida zapachowa w opisie");
    } else if (meta.id === "home") {
      if (p.shipping === "freight" || p.shipping === "assembly") add("freight-delivery", "Dostawa XL", "Gabaryty i wycena transportu paletowego");
      if (p.customization === "yes" || p.customization === "sometimes") add("custom-dimensions", "Wymiary na zamówienie", "Konfigurator wymiarów mebli");
      if (p.productType === "furniture") add("assembly-info", "Montaż", "Informacja o montażu przy dostawie");
      if (p.shipping === "local") add("local-delivery", "Dostawa lokalna", "Mapa strefy i koszt dojazdu");
    } else if (meta.id === "services") {
      if (p.booking === "required" || p.booking === "optional") add("booking-calendar", "Rezerwacje", "Kalendarz terminów usług");
      if (p.delivery === "digital") add("digital-delivery", "Produkty cyfrowe", "Automatyczna wysyłka plików po płatności");
      if (p.billing === "subscription") add("subscriptions", "Subskrypcje", "Abonamenty i odnowienia");
      if (p.billing === "packages") add("vouchers", "Vouchery / karnety", "Pakiety wizyt i kredyty");
    } else if (meta.id === "general") {
      if (p.variants === "yes" || p.variants === "maybe") add("flex-variants", "Warianty produktów", "Rozmiary, kolory i opcje w katalogu");
      if (p.primaryGoal === "brand") add("brand-story", "Wizytówka marki", "Sekcja O marce i kontakt lead");
      if (p.catalogSize === "large") add("catalog-filters", "Filtry katalogu", "Zaawansowane filtrowanie oferty");
    }

    return enabled;
  }

  function buildCategoryFeaturesHtml(meta, profile) {
    var enabled = deriveCategoryEnabledFeatures(meta, profile);
    var planned = (meta && meta.features) || [];
    var enabledLabels = enabled.map(function (f) {
      return f.label.toLowerCase();
    });

    var rows = enabled
      .map(function (f) {
        return (
          '<li class="is-active"><i class="fas fa-circle-check" aria-hidden="true"></i> <strong>' +
          escapeHtml(f.label) +
          "</strong> — " +
          escapeHtml(f.desc) +
          "</li>"
        );
      })
      .concat(
        planned
          .filter(function (label) {
            return enabledLabels.indexOf(label.toLowerCase()) === -1;
          })
          .map(function (label) {
            return (
              '<li class="is-planned"><i class="fas fa-clock" aria-hidden="true"></i> ' +
              escapeHtml(label) +
              " — w kolejnej aktualizacji</li>"
            );
          })
      );

    return rows.join("");
  }

  function applyCategoryProfileSideEffects(project, meta, profile) {
    var patch = {};
    var features = deriveCategoryEnabledFeatures(meta, profile);
    patch.categoryFeatures = features.map(function (f) {
      return f.id;
    });

    if (meta.id === "fashion" && (profile.sizing === "sizes" || profile.sizing === "variants")) {
      patch.categoryProductDefaults = {
        suggestVariants: true,
        variantPresets:
          profile.sizing === "variants"
            ? [
                { name: "Rozmiar", options: ["XS", "S", "M", "L", "XL"] },
                { name: "Kolor", options: ["Czarny", "Biały", "Beżowy"] }
              ]
            : [{ name: "Rozmiar", options: ["XS", "S", "M", "L", "XL"] }]
      };
    }

    if (meta.id === "food") {
      var checkout = JSON.parse(JSON.stringify(project.checkout || getDefaultCheckout()));
      var methods = checkout.shipping.methods || [];
      var hasCourier = methods.some(function (m) {
        return m.id === "courier" || /kurier/i.test(m.name || "");
      });
      var hasPickup = methods.some(function (m) {
        return m.id === "pickup" || /odbiór/i.test(m.name || "");
      });
      if ((profile.fulfillment === "delivery" || profile.fulfillment === "both") && !hasCourier) {
        methods.push({
          id: "courier",
          name: "Kurier — dostawa pod drzwi",
          price: 14.99,
          eta: "1–2 dni robocze",
          enabled: true
        });
        checkout.shipping.methods = methods;
        patch.checkout = checkout;
      }
      if ((profile.fulfillment === "pickup" || profile.fulfillment === "both") && !hasPickup) {
        methods = (patch.checkout || checkout).shipping.methods || methods;
        methods.push({
          id: "pickup",
          name: "Odbiór osobisty",
          price: 0,
          eta: "Tego samego dnia",
          enabled: true
        });
        (patch.checkout || checkout).shipping.methods = methods;
        patch.checkout = patch.checkout || checkout;
      }
    }

    if (meta.id === "electronics" && profile.specs === "critical") {
      patch.categoryProductDefaults = Object.assign({}, project.categoryProductDefaults || {}, {
        suggestLongDesc: true,
        skuHint: "Dodaj SKU i tabelę parametrów w opisie rozszerzonym"
      });
    }

    return patch;
  }

  function renderCategoryProductHints(project) {
    var hint = $("[data-product-category-hint]");
    if (!hint || !project || !project.categoryOnboardingDone) return;
    var meta = getStoreCategoryById(project.storeCategory);
    if (!meta || !project.categoryProfile) return;
    var features = deriveCategoryEnabledFeatures(meta, project.categoryProfile);
    if (!features.length) return;
    var extra =
      project.categoryProductDefaults && project.categoryProductDefaults.suggestVariants
        ? " · Rozważ warianty rozmiaru/koloru poniżej"
        : "";
    hint.textContent =
      "Branża " +
      meta.name +
      ": aktywne " +
      features.length +
      " funkcje dopasowania" +
      extra +
      ".";
  }

  function maybeSuggestProductVariantsFromProfile(project) {
    if (!project || editingProductId) return;
    if (productVariantsDraft.length) return;
    var defaults = project.categoryProductDefaults;
    if (!defaults || !defaults.suggestVariants || !defaults.variantPresets) return;
    productVariantsDraft = defaults.variantPresets.map(function (preset) {
      return { id: uid("var"), name: preset.name, options: (preset.options || []).slice() };
    });
    renderProductVariantsEditor();
  }

  function getProductCategoryOptions(project) {
    var sf = storefrontApi();
    if (sf && sf.getProductCategoriesForIndustry) {
      return sf.getProductCategoriesForIndustry(project && project.storeCategory);
    }
    return [];
  }

  function getProductCategoryLabelForProject(project, categoryId) {
    if (!categoryId) return "";
    var sf = storefrontApi();
    if (sf && sf.getProductCategoryLabel) {
      return sf.getProductCategoryLabel(project && project.storeCategory, categoryId);
    }
    return categoryId;
  }

  function renderProductCategorySelect(project, selectedId) {
    var select = $("[data-product-category]");
    var hint = $("[data-product-category-hint]");
    if (!select) return;
    var options = getProductCategoryOptions(project);
    select.innerHTML =
      '<option value="">— Wybierz kategorię —</option>' +
      options
        .map(function (cat) {
          return (
            '<option value="' +
            escapeHtml(cat.id) +
            '"' +
            (selectedId === cat.id ? " selected" : "") +
            ">" +
            escapeHtml(cat.label) +
            "</option>"
          );
        })
        .join("");
    if (hint) {
      var catMeta = project && project.storeCategory ? getStoreCategoryById(project.storeCategory) : null;
      hint.textContent = catMeta
        ? "Kategorie dopasowane do branży: " + catMeta.name + ". Zmień branżę w edytorze, jeśli potrzebujesz innych etykiet."
        : "Wybierz branżę sklepu w edytorze — wtedy pokażemy kategorie dopasowane do Twojej oferty.";
    }
  }

  function inferSuggestedCategory(project) {
    if (!project) return null;
    if (project.templateId === "amiq-fashion" || project.theme === "fashion") return "fashion";
    if (project.templateId === "amiq-food" || project.theme === "food") return "food";
    if (project.templateId === "amiq-tech" || project.theme === "tech") return "electronics";
    return null;
  }

  function getCategoryWizardSteps(meta) {
    if (!meta) return [];
    return [{ id: "intro", type: "intro" }].concat(
      meta.questions.map(function (q) {
        return Object.assign({ type: "question" }, q);
      }),
      [{ id: "summary", type: "summary" }]
    );
  }

  function renderCategoryPicker(project) {
    var root = $("[data-store-category-root]");
    if (!root) return;
    if (!project) {
      root.innerHTML = "";
      return;
    }
    var current = getStoreCategoryById(project.storeCategory);
    var suggested = inferSuggestedCategory(project);
    var needsSetup = !project.categoryOnboardingDone || !project.storeCategory;

    root.innerHTML =
      (needsSetup
        ? '<div class="panel-category-banner"><i class="fas fa-compass" aria-hidden="true"></i><div><strong>Dopasuj sklep do branży</strong><span>Wybierz branżę — odpowiedzi z kreatora zapisujemy w profilu sklepu i wykorzystamy je przy włączaniu funkcji branżowych.</span></div></div>'
        : "") +
      '<div class="panel-category-grid">' +
      STORE_CATEGORIES.map(function (cat) {
        var active = project.storeCategory === cat.id;
        var isSuggested = !project.storeCategory && suggested === cat.id;
        return (
          '<button type="button" class="panel-category-chip panel-category-chip--' +
          escapeHtml(cat.id) +
          (active ? " is-active" : "") +
          (isSuggested ? " is-suggested" : "") +
          '" data-select-store-category="' +
          escapeHtml(cat.id) +
          '">' +
          '<span class="panel-category-chip__icon"><i class="fas ' +
          cat.icon +
          '" aria-hidden="true"></i></span>' +
          '<span class="panel-category-chip__body"><strong>' +
          escapeHtml(cat.name) +
          "</strong><span>" +
          escapeHtml(cat.desc) +
          "</span></span>" +
          (isSuggested ? '<span class="panel-category-chip__tag">Polecane</span>' : "") +
          (active ? '<span class="panel-category-chip__check"><i class="fas fa-check" aria-hidden="true"></i></span>' : "") +
          "</button>"
        );
      }).join("") +
      "</div>" +
      (current
        ? '<div class="panel-category-active">' +
          '<div class="panel-category-active__head"><span class="panel-category-active__label">Aktywna branża</span>' +
          (project.categoryOnboardingDone
            ? '<button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-edit-category-profile><i class="fas fa-pen" aria-hidden="true"></i> Edytuj odpowiedzi</button>'
            : "") +
          "</div>" +
          '<div class="panel-category-active__card">' +
          '<span class="panel-category-active__icon"><i class="fas ' +
          current.icon +
          '" aria-hidden="true"></i></span>' +
          "<div><strong>" +
          escapeHtml(current.name) +
          "</strong><p>" +
          escapeHtml(current.desc) +
          "</p>" +
          (project.categoryOnboardingDone && project.categoryProfile && Object.keys(project.categoryProfile).length
            ? '<dl class="panel-category-profile">' +
              buildCategoryProfileSummaryHtml(current, project.categoryProfile) +
              "</dl>"
            : "") +
          '<ul class="panel-category-active__features">' +
          buildCategoryFeaturesHtml(current, project.categoryProfile) +
          "</ul></div></div></div>"
        : '<p class="panel-category-hint"><i class="fas fa-hand-pointer" aria-hidden="true"></i> Wybierz kategorię powyżej, aby rozpocząć konfigurację.</p>');
  }

  function renderCategoryWizardContent() {
    var modal = ensureCategoryModal();
    var body = getCategoryWizardBody();
    var foot = getCategoryWizardFoot();
    var progress = modal ? modal.querySelector("[data-category-wizard-progress]") : null;
    var title = modal ? modal.querySelector("[data-category-wizard-title]") : null;
    var meta = getStoreCategoryById(getPendingCategoryId());
    if (!body || !foot || !meta) return;

    var steps = getCategoryWizardSteps(meta);
    var total = steps.length;
    var step = steps[categoryWizardStep] || steps[0];
    var pct = Math.round(((categoryWizardStep + 1) / total) * 100);

    if (progress) {
      progress.innerHTML =
        '<div class="panel-category-wizard__bar"><span style="width:' +
        pct +
        '%"></span></div><span class="panel-category-wizard__step">Krok ' +
        (categoryWizardStep + 1) +
        " z " +
        total +
        "</span>";
    }
    if (title) {
      title.textContent =
        step.type === "intro"
          ? "Konfiguracja: " + meta.name
          : step.type === "summary"
            ? "Podsumowanie"
            : step.title;
    }

    var questionIndex =
      step.type === "question" ? meta.questions.findIndex(function (q) { return q.id === step.id; }) + 1 : 0;

    if (step.type === "intro") {
      body.innerHTML =
        '<div class="panel-category-wizard-intro">' +
        '<div class="panel-category-wizard-intro__icon panel-category-wizard-intro__icon--' +
        escapeHtml(meta.id) +
        '"><i class="fas ' +
        meta.icon +
        '" aria-hidden="true"></i></div>' +
        "<h3>" +
        escapeHtml(meta.name) +
        "</h3>" +
        "<p>" +
        escapeHtml(meta.desc) +
        "</p>" +
        '<ul class="panel-category-wizard-intro__list">' +
        meta.features
          .map(function (f) {
            return "<li><i class=\"fas fa-circle-check\" aria-hidden=\"true\"></i> " + escapeHtml(f) + " — przygotujemy pod Twoją branżę</li>";
          })
          .join("") +
        "</ul>" +
        '<p class="panel-category-wizard-note">3 krótkie pytania · ~1 minuta · możesz zmienić kategorię później w edytorze.</p></div>';
      foot.innerHTML =
        '<button type="button" class="panel-ghost-btn" data-close-category-modal>Anuluj</button>' +
        '<button type="button" class="panel-primary-btn" data-category-wizard-next>Dalej <i class="fas fa-arrow-right" aria-hidden="true"></i></button>';
      bindCategoryWizardFoot();
      return;
    }

    if (step.type === "question") {
      var selected = isCategoryAnswerValid(meta, step.id, categoryWizardDraft[step.id])
        ? categoryWizardDraft[step.id]
        : "";
      if (!selected && categoryWizardDraft[step.id]) delete categoryWizardDraft[step.id];
      body.innerHTML =
        '<p class="panel-category-wizard-qnum">Pytanie ' + questionIndex + " z " + meta.questions.length + "</p>" +
        (step.hint ? '<p class="panel-category-wizard-lead">' + escapeHtml(step.hint) + "</p>" : "") +
        '<div class="panel-category-options" data-category-question="' +
        escapeHtml(step.id) +
        '" role="radiogroup" aria-label="' +
        escapeHtml(step.title) +
        '">' +
        step.options
          .map(function (opt) {
            var isSelected = selected === opt.value;
            return (
              '<button type="button" class="panel-category-option' +
              (isSelected ? " is-selected" : "") +
              '" role="radio" aria-checked="' +
              (isSelected ? "true" : "false") +
              '" data-category-pick="' +
              escapeHtml(step.id) +
              '" data-category-value="' +
              escapeHtml(opt.value) +
              '"><span class="panel-category-option__mark" aria-hidden="true"><i class="fas fa-check"></i></span><div><strong>' +
              escapeHtml(opt.label) +
              "</strong>" +
              (opt.sub ? "<span>" + escapeHtml(opt.sub) + "</span>" : "") +
              "</div></button>"
            );
          })
          .join("") +
        "</div>";
      foot.innerHTML =
        '<button type="button" class="panel-ghost-btn" data-category-wizard-back>' +
        (categoryWizardStep === 1 ? "Anuluj" : "Wstecz") +
        "</button>" +
        '<button type="button" class="panel-primary-btn" data-category-wizard-next>Dalej <i class="fas fa-arrow-right" aria-hidden="true"></i></button>';
      bindCategoryWizardFoot();
      return;
    }

    if (step.type === "summary") {
      var enabledFeatures = deriveCategoryEnabledFeatures(meta, categoryWizardDraft);
      body.innerHTML =
        '<p class="panel-category-wizard-lead">Na podstawie odpowiedzi włączamy funkcje dopasowane do Twojej branży. Możesz je później edytować, zmieniając odpowiedzi w profilu sklepu.</p>' +
        (enabledFeatures.length
          ? '<div class="panel-category-unlocked"><h3 class="panel-category-unlocked__title"><i class="fas fa-bolt" aria-hidden="true"></i> Aktywne po zapisaniu</h3><ul class="panel-category-unlocked__list">' +
            enabledFeatures
              .map(function (f) {
                return (
                  "<li><strong>" +
                  escapeHtml(f.label) +
                  "</strong><span>" +
                  escapeHtml(f.desc) +
                  "</span></li>"
                );
              })
              .join("") +
            "</ul></div>"
          : "") +
        '<dl class="panel-category-summary">' +
        '<div class="panel-category-summary__row"><dt>Kategoria</dt><dd><i class="fas ' +
        meta.icon +
        '" aria-hidden="true"></i> ' +
        escapeHtml(meta.name) +
        "</dd></div>" +
        meta.questions
          .map(function (q) {
            var val = categoryWizardDraft[q.id];
            var opt = q.options.find(function (o) {
              return o.value === val;
            });
            return (
              '<div class="panel-category-summary__row"><dt>' +
              escapeHtml(q.title) +
              "</dt><dd>" +
              escapeHtml(opt ? opt.label : "—") +
              "</dd></div>"
            );
          })
          .join("") +
        "</dl>";
      foot.innerHTML =
        '<button type="button" class="panel-ghost-btn" data-category-wizard-back>Wstecz</button>' +
        '<button type="button" class="panel-primary-btn" data-category-wizard-finish><i class="fas fa-check" aria-hidden="true"></i> Zapisz i kontynuuj</button>';
      bindCategoryWizardFoot();
    }
  }

  function openCategoryOnboarding(categoryId) {
    var project = getActiveProject();
    if (!project || !categoryId) return;
    pendingCategoryId = categoryId;
    var metaForDraft = getStoreCategoryById(categoryId);
    categoryWizardDraft = sanitizeCategoryWizardDraft(metaForDraft, Object.assign({}, project.categoryProfile || {}));
    categoryWizardStep = 0;
    categoryWizardIsFirstTime = !project.categoryOnboardingDone || !project.storeCategory;
    if (!ensureCategoryModal()) return;
    categoryModal.setAttribute("data-pending-category", categoryId);
    initCategoryWizardModal();
    renderCategoryWizardContent();
    categoryModal.hidden = false;
    categoryModal.classList.add("is-open");
    categoryModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
  }

  function closeCategoryModal() {
    if (!categoryModal || !categoryModal.classList.contains("is-open")) return;
    categoryModal.classList.remove("is-open");
    categoryModal.setAttribute("aria-hidden", "true");
    categoryModal.removeAttribute("data-pending-category");
    pendingCategoryId = null;
    syncBodyModalLock();
    window.setTimeout(function () {
      if (categoryModal && !categoryModal.classList.contains("is-open")) categoryModal.hidden = true;
    }, 280);
  }

  function selectStoreCategory(categoryId) {
    var project = getActiveProject();
    if (!project) return;
    var meta = getStoreCategoryById(categoryId);
    if (!meta) return;

    if (project.storeCategory === categoryId && project.categoryOnboardingDone) {
      openCategoryOnboarding(categoryId);
      return;
    }

    if (project.categoryOnboardingDone && project.storeCategory && project.storeCategory !== categoryId) {
      pendingCategoryId = categoryId;
      categoryWizardDraft = {};
      categoryWizardStep = 0;
      categoryWizardIsFirstTime = false;
      openCategoryOnboarding(categoryId);
      showToast("Nowa branża — odpowiedz na 3 pytania, aby zaktualizować profil sklepu.");
      return;
    }

    openCategoryOnboarding(categoryId);
  }

  function categoryWizardNext() {
    var catId = getPendingCategoryId();
    var meta = getStoreCategoryById(catId);
    if (!meta) {
      showToast("Błąd kreatora — otwórz branżę ponownie.");
      return;
    }
    var steps = getCategoryWizardSteps(meta);
    if (!steps.length) return;
    if (categoryWizardStep >= steps.length - 1) return;

    var step = steps[categoryWizardStep];
    if (step && step.type === "question") {
      syncAllCategoryAnswersFromDOM(meta);
      syncCategoryAnswerFromDOM(step.id);
      if (!isCategoryAnswerValid(meta, step.id, categoryWizardDraft[step.id])) {
        showToast("Wybierz jedną z opcji, aby przejść dalej.");
        return;
      }
    }

    categoryWizardStep += 1;
    renderCategoryWizardContent();
  }

  function categoryWizardBack() {
    if (categoryWizardStep <= 0) {
      closeCategoryModal();
      return;
    }
    categoryWizardStep -= 1;
    renderCategoryWizardContent();
  }

  function finishCategoryWizard() {
    var project = getActiveProject();
    var meta = getStoreCategoryById(getPendingCategoryId());
    if (!project || !meta) return;
    var steps = getCategoryWizardSteps(meta);
    var cleanProfile = sanitizeCategoryWizardDraft(meta, categoryWizardDraft);
    var missing = meta.questions.filter(function (q) {
      return !isCategoryAnswerValid(meta, q.id, cleanProfile[q.id]);
    });
    if (missing.length) {
      showToast("Uzupełnij wszystkie pytania.");
      categoryWizardStep = steps.findIndex(function (s) {
        return s.type === "question" && s.id === missing[0].id;
      });
      if (categoryWizardStep < 0) categoryWizardStep = 1;
      renderCategoryWizardContent();
      return;
    }
    var sideEffects = applyCategoryProfileSideEffects(project, meta, cleanProfile);
    var enabledCount = deriveCategoryEnabledFeatures(meta, cleanProfile).length;
    updateProject(
      project.id,
      Object.assign(
        {
          storeCategory: getPendingCategoryId(),
          categoryProfile: cleanProfile,
          categoryOnboardingDone: true,
          categoryConfiguredAt: Date.now()
        },
        sideEffects
      )
    );
    pushActivity(project.id, "Skonfigurowano branżę: " + meta.name);
    closeCategoryModal();
    var updated = getProjectById(project.id);
    renderCategoryPicker(updated);
    renderEditor();
    renderProductCategorySelect(updated, null);
    showToast(
      "Profil „" +
        meta.name +
        "” zapisany" +
        (enabledCount ? " — aktywowano " + enabledCount + " funkcji branżowych." : ".")
    );
  }

  /* ---- Store preview HTML ---- */
  function buildPreviewHTML(project, compact) {
    var sf = storefrontApi();
    if (sf) {
      return sf.buildPanelPreview(project, { compact: compact, device: previewDeviceMode });
    }
    if (!project) {
      return '<div class="panel-preview-empty"><strong>Brak aktywnego projektu</strong><p>Stwórz sklep, aby zobaczyć podgląd.</p></div>';
    }
    return "";
  }

  function bindPreviewControls(root) {
    if (!root) return;
    var preview = root.querySelector("[data-store-preview]");
    var sf = storefrontApi();
    var onMobilePanel = sf && !sf.isDesktopViewport();
    if (!onMobilePanel) {
      var buttons = root.querySelectorAll("[data-preview-device]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          previewDeviceMode = btn.getAttribute("data-preview-device") === "mobile" ? "mobile" : "desktop";
          renderPreviewTargets();
        });
      });
    } else {
      previewDeviceMode = "mobile";
    }
    var project = getActiveProject();
    if (sf && sf.wireStorefront && preview && project) {
      preview._sfProductId = null;
      sf.wireStorefront(preview, project, {
        compact: !!preview.classList.contains("panel-store-preview--compact"),
        device: onMobilePanel ? "mobile" : previewDeviceMode
      });
    }
  }

  function openFullPreview() {
    var sf = storefrontApi();
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw stwórz lub wybierz projekt.");
      openModal(getProjects().length ? "mine" : "create");
      return;
    }
    saveProjects(getProjects());
    if (sf && sf.savePreviewSnapshot) sf.savePreviewSnapshot(project);
    window.open(
      "sklep-podglad.html?id=" + encodeURIComponent(project.id),
      "amiqplace_store_preview"
    );
  }

  function applyIncomingPanelRoute() {
    try {
      var params = new URLSearchParams(window.location.search);
      var projectId = params.get("project");
      var view = params.get("view");
      var changed = false;
      if (projectId && getProjectById(projectId)) {
        setActiveProject(projectId);
        changed = true;
      }
      if (changed) renderAllPanels();
      var allowedViews = [
        "dashboard",
        "editor",
        "theme",
        "products",
        "orders",
        "checkout",
        "customers",
        "analytics",
        "settings",
        "wallet",
        "plugins",
        "plugin-app",
        "community"
      ];
      if (view && allowedViews.indexOf(view) !== -1) {
        switchView(view);
      } else if (changed) {
        refreshUI();
      }
      if (projectId || view) {
        var cleanPath = window.location.pathname.split("/").pop() || "panel.html";
        history.replaceState(null, "", cleanPath);
      }
    } catch (e) {}
  }

  function renderPreviewTargets() {
    var project = getActiveProject();
    var dashWrap = $("[data-store-preview-wrap]");
    var editorWrap = $("[data-editor-preview-wrap]");
    var themeWrap = $("[data-theme-preview-wrap]");
    if (dashWrap) {
      dashWrap.innerHTML = buildPreviewHTML(project, false);
      bindPreviewControls(dashWrap);
    }
    if (editorWrap) {
      editorWrap.innerHTML = buildPreviewHTML(project, true);
      bindPreviewControls(editorWrap);
    }
    if (themeWrap) {
      themeWrap.innerHTML = buildPreviewHTML(project, true);
      bindPreviewControls(themeWrap);
    }
    var subtitle = $("[data-preview-subtitle]");
    if (subtitle) {
      var sf = storefrontApi();
      if (sf && !sf.isDesktopViewport()) {
        subtitle.textContent = project
          ? "Podgląd mobilny: " + project.name + " — pełną stronę otwórz przyciskiem poniżej."
          : "Podgląd mobilny sklepu — pełna strona dostępna przyciskiem poniżej.";
      } else {
        subtitle.textContent = project
          ? "Szybki podgląd: " + project.name + " — dla finalnego wyglądu użyj pełnej strony."
          : "Szybki podgląd w panelu — pełna strona po utworzeniu projektu.";
      }
    }
  }

  function renderChecklistHTML(project, editable, container) {
    if (!container) return;
    if (!project) {
      container.innerHTML = CHECKLIST_ITEMS.map(function (item) {
        return (
          '<article class="panel-step panel-step--static">' +
          '<span class="panel-step__icon"><i class="fas ' +
          item.icon +
          '" aria-hidden="true"></i></span>' +
          "<div><strong>" +
          escapeHtml(item.title) +
          "</strong><span>" +
          escapeHtml(item.sub) +
          '</span></div><span class="panel-step__status">—</span></article>'
        );
      }).join("");
      return;
    }
    container.innerHTML = CHECKLIST_ITEMS.map(function (item) {
      var done = project.checklist[item.key];
      var statusLabel = done ? "Gotowe" : editable ? "Konfiguruj" : "Start";
      var actionAttr =
        item.action === "checkout"
          ? ' data-open-checkout="' + escapeHtml(item.checkoutStep) + '"'
          : item.action
            ? ' data-checklist-go="' + escapeHtml(item.action) + '"'
            : "";
      if (editable) {
        return (
          '<button type="button" class="panel-step panel-step--check' +
          (done ? " is-done" : "") +
          '"' +
          actionAttr +
          ">" +
          '<span class="panel-step__icon"><i class="fas ' +
          (done ? "fa-circle-check" : item.icon) +
          '" aria-hidden="true"></i></span>' +
          "<div><strong>" +
          escapeHtml(item.title) +
          "</strong><span>" +
          escapeHtml(item.sub) +
          '</span></div><span class="panel-step__status">' +
          statusLabel +
          "</span></button>"
        );
      }
      return (
        '<article class="panel-step panel-step--static' +
        (done ? " is-done" : "") +
        '">' +
        '<span class="panel-step__icon"><i class="fas ' +
        (done ? "fa-circle-check" : item.icon) +
        '" aria-hidden="true"></i></span>' +
        "<div><strong>" +
        escapeHtml(item.title) +
        "</strong><span>" +
        escapeHtml(item.sub) +
        '</span></div><span class="panel-step__status">' +
        (done ? "Gotowe" : "Start") +
        "</span></article>"
      );
    }).join("");
  }

  function renderActivityFeed() {
    var feed = $("[data-activity-feed]");
    if (!feed) return;
    var project = getActiveProject();
    if (!project || !project.activity || !project.activity.length) {
      feed.innerHTML =
        '<article class="panel-order"><div><strong>Brak aktywności</strong><span>Otwórz projekt i dodaj produkt, aby zobaczyć historię.</span></div><span class="panel-order__price">—</span></article>';
      return;
    }
    feed.innerHTML = project.activity
      .map(function (a) {
        return (
          '<article class="panel-order"><div><strong>' +
          escapeHtml(a.text) +
          "</strong><span>" +
          new Date(a.ts).toLocaleString("pl-PL") +
          '</span></div><span class="panel-order__price">Demo</span></article>'
        );
      })
      .join("");
  }

  function startOfDay(ts) {
    var d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function getAnalyticsRangeDays(rangeKey) {
    return rangeKey === "30d" ? 30 : 7;
  }

  function formatChangePct(value) {
    if (!value || !isFinite(value)) return "—";
    var sign = value > 0 ? "+" : "";
    return sign + value.toFixed(0) + "%";
  }

  function computeAnalytics(project, rangeKey) {
    if (!project) return null;
    var days = getAnalyticsRangeDays(rangeKey || analyticsRange);
    var now = Date.now();
    var rangeStart = startOfDay(now - (days - 1) * 86400000);
    var prevRangeStart = startOfDay(rangeStart - days * 86400000);
    var allOrders = project.orders || [];
    var customers = syncCustomersFromOrders(project);

    function ordersInRange(start, end) {
      return allOrders.filter(function (o) {
        var t = o.createdAt || 0;
        return t >= start && (end == null || t < end);
      });
    }

    function sumRevenue(list) {
      return list.reduce(function (sum, o) {
        return sum + (Number(o.total) || 0);
      }, 0);
    }

    var rangeOrders = ordersInRange(rangeStart);
    var prevOrders = ordersInRange(prevRangeStart, rangeStart);
    var revenue = sumRevenue(rangeOrders);
    var prevRevenue = sumRevenue(prevOrders);
    var ordersCount = rangeOrders.length;
    var avgOrder = ordersCount ? revenue / ordersCount : 0;
    var todayStart = startOfDay(now);
    var todayRevenue = sumRevenue(ordersInRange(todayStart));

    var activeProducts = (project.products || []).filter(function (p) {
      return p.status === "active";
    }).length;
    var visits = Math.round(36 + activeProducts * 14 + allOrders.length * 8 + days * 3);
    var rangeVisits = Math.round(visits * (days / 30) * (0.85 + (ordersCount / Math.max(1, days)) * 0.12));
    var conversion = rangeVisits > 0 ? Math.min(99, (ordersCount / rangeVisits) * 100) : 0;
    var changePct = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : revenue > 0 ? 100 : 0;

    var buckets = [];
    var i;
    for (i = 0; i < days; i++) {
      var dayStart = startOfDay(now - (days - 1 - i) * 86400000);
      var dayEnd = dayStart + 86400000;
      var dayOrders = ordersInRange(dayStart, dayEnd);
      var dayRev = sumRevenue(dayOrders);
      buckets.push({
        label:
          days <= 7
            ? new Date(dayStart).toLocaleDateString("pl-PL", { weekday: "short" })
            : new Date(dayStart).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
        revenue: dayRev,
        orders: dayOrders.length,
        visits: Math.round(rangeVisits / days + dayOrders.length * 6)
      });
    }

    var productMap = {};
    rangeOrders.forEach(function (o) {
      var name = o.productName || "Produkt";
      if (!productMap[name]) productMap[name] = { name: name, count: 0, revenue: 0 };
      productMap[name].count += o.itemCount || 1;
      productMap[name].revenue += Number(o.total) || 0;
    });
    var topProducts = Object.keys(productMap)
      .map(function (key) {
        return productMap[key];
      })
      .sort(function (a, b) {
        return b.revenue - a.revenue;
      })
      .slice(0, 5);

    var returning = customers.filter(function (c) {
      return (c.ordersCount || 0) > 1;
    }).length;

    return {
      days: days,
      revenue: revenue,
      prevRevenue: prevRevenue,
      changePct: changePct,
      ordersCount: ordersCount,
      avgOrder: avgOrder,
      todayRevenue: todayRevenue,
      visits: rangeVisits,
      conversion: conversion,
      buckets: buckets,
      topProducts: topProducts,
      customersTotal: customers.length,
      returningCustomers: returning,
      newCustomers: Math.max(0, customers.length - returning)
    };
  }

  function getAnalyticsMetricValue(bucket, metric) {
    if (metric === "orders") return bucket.orders;
    if (metric === "visits") return bucket.visits;
    return bucket.revenue;
  }

  function formatAnalyticsMetricValue(value, metric) {
    if (metric === "revenue") return formatPrice(value);
    return String(Math.round(value));
  }

  function buildAnalyticsChartHtml(buckets, metric) {
    if (!buckets.length) {
      return (
        '<div class="panel-modal__empty"><strong>Brak danych w tym okresie</strong>Wygeneruj demo zamówienie w sekcji Zamówienia, aby zobaczyć wykres.</div>'
      );
    }
    var max = 1;
    buckets.forEach(function (b) {
      var v = getAnalyticsMetricValue(b, metric);
      if (v > max) max = v;
    });
    var cols = buckets.length;
    var bars = buckets
      .map(function (b) {
        var v = getAnalyticsMetricValue(b, metric);
        var h = Math.max(6, Math.round((v / max) * 100));
        return (
          '<span style="height:' +
          h +
          '%" title="' +
          escapeHtml(b.label) +
          ": " +
          escapeHtml(formatAnalyticsMetricValue(v, metric)) +
          '"></span>'
        );
      })
      .join("");
    var labels = buckets
      .map(function (b) {
        return "<span>" + escapeHtml(b.label) + "</span>";
      })
      .join("");
    return (
      '<div class="panel-chart-labeled' +
      (cols > 12 ? " panel-chart-labeled--dense" : "") +
      '"><div class="panel-chart panel-chart--' +
      cols +
      '" role="img" aria-label="Wykres">' +
      bars +
      '</div><div class="panel-chart-labels">' +
      labels +
      "</div></div>"
    );
  }

  function renderDashboardAnalytics(project) {
    var analytics = project ? computeAnalytics(project, "7d") : null;
    var sales = $("[data-stat-sales]");
    var salesHint = $("[data-stat-sales-hint]");
    var visits = $("[data-stat-visits]");
    var visitsHint = $("[data-stat-visits-hint]");
    var miniSub = $("[data-analytics-mini-subtitle]");
    var miniRev = $("[data-analytics-mini-revenue]");
    var miniOrders = $("[data-analytics-mini-orders]");
    var miniAov = $("[data-analytics-mini-aov]");
    var miniChart = $("[data-analytics-mini-chart]");

    if (!analytics) {
      if (sales) sales.textContent = formatPrice(0);
      if (salesHint) salesHint.textContent = "Brak zamówień";
      if (visits) visits.textContent = "0";
      if (visitsHint) visitsHint.textContent = "Symulacja demo";
      if (miniRev) miniRev.textContent = formatPrice(0);
      if (miniOrders) miniOrders.textContent = "0";
      if (miniAov) miniAov.textContent = formatPrice(0);
      if (miniChart) miniChart.innerHTML = buildAnalyticsChartHtml([], "revenue");
      return;
    }

    if (sales) sales.textContent = formatPrice(analytics.todayRevenue);
    if (salesHint) {
      salesHint.textContent = analytics.todayRevenue > 0 ? "Z dzisiejszych zamówień" : "Brak zamówień dziś";
    }
    if (visits) visits.textContent = String(analytics.visits);
    if (visitsHint) {
      visitsHint.textContent = formatChangePct(analytics.changePct) + " vs poprzedni okres";
      visitsHint.style.color = analytics.changePct >= 0 ? "" : "rgba(255, 160, 160, 0.95)";
    }
    if (miniSub) miniSub.textContent = "Ostatnie 7 dni — " + analytics.ordersCount + " zamów., " + formatPrice(analytics.revenue) + " przychodu.";
    if (miniRev) miniRev.textContent = formatPrice(analytics.revenue);
    if (miniOrders) miniOrders.textContent = String(analytics.ordersCount);
    if (miniAov) miniAov.textContent = formatPrice(analytics.avgOrder);
    if (miniChart) miniChart.innerHTML = buildAnalyticsChartHtml(analytics.buckets, "revenue");
  }

  function renderAnalytics() {
    var project = getActiveProject();
    var empty = $("[data-analytics-empty]");
    var layout = $("[data-analytics-layout]");
    if (!empty || !layout) return;

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;

    var nameEl = $("[data-analytics-project-name]");
    if (nameEl) nameEl.textContent = project.name;

    $all("[data-analytics-range]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-analytics-range") === analyticsRange);
    });
    $all("[data-analytics-metric]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-analytics-metric") === analyticsMetric);
    });

    var analytics = computeAnalytics(project, analyticsRange);
    var metricLabels = { revenue: "Przychód", orders: "Zamówienia", visits: "Odwiedziny" };
    var periodLabel = analyticsRange === "30d" ? "30 dni" : "7 dni";
    var chartTitle = $("[data-analytics-chart-title]");
    var chartSub = $("[data-analytics-chart-subtitle]");
    var periodEl = $("[data-analytics-period-label]");
    if (chartTitle) chartTitle.textContent = (metricLabels[analyticsMetric] || "Przychód") + " — ostatnie " + periodLabel;
    if (chartSub) {
      chartSub.textContent =
        analyticsMetric === "visits"
          ? "Symulowane odwiedziny na podstawie produktów i zamówień demo."
          : "Sumy dzienne z zamówień demo w wybranym okresie.";
    }
    if (periodEl) periodEl.textContent = periodLabel;

    var kpis = $("[data-analytics-kpis]");
    if (kpis && analytics) {
      var trendClass = analytics.changePct >= 0 ? "is-up" : "is-down";
      kpis.innerHTML =
        '<article class="panel-analytics-kpi ' +
        trendClass +
        '"><span class="panel-analytics-kpi__icon"><i class="fas fa-coins"></i></span><div><span>Przychód</span><strong>' +
        escapeHtml(formatPrice(analytics.revenue)) +
        '</strong><small>' +
        escapeHtml(formatChangePct(analytics.changePct)) +
        " vs poprzedni okres</small></div></article>" +
        '<article class="panel-analytics-kpi"><span class="panel-analytics-kpi__icon"><i class="fas fa-cart-shopping"></i></span><div><span>Zamówienia</span><strong>' +
        analytics.ordersCount +
        '</strong><small>W wybranym okresie</small></div></article>' +
        '<article class="panel-analytics-kpi"><span class="panel-analytics-kpi__icon"><i class="fas fa-receipt"></i></span><div><span>Średni koszyk</span><strong>' +
        escapeHtml(formatPrice(analytics.avgOrder)) +
        '</strong><small>Na zamówienie</small></div></article>' +
        '<article class="panel-analytics-kpi"><span class="panel-analytics-kpi__icon"><i class="fas fa-percent"></i></span><div><span>Konwersja</span><strong>' +
        analytics.conversion.toFixed(1) +
        '%</strong><small>Demo · ' +
        analytics.visits +
        " odwiedzin</small></div></article>";
    }

    var chart = $("[data-analytics-chart]");
    if (chart && analytics) chart.innerHTML = buildAnalyticsChartHtml(analytics.buckets, analyticsMetric);

    var topEl = $("[data-analytics-top-products]");
    if (topEl) {
      if (!analytics.topProducts.length) {
        topEl.innerHTML =
          '<div class="panel-modal__empty"><strong>Brak sprzedaży</strong>Dodaj produkty i symuluj zamówienia, aby zobaczyć ranking.</div>';
      } else {
        var maxRev = analytics.topProducts[0].revenue || 1;
        topEl.innerHTML =
          '<div class="panel-analytics-bars">' +
          analytics.topProducts
            .map(function (p, index) {
              var width = Math.max(8, Math.round((p.revenue / maxRev) * 100));
              return (
                '<div class="panel-analytics-bar-row"><div class="panel-analytics-bar-row__rank">' +
                (index + 1) +
                '</div><div class="panel-analytics-bar-row__body"><div class="panel-analytics-bar-row__head"><strong>' +
                escapeHtml(p.name) +
                "</strong><span>" +
                escapeHtml(formatPrice(p.revenue)) +
                '</span></div><div class="panel-analytics-bar-row__track"><span style="width:' +
                width +
                '%"></span></div><small>' +
                p.count +
                " szt.</small></div></div>"
              );
            })
            .join("") +
          "</div>";
      }
    }

    var custEl = $("[data-analytics-customers]");
    if (custEl && analytics) {
      custEl.innerHTML =
        '<div class="panel-analytics-customer-stats">' +
        '<article><span>Wszyscy klienci</span><strong>' +
        analytics.customersTotal +
        "</strong></article>" +
        '<article><span>Nowi</span><strong>' +
        analytics.newCustomers +
        "</strong></article>" +
        '<article><span>Powracający</span><strong>' +
        analytics.returningCustomers +
        "</strong></article>" +
        "</div>" +
        '<p class="panel-analytics-note"><i class="fas fa-circle-info" aria-hidden="true"></i> Klienci są tworzeni automatycznie z demo zamówień lub dodawani ręcznie w sekcji Klienci.</p>' +
        '<button type="button" class="panel-ghost-btn" data-panel-nav="customers"><i class="fas fa-users" aria-hidden="true"></i> Przejdź do klientów</button>';
    }
  }

  function renderDashboard() {
    var project = getActiveProject();
    var done = project ? checklistDone(project) : 0;
    var productCount = project ? (project.products || []).length : 0;
    var activeProducts = project
      ? (project.products || []).filter(function (p) {
          return p.status === "active";
        }).length
      : 0;

    var statProducts = $("[data-stat-products]");
    if (statProducts) statProducts.textContent = String(productCount);
    var statHint = $("[data-stat-products-hint]");
    if (statHint) statHint.textContent = productCount ? activeProducts + " aktywnych" : "Dodaj pierwszy";
    var statStatus = $("[data-stat-status]");
    if (statStatus) statStatus.textContent = project ? (project.status === "published" ? "Live" : "Szkic") : "Szkic";
    var statCheck = $("[data-stat-checklist]");
    if (statCheck) statCheck.textContent = project && project.status === "published" ? "Opublikowany" : done + "/4 kroków";
    var prog = $("[data-checklist-progress]");
    if (prog) prog.textContent = done + "/4";

    renderChecklistHTML(project, false, $("[data-dashboard-checklist]"));
    renderDashboardPublish(project);
    renderDashboardAnalytics(project);
    renderDashboardInventoryAlerts(project);
    renderActivityFeed();
    renderPreviewTargets();
    updateActiveProjectUI();
  }

  function renderThemePicker(project) {
    var picker = $("[data-theme-picker]");
    var hint = $("[data-theme-locked-hint]");
    if (!picker || !project) return;
    var locked = getLockedThemeForTemplate(project.templateId);
    var themes = getThemesForProject(project);
    var activeTheme = locked || project.theme || project.thumb || "blank";
    if (hint) {
      if (locked) {
        hint.hidden = false;
        hint.innerHTML =
          '<i class="fas fa-lock" aria-hidden="true"></i> Układ szablonu <strong>' +
          escapeHtml(getProjectTemplateLabel(project)) +
          "</strong> jest stały — zmieniasz tu kolory akcentu, tryb jasny/ciemny i baner.";
      } else {
        hint.hidden = true;
      }
    }
    picker.innerHTML = themes
      .map(function (t) {
        var isActive = activeTheme === t.id;
        return (
          '<button type="button" class="panel-theme-chip' +
          (isActive ? " is-active" : "") +
          (locked ? " is-locked" : "") +
          '"' +
          (locked ? ' disabled aria-disabled="true"' : ' data-theme-select="' + t.id + '"') +
          ">" +
          '<i class="fas ' +
          t.icon +
          '" aria-hidden="true"></i>' +
          "<span>" +
          escapeHtml(t.label) +
          (locked ? " · szablon" : "") +
          "</span></button>"
        );
      })
      .join("");
  }

  function renderSectionsToggles(project) {
    var root = $("[data-sections-toggles]");
    if (!root || !project) return;
    var kind = getProjectTemplateKind(project);
    var vis = project.sectionVisibility || defaultSectionVisibilityForProject(project);
    var keys = Object.keys(SECTION_TOGGLE_META).filter(function (key) {
      return SECTION_TOGGLE_META[key].templates.indexOf(kind) !== -1;
    });
    root.innerHTML =
      '<div class="panel-section-toggles">' +
      keys
        .map(function (key) {
          return sectionVisibilityToggleCardHtml(key, vis);
        })
        .join("") +
      "</div>";
  }

  function sectionVisibilityToggleCardHtml(key, vis) {
    var meta = SECTION_TOGGLE_META[key];
    if (!meta) return "";
    var on = vis[key] !== false;
    return (
      '<label class="panel-section-toggle' +
      (on ? " is-on" : "") +
      '">' +
      '<input type="checkbox" data-section-toggle="' +
      escapeHtml(key) +
      '"' +
      (on ? " checked" : "") +
      ">" +
      '<span class="panel-section-toggle__track" aria-hidden="true"></span>' +
      '<span class="panel-section-toggle__content">' +
      '<i class="fas ' +
      meta.icon +
      '" aria-hidden="true"></i>' +
      "<strong>" +
      escapeHtml(meta.label) +
      "</strong>" +
      "<span>" +
      (on ? "Widoczna na stronie" : "Ukryta — możesz włączyć ponownie") +
      "</span></span></label>"
    );
  }

  function sectionVisibilityToggleInlineHtml(key, vis) {
    var meta = SECTION_TOGGLE_META[key];
    if (!meta) return "";
    var on = vis[key] !== false;
    return (
      '<label class="panel-subsection-visibility' +
      (on ? " is-on" : "") +
      '" title="' +
      escapeHtml(meta.label) +
      '">' +
      '<input type="checkbox" data-section-toggle="' +
      escapeHtml(key) +
      '"' +
      (on ? " checked" : "") +
      ' aria-label="' +
      escapeHtml(meta.label) +
      (on ? " — widoczna" : " — ukryta") +
      '">' +
      '<span class="panel-subsection-visibility__track" aria-hidden="true"></span>' +
      '<span class="panel-subsection-visibility__label">' +
      (on ? "Widoczna" : "Ukryta") +
      "</span></label>"
    );
  }

  function renderInlineSectionVisibility(project) {
    if (!project) return;
    var vis = project.sectionVisibility || defaultSectionVisibilityForProject(project);
    $all("[data-subsection-visibility]").forEach(function (host) {
      var key = host.getAttribute("data-subsection-visibility");
      if (!key || !SECTION_TOGGLE_META[key]) return;
      host.innerHTML = sectionVisibilityToggleInlineHtml(key, vis);
    });
    $all("[data-editor-subsection]").forEach(function (el) {
      var key = el.getAttribute("data-editor-subsection");
      if (!key) return;
      el.classList.toggle("is-editor-subsection-off", vis[key] === false);
    });
    $all("[data-editor-subsection-card]").forEach(function (el) {
      var key = el.getAttribute("data-editor-subsection-card");
      if (!key) return;
      el.classList.toggle("is-editor-subsection-off", vis[key] === false);
    });
  }

  function renderTechSectionsOverview(project) {
    var root = $("[data-tech-sections-overview]");
    if (!root) return;
    if (!isTechProject(project)) {
      root.innerHTML = "";
      root.hidden = true;
      return;
    }
    root.hidden = false;
    var vis = project.sectionVisibility || defaultSectionVisibilityForProject(project);
    var keys = Object.keys(SECTION_TOGGLE_META).filter(function (key) {
      return SECTION_TOGGLE_META[key].templates.indexOf("tech") !== -1;
    });
    root.innerHTML =
      '<div class="panel-tech-vis-overview">' +
      '<p class="panel-tech-vis-overview__lead"><i class="fas fa-eye" aria-hidden="true"></i> Szybki podgląd widoczności sekcji — kliknij chip, aby włączyć lub ukryć na stronie sklepu.</p>' +
      '<div class="panel-tech-vis-overview__chips">' +
      keys
        .map(function (key) {
          var meta = SECTION_TOGGLE_META[key];
          var on = vis[key] !== false;
          return (
            '<button type="button" class="panel-tech-vis-chip' +
            (on ? " is-on" : "") +
            '" data-section-quick-toggle="' +
            escapeHtml(key) +
            '">' +
            '<i class="fas ' +
            meta.icon +
            '" aria-hidden="true"></i>' +
            "<span>" +
            escapeHtml(meta.label) +
            '</span><em class="panel-tech-vis-chip__state">' +
            (on ? "Widoczna" : "Ukryta") +
            "</em></button>"
          );
        })
        .join("") +
      "</div></div>";
  }

  function setProjectSectionVisibility(project, sectionKey, enabled) {
    if (!project || !sectionKey) return;
    var nextVis = Object.assign({}, project.sectionVisibility || defaultSectionVisibilityForProject(project));
    nextVis[sectionKey] = !!enabled;
    updateProject(project.id, { sectionVisibility: normalizeSectionVisibility(nextVis, project) });
    var updated = getActiveProject();
    renderSectionsToggles(updated);
    renderInlineSectionVisibility(updated);
    renderTechSectionsOverview(updated);
    renderEnterpriseSectionsOverview(updated);
    renderPreviewTargets();
  }

  function renderEditor() {
    var project = getActiveProject();
    var empty = $("[data-editor-empty]");
    var layout = $("[data-editor-layout]");
    if (!empty || !layout) return;

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;

    var title = $("[data-editor-title]");
    if (title) title.textContent = project.name;
    var slug = $("[data-editor-slug]");
    if (slug) slug.textContent = project.slug + ".amiqplace.pl";
    var status = $("[data-editor-status]");
    if (status) {
      status.textContent = project.status === "published" ? "Opublikowany" : "Szkic";
      status.classList.toggle("is-live", project.status === "published");
    }
    var heroT = $("[data-editor-hero-title]");
    if (heroT) heroT.value = project.heroTitle;
    var heroS = $("[data-editor-hero-subtitle]");
    if (heroS) heroS.value = project.heroSubtitle;
    var heroCta = $("[data-editor-hero-cta]");
    if (heroCta) heroCta.value = project.heroCta;
    var storeName = $("[data-editor-store-name]");
    if (storeName) storeName.value = project.storeName;
    var sectionTitle = $("[data-editor-section-title]");
    if (sectionTitle) sectionTitle.value = project.sectionTitle;
    var sectionSub = $("[data-editor-section-subtitle]");
    if (sectionSub) sectionSub.value = project.sectionSubtitle;
    var aboutTitle = $("[data-editor-about-title]");
    if (aboutTitle) aboutTitle.value = project.aboutTitle;
    var aboutText = $("[data-editor-about-text]");
    if (aboutText) aboutText.value = project.aboutText;
    var announcement = $("[data-editor-announcement]");
    if (announcement) announcement.value = project.announcement || "";
    var heroBadge = $("[data-editor-hero-badge]");
    if (heroBadge) heroBadge.value = project.heroBadge || "";
    var lookbookTitle = $("[data-editor-lookbook-title]");
    if (lookbookTitle) lookbookTitle.value = project.lookbookTitle || "";
    var lookbookSub = $("[data-editor-lookbook-subtitle]");
    if (lookbookSub) lookbookSub.value = project.lookbookSubtitle || "";
    var techCompareTitle = $("[data-editor-tech-compare-title]");
    if (techCompareTitle) techCompareTitle.value = project.techCompareTitle || "";
    var techCompareSub = $("[data-editor-tech-compare-subtitle]");
    if (techCompareSub) techCompareSub.value = project.techCompareSubtitle || "";
    var techFaqTitle = $("[data-editor-tech-faq-title]");
    if (techFaqTitle) techFaqTitle.value = project.techFaqTitle || "";
    var techFaqSub = $("[data-editor-tech-faq-subtitle]");
    if (techFaqSub) techFaqSub.value = project.techFaqSubtitle || "";
    var techCatTitle = $("[data-editor-tech-categories-title]");
    if (techCatTitle) techCatTitle.value = project.techCategoriesTitle || "";
    var techCatSub = $("[data-editor-tech-categories-subtitle]");
    if (techCatSub) techCatSub.value = project.techCategoriesSubtitle || "";
    var techBrandsLabel = $("[data-editor-tech-brands-label]");
    if (techBrandsLabel) techBrandsLabel.value = project.techBrandsLabel || "";
    var techBrands = $("[data-editor-tech-brands]");
    if (techBrands) techBrands.value = (project.techBrands || []).join("\n");
    var techSpecs = $("[data-editor-tech-compare-specs]");
    if (techSpecs) techSpecs.value = ((project.techCompare && project.techCompare.specKeys) || []).join("\n");
    var entBrandsTitle = $("[data-editor-enterprise-brands-title]");
    if (entBrandsTitle) entBrandsTitle.value = project.enterpriseBrandsTitle || "";
    var entBrandsSub = $("[data-editor-enterprise-brands-subtitle]");
    if (entBrandsSub) entBrandsSub.value = project.enterpriseBrandsSubtitle || "";
    var entSolTitle = $("[data-editor-enterprise-solutions-title]");
    if (entSolTitle) entSolTitle.value = project.enterpriseSolutionsTitle || "";
    var entSolSub = $("[data-editor-enterprise-solutions-subtitle]");
    if (entSolSub) entSolSub.value = project.enterpriseSolutionsSubtitle || "";
    var entSegTitle = $("[data-editor-enterprise-segments-title]");
    if (entSegTitle) entSegTitle.value = project.enterpriseSegmentsTitle || "";
    var entSegSub = $("[data-editor-enterprise-segments-subtitle]");
    if (entSegSub) entSegSub.value = project.enterpriseSegmentsSubtitle || "";
    var entCasesTitle = $("[data-editor-enterprise-cases-title]");
    if (entCasesTitle) entCasesTitle.value = project.enterpriseCasesTitle || "";
    var entCasesSub = $("[data-editor-enterprise-cases-subtitle]");
    if (entCasesSub) entCasesSub.value = project.enterpriseCasesSubtitle || "";
    var entPartnersLabel = $("[data-editor-enterprise-partners-label]");
    if (entPartnersLabel) entPartnersLabel.value = project.enterprisePartnersLabel || "";
    var entPartners = $("[data-editor-enterprise-partners]");
    if (entPartners) entPartners.value = (project.enterprisePartners || []).join("\n");
    var entFaqTitle = $("[data-editor-enterprise-faq-title]");
    if (entFaqTitle) entFaqTitle.value = project.enterpriseFaqTitle || "";
    var entFaqSub = $("[data-editor-enterprise-faq-subtitle]");
    if (entFaqSub) entFaqSub.value = project.enterpriseFaqSubtitle || "";
    var entPortalTitle = $("[data-editor-enterprise-portal-title]");
    if (entPortalTitle) entPortalTitle.value = project.enterprisePortalTitle || "";
    var entPortalSub = $("[data-editor-enterprise-portal-subtitle]");
    if (entPortalSub) entPortalSub.value = project.enterprisePortalSubtitle || "";
    var entPortalCta = $("[data-editor-enterprise-portal-cta]");
    if (entPortalCta) entPortalCta.value = project.enterprisePortalCta || "";
    syncEditorTemplateSections(project);
    renderSectionsToggles(project);
    renderInlineSectionVisibility(project);
    renderTechSectionsOverview(project);
    renderEnterpriseSectionsOverview(project);
    renderCollectionsEditor();
    renderTechStatsEditor(project);
    renderTechCategoriesEditor(project);
    renderTechCompareEditor(project);
    renderTechFaqsEditor(project);
    renderEnterpriseStatsEditor(project);
    renderEnterpriseBrandsEditor(project);
    renderEnterpriseSolutionsEditor(project);
    renderEnterpriseSegmentsEditor(project);
    renderEnterpriseCasesEditor(project);
    renderEnterpriseFaqsEditor(project);
    var nlTitle = $("[data-editor-newsletter-title]");
    if (nlTitle) nlTitle.value = project.newsletterTitle || "";
    var nlSub = $("[data-editor-newsletter-subtitle]");
    if (nlSub) nlSub.value = project.newsletterSubtitle || "";
    var count = $("[data-editor-checklist-count]");
    if (count) count.textContent = checklistDone(project) + "/4";

    renderChecklistHTML(project, true, $("[data-editor-checklist]"));
    renderCategoryPicker(project);
    syncPublishButton(project);
    renderPreviewTargets();
  }

  function renderAccentPicker(project) {
    var picker = $("[data-theme-accent-picker]");
    if (!picker || !project) return;
    picker.innerHTML = ACCENT_PRESETS.map(function (preset) {
      var active = project.accentColor === preset.color;
      return (
        '<button type="button" class="panel-accent-chip' +
        (active ? " is-active" : "") +
        '" data-theme-accent="' +
        escapeHtml(preset.color) +
        '" title="' +
        escapeHtml(preset.label) +
        '"><span style="background:' +
        escapeHtml(preset.color) +
        '"></span>' +
        escapeHtml(preset.label) +
        "</button>"
      );
    }).join("");
  }

  function renderTechStatsEditor(project) {
    var root = $("[data-tech-stats-editor]");
    if (!root || !project) return;
    var stats = project.techHeroStats || [];
    while (stats.length < 3) stats.push({ value: "", label: "" });
    root.innerHTML = stats
      .slice(0, 3)
      .map(function (stat, index) {
        return (
          '<article class="panel-tech-stat-card">' +
          '<span class="panel-tech-stat-card__badge">' +
          (index + 1) +
          "</span>" +
          '<div class="panel-tech-stat-card__fields">' +
          '<label class="panel-field"><span>Wartość</span><input type="text" data-tech-stat-value data-stat-index="' +
          index +
          '" maxlength="20" value="' +
          escapeHtml(stat.value || "") +
          '" placeholder="1 200+"></label>' +
          '<label class="panel-field"><span>Opis</span><input type="text" data-tech-stat-label data-stat-index="' +
          index +
          '" maxlength="40" value="' +
          escapeHtml(stat.label || "") +
          '" placeholder="Produktów w katalogu"></label></div></article>'
        );
      })
      .join("");
  }

  function renderTechCategoriesEditor(project) {
    var root = $("[data-tech-categories-editor]");
    if (!root || !project) return;
    var cats = project.techCategories || [];
    if (!cats.length) {
      root.innerHTML =
        '<div class="panel-tech-empty"><i class="fas fa-grid-2" aria-hidden="true"></i><strong>Brak kategorii</strong><p>Dodaj kafelki kategorii widoczne na stronie głównej sklepu tech.</p></div>';
      return;
    }
    root.innerHTML = cats
      .map(function (cat, index) {
        return (
          '<article class="panel-tech-cat-row" data-tech-cat-row="' +
          escapeHtml(cat.id || "tcat_" + index) +
          '">' +
          '<div class="panel-tech-cat-row__main">' +
          '<label class="panel-field"><span>Nazwa kategorii</span><input type="text" data-tech-cat-label value="' +
          escapeHtml(cat.label || "") +
          '" maxlength="30"></label>' +
          '<label class="panel-field"><span>Krótki opis</span><input type="text" data-tech-cat-desc value="' +
          escapeHtml(cat.desc || "") +
          '" maxlength="60"></label>' +
          '<label class="panel-field"><span>Ikona Font Awesome</span><input type="text" data-tech-cat-icon value="' +
          escapeHtml(cat.icon || "fa-microchip") +
          '" maxlength="30" placeholder="fa-laptop"><span class="panel-field__micro">Np. fa-headphones, fa-laptop</span></label></div>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger panel-tech-cat-row__delete" data-remove-tech-category="' +
          escapeHtml(cat.id || "tcat_" + index) +
          '" title="Usuń kategorię"><i class="fas fa-trash-can" aria-hidden="true"></i></button></article>'
        );
      })
      .join("");
  }

  function renderTechCompareEditor(project) {
    var root = $("[data-tech-compare-editor]");
    if (!root || !project) return;
    var selected = (project.techCompare && project.techCompare.productIds) || [];
    var products = (project.products || []).filter(function (p) {
      return p.status === "active";
    });
    if (!products.length) {
      root.innerHTML =
        '<div class="panel-tech-empty"><i class="fas fa-table-columns" aria-hidden="true"></i><strong>Brak produktów</strong><p>Dodaj aktywne produkty w zakładce Produkty, aby wybrać je do porównywarki (max. 4).</p></div>';
      return;
    }
    root.innerHTML =
      '<p class="panel-tech-compare-hint"><i class="fas fa-circle-info" aria-hidden="true"></i> Zaznacz do 4 produktów do tabeli porównania.</p>' +
      '<div class="panel-tech-compare-grid">' +
      products
        .map(function (p) {
          var checked = selected.indexOf(p.id) !== -1;
          return (
            '<label class="panel-tech-compare-chip' +
            (checked ? " is-active" : "") +
            '"><input type="checkbox" data-tech-compare-product value="' +
            escapeHtml(p.id) +
            '"' +
            (checked ? " checked" : "") +
            '><span class="panel-tech-compare-chip__check" aria-hidden="true"><i class="fas fa-check"></i></span><span class="panel-tech-compare-chip__label">' +
            escapeHtml(p.name) +
            "</span></label>"
          );
        })
        .join("") +
      "</div>";
  }

  function renderTechFaqsEditor(project) {
    var root = $("[data-tech-faqs-editor]");
    if (!root || !project) return;
    var faqs = project.techFaqs || [];
    if (!faqs.length) {
      root.innerHTML =
        '<div class="panel-tech-empty"><i class="fas fa-circle-question" aria-hidden="true"></i><strong>Brak pytań FAQ</strong><p>Dodaj odpowiedzi na najczęstsze wątpliwości klientów przed zakupem.</p></div>';
      return;
    }
    root.innerHTML = faqs
      .map(function (faq, index) {
        return (
          '<article class="panel-tech-faq-row" data-tech-faq-row="' +
          index +
          '">' +
          '<div class="panel-tech-faq-row__head"><span class="panel-tech-faq-row__num">#' +
          (index + 1) +
          '</span><button type="button" class="panel-icon-btn panel-icon-btn--danger panel-tech-faq-row__delete" data-remove-tech-faq="' +
          index +
          '" title="Usuń pytanie"><i class="fas fa-trash-can" aria-hidden="true"></i></button></div>' +
          '<label class="panel-field panel-field--full"><span>Pytanie</span><input type="text" data-tech-faq-q value="' +
          escapeHtml(faq.q || "") +
          '" maxlength="120"></label>' +
          '<label class="panel-field panel-field--full"><span>Odpowiedź</span><textarea rows="3" data-tech-faq-a maxlength="320">' +
          escapeHtml(faq.a || "") +
          "</textarea></label></article>"
        );
      })
      .join("");
  }

  function collectTechHeroStatsFromEditor() {
    var stats = [];
    for (var i = 0; i < 3; i++) {
      var valueEl = document.querySelector('[data-tech-stat-value][data-stat-index="' + i + '"]');
      var labelEl = document.querySelector('[data-tech-stat-label][data-stat-index="' + i + '"]');
      var value = valueEl ? valueEl.value.trim() : "";
      var label = labelEl ? labelEl.value.trim() : "";
      if (value || label) stats.push({ value: value, label: label });
    }
    while (stats.length < 3) stats.push({ value: "", label: "" });
    return stats.slice(0, 3);
  }

  function collectTechCategoriesFromEditor(project) {
    var rows = $all("[data-tech-cat-row]");
    if (!rows.length) return project.techCategories || [];
    return rows
      .map(function (row, index) {
        var id = row.getAttribute("data-tech-cat-row") || uid("tcat");
        var labelEl = row.querySelector("[data-tech-cat-label]");
        var descEl = row.querySelector("[data-tech-cat-desc]");
        var iconEl = row.querySelector("[data-tech-cat-icon]");
        var existing = (project.techCategories || []).find(function (c) {
          return c.id === id;
        });
        return {
          id: id,
          label: labelEl ? labelEl.value.trim() : "",
          desc: descEl ? descEl.value.trim() : "",
          icon: iconEl ? iconEl.value.trim() || "fa-microchip" : "fa-microchip",
          productIds: existing && existing.productIds ? existing.productIds.slice() : []
        };
      })
      .filter(function (c) {
        return c.label;
      });
  }

  function collectTechFaqsFromEditor() {
    return $all("[data-tech-faq-row]")
      .map(function (row) {
        var q = row.querySelector("[data-tech-faq-q]");
        var a = row.querySelector("[data-tech-faq-a]");
        return {
          q: q ? q.value.trim() : "",
          a: a ? a.value.trim() : ""
        };
      })
      .filter(function (f) {
        return f.q && f.a;
      });
  }

  function collectTechCompareFromEditor() {
    var ids = $all("[data-tech-compare-product]:checked")
      .map(function (el) {
        return el.value;
      })
      .slice(0, 4);
    var specsEl = $("[data-editor-tech-compare-specs]");
    var specKeys = specsEl
      ? specsEl.value
          .split(/\n+/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
      : [];
    return { productIds: ids, specKeys: specKeys };
  }

  function persistTechEditorFromDom(project) {
    if (!project || !isTechProject(project)) return;
    var brandsEl = $("[data-editor-tech-brands]");
    var brands = brandsEl
      ? brandsEl.value
          .split(/\n+/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
      : project.techBrands || [];
    updateProject(project.id, {
      techHeroStats: collectTechHeroStatsFromEditor(),
      techCategories: collectTechCategoriesFromEditor(project),
      techFaqs: collectTechFaqsFromEditor(),
      techCompare: collectTechCompareFromEditor(),
      techBrands: brands
    });
  }

  function collectEnterpriseHeroStatsFromEditor() {
    var stats = [];
    for (var i = 0; i < 3; i++) {
      var valueEl = document.querySelector('[data-ent-stat-value][data-stat-index="' + i + '"]');
      var labelEl = document.querySelector('[data-ent-stat-label][data-stat-index="' + i + '"]');
      var value = valueEl ? valueEl.value.trim() : "";
      var label = labelEl ? labelEl.value.trim() : "";
      if (value || label) stats.push({ value: value, label: label });
    }
    while (stats.length < 3) stats.push({ value: "", label: "" });
    return stats.slice(0, 3);
  }

  function collectEnterpriseBrandsFromEditor() {
    return $all("[data-ent-brand-row]")
      .map(function (row, index) {
        var id = row.getAttribute("data-ent-brand-row") || uid("ebrand");
        return {
          id: id,
          name: (row.querySelector("[data-ent-brand-name]") || {}).value || "",
          tagline: (row.querySelector("[data-ent-brand-tagline]") || {}).value || "",
          category: (row.querySelector("[data-ent-brand-category]") || {}).value || "",
          image: (row.querySelector("[data-ent-brand-image]") || {}).value || null,
          productCount: (row.querySelector("[data-ent-brand-count]") || {}).value || ""
        };
      })
      .filter(function (b) {
        return String(b.name || "").trim();
      });
  }

  function collectEnterpriseSolutionsFromEditor() {
    return $all("[data-ent-solution-row]")
      .map(function (row, index) {
        return {
          id: row.getAttribute("data-ent-solution-row") || uid("esol"),
          title: (row.querySelector("[data-ent-solution-title]") || {}).value || "",
          desc: (row.querySelector("[data-ent-solution-desc]") || {}).value || "",
          icon: (row.querySelector("[data-ent-solution-icon]") || {}).value || "fa-layer-group"
        };
      })
      .filter(function (s) {
        return String(s.title || "").trim();
      });
  }

  function collectEnterpriseSegmentsFromEditor() {
    return $all("[data-ent-segment-row]")
      .map(function (row) {
        return {
          id: row.getAttribute("data-ent-segment-row") || uid("eseg"),
          title: (row.querySelector("[data-ent-segment-title]") || {}).value || "",
          subtitle: (row.querySelector("[data-ent-segment-subtitle]") || {}).value || "",
          icon: (row.querySelector("[data-ent-segment-icon]") || {}).value || "fa-building"
        };
      })
      .filter(function (s) {
        return String(s.title || "").trim();
      });
  }

  function collectEnterpriseCasesFromEditor() {
    return $all("[data-ent-case-row]")
      .map(function (row) {
        return {
          id: row.getAttribute("data-ent-case-row") || uid("ecase"),
          brand: (row.querySelector("[data-ent-case-brand]") || {}).value || "",
          title: (row.querySelector("[data-ent-case-title]") || {}).value || "",
          metric: (row.querySelector("[data-ent-case-metric]") || {}).value || "",
          metricLabel: (row.querySelector("[data-ent-case-metric-label]") || {}).value || "",
          quote: (row.querySelector("[data-ent-case-quote]") || {}).value || "",
          image: (row.querySelector("[data-ent-case-image]") || {}).value || null
        };
      })
      .filter(function (c) {
        return String(c.title || "").trim();
      });
  }

  function collectEnterpriseFaqsFromEditor() {
    return $all("[data-ent-faq-row]")
      .map(function (row) {
        return {
          q: (row.querySelector("[data-ent-faq-q]") || {}).value || "",
          a: (row.querySelector("[data-ent-faq-a]") || {}).value || ""
        };
      })
      .filter(function (f) {
        return f.q && f.a;
      });
  }

  function persistEnterpriseEditorFromDom(project) {
    if (!project || !isEnterpriseProject(project)) return;
    var partnersEl = $("[data-editor-enterprise-partners]");
    var partners = partnersEl
      ? partnersEl.value
          .split(/\n+/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
      : project.enterprisePartners || [];
    updateProject(project.id, {
      enterpriseHeroStats: collectEnterpriseHeroStatsFromEditor(),
      enterpriseBrands: collectEnterpriseBrandsFromEditor(),
      enterpriseSolutions: collectEnterpriseSolutionsFromEditor(),
      enterpriseSegments: collectEnterpriseSegmentsFromEditor(),
      enterpriseCaseStudies: collectEnterpriseCasesFromEditor(),
      enterpriseFaqs: collectEnterpriseFaqsFromEditor(),
      enterprisePartners: partners
    });
  }

  function renderEnterpriseStatsEditor(project) {
    var root = $("[data-ent-stats-editor]");
    if (!root || !project) return;
    var stats = project.enterpriseHeroStats || [];
    while (stats.length < 3) stats.push({ value: "", label: "" });
    root.innerHTML = stats
      .slice(0, 3)
      .map(function (stat, index) {
        return (
          '<article class="panel-tech-stat-card">' +
          '<span class="panel-tech-stat-card__badge">' +
          (index + 1) +
          "</span>" +
          '<div class="panel-tech-stat-card__fields">' +
          '<label class="panel-field"><span>Wartość</span><input type="text" data-ent-stat-value data-stat-index="' +
          index +
          '" maxlength="20" value="' +
          escapeHtml(stat.value || "") +
          '"></label>' +
          '<label class="panel-field"><span>Opis</span><input type="text" data-ent-stat-label data-stat-index="' +
          index +
          '" maxlength="40" value="' +
          escapeHtml(stat.label || "") +
          '"></label></div></article>'
        );
      })
      .join("");
  }

  function renderEnterpriseBrandsEditor(project) {
    var root = $("[data-ent-brands-editor]");
    if (!root || !project) return;
    var brands = project.enterpriseBrands || [];
    if (!brands.length) {
      root.innerHTML =
        '<div class="panel-tech-empty"><i class="fas fa-sitemap" aria-hidden="true"></i><strong>Brak marek</strong><p>Dodaj karty marek w portfolio hubu.</p></div>';
      return;
    }
    root.innerHTML = brands
      .map(function (b, index) {
        var id = b.id || "ebrand_" + index;
        return (
          '<article class="panel-tech-cat-row" data-ent-brand-row="' +
          escapeHtml(id) +
          '"><div class="panel-tech-cat-row__main">' +
          '<label class="panel-field"><span>Nazwa marki</span><input type="text" data-ent-brand-name value="' +
          escapeHtml(b.name || "") +
          '" maxlength="40"></label>' +
          '<label class="panel-field"><span>Tagline</span><input type="text" data-ent-brand-tagline value="' +
          escapeHtml(b.tagline || "") +
          '" maxlength="80"></label>' +
          '<label class="panel-field"><span>Kategoria</span><input type="text" data-ent-brand-category value="' +
          escapeHtml(b.category || "") +
          '" maxlength="30"></label>' +
          '<label class="panel-field"><span>Liczba SKU</span><input type="text" data-ent-brand-count value="' +
          escapeHtml(b.productCount || "") +
          '" maxlength="12"></label>' +
          '<label class="panel-field panel-field--full"><span>URL zdjęcia</span><input type="url" data-ent-brand-image value="' +
          escapeHtml(b.image || "") +
          '" placeholder="https://..."></label></div>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger panel-tech-cat-row__delete" data-remove-ent-brand="' +
          escapeHtml(id) +
          '" title="Usuń markę"><i class="fas fa-trash-can" aria-hidden="true"></i></button></article>'
        );
      })
      .join("");
  }

  function renderEnterpriseSolutionsEditor(project) {
    var root = $("[data-ent-solutions-editor]");
    if (!root || !project) return;
    var items = project.enterpriseSolutions || [];
    if (!items.length) {
      root.innerHTML = '<div class="panel-tech-empty"><strong>Brak modułów B2B</strong></div>';
      return;
    }
    root.innerHTML = items
      .map(function (s, index) {
        var id = s.id || "esol_" + index;
        return (
          '<article class="panel-tech-cat-row" data-ent-solution-row="' +
          escapeHtml(id) +
          '"><div class="panel-tech-cat-row__main">' +
          '<label class="panel-field"><span>Tytuł</span><input type="text" data-ent-solution-title value="' +
          escapeHtml(s.title || "") +
          '" maxlength="40"></label>' +
          '<label class="panel-field"><span>Ikona FA</span><input type="text" data-ent-solution-icon value="' +
          escapeHtml(s.icon || "fa-layer-group") +
          '" maxlength="30"></label>' +
          '<label class="panel-field panel-field--full"><span>Opis</span><input type="text" data-ent-solution-desc value="' +
          escapeHtml(s.desc || "") +
          '" maxlength="120"></label></div>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger" data-remove-ent-solution="' +
          escapeHtml(id) +
          '"><i class="fas fa-trash-can" aria-hidden="true"></i></button></article>'
        );
      })
      .join("");
  }

  function renderEnterpriseSegmentsEditor(project) {
    var root = $("[data-ent-segments-editor]");
    if (!root || !project) return;
    var items = project.enterpriseSegments || [];
    if (!items.length) {
      root.innerHTML = '<div class="panel-tech-empty"><strong>Brak segmentów</strong></div>';
      return;
    }
    root.innerHTML = items
      .map(function (s, index) {
        var id = s.id || "eseg_" + index;
        return (
          '<article class="panel-tech-cat-row" data-ent-segment-row="' +
          escapeHtml(id) +
          '"><div class="panel-tech-cat-row__main">' +
          '<label class="panel-field"><span>Segment</span><input type="text" data-ent-segment-title value="' +
          escapeHtml(s.title || "") +
          '" maxlength="30"></label>' +
          '<label class="panel-field"><span>Ikona FA</span><input type="text" data-ent-segment-icon value="' +
          escapeHtml(s.icon || "fa-building") +
          '" maxlength="30"></label>' +
          '<label class="panel-field panel-field--full"><span>Opis</span><input type="text" data-ent-segment-subtitle value="' +
          escapeHtml(s.subtitle || "") +
          '" maxlength="80"></label></div>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger" data-remove-ent-segment="' +
          escapeHtml(id) +
          '"><i class="fas fa-trash-can" aria-hidden="true"></i></button></article>'
        );
      })
      .join("");
  }

  function renderEnterpriseCasesEditor(project) {
    var root = $("[data-ent-cases-editor]");
    if (!root || !project) return;
    var items = project.enterpriseCaseStudies || [];
    if (!items.length) {
      root.innerHTML = '<div class="panel-tech-empty"><strong>Brak case studies</strong></div>';
      return;
    }
    root.innerHTML = items
      .map(function (c, index) {
        var id = c.id || "ecase_" + index;
        return (
          '<article class="panel-tech-cat-row" data-ent-case-row="' +
          escapeHtml(id) +
          '"><div class="panel-tech-cat-row__main">' +
          '<label class="panel-field"><span>Marka / klient</span><input type="text" data-ent-case-brand value="' +
          escapeHtml(c.brand || "") +
          '" maxlength="40"></label>' +
          '<label class="panel-field"><span>Tytuł</span><input type="text" data-ent-case-title value="' +
          escapeHtml(c.title || "") +
          '" maxlength="60"></label>' +
          '<label class="panel-field"><span>Metryka</span><input type="text" data-ent-case-metric value="' +
          escapeHtml(c.metric || "") +
          '" maxlength="12"></label>' +
          '<label class="panel-field"><span>Opis metryki</span><input type="text" data-ent-case-metric-label value="' +
          escapeHtml(c.metricLabel || "") +
          '" maxlength="40"></label>' +
          '<label class="panel-field panel-field--full"><span>Cytat</span><input type="text" data-ent-case-quote value="' +
          escapeHtml(c.quote || "") +
          '" maxlength="160"></label>' +
          '<label class="panel-field panel-field--full"><span>URL zdjęcia</span><input type="url" data-ent-case-image value="' +
          escapeHtml(c.image || "") +
          '"></label></div>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger" data-remove-ent-case="' +
          escapeHtml(id) +
          '"><i class="fas fa-trash-can" aria-hidden="true"></i></button></article>'
        );
      })
      .join("");
  }

  function renderEnterpriseFaqsEditor(project) {
    var root = $("[data-ent-faqs-editor]");
    if (!root || !project) return;
    var faqs = project.enterpriseFaqs || [];
    if (!faqs.length) {
      root.innerHTML = '<div class="panel-tech-empty"><strong>Brak FAQ B2B</strong></div>';
      return;
    }
    root.innerHTML = faqs
      .map(function (f, index) {
        return (
          '<article class="panel-tech-faq-row" data-ent-faq-row="' +
          index +
          '">' +
          '<label class="panel-field panel-field--full"><span>Pytanie</span><input type="text" data-ent-faq-q value="' +
          escapeHtml(f.q || "") +
          '" maxlength="120"></label>' +
          '<label class="panel-field panel-field--full"><span>Odpowiedź</span><textarea rows="2" data-ent-faq-a maxlength="400">' +
          escapeHtml(f.a || "") +
          "</textarea></label>" +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger" data-remove-ent-faq="' +
          index +
          '"><i class="fas fa-trash-can" aria-hidden="true"></i></button></article>'
        );
      })
      .join("");
  }

  function renderEnterpriseSectionsOverview(project) {
    var root = $("[data-ent-sections-overview]");
    if (!root) return;
    if (!isEnterpriseProject(project)) {
      root.innerHTML = "";
      root.hidden = true;
      return;
    }
    root.hidden = false;
    var vis = project.sectionVisibility || defaultSectionVisibilityForProject(project);
    var keys = Object.keys(SECTION_TOGGLE_META).filter(function (key) {
      return SECTION_TOGGLE_META[key].templates.indexOf("enterprise") !== -1;
    });
    root.innerHTML =
      '<div class="panel-tech-vis-overview">' +
      '<p class="panel-tech-vis-overview__lead"><i class="fas fa-eye" aria-hidden="true"></i> Widoczność sekcji Multi-brand Hub.</p>' +
      '<div class="panel-tech-vis-overview__chips">' +
      keys
        .map(function (key) {
          var meta = SECTION_TOGGLE_META[key];
          var on = vis[key] !== false;
          return (
            '<button type="button" class="panel-tech-vis-chip' +
            (on ? " is-on" : "") +
            '" data-section-quick-toggle="' +
            escapeHtml(key) +
            '"><i class="fas ' +
            meta.icon +
            '" aria-hidden="true"></i><span>' +
            escapeHtml(meta.label) +
            '</span><em class="panel-tech-vis-chip__state">' +
            (on ? "Widoczna" : "Ukryta") +
            "</em></button>"
          );
        })
        .join("") +
      "</div></div>";
  }

  function syncEditorTemplateSections(project) {
    var tech = isTechProject(project);
    var enterprise = isEnterpriseProject(project);
    var techSection = $("[data-editor-tech-section]");
    if (techSection) techSection.hidden = !tech;
    var entSection = $("[data-editor-enterprise-section]");
    if (entSection) entSection.hidden = !enterprise;
    var collectionsSection = $("[data-editor-collections-section]");
    if (collectionsSection) {
      collectionsSection.hidden = enterprise;
      collectionsSection.setAttribute("data-editor-subsection-card", tech ? "deals" : "lookbook");
    }
    var collectionsVisHost = $("[data-subsection-visibility='collections']");
    if (collectionsVisHost) {
      collectionsVisHost.setAttribute("data-subsection-visibility", tech ? "deals" : "lookbook");
    }
    var heading = $("[data-editor-collections-heading]");
    var desc = $("[data-editor-collections-desc]");
    var addLabel = $("[data-editor-collections-add-label]");
    var titleLabel = $("[data-editor-collections-title-label]");
    var subtitleLabel = $("[data-editor-collections-subtitle-label]");
    var toolbarLabel = $("[data-editor-collections-toolbar-label]");
    var lookbookTitle = $("[data-editor-lookbook-title]");
    var lookbookSub = $("[data-editor-lookbook-subtitle]");
    if (tech) {
      if (heading) heading.textContent = "Promocje tygodnia";
      if (desc) desc.textContent = "Do 15 promocji ze zdjęciem i przypisanymi produktami — wyświetlane jako karty dealów.";
      if (addLabel) addLabel.textContent = "Dodaj promocję";
      if (titleLabel) titleLabel.textContent = "Tytuł sekcji promocji";
      if (subtitleLabel) subtitleLabel.textContent = "Opis promocji";
      if (toolbarLabel) toolbarLabel.innerHTML = '<i class="fas fa-bolt" aria-hidden="true"></i> Promocje tygodnia';
      if (lookbookTitle) lookbookTitle.placeholder = "Promocje tygodnia";
      if (lookbookSub) lookbookSub.placeholder = "Wybrane zestawy w obniżonych cenach";
    } else if (isLuxProject(project)) {
      if (heading) heading.textContent = "Kolekcje haute";
      if (desc) desc.textContent = "Do 15 kolekcji editorial — pełnoekranowe karty na stronie głównej premium.";
      if (addLabel) addLabel.textContent = "Dodaj kolekcję";
      if (titleLabel) titleLabel.textContent = "Tytuł sekcji kolekcji";
      if (subtitleLabel) subtitleLabel.textContent = "Opis kolekcji";
      if (toolbarLabel) toolbarLabel.innerHTML = '<i class="fas fa-gem" aria-hidden="true"></i> Kolekcje premium';
      if (lookbookTitle) lookbookTitle.placeholder = "Kolekcje haute";
      if (lookbookSub) lookbookSub.placeholder = "Trzy linie produktowe sezonu";
    } else {
      if (heading) heading.textContent = "Lookbook i kolekcje";
      if (desc) desc.textContent = "Do 15 kolekcji ze zdjęciem i przypisanymi produktami w lookbooku.";
      if (addLabel) addLabel.textContent = "Dodaj kolekcję";
      if (titleLabel) titleLabel.textContent = "Tytuł sekcji lookbook";
      if (subtitleLabel) subtitleLabel.textContent = "Opis lookbooka";
      if (toolbarLabel) toolbarLabel.innerHTML = '<i class="fas fa-layer-group" aria-hidden="true"></i> Twoje kolekcje';
      if (lookbookTitle) lookbookTitle.placeholder = "Kolekcje sezonowe";
      if (lookbookSub) lookbookSub.placeholder = "Odkryj najnowsze stylizacje";
    }
  }

  function resolveHeroImageUrl(project) {
    if (!project) return "";
    var raw = project.heroImage || "";
    return safeCssUrl(raw) || (/^data:image\//i.test(raw) ? raw : "");
  }

  function normalizeBannerCompareUrl(url) {
    if (!url) return "";
    var trimmed = String(url).trim();
    if (/^data:image\//i.test(trimmed)) return trimmed;
    return trimmed.split("?")[0];
  }

  function isBannerUrlActive(candidate, activeUrl) {
    if (!candidate || !activeUrl) return false;
    if (candidate === activeUrl) return true;
    return normalizeBannerCompareUrl(candidate) === normalizeBannerCompareUrl(activeUrl);
  }

  function getBannerPresetsFlat(project) {
    var sf = storefrontApi();
    if (!sf || !sf.getFlatBannerLibrary) return [];
    return sf.getFlatBannerLibrary(project && project.templateId ? project.templateId : "");
  }

  function getBannerLibraryCategories(project) {
    var sf = storefrontApi();
    if (!sf || !sf.getBannerLibraryForTemplate) return [];
    return sf.getBannerLibraryForTemplate(project && project.templateId ? project.templateId : "");
  }

  function buildBannerPresetTileHtml(preset, activeUrl, options) {
    options = options || {};
    var isActive = isBannerUrlActive(preset.url, activeUrl);
    var showCategory = !!options.showCategory;
    return (
      '<button type="button" class="panel-banner-preset' +
      (isActive ? " is-active" : "") +
      '" data-theme-banner-preset="' +
      escapeHtml(preset.url) +
      '" title="' +
      escapeHtml(preset.label + (showCategory && preset.categoryLabel ? " · " + preset.categoryLabel : "")) +
      '"><span style="background-image:url(\'' +
      escapeHtml(preset.url) +
      "')\"></span>" +
      (showCategory && preset.categoryLabel
        ? '<span class="panel-banner-preset__cat">' + escapeHtml(preset.categoryLabel) + "</span>"
        : "") +
      escapeHtml(preset.label) +
      "</button>"
    );
  }

  function syncThemeHeroPreview(url) {
    var preview = $("[data-theme-hero-preview]");
    var empty = $("[data-theme-hero-preview-empty]");
    var clearBtn = $("[data-theme-hero-clear]");
    var urlInput = $("[data-theme-hero-image-url]");
    var safe = resolveHeroImageUrl({ heroImage: url });
    if (urlInput) {
      urlInput.value = safe && !/^data:image\//i.test(safe) ? safe : "";
    }
    if (!preview) return;
    if (safe) {
      preview.style.backgroundImage = "url('" + safe + "')";
      preview.classList.add("has-image");
      if (empty) empty.hidden = true;
      if (clearBtn) clearBtn.hidden = false;
    } else {
      preview.style.backgroundImage = "";
      preview.classList.remove("has-image");
      if (empty) empty.hidden = false;
      if (clearBtn) clearBtn.hidden = true;
      if (urlInput) urlInput.value = "";
    }
  }

  function setThemeHeroImage(url, options) {
    options = options || {};
    var project = getActiveProject();
    if (!project) return;
    var safe = safeCssUrl(url) || (/^data:image\//i.test(url || "") ? url.trim() : null);
    updateProject(project.id, { heroImage: safe || null });
    syncThemeHeroPreview(safe || "");
    renderBannerPresets();
    if (bannerLibraryModal && bannerLibraryModal.classList.contains("is-open")) {
      renderBannerLibraryModal();
    }
    if (options.toast !== false) showToast(safe ? "Zdjęcie banera zaktualizowane." : "Usunięto zdjęcie banera.");
    renderPreviewTargets();
  }

  function clearThemeHeroImage() {
    var fileInput = $("[data-theme-hero-file]");
    if (fileInput) fileInput.value = "";
    setThemeHeroImage("");
  }

  function handleThemeHeroFile(file) {
    if (!file) return;
    if (!/^image\/(?:jpeg|png|webp)$/i.test(file.type)) {
      showToast("Dozwolone formaty: JPG, PNG, WebP.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showToast("Zdjęcie jest za duże. W demo maksymalnie 2 MB.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var fileInput = $("[data-theme-hero-file]");
      if (fileInput) fileInput.value = "";
      setThemeHeroImage(reader.result);
    };
    reader.onerror = function () {
      showToast("Nie udało się wczytać pliku.");
    };
    reader.readAsDataURL(file);
  }

  function renderTechHeroLayoutPicker(project) {
    var root = $("[data-theme-hero-layout-picker]");
    if (!root || !project) return;
    var active = project.heroLayout || "split";
    root.innerHTML = TECH_HERO_LAYOUTS.map(function (layout) {
      var isActive = active === layout.id;
      return (
        '<button type="button" class="panel-tech-hero-layout' +
        (isActive ? " is-active" : "") +
        '" data-theme-hero-layout="' +
        escapeHtml(layout.id) +
        '"><span class="panel-tech-hero-layout__icon"><i class="fas ' +
        layout.icon +
        '" aria-hidden="true"></i></span><span class="panel-tech-hero-layout__copy"><strong>' +
        escapeHtml(layout.label) +
        "</strong><span>" +
        escapeHtml(layout.desc) +
        "</span></span></button>"
      );
    }).join("");
  }

  function syncThemeHeroEditorVisibility(project) {
    var techLayoutBlock = $("[data-theme-tech-layout]");
    var cardDesc = $("[data-theme-hero-card-desc]");
    var overlayLabel = $("[data-theme-hero-overlay-label-text]");
    var isTech = isTechProject(project);
    if (techLayoutBlock) techLayoutBlock.hidden = !isTech;
    if (cardDesc) {
      cardDesc.textContent = isTech
        ? "Prześlij zdjęcie, wybierz z biblioteki AmiQPlace lub wklej link — poniżej ustawisz układ banera."
        : "Prześlij zdjęcie, wybierz z biblioteki AmiQPlace lub wklej link URL.";
    }
    if (overlayLabel) {
      overlayLabel.textContent = isTech
        ? "Nakładka na zdjęciu (czytelność tekstu)"
        : "Nakładka banera (przezroczystość tekstu)";
    }
  }

  function renderBannerPresets() {
    var grid = $("[data-theme-banner-presets]");
    var label = $("[data-theme-banner-presets-label]");
    var openLibBtn = $("[data-open-banner-library]");
    var project = getActiveProject();
    if (!grid) return;

    var flat = getBannerPresetsFlat(project);
    var activeUrl = project && project.heroImage ? project.heroImage : "";
    var hasMore = flat.length > BANNER_PRESETS_INLINE_LIMIT;
    var inline = flat.slice(0, BANNER_PRESETS_INLINE_LIMIT);

    if (label) {
      label.textContent = hasMore
        ? "Szybki wybór — " + flat.length + " gotowych teł"
        : "Szybki wybór — gotowe tła";
    }
    if (openLibBtn) openLibBtn.hidden = flat.length <= BANNER_PRESETS_INLINE_LIMIT;

    grid.className = "panel-banner-presets__grid";
    grid.innerHTML =
      inline.map(function (preset) {
        return buildBannerPresetTileHtml(preset, activeUrl);
      }).join("") +
      (hasMore
        ? '<button type="button" class="panel-banner-preset panel-banner-preset--more" data-open-banner-library aria-label="Otwórz bibliotekę AmiQPlace">' +
          '<span class="panel-banner-preset__more-visual"><i class="fas fa-images" aria-hidden="true"></i></span>' +
          "<span>Pokaż więcej</span><small>+" +
          (flat.length - BANNER_PRESETS_INLINE_LIMIT) +
          " zdjęć</small></button>"
        : "");
  }

  function renderBannerLibraryModal() {
    var project = getActiveProject();
    var catsRoot = $("[data-banner-lib-categories]");
    var grid = $("[data-banner-lib-grid]");
    var meta = $("[data-banner-lib-meta]");
    var empty = $("[data-banner-lib-empty]");
    var footNote = $("[data-banner-lib-foot-note]");
    var searchInput = $("[data-banner-lib-search]");
    if (!grid || !catsRoot) return;

    var categories = getBannerLibraryCategories(project);
    var flat = getBannerPresetsFlat(project);
    var activeUrl = project && project.heroImage ? project.heroImage : "";
    var query = (bannerLibraryState.search || "").trim().toLowerCase();
    var activeCat = bannerLibraryState.category || "all";

    if (searchInput && searchInput.value !== bannerLibraryState.search) {
      searchInput.value = bannerLibraryState.search || "";
    }

    catsRoot.innerHTML =
      '<button type="button" class="panel-banner-lib__cat' +
      (activeCat === "all" ? " is-active" : "") +
      '" data-banner-lib-category="all" role="tab" aria-selected="' +
      (activeCat === "all" ? "true" : "false") +
      '">Wszystkie <span>' +
      flat.length +
      "</span></button>" +
      categories
        .map(function (cat) {
          var count = (cat.presets || []).length;
          if (!count) return "";
          return (
            '<button type="button" class="panel-banner-lib__cat' +
            (activeCat === cat.id ? " is-active" : "") +
            '" data-banner-lib-category="' +
            escapeHtml(cat.id) +
            '" role="tab" aria-selected="' +
            (activeCat === cat.id ? "true" : "false") +
            '">' +
            escapeHtml(cat.label) +
            " <span>" +
            count +
            "</span></button>"
          );
        })
        .join("");

    var filtered = flat.filter(function (preset) {
      if (activeCat !== "all" && preset.categoryId !== activeCat) return false;
      if (!query) return true;
      var haystack = (preset.label + " " + preset.categoryLabel + " " + preset.id).toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    if (meta) {
      meta.textContent =
        filtered.length +
        " z " +
        flat.length +
        " banerów" +
        (query ? ' · wyszukiwanie: „' + bannerLibraryState.search.trim() + "”" : "") +
        (activeCat !== "all" ? " · filtrowane" : "");
    }
    if (footNote) {
      footNote.textContent = "Zdjęcia demo z Unsplash · możesz też przesłać własny plik poniżej.";
    }

    if (!filtered.length) {
      grid.innerHTML = "";
      grid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    grid.hidden = false;
    if (empty) empty.hidden = true;
    grid.innerHTML = filtered
      .map(function (preset) {
        return buildBannerPresetTileHtml(preset, activeUrl, { showCategory: activeCat === "all" });
      })
      .join("");
  }

  function openBannerLibraryModal() {
    if (!bannerLibraryModal) bannerLibraryModal = document.getElementById("banner-library-modal");
    if (!bannerLibraryModal) return;
    bannerLibraryState.search = "";
    bannerLibraryState.category = "all";
    renderBannerLibraryModal();
    bannerLibraryModal.hidden = false;
    bannerLibraryModal.classList.add("is-open");
    bannerLibraryModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    var searchInput = $("[data-banner-lib-search]");
    if (searchInput) searchInput.focus();
  }

  function closeBannerLibraryModal() {
    if (!bannerLibraryModal) return;
    bannerLibraryModal.classList.remove("is-open");
    bannerLibraryModal.setAttribute("aria-hidden", "true");
    bannerLibraryModal.hidden = true;
    syncBodyModalLock();
  }

  function initBannerLibraryModal() {
    if (!bannerLibraryModal) bannerLibraryModal = document.getElementById("banner-library-modal");
    if (!bannerLibraryModal) return;

    bannerLibraryModal.addEventListener("click", function (event) {
      if (event.target.closest("[data-close-banner-library]")) {
        closeBannerLibraryModal();
        return;
      }
      var catBtn = event.target.closest("[data-banner-lib-category]");
      if (catBtn) {
        bannerLibraryState.category = catBtn.getAttribute("data-banner-lib-category") || "all";
        renderBannerLibraryModal();
        return;
      }
      var bannerBtn = event.target.closest("[data-theme-banner-preset]");
      if (bannerBtn) {
        var url = bannerBtn.getAttribute("data-theme-banner-preset");
        var fileInput = $("[data-theme-hero-file]");
        if (fileInput) fileInput.value = "";
        setThemeHeroImage(url);
        closeBannerLibraryModal();
      }
    });

    bannerLibraryModal.addEventListener("input", function (event) {
      if (!event.target.matches("[data-banner-lib-search]")) return;
      bannerLibraryState.search = event.target.value;
      renderBannerLibraryModal();
    });

    bannerLibraryModal.addEventListener("change", function (event) {
      if (!event.target.matches("[data-banner-lib-file]")) return;
      handleThemeHeroFile(event.target.files && event.target.files[0]);
      event.target.value = "";
      closeBannerLibraryModal();
    });

    var uploadZone = $("[data-banner-lib-upload-zone]");
    if (uploadZone) {
      uploadZone.addEventListener("dragover", function (event) {
        event.preventDefault();
        uploadZone.classList.add("is-dragover");
      });
      uploadZone.addEventListener("dragleave", function () {
        uploadZone.classList.remove("is-dragover");
      });
      uploadZone.addEventListener("drop", function (event) {
        event.preventDefault();
        uploadZone.classList.remove("is-dragover");
        var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        handleThemeHeroFile(file);
        closeBannerLibraryModal();
      });
    }
  }

  function renderTheme() {
    var project = getActiveProject();
    var empty = $("[data-theme-empty]");
    var layout = $("[data-theme-layout]");
    if (!empty || !layout) return;

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;

    var title = $("[data-theme-title]");
    if (title) title.textContent = project.name;
    var info = $("[data-theme-template-info]");
    if (info) {
      var tpl = AMIQ_TEMPLATES.find(function (t) {
        return t.id === project.templateId;
      });
      var themeMeta = THEMES.find(function (t) {
        return t.id === project.theme;
      });
      info.textContent = tpl ? "Szablon: " + tpl.name : "Motyw: " + (themeMeta ? themeMeta.label : project.theme);
    }

    renderThemePicker(project);
    renderAccentPicker(project);
    syncThemeHeroEditorVisibility(project);
    renderTechHeroLayoutPicker(project);
    renderBannerPresets();
    syncThemeHeroPreview(project.heroImage || "");

    $all("[data-theme-color-mode]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme-color-mode") === (project.colorMode || "light"));
    });

    var overlay = $("[data-theme-hero-overlay]");
    if (overlay) overlay.value = project.heroOverlay != null ? project.heroOverlay : 45;
    var overlayLabel = $("[data-theme-overlay-label]");
    if (overlayLabel) {
      overlayLabel.textContent = (project.heroOverlay != null ? project.heroOverlay : 45) + "% — balans zdjęcia i czytelności";
    }
    var radius = $("[data-theme-card-radius]");
    if (radius) radius.value = project.cardRadius || "soft";
    var heading = $("[data-theme-heading-style]");
    if (heading) heading.value = project.headingStyle || "modern";

    syncLogoModeUI(project);
    var logoText = $("[data-theme-logo-text]");
    if (logoText) logoText.value = project.logoText || project.storeName || "";
    var logoFont = $("[data-theme-logo-font]");
    if (logoFont) logoFont.value = project.logoFont || "manrope";
    syncThemeLogoPreview(project.logoImage || "");

    renderPreviewTargets();
  }

  function resolveLogoImageUrl(project) {
    if (!project) return "";
    var raw = project.logoImage || "";
    return safeCssUrl(raw) || (/^data:image\//i.test(raw) ? raw : "");
  }

  function syncThemeLogoPreview(url) {
    var preview = $("[data-theme-logo-preview]");
    var empty = $("[data-theme-logo-preview-empty]");
    var clearBtn = $("[data-theme-logo-clear]");
    var urlInput = $("[data-theme-logo-image-url]");
    var safe = resolveLogoImageUrl({ logoImage: url });
    if (urlInput) {
      urlInput.value = safe && !/^data:image\//i.test(safe) ? safe : "";
    }
    if (!preview) return;
    if (safe) {
      preview.style.backgroundImage = "url('" + safe + "')";
      preview.classList.add("has-image");
      if (empty) empty.hidden = true;
      if (clearBtn) clearBtn.hidden = false;
    } else {
      preview.style.backgroundImage = "";
      preview.classList.remove("has-image");
      if (empty) empty.hidden = false;
      if (clearBtn) clearBtn.hidden = true;
      if (urlInput) urlInput.value = "";
    }
  }

  function setThemeLogoImage(url, options) {
    options = options || {};
    var project = getActiveProject();
    if (!project) return;
    var safe = safeCssUrl(url) || (/^data:image\//i.test(url || "") ? url.trim() : null);
    var patch = { logoImage: safe || null };
    if (safe && (project.logoMode || "text") !== "image") {
      patch.logoMode = "image";
    }
    updateProject(project.id, patch);
    syncThemeLogoPreview(safe || "");
    syncLogoModeUI(getProjectById(project.id));
    if (options.toast !== false) {
      showToast(safe ? "Logo sklepu zaktualizowane." : "Usunięto logo sklepu.");
    }
    renderPreviewTargets();
  }

  function clearThemeLogoImage() {
    var fileInput = $("[data-theme-logo-file]");
    if (fileInput) fileInput.value = "";
    setThemeLogoImage("");
  }

  function handleThemeLogoFile(file) {
    if (!file) return;
    if (!/^image\/(?:jpeg|png|webp|svg\+xml)$/i.test(file.type)) {
      showToast("Dozwolone formaty: JPG, PNG, WebP, SVG.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showToast("Logo jest za duże. W demo maksymalnie 2 MB.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var fileInput = $("[data-theme-logo-file]");
      if (fileInput) fileInput.value = "";
      setThemeLogoImage(reader.result);
    };
    reader.onerror = function () {
      showToast("Nie udało się wczytać pliku logo.");
    };
    reader.readAsDataURL(file);
  }

  function syncLogoModeUI(project) {
    if (!project) return;
    var mode = project.logoMode || "text";
    $all("[data-theme-logo-mode]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme-logo-mode") === mode);
    });
    var textFields = $("[data-logo-text-fields]");
    var imageFields = $("[data-logo-image-fields]");
    if (textFields) textFields.hidden = mode === "image";
    if (imageFields) imageFields.hidden = mode !== "image";
  }

  function renderCollectionsEditor() {
    var project = getActiveProject();
    var root = $("[data-collections-editor]");
    var hint = $("[data-collections-limit-hint]");
    var addBtns = $all("[data-add-collection]");
    if (!root || !project) return;

    var cols = project.collections || [];
    if (hint) hint.textContent = cols.length + " / " + MAX_COLLECTIONS;
    addBtns.forEach(function (btn) {
      btn.disabled = cols.length >= MAX_COLLECTIONS;
      btn.classList.toggle("is-disabled", cols.length >= MAX_COLLECTIONS);
    });

    if (!cols.length) {
      root.innerHTML =
        '<div class="panel-collections-empty">' +
        '<div class="panel-collections-empty__icon" aria-hidden="true"><i class="fas fa-layer-group"></i></div>' +
        "<strong>Brak kolekcji w lookbooku</strong>" +
        "<p>Dodaj pierwszą kolekcję — ustaw zdjęcie, tytuł i przypisz produkty ze sklepu.</p>" +
        '<button type="button" class="panel-primary-btn panel-primary-btn--compact" data-add-collection>' +
        '<i class="fas fa-plus" aria-hidden="true"></i> Dodaj pierwszą kolekcję</button>' +
        "</div>";
      return;
    }

    root.innerHTML = cols
      .map(function (col, idx) {
        var imgStyle = safeCssUrl(col.image) ? " style=\"background-image:url('" + safeCssUrl(col.image) + "')\"" : "";
        var count = (col.productIds || []).length;
        var hasImage = !!safeCssUrl(col.image);
        return (
          '<article class="panel-collection-row' +
          (hasImage ? "" : " panel-collection-row--no-image") +
          '" data-collection-row="' +
          escapeHtml(col.id) +
          '">' +
          '<div class="panel-collection-row__thumb"' +
          imgStyle +
          '">' +
          (hasImage ? "" : '<i class="fas fa-image" aria-hidden="true"></i>') +
          "</div>" +
          '<div class="panel-collection-row__body">' +
          "<h3>" +
          escapeHtml(col.title || "Kolekcja " + (idx + 1)) +
          "</h3>" +
          "<p>" +
          escapeHtml(col.subtitle || "Bez podtytułu") +
          "</p>" +
          '<div class="panel-collection-row__meta">' +
          '<span class="panel-collection-row__badge"><i class="fas fa-box-open" aria-hidden="true"></i> ' +
          count +
          " prod.</span>" +
          (hasImage ? '<span class="panel-collection-row__badge is-muted"><i class="fas fa-image" aria-hidden="true"></i> Zdjęcie</span>' : "") +
          "</div>" +
          "</div>" +
          '<div class="panel-collection-row__actions">' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--soft" data-edit-collection="' +
          escapeHtml(col.id) +
          '" title="Edytuj kolekcję" aria-label="Edytuj kolekcję"><i class="fas fa-pen" aria-hidden="true"></i></button>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger" data-delete-collection="' +
          escapeHtml(col.id) +
          '" title="Usuń kolekcję" aria-label="Usuń kolekcję"><i class="fas fa-trash" aria-hidden="true"></i></button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function syncCollectionImagePreview(url) {
    var preview = $("[data-collection-image-preview]");
    var empty = $("[data-collection-image-empty]");
    if (!preview) return;
    var safe = safeCssUrl(url);
    if (safe) {
      preview.style.backgroundImage = "url('" + safe + "')";
      preview.classList.add("has-image");
      if (empty) empty.hidden = true;
    } else {
      preview.style.backgroundImage = "";
      preview.classList.remove("has-image");
      if (empty) empty.hidden = false;
    }
  }

  function renderCollectionImagePresets(activeUrl) {
    var grid = $("[data-collection-image-presets]");
    var sf = storefrontApi();
    if (!grid || !sf || !sf.BANNER_PRESETS) return;
    grid.innerHTML = sf.BANNER_PRESETS.map(function (preset) {
      var active = activeUrl === preset.url;
      return (
        '<button type="button" class="panel-banner-preset' +
        (active ? " is-active" : "") +
        '" data-collection-image-preset="' +
        escapeHtml(preset.url) +
        '" title="' +
        escapeHtml(preset.label) +
        '"><span style="background-image:url(\'' +
        escapeHtml(preset.url) +
        "')\"></span>" +
        escapeHtml(preset.label) +
        "</button>"
      );
    }).join("");
  }

  function updateCollectionProductCount() {
    var countEl = $("[data-collection-product-count]");
    var picker = $("[data-collection-products-picker]");
    if (!countEl || !picker) return;
    var checked = picker.querySelectorAll("input:checked").length;
    countEl.textContent = checked ? checked + " wybr." : "0";
  }

  function renderCollectionProductsPicker(project, selectedIds) {
    var picker = $("[data-collection-products-picker]");
    if (!picker || !project) return;
    var selected = selectedIds || [];
    var products = project.products || [];
    if (!products.length) {
      picker.innerHTML =
        '<div class="panel-collection-products__empty">' +
        '<i class="fas fa-box-open" aria-hidden="true"></i>' +
        "<p>Brak produktów w sklepie.</p>" +
        '<span class="panel-field__hint">Dodaj produkty w zakładce Produkty, aby przypisać je do kolekcji.</span>' +
        "</div>";
      updateCollectionProductCount();
      return;
    }
    picker.innerHTML = products
      .map(function (p) {
        var checked = selected.indexOf(p.id) !== -1;
        return (
          '<label class="panel-collection-product' +
          (checked ? " is-selected" : "") +
          (p.status !== "active" ? " is-draft" : "") +
          '">' +
          '<input type="checkbox" value="' +
          escapeHtml(p.id) +
          '"' +
          (checked ? " checked" : "") +
          ">" +
          '<span class="panel-collection-product__check" aria-hidden="true"><i class="fas fa-check"></i></span>' +
          '<span class="panel-collection-product__body">' +
          '<strong class="panel-collection-product__name">' +
          escapeHtml(p.name) +
          "</strong>" +
          '<span class="panel-collection-product__price">' +
          escapeHtml(formatPrice(p.price)) +
          (p.status !== "active" ? " · szkic" : "") +
          "</span></span></label>"
        );
      })
      .join("");
    updateCollectionProductCount();
  }

  function openCollectionModal(collectionId) {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw wybierz projekt.");
      return;
    }
    if (!collectionModal) collectionModal = document.getElementById("collection-modal");
    if (!collectionModal) return;

    var col = (project.collections || []).find(function (c) {
      return c.id === collectionId;
    });
    if (!col) return;

    editingCollectionId = collectionId;
    var title = $("[data-collection-modal-title]");
    if (title) title.textContent = col.title ? "Edytuj: " + col.title : "Nowa kolekcja";
    $("[data-collection-id]").value = col.id;
    $("[data-collection-title]").value = col.title || "";
    $("[data-collection-subtitle]").value = col.subtitle || "";
    var imageInput = $("[data-collection-image]");
    if (imageInput) imageInput.value = col.image || "";
    syncCollectionImagePreview(col.image || "");
    renderCollectionImagePresets(col.image || "");
    renderCollectionProductsPicker(project, col.productIds || []);

    collectionModal.hidden = false;
    collectionModal.classList.add("is-open");
    collectionModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    $("[data-collection-title]").focus();
  }

  function closeCollectionModal() {
    if (!collectionModal || !collectionModal.classList.contains("is-open")) return;
    collectionModal.classList.remove("is-open");
    collectionModal.setAttribute("aria-hidden", "true");
    editingCollectionId = null;
    syncBodyModalLock();
    window.setTimeout(function () {
      if (collectionModal && !collectionModal.classList.contains("is-open")) collectionModal.hidden = true;
    }, 280);
  }

  function saveCollectionFromForm(event) {
    event.preventDefault();
    var project = getActiveProject();
    if (!project) return;

    var id = $("[data-collection-id]").value || uid("col");
    var title = $("[data-collection-title]").value.trim();
    var subtitle = $("[data-collection-subtitle]").value.trim();
    var image = $("[data-collection-image]").value.trim();
    var productIds = $all("[data-collection-products-picker] input:checked").map(function (input) {
      return input.value;
    });

    var cols = (project.collections || []).slice();
    var idx = cols.findIndex(function (c) {
      return c.id === id;
    });
    var item = { id: id, title: title, subtitle: subtitle, image: image, productIds: productIds };
    if (idx === -1) cols.push(item);
    else cols[idx] = item;

    updateProject(project.id, { collections: cols });
    closeCollectionModal();
    renderCollectionsEditor();
    renderPreviewTargets();
    showToast("Kolekcja zapisana.");
  }

  function deleteCollection(collectionId) {
    var project = getActiveProject();
    if (!project) return;
    var cols = (project.collections || []).filter(function (c) {
      return c.id !== collectionId;
    });
    updateProject(project.id, { collections: cols });
    renderCollectionsEditor();
    renderPreviewTargets();
    showToast("Usunięto kolekcję.");
  }

  function addCollection() {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw wybierz projekt.");
      return;
    }
    var cols = (project.collections || []).slice();
    if (cols.length >= MAX_COLLECTIONS) {
      showToast("Maksymalnie " + MAX_COLLECTIONS + " kolekcji.");
      return;
    }
    var sf = storefrontApi();
    var img = sf && sf.BANNER_PRESETS && sf.BANNER_PRESETS[0] ? sf.BANNER_PRESETS[0].url : "";
    var newCol = {
      id: uid("col"),
      title: "Nowa kolekcja",
      subtitle: "",
      image: img,
      productIds: []
    };
    cols.push(newCol);
    updateProject(project.id, { collections: cols });
    renderCollectionsEditor();
    renderPreviewTargets();
    openCollectionModal(newCol.id);
  }

  function renderProductsList(filter) {
    var project = getActiveProject();
    var empty = $("[data-products-empty]");
    var layout = $("[data-products-layout]");
    var list = $("[data-products-list]");
    if (!empty || !layout || !list) return;

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;
    var nameEl = $("[data-products-project-name]");
    if (nameEl) nameEl.textContent = project.name;

    var products = project.products || [];
    var q = (filter || "").trim().toLowerCase();
    if (q) {
      products = products.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1;
      });
    }

    var countEl = $("[data-products-count]");
    if (countEl) countEl.textContent = products.length + " produktów";
    var invHint = $("[data-products-inventory-hint]");
    if (invHint) {
      var low = getLowStockProducts(project, 5);
      if (low.length) {
        invHint.hidden = false;
        invHint.textContent = low.length + " produkt" + (low.length === 1 ? "" : "ów") + " z niskim stanem (≤ 5 szt.)";
      } else {
        invHint.hidden = true;
      }
    }

    if (!products.length) {
      list.innerHTML =
        '<div class="panel-modal__empty"><strong>Brak produktów</strong>Dodaj pierwszą ofertę — pojawi się w podglądzie sklepu po ustawieniu statusu „Aktywny".</div>';
      return;
    }

    list.innerHTML = products
      .map(function (p) {
        var imgUrl = safeCssUrl(p.image);
        var thumbClass =
          "panel-product-row__thumb" +
          (imgUrl ? " panel-product-row__thumb--photo" : " panel-project-card__thumb panel-project-card__thumb--" + escapeHtml(project.theme));
        var thumbStyle = imgUrl ? ' style="background-image:url(\'' + imgUrl + "')\"" : "";
        return (
          '<article class="panel-product-row' +
          (p.status === "draft" ? " is-draft" : "") +
          '" data-product-row="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="' +
          thumbClass +
          '"' +
          thumbStyle +
          ">" +
          (imgUrl ? "" : '<i class="fas fa-box" aria-hidden="true"></i>') +
          "</div>" +
          '<div class="panel-product-row__body">' +
          "<h3>" +
          escapeHtml(p.name) +
          "</h3>" +
          "<p>" +
          escapeHtml(p.desc || "Bez opisu") +
          "</p>" +
          '<div class="panel-product-row__meta">' +
          "<span>" +
          escapeHtml(formatPrice(p.price)) +
          "</span>" +
          "<span>Stan: " +
          escapeHtml(String(p.stock)) +
          "</span>" +
          (p.categoryId
            ? '<span class="panel-product-row__badge panel-product-row__badge--category">' +
              escapeHtml(getProductCategoryLabelForProject(project, p.categoryId)) +
              "</span>"
            : "") +
          (p.variants && p.variants.length
            ? '<span class="panel-product-row__badge panel-product-row__badge--variant">' +
              escapeHtml(
                p.variants
                  .map(function (v) {
                    return v.name;
                  })
                  .join(" · ")
              ) +
              "</span>"
            : "") +
          (p.tag ? '<span class="panel-product-row__badge">' + escapeHtml(p.tag) + "</span>" : "") +
          '<span class="panel-product-row__badge' +
          (p.status === "active" ? "" : " is-draft-badge") +
          '">' +
          (p.status === "active" ? "Aktywny" : "Szkic") +
          "</span></div></div>" +
          '<div class="panel-product-row__actions">' +
          '<button type="button" class="panel-project-card__btn" data-duplicate-product="' +
          escapeHtml(p.id) +
          '" title="Duplikuj"><i class="fas fa-clone" aria-hidden="true"></i></button>' +
          '<button type="button" class="panel-project-card__btn" data-edit-product="' +
          escapeHtml(p.id) +
          '"><i class="fas fa-pen" aria-hidden="true"></i></button>' +
          '<button type="button" class="panel-project-card__btn panel-project-card__btn--danger" data-delete-product="' +
          escapeHtml(p.id) +
          '" aria-label="Usuń"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function updateActiveProjectUI() {
    var project = getActiveProject();
    var chip = $(".panel-project-chip");
    var topName = $("[data-topbar-project-name]");
    var card = $("[data-active-project-card]");
    if (chip) chip.hidden = !project;
    if (topName && project) topName.textContent = project.name;
    if (card) {
      card.hidden = !project;
      var n = $("[data-active-project-name]");
      var m = $("[data-active-project-meta]");
      if (n && project) n.textContent = project.name;
      if (m && project) m.textContent = (project.status === "published" ? "Opublikowany" : "Szkic") + " · " + (project.products || []).length + " produktów";
    }
    var planChip = $("[data-plan-chip]");
    if (planChip) planChip.innerHTML = '<i class="fas fa-circle" aria-hidden="true"></i> ' + (PLAN_LABELS[getCurrentPlan()] || "Trial");
  }

  function refreshUI() {
    renderDashboard();
    if (currentView === "editor") renderEditor();
    if (currentView === "products") renderProductsList($("[data-products-filter]") && $("[data-products-filter]").value);
    if (currentView === "settings") renderSettings();
    if (currentView === "orders") renderOrders();
    if (currentView === "checkout") renderCheckout();
    if (currentView === "customers") renderCustomers($("[data-customers-filter]") && $("[data-customers-filter]").value);
    if (currentView === "analytics") renderAnalytics();
    if (currentView === "theme") renderTheme();
    if (currentView === "wallet") renderWallet();
    if (currentView === "plugins") renderPlugins();
    updateWalletNavBadge(getActiveProject());
    updateProjectCount();
    updatePlanBadge();
    updateLimitHints();
    updateActiveProjectUI();
    renderPreviewTargets();
    syncMobilePanelMenuNav();
    renderPanelNotifications();
  }

  function updateLimitHints() {
    var limits = getLimits();
    var project = getActiveProject();
    var hint = $("[data-products-limit-hint]");
    if (hint && project && limits.maxProducts > 0) {
      var count = (project.products || []).length;
      hint.hidden = false;
      hint.textContent = "Plan " + (PLAN_LABELS[getCurrentPlan()] || "Trial") + ": " + count + " / " + limits.maxProducts + " produktów";
      if (count >= limits.maxProducts) hint.classList.add("is-max");
      else hint.classList.remove("is-max");
    } else if (hint) {
      hint.hidden = true;
    }
  }

  function switchView(view) {
    currentView = view;
    $all("[data-panel-view]").forEach(function (el) {
      var active = el.getAttribute("data-panel-view") === view;
      el.classList.toggle("is-active", active);
      el.hidden = !active;
    });
    $all("[data-panel-nav]").forEach(function (link) {
      if (link.hasAttribute("data-panel-soon") || link.hasAttribute("data-open-projects-modal") || link.hasAttribute("data-scroll-preview")) return;
      link.classList.toggle("is-active", link.getAttribute("data-panel-nav") === view);
    });
    $all(".panel-mobile-nav [data-panel-nav]").forEach(function (link) {
      if (link.hasAttribute("data-scroll-preview")) return;
      link.classList.toggle("is-active", link.getAttribute("data-panel-nav") === view);
    });
    if (view === "editor") {
      renderEditor();
      var editorProject = getActiveProject();
      if (editorProject && !editorProject.categoryOnboardingDone && !categoryEditorHintShown) {
        categoryEditorHintShown = true;
        window.setTimeout(function () {
          showToast("Wybierz branżę sklepu u góry edytora — uruchomimy krótki kreator dopasowania.");
        }, 500);
      }
    }
    if (view === "products") renderProductsList();
    if (view === "dashboard") renderDashboard();
    if (view === "settings") renderSettings();
    if (view === "orders") renderOrders();
    if (view === "checkout") renderCheckout();
    if (view === "customers") renderCustomers();
    if (view === "analytics") renderAnalytics();
    if (view === "theme") renderTheme();
    if (view === "wallet") renderWallet();
    if (view === "plugins") renderPlugins();
    if (view === "plugin-app") renderPluginApp();
    if (view === "community") renderCommunity();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCommunity() {
    /* Statyczny widok — placeholder rynku społeczności */
  }

  function openCheckout(step) {
    checkoutWizardStep = step || "payments";
    if (!getActiveProject()) {
      showToast("Najpierw stwórz lub wybierz projekt.");
      openModal(getProjects().length ? "mine" : "create");
      return;
    }
    initCheckoutDraft(getActiveProject());
    switchView("checkout");
  }

  function initCheckoutDraft(project) {
    checkoutDraft = JSON.parse(JSON.stringify(project.checkout || getDefaultCheckout()));
    checkoutDraftProjectId = project ? project.id : null;
  }

  function syncCheckoutSelectionUI() {
    $all("[data-checkout-provider]").forEach(function (input) {
      var card = input.closest(".panel-checkout-card");
      if (card) card.classList.toggle("is-selected", input.checked);
    });
    $all("[data-checkout-shipping-id]").forEach(function (input) {
      var row = input.closest(".panel-checkout-shipping-row");
      if (row) row.classList.toggle("is-enabled", input.checked);
      var priceInput = row && row.querySelector("[data-checkout-shipping-price]");
      if (priceInput) priceInput.disabled = !input.checked;
    });
  }

  function saveCheckoutDraftToProject(markPayments, markShipping) {
    var project = getActiveProject();
    if (!project || !checkoutDraft) return null;
    var checkout = JSON.parse(JSON.stringify(checkoutDraft));
    if (markPayments) {
      var payOk =
        (checkout.payments.enabled || []).length > 0 &&
        (checkout.payments.enabled.indexOf("transfer") === -1 || isValidBankAccount(checkout.payments.bankAccount));
      checkout.payments.configured = payOk;
    }
    if (markShipping) {
      checkout.shipping.configured = (checkout.shipping.methods || []).some(function (m) {
        return m.enabled;
      });
    }
    var updated = updateProject(project.id, { checkout: checkout });
    if (updated) {
      var synced = syncChecklistAuto(getProjectById(project.id)) || updated;
      checkoutDraft = JSON.parse(JSON.stringify(synced.checkout || checkout));
      checkoutDraftProjectId = project.id;
      refreshUI();
    }
    return updated;
  }

  function renderCheckoutSteps() {
    return (
      '<nav class="panel-checkout-steps" aria-label="Kroki konfiguracji">' +
      CHECKOUT_STEPS.map(function (step, index) {
        var active = step.id === checkoutWizardStep;
        var done =
          (step.id === "payments" && checkoutDraft && checkoutDraft.payments.configured) ||
          (step.id === "shipping" && checkoutDraft && checkoutDraft.shipping.configured);
        return (
          '<button type="button" class="panel-checkout-steps__item' +
          (active ? " is-active" : "") +
          (done ? " is-done" : "") +
          '" data-checkout-step-nav="' +
          step.id +
          '">' +
          '<span class="panel-checkout-steps__num">' +
          (done ? '<i class="fas fa-check"></i>' : index + 1) +
          "</span><span>" +
          escapeHtml(step.label) +
          "</span></button>"
        );
      }).join("") +
      "</nav>"
    );
  }

  function renderCheckoutPaymentsStep() {
    var enabled = checkoutDraft.payments.enabled || [];
    return (
      '<section class="panel-checkout-panel is-active" data-checkout-panel="payments">' +
      '<div class="panel-checkout-demo-badge"><i class="fas fa-flask" aria-hidden="true"></i> Tryb demo — docelowo podłączysz prawdziwe API operatorów płatności.</div>' +
      "<h2>Metody płatności</h2>" +
      "<p>Wybierz co najmniej jedną metodę. W wersji produkcyjnej podłączysz klucze API PayU, Przelewy24 lub Stripe.</p>" +
      '<div class="panel-checkout-cards">' +
      PAYMENT_PROVIDERS.map(function (provider) {
        var unlocked = isCheckoutProviderUnlocked(provider);
        var isOn = enabled.indexOf(provider.id) !== -1;
        return (
          '<article class="panel-checkout-card' +
          (isOn ? " is-selected" : "") +
          (unlocked ? "" : " is-locked") +
          '">' +
          '<label class="panel-checkout-card__label">' +
          '<input type="checkbox" data-checkout-provider="' +
          escapeHtml(provider.id) +
          '"' +
          (isOn ? " checked" : "") +
          (unlocked ? "" : " disabled") +
          ">" +
          '<span class="panel-checkout-card__icon"><i class="fas ' +
          provider.icon +
          '" aria-hidden="true"></i></span>' +
          "<div><strong>" +
          escapeHtml(provider.name) +
          "</strong><span>" +
          escapeHtml(provider.desc) +
          "</span></div></label>" +
          (unlocked
            ? ""
            : '<a href="plany.html" class="panel-checkout-card__lock">Plan ' +
              escapeHtml(PLAN_LABELS[provider.tier] || provider.tier) +
              "+</a>") +
          "</article>"
        );
      }).join("") +
      "</div>" +
      '<div class="panel-checkout-fields">' +
      '<label class="panel-field"><span>Metoda domyślna</span><select data-checkout-primary>' +
      enabled
        .map(function (id) {
          return '<option value="' + escapeHtml(id) + '"' + (checkoutDraft.payments.primary === id ? " selected" : "") + ">" + escapeHtml(getPaymentProviderLabel(id)) + "</option>";
        })
        .join("") +
      (enabled.length ? "" : '<option value="">— wybierz metodę —</option>') +
      "</select></label>" +
      (enabled.indexOf("transfer") !== -1
        ? '<label class="panel-field panel-field--full"><span>Numer konta (przelew)</span><input type="text" data-checkout-bank maxlength="34" placeholder="PL XX XXXX XXXX XXXX XXXX XXXX XXXX" value="' +
          escapeHtml(checkoutDraft.payments.bankAccount || "") +
          '"></label>'
        : "") +
      (enabled.indexOf("cod") !== -1
        ? '<label class="panel-field"><span>Opłata za pobranie (zł)</span><input type="number" min="0" step="0.01" data-checkout-cod-fee value="' +
          escapeHtml(String(checkoutDraft.payments.codFee != null ? checkoutDraft.payments.codFee : 5)) +
          '"><span class="panel-field__micro">Doliczana do zamówienia, gdy klient wybierze pobranie</span></label>'
        : "") +
      "</div>" +
      '<div class="panel-checkout-actions">' +
      '<button type="button" class="panel-ghost-btn" data-checklist-go="editor">Wróć do edytora</button>' +
      '<button type="button" class="panel-primary-btn" data-checkout-next="shipping"><i class="fas fa-arrow-right" aria-hidden="true"></i> Dalej: dostawy</button>' +
      "</div></section>"
    );
  }

  function renderCheckoutShippingGroup(category, methods) {
    if (!methods.length) return "";
    var sf = storefrontApi();
    var meta =
      sf && sf.getShippingCategoryMeta
        ? sf.getShippingCategoryMeta(category)
        : {
            title: category === "pickup" ? "Odbiór w punkcie" : category === "express" ? "Dostawa ekspresowa" : "Dostawa na adres",
            icon: category === "pickup" ? "fa-box" : category === "express" ? "fa-bolt" : "fa-truck-fast",
            desc: ""
          };
    return (
      '<div class="panel-checkout-shipping-group panel-checkout-shipping-group--' +
      escapeHtml(category) +
      '"><div class="panel-checkout-shipping-group__head"><h3 class="panel-checkout-shipping-group__title"><i class="fas ' +
      escapeHtml(meta.icon) +
      '" aria-hidden="true"></i> ' +
      escapeHtml(meta.title) +
      '</h3><span class="panel-checkout-shipping-group__count">' +
      methods.filter(function (m) {
        return m.enabled;
      }).length +
      "/" +
      methods.length +
      "</span></div>" +
      (meta.desc ? '<p class="panel-checkout-shipping-group__desc">' + escapeHtml(meta.desc) + "</p>" : "") +
      '<div class="panel-checkout-shipping-group__list">' +
      methods
        .map(function (method) {
          return (
            '<article class="panel-checkout-shipping-row' +
            (method.enabled ? " is-enabled" : "") +
            '">' +
            '<label class="panel-checkout-shipping-row__toggle">' +
            '<input type="checkbox" class="panel-checkout-shipping-row__check" data-checkout-shipping-id="' +
            escapeHtml(method.id) +
            '"' +
            (method.enabled ? " checked" : "") +
            ">" +
            '<span class="panel-checkout-shipping-row__switch" aria-hidden="true"></span>' +
            '<span class="panel-checkout-shipping-row__icon"><i class="fas ' +
            escapeHtml(method.icon || "fa-truck") +
            '" aria-hidden="true"></i></span>' +
            "<div class=\"panel-checkout-shipping-row__copy\"><strong>" +
            escapeHtml(method.label) +
            (method.category === "express"
              ? '<span class="panel-checkout-shipping-row__tag">Ekspres</span>'
              : method.price === 0
                ? '<span class="panel-checkout-shipping-row__tag panel-checkout-shipping-row__tag--free">Gratis</span>'
                : "") +
            "</strong><span>" +
            escapeHtml(method.eta) +
            "</span></div></label>" +
            '<label class="panel-field panel-checkout-shipping-row__price"><span>Stawka (zł)</span><input type="number" min="0" step="0.01" data-checkout-shipping-price="' +
            escapeHtml(method.id) +
            '" value="' +
            escapeHtml(String(method.price)) +
            '"' +
            (method.enabled ? "" : " disabled") +
            "></label></article>"
          );
        })
        .join("") +
      "</div></div>"
    );
  }

  function renderCheckoutShippingStep() {
    var methods = checkoutDraft.shipping.methods || [];
    var expressMethods = methods.filter(function (m) {
      return m.category === "express";
    });
    var addressMethods = methods.filter(function (m) {
      return m.category === "address";
    });
    var pickupMethods = methods.filter(function (m) {
      return m.category === "pickup";
    });
    return (
      '<section class="panel-checkout-panel is-active" data-checkout-panel="shipping">' +
      '<div class="panel-checkout-demo-badge"><i class="fas fa-flask" aria-hidden="true"></i> Tryb demo — integracja z InPost / kurierem po wdrożeniu backendu.</div>' +
      "<h2>Metody dostawy</h2>" +
      "<p>Włącz ekspres, kurierów i punkty odbioru. Klient wybierze metodę w kasie — adres lub punkt zależnie od kategorii.</p>" +
      '<div class="panel-checkout-shipping">' +
      renderCheckoutShippingGroup("express", expressMethods) +
      renderCheckoutShippingGroup("address", addressMethods) +
      renderCheckoutShippingGroup("pickup", pickupMethods) +
      "</div>" +
      '<label class="panel-field"><span>Darmowa dostawa od kwoty (zł)</span><input type="number" min="0" step="1" data-checkout-free-from value="' +
      escapeHtml(String(checkoutDraft.shipping.freeFrom || 0)) +
      '"></label>' +
      '<div class="panel-checkout-actions">' +
      '<button type="button" class="panel-ghost-btn" data-checkout-step-nav="payments"><i class="fas fa-arrow-left" aria-hidden="true"></i> Wstecz</button>' +
      '<button type="button" class="panel-primary-btn" data-checkout-next="summary"><i class="fas fa-arrow-right" aria-hidden="true"></i> Podsumowanie</button>' +
      "</div></section>"
    );
  }

  function renderCheckoutSummaryStep() {
    var project = getActiveProject();
    var payments = checkoutDraft.payments;
    var shipping = checkoutDraft.shipping;
    var enabledShip = (shipping.methods || []).filter(function (m) {
      return m.enabled;
    });
    return (
      '<section class="panel-checkout-panel is-active" data-checkout-panel="summary">' +
      "<h2>Podsumowanie konfiguracji</h2>" +
      "<p>Sprawdź ustawienia przed zapisaniem. Po wdrożeniu produkcyjnym podłączysz prawdziwe bramki płatności i API kurierów.</p>" +
      '<div class="panel-checkout-summary">' +
      '<article class="panel-settings-card"><h3>Płatności</h3><ul class="panel-settings-list">' +
      (payments.enabled || [])
        .map(function (id) {
          return "<li>" + escapeHtml(getPaymentProviderLabel(id)) + (payments.primary === id ? " (domyślna)" : "") + "</li>";
        })
        .join("") +
      (payments.bankAccount ? "<li>Konto: " + escapeHtml(payments.bankAccount) + "</li>" : "") +
      (payments.enabled.indexOf("cod") !== -1
        ? "<li>Opłata za pobranie: " + escapeHtml(formatPrice(payments.codFee || 0)) + "</li>"
        : "") +
      "</ul></article>" +
      '<article class="panel-settings-card"><h3>Dostawy</h3><ul class="panel-settings-list">' +
      enabledShip
        .map(function (m) {
          return "<li>" + escapeHtml(m.label) + " — " + escapeHtml(formatPrice(m.price)) + "</li>";
        })
        .join("") +
      "<li>Darmowa dostawa od: " +
      escapeHtml(formatPrice(shipping.freeFrom || 0)) +
      "</li></ul></article>" +
      '<article class="panel-settings-card panel-settings-card--muted"><h3>Checklist publikacji</h3><p>Po zapisie odhaczymy kroki płatności i dostaw. Status sklepu: <strong>' +
      escapeHtml(project ? project.name : "") +
      '</strong>.</p><ul class="panel-settings-list"><li>Integracja API — zaplanowana na wersję produkcyjną</li><li>Dane zapisane lokalnie w demo panelu</li></ul></article>' +
      "</div>" +
      '<div class="panel-checkout-actions">' +
      '<button type="button" class="panel-ghost-btn" data-checkout-step-nav="shipping"><i class="fas fa-arrow-left" aria-hidden="true"></i> Wstecz</button>' +
      '<button type="button" class="panel-primary-btn" data-checkout-finish><i class="fas fa-circle-check" aria-hidden="true"></i> Zapisz konfigurację</button>' +
      "</div></section>"
    );
  }

  function isValidBankAccount(value) {
    var compact = String(value || "")
      .replace(/\s/g, "")
      .toUpperCase();
    if (!compact) return false;
    if (/^PL\d{26}$/.test(compact)) return true;
    if (/^\d{26}$/.test(compact)) return true;
    return false;
  }

  function readCheckoutDraftFromDOM() {
    if (!checkoutDraft) return;
    var providerInputs = $all("[data-checkout-provider]");
    if (providerInputs.length) {
      var enabled = [];
      providerInputs.forEach(function (input) {
        if (input.checked) enabled.push(input.getAttribute("data-checkout-provider"));
      });
      checkoutDraft.payments.enabled = enabled;
      var primary = $("[data-checkout-primary]");
      if (primary) checkoutDraft.payments.primary = primary.value || enabled[0] || null;
    }
    var bank = $("[data-checkout-bank]");
    if (bank) checkoutDraft.payments.bankAccount = bank.value.trim();
    var codFee = $("[data-checkout-cod-fee]");
    if (codFee) checkoutDraft.payments.codFee = parseFloat(codFee.value) || 0;
    var shippingInputs = $all("[data-checkout-shipping-id]");
    if (shippingInputs.length) {
      shippingInputs.forEach(function (input) {
        var id = input.getAttribute("data-checkout-shipping-id");
        var method = checkoutDraft.shipping.methods.find(function (m) {
          return m.id === id;
        });
        if (method) method.enabled = input.checked;
      });
    }
    $all("[data-checkout-shipping-price]").forEach(function (input) {
      var id = input.getAttribute("data-checkout-shipping-price");
      var method = checkoutDraft.shipping.methods.find(function (m) {
        return m.id === id;
      });
      if (method) method.price = parseFloat(input.value) || 0;
    });
    var freeFrom = $("[data-checkout-free-from]");
    if (freeFrom) checkoutDraft.shipping.freeFrom = parseFloat(freeFrom.value) || 0;
  }

  function validateCheckoutStep(step) {
    readCheckoutDraftFromDOM();
    if (step === "payments") {
      if (!(checkoutDraft.payments.enabled || []).length) {
        showToast("Wybierz co najmniej jedną metodę płatności.");
        return false;
      }
      if (checkoutDraft.payments.enabled.indexOf("transfer") !== -1) {
        if (!(checkoutDraft.payments.bankAccount || "").trim()) {
          showToast("Podaj numer konta dla przelewu bankowego.");
          return false;
        }
        if (!isValidBankAccount(checkoutDraft.payments.bankAccount)) {
          showToast("Numer konta wygląda na niepoprawny — użyj formatu PL + 26 cyfr.");
          return false;
        }
      }
      checkoutDraft.payments.configured = true;
      return true;
    }
    if (step === "shipping") {
      var any = (checkoutDraft.shipping.methods || []).some(function (m) {
        return m.enabled;
      });
      if (!any) {
        showToast("Włącz co najmniej jedną metodę dostawy.");
        return false;
      }
      checkoutDraft.shipping.configured = true;
      return true;
    }
    return true;
  }

  function renderCheckout() {
    var wizard = $("[data-checkout-wizard]");
    var layout = $("[data-checkout-app]");
    var empty = $("[data-checkout-empty]");
    if (!wizard) return;
    var project = getActiveProject();
    if (!project) {
      if (empty) empty.hidden = false;
      if (layout) layout.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (layout) layout.hidden = false;
    if (!checkoutDraft || checkoutDraftProjectId !== project.id) {
      initCheckoutDraft(project);
    }
    var nameEl = $("[data-checkout-project-name]");
    if (nameEl) nameEl.textContent = project.name;
    wizard.innerHTML =
      renderCheckoutSteps() +
      (checkoutWizardStep === "payments"
        ? renderCheckoutPaymentsStep()
        : checkoutWizardStep === "shipping"
          ? renderCheckoutShippingStep()
          : renderCheckoutSummaryStep());
  }

  function finishCheckoutWizard() {
    readCheckoutDraftFromDOM();
    if (!validateCheckoutStep("payments") || !validateCheckoutStep("shipping")) {
      checkoutWizardStep = !(checkoutDraft.payments.enabled || []).length ? "payments" : "shipping";
      renderCheckout();
      return;
    }
    saveCheckoutDraftToProject(true, true);
    pushActivity(getActiveProjectId(), "Skonfigurowano płatności i dostawy (demo)");
    var msg = isReadyToPublish(getActiveProject())
      ? "Zapisano konfigurację. Checklist kompletna — możesz opublikować sklep (demo)."
      : "Zapisano konfigurację płatności i dostaw.";
    showToast(msg);
  }

  function openProject(id) {
    selectProject(id, { openEditor: true });
  }

  function createProject(options) {
    if (!canCreateProject()) {
      showToast(getLimitMessage("project"));
      return null;
    }
    var projects = getProjects();
    var name = options.name || "Nowy sklep " + (projects.length + 1);
    var isTemplateProject = !!(options.templateId || options.source === "template");
    var blankDefaults =
      isTemplateProject || !storefrontApi() ? {} : storefrontApi().getBlankStoreDefaults(name);
    var project = normalizeProject(
      Object.assign(
        {
          id: uid("proj"),
          name: name,
          source: options.source || "blank",
          templateId: options.templateId || null,
          thumb: options.thumb || "blank",
          theme: options.theme || options.thumb || "blank",
          createdAt: Date.now(),
          checklist: { theme: !!options.templateId, product: false, payments: false, shipping: false },
          checkout: getDefaultCheckout(),
          activity: [{ text: "Utworzono projekt", ts: Date.now() }]
        },
        blankDefaults,
        options.defaults || {}
      )
    );
    projects.unshift(project);
    saveProjects(projects);
    setActiveProject(project.id);
    syncChecklistAuto(getProjectById(project.id));
    renderAllPanels();
    return project;
  }

  /* ---- Modal projektów (skrót) ---- */
  function updatePlanBadge() {
    var badge = $("[data-current-plan-badge]");
    if (!badge) return;
    badge.innerHTML = '<i class="fas fa-shield-halved" aria-hidden="true"></i> Plan: ' + escapeHtml(PLAN_LABELS[getCurrentPlan()] || "Trial");
  }

  function updateProjectCount() {
    var el = $("[data-project-count]");
    if (el) el.textContent = String(getProjects().length);
  }

  function renderCreatePanel() {
    var panel = $('[data-projects-panel="create"]');
    if (!panel) return;
    var projects = getProjects();
    var limits = getLimits();
    var atLimit = !canCreateProject();
    var limitBanner = atLimit
      ? '<div class="panel-limit-banner"><i class="fas fa-circle-exclamation" aria-hidden="true"></i><div><strong>Osiągnięto limit projektów</strong><span>' +
        escapeHtml(getLimitMessage("project")) +
        '</span></div><a href="plany.html" class="panel-modal__upgrade">Ulepsz plan</a></div>'
      : limits.maxProjects > 0
        ? '<p class="panel-modal__limit-note">Plan ' +
          escapeHtml(PLAN_LABELS[getCurrentPlan()] || "Trial") +
          ": " +
          projects.length +
          " / " +
          limits.maxProjects +
          " projektów</p>"
        : "";
    panel.innerHTML =
      limitBanner +
      '<div class="panel-modal__template-tip"><div><strong>Moda & Lookbook · Tech Store Pro</strong><span>Dwa gotowe szablony z koszykiem, checkoutem i panelem. Tech Store Pro dostępny w trialu — po jego zakończeniu wymaga planu Biznes.</span></div></div>' +
      '<div class="panel-modal__create-hero"><div><h3>Nowy projekt od zera</h3><p>Utwórz pusty sklep i skonfiguruj go krok po kroku.</p></div>' +
      '<button type="button" class="panel-modal__create-btn"' +
      (atLimit ? " disabled" : "") +
      ' data-create-blank><i class="fas fa-plus" aria-hidden="true"></i> Stwórz projekt</button></div>' +
      '<p class="panel-modal__subhead">Stwórz z szablonu</p>' +
      '<p class="panel-modal__soon-note"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i> Pełny flow masz w <strong>Moda & Lookbook</strong> i <strong>Tech Store Pro</strong>. Kolejne branże dopinamy — kliknij zablokowany szablon, żeby zobaczyć komunikat.</p>' +
      '<div class="panel-modal__grid panel-modal__grid--templates">' +
      renderTemplateCardsHtml() +
      "</div>" +
      '<p class="panel-modal__subhead">Szybkie opcje</p><div class="panel-modal__grid">' +
      '<article class="panel-project-card"><div class="panel-project-card__thumb panel-project-card__thumb--blank"' +
      buildTemplateThumbStyle(getTemplateById("amiq-minimal")) +
      '></div><div class="panel-project-card__body">' +
      '<div class="panel-project-card__meta"><span class="panel-project-card__tag">Pusty</span></div><h3>Pusty sklep</h3><p>Pełna kontrola nad układem.</p>' +
      '<div class="panel-project-card__actions"><button type="button" class="panel-project-card__btn panel-project-card__btn--primary"' +
      (atLimit ? " disabled" : "") +
      ' data-create-blank>Wybierz</button></div></div></article>' +
      (projects.length
        ? '<article class="panel-project-card"><div class="panel-project-card__thumb panel-project-card__thumb--fashion"' +
          buildTemplateThumbStyle(getTemplateById("amiq-fashion")) +
          '></div><div class="panel-project-card__body">' +
          '<div class="panel-project-card__meta"><span class="panel-project-card__tag">Duplikat</span></div><h3>Skopiuj istniejący</h3><p>Kopia ostatniego projektu z produktami.</p>' +
          '<div class="panel-project-card__actions"><button type="button" class="panel-project-card__btn panel-project-card__btn--primary"' +
          (atLimit ? " disabled" : "") +
          ' data-duplicate-last>Duplikuj</button></div></div></article>'
        : "") +
      "</div>";
  }

  function renderMinePanelPreview(project) {
    var wrap = $("[data-mine-preview-wrap]");
    if (!wrap) return;
    var sf = storefrontApi();
    if (!project || !sf) {
      wrap.innerHTML =
        '<div class="panel-mine-preview__empty"><i class="fas fa-store" aria-hidden="true"></i><strong>Wybierz projekt</strong><p>Kliknij sklep z listy — podgląd pojawi się tutaj i na pulpicie panelu.</p></div>';
      return;
    }
    wrap.innerHTML = sf.buildPanelPreview(project, { compact: true, device: "desktop" });
    bindPreviewControls(wrap);
  }

  function renderMinePanel() {
    var panel = $('[data-projects-panel="mine"]');
    if (!panel) return;
    var projects = getProjects();
    var activeId = getActiveProjectId();
    var activeProject = activeId ? getProjectById(activeId) : null;
    if (!projects.length) {
      panel.innerHTML =
        '<div class="panel-modal__empty"><strong>Brak projektów</strong><p>Stwórz pierwszy sklep lub dodaj szablon AmiQPlace.</p></div>';
      return;
    }
    if (!activeProject) {
      setActiveProject(projects[0].id);
      activeId = projects[0].id;
      activeProject = projects[0];
    }
    panel.innerHTML =
      '<div class="panel-mine-layout">' +
      '<div class="panel-mine-list">' +
      '<p class="panel-mine-list__hint"><i class="fas fa-hand-pointer" aria-hidden="true"></i> Wybierz projekt — każdy ma osobne ustawienia i zapisane edycje.</p>' +
      '<div class="panel-mine-list__grid">' +
      projects
        .map(function (project) {
          var isActive = project.id === activeId;
          return (
            '<article class="panel-mine-card' +
            (isActive ? " is-active" : "") +
            '" data-select-project="' +
            escapeHtml(project.id) +
            '">' +
            '<div class="panel-mine-card__thumb"' +
            buildProjectThumbStyle(project) +
            "></div>" +
            '<div class="panel-mine-card__body">' +
            '<div class="panel-project-card__meta">' +
            '<span class="panel-project-card__tag">' +
            escapeHtml(getProjectTemplateLabel(project)) +
            "</span>" +
            '<span class="panel-project-card__plan">' +
            (project.status === "published" ? "Live" : "Szkic") +
            " · " +
            (project.products || []).length +
            " prod.</span></div>" +
            "<h3>" +
            escapeHtml(project.name) +
            "</h3>" +
            "<p>" +
            escapeHtml(project.slug) +
            ".amiqplace.pl</p>" +
            (isActive ? '<span class="panel-mine-card__active"><i class="fas fa-circle-check" aria-hidden="true"></i> Aktywny w panelu</span>' : "") +
            "</div></article>"
          );
        })
        .join("") +
      "</div></div>" +
      '<div class="panel-mine-preview">' +
      '<div class="panel-mine-preview__head">' +
      "<div><strong>" +
      escapeHtml(activeProject ? activeProject.name : "Podgląd") +
      "</strong>" +
      "<span>" +
      escapeHtml(activeProject ? getProjectTemplateLabel(activeProject) : "") +
      (activeProject ? " · " + activeProject.slug + ".amiqplace.pl" : "") +
      "</span></div>" +
      '<div class="panel-mine-preview__actions">' +
      '<button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-open-project="' +
      escapeHtml(activeId) +
      '"><i class="fas fa-pen-to-square" aria-hidden="true"></i> Edytor</button>' +
      '<button type="button" class="panel-project-card__btn panel-project-card__btn--danger panel-ghost-btn--compact" data-delete-project="' +
      escapeHtml(activeId) +
      '" title="Usuń projekt"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
      "</div></div>" +
      '<div class="panel-mine-preview__frame" data-mine-preview-wrap></div>' +
      "</div></div>";
    renderMinePanelPreview(activeProject);
  }

  function renderAmiqPanel() {
    var panel = $('[data-projects-panel="amiq"]');
    if (!panel) return;
    panel.innerHTML =
      '<p class="panel-modal__subhead">Oficjalne szablony AmiQPlace</p>' +
      '<p class="panel-modal__soon-note">Gotowe szablony: <strong>Moda & Lookbook</strong>, <strong>Tech Store Pro</strong>, <strong>Maison Éclat</strong> i <strong>Multi-brand Hub</strong>. Każdy projekt zapisuje własne edycje.</p>' +
      '<div class="panel-modal__grid">' +
      renderTemplateCardsHtml() +
      "</div>";
  }

  function renderAllPanels() {
    renderCreatePanel();
    renderMinePanel();
    renderAmiqPanel();
    updateProjectCount();
    updatePlanBadge();
  }

  function getSampleProducts(theme) {
    var sf = storefrontApi();
    if (theme === "blank" && sf) {
      var defaults = sf.getTemplateDefaults("amiq-minimal");
      if (defaults && defaults.products) return defaults.products.map(function (p) {
        return Object.assign({}, p, { id: uid("prod"), updatedAt: Date.now() });
      });
    }
    var map = {
      fashion: [
        { id: uid("prod"), name: "Koszulka Essential", price: 89, stock: 24, status: "active", desc: "Bawełna organiczna", updatedAt: Date.now() },
        { id: uid("prod"), name: "Spodnie Wide", price: 149, stock: 12, status: "active", desc: "Kolekcja wiosenna", updatedAt: Date.now() }
      ],
      food: [{ id: uid("prod"), name: "Box Lunch Classic", price: 34.99, stock: 50, status: "active", desc: "Zestaw demo", updatedAt: Date.now() }],
      tech: [{ id: uid("prod"), name: "Słuchawki Pro X", price: 299, stock: 18, status: "active", desc: "Best seller", updatedAt: Date.now() }],
      lux: [{ id: uid("prod"), name: "Torebka Aurora", price: 890, stock: 5, status: "active", desc: "Edycja limitowana", updatedAt: Date.now() }],
      enterprise: [{ id: uid("prod"), name: "Atlas Pro Workspace", price: 2490, stock: 42, status: "active", desc: "Stanowisko corporate", brandLabel: "NordLine Office", updatedAt: Date.now() }]
    };
    return map[theme] ? map[theme].slice() : [];
  }

  function addTemplateToProjects(templateId) {
    if (!canCreateProject()) {
      showToast(getLimitMessage("project"));
      return;
    }
    var template = AMIQ_TEMPLATES.find(function (t) {
      return t.id === templateId;
    });
    if (!template || isTemplateComingSoon(template)) {
      if (template) showTemplateSoonToast(templateId);
      return;
    }
    if (!template || !canAccessTemplate(template, getCurrentPlan())) return;
    var p = createProject({
      name: uniqueProjectName(template.name),
      source: "template",
      templateId: template.id,
      thumb: template.thumb,
      theme: template.thumb,
      defaults: storefrontApi() ? storefrontApi().getTemplateDefaults(template.id) : null
    });
    if (!p) return;
    var defaults = storefrontApi() ? storefrontApi().getTemplateDefaults(template.id) : null;
    if (defaults) {
      var idMap = {};
      var products = (defaults.products || []).map(function (prod) {
        var newId = uid("prod");
        idMap[prod.id] = newId;
        return Object.assign({}, prod, { id: newId, updatedAt: Date.now() });
      });
      var collections = (defaults.collections || []).map(function (col) {
        return {
          id: uid("col"),
          title: col.title,
          subtitle: col.subtitle,
          image: col.image,
          productIds: (col.productIds || [])
            .map(function (pid) {
              return idMap[pid];
            })
            .filter(Boolean)
        };
      });
      var remapProductIds = function (ids) {
        return (ids || [])
          .map(function (pid) {
            return idMap[pid];
          })
          .filter(Boolean);
      };
      var techCategories = (defaults.techCategories || []).map(function (cat) {
        return {
          id: cat.id || uid("tcat"),
          label: cat.label,
          icon: cat.icon,
          desc: cat.desc,
          productIds: remapProductIds(cat.productIds)
        };
      });
      var techCompare = defaults.techCompare
        ? {
            productIds: remapProductIds(defaults.techCompare.productIds).slice(0, 4),
            specKeys: (defaults.techCompare.specKeys || []).slice()
          }
        : { productIds: [], specKeys: [] };
      var patch = {
        products: products,
        checklist: defaults.checklist || { theme: true, product: true, payments: false, shipping: false },
        storeCategory: defaults.storeCategory || null,
        storeName: defaults.storeName,
        heroTitle: defaults.heroTitle,
        heroSubtitle: defaults.heroSubtitle,
        heroCta: defaults.heroCta,
        heroBadge: defaults.heroBadge || null,
        heroImage: defaults.heroImage || null,
        heroLayout: defaults.heroLayout || "split",
        heroOverlay: defaults.heroOverlay,
        colorMode: defaults.colorMode || "light",
        accentColor: defaults.accentColor || null,
        cardRadius: defaults.cardRadius || "soft",
        headingStyle: defaults.headingStyle || "modern",
        lookbookTitle: defaults.lookbookTitle,
        lookbookSubtitle: defaults.lookbookSubtitle,
        collections: collections,
        logoMode: defaults.logoMode || "text",
        logoText: defaults.logoText || defaults.storeName,
        logoImage: defaults.logoImage || null,
        logoFont: defaults.logoFont || "manrope",
        sectionTitle: defaults.sectionTitle,
        sectionSubtitle: defaults.sectionSubtitle,
        aboutTitle: defaults.aboutTitle,
        aboutText: defaults.aboutText,
        newsletterTitle: defaults.newsletterTitle,
        newsletterSubtitle: defaults.newsletterSubtitle,
        announcement: defaults.announcement || null,
        techCompareTitle: defaults.techCompareTitle,
        techCompareSubtitle: defaults.techCompareSubtitle,
        techCategoriesTitle: defaults.techCategoriesTitle,
        techCategoriesSubtitle: defaults.techCategoriesSubtitle,
        techBrandsLabel: defaults.techBrandsLabel,
        techFaqTitle: defaults.techFaqTitle,
        techFaqSubtitle: defaults.techFaqSubtitle,
        techCategories: techCategories,
        techFaqs: (defaults.techFaqs || []).slice(),
        techCompare: techCompare,
        techBrands: (defaults.techBrands || []).slice(),
        techHeroStats: (defaults.techHeroStats || []).slice(),
        enterpriseBrandsTitle: defaults.enterpriseBrandsTitle,
        enterpriseBrandsSubtitle: defaults.enterpriseBrandsSubtitle,
        enterpriseSolutionsTitle: defaults.enterpriseSolutionsTitle,
        enterpriseSolutionsSubtitle: defaults.enterpriseSolutionsSubtitle,
        enterpriseSegmentsTitle: defaults.enterpriseSegmentsTitle,
        enterpriseSegmentsSubtitle: defaults.enterpriseSegmentsSubtitle,
        enterpriseCasesTitle: defaults.enterpriseCasesTitle,
        enterpriseCasesSubtitle: defaults.enterpriseCasesSubtitle,
        enterprisePartnersLabel: defaults.enterprisePartnersLabel,
        enterpriseFaqTitle: defaults.enterpriseFaqTitle,
        enterpriseFaqSubtitle: defaults.enterpriseFaqSubtitle,
        enterprisePortalTitle: defaults.enterprisePortalTitle,
        enterprisePortalSubtitle: defaults.enterprisePortalSubtitle,
        enterprisePortalCta: defaults.enterprisePortalCta,
        enterpriseBrands: (defaults.enterpriseBrands || []).slice(),
        enterpriseSolutions: (defaults.enterpriseSolutions || []).slice(),
        enterpriseSegments: (defaults.enterpriseSegments || []).slice(),
        enterpriseCaseStudies: (defaults.enterpriseCaseStudies || []).slice(),
        enterprisePartners: (defaults.enterprisePartners || []).slice(),
        enterpriseFaqs: (defaults.enterpriseFaqs || []).slice(),
        enterpriseHeroStats: (defaults.enterpriseHeroStats || []).slice(),
        sectionVisibility: defaults.sectionVisibility || null
      };
      updateProject(p.id, patch);
    } else {
      var samples = getSampleProducts(template.thumb);
      if (samples.length) {
        updateProject(p.id, {
          products: samples,
          checklist: { theme: true, product: true, payments: false, shipping: false }
        });
      }
    }
    syncChecklistAuto(getProjectById(p.id));
    pushActivity(p.id, "Dodano szablon AmiQPlace");
    switchTab("mine");
    selectProject(p.id, { silent: true });
    showToast("Dodano „" + p.name + "”. Wybierz projekt na liście lub otwórz edytor.");
  }

  function requestDeleteProject(projectId) {
    var project = getProjectById(projectId);
    if (!project || !deleteModal) return;
    pendingDeleteProjectId = projectId;
    var preview = $("[data-delete-project-preview]");
    if (preview) {
      preview.innerHTML =
        '<div class="panel-confirm__thumb panel-project-card__thumb panel-project-card__thumb--' +
        escapeHtml(project.theme) +
        '"></div>' +
        "<div><strong>" +
        escapeHtml(project.name) +
        "</strong><span>" +
        escapeHtml(project.slug) +
        ".amiqplace.pl · " +
        (project.products || []).length +
        " produktów</span></div>";
    }
    deleteModal.hidden = false;
    deleteModal.classList.add("is-open");
    deleteModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    $("[data-confirm-delete-project]").focus();
  }

  function closeDeleteModal() {
    if (!deleteModal || !deleteModal.classList.contains("is-open")) return;
    deleteModal.classList.remove("is-open");
    deleteModal.setAttribute("aria-hidden", "true");
    pendingDeleteProjectId = null;
    syncBodyModalLock();
    window.setTimeout(function () {
      if (!deleteModal.classList.contains("is-open")) deleteModal.hidden = true;
    }, 280);
  }

  function confirmDeleteProject() {
    if (!pendingDeleteProjectId) return;
    var project = getProjectById(pendingDeleteProjectId);
    if (!project) {
      closeDeleteModal();
      return;
    }
    var list = getProjects().filter(function (p) {
      return p.id !== pendingDeleteProjectId;
    });
    saveProjects(list);
    var deleted = getDeletedProjects();
    deleted.unshift({ project: project, deletedAt: Date.now() });
    saveDeletedProjects(deleted);
    if (getActiveProjectId() === pendingDeleteProjectId) {
      setActiveProject(list[0] ? list[0].id : null);
    }
    pendingDeleteProjectId = null;
    closeDeleteModal();
    renderAllPanels();
    refreshUI();
    if (currentView === "settings") renderSettings();
    showToast("Projekt przeniesiono do historii usuniętych (30 dni).");
  }

  function restoreDeletedProject(entryId) {
    var deleted = getDeletedProjects();
    var idx = deleted.findIndex(function (e) {
      return e.project.id === entryId;
    });
    if (idx === -1) return;
    if (!canCreateProject()) {
      showToast("Nie można przywrócić — " + getLimitMessage("project").toLowerCase());
      return;
    }
    var entry = deleted[idx];
    var projects = getProjects();
    projects.unshift(normalizeProject(entry.project));
    saveProjects(projects);
    deleted.splice(idx, 1);
    saveDeletedProjects(deleted);
    setActiveProject(entry.project.id);
    renderAllPanels();
    refreshUI();
    renderSettings();
    showToast('Przywrócono projekt „' + entry.project.name + '”.');
  }

  function purgeDeletedEntry(entryId) {
    var deleted = getDeletedProjects().filter(function (e) {
      return e.project.id !== entryId;
    });
    saveDeletedProjects(deleted);
    renderSettings();
    showToast("Projekt trwale usunięty z historii.");
  }

  function switchTab(tabId) {
    $all("[data-projects-tab]").forEach(function (btn) {
      var active = btn.getAttribute("data-projects-tab") === tabId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    $all("[data-projects-panel]").forEach(function (panel) {
      var active = panel.getAttribute("data-projects-panel") === tabId;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  function openModal(tab) {
    if (!modal) return;
    renderAllPanels();
    switchTab(tab || "create");
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    modal.querySelector(".panel-modal__close").focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    syncBodyModalLock();
    window.setTimeout(function () {
      if (!modal.classList.contains("is-open")) modal.hidden = true;
    }, 280);
    if (lastFocus) try {
      lastFocus.focus();
    } catch (e) {}
  }

  function syncProductImagePreview(url) {
    var preview = $("[data-product-image-preview]");
    var empty = $("[data-product-image-empty]");
    var clearBtn = $("[data-product-image-clear]");
    var hidden = $("[data-product-image]");
    var urlInput = $("[data-product-image-url]");
    if (!preview) return;
    var safe = safeCssUrl(url);
    if (hidden) hidden.value = safe || "";
    if (urlInput && safe && !/^data:image\//i.test(safe)) urlInput.value = safe;
    if (safe && /^data:image\//i.test(safe) && urlInput) urlInput.value = "";
    if (safe) {
      preview.style.backgroundImage = "url('" + safe + "')";
      preview.classList.add("has-image");
      if (empty) empty.hidden = true;
      if (clearBtn) clearBtn.hidden = false;
    } else {
      preview.style.backgroundImage = "";
      preview.classList.remove("has-image");
      if (empty) empty.hidden = false;
      if (clearBtn) clearBtn.hidden = true;
      if (urlInput) urlInput.value = "";
    }
  }

  function renderProductImagePresets(activeUrl) {
    var grid = $("[data-product-image-presets]");
    var sf = storefrontApi();
    if (!grid || !sf || !sf.PRODUCT_IMAGE_PRESETS) return;
    grid.innerHTML = sf.PRODUCT_IMAGE_PRESETS.map(function (preset) {
      var active = activeUrl === preset.url;
      return (
        '<button type="button" class="panel-banner-preset' +
        (active ? " is-active" : "") +
        '" data-product-image-preset="' +
        escapeHtml(preset.url) +
        '" title="' +
        escapeHtml(preset.label) +
        '"><span style="background-image:url(\'' +
        escapeHtml(preset.url) +
        "')\"></span>" +
        escapeHtml(preset.label) +
        "</button>"
      );
    }).join("");
  }

  function setProductImageValue(url) {
    syncProductImagePreview(url);
    renderProductImagePresets(safeCssUrl(url) && !/^data:image\//i.test(url) ? url : "");
  }

  function clearProductImage() {
    var fileInput = $("[data-product-image-file]");
    if (fileInput) fileInput.value = "";
    setProductImageValue("");
  }

  function handleProductImageFile(file) {
    if (!file) return;
    if (!/^image\/(?:jpeg|png|webp)$/i.test(file.type)) {
      showToast("Dozwolone formaty: JPG, PNG, WebP.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showToast("Zdjęcie jest za duże. W demo maksymalnie 2 MB.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      setProductImageValue(reader.result);
      showToast("Zdjęcie wczytane — zapisze się w projekcie po kliknięciu „Zapisz produkt”.");
    };
    reader.onerror = function () {
      showToast("Nie udało się wczytać pliku.");
    };
    reader.readAsDataURL(file);
  }

  function renderProductGalleryEditor() {
    var root = $("[data-product-gallery-editor]");
    var addBtn = $("[data-product-gallery-add]");
    if (!root) return;
    if (addBtn) {
      addBtn.disabled = productGalleryDraft.length >= MAX_PRODUCT_GALLERY;
    }
    if (!productGalleryDraft.length) {
      root.innerHTML =
        '<p class="panel-empty-hint">Brak zdjęć w galerii — dodaj zdjęcia, które pojawią się w opisie na stronie produktu.</p>';
      return;
    }
    root.innerHTML = productGalleryDraft
      .map(function (url, i) {
        var displayUrl = safeCssUrl(url) || (url && String(url).indexOf("data:image/") === 0 ? url : "");
        var style = displayUrl ? " style=\"background-image:url('" + displayUrl + "')\"" : "";
        var inputVal = url && String(url).indexOf("data:image/") !== 0 ? url : "";
        return (
          '<article class="panel-product-gallery-item">' +
          '<div class="panel-product-gallery-item__thumb"' +
          style +
          "></div>" +
          '<div class="panel-product-gallery-item__fields">' +
          '<label class="panel-field panel-field--full"><span>Zdjęcie ' +
          (i + 1) +
          " — link</span>" +
          '<input type="url" data-product-gallery-url data-gallery-index="' +
          i +
          '" value="' +
          escapeHtml(inputVal) +
          '" placeholder="https://..." maxlength="2000"></label>' +
          '<label class="panel-upload-dropzone panel-upload-dropzone--mini">' +
          '<input type="file" accept="image/jpeg,image/png,image/webp" data-product-gallery-file data-gallery-index="' +
          i +
          '" hidden>' +
          '<span><i class="fas fa-upload" aria-hidden="true"></i> Prześlij z pliku</span></label></div>' +
          '<button type="button" class="panel-icon-btn panel-icon-btn--danger" data-product-gallery-remove="' +
          i +
          '" aria-label="Usuń zdjęcie"><i class="fas fa-trash" aria-hidden="true"></i></button>' +
          "</article>"
        );
      })
      .join("");
  }

  function syncProductGalleryFromInputs() {
    $all("[data-product-gallery-url]").forEach(function (input) {
      var idx = parseInt(input.getAttribute("data-gallery-index"), 10);
      if (isNaN(idx) || !productGalleryDraft[idx]) return;
      var val = input.value.trim();
      if (val) productGalleryDraft[idx] = val;
    });
  }

  function getProductGalleryFromEditor() {
    syncProductGalleryFromInputs();
    return productGalleryDraft
      .map(function (url) {
        return safeCssUrl(url) || (url && String(url).indexOf("data:image/") === 0 ? url.trim() : "");
      })
      .filter(Boolean)
      .slice(0, MAX_PRODUCT_GALLERY);
  }

  function addProductGallerySlot() {
    if (productGalleryDraft.length >= MAX_PRODUCT_GALLERY) {
      showToast("Maksymalnie " + MAX_PRODUCT_GALLERY + " zdjęć w galerii.");
      return;
    }
    var sf = storefrontApi();
    var preset =
      sf && sf.PRODUCT_IMAGE_PRESETS && sf.PRODUCT_IMAGE_PRESETS[productGalleryDraft.length]
        ? sf.PRODUCT_IMAGE_PRESETS[productGalleryDraft.length].url
        : "";
    productGalleryDraft.push(preset);
    renderProductGalleryEditor();
  }

  function removeProductGallerySlot(index) {
    productGalleryDraft.splice(index, 1);
    renderProductGalleryEditor();
  }

  function handleProductGalleryFile(file, index) {
    if (!file || index < 0 || index >= productGalleryDraft.length) return;
    if (!/^image\/(?:jpeg|png|webp)$/i.test(file.type)) {
      showToast("Dozwolone formaty galerii: JPG, PNG, WebP.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      showToast("Zdjęcie galerii max. 2 MB.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      productGalleryDraft[index] = reader.result;
      renderProductGalleryEditor();
    };
    reader.readAsDataURL(file);
  }

  function fillProductExtendedFields(product) {
    var p = product || {};
    var ship = $("[data-product-shipping]");
    if (ship) ship.value = p.shippingTime || "1–3 dni robocze";
    var sku = $("[data-product-sku]");
    if (sku) sku.value = p.sku || "";
    var compare = $("[data-product-compare-price]");
    if (compare) compare.value = p.comparePrice && p.comparePrice > 0 ? p.comparePrice : "";
    var longDesc = $("[data-product-long-desc]");
    if (longDesc) longDesc.value = p.longDesc || "";
    productVariantsDraft = Array.isArray(p.variants)
      ? p.variants.map(function (v) {
          return {
            id: v.id || uid("var"),
            name: v.name || "",
            options: Array.isArray(v.options) ? v.options.slice() : []
          };
        })
      : p.sizes
        ? [{ id: uid("var"), name: "Rozmiar", options: parseVariantOptionsText(p.sizes) }]
        : [];
    renderProductVariantsEditor();
    renderProductCategorySelect(getActiveProject(), p.categoryId || "");
    productGalleryDraft = Array.isArray(p.gallery) ? p.gallery.slice(0, MAX_PRODUCT_GALLERY) : [];
    renderProductGalleryEditor();
    productSpecsDraft = Array.isArray(p.specs)
      ? p.specs.map(function (s) {
          return { label: s.label || "", value: s.value || "" };
        })
      : [];
    productSpecsVisibleDraft = p.specsVisible !== false;
    renderProductSpecsEditor();
  }

  function openProductModal(productId) {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw wybierz projekt.");
      openModal("create");
      return;
    }
    editingProductId = productId || null;
    if (!productId && !canAddProduct(project, true)) {
      showToast(getLimitMessage("product"));
      return;
    }
    var form = $("[data-product-form]");
    var title = $("[data-product-modal-title]");
    if (title) title.textContent = productId ? "Edytuj produkt" : "Dodaj produkt";
    if (!form) return;

    if (productId) {
      var p = (project.products || []).find(function (x) {
        return x.id === productId;
      });
      if (!p) return;
      $("[data-product-id]").value = p.id;
      $("[data-product-name]").value = p.name;
      $("[data-product-price]").value = p.price;
      $("[data-product-stock]").value = p.stock;
      $("[data-product-status]").value = p.status;
      $("[data-product-desc]").value = p.desc || "";
      var tagEl = $("[data-product-tag]");
      if (tagEl) tagEl.value = p.tag || "";
      setProductImageValue(p.image || "");
      fillProductExtendedFields(p);
    } else {
      form.reset();
      $("[data-product-id]").value = "";
      var tagReset = $("[data-product-tag]");
      if (tagReset) tagReset.value = "";
      clearProductImage();
      renderProductImagePresets("");
      fillProductExtendedFields(null);
      renderProductCategorySelect(project, "");
      productVariantsDraft = [];
      renderProductVariantsEditor();
      productSpecsDraft = [];
      productSpecsVisibleDraft = true;
      renderProductSpecsEditor();
      maybeSuggestProductVariantsFromProfile(project);
      maybeSuggestProductSpecsFromTemplate(project);
    }

    syncProductSpecsBlock(project);
    renderCategoryProductHints(project);
    productModal.hidden = false;
    productModal.classList.add("is-open");
    productModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    $("[data-product-name]").focus();
  }

  function closeProductModal() {
    if (!productModal || !productModal.classList.contains("is-open")) return;
    productModal.classList.remove("is-open");
    productModal.setAttribute("aria-hidden", "true");
    syncBodyModalLock();
    editingProductId = null;
    window.setTimeout(function () {
      if (!productModal.classList.contains("is-open")) productModal.hidden = true;
    }, 280);
  }

  function saveProductFromForm(event) {
    event.preventDefault();
    var project = getActiveProject();
    if (!project) return;

    var name = $("[data-product-name]").value.trim();
    var price = parseFloat($("[data-product-price]").value) || 0;
    var stock = parseInt($("[data-product-stock]").value, 10) || 0;
    var status = $("[data-product-status]").value;
    var desc = $("[data-product-desc]").value.trim();
    var id = $("[data-product-id]").value || uid("prod");
    var imageRaw = $("[data-product-image]") ? $("[data-product-image]").value.trim() : "";
    var image = safeCssUrl(imageRaw) || null;
    var tagEl = $("[data-product-tag]");
    var tag = tagEl && tagEl.value ? tagEl.value.trim() : null;
    var compareRaw = $("[data-product-compare-price]") ? $("[data-product-compare-price]").value : "";
    var comparePrice = parseFloat(compareRaw);
    if (!compareRaw || isNaN(comparePrice) || comparePrice <= 0) comparePrice = null;
    var categoryEl = $("[data-product-category]");
    var categoryId = categoryEl && categoryEl.value ? categoryEl.value.trim() : null;

    var products = (project.products || []).slice();
    var idx = products.findIndex(function (p) {
      return p.id === id;
    });
    if (idx === -1 && !canAddProduct(project, true)) {
      showToast(getLimitMessage("product"));
      return;
    }
    var item = {
      id: id,
      name: name,
      price: price,
      stock: stock,
      status: status,
      desc: desc,
      image: image,
      tag: tag,
      categoryId: categoryId,
      shippingTime: $("[data-product-shipping]") ? $("[data-product-shipping]").value : "1–3 dni robocze",
      sku: $("[data-product-sku]") ? $("[data-product-sku]").value.trim() : "",
      variants: readProductVariantsForSave(),
      comparePrice: comparePrice,
      longDesc: $("[data-product-long-desc]") ? $("[data-product-long-desc]").value.trim() : "",
      gallery: getProductGalleryFromEditor(),
      updatedAt: Date.now()
    };
    if (isTechProject(project)) {
      item.specs = readProductSpecsForSave();
      item.specsVisible = productSpecsVisibleDraft !== false;
    }
    if (idx === -1) products.unshift(item);
    else products[idx] = Object.assign({}, products[idx], item);

    var checklist = Object.assign({}, project.checklist, { product: products.some(function (p) {
      return p.status === "active";
    }) });

    updateProject(project.id, { products: products, checklist: checklist });
    syncChecklistAuto(getProjectById(project.id));
    pushActivity(project.id, (idx === -1 ? "Dodano" : "Zaktualizowano") + ' produkt „' + name + '"');
    closeProductModal();
    refreshUI();
    showToast("Produkt zapisany.");
  }

  function deleteProduct(productId) {
    var project = getActiveProject();
    if (!project) return;
    var products = (project.products || []).filter(function (p) {
      return p.id !== productId;
    });
    updateProject(project.id, {
      products: products,
      checklist: Object.assign({}, project.checklist, { product: products.some(function (p) {
        return p.status === "active";
      }) })
    });
    pushActivity(project.id, "Usunięto produkt");
    refreshUI();
    showToast("Produkt usunięty.");
  }

  function renderDomainDnsTable(records) {
    if (!records || !records.length) return "";
    return (
      '<div class="panel-domain-dns"><table><thead><tr><th>Typ</th><th>Host</th><th>Wartość</th><th></th></tr></thead><tbody>' +
      records
        .map(function (rec) {
          return (
            "<tr><td><code>" +
            escapeHtml(rec.type) +
            '</code></td><td><code>' +
            escapeHtml(rec.host) +
            '</code></td><td class="panel-domain-dns__value"><code>' +
            escapeHtml(rec.value) +
            '</code><small>' +
            escapeHtml(rec.purpose || "") +
            '</small></td><td><button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-copy-dns-value="' +
            escapeHtml(rec.value) +
            '" aria-label="Kopiuj wartość"><i class="fas fa-copy" aria-hidden="true"></i></button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function requestCustomDomain() {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw wybierz projekt sklepu.");
      return;
    }
    if (!canUseCustomDomain()) {
      showToast("Własna domena dostępna od planu " + getDomainPlanLabel() + " — ulepsz pakiet w Plany.");
      return;
    }
    if (project.status !== "published") {
      showToast("Najpierw opublikuj sklep — domena własna wymaga aktywnego sklepu live.");
      return;
    }
    var input = $("[data-domain-hostname]");
    var hostname = normalizeDomainInput(input && input.value);
    if (!isValidCustomDomain(hostname)) {
      showToast("Podaj prawidłową domenę, np. sklep.twojafirma.pl (bez https://).");
      return;
    }
    var token = buildDomainVerificationToken(project);
    var customDomain = {
      hostname: hostname,
      status: "pending_dns",
      primary: true,
      sslStatus: "none",
      verificationToken: token,
      dnsRecords: buildDomainDnsRecords(hostname, project, token),
      requestedAt: Date.now(),
      connectedAt: null,
      lastCheckedAt: null,
      errorMessage: null,
      wwwRedirect: true
    };
    updateProject(project.id, { customDomain: customDomain });
    pushActivity(project.id, "Dodano domenę własną: " + hostname + " (oczekuje DNS)");
    refreshUI();
    showToast("Domena zapisana — skonfiguruj rekordy DNS u rejestratora.");
  }

  function checkCustomDomainDns() {
    var project = getActiveProject();
    if (!project) return;
    var domain = getCustomDomainMeta(project);
    if (domain.status !== "pending_dns") {
      showToast("Brak domeny oczekującej na konfigurację DNS.");
      return;
    }
    updateProject(project.id, {
      customDomain: Object.assign({}, domain, {
        status: "verifying",
        sslStatus: "pending",
        lastCheckedAt: Date.now(),
        errorMessage: null
      })
    });
    pushActivity(project.id, "Zweryfikowano DNS dla " + domain.hostname + " (demo)");
    refreshUI();
    showToast("Rekordy DNS OK (demo) — wystawiamy certyfikat SSL…");
  }

  function activateCustomDomainSsl() {
    var project = getActiveProject();
    if (!project) return;
    var domain = getCustomDomainMeta(project);
    if (domain.status !== "verifying") {
      showToast("Najpierw zweryfikuj rekordy DNS.");
      return;
    }
    updateProject(project.id, {
      customDomain: Object.assign({}, domain, {
        status: "active",
        sslStatus: "active",
        primary: true,
        connectedAt: Date.now(),
        lastCheckedAt: Date.now(),
        errorMessage: null
      })
    });
    pushActivity(project.id, "Aktywowano domenę " + domain.hostname);
    refreshUI();
    showToast("Domena " + domain.hostname + " aktywna (demo) — gotowa pod produkcję.");
  }

  function removeCustomDomain() {
    var project = getActiveProject();
    if (!project) return;
    var domain = getCustomDomainMeta(project);
    if (!domain.hostname) return;
    if (!window.confirm("Odłączyć domenę " + domain.hostname + "? Sklep wróci tylko pod adresem AmiQPlace.")) return;
    updateProject(project.id, { customDomain: normalizeCustomDomain({}, project) });
    pushActivity(project.id, "Odłączono domenę własną");
    refreshUI();
    showToast("Odłączono domenę własną.");
  }

  function saveCustomDomainOptions() {
    var project = getActiveProject();
    if (!project) return;
    var domain = getCustomDomainMeta(project);
    if (domain.status !== "active") return;
    var primaryEl = $("[data-domain-primary]");
    var wwwEl = $("[data-domain-www-redirect]");
    updateProject(project.id, {
      customDomain: Object.assign({}, domain, {
        primary: primaryEl ? primaryEl.checked : domain.primary,
        wwwRedirect: wwwEl ? wwwEl.checked : domain.wwwRedirect
      })
    });
    refreshUI();
    showToast("Zapisano ustawienia domeny.");
  }

  function switchSettingsTab(tab) {
    currentSettingsTab = tab;
    $all("[data-settings-tab]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-settings-tab") === tab);
    });
    $all("[data-settings-panel]").forEach(function (panel) {
      var active = panel.getAttribute("data-settings-panel") === tab;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
    renderSettings();
  }

  function renderSettingsToggle(key, label, desc, checked) {
    return (
      '<label class="panel-settings-toggle">' +
      '<input type="checkbox" data-settings-notify-' +
      key +
      (checked ? " checked" : "") +
      ">" +
      "<span><strong>" +
      escapeHtml(label) +
      "</strong>" +
      (desc ? '<em>' + escapeHtml(desc) + "</em>" : "") +
      "</span></label>"
    );
  }

  function saveSettingsProfile() {
    var nameInput = $("[data-settings-profile-name]");
    if (!nameInput) return;
    var name = nameInput.value.trim();
    if (name.length < 2) {
      showToast("Podaj nazwę wyświetlaną (min. 2 znaki).");
      return;
    }
    var user = readSessionUser();
    if (!user) return;
    user.name = name;
    writeSessionUser(user);
    syncAccountMenuUser();
    showToast("Zapisano profil konta.");
  }

  function saveSettingsPrefs() {
    var prefs = getPanelPrefs();
    var langEl = $("[data-settings-pref-language]");
    var tzEl = $("[data-settings-pref-timezone]");
    var compactEl = $("[data-settings-pref-compact]");
    var motionEl = $("[data-settings-pref-motion]");
    if (langEl) prefs.language = langEl.value === "en" ? "en" : "pl";
    if (tzEl) prefs.timezone = tzEl.value || "Europe/Warsaw";
    if (compactEl) prefs.compactSidebar = compactEl.checked;
    if (motionEl) prefs.reducedMotion = motionEl.checked;
    savePanelPrefs(prefs);
    showToast("Zapisano preferencje panelu.");
  }

  function saveSettingsStore() {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw wybierz projekt sklepu.");
      return;
    }
    var storeName = ($("[data-settings-store-name]") || {}).value;
    var slugRaw = ($("[data-settings-store-slug]") || {}).value;
    var contactEmail = ($("[data-settings-store-email]") || {}).value;
    var contactPhone = ($("[data-settings-store-phone]") || {}).value;
    var seoTitle = ($("[data-settings-store-seo-title]") || {}).value;
    var seoDescription = ($("[data-settings-store-seo-desc]") || {}).value;
    var returnPolicy = ($("[data-settings-store-returns]") || {}).value;
    var supportHours = ($("[data-settings-store-hours]") || {}).value;
    var maintenanceMode = ($("[data-settings-store-maintenance]") || {}).checked;
    var hideFromSearch = ($("[data-settings-store-noindex]") || {}).checked;

    storeName = String(storeName || "").trim();
    if (storeName.length < 2) {
      showToast("Nazwa sklepu musi mieć co najmniej 2 znaki.");
      return;
    }
    var slug = slugify(slugRaw || storeName);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      showToast("Adres sklepu może zawierać tylko litery, cyfry i myślniki.");
      return;
    }
    if (!isSlugAvailable(slug, project.id)) {
      showToast("Ten adres sklepu jest już zajęty — wybierz inny slug.");
      return;
    }
    if (contactEmail && !isValidEmail(contactEmail)) {
      showToast("Podaj prawidłowy e-mail kontaktowy.");
      return;
    }

    var storeSettings = normalizeStoreSettings(
      {
        contactEmail: contactEmail.trim(),
        contactPhone: String(contactPhone || "").trim(),
        seoTitle: String(seoTitle || "").trim() || storeName,
        seoDescription: String(seoDescription || "").trim(),
        maintenanceMode: maintenanceMode,
        hideFromSearch: hideFromSearch,
        returnPolicy: String(returnPolicy || "").trim(),
        supportHours: String(supportHours || "").trim()
      },
      { storeName: storeName, name: project.name }
    );

    updateProject(project.id, {
      name: storeName,
      storeName: storeName,
      slug: slug,
      storeSettings: storeSettings
    });
    pushActivity(project.id, "Zaktualizowano ustawienia sklepu");
    refreshUI();
    showToast("Zapisano ustawienia sklepu.");
  }

  function saveSettingsNotifications() {
    var prefs = getPanelPrefs();
    prefs.notifications.newOrder = !!($("[data-settings-notify-newOrder]") || {}).checked;
    prefs.notifications.lowStock = !!($("[data-settings-notify-lowStock]") || {}).checked;
    prefs.notifications.payout = !!($("[data-settings-notify-payout]") || {}).checked;
    prefs.notifications.weeklyDigest = !!($("[data-settings-notify-weeklyDigest]") || {}).checked;
    prefs.notifications.sound = !!($("[data-settings-notify-sound]") || {}).checked;
    savePanelPrefs(prefs);
    showToast("Zapisano preferencje powiadomień.");
  }

  function changeSettingsPassword() {
    var current = ($("[data-settings-current-password]") || {}).value;
    var next = ($("[data-settings-new-password]") || {}).value;
    var confirm = ($("[data-settings-confirm-password]") || {}).value;
    var user = readSessionUser();
    if (!user) return;
    if (!current || !next) {
      showToast("Uzupełnij obecne i nowe hasło.");
      return;
    }
    if (user.password !== current) {
      showToast("Obecne hasło jest nieprawidłowe.");
      return;
    }
    if (next.length < 8) {
      showToast("Nowe hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (next !== confirm) {
      showToast("Potwierdzenie hasła nie pasuje.");
      return;
    }
    user.password = next;
    writeSessionUser(user);
    var currentEl = $("[data-settings-current-password]");
    var nextEl = $("[data-settings-new-password]");
    var confirmEl = $("[data-settings-confirm-password]");
    if (currentEl) currentEl.value = "";
    if (nextEl) nextEl.value = "";
    if (confirmEl) confirmEl.value = "";
    showToast("Hasło zostało zmienione (zapis lokalny w demo).");
  }

  function exportSettingsData() {
    var user = readSessionUser();
    var safeUser = user ? { email: user.email, name: user.name, verified: user.verified, createdAt: user.createdAt } : null;
    downloadJsonFile(
      "amiqplace-export-" + new Date().toISOString().slice(0, 10) + ".json",
      {
        exportedAt: new Date().toISOString(),
        plan: getCurrentPlan(),
        prefs: getPanelPrefs(),
        user: safeUser,
        activeProjectId: getActiveProjectId(),
        projects: getProjects(),
        deletedProjects: getDeletedProjects()
      }
    );
    showToast("Pobrano eksport danych panelu.");
  }

  function resetDemoPanelData() {
    if (
      !window.confirm(
        "Wyczyścić wszystkie projekty, zamówienia i historię w tej przeglądarce? Konto pozostanie zalogowane."
      )
    ) {
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_PROJECTS);
      sessionStorage.removeItem(STORAGE_ACTIVE);
      sessionStorage.removeItem(STORAGE_DELETED);
      localStorage.removeItem(STORAGE_PROJECTS);
      localStorage.removeItem(STORAGE_ACTIVE);
      localStorage.removeItem(STORAGE_DELETED);
    } catch (e) {}
    refreshUI();
    showToast("Wyczyszczono dane demo panelu.");
  }

  function renderSettings() {
    var general = $('[data-settings-panel="general"]');
    var storePanel = $('[data-settings-panel="store"]');
    var domainPanel = $('[data-settings-panel="domain"]');
    var plan = $('[data-settings-panel="plan"]');
    var trash = $('[data-settings-panel="trash"]');
    var notificationsPanel = $('[data-settings-panel="notifications"]');
    var securityPanel = $('[data-settings-panel="security"]');
    if (!general) return;

    var user = readSessionUser() || { email: "demo@amiqplace.pl", name: "Konto demo" };
    var prefs = getPanelPrefs();
    var activeProject = getActiveProject();
    var catMeta = activeProject && activeProject.storeCategory ? getStoreCategoryById(activeProject.storeCategory) : null;
    var profileHtml =
      catMeta && activeProject.categoryProfile && Object.keys(activeProject.categoryProfile).length
        ? '<dl class="panel-category-profile panel-category-profile--settings">' +
          buildCategoryProfileSummaryHtml(catMeta, activeProject.categoryProfile) +
          "</dl>"
        : "";
    var projectSettingsCard = activeProject
      ? '<div class="panel-settings-card">' +
        "<h3>Aktywny sklep</h3>" +
        '<p class="panel-settings-card__sub">' +
        escapeHtml(activeProject.name) +
        " · " +
        escapeHtml(activeProject.slug) +
        ".amiqplace.pl · " +
        (activeProject.status === "published" ? "Opublikowany" : "Szkic") +
        "</p>" +
        (catMeta
          ? '<div class="panel-settings-category-block">' +
            '<p class="panel-settings-category"><i class="fas ' +
            catMeta.icon +
            '" aria-hidden="true"></i> Branża: <strong>' +
            escapeHtml(catMeta.name) +
            '</strong> <button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-panel-nav="editor">Zmień w edytorze</button></p>' +
            profileHtml +
            "</div>"
          : '<p class="panel-settings-category panel-settings-category--empty"><i class="fas fa-compass" aria-hidden="true"></i> Branża nie wybrana — <button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-panel-nav="editor">ustaw w edytorze</button></p>') +
        '<button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-settings-tab-jump="store"><i class="fas fa-store" aria-hidden="true"></i> Ustawienia sklepu</button>' +
        "</div>"
      : "";

    general.innerHTML =
      projectSettingsCard +
      '<div class="panel-settings-card">' +
      "<h3>Profil konta</h3>" +
      '<p class="panel-settings-card__sub">Imię widoczne w menu konta i powiadomieniach panelu.</p>' +
      '<label class="panel-field"><span>Adres e-mail</span><input type="email" value="' +
      escapeHtml(user.email || "") +
      '" disabled title="E-mail zmienisz po podłączeniu backendu"></label>' +
      '<label class="panel-field"><span>Nazwa wyświetlana</span><input type="text" data-settings-profile-name value="' +
      escapeHtml(user.name || "") +
      '" placeholder="Twoje imię lub nazwa firmy"></label>' +
      '<button type="button" class="panel-primary-btn" data-settings-save-profile><i class="fas fa-floppy-disk" aria-hidden="true"></i> Zapisz profil</button>' +
      "</div>" +
      '<div class="panel-settings-card">' +
      "<h3>Preferencje panelu</h3>" +
      '<label class="panel-field"><span>Język interfejsu</span><select data-settings-pref-language>' +
      '<option value="pl"' +
      (prefs.language === "pl" ? " selected" : "") +
      ">Polski</option>" +
      '<option value="en"' +
      (prefs.language === "en" ? " selected" : "") +
      ">English (beta)</option>" +
      "</select></label>" +
      '<label class="panel-field"><span>Strefa czasowa</span><select data-settings-pref-timezone>' +
      [
        { id: "Europe/Warsaw", label: "Europe/Warsaw (UTC+1/+2)" },
        { id: "Europe/London", label: "Europe/London (UTC+0/+1)" },
        { id: "Europe/Berlin", label: "Europe/Berlin (UTC+1/+2)" },
        { id: "America/New_York", label: "America/New_York (UTC-5/-4)" }
      ]
        .map(function (tz) {
          return (
            '<option value="' +
            tz.id +
            '"' +
            (prefs.timezone === tz.id ? " selected" : "") +
            ">" +
            escapeHtml(tz.label) +
            "</option>"
          );
        })
        .join("") +
      "</select></label>" +
      '<label class="panel-settings-toggle"><input type="checkbox" data-settings-pref-compact' +
      (prefs.compactSidebar ? " checked" : "") +
      "><span><strong>Kompaktowy sidebar</strong><em>Więcej miejsca na treść — same ikony w menu.</em></span></label>" +
      '<label class="panel-settings-toggle"><input type="checkbox" data-settings-pref-motion' +
      (prefs.reducedMotion ? " checked" : "") +
      "><span><strong>Ograniczone animacje</strong><em>Wyłącza efekty przejść w panelu.</em></span></label>" +
      '<button type="button" class="panel-primary-btn" data-settings-save-prefs><i class="fas fa-floppy-disk" aria-hidden="true"></i> Zapisz preferencje</button>' +
      "</div>";

    if (storePanel) {
      if (!activeProject) {
        storePanel.innerHTML =
          '<div class="panel-modal__empty"><strong>Brak aktywnego sklepu</strong>Wybierz lub utwórz projekt, aby edytować ustawienia sklepu.</div>';
      } else {
        var ss = activeProject.storeSettings || normalizeStoreSettings({}, activeProject);
        storePanel.innerHTML =
          '<div class="panel-settings-card">' +
          "<h3>Identyfikacja sklepu</h3>" +
          '<p class="panel-settings-card__sub">Nazwa i adres publiczny — slug musi być unikalny w Twoim koncie.</p>' +
          '<label class="panel-field"><span>Nazwa sklepu</span><input type="text" data-settings-store-name value="' +
          escapeHtml(activeProject.storeName || activeProject.name) +
          '"></label>' +
          '<label class="panel-field"><span>Adres sklepu (slug)</span><div class="panel-settings-slug"><input type="text" data-settings-store-slug value="' +
          escapeHtml(activeProject.slug) +
          '"><span>.amiqplace.pl</span></div></label>' +
          '<p class="panel-settings-card__sub panel-settings-card__sub--inline">Chcesz własną domenę? <button type="button" class="panel-ghost-btn panel-ghost-btn--compact" data-settings-tab-jump="domain"><i class="fas fa-globe" aria-hidden="true"></i> Skonfiguruj domenę własną</button></p>' +
          "</div>" +
          '<div class="panel-settings-card">' +
          "<h3>Kontakt i obsługa</h3>" +
          '<label class="panel-field"><span>E-mail kontaktowy</span><input type="email" data-settings-store-email value="' +
          escapeHtml(ss.contactEmail) +
          '" placeholder="kontakt@twojsklep.pl"></label>' +
          '<label class="panel-field"><span>Telefon</span><input type="tel" data-settings-store-phone value="' +
          escapeHtml(ss.contactPhone) +
          '" placeholder="+48 600 000 000"></label>' +
          '<label class="panel-field"><span>Godziny obsługi</span><input type="text" data-settings-store-hours value="' +
          escapeHtml(ss.supportHours) +
          '"></label>' +
          "</div>" +
          '<div class="panel-settings-card">' +
          "<h3>SEO i widoczność</h3>" +
          '<label class="panel-field"><span>Tytuł strony (meta title)</span><input type="text" data-settings-store-seo-title value="' +
          escapeHtml(ss.seoTitle) +
          '" maxlength="70"></label>' +
          '<label class="panel-field"><span>Opis (meta description)</span><textarea data-settings-store-seo-desc rows="3" maxlength="160">' +
          escapeHtml(ss.seoDescription) +
          "</textarea></label>" +
          '<label class="panel-settings-toggle"><input type="checkbox" data-settings-store-noindex' +
          (ss.hideFromSearch ? " checked" : "") +
          "><span><strong>Ukryj przed wyszukiwarkami</strong><em>Dodaje noindex — sklep nie pojawi się w Google.</em></span></label>" +
          "</div>" +
          '<div class="panel-settings-card">' +
          "<h3>Polityka i dostępność</h3>" +
          '<label class="panel-field"><span>Polityka zwrotów (skrót)</span><textarea data-settings-store-returns rows="3" placeholder="Np. 14 dni na zwrot bez podania przyczyny...">' +
          escapeHtml(ss.returnPolicy) +
          "</textarea></label>" +
          '<label class="panel-settings-toggle"><input type="checkbox" data-settings-store-maintenance' +
          (ss.maintenanceMode ? " checked" : "") +
          "><span><strong>Tryb konserwacji</strong><em>Klienci zobaczą stronę „wkrótce wracamy” zamiast sklepu.</em></span></label>" +
          (ss.maintenanceMode
            ? '<p class="panel-settings-hint panel-settings-hint--warn"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Tryb konserwacji jest aktywny — podgląd w panelu nadal działa.</p>'
            : "") +
          "</div>" +
          '<button type="button" class="panel-primary-btn" data-settings-save-store><i class="fas fa-floppy-disk" aria-hidden="true"></i> Zapisz ustawienia sklepu</button>';
      }
    }

    if (domainPanel) {
      if (!activeProject) {
        domainPanel.innerHTML =
          '<div class="panel-modal__empty"><strong>Brak aktywnego sklepu</strong>Wybierz projekt, aby podłączyć własną domenę.</div>';
      } else if (!canUseCustomDomain()) {
        domainPanel.innerHTML =
          '<div class="panel-domain-upsell">' +
          '<div class="panel-domain-upsell__icon"><i class="fas fa-globe" aria-hidden="true"></i></div>' +
          "<h3>Własna domena w planie " +
          escapeHtml(getDomainPlanLabel()) +
          "</h3>" +
          "<p>Podłącz adres <strong>sklep.twojafirma.pl</strong> z automatycznym SSL. Konfigurator DNS jest gotowy — odblokuj go po wyborze planu " +
          escapeHtml(getDomainPlanLabel()) +
          " lub wyższego.</p>" +
          '<ul class="panel-settings-list"><li>Rekordy CNAME / A / TXT generowane automatycznie</li><li>Certyfikat SSL i odnowienia</li><li>Alias AmiQPlace pozostaje jako backup</li><li>Status propagacji DNS w panelu</li></ul>' +
          '<a href="plany.html" class="panel-primary-btn"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Porównaj plany</a></div>' +
          '<div class="panel-settings-card panel-settings-card--muted"><h3>Co przygotowaliśmy?</h3><p class="panel-settings-card__sub">Szablon konfiguracji jest już w panelu — po upgrade zobaczysz pełny flow: dodanie domeny, tabela DNS, weryfikacja i aktywacja SSL.</p></div>';
      } else {
        var domain = getCustomDomainMeta(activeProject);
          '<div class="panel-settings-card panel-settings-card--muted">' +
          "<h3>Adresy sklepu</h3>" +
          '<ul class="panel-domain-urls">' +
          "<li><span>Domyślny AmiQPlace</span><strong>" +
          escapeHtml(defaultUrl) +
          "</strong></li>" +
          (domain.hostname
            ? "<li><span>Własna domena</span><strong>" +
              escapeHtml(domain.hostname) +
              "</strong> · " +
              escapeHtml(domainMeta.label) +
              "</li>"
            : "<li><span>Własna domena</span><em>Nie skonfigurowano</em></li>") +
          "</ul></div>" +
          '<section class="panel-domain-connect panel-domain-connect--' +
          domainMeta.tone +
          '">' +
          '<div class="panel-domain-connect__icon"><i class="fas fa-globe" aria-hidden="true"></i></div>' +
          "<div><div class=\"panel-domain-connect__head\"><strong>Połączenie domeny</strong><span class=\"panel-domain-connect__status\"><i class=\"fas " +
          domainMeta.icon +
          '" aria-hidden="true"></i> ' +
          escapeHtml(domainMeta.label) +
          "</span></div>" +
          (domain.status === "not_connected"
            ? "<p>Podłącz domenę zakupioną u dowolnego rejestratora (home.pl, OVH, Cloudflare…). Po wdrożeniu usługi weryfikujemy DNS i wystawiamy certyfikat SSL.</p>"
            : domain.status === "pending_dns"
              ? "<p>Dodaj poniższe rekordy DNS u rejestratora domeny <strong>" +
                escapeHtml(domain.hostname) +
                "</strong>, potem kliknij „Sprawdź DNS”. Propagacja może potrwać do 24 h.</p>"
              : domain.status === "verifying"
                ? "<p>Rekordy DNS poprawne — trwa wystawianie certyfikatu SSL dla <strong>" +
                  escapeHtml(domain.hostname) +
                  "</strong> (demo: kliknij aktywację poniżej).</p>"
                : domain.status === "active"
                  ? "<p>Domena <strong>" +
                    escapeHtml(domain.hostname) +
                    "</strong> jest aktywna" +
                    (domain.connectedAt ? " od " + escapeHtml(formatPublishedAt(domain.connectedAt)) : "") +
                    ". SSL: " +
                    (domain.sslStatus === "active" ? "aktywny" : "oczekuje") +
                    ".</p>"
                  : "<p>" +
                    escapeHtml(domain.errorMessage || "Wystąpił błąd konfiguracji domeny.") +
                    "</p>") +
          '<ul class="panel-domain-connect__steps">' +
          '<li class="' +
          (domain.status !== "not_connected" ? "is-done" : "is-active") +
          '"><i class="fas fa-keyboard" aria-hidden="true"></i> Podaj domenę</li>' +
          '<li class="' +
          (domain.status === "pending_dns" || domain.status === "verifying" || domain.status === "active" ? "is-done" : "") +
          (domain.status === "pending_dns" ? " is-active" : "") +
          '"><i class="fas fa-server" aria-hidden="true"></i> Rekordy DNS</li>' +
          '<li class="' +
          (domain.status === "verifying" || domain.status === "active" ? "is-done" : "") +
          (domain.status === "verifying" ? " is-active" : "") +
          '"><i class="fas fa-lock" aria-hidden="true"></i> Certyfikat SSL</li>' +
          '<li class="' +
          (domain.status === "active" ? "is-done is-active" : "") +
          '"><i class="fas fa-circle-check" aria-hidden="true"></i> Domena live</li></ul></div>' +
          '<div class="panel-domain-connect__actions">' +
          (domain.status === "not_connected"
            ? '<button type="button" class="panel-primary-btn" data-domain-request' +
              (published ? "" : " disabled") +
              '><i class="fas fa-plus" aria-hidden="true"></i> Dodaj domenę</button>'
            : domain.status === "pending_dns"
              ? '<button type="button" class="panel-primary-btn" data-domain-check-dns><i class="fas fa-rotate" aria-hidden="true"></i> Sprawdź DNS</button>'
              : domain.status === "verifying"
                ? '<button type="button" class="panel-primary-btn" data-domain-activate-ssl><i class="fas fa-lock" aria-hidden="true"></i> Aktywuj SSL (demo)</button>'
                : domain.status === "active"
                  ? '<button type="button" class="panel-ghost-btn" data-domain-recheck><i class="fas fa-rotate" aria-hidden="true"></i> Sprawdź ponownie</button>'
                  : '<button type="button" class="panel-primary-btn" data-domain-request><i class="fas fa-rotate-left" aria-hidden="true"></i> Spróbuj ponownie</button>') +
          (domain.hostname && domain.status !== "not_connected"
            ? '<button type="button" class="panel-ghost-btn panel-ghost-btn--danger" data-domain-remove><i class="fas fa-link-slash" aria-hidden="true"></i> Odłącz</button>'
            : "") +
          "</div></section>" +
          (domain.status === "not_connected" || domain.status === "error"
            ? '<div class="panel-settings-card">' +
              "<h3>Nowa domena</h3>" +
              (published
                ? '<p class="panel-settings-card__sub">Wpisz domenę bez https:// — np. <code>sklep.example.com</code> lub <code>www.example.com</code>.</p>'
                : '<p class="panel-settings-hint panel-settings-hint--warn"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Najpierw opublikuj sklep — domena własna wymaga statusu live.</p>') +
              '<label class="panel-field"><span>Twoja domena</span><input type="text" data-domain-hostname placeholder="sklep.twojafirma.pl" value="' +
              escapeHtml(domain.hostname || "") +
              '"' +
              (published ? "" : " disabled") +
              "></label></div>"
            : "") +
          (domain.status === "pending_dns" || domain.status === "verifying" || domain.status === "active"
            ? '<div class="panel-settings-card"><h3>Rekordy DNS</h3><p class="panel-settings-card__sub">Skopiuj wartości do panelu rejestratora. TTL zalecamy 3600 s (1 h).</p>' +
              renderDomainDnsTable(domain.dnsRecords) +
              '<p class="panel-settings-hint"><i class="fas fa-circle-info" aria-hidden="true"></i> Po wdrożeniu usługi sprawdzimy rekordy automatycznie co kilka minut.</p></div>'
            : "") +
          (domain.status === "active"
            ? '<div class="panel-settings-card"><h3>Opcje domeny</h3>' +
              '<label class="panel-settings-toggle"><input type="checkbox" data-domain-primary' +
              (domain.primary ? " checked" : "") +
              "><span><strong>Użyj jako główny adres</strong><em>W publikacji i udostępnianiu pokażemy tę domenę zamiast " +
              escapeHtml(defaultUrl) +
              ".</em></span></label>" +
              '<label class="panel-settings-toggle"><input type="checkbox" data-domain-www-redirect' +
              (domain.wwwRedirect ? " checked" : "") +
              "><span><strong>Przekieruj www → apex</strong><em>www.domena.pl przekieruje na domena.pl (produkcja).</em></span></label>" +
              '<button type="button" class="panel-primary-btn" data-domain-save-options><i class="fas fa-floppy-disk" aria-hidden="true"></i> Zapisz opcje</button></div>'
            : "") +
          '<div class="panel-settings-card panel-settings-card--muted"><h3>Co będzie po podłączeniu usługi?</h3><ul class="panel-settings-list"><li>Automatyczna weryfikacja TXT + CNAME/A</li><li>SSL wildcard / apex i auto-renew</li><li>Status propagacji DNS w czasie rzeczywistym</li><li>Integracja z Cloudflare i popularnymi rejestratorami PL</li></ul></div>';
      }
    }

    if (notificationsPanel) {
      var n = prefs.notifications;
      notificationsPanel.innerHTML =
        '<div class="panel-settings-card">' +
        "<h3>Powiadomienia w panelu</h3>" +
        '<p class="panel-settings-card__sub">W demo zapis lokalny — po wdrożeniu backendu wyślemy e-mail i push.</p>' +
        renderSettingsToggle("newOrder", "Nowe zamówienie", "Alert po każdym nowym zamówieniu w sklepie.", n.newOrder) +
        renderSettingsToggle("lowStock", "Niski stan magazynowy", "Gdy produkt spadnie poniżej progu na pulpicie.", n.lowStock) +
        renderSettingsToggle("payout", "Wypłaty ze Stripe", "Potwierdzenie zlecenia wypłaty z portfela.", n.payout) +
        renderSettingsToggle("weeklyDigest", "Tygodniowy raport", "Podsumowanie sprzedaży — w produkcji e-mail w poniedziałek.", n.weeklyDigest) +
        renderSettingsToggle("sound", "Dźwięk powiadomienia", "Krótki sygnał przy ważnych alertach (tylko panel).", n.sound) +
        "</div>" +
        '<div class="panel-settings-card panel-settings-card--muted">' +
        "<h3>Co działa teraz?</h3>" +
        "<ul class=\"panel-settings-list\"><li>Toast w panelu po zapisie i ważnych akcjach</li><li>Alerty niskiego stanu na pulpicie (gdy włączone)</li><li>E-mail i push — po podłączeniu usług</li></ul>" +
        "</div>" +
        '<button type="button" class="panel-primary-btn" data-settings-save-notifications><i class="fas fa-floppy-disk" aria-hidden="true"></i> Zapisz powiadomienia</button>';
    }

    if (securityPanel) {
      var sessionStarted = user.createdAt ? new Date(user.createdAt).toLocaleString("pl-PL") : "—";
      securityPanel.innerHTML =
        '<div class="panel-settings-card">' +
        "<h3>Zmiana hasła</h3>" +
        '<p class="panel-settings-card__sub">Demo zapisuje hasło lokalnie — tak samo jak logowanie w auth.js.</p>' +
        '<label class="panel-field"><span>Obecne hasło</span><input type="password" data-settings-current-password autocomplete="current-password"></label>' +
        '<label class="panel-field"><span>Nowe hasło</span><input type="password" data-settings-new-password autocomplete="new-password" minlength="8"></label>' +
        '<label class="panel-field"><span>Potwierdź nowe hasło</span><input type="password" data-settings-confirm-password autocomplete="new-password"></label>' +
        '<button type="button" class="panel-primary-btn" data-settings-change-password><i class="fas fa-key" aria-hidden="true"></i> Zmień hasło</button>' +
        "</div>" +
        '<div class="panel-settings-card">' +
        "<h3>Sesja i dane</h3>" +
        '<ul class="panel-settings-list">' +
        "<li><strong>Konto:</strong> " +
        escapeHtml(user.email || "") +
        "</li>" +
        "<li><strong>Ostatnie logowanie (demo):</strong> " +
        escapeHtml(sessionStarted) +
        "</li>" +
        "<li><strong>Przeglądarka:</strong> aktywna sesja lokalna</li>" +
        "</ul>" +
        '<div class="panel-settings-actions">' +
        '<button type="button" class="panel-ghost-btn" data-settings-export-data><i class="fas fa-download" aria-hidden="true"></i> Eksportuj dane (JSON)</button>' +
        '<button type="button" class="panel-ghost-btn panel-ghost-btn--danger" data-settings-reset-demo><i class="fas fa-broom" aria-hidden="true"></i> Wyczyść dane demo</button>' +
        "</div>" +
        "</div>" +
        '<div class="panel-settings-card panel-settings-card--muted">' +
        "<h3>Bezpieczeństwo produkcyjne</h3>" +
        "<ul class=\"panel-settings-list\"><li>2FA i logowanie SSO</li><li>Historia logowań i unieważnianie sesji</li><li>Szyfrowane hasła i tokeny API</li></ul>" +
        "</div>";
    }

    if (plan) {
      var limits = getLimits();
      var projCount = getProjects().length;
      var project = getActiveProject();
      var prodCount = project ? (project.products || []).length : 0;
      var planName = PLAN_LABELS[getCurrentPlan()] || "Trial";
      plan.innerHTML =
        '<div class="panel-settings-card">' +
        "<h3>Twój plan: " +
        escapeHtml(planName) +
        "</h3>" +
        '<p class="panel-settings-card__sub">Limity zależą od aktywnego pakietu. Trial ma ograniczenia demo.</p>' +
        '<div class="panel-limits">' +
        renderLimitBar("Projekty sklepu", projCount, limits.maxProjects) +
        renderLimitBar("Produkty (aktywny sklep)", prodCount, limits.maxProducts) +
        "</div>" +
        '<a href="plany.html#porownanie" class="panel-primary-btn panel-settings-upgrade"><i class="fas fa-table-columns" aria-hidden="true"></i> Porównaj szczegóły funkcji planów</a>' +
        '<a href="plany.html" class="panel-settings-link-btn"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Zmień plan / checkout</a>' +
        "</div>" +
        '<div class="panel-settings-card panel-settings-card--muted">' +
        "<h3>Co odblokujesz po upgrade?</h3>" +
        "<ul class=\"panel-settings-list\"><li>Więcej projektów i produktów</li><li>Szablony AmiQPlace z wyższych planów</li><li>Zamówienia, płatności i raporty bez limitu demo</li><li>Wsparcie priorytetowe</li></ul>" +
        "</div>";
    }

    if (trash) {
      purgeExpiredDeleted();
      var deleted = getDeletedProjects();
      if (!deleted.length) {
        trash.innerHTML =
          '<div class="panel-modal__empty"><strong>Historia pusta</strong>Usunięte projekty pojawią się tutaj na 30 dni — potem znikają na zawsze.</div>';
      } else {
        trash.innerHTML =
          '<p class="panel-settings-trash-note"><i class="fas fa-clock" aria-hidden="true"></i> Projekty są przechowywane ' +
          DELETED_RETENTION_DAYS +
          " dni, potem usuwane trwale (symulacja — lokalnie w przeglądarce).</p>" +
          '<div class="panel-trash-list">' +
          deleted
            .map(function (entry) {
              var p = normalizeProject(entry.project);
              var days = daysUntilPermanent(entry.deletedAt);
              return (
                '<article class="panel-trash-row">' +
                '<div class="panel-trash-row__thumb panel-project-card__thumb panel-project-card__thumb--' +
                escapeHtml(p.theme) +
                '"></div>' +
                "<div class=\"panel-trash-row__body\"><strong>" +
                escapeHtml(p.name) +
                "</strong><span>Usunięto: " +
                new Date(entry.deletedAt).toLocaleString("pl-PL") +
                "</span><span class=\"panel-trash-row__days\">Pozostało: " +
                days +
                " dni</span></div>" +
                '<div class="panel-trash-row__actions">' +
                (canCreateProject()
                  ? '<button type="button" class="panel-project-card__btn panel-project-card__btn--primary" data-restore-project="' +
                    escapeHtml(p.id) +
                    '"><i class="fas fa-rotate-left" aria-hidden="true"></i> Przywróć</button>'
                  : '<button type="button" class="panel-project-card__btn is-disabled" disabled title="Osiągnięto limit projektów">Przywróć</button>') +
                '<button type="button" class="panel-project-card__btn panel-project-card__btn--danger" data-purge-deleted="' +
                escapeHtml(p.id) +
                '" aria-label="Usuń trwale"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
                "</div></article>"
              );
            })
            .join("") +
          "</div>";
      }
    }

    var checkoutPanel = $('[data-settings-panel="checkout"]');
    if (checkoutPanel) {
      var activeProject = getActiveProject();
      if (!activeProject) {
        checkoutPanel.innerHTML =
          '<div class="panel-modal__empty"><strong>Brak aktywnego sklepu</strong>Wybierz projekt, aby zobaczyć konfigurację płatności i dostaw.</div>';
      } else {
        var co = activeProject.checkout || getDefaultCheckout();
        var payList = (co.payments.enabled || []).map(function (id) {
          return getPaymentProviderLabel(id);
        });
        var shipList = (co.shipping.methods || [])
          .filter(function (m) {
            return m.enabled;
          })
          .map(function (m) {
            return m.label + " (" + formatPrice(m.price) + ")";
          });
        checkoutPanel.innerHTML =
          '<div class="panel-checkout-demo-badge"><i class="fas fa-flask" aria-hidden="true"></i> Demo — docelowo podłączenie API operatorów i kurierów.</div>' +
          '<div class="panel-settings-card"><h3>Płatności</h3>' +
          (co.payments.configured
            ? '<ul class="panel-settings-list">' +
              payList.map(function (x) {
                return "<li>" + escapeHtml(x) + "</li>";
              }).join("") +
              "</ul>"
            : '<p class="panel-settings-card__sub">Nieskonfigurowane — uruchom kreator.</p>') +
          "</div>" +
          '<div class="panel-settings-card"><h3>Dostawy</h3>' +
          (co.shipping.configured
            ? '<ul class="panel-settings-list">' +
              shipList.map(function (x) {
                return "<li>" + escapeHtml(x) + "</li>";
              }).join("") +
              "<li>Darmowa dostawa od: " +
              escapeHtml(formatPrice(co.shipping.freeFrom || 0)) +
              "</li></ul>"
            : '<p class="panel-settings-card__sub">Nieskonfigurowane — uruchom kreator.</p>') +
          "</div>" +
          '<button type="button" class="panel-primary-btn" data-settings-open-checkout><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i> Otwórz kreator płatności i dostaw</button>';
      }
    }
  }

  function renderLimitBar(label, used, max) {
    if (max < 0) {
      return '<div class="panel-limit-bar"><div class="panel-limit-bar__head"><span>' + escapeHtml(label) + '</span><span>Nielimitowane</span></div></div>';
    }
    var pct = Math.min(100, Math.round((used / max) * 100));
    return (
      '<div class="panel-limit-bar"><div class="panel-limit-bar__head"><span>' +
      escapeHtml(label) +
      "</span><span>" +
      used +
      " / " +
      max +
      '</span></div><div class="panel-limit-bar__track"><span style="width:' +
      pct +
      '%"></span></div></div>'
    );
  }

  function renderOrders() {
    var project = getActiveProject();
    var empty = $("[data-orders-empty]");
    var layout = $("[data-orders-layout]");
    var list = $("[data-orders-list]");
    if (!empty || !layout || !list) return;

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;
    var nameEl = $("[data-orders-project-name]");
    if (nameEl) nameEl.textContent = project.name;

    var orders = (project.orders || []).slice();
    if (ordersFilter !== "all") {
      orders = orders.filter(function (o) {
        return o.status === ordersFilter;
      });
    }

    if (!orders.length) {
      list.innerHTML =
        '<div class="panel-modal__empty"><strong>Brak zamówień</strong>Dodaj produkty i kliknij „Symuluj zamówienie”, aby wygenerować demo.</div>';
      return;
    }

    list.innerHTML =
      '<div class="panel-orders-table__head" aria-hidden="true"><span>Nr</span><span>Klient</span><span>Status</span><span>Kwota</span><span></span></div>' +
      orders
        .map(function (o) {
          var statusLabel = { new: "Nowe", processing: "W realizacji", done: "Zrealizowane" }[o.status] || o.status;
          var variantSummary = formatOrderVariantSummary(o);
          return (
            '<article class="panel-order-row panel-order-row--' +
            escapeHtml(o.status) +
            '" data-view-order="' +
            escapeHtml(o.id) +
            '" role="button" tabindex="0">' +
            "<span class=\"panel-order-row__num\">" +
            escapeHtml(o.number) +
            "</span>" +
            "<span><strong>" +
            escapeHtml(o.customer) +
            "</strong><small>" +
            escapeHtml(o.email || "") +
            (o.paymentMethod ? " · " + escapeHtml(o.paymentMethod) : "") +
            (o.shippingMethod ? " · " + escapeHtml(o.shippingMethod) : "") +
            (variantSummary ? '<br><em class="panel-order-row__variant">' + escapeHtml(variantSummary) + "</em>" : "") +
            "</small></span>" +
            '<span class="panel-order-row__status">' +
            escapeHtml(statusLabel) +
            "</span>" +
            "<span class=\"panel-order-row__total\">" +
            escapeHtml(formatPrice(o.total)) +
            "</span>" +
            '<span class="panel-order-row__actions">' +
            (o.status === "new"
              ? '<button type="button" class="panel-project-card__btn" data-order-status="' +
                escapeHtml(o.id) +
                ':processing">Realizuj</button>'
              : o.status === "processing"
                ? '<button type="button" class="panel-project-card__btn" data-order-status="' +
                  escapeHtml(o.id) +
                  ':done">Zakończ</button>'
                : '<span class="panel-order-row__done"><i class="fas fa-check"></i></span>') +
            "</span></article>"
          );
        })
        .join("");
  }

  function generateDemoOrder() {
    var project = getActiveProject();
    if (!project) return;
    var activeProducts = (project.products || []).filter(function (p) {
      return p.status === "active";
    });
    if (!activeProducts.length) {
      showToast("Dodaj co najmniej jeden aktywny produkt.");
      switchView("products");
      return;
    }
    var product = activeProducts[Math.floor(Math.random() * activeProducts.length)];
    var variantSelections = {};
    var variantLabel = "";
    if (product.variants && product.variants.length) {
      product.variants.forEach(function (v) {
        if (v.options && v.options.length) {
          var pick = v.options[Math.floor(Math.random() * v.options.length)];
          variantSelections[v.name] = pick;
        }
      });
      variantLabel = Object.keys(variantSelections)
        .map(function (k) {
          return k + ": " + variantSelections[k];
        })
        .join(" · ");
    }
    var checkout = project.checkout || getDefaultCheckout();
    var paymentId = checkout.payments.primary || (checkout.payments.enabled || [])[0] || "transfer";
    var enabledShipping = (checkout.shipping.methods || []).filter(function (m) {
      return m.enabled;
    });
    var ship = enabledShipping.length ? enabledShipping[Math.floor(Math.random() * enabledShipping.length)] : null;
    var shippingCost = ship ? ship.price : 0;
    var names = ["Anna Kowalska", "Jan Nowak", "Maria Wiśniewska", "Piotr Zieliński", "Klaudia Lewandowska"];
    var customer = names[Math.floor(Math.random() * names.length)];
    var orders = (project.orders || []).slice();
    var num = 1000 + orders.length + 1;
    var newOrder = {
      id: uid("ord"),
      number: "#" + num,
      customer: customer,
      email: customer.toLowerCase().replace(" ", ".") + "@email.pl",
      total: product.price + shippingCost,
      status: "new",
      itemCount: 1,
      productName: product.name,
      variantLabel: variantLabel,
      items: [
        {
          productId: product.id,
          name: product.name,
          qty: 1,
          price: product.price,
          variantLabel: variantLabel,
          variantSelections: variantSelections
        }
      ],
      paymentMethod: getPaymentProviderLabel(paymentId),
      shippingMethod: ship ? ship.label : "—",
      shippingCost: shippingCost,
      createdAt: Date.now()
    };
    orders.unshift(newOrder);
    var customers = upsertCustomerFromOrder(project, newOrder);
    var products = (project.products || []).slice();
    var pIdx = products.findIndex(function (p) {
      return p.id === product.id;
    });
    if (pIdx !== -1 && typeof products[pIdx].stock === "number") {
      products[pIdx] = Object.assign({}, products[pIdx], { stock: Math.max(0, products[pIdx].stock - 1) });
    }
    updateProject(project.id, { orders: orders, customers: customers, products: products });
    pushActivity(project.id, "Nowe zamówienie " + "#" + num);
    var sf = storefrontApi();
    if (sf && sf.pushStoreNotification) {
      sf.pushStoreNotification({
        projectId: project.id,
        type: "order",
        title: "Nowe zamówienie " + "#" + num,
        message: customer + " · " + formatPrice(newOrder.total) + " · " + product.name
      });
    } else {
      writeStoreNotifications(
        [
          {
            id: "evt_" + Date.now(),
            ts: Date.now(),
            read: false,
            projectId: project.id,
            type: "order",
            title: "Nowe zamówienie " + "#" + num,
            message: customer + " · " + formatPrice(newOrder.total) + " · " + product.name
          }
        ].concat(readStoreNotifications())
      );
    }
    renderOrders();
    refreshUI();
    showToast("Wygenerowano demo zamówienie " + "#" + num + ".");
  }

  function updateOrderStatus(orderId, status) {
    var project = getActiveProject();
    if (!project) return;
    var orders = (project.orders || []).map(function (o) {
      if (o.id === orderId) return Object.assign({}, o, { status: status });
      return o;
    });
    updateProject(project.id, { orders: orders });
    pushActivity(project.id, "Zmieniono status zamówienia");
    renderOrders();
    showToast("Status zamówienia zaktualizowany.");
  }

  function handleProjectsModalClick(event) {
    var target = event.target.closest("[data-create-blank]");
    if (target) {
      event.preventDefault();
      var p = createProject({ name: "Nowy sklep " + (getProjects().length || 1), source: "blank", thumb: "blank" });
      if (!p) return;
      pushActivity(p.id, "Utworzono pusty sklep");
      showToast("Utworzono „" + p.name + "”.");
      closeModal();
      switchView("editor");
      return;
    }
    target = event.target.closest("[data-duplicate-last]");
    if (target) {
      event.preventDefault();
      if (!canCreateProject()) {
        showToast(getLimitMessage("project"));
        return;
      }
      var last = getProjects()[0];
      if (!last) return;
      var copy = normalizeProject(
        Object.assign({}, last, {
          id: uid("proj"),
          name: last.name + " (kopia)",
          slug: slugify(last.name + "-kopia"),
          createdAt: Date.now(),
          status: "draft",
          products: (last.products || []).map(function (prod) {
            return Object.assign({}, prod, { id: uid("prod") });
          }),
          orders: [],
          activity: [{ text: "Duplikowano projekt", ts: Date.now() }]
        })
      );
      var list = getProjects();
      list.unshift(copy);
      saveProjects(list);
      setActiveProject(copy.id);
      renderAllPanels();
      showToast("Skopiowano projekt.");
      switchTab("mine");
      return;
    }
    target = event.target.closest("[data-soon-template]");
    if (target) {
      event.preventDefault();
      showTemplateSoonToast(target.getAttribute("data-soon-template"));
      return;
    }
    target = event.target.closest("[data-add-template]");
    if (target) {
      event.preventDefault();
      addTemplateToProjects(target.getAttribute("data-add-template"));
      return;
    }
    target = event.target.closest("[data-delete-project]");
    if (target) {
      event.preventDefault();
      requestDeleteProject(target.getAttribute("data-delete-project"));
      return;
    }
    target = event.target.closest("[data-select-project]");
    if (target) {
      event.preventDefault();
      selectProject(target.getAttribute("data-select-project"));
      return;
    }
    target = event.target.closest("[data-open-project]");
    if (target) {
      event.preventDefault();
      openProject(target.getAttribute("data-open-project"));
      return;
    }
    target = event.target.closest("[data-add-tech-faq]");
    if (target) {
      event.preventDefault();
      var faqProject = getActiveProject();
      if (!faqProject || !isTechProject(faqProject)) return;
      var faqs = (faqProject.techFaqs || []).slice();
      faqs.push({ q: "Nowe pytanie", a: "Odpowiedź dla klientów — edytuj tutaj." });
      updateProject(faqProject.id, { techFaqs: faqs });
      renderTechFaqsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-tech-faq]");
    if (target) {
      event.preventDefault();
      var faqProj = getActiveProject();
      if (!faqProj) return;
      var faqIdx = parseInt(target.getAttribute("data-remove-tech-faq"), 10);
      var nextFaqs = (faqProj.techFaqs || []).filter(function (_, i) {
        return i !== faqIdx;
      });
      updateProject(faqProj.id, { techFaqs: nextFaqs });
      renderTechFaqsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-add-tech-category]");
    if (target) {
      event.preventDefault();
      var catProject = getActiveProject();
      if (!catProject || !isTechProject(catProject)) return;
      var cats = (catProject.techCategories || []).slice();
      cats.push({
        id: uid("tcat"),
        label: "Nowa kategoria",
        desc: "Krótki opis segmentu",
        icon: "fa-microchip",
        productIds: []
      });
      updateProject(catProject.id, { techCategories: cats });
      renderTechCategoriesEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-tech-category]");
    if (target) {
      event.preventDefault();
      var catProj = getActiveProject();
      if (!catProj) return;
      var catId = target.getAttribute("data-remove-tech-category");
      var nextCats = (catProj.techCategories || []).filter(function (c) {
        return c.id !== catId;
      });
      updateProject(catProj.id, { techCategories: nextCats });
      renderTechCategoriesEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-add-ent-brand]");
    if (target) {
      event.preventDefault();
      var entBrandProject = getActiveProject();
      if (!entBrandProject || !isEnterpriseProject(entBrandProject)) return;
      var eBrands = (entBrandProject.enterpriseBrands || []).slice();
      eBrands.push({
        id: uid("ebrand"),
        name: "Nowa marka",
        tagline: "Krótki opis linii produktowej",
        category: "Kategoria",
        image: "",
        productCount: "0"
      });
      updateProject(entBrandProject.id, { enterpriseBrands: eBrands });
      renderEnterpriseBrandsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-ent-brand]");
    if (target) {
      event.preventDefault();
      var entBrandProj = getActiveProject();
      if (!entBrandProj) return;
      var removeBrandId = target.getAttribute("data-remove-ent-brand");
      updateProject(entBrandProj.id, {
        enterpriseBrands: (entBrandProj.enterpriseBrands || []).filter(function (b) {
          return b.id !== removeBrandId;
        })
      });
      renderEnterpriseBrandsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-add-ent-solution]");
    if (target) {
      event.preventDefault();
      var entSolProject = getActiveProject();
      if (!entSolProject || !isEnterpriseProject(entSolProject)) return;
      var eSols = (entSolProject.enterpriseSolutions || []).slice();
      eSols.push({ id: uid("esol"), title: "Nowy moduł", desc: "Opis funkcji B2B", icon: "fa-layer-group" });
      updateProject(entSolProject.id, { enterpriseSolutions: eSols });
      renderEnterpriseSolutionsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-ent-solution]");
    if (target) {
      event.preventDefault();
      var entSolProj = getActiveProject();
      if (!entSolProj) return;
      var removeSolId = target.getAttribute("data-remove-ent-solution");
      updateProject(entSolProj.id, {
        enterpriseSolutions: (entSolProj.enterpriseSolutions || []).filter(function (s) {
          return s.id !== removeSolId;
        })
      });
      renderEnterpriseSolutionsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-add-ent-segment]");
    if (target) {
      event.preventDefault();
      var entSegProject = getActiveProject();
      if (!entSegProject || !isEnterpriseProject(entSegProject)) return;
      var eSegs = (entSegProject.enterpriseSegments || []).slice();
      eSegs.push({ id: uid("eseg"), title: "Nowy segment", subtitle: "Opis grupy klientów", icon: "fa-building" });
      updateProject(entSegProject.id, { enterpriseSegments: eSegs });
      renderEnterpriseSegmentsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-ent-segment]");
    if (target) {
      event.preventDefault();
      var entSegProj = getActiveProject();
      if (!entSegProj) return;
      var removeSegId = target.getAttribute("data-remove-ent-segment");
      updateProject(entSegProj.id, {
        enterpriseSegments: (entSegProj.enterpriseSegments || []).filter(function (s) {
          return s.id !== removeSegId;
        })
      });
      renderEnterpriseSegmentsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-add-ent-case]");
    if (target) {
      event.preventDefault();
      var entCaseProject = getActiveProject();
      if (!entCaseProject || !isEnterpriseProject(entCaseProject)) return;
      var eCases = (entCaseProject.enterpriseCaseStudies || []).slice();
      eCases.push({
        id: uid("ecase"),
        brand: "Klient",
        title: "Nowy case study",
        metric: "+20%",
        metricLabel: "wzrost sprzedaży",
        quote: "Cytat klienta — edytuj tutaj.",
        image: ""
      });
      updateProject(entCaseProject.id, { enterpriseCaseStudies: eCases });
      renderEnterpriseCasesEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-ent-case]");
    if (target) {
      event.preventDefault();
      var entCaseProj = getActiveProject();
      if (!entCaseProj) return;
      var removeCaseId = target.getAttribute("data-remove-ent-case");
      updateProject(entCaseProj.id, {
        enterpriseCaseStudies: (entCaseProj.enterpriseCaseStudies || []).filter(function (c) {
          return c.id !== removeCaseId;
        })
      });
      renderEnterpriseCasesEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-add-ent-faq]");
    if (target) {
      event.preventDefault();
      var entFaqProject = getActiveProject();
      if (!entFaqProject || !isEnterpriseProject(entFaqProject)) return;
      var eFaqs = (entFaqProject.enterpriseFaqs || []).slice();
      eFaqs.push({ q: "Nowe pytanie B2B", a: "Odpowiedź dla partnerów." });
      updateProject(entFaqProject.id, { enterpriseFaqs: eFaqs });
      renderEnterpriseFaqsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
    target = event.target.closest("[data-remove-ent-faq]");
    if (target) {
      event.preventDefault();
      var entFaqProj = getActiveProject();
      if (!entFaqProj) return;
      var removeFaqIdx = parseInt(target.getAttribute("data-remove-ent-faq"), 10);
      updateProject(entFaqProj.id, {
        enterpriseFaqs: (entFaqProj.enterpriseFaqs || []).filter(function (_, i) {
          return i !== removeFaqIdx;
        })
      });
      renderEnterpriseFaqsEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }
  }

  function handleScrollPreview() {
    var sf = storefrontApi();
    if (sf && !sf.isDesktopViewport()) {
      openFullPreview();
      return;
    }
    switchView("dashboard");
    window.setTimeout(function () {
      var anchor = $("[data-preview-anchor]");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  function syncMobilePanelMenuNav() {
    var source = $(".panel-sidebar nav");
    var target = $("[data-panel-mobile-menu-nav]");
    if (!source || !target) return;
    target.innerHTML = source.innerHTML;
  }

  function isMobilePanelViewport() {
    var sf = storefrontApi();
    if (sf && sf.isDesktopViewport) return !sf.isDesktopViewport();
    return window.matchMedia("(max-width: 1120px)").matches;
  }

  function openMobilePanelMenu() {
    if (!isMobilePanelViewport()) return;
    var menu = $("[data-panel-mobile-menu]");
    var toggle = $("[data-panel-mobile-menu-toggle]");
    if (!menu) return;
    syncMobilePanelMenuNav();
    menu.hidden = false;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("panel-page--mobile-menu-open");
  }

  function closeMobilePanelMenu() {
    var menu = $("[data-panel-mobile-menu]");
    var toggle = $("[data-panel-mobile-menu-toggle]");
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("panel-page--mobile-menu-open");
    window.setTimeout(function () {
      if (menu && !menu.classList.contains("is-open")) menu.hidden = true;
    }, 280);
  }

  function handleEditorFieldInput(event) {
    var project = getActiveProject();
    if (!project) return;
    var patch = {};
    if (event.target.matches("[data-editor-hero-title]")) patch.heroTitle = event.target.value;
    if (event.target.matches("[data-editor-hero-subtitle]")) patch.heroSubtitle = event.target.value;
    if (event.target.matches("[data-editor-hero-cta]")) patch.heroCta = event.target.value;
    if (event.target.matches("[data-editor-hero-badge]")) patch.heroBadge = event.target.value.trim() || null;
    if (event.target.matches("[data-editor-store-name]")) patch.storeName = event.target.value;
    if (event.target.matches("[data-editor-section-title]")) patch.sectionTitle = event.target.value;
    if (event.target.matches("[data-editor-section-subtitle]")) patch.sectionSubtitle = event.target.value;
    if (event.target.matches("[data-editor-about-title]")) patch.aboutTitle = event.target.value;
    if (event.target.matches("[data-editor-about-text]")) patch.aboutText = event.target.value;
    if (event.target.matches("[data-editor-announcement]")) patch.announcement = event.target.value.trim() || null;
    if (event.target.matches("[data-editor-lookbook-title]")) patch.lookbookTitle = event.target.value;
    if (event.target.matches("[data-editor-lookbook-subtitle]")) patch.lookbookSubtitle = event.target.value;
    if (event.target.matches("[data-editor-tech-compare-title]")) patch.techCompareTitle = event.target.value;
    if (event.target.matches("[data-editor-tech-compare-subtitle]")) patch.techCompareSubtitle = event.target.value;
    if (event.target.matches("[data-editor-tech-faq-title]")) patch.techFaqTitle = event.target.value;
    if (event.target.matches("[data-editor-tech-faq-subtitle]")) patch.techFaqSubtitle = event.target.value;
    if (event.target.matches("[data-editor-tech-categories-title]")) patch.techCategoriesTitle = event.target.value;
    if (event.target.matches("[data-editor-tech-categories-subtitle]")) patch.techCategoriesSubtitle = event.target.value;
    if (event.target.matches("[data-editor-tech-brands-label]")) patch.techBrandsLabel = event.target.value;
    if (event.target.matches("[data-editor-enterprise-brands-title]")) patch.enterpriseBrandsTitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-brands-subtitle]")) patch.enterpriseBrandsSubtitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-solutions-title]")) patch.enterpriseSolutionsTitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-solutions-subtitle]")) patch.enterpriseSolutionsSubtitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-segments-title]")) patch.enterpriseSegmentsTitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-segments-subtitle]")) patch.enterpriseSegmentsSubtitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-cases-title]")) patch.enterpriseCasesTitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-cases-subtitle]")) patch.enterpriseCasesSubtitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-partners-label]")) patch.enterprisePartnersLabel = event.target.value;
    if (event.target.matches("[data-editor-enterprise-faq-title]")) patch.enterpriseFaqTitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-faq-subtitle]")) patch.enterpriseFaqSubtitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-portal-title]")) patch.enterprisePortalTitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-portal-subtitle]")) patch.enterprisePortalSubtitle = event.target.value;
    if (event.target.matches("[data-editor-enterprise-portal-cta]")) patch.enterprisePortalCta = event.target.value;
    if (event.target.matches("[data-editor-newsletter-title]")) patch.newsletterTitle = event.target.value;
    if (event.target.matches("[data-editor-newsletter-subtitle]")) patch.newsletterSubtitle = event.target.value;

    if (event.target.matches("[data-section-toggle]")) {
      setProjectSectionVisibility(project, event.target.getAttribute("data-section-toggle"), event.target.checked);
      return;
    }

    if (event.target.closest("[data-section-quick-toggle]")) {
      var chip = event.target.closest("[data-section-quick-toggle]");
      var quickKey = chip.getAttribute("data-section-quick-toggle");
      var visNow = project.sectionVisibility || defaultSectionVisibilityForProject(project);
      setProjectSectionVisibility(project, quickKey, visNow[quickKey] === false);
      return;
    }

    if (
      event.target.matches("[data-tech-stat-value]") ||
      event.target.matches("[data-tech-stat-label]") ||
      event.target.matches("[data-tech-cat-label]") ||
      event.target.matches("[data-tech-cat-desc]") ||
      event.target.matches("[data-tech-cat-icon]") ||
      event.target.matches("[data-tech-faq-q]") ||
      event.target.matches("[data-tech-faq-a]") ||
      event.target.matches("[data-editor-tech-brands]") ||
      event.target.matches("[data-editor-tech-compare-specs]")
    ) {
      persistTechEditorFromDom(project);
      renderPreviewTargets();
      return;
    }

    if (
      event.target.matches("[data-ent-stat-value]") ||
      event.target.matches("[data-ent-stat-label]") ||
      event.target.matches("[data-ent-brand-name]") ||
      event.target.matches("[data-ent-brand-tagline]") ||
      event.target.matches("[data-ent-brand-category]") ||
      event.target.matches("[data-ent-brand-count]") ||
      event.target.matches("[data-ent-brand-image]") ||
      event.target.matches("[data-ent-solution-title]") ||
      event.target.matches("[data-ent-solution-desc]") ||
      event.target.matches("[data-ent-solution-icon]") ||
      event.target.matches("[data-ent-segment-title]") ||
      event.target.matches("[data-ent-segment-subtitle]") ||
      event.target.matches("[data-ent-segment-icon]") ||
      event.target.matches("[data-ent-case-brand]") ||
      event.target.matches("[data-ent-case-title]") ||
      event.target.matches("[data-ent-case-metric]") ||
      event.target.matches("[data-ent-case-metric-label]") ||
      event.target.matches("[data-ent-case-quote]") ||
      event.target.matches("[data-ent-case-image]") ||
      event.target.matches("[data-ent-faq-q]") ||
      event.target.matches("[data-ent-faq-a]") ||
      event.target.matches("[data-editor-enterprise-partners]")
    ) {
      persistEnterpriseEditorFromDom(project);
      renderPreviewTargets();
      return;
    }

    if (event.target.matches("[data-tech-compare-product]")) {
      persistTechEditorFromDom(project);
      renderTechCompareEditor(getActiveProject());
      renderPreviewTargets();
      return;
    }

    if (Object.keys(patch).length) {
      updateProject(project.id, patch);
      renderPreviewTargets();
    }
  }

  function handleThemeFieldInput(event) {
    var project = getActiveProject();
    if (!project) return;
    var patch = {};
    if (event.target.matches("[data-theme-hero-image-url]")) {
      var fileInput = $("[data-theme-hero-file]");
      if (fileInput) fileInput.value = "";
      patch.heroImage = event.target.value.trim() || null;
      syncThemeHeroPreview(patch.heroImage || "");
    }
    if (event.target.matches("[data-theme-hero-overlay]")) {
      patch.heroOverlay = Number(event.target.value);
      var overlayLabel = $("[data-theme-overlay-label]");
      if (overlayLabel) overlayLabel.textContent = patch.heroOverlay + "% — balans zdjęcia i czytelności";
    }
    if (event.target.matches("[data-theme-card-radius]")) patch.cardRadius = event.target.value;
    if (event.target.matches("[data-theme-heading-style]")) patch.headingStyle = event.target.value;
    if (event.target.matches("[data-theme-logo-text]")) patch.logoText = event.target.value;
    if (event.target.matches("[data-theme-logo-image-url]")) {
      var logoFileInput = $("[data-theme-logo-file]");
      if (logoFileInput) logoFileInput.value = "";
      patch.logoImage = event.target.value.trim() || null;
      if (patch.logoImage && (project.logoMode || "text") !== "image") {
        patch.logoMode = "image";
      }
      syncThemeLogoPreview(patch.logoImage || "");
      if (patch.logoMode) syncLogoModeUI(Object.assign({}, project, patch));
    }
    if (event.target.matches("[data-theme-logo-font]")) patch.logoFont = event.target.value;
    if (Object.keys(patch).length) {
      updateProject(project.id, patch);
      if (patch.heroImage !== undefined) renderBannerPresets();
      renderPreviewTargets();
    }
  }

  function openTemplatePreview(templateId) {
    var template = AMIQ_TEMPLATES.find(function (t) {
      return t.id === templateId;
    });
    if (!template) return;
    if (isTemplateComingSoon(template)) {
      showTemplateSoonToast(templateId);
      return;
    }
    var sf = storefrontApi();
    if (!sf || !sf.buildTemplatePreviewFrame) {
      showToast("Podgląd szablonu chwilowo niedostępny.");
      return;
    }
    if (!templatePreviewModal) templatePreviewModal = document.getElementById("template-preview-modal");
    if (!templatePreviewModal) return;

    pendingPreviewTemplateId = templateId;
    var nameEl = $("[data-template-preview-name]");
    var descEl = $("[data-template-preview-desc]");
    var frame = $("[data-template-preview-frame]");
    var addBtn = $("[data-template-preview-add]");
    if (nameEl) nameEl.textContent = template.name;
    if (descEl) descEl.textContent = template.desc;
    if (frame) frame.innerHTML = sf.buildTemplatePreviewFrame(templateId);

    var unlocked = canAccessTemplate(template, getCurrentPlan());
    var added = getProjects().some(function (p) {
      return p.templateId === templateId;
    });
    if (addBtn) {
      addBtn.hidden = !unlocked || added;
      addBtn.disabled = !unlocked || added;
    }

    templatePreviewModal.hidden = false;
    templatePreviewModal.classList.add("is-open");
    templatePreviewModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
  }

  function closeTemplatePreview() {
    if (!templatePreviewModal || !templatePreviewModal.classList.contains("is-open")) return;
    templatePreviewModal.classList.remove("is-open");
    templatePreviewModal.setAttribute("aria-hidden", "true");
    pendingPreviewTemplateId = null;
    syncBodyModalLock();
    window.setTimeout(function () {
      if (templatePreviewModal && !templatePreviewModal.classList.contains("is-open")) templatePreviewModal.hidden = true;
    }, 280);
  }

  function initNavigation() {
    document.addEventListener("click", function (event) {
      var nav = event.target.closest("[data-panel-nav]");
      if (nav) {
        if (nav.hasAttribute("data-panel-soon")) {
          event.preventDefault();
          showToast("Ta sekcja będzie dostępna w kolejnej wersji panelu.");
          return;
        }
        if (nav.hasAttribute("data-scroll-preview")) {
          event.preventDefault();
          handleScrollPreview();
          return;
        }
        event.preventDefault();
        var view = nav.getAttribute("data-panel-nav");
        if (view === "editor" || view === "theme" || view === "products" || view === "orders" || view === "checkout" || view === "customers" || view === "analytics") {
          if (!getActiveProject()) {
            showToast("Najpierw stwórz lub wybierz projekt.");
            openModal(getProjects().length ? "mine" : "create");
            return;
          }
        }
        switchView(view);
        if (nav.closest("[data-panel-mobile-menu]")) closeMobilePanelMenu();
        return;
      }

      if (event.target.closest("[data-panel-mobile-menu-toggle]")) {
        event.preventDefault();
        var mobileMenu = $("[data-panel-mobile-menu]");
        if (mobileMenu && mobileMenu.classList.contains("is-open")) closeMobilePanelMenu();
        else openMobilePanelMenu();
        return;
      }

      if (event.target.closest("[data-close-mobile-menu]")) {
        event.preventDefault();
        closeMobilePanelMenu();
        return;
      }

      if (event.target.closest("[data-open-full-preview]")) {
        event.preventDefault();
        openFullPreview();
        closeMobilePanelMenu();
        return;
      }

      if (event.target.closest("[data-scroll-preview]")) {
        event.preventDefault();
        handleScrollPreview();
        return;
      }

      if (event.target.closest("[data-community-notify]")) {
        event.preventDefault();
        showToast("Zapisaliśmy zainteresowanie rynkiem — damy znać, gdy beta będzie gotowa.");
        return;
      }

      if (event.target.closest("[data-open-projects-modal]")) {
        event.preventDefault();
        closeMobilePanelMenu();
        lastFocus = document.activeElement;
        openModal(getProjects().length ? "mine" : "create");
      }

      var switchTabBtn = event.target.closest("[data-switch-projects-tab]");
      if (switchTabBtn) {
        event.preventDefault();
        if (!modal || modal.hidden) openModal("create");
        switchTab(switchTabBtn.getAttribute("data-switch-projects-tab"));
      }

      if (event.target.closest("[data-open-product-modal]")) {
        event.preventDefault();
        openProductModal(null);
      }

      if (event.target.closest("[data-edit-product]")) {
        event.preventDefault();
        openProductModal(event.target.closest("[data-edit-product]").getAttribute("data-edit-product"));
      }

      if (event.target.closest("[data-delete-product]")) {
        event.preventDefault();
        deleteProduct(event.target.closest("[data-delete-product]").getAttribute("data-delete-product"));
      }

      if (event.target.closest("[data-duplicate-product]")) {
        event.preventDefault();
        duplicateProduct(event.target.closest("[data-duplicate-product]").getAttribute("data-duplicate-product"));
        return;
      }

      if (event.target.closest("[data-product-variant-add]")) {
        event.preventDefault();
        syncProductVariantsFromDOM();
        productVariantsDraft.push({ id: uid("var"), name: "", options: [] });
        renderProductVariantsEditor();
        return;
      }

      if (event.target.closest("[data-product-spec-add]")) {
        event.preventDefault();
        syncProductSpecsFromDOM();
        productSpecsDraft.push({ label: "", value: "" });
        renderProductSpecsEditor();
        return;
      }

      var specRemove = event.target.closest("[data-spec-remove]");
      if (specRemove) {
        event.preventDefault();
        syncProductSpecsFromDOM();
        var specIdx = parseInt(specRemove.getAttribute("data-spec-remove"), 10);
        if (!isNaN(specIdx)) {
          productSpecsDraft.splice(specIdx, 1);
          renderProductSpecsEditor();
        }
        return;
      }

      if (event.target.matches("[data-product-specs-visible]")) {
        productSpecsVisibleDraft = event.target.checked;
        renderProductSpecsEditor();
        return;
      }

      if (
        event.target.matches("[data-spec-label]") ||
        event.target.matches("[data-spec-value]")
      ) {
        syncProductSpecsFromDOM();
        return;
      }

      var variantRemove = event.target.closest("[data-variant-remove]");
      if (variantRemove) {
        event.preventDefault();
        syncProductVariantsFromDOM();
        var vIdx = parseInt(variantRemove.getAttribute("data-variant-remove"), 10);
        if (!isNaN(vIdx)) {
          productVariantsDraft.splice(vIdx, 1);
          renderProductVariantsEditor();
        }
        return;
      }

      var viewOrderRow = event.target.closest("[data-view-order]");
      if (viewOrderRow && !event.target.closest("[data-order-status]") && !event.target.closest(".panel-order-row__actions")) {
        event.preventDefault();
        openOrderModal(viewOrderRow.getAttribute("data-view-order"));
        return;
      }

      if (event.target.closest("[data-export-orders-csv]")) {
        event.preventDefault();
        exportOrdersCsv();
        return;
      }

      if (event.target.closest("[data-wallet-connect-stripe]")) {
        event.preventDefault();
        connectStripeWallet();
        return;
      }

      if (event.target.closest("[data-wallet-simulate-stripe]")) {
        event.preventDefault();
        simulateStripeActivation();
        return;
      }

      if (event.target.closest("[data-wallet-manage-stripe]")) {
        event.preventDefault();
        showToast("Docelowo: przekierowanie do Stripe Express Dashboard (Connected Account).");
        return;
      }

      if (event.target.closest("[data-wallet-request-payout]")) {
        event.preventDefault();
        requestWalletPayout();
        return;
      }

      if (event.target.closest("[data-wallet-save-settings]")) {
        event.preventDefault();
        if (saveWalletSettingsFromDOM()) {
          pushActivity(getActiveProjectId(), "Zaktualizowano ustawienia portfela");
          showToast("Zapisano ustawienia wypłat.");
          renderWallet();
        }
        return;
      }

      if (event.target.closest("[data-wallet-export-ledger]")) {
        event.preventDefault();
        exportWalletLedgerCsv();
        return;
      }

      var walletFilterBtn = event.target.closest("[data-wallet-ledger-filter]");
      if (walletFilterBtn) {
        event.preventDefault();
        walletLedgerFilter = walletFilterBtn.getAttribute("data-wallet-ledger-filter") || "all";
        renderWallet();
        return;
      }

      if (event.target.closest("[data-close-order-modal]")) {
        event.preventDefault();
        closeOrderModal();
        return;
      }

      if (event.target.closest("[data-close-projects-modal]")) {
        event.preventDefault();
        closeModal();
      }

      if (event.target.closest("[data-close-product-modal]")) {
        event.preventDefault();
        closeProductModal();
      }

      if (event.target.closest("[data-add-collection]")) {
        event.preventDefault();
        addCollection();
        return;
      }

      if (event.target.closest("[data-edit-collection]")) {
        event.preventDefault();
        openCollectionModal(event.target.closest("[data-edit-collection]").getAttribute("data-edit-collection"));
        return;
      }

      if (event.target.closest("[data-delete-collection]")) {
        event.preventDefault();
        deleteCollection(event.target.closest("[data-delete-collection]").getAttribute("data-delete-collection"));
        return;
      }

      if (event.target.closest("[data-close-collection-modal]")) {
        event.preventDefault();
        closeCollectionModal();
        return;
      }

      var checkoutOpen = event.target.closest("[data-open-checkout]");
      if (checkoutOpen) {
        event.preventDefault();
        if (publishModal && publishModal.classList.contains("is-open")) closePublishModal();
        openCheckout(checkoutOpen.getAttribute("data-open-checkout"));
        return;
      }

      var checklistGo = event.target.closest("[data-checklist-go]");
      if (checklistGo) {
        event.preventDefault();
        if (publishModal && publishModal.classList.contains("is-open")) closePublishModal();
        switchView(checklistGo.getAttribute("data-checklist-go"));
        return;
      }

      if (event.target.closest("[data-open-publish-modal]")) {
        event.preventDefault();
        openPublishModal();
        return;
      }

      if (event.target.closest("[data-close-publish-modal]")) {
        event.preventDefault();
        closePublishModal();
        return;
      }

      if (event.target.closest("[data-confirm-publish]")) {
        event.preventDefault();
        publishStore();
        return;
      }

      if (event.target.closest("[data-unpublish-store]")) {
        event.preventDefault();
        unpublishStore();
        return;
      }

      if (event.target.closest("[data-copy-store-link]")) {
        event.preventDefault();
        copyStoreShareLink(getActiveProject());
        return;
      }

      if (event.target.closest("[data-open-published-preview]")) {
        event.preventDefault();
        openPublishedPreview(getActiveProject());
        return;
      }

      var selectCategory = event.target.closest("[data-select-store-category]");
      if (selectCategory) {
        event.preventDefault();
        selectStoreCategory(selectCategory.getAttribute("data-select-store-category"));
        return;
      }

      if (event.target.closest("[data-edit-category-profile]")) {
        event.preventDefault();
        var p = getActiveProject();
        if (p && p.storeCategory) openCategoryOnboarding(p.storeCategory);
        return;
      }

      if (event.target.closest("[data-settings-open-checkout]")) {
        event.preventDefault();
        initCheckoutDraft(getActiveProject());
        openCheckout("payments");
        return;
      }

      if (event.target.closest("[data-settings-save-profile]")) {
        event.preventDefault();
        saveSettingsProfile();
        return;
      }
      if (event.target.closest("[data-settings-save-prefs]")) {
        event.preventDefault();
        saveSettingsPrefs();
        return;
      }
      if (event.target.closest("[data-settings-save-store]")) {
        event.preventDefault();
        saveSettingsStore();
        return;
      }
      if (event.target.closest("[data-settings-save-notifications]")) {
        event.preventDefault();
        saveSettingsNotifications();
        return;
      }
      if (event.target.closest("[data-settings-change-password]")) {
        event.preventDefault();
        changeSettingsPassword();
        return;
      }
      if (event.target.closest("[data-settings-export-data]")) {
        event.preventDefault();
        exportSettingsData();
        return;
      }
      if (event.target.closest("[data-settings-reset-demo]")) {
        event.preventDefault();
        resetDemoPanelData();
        return;
      }

      if (event.target.closest("[data-open-domain-settings]")) {
        event.preventDefault();
        openDomainSettings();
        return;
      }
      if (event.target.closest("[data-domain-request]")) {
        event.preventDefault();
        requestCustomDomain();
        return;
      }
      if (event.target.closest("[data-domain-check-dns]")) {
        event.preventDefault();
        checkCustomDomainDns();
        return;
      }
      if (event.target.closest("[data-domain-activate-ssl]")) {
        event.preventDefault();
        activateCustomDomainSsl();
        return;
      }
      if (event.target.closest("[data-domain-recheck]")) {
        event.preventDefault();
        showToast("DNS i SSL aktywne (demo) — w produkcji sprawdzimy rekordy automatycznie.");
        return;
      }
      if (event.target.closest("[data-domain-remove]")) {
        event.preventDefault();
        removeCustomDomain();
        return;
      }
      if (event.target.closest("[data-domain-save-options]")) {
        event.preventDefault();
        saveCustomDomainOptions();
        return;
      }

      var copyDnsBtn = event.target.closest("[data-copy-dns-value]");
      if (copyDnsBtn) {
        event.preventDefault();
        copyTextToClipboard(copyDnsBtn.getAttribute("data-copy-dns-value"), "Skopiowano wartość rekordu DNS.");
        return;
      }

      var settingsJump = event.target.closest("[data-settings-tab-jump]");
      if (settingsJump) {
        event.preventDefault();
        switchSettingsTab(settingsJump.getAttribute("data-settings-tab-jump"));
        return;
      }

      var settingsTab = event.target.closest("[data-settings-tab]");
      if (settingsTab) {
        event.preventDefault();
        switchSettingsTab(settingsTab.getAttribute("data-settings-tab"));
        return;
      }

      var checkoutCard = event.target.closest(".panel-checkout-card:not(.is-locked)");
      if (checkoutCard && currentView === "checkout") {
        var providerCb = checkoutCard.querySelector("[data-checkout-provider]");
        if (providerCb && !providerCb.disabled && event.target !== providerCb) {
          providerCb.checked = !providerCb.checked;
          providerCb.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
      }

      var shippingRow = event.target.closest(".panel-checkout-shipping-row");
      if (shippingRow && currentView === "checkout" && !event.target.closest("[data-checkout-shipping-price]")) {
        var shipCb = shippingRow.querySelector("[data-checkout-shipping-id]");
        if (shipCb && event.target !== shipCb) {
          shipCb.checked = !shipCb.checked;
          shipCb.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
      }

      var checkoutStepNav = event.target.closest("[data-checkout-step-nav]");
      if (checkoutStepNav) {
        event.preventDefault();
        var targetStep = checkoutStepNav.getAttribute("data-checkout-step-nav");
        if (checkoutWizardStep === "payments" && targetStep !== "payments") {
          if (!validateCheckoutStep("payments")) return;
          saveCheckoutDraftToProject(true, false);
        }
        if (checkoutWizardStep === "shipping" && targetStep === "summary") {
          if (!validateCheckoutStep("shipping")) return;
          saveCheckoutDraftToProject(false, true);
        }
        checkoutWizardStep = targetStep;
        renderCheckout();
        return;
      }

      var checkoutNext = event.target.closest("[data-checkout-next]");
      if (checkoutNext) {
        event.preventDefault();
        var nextStep = checkoutNext.getAttribute("data-checkout-next");
        if (checkoutWizardStep === "payments") {
          if (!validateCheckoutStep("payments")) return;
          saveCheckoutDraftToProject(true, false);
        } else if (checkoutWizardStep === "shipping") {
          if (!validateCheckoutStep("shipping")) return;
          saveCheckoutDraftToProject(false, true);
        }
        checkoutWizardStep = nextStep;
        renderCheckout();
        return;
      }

      if (event.target.closest("[data-checkout-finish]")) {
        event.preventDefault();
        finishCheckoutWizard();
        return;
      }

      var restoreBtn = event.target.closest("[data-restore-project]");
      if (restoreBtn) {
        event.preventDefault();
        restoreDeletedProject(restoreBtn.getAttribute("data-restore-project"));
        return;
      }

      var purgeBtn = event.target.closest("[data-purge-deleted]");
      if (purgeBtn) {
        event.preventDefault();
        purgeDeletedEntry(purgeBtn.getAttribute("data-purge-deleted"));
        return;
      }

      var orderFilterBtn = event.target.closest("[data-orders-filter]");
      if (orderFilterBtn) {
        event.preventDefault();
        ordersFilter = orderFilterBtn.getAttribute("data-orders-filter");
        $all("[data-orders-filter]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn.getAttribute("data-orders-filter") === ordersFilter);
        });
        renderOrders();
        return;
      }

      var analyticsRangeBtn = event.target.closest("[data-analytics-range]");
      if (analyticsRangeBtn) {
        event.preventDefault();
        analyticsRange = analyticsRangeBtn.getAttribute("data-analytics-range");
        $all("[data-analytics-range]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn.getAttribute("data-analytics-range") === analyticsRange);
        });
        renderAnalytics();
        return;
      }

      var analyticsMetricBtn = event.target.closest("[data-analytics-metric]");
      if (analyticsMetricBtn) {
        event.preventDefault();
        analyticsMetric = analyticsMetricBtn.getAttribute("data-analytics-metric");
        $all("[data-analytics-metric]").forEach(function (btn) {
          btn.classList.toggle("is-active", btn.getAttribute("data-analytics-metric") === analyticsMetric);
        });
        renderAnalytics();
        return;
      }

      if (event.target.closest("[data-generate-demo-order]")) {
        event.preventDefault();
        generateDemoOrder();
        return;
      }

      var pluginOpenBtn = event.target.closest("[data-plugin-open]");
      if (pluginOpenBtn) {
        event.preventDefault();
        openPluginApp(pluginOpenBtn.getAttribute("data-plugin-open"));
        return;
      }

      var pluginInstallBtn = event.target.closest("[data-plugin-install]");
      if (pluginInstallBtn) {
        event.preventDefault();
        togglePluginInstall(pluginInstallBtn.getAttribute("data-plugin-install"));
        return;
      }

      var pluginSourceBtn = event.target.closest("[data-plugins-source]");
      if (pluginSourceBtn) {
        event.preventDefault();
        pluginsSourceFilter = pluginSourceBtn.getAttribute("data-plugins-source") || "all";
        renderPlugins();
        return;
      }

      var pluginCategoryBtn = event.target.closest("[data-plugins-category]");
      if (pluginCategoryBtn) {
        event.preventDefault();
        pluginsCategoryFilter = pluginCategoryBtn.getAttribute("data-plugins-category") || "all";
        renderPlugins();
        return;
      }

      var previewTemplateBtn = event.target.closest("[data-preview-template]");
      if (previewTemplateBtn) {
        event.preventDefault();
        var previewId = previewTemplateBtn.getAttribute("data-preview-template");
        var previewTpl = AMIQ_TEMPLATES.find(function (t) {
          return t.id === previewId;
        });
        if (previewTpl && isTemplateComingSoon(previewTpl)) {
          showTemplateSoonToast(previewId);
          return;
        }
        openTemplatePreview(previewId);
        return;
      }

      var soonTemplateBtn = event.target.closest("[data-soon-template]");
      if (soonTemplateBtn) {
        event.preventDefault();
        showTemplateSoonToast(soonTemplateBtn.getAttribute("data-soon-template"));
        return;
      }

      if (event.target.closest("[data-close-template-preview]")) {
        event.preventDefault();
        closeTemplatePreview();
        return;
      }

      if (event.target.closest("[data-template-preview-add]")) {
        event.preventDefault();
        if (pendingPreviewTemplateId) {
          closeTemplatePreview();
          addTemplateToProjects(pendingPreviewTemplateId);
        }
        return;
      }

      var orderStatusBtn = event.target.closest("[data-order-status]");
      if (orderStatusBtn) {
        event.preventDefault();
        var parts = orderStatusBtn.getAttribute("data-order-status").split(":");
        updateOrderStatus(parts[0], parts[1]);
        return;
      }

      if (event.target.closest("[data-close-delete-modal]")) {
        event.preventDefault();
        closeDeleteModal();
      }

      if (event.target.closest("[data-confirm-delete-project]")) {
        event.preventDefault();
        confirmDeleteProject();
      }

      if (event.target.closest("[data-open-customer-modal]")) {
        event.preventDefault();
        openCustomerModal();
        return;
      }

      if (event.target.closest("[data-delete-customer]")) {
        event.preventDefault();
        deleteCustomer(event.target.closest("[data-delete-customer]").getAttribute("data-delete-customer"));
        return;
      }

      if (event.target.closest("[data-close-customer-modal]")) {
        event.preventDefault();
        closeCustomerModal();
      }
    }, true);

    var customersFilter = $("[data-customers-filter]");
    if (customersFilter) {
      customersFilter.addEventListener("input", function () {
        renderCustomers(customersFilter.value);
      });
    }

    var customerForm = $("[data-customer-form]");
    if (customerForm) customerForm.addEventListener("submit", saveCustomerFromForm);

    var editorRoot = $("[data-editor-root]");
    if (editorRoot) {
      editorRoot.addEventListener("input", function (event) {
        handleEditorFieldInput(event);
      });
    }

    var themeRoot = $("[data-theme-root]");
    if (themeRoot) {
      themeRoot.addEventListener("click", function (event) {
        var project = getActiveProject();
        if (!project) return;

        var themeBtn = event.target.closest("[data-theme-select]");
        if (themeBtn) {
          var theme = themeBtn.getAttribute("data-theme-select");
          var lockedTheme = getLockedThemeForTemplate(project.templateId);
          if (lockedTheme && theme !== lockedTheme) {
            showToast("Ten projekt ma przypisany szablon — układu nie można zmienić, tylko kolory i baner.");
            return;
          }
          updateProject(project.id, { theme: theme, thumb: theme, checklist: Object.assign({}, project.checklist, { theme: true }) });
          syncChecklistAuto(getProjectById(project.id));
          pushActivity(project.id, "Zmieniono motyw sklepu");
          renderTheme();
          refreshUI();
          showToast("Motyw zaktualizowany.");
          return;
        }

        var accentBtn = event.target.closest("[data-theme-accent]");
        if (accentBtn) {
          updateProject(project.id, { accentColor: accentBtn.getAttribute("data-theme-accent") });
          renderTheme();
          renderPreviewTargets();
          showToast("Kolor akcentu zaktualizowany.");
          return;
        }

        var modeBtn = event.target.closest("[data-theme-color-mode]");
        if (modeBtn) {
          updateProject(project.id, { colorMode: modeBtn.getAttribute("data-theme-color-mode") });
          renderTheme();
          renderPreviewTargets();
          showToast("Tryb kolorystyczny zmieniony.");
          return;
        }

        var logoModeBtn = event.target.closest("[data-theme-logo-mode]");
        if (logoModeBtn) {
          var logoMode = logoModeBtn.getAttribute("data-theme-logo-mode");
          updateProject(project.id, { logoMode: logoMode });
          var updated = getProjectById(project.id);
          syncLogoModeUI(updated);
          if (logoMode === "image") syncThemeLogoPreview(updated.logoImage || "");
          renderPreviewTargets();
          showToast(logoMode === "image" ? "Logo jako obrazek." : "Logo jako tekst.");
          return;
        }

        var layoutBtn = event.target.closest("[data-theme-hero-layout]");
        if (layoutBtn) {
          var layout = layoutBtn.getAttribute("data-theme-hero-layout");
          if (layout === "full" || layout === "split-wide" || layout === "split") {
            updateProject(project.id, { heroLayout: layout });
            renderTechHeroLayoutPicker(getProjectById(project.id));
            renderPreviewTargets();
            showToast("Zmieniono układ banera.");
          }
          return;
        }

        var bannerBtn = event.target.closest("[data-theme-banner-preset]");
        if (bannerBtn) {
          var url = bannerBtn.getAttribute("data-theme-banner-preset");
          var fileInput = $("[data-theme-hero-file]");
          if (fileInput) fileInput.value = "";
          setThemeHeroImage(url);
          return;
        }

        if (event.target.closest("[data-open-banner-library]")) {
          openBannerLibraryModal();
          return;
        }

        if (event.target.closest("[data-theme-hero-clear]")) {
          event.preventDefault();
          clearThemeHeroImage();
          return;
        }

        if (event.target.closest("[data-theme-logo-clear]")) {
          event.preventDefault();
          clearThemeLogoImage();
          return;
        }
      });

      themeRoot.addEventListener("change", function (event) {
        if (event.target.matches("[data-theme-hero-file]")) {
          handleThemeHeroFile(event.target.files && event.target.files[0]);
        }
        if (event.target.matches("[data-theme-logo-file]")) {
          handleThemeLogoFile(event.target.files && event.target.files[0]);
        }
      });

      var heroUploadZone = $("[data-theme-hero-upload-zone]");
      if (heroUploadZone) {
        heroUploadZone.addEventListener("dragover", function (event) {
          event.preventDefault();
          heroUploadZone.classList.add("is-dragover");
        });
        heroUploadZone.addEventListener("dragleave", function () {
          heroUploadZone.classList.remove("is-dragover");
        });
        heroUploadZone.addEventListener("drop", function (event) {
          event.preventDefault();
          heroUploadZone.classList.remove("is-dragover");
          var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
          handleThemeHeroFile(file);
        });
      }

      var logoUploadZone = $("[data-theme-logo-upload-zone]");
      if (logoUploadZone) {
        logoUploadZone.addEventListener("dragover", function (event) {
          event.preventDefault();
          logoUploadZone.classList.add("is-dragover");
        });
        logoUploadZone.addEventListener("dragleave", function () {
          logoUploadZone.classList.remove("is-dragover");
        });
        logoUploadZone.addEventListener("drop", function (event) {
          event.preventDefault();
          logoUploadZone.classList.remove("is-dragover");
          var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
          handleThemeLogoFile(file);
        });
      }

      themeRoot.addEventListener("input", function (event) {
        handleThemeFieldInput(event);
      });
    }

    var filter = $("[data-products-filter]");
    if (filter) {
      filter.addEventListener("input", function () {
        renderProductsList(filter.value);
      });
    }

    var productForm = $("[data-product-form]");
    if (productForm) productForm.addEventListener("submit", saveProductFromForm);

    if (productModal) {
      productModal.addEventListener("click", function (event) {
        var preset = event.target.closest("[data-product-image-preset]");
        if (preset) {
          event.preventDefault();
          var fileInput = $("[data-product-image-file]");
          if (fileInput) fileInput.value = "";
          setProductImageValue(preset.getAttribute("data-product-image-preset"));
          return;
        }
        if (event.target.closest("[data-product-image-clear]")) {
          event.preventDefault();
          clearProductImage();
          return;
        }
        if (event.target.closest("[data-product-gallery-add]")) {
          event.preventDefault();
          addProductGallerySlot();
          return;
        }
        var removeGallery = event.target.closest("[data-product-gallery-remove]");
        if (removeGallery) {
          event.preventDefault();
          removeProductGallerySlot(parseInt(removeGallery.getAttribute("data-product-gallery-remove"), 10));
          return;
        }
      });
      productModal.addEventListener("change", function (event) {
        if (event.target.matches("[data-product-image-file]")) {
          handleProductImageFile(event.target.files && event.target.files[0]);
          return;
        }
        if (event.target.matches("[data-product-gallery-file]")) {
          handleProductGalleryFile(
            event.target.files && event.target.files[0],
            parseInt(event.target.getAttribute("data-gallery-index"), 10)
          );
        }
      });
      productModal.addEventListener("input", function (event) {
        if (event.target.matches("[data-product-image-url]")) {
          var fileInput = $("[data-product-image-file]");
          if (fileInput) fileInput.value = "";
          setProductImageValue(event.target.value.trim());
          return;
        }
        if (event.target.matches("[data-product-gallery-url]")) {
          var gIdx = parseInt(event.target.getAttribute("data-gallery-index"), 10);
          if (!isNaN(gIdx) && productGalleryDraft[gIdx] != null) {
            productGalleryDraft[gIdx] = event.target.value.trim();
            var item = event.target.closest(".panel-product-gallery-item");
            var thumb = item && item.querySelector(".panel-product-gallery-item__thumb");
            var safe = safeCssUrl(event.target.value.trim());
            if (thumb) {
              thumb.style.backgroundImage = safe ? "url('" + safe + "')" : "";
            }
          }
        }
      });
      var uploadZone = $("[data-product-upload-zone]");
      if (uploadZone) {
        uploadZone.addEventListener("dragover", function (event) {
          event.preventDefault();
          uploadZone.classList.add("is-dragover");
        });
        uploadZone.addEventListener("dragleave", function () {
          uploadZone.classList.remove("is-dragover");
        });
        uploadZone.addEventListener("drop", function (event) {
          event.preventDefault();
          uploadZone.classList.remove("is-dragover");
          var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
          handleProductImageFile(file);
        });
      }
    }

    var collectionForm = $("[data-collection-form]");
    if (collectionForm) collectionForm.addEventListener("submit", saveCollectionFromForm);

    if (collectionModal) {
      collectionModal.addEventListener("click", function (event) {
        var preset = event.target.closest("[data-collection-image-preset]");
        if (!preset) return;
        event.preventDefault();
        var url = preset.getAttribute("data-collection-image-preset");
        var input = $("[data-collection-image]");
        if (input) input.value = url;
        syncCollectionImagePreview(url);
        renderCollectionImagePresets(url);
      });
      collectionModal.addEventListener("input", function (event) {
        if (!event.target.matches("[data-collection-image]")) return;
        syncCollectionImagePreview(event.target.value);
        renderCollectionImagePresets(event.target.value.trim());
      });
      collectionModal.addEventListener("change", function (event) {
        if (!event.target.matches("[data-collection-products-picker] input")) return;
        var label = event.target.closest(".panel-collection-product");
        if (label) label.classList.toggle("is-selected", event.target.checked);
        updateCollectionProductCount();
      });
    }

    document.addEventListener("change", function (event) {
      if (!event.target.matches("[data-checkout-provider], [data-checkout-shipping-id]")) return;
      if (!checkoutDraft) return;
      readCheckoutDraftFromDOM();
      if (event.target.matches("[data-checkout-provider]")) {
        if ((checkoutDraft.payments.enabled || []).indexOf(checkoutDraft.payments.primary) === -1) {
          checkoutDraft.payments.primary = checkoutDraft.payments.enabled[0] || null;
        }
        if (currentView === "checkout") {
          renderCheckout();
          return;
        }
      }
      if (currentView === "checkout") {
        syncCheckoutSelectionUI();
        if (event.target.matches("[data-checkout-shipping-id]")) {
          var enabled = (checkoutDraft.shipping.methods || []).filter(function (m) {
            return m.enabled;
          });
          if (enabled.length === 1) {
            var bankField = $("[data-checkout-bank]");
            if (bankField && bankField.closest(".panel-field")) {
              bankField.closest(".panel-field").hidden = checkoutDraft.payments.enabled.indexOf("transfer") === -1;
            }
          }
        }
      }
    });
  }

  function readSessionUser() {
    try {
      var raw = sessionStorage.getItem("amiqplace_user");
      if (!raw) raw = localStorage.getItem("amiqplace_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function syncBodyModalLock() {
    var locked = !!document.querySelector(".panel-modal.is-open");
    document.body.classList.toggle("is-modal-open", locked);
  }

  function resetPanelUiState() {
    $all(".panel-modal").forEach(function (el) {
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
      el.hidden = true;
    });
    syncBodyModalLock();
    $all("[data-account-menu]").forEach(function (el) {
      el.classList.remove("is-open");
    });
  }

  function initPanelAccountMenu() {
    var root = $("[data-account-menu]");
    if (!root || root.dataset.panelBound) return;
    root.dataset.panelBound = "1";
    var trigger = root.querySelector("[data-account-trigger]");
    var menu = root.querySelector("[data-account-dropdown]");
    if (!trigger || !menu) return;

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    }

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!root.classList.contains("is-open"));
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) setOpen(false);
    });

    var logoutBtn = root.querySelector("[data-account-logout]");
    if (logoutBtn && !logoutBtn.dataset.panelBound) {
      logoutBtn.dataset.panelBound = "1";
      logoutBtn.addEventListener("click", function () {
        resetPanelUiState();
        function clearLocal() {
          try {
            sessionStorage.removeItem("amiqplace_user");
            sessionStorage.removeItem("amiqplace_trial_active");
            sessionStorage.removeItem("amiqplace_active_project");
            localStorage.removeItem("amiqplace_user");
            localStorage.removeItem("amiqplace_trial_active");
            localStorage.removeItem("amiqplace_active_project");
          } catch (e) {}
          window.location.href = "Login.html";
        }
        if (window.AmiQAuth && window.AmiQAuth.isLive && window.AmiQAuth.isLive()) {
          window.AmiQAuth.signOut().finally(clearLocal);
          return;
        }
        clearLocal();
      });
    }

    var user = readSessionUser();
    syncAccountMenuUser();
  }

  function initPanelSession() {
    resetPanelUiState();

    function proceed() {
      var user = readSessionUser();
      if (!user || user.verified !== true) {
        window.location.replace("Login.html");
        return false;
      }
      if (sessionStorage.getItem("amiqplace_trial_active") !== "true" && localStorage.getItem("amiqplace_trial_active") !== "true") {
        window.location.replace("konto-start.html");
        return false;
      }
      try {
        if (localStorage.getItem("amiqplace_trial_active") === "true" && sessionStorage.getItem("amiqplace_trial_active") !== "true") {
          sessionStorage.setItem("amiqplace_trial_active", "true");
        }
        var userRaw = sessionStorage.getItem("amiqplace_user") || localStorage.getItem("amiqplace_user");
        if (userRaw && !sessionStorage.getItem("amiqplace_user")) sessionStorage.setItem("amiqplace_user", userRaw);
      } catch (syncErr) {}
      initPanelAccountMenu();
      return true;
    }

    if (window.AmiQAuth && window.AmiQAuth.isLive && window.AmiQAuth.isLive()) {
      window.AmiQAuth.getSession().finally(proceed);
      return true;
    }
    return proceed();
  }

  function upsertCustomerFromOrder(project, order) {
    if (!project || !order || !order.email) return project.customers || [];
    var customers = (project.customers || []).slice();
    var email = String(order.email).toLowerCase();
    var idx = customers.findIndex(function (c) {
      return String(c.email).toLowerCase() === email;
    });
    if (idx === -1) {
      customers.unshift({
        id: uid("cust"),
        name: order.customer || "Klient",
        email: order.email,
        phone: "",
        ordersCount: 1,
        totalSpent: order.total || 0,
        lastOrderAt: order.createdAt || Date.now(),
        source: "order",
        createdAt: Date.now()
      });
    } else {
      var existing = Object.assign({}, customers[idx]);
      existing.ordersCount = (existing.ordersCount || 0) + 1;
      existing.totalSpent = (existing.totalSpent || 0) + (order.total || 0);
      existing.lastOrderAt = order.createdAt || Date.now();
      existing.name = order.customer || existing.name;
      customers[idx] = existing;
    }
    return customers;
  }

  function syncCustomersFromOrders(project) {
    if (!project) return [];
    var customers = (project.customers || []).slice();
    (project.orders || []).forEach(function (order) {
      customers = upsertCustomerFromOrder(Object.assign({}, project, { customers: customers }), order);
    });
    return customers;
  }

  function renderCustomers(filter) {
    var project = getActiveProject();
    var empty = $("[data-customers-empty]");
    var layout = $("[data-customers-layout]");
    var list = $("[data-customers-list]");
    if (!empty || !layout || !list) return;

    if (!project) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }

    empty.hidden = true;
    layout.hidden = false;
    var nameEl = $("[data-customers-project-name]");
    if (nameEl) nameEl.textContent = project.name;

    var customers = syncCustomersFromOrders(project);
    if (customers.length !== (project.customers || []).length) {
      updateProject(project.id, { customers: customers });
      project = getActiveProject();
      customers = project.customers || [];
    }

    var q = (filter || "").trim().toLowerCase();
    if (q) {
      customers = customers.filter(function (c) {
        return (c.name || "").toLowerCase().indexOf(q) !== -1 || (c.email || "").toLowerCase().indexOf(q) !== -1;
      });
    }

    var countEl = $("[data-customers-count]");
    if (countEl) countEl.textContent = customers.length + " klientów";

    if (!customers.length) {
      list.innerHTML =
        '<div class="panel-modal__empty"><strong>Brak klientów</strong>Dodaj klienta ręcznie lub wygeneruj demo zamówienie w sekcji Zamówienia.</div>';
      return;
    }

    list.innerHTML = customers
      .map(function (c) {
        return (
          '<article class="panel-customer-row">' +
          '<div class="panel-customer-row__avatar" aria-hidden="true"><i class="fas fa-user"></i></div>' +
          '<div class="panel-customer-row__body"><h3>' +
          escapeHtml(c.name) +
          "</h3><p>" +
          escapeHtml(c.email) +
          "</p>" +
          '<div class="panel-customer-row__meta"><span>' +
          (c.ordersCount || 0) +
          " zamów.</span><span>" +
          escapeHtml(formatPrice(c.totalSpent || 0)) +
          " łącznie</span><span>" +
          (c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("pl-PL") : "—") +
          '</span><span class="panel-customer-row__badge">' +
          (c.source === "manual" ? "Ręczny" : "Z zamówienia") +
          "</span></div></div>" +
          '<div class="panel-customer-row__actions">' +
          '<button type="button" class="panel-project-card__btn panel-project-card__btn--danger" data-delete-customer="' +
          escapeHtml(c.id) +
          '" aria-label="Usuń"><i class="fas fa-trash-can"></i></button></div></article>'
        );
      })
      .join("");
  }

  function openCustomerModal() {
    var project = getActiveProject();
    if (!project) {
      showToast("Najpierw wybierz projekt.");
      return;
    }
    if (!customerModal) customerModal = document.getElementById("customer-modal");
    if (!customerModal) return;
    var form = $("[data-customer-form]");
    if (form) form.reset();
    var idField = $("[data-customer-id]");
    if (idField) idField.value = "";
    customerModal.hidden = false;
    customerModal.classList.add("is-open");
    customerModal.setAttribute("aria-hidden", "false");
    syncBodyModalLock();
    var nameInput = $("[data-customer-name]");
    if (nameInput) nameInput.focus();
  }

  function closeCustomerModal() {
    if (!customerModal || !customerModal.classList.contains("is-open")) return;
    customerModal.classList.remove("is-open");
    customerModal.setAttribute("aria-hidden", "true");
    syncBodyModalLock();
    window.setTimeout(function () {
      if (customerModal && !customerModal.classList.contains("is-open")) customerModal.hidden = true;
    }, 280);
  }

  function saveCustomerFromForm(event) {
    event.preventDefault();
    var project = getActiveProject();
    if (!project) return;
    var name = $("[data-customer-name]") ? $("[data-customer-name]").value.trim() : "";
    var email = $("[data-customer-email]") ? $("[data-customer-email]").value.trim() : "";
    var phone = $("[data-customer-phone]") ? $("[data-customer-phone]").value.trim() : "";
    if (!name || !email) {
      showToast("Podaj imię i e-mail klienta.");
      return;
    }
    var customers = (project.customers || []).slice();
    customers.unshift({
      id: uid("cust"),
      name: name,
      email: email,
      phone: phone,
      ordersCount: 0,
      totalSpent: 0,
      lastOrderAt: null,
      source: "manual",
      createdAt: Date.now()
    });
    updateProject(project.id, { customers: customers });
    pushActivity(project.id, 'Dodano klienta „' + name + '"');
    closeCustomerModal();
    renderCustomers($("[data-customers-filter]") && $("[data-customers-filter]").value);
    showToast("Klient dodany.");
  }

  function deleteCustomer(customerId) {
    var project = getActiveProject();
    if (!project) return;
    updateProject(
      project.id,
      {
        customers: (project.customers || []).filter(function (c) {
          return c.id !== customerId;
        })
      }
    );
    renderCustomers($("[data-customers-filter]") && $("[data-customers-filter]").value);
    showToast("Klient usunięty.");
  }

  function initModals() {
    modal = document.getElementById("projects-modal");
    productModal = document.getElementById("product-modal");
    deleteModal = document.getElementById("delete-project-modal");
    customerModal = document.getElementById("customer-modal");
    templatePreviewModal = document.getElementById("template-preview-modal");
    publishModal = document.getElementById("publish-modal");
    categoryModal = document.getElementById("category-onboarding-modal");
    initCategoryWizardModal();
    collectionModal = document.getElementById("collection-modal");
    bannerLibraryModal = document.getElementById("banner-library-modal");
    initBannerLibraryModal();
    orderModal = document.getElementById("order-detail-modal");
    resetPanelUiState();
    if (modal) {
      modal.addEventListener("click", handleProjectsModalClick);
      $all("[data-projects-tab]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          switchTab(btn.getAttribute("data-projects-tab"));
        });
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (categoryModal && categoryModal.classList.contains("is-open")) closeCategoryModal();
      else if (publishModal && publishModal.classList.contains("is-open")) closePublishModal();
      else if (deleteModal && deleteModal.classList.contains("is-open")) closeDeleteModal();
      else if (collectionModal && collectionModal.classList.contains("is-open")) closeCollectionModal();
      else if (bannerLibraryModal && bannerLibraryModal.classList.contains("is-open")) closeBannerLibraryModal();
      else if (templatePreviewModal && templatePreviewModal.classList.contains("is-open")) closeTemplatePreview();
      else if (orderModal && orderModal.classList.contains("is-open")) closeOrderModal();
      else if (customerModal && customerModal.classList.contains("is-open")) closeCustomerModal();
      else if (productModal && productModal.classList.contains("is-open")) closeProductModal();
      else if (modal && modal.classList.contains("is-open")) closeModal();
      else closeMobilePanelMenu();
    });
    window.addEventListener("resize", function () {
      if (!isMobilePanelViewport()) closeMobilePanelMenu();
    });
  }

  function init() {
    if (!initPanelSession()) return;
    applyPanelPrefs();
    purgeExpiredDeleted();
    try {
      var projects = sessionStorage.getItem(STORAGE_PROJECTS);
      if (projects) localStorage.setItem(STORAGE_PROJECTS, projects);
      var active = sessionStorage.getItem(STORAGE_ACTIVE);
      if (active) localStorage.setItem(STORAGE_ACTIVE, active);
      else {
        active = localStorage.getItem(STORAGE_ACTIVE);
        if (active) sessionStorage.setItem(STORAGE_ACTIVE, active);
      }
      syncStoreNotificationsStorage();
    } catch (e) {}
    initModals();
    initNavigation();
    initPanelSearchAndNotifications();
    syncMobilePanelMenuNav();
    var projects = getProjects();
    if (projects.length && !getActiveProjectId()) setActiveProject(projects[0].id);
    applyIncomingPanelRoute();
    renderAllPanels();
    refreshUI();
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) resetPanelUiState();
      else syncBodyModalLock();
    });
    window.addEventListener("resize", function () {
      renderPreviewTargets();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
