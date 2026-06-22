(function () {
  "use strict";

  var SF = window.AmiqStorefront;
  var device = "desktop";

  function $(sel) {
    return document.querySelector(sel);
  }

  function setVisible(el, visible) {
    if (!el) return;
    if (visible) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
  }

  function isPanelMobileViewport() {
    return SF && !SF.isDesktopViewport();
  }

  function syncPreviewPageLayout() {
    var onMobile = isPanelMobileViewport();
    document.body.classList.toggle("preview-page--mobile-only", onMobile);
    if (onMobile) device = "mobile";
    var deviceBar = $(".preview-page__device");
    if (deviceBar) {
      deviceBar.querySelectorAll("[data-preview-page-device]").forEach(function (btn) {
        var mode = btn.getAttribute("data-preview-page-device");
        btn.hidden = onMobile && mode === "desktop";
        btn.classList.toggle("is-active", mode === device);
      });
    }
  }

  function getProjectIdFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get("id");
    } catch (e) {
      return null;
    }
  }

  function buildPanelUrl(options) {
    options = options || {};
    var projectId = getProjectIdFromUrl();
    var params = new URLSearchParams();
    if (projectId) params.set("project", projectId);
    if (options.view) params.set("view", options.view);
    var qs = params.toString();
    return "panel.html" + (qs ? "?" + qs : "");
  }

  function navigateToPanel(options) {
    var url = buildPanelUrl(options);
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = url;
        window.opener.focus();
        window.close();
        return;
      }
    } catch (e) {}
    window.location.href = url;
  }

  function showState(name) {
    setVisible($("[data-preview-loading]"), name === "loading");
    setVisible($("[data-preview-blocked]"), name === "blocked");
    setVisible($("[data-preview-empty]"), name === "empty");
    setVisible($("[data-preview-error]"), name === "error");
    setVisible($("[data-preview-frame-wrap]"), name === "ready");
    setVisible($("[data-preview-page-actions]"), name === "ready");
  }

  function getShareUrl(store) {
    var path = window.location.pathname.replace(/[^/]*$/, "");
    return window.location.origin + path + "sklep-podglad.html?id=" + encodeURIComponent(store.id);
  }


  function render() {
    try {
      if (!SF) {
        showState("error");
        var errText = $("[data-preview-error-text]");
        if (errText) errText.textContent = "Brak modułu podglądu (storefront.js). Odśwież stronę.";
        return;
      }

      syncPreviewPageLayout();

      var store = SF.resolveProject(getProjectIdFromUrl());
      if (!store) {
        showState("empty");
        return;
      }

      showState("ready");

      var title = $("[data-preview-page-title]");
      var url = $("[data-preview-page-url]");
      var browserUrl = $("[data-preview-browser-url]");
      var frame = $("[data-preview-frame]");
      var copyBtn = $("[data-preview-copy-link]");
      var isLive = store.status === "published";

      if (title) title.textContent = store.storeName;
      if (url) {
        url.textContent = store.slug + ".amiqplace.pl · " + (isLive ? "Live" : "Szkic");
      }
      if (browserUrl) browserUrl.textContent = store.slug + ".amiqplace.pl";
      if (copyBtn) {
        if (isLive) copyBtn.removeAttribute("hidden");
        else copyBtn.setAttribute("hidden", "");
      }
      if (frame) {
        frame.classList.toggle("is-mobile", device === "mobile");
        var route = SF.parseStorefrontRoute ? SF.parseStorefrontRoute() : { view: "home", productId: null };
        frame.innerHTML = SF.buildStorefrontInner(store, { compact: false, device: device, route: route });
        if (SF.wireStorefront) {
          SF.wireStorefront(frame, store, { compact: false, device: device });
        }
      }
    } catch (err) {
      showState("error");
      var msg = $("[data-preview-error-text]");
      if (msg) msg.textContent = "Błąd renderowania podglądu: " + (err && err.message ? err.message : "nieznany");
    }
  }

  function boot() {
    showState("loading");
    window.setTimeout(function () {
      render();
    }, 0);
  }

  function initPreviewPage() {
    document.querySelectorAll("[data-preview-page-device]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-preview-page-device") === "mobile" ? "mobile" : "desktop";
        if (mode === "desktop" && isPanelMobileViewport()) return;
        device = mode;
        document.querySelectorAll("[data-preview-page-device]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        render();
      });
    });

    document.querySelectorAll("[data-preview-refresh]").forEach(function (btn) {
      btn.addEventListener("click", boot);
    });

    document.querySelectorAll("[data-go-panel]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        navigateToPanel({ view: link.getAttribute("data-go-panel-view") || null });
      });
    });

    var copyBtn = document.querySelector("[data-preview-copy-link]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var store = SF && SF.resolveProject(getProjectIdFromUrl());
        if (!store) return;
        var url = getShareUrl(store);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            copyBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Skopiowano';
            window.setTimeout(function () {
              copyBtn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Kopiuj link';
            }, 2000);
          });
        }
      });
    }

    window.addEventListener("storage", render);
    window.addEventListener("resize", function () {
      syncPreviewPageLayout();
      render();
    });
    window.addEventListener("hashchange", render);
    syncPreviewPageLayout();
    boot();

    window.setTimeout(function () {
      var loading = $("[data-preview-loading]");
      if (loading && !loading.hasAttribute("hidden")) {
        showState("error");
        var msg = $("[data-preview-error-text]");
        if (msg) msg.textContent = "Podgląd trwa zbyt długo — odśwież stronę lub wróć do panelu i otwórz podgląd ponownie.";
      }
    }, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPreviewPage);
  } else {
    initPreviewPage();
  }
})();
