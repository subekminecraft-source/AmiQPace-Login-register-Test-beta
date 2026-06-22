(function () {
  "use strict";

  var STORAGE_USER = "amiqplace_user";
  var STORAGE_PENDING = "amiq_pending_verify";
  var DEMO_EMAIL = "demo@amiqplace.pl";
  var DEMO_PASSWORD = "AmiQDemo2026!";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function initMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu-drawer");
    var overlay = document.getElementById("mobile-overlay");
    if (!toggle || !menu || !overlay) return;

    var closeBtn = menu.querySelector(".close-menu");

    function setOpen(open) {
      menu.classList.toggle("active", open);
      overlay.classList.toggle("active", open);
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("mobile-nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
      if ("inert" in menu) {
        menu.inert = !open;
      }
      if (open) {
        var first = menu.querySelector("a, button");
        if (first) {
          try {
            first.focus();
          } catch (e) {}
        }
      } else if (document.activeElement && menu.contains(document.activeElement)) {
        try {
          toggle.focus();
        } catch (e2) {}
      }
    }

    function closeMenu() {
      setOpen(false);
    }

    function openMenu() {
      setOpen(true);
    }

    function isMobileNav() {
      return window.matchMedia("(max-width: 900px)").matches;
    }

    function closeIfDesktop() {
      if (!isMobileNav()) {
        closeMenu();
      }
    }

    closeMenu();
    window.addEventListener("resize", closeIfDesktop);

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      if (menu.classList.contains("active")) closeMenu();
      else openMenu();
    });

    overlay.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenu();
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      });
    }

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobileNav() && menu.classList.contains("active")) {
        closeMenu();
        try {
          toggle.focus();
        } catch (err) {}
      }
    });
  }

  function showFieldError(field, message) {
    var wrap = field.closest(".auth-field");
    if (!wrap) return;
    var err = wrap.querySelector(".auth-field__error");
    field.classList.toggle("auth-input--invalid", !!message);
    if (err) {
      err.textContent = message || "";
      err.classList.toggle("is-visible", !!message);
    }
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".auth-input--invalid").forEach(function (el) {
      el.classList.remove("auth-input--invalid");
    });
    form.querySelectorAll(".auth-field__error.is-visible").forEach(function (el) {
      el.classList.remove("is-visible");
      el.textContent = "";
    });
  }

  function validateEmail(value) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).trim());
  }

  function passwordScore(pw) {
    var s = 0;
    if (!pw || pw.length < 8) return 0;
    s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(4, s);
  }

  function updateStrengthMeter(input, meterEl, labelEl) {
    if (!meterEl) return;
    var sc = passwordScore(input.value);
    meterEl.className = "auth-strength" + (sc > 0 ? " auth-strength--" + sc : "");
    var texts = ["Za krótkie", "Słabe", "Średnie", "Dobre", "Silne"];
    if (labelEl) {
      labelEl.textContent = input.value ? texts[sc] : "Minimum 8 znaków, wielka i mała litera, cyfra";
    }
  }

  function initPasswordToggles() {
    document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("aria-controls");
        var input = id ? document.getElementById(id) : null;
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Ukryj hasło" : "Pokaż hasło");
        var icon = btn.querySelector("i");
        if (icon) {
          icon.className = show ? "fas fa-eye-slash" : "fas fa-eye";
        }
      });
    });
  }

  function readStoredUser() {
    try {
      var raw = sessionStorage.getItem(STORAGE_USER);
      if (!raw) raw = localStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStoredUser(obj) {
    var payload = JSON.stringify(obj);
    sessionStorage.setItem(STORAGE_USER, payload);
    try {
      localStorage.setItem(STORAGE_USER, payload);
    } catch (e) {}
  }

  function persistTrialActive() {
    try {
      sessionStorage.setItem("amiqplace_trial_active", "true");
      localStorage.setItem("amiqplace_trial_active", "true");
    } catch (e) {}
  }

  function isLiveAuth() {
    return !!(window.AmiQAuth && window.AmiQAuth.isLive && window.AmiQAuth.isLive());
  }

  function afterAuthSuccess(remember) {
    if (remember !== false) {
      try {
        if (!sessionStorage.getItem("amiqplace_plan")) {
          sessionStorage.setItem("amiqplace_plan", "trial");
          localStorage.setItem("amiqplace_plan", "trial");
        }
      } catch (planErr) {}
    }
    window.location.href = "konto-start.html";
  }

  function initLoginForm() {
    var form = $("#form-login");
    if (!form) return;

    var banner = $("#login-banner");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors(form);

      var email = $("#login-email");
      var pass = $("#login-password");
      var remember = $("#login-remember");

      var ok = true;
      if (!validateEmail(email.value)) {
        showFieldError(email, "Podaj prawidłowy adres e-mail.");
        ok = false;
      }
      if (!pass.value || pass.value.length < 8) {
        showFieldError(pass, "Hasło musi mieć co najmniej 8 znaków.");
        ok = false;
      }
      if (!ok) return;

      var normalized = email.value.trim().toLowerCase();

      if (banner) {
        banner.hidden = true;
      }

      if (isLiveAuth()) {
        form.querySelector(".auth-submit").disabled = true;
        window.AmiQAuth.signIn(normalized, pass.value, !!(remember && remember.checked)).then(function (result) {
          form.querySelector(".auth-submit").disabled = false;
          if (!result.ok) {
            if (banner) {
              banner.className = "auth-banner auth-banner--error";
              banner.textContent = result.error;
              banner.hidden = false;
            }
            return;
          }
          if (remember && remember.checked) {
            try {
              localStorage.setItem(
                "amiqplace_remember",
                JSON.stringify({ email: normalized, ts: Date.now() })
              );
            } catch (err) {}
          } else {
            try {
              localStorage.removeItem("amiqplace_remember");
            } catch (err2) {}
          }
          if (banner) {
            banner.className = "auth-banner auth-banner--success";
            banner.textContent = "Zalogowano. Za chwilę przejdziesz do startu konta.";
            banner.hidden = false;
          }
          setTimeout(function () {
            afterAuthSuccess(true);
          }, 700);
        });
        return;
      }

      var user = readStoredUser();
      var isDemo = normalized === DEMO_EMAIL.toLowerCase() && pass.value === DEMO_PASSWORD;
      var valid =
        isDemo ||
        (user &&
          user.email === normalized &&
          user.password === pass.value &&
          user.verified === true);

      if (banner) {
        banner.hidden = true;
      }

      if (!valid) {
        if (banner) {
          banner.className = "auth-banner auth-banner--error";
          banner.textContent =
            "Nieprawidłowy e-mail lub hasło. Możesz użyć konta demo: " +
            DEMO_EMAIL +
            " / hasło z podpowiedzi na stronie logowania.";
          banner.hidden = false;
        }
        return;
      }

      if (isDemo) {
        writeStoredUser({
          email: DEMO_EMAIL.toLowerCase(),
          password: DEMO_PASSWORD,
          name: "Konto demo",
          verified: true,
          createdAt: Date.now()
        });
        try {
          persistTrialActive();
          if (!sessionStorage.getItem("amiqplace_plan")) {
            sessionStorage.setItem("amiqplace_plan", "trial");
            localStorage.setItem("amiqplace_plan", "trial");
          }
        } catch (trialErr) {}
      }

      if (remember && remember.checked) {
        try {
          localStorage.setItem(
            "amiqplace_remember",
            JSON.stringify({ email: normalized, ts: Date.now() })
          );
        } catch (err) {}
      } else {
        try {
          localStorage.removeItem("amiqplace_remember");
        } catch (err2) {}
      }

      if (banner) {
        banner.className = "auth-banner auth-banner--success";
        banner.textContent =
          "Zalogowano. Za chwilę przejdziesz do startu konta.";
        banner.hidden = false;
      }

      form.querySelector(".auth-submit").disabled = true;
      setTimeout(function () {
        window.location.href = "konto-start.html";
      }, 900);
    });

    try {
      var rem = JSON.parse(localStorage.getItem("amiqplace_remember") || "null");
      if (rem && rem.email) {
        $("#login-email").value = rem.email;
        var cb = $("#login-remember");
        if (cb) cb.checked = true;
      }
    } catch (e) {}
  }

  function initRegisterForm() {
    var form = $("#form-register");
    if (!form) return;

    var pass = $("#register-password");
    var pass2 = $("#register-password2");
    var meter = $("#register-strength");
    var label = $("#register-strength-label");

    if (pass && meter) {
      pass.addEventListener("input", function () {
        updateStrengthMeter(pass, meter, label);
      });
      updateStrengthMeter(pass, meter, label);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors(form);

      var name = $("#register-name");
      var email = $("#register-email");
      var terms = $("#register-terms");

      var ok = true;
      if (!name.value.trim() || name.value.trim().length < 2) {
        showFieldError(name, "Podaj imię i nazwisko (min. 2 znaki).");
        ok = false;
      }
      if (!validateEmail(email.value)) {
        showFieldError(email, "Podaj prawidłowy adres e-mail.");
        ok = false;
      }
      var sc = passwordScore(pass.value);
      if (sc < 3) {
        showFieldError(
          pass,
          "Hasło jest za słabe: użyj min. 8 znaków, wielkiej i małej litery oraz cyfry."
        );
        ok = false;
      }
      if (pass.value !== pass2.value) {
        showFieldError(pass2, "Hasła muszą być identyczne.");
        ok = false;
      }
      if (terms && !terms.checked) {
        showFieldError(terms, "Musisz zaakceptować regulamin i politykę prywatności.");
        ok = false;
      }
      if (!ok) return;

      var normalizedEmail = email.value.trim().toLowerCase();
      var displayName = name.value.trim();

      if (isLiveAuth()) {
        form.querySelector(".auth-submit").disabled = true;
        window.AmiQAuth.signUp(normalizedEmail, pass.value, displayName).then(function (result) {
          form.querySelector(".auth-submit").disabled = false;
          if (!result.ok) {
            showFieldError(email, result.error);
            return;
          }
          try {
            sessionStorage.setItem(
              STORAGE_PENDING,
              JSON.stringify({
                email: normalizedEmail,
                name: displayName,
                provider: "supabase",
                ts: Date.now()
              })
            );
          } catch (storageErr) {
            alert("Przeglądarka zablokowała zapis — odblokuj storage dla tej strony.");
            return;
          }
          if (result.session) {
            window.location.href = "konto-start.html";
            return;
          }
          window.location.href = "verify-email.html";
        });
        return;
      }

      var code = String(Math.floor(100000 + Math.random() * 900000));
      var pending = {
        email: normalizedEmail,
        password: pass.value,
        name: displayName,
        code: code,
        ts: Date.now()
      };
      try {
        sessionStorage.setItem(STORAGE_PENDING, JSON.stringify(pending));
      } catch (err) {
        alert("Przeglądarka zablokowała zapis — odblokuj pliki cookie / storage dla tej strony.");
        return;
      }

      window.location.href = "verify-email.html";
    });
  }

  function initVerifyPage() {
    var box = $("#verify-box");
    if (!box) return;

    var raw = sessionStorage.getItem(STORAGE_PENDING);
    var pending = null;
    try {
      pending = raw ? JSON.parse(raw) : null;
    } catch (e) {
      pending = null;
    }

    var emailEl = $("#verify-email-display");
    var hintCode = $("#verify-demo-code");
    var details = $("#verify-demo-details");

    if (!pending || !pending.email) {
      box.innerHTML =
        '<p class="auth-banner auth-banner--info">Brak oczekującej rejestracji. <a class="auth-link-muted" href="Register.html">Przejdź do rejestracji</a>.</p>';
      return;
    }

    if (emailEl) emailEl.textContent = pending.email;

    var isSupabasePending = pending.provider === "supabase" && isLiveAuth();

    if (hintCode) {
      if (isSupabasePending) {
        hintCode.textContent = "—";
      } else {
        hintCode.textContent = pending.code;
      }
    }
    if (details) {
      details.hidden = isSupabasePending;
    }

    if (isSupabasePending) {
      var head = box.querySelector(".auth-card__head p");
      if (head) {
        head.innerHTML =
          "Wysłaliśmy link aktywacyjny na <strong id=\"verify-email-display\">" +
          pending.email +
          "</strong>. Możesz też wpisać 6-cyfrowy kod z wiadomości.";
      }
    }

    var form = $("#form-verify");
    var banner = $("#verify-banner");
    var resendBtn = $("#verify-resend");
    var cooldown = 0;

    function setCooldown(sec) {
      cooldown = sec;
      function tick() {
        if (!resendBtn) return;
        if (cooldown <= 0) {
          resendBtn.disabled = false;
          resendBtn.textContent = "Wyślij kod ponownie";
          return;
        }
        resendBtn.disabled = true;
        resendBtn.textContent = "Wyślij ponownie za " + cooldown + " s";
        cooldown--;
        setTimeout(tick, 1000);
      }
      tick();
    }

    setCooldown(45);

    if (resendBtn) {
      resendBtn.addEventListener("click", function () {
        if (isSupabasePending) {
          window.AmiQAuth.resendSignup(pending.email).then(function (result) {
            if (banner) {
              banner.className = result.ok ? "auth-banner auth-banner--success" : "auth-banner auth-banner--error";
              banner.textContent = result.ok
                ? "Wysłaliśmy ponownie wiadomość aktywacyjną."
                : result.error;
              banner.hidden = false;
            }
            if (result.ok) setCooldown(60);
          });
          return;
        }
        var p = JSON.parse(sessionStorage.getItem(STORAGE_PENDING) || "null");
        if (!p) return;
        p.code = String(Math.floor(100000 + Math.random() * 900000));
        p.ts = Date.now();
        sessionStorage.setItem(STORAGE_PENDING, JSON.stringify(p));
        if (hintCode) hintCode.textContent = p.code;
        if (banner) {
          banner.className = "auth-banner auth-banner--success";
          banner.textContent = "Wysłano nowy kod (symulacja).";
          banner.hidden = false;
        }
        setCooldown(60);
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#verify-code");
      clearFieldErrors(form);
      var val = (input.value || "").replace(/\D/g, "");
      if (val.length !== 6) {
        showFieldError(input, "Wpisz 6-cyfrowy kod.");
        return;
      }

      if (isSupabasePending) {
        window.AmiQAuth.verifyEmailOtp(pending.email, val).then(function (result) {
          if (!result.ok) {
            showFieldError(input, result.error);
            return;
          }
          sessionStorage.removeItem(STORAGE_PENDING);
          if (banner) {
            banner.className = "auth-banner auth-banner--success";
            banner.innerHTML = "Konto zweryfikowane. Za chwilę przejdziesz do startu konta…";
            banner.hidden = false;
          }
          setTimeout(function () {
            window.location.href = "konto-start.html";
          }, 1200);
        });
        return;
      }

      var p2 = JSON.parse(sessionStorage.getItem(STORAGE_PENDING) || "null");
      if (!p2 || val !== p2.code) {
        showFieldError(input, "Nieprawidłowy kod. Sprawdź skrzynkę lub wyślij kod ponownie.");
        return;
      }

      writeStoredUser({
        email: p2.email,
        password: p2.password,
        name: p2.name,
        verified: true,
        createdAt: Date.now()
      });
      sessionStorage.removeItem(STORAGE_PENDING);

      if (banner) {
        banner.className = "auth-banner auth-banner--success";
        banner.innerHTML =
          "Konto zweryfikowane. Za chwilę przejdziesz do startu konta…";
        banner.hidden = false;
      }
      setTimeout(function () {
        window.location.href = "konto-start.html";
      }, 1600);
    });
  }

  function initForgotForm() {
    var form = $("#form-forgot");
    if (!form) return;
    var result = $("#forgot-result");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors(form);
      var email = $("#forgot-email");
      if (!validateEmail(email.value)) {
        showFieldError(email, "Podaj prawidłowy adres e-mail.");
        return;
      }

      if (isLiveAuth()) {
        window.AmiQAuth.requestPasswordReset(email.value.trim().toLowerCase()).then(function (resetResult) {
          if (!resetResult.ok) {
            showFieldError(email, resetResult.error);
            return;
          }
          form.hidden = true;
          if (result) {
            result.hidden = false;
            result.innerHTML =
              '<p class="auth-banner auth-banner--success">Jeśli konto istnieje, wysłaliśmy link resetujący na <strong>' +
              email.value.trim() +
              "</strong>. Sprawdź także folder spam.</p>" +
              '<p class="auth-field__hint" style="margin-top:1rem;text-align:center">Link otworzy stronę ustawiania nowego hasła.</p>";
          }
        });
        return;
      }

      form.hidden = true;
      if (result) {
        result.hidden = false;
        result.innerHTML =
          '<p class="auth-banner auth-banner--success">Jeśli konto istnieje, wysłaliśmy link resetujący na <strong>' +
          email.value.trim() +
          '</strong>. Sprawdź także folder spam.</p>' +
          '<p class="auth-field__hint" style="margin-top:1rem;text-align:center">' +
          '<a class="auth-link-muted" href="reset-password.html">Symulacja (bez backendu): przejdź do ustawienia nowego hasła</a>' +
          "</p>" +
          '<p class="auth-field__hint" style="margin-top:0.5rem;text-align:center;opacity:0.85">W aplikacji produkcyjnej link wygeneruje serwer i wygaśnie po użyciu.</p>';
      }
    });
  }

  function initResetForm() {
    var form = $("#form-reset");
    if (!form) return;

    var pass = $("#reset-password");
    var pass2 = $("#reset-password2");
    var meter = $("#reset-strength");
    var label = $("#reset-strength-label");

    if (pass && meter) {
      pass.addEventListener("input", function () {
        updateStrengthMeter(pass, meter, label);
      });
      updateStrengthMeter(pass, meter, label);
    }

    var banner = $("#reset-banner");

    if (isLiveAuth()) {
      window.AmiQAuth.hasRecoverySession().then(function (hasSession) {
        if (hasSession || window.location.hash.indexOf("access_token") !== -1) {
          if (banner) {
            banner.className = "auth-banner auth-banner--success";
            banner.textContent = "Link jest aktywny — ustaw nowe hasło poniżej.";
            banner.hidden = false;
          }
          return;
        }
        if (banner) {
          banner.className = "auth-banner auth-banner--info";
          banner.textContent =
            "Otwórz link z wiadomości e-mail od AmiQPlace, aby ustawić nowe hasło. Ta strona działa tylko z ważnym linkiem resetu.";
          banner.hidden = false;
        }
        form.querySelector(".auth-submit").disabled = true;
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors(form);
      var sc = passwordScore(pass.value);
      if (sc < 3) {
        showFieldError(pass, "Hasło jest za słabe.");
        return;
      }
      if (pass.value !== pass2.value) {
        showFieldError(pass2, "Hasła muszą być identyczne.");
        return;
      }

      if (isLiveAuth()) {
        form.querySelector(".auth-submit").disabled = true;
        window.AmiQAuth.updatePassword(pass.value).then(function (result) {
          form.querySelector(".auth-submit").disabled = false;
          if (!result.ok) {
            if (banner) {
              banner.className = "auth-banner auth-banner--error";
              banner.textContent = result.error;
              banner.hidden = false;
            }
            return;
          }
          if (banner) {
            banner.className = "auth-banner auth-banner--success";
            banner.textContent = "Hasło zostało zmienione. Za chwilę przejdziesz do logowania.";
            banner.hidden = false;
          }
          form.querySelector(".auth-submit").disabled = true;
          setTimeout(function () {
            window.location.href = "Login.html?registered=1";
          }, 1400);
        });
        return;
      }

      var user = readStoredUser();
      if (user) {
        user.password = pass.value;
        writeStoredUser(user);
      }
      if (banner) {
        banner.className = "auth-banner auth-banner--success";
        banner.textContent = "Hasło zostało zmienione (symulacja). Możesz się zalogować.";
        banner.hidden = false;
      }
      form.querySelector(".auth-submit").disabled = true;
    });
  }

  function initLoginQueryBanner() {
    if (!window.location.search || window.location.search.indexOf("registered=1") === -1) return;
    var banner = $("#login-banner");
    if (!banner) return;
    banner.className = "auth-banner auth-banner--success";
    banner.textContent = "Rejestracja zakończona — zaloguj się swoim adresem e-mail i hasłem.";
    banner.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    initVerifyPage();
    initForgotForm();
    initResetForm();
    initLoginQueryBanner();
  });
})();
