(function () {
  "use strict";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getLoggedUser() {
    try {
      var raw = sessionStorage.getItem("amiqplace_user");
      if (!raw) raw = localStorage.getItem("amiqplace_user");
      return raw ? JSON.parse(raw) : null;
    } catch (event) {
      return null;
    }
  }

  function isLoggedIn() {
    var user = getLoggedUser();
    return !!(user && (user.verified === true || user.provider === "supabase"));
  }

  function hasStoreAccess() {
    try {
      return sessionStorage.getItem("amiqplace_trial_active") === "true" || localStorage.getItem("amiqplace_trial_active") === "true";
    } catch (event) {
      return false;
    }
  }

  function getDisplayName(user) {
    if (!user) return "Konto";
    if (user.name) return user.name;
    if (user.email) return user.email.split("@")[0];
    return "Konto";
  }

  function getAccountStatus(accessActive) {
    if (accessActive) return "Trial aktywny";
    try {
      var plan = sessionStorage.getItem("amiqplace_plan") || localStorage.getItem("amiqplace_plan");
      if (plan) return "Plan: " + plan;
    } catch (e) {}
    return "Brak aktywnego planu";
  }

  function ensureAccountStyles() {
    if (document.querySelector('link[href="AmiQPlace - Konto.css"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "AmiQPlace - Konto.css";
    document.head.appendChild(link);
  }

  function buildAccountMenu(status, accessActive, displayName) {
    return (
      '<div class="account-user" data-account-menu>' +
      '<button type="button" class="account-user__trigger" data-account-trigger aria-label="Otwórz menu konta" aria-expanded="false" aria-controls="account-menu">' +
      '<i class="far fa-user" aria-hidden="true"></i>' +
      "</button>" +
      '<div class="account-user__menu" id="account-menu" data-account-dropdown aria-hidden="true">' +
      '<div class="account-user__profile">' +
      '<span class="account-user__avatar"><i class="far fa-user" aria-hidden="true"></i></span>' +
      "<span>" +
      '<span class="account-user__name">' +
      escapeHtml(displayName || "Konto") +
      "</span>" +
      '<span class="account-user__status">' +
      escapeHtml(status) +
      "</span>" +
      "</span>" +
      "</div>" +
      '<div class="account-user__links">' +
      '<a href="o-nas.html"><i class="fas fa-circle-info" aria-hidden="true"></i> O nas</a>' +
      '<a href="faq.html"><i class="fas fa-circle-question" aria-hidden="true"></i> FAQ</a>' +
      '<a href="plany.html"><i class="fas fa-layer-group" aria-hidden="true"></i> Plany</a>' +
      '<a href="regulamin.html"><i class="fas fa-scale-balanced" aria-hidden="true"></i> Regulamin</a>' +
      '<a href="kontakt.html"><i class="fas fa-message" aria-hidden="true"></i> Kontakt</a>' +
      (accessActive
        ? '<a href="panel.html"><i class="fas fa-store" aria-hidden="true"></i> Twoje sklepy</a>'
        : '<a href="#" data-requires-plan><i class="fas fa-store" aria-hidden="true"></i> Twoje sklepy</a>') +
      '<a href="panel.html?view=settings"><i class="fas fa-gear" aria-hidden="true"></i> Ustawienia</a>' +
      '<a href="faq.html"><i class="fas fa-circle-question" aria-hidden="true"></i> Pomoc</a>' +
      '<button type="button" class="account-user__danger" data-account-logout><i class="fas fa-right-from-bracket" aria-hidden="true"></i> Wyloguj</button>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function ensureGuestLoginLink(headerInner) {
    if (!headerInner || headerInner.querySelector(".login")) return;
    var toggle = headerInner.querySelector(".menu-toggle");
    var loginHtml = '<a href="Login.html" class="login">Zaloguj się</a>';
    if (toggle) {
      toggle.insertAdjacentHTML("beforebegin", loginHtml);
    } else {
      headerInner.insertAdjacentHTML("beforeend", loginHtml);
    }
  }

  function updateAccountMenuProfile(user, accessActive) {
    var root = document.querySelector(".header [data-account-menu]");
    if (!root) return;

    var nameEl = root.querySelector(".account-user__name");
    var statusEl = root.querySelector(".account-user__status");
    if (nameEl) nameEl.textContent = getDisplayName(user);
    if (statusEl) statusEl.textContent = getAccountStatus(accessActive);

    var storeLink = root.querySelector("[data-requires-plan], .account-user__links a[href=\"panel.html\"]");
    if (storeLink) {
      if (accessActive) {
        storeLink.setAttribute("href", "panel.html");
        storeLink.removeAttribute("data-requires-plan");
      } else {
        storeLink.setAttribute("href", "#");
        storeLink.setAttribute("data-requires-plan", "");
      }
    }
  }

  function syncMobileAuthState(user, loggedIn, accessActive) {
    var mobileName = document.querySelector(".mobile-menu__name");
    var mobileStatus = document.querySelector(".mobile-menu__status");
    var mobileAuth = document.querySelector("[data-mobile-auth], .mobile-auth");

    if (!loggedIn) {
      if (mobileName) mobileName.textContent = "Gość";
      if (mobileStatus) mobileStatus.textContent = "Zaloguj się lub załóż konto";
      return;
    }

    if (mobileName) mobileName.textContent = getDisplayName(user);
    if (mobileStatus) mobileStatus.textContent = getAccountStatus(accessActive);

    if (mobileAuth) {
      mobileAuth.innerHTML =
        '<div class="account-user__links mobile-menu__auth-links">' +
        '<a href="panel.html" class="mobile-menu__auth-primary"><i class="fas fa-store" aria-hidden="true"></i> Panel sklepu</a>' +
        '<button type="button" data-account-logout><i class="fas fa-right-from-bracket" aria-hidden="true"></i> Wyloguj</button>' +
        "</div>";
    }
  }

  function syncHeaderAuthState() {
    if (document.body.classList.contains("panel-page")) return;

    var headerInner = document.querySelector(".header .header-inner");
    if (!headerInner) return;

    var user = getLoggedUser();
    var loggedIn = isLoggedIn();
    var accessActive = hasStoreAccess();
    var loginEl = headerInner.querySelector(".login");
    var accountMenu = headerInner.querySelector("[data-account-menu]");

    if (loggedIn) {
      ensureAccountStyles();
      document.body.classList.add("account-logged-in");

      if (!accountMenu) {
        var html = buildAccountMenu(getAccountStatus(accessActive), accessActive, getDisplayName(user));
        if (loginEl) {
          loginEl.insertAdjacentHTML("afterend", html);
          loginEl.remove();
        } else {
          var toggle = headerInner.querySelector(".menu-toggle");
          if (toggle) {
            toggle.insertAdjacentHTML("beforebegin", html);
          } else {
            headerInner.insertAdjacentHTML("beforeend", html);
          }
        }
      } else {
        updateAccountMenuProfile(user, accessActive);
      }

      syncMobileAuthState(user, true, accessActive);
    } else {
      document.body.classList.remove("account-logged-in");

      if (accountMenu) accountMenu.remove();
      ensureGuestLoginLink(headerInner);
      syncMobileAuthState(null, false, false);
    }
  }

  function initAccountMenu() {
    if (document.body.classList.contains("panel-page")) return;

    var root = document.querySelector("[data-account-menu]");
    if (!root) return;

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
      if (!root.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.focus();
      }
    });
  }

  function initPlanButtons() {
    document.querySelectorAll("[data-plan-select]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        var plan = button.getAttribute("data-plan-select") || "starter";
        try {
          sessionStorage.setItem("amiqplace_plan", plan);
        } catch (storageErr) {}
        button.textContent = "Wybrano: " + plan;
        button.setAttribute("aria-label", "Wybrano plan " + plan);
        button.classList.add("is-selected");
      });
    });
  }

  function handleLogout() {
    function clearLocal() {
      try {
        sessionStorage.removeItem("amiqplace_user");
        sessionStorage.removeItem("amiqplace_trial_active");
        sessionStorage.removeItem("amiqplace_active_project");
        sessionStorage.removeItem("amiqplace_plan");
        localStorage.removeItem("amiqplace_user");
        localStorage.removeItem("amiqplace_trial_active");
        localStorage.removeItem("amiqplace_active_project");
        localStorage.removeItem("amiqplace_plan");
      } catch (event) {}
      document.body.classList.remove("is-modal-open", "account-logged-in");
      window.location.href = "Login.html";
    }

    if (window.AmiQAuth && window.AmiQAuth.isLive && window.AmiQAuth.isLive()) {
      window.AmiQAuth.signOut().finally(clearLocal);
      return;
    }
    clearLocal();
  }

  function initTrialAndLogout() {
    if (document.body.classList.contains("panel-page")) return;

    document.querySelectorAll("[data-start-trial]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        link.classList.add("is-selected");
        try {
          sessionStorage.setItem("amiqplace_trial_active", "true");
          localStorage.setItem("amiqplace_trial_active", "true");
        } catch (storageEvent) {}
        var footer = link.querySelector(".account-option__footer span");
        if (footer) {
          footer.textContent = "Trial aktywowany — otwieramy panel";
        }
        window.setTimeout(function () {
          window.location.href = "panel.html";
        }, 750);
      });
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-account-logout]")) {
        event.preventDefault();
        handleLogout();
      }
    });
  }

  function showAccountNotice(message) {
    var notice = document.querySelector("[data-account-notice]");
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "account-notice";
      notice.setAttribute("data-account-notice", "");
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      document.body.appendChild(notice);
    }

    notice.innerHTML =
      '<i class="fas fa-circle-info" aria-hidden="true"></i><span>' + escapeHtml(message) + "</span>";
    notice.classList.add("is-visible");

    window.clearTimeout(showAccountNotice.timer);
    showAccountNotice.timer = window.setTimeout(function () {
      notice.classList.remove("is-visible");
    }, 3600);
  }

  function initBlockedAccountLinks() {
    if (document.body.classList.contains("panel-page")) return;

    document.querySelectorAll("[data-account-logo]").forEach(function (logo) {
      if (!logo.getAttribute("href") || logo.getAttribute("href") === "#") {
        logo.setAttribute("href", "index.html");
      }
    });

    document.addEventListener("click", function (event) {
      var link = event.target.closest("[data-requires-plan]");
      if (!link) return;
      if (hasStoreAccess()) {
        event.preventDefault();
        window.location.href = "panel.html";
        return;
      }
      event.preventDefault();
      showAccountNotice("Aby przejść do swoich sklepów, najpierw wybierz plan lub uruchom darmowy trial.");
    });
  }

  function initPanelPreviewSwitch() {
    var preview = document.querySelector("[data-store-preview]");
    var buttons = document.querySelectorAll("[data-preview-device]");
    if (!preview || !buttons.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.getAttribute("data-preview-device");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        preview.classList.toggle("is-mobile", mode === "mobile");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var boot = Promise.resolve();
    if (window.AmiQAuth && window.AmiQAuth.isLive && window.AmiQAuth.isLive()) {
      boot = window.AmiQAuth.getSession();
    }
    boot.finally(function () {
      syncHeaderAuthState();
      initAccountMenu();
      initPlanButtons();
      initTrialAndLogout();
      initBlockedAccountLinks();
      initPanelPreviewSwitch();
    });
  });
})();
