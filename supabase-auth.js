(function () {
  "use strict";

  var STORAGE_USER = "amiqplace_user";
  var STORAGE_PROVIDER = "amiqplace_auth_provider";

  function getConfig() {
    return window.AmiQAuthConfig || {};
  }

  function isConfigured() {
    var cfg = getConfig();
    return !!(
      cfg.enabled &&
      cfg.supabaseUrl &&
      cfg.supabaseAnonKey &&
      window.supabase &&
      typeof window.supabase.createClient === "function"
    );
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!getClient._instance) {
      var cfg = getConfig();
      getClient._instance = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        }
      });
    }
    return getClient._instance;
  }

  function mapUser(sessionUser) {
    if (!sessionUser) return null;
    var meta = sessionUser.user_metadata || {};
    return {
      id: sessionUser.id,
      email: sessionUser.email || "",
      name: meta.full_name || meta.name || "",
      verified: !!(sessionUser.email_confirmed_at || sessionUser.confirmed_at),
      createdAt: sessionUser.created_at ? Date.parse(sessionUser.created_at) : Date.now(),
      provider: "supabase"
    };
  }

  function persistUser(user, remember) {
    if (!user) return;
    var payload = JSON.stringify(user);
    sessionStorage.setItem(STORAGE_USER, payload);
    sessionStorage.setItem(STORAGE_PROVIDER, "supabase");
    try {
      if (remember !== false) {
        localStorage.setItem(STORAGE_USER, payload);
        localStorage.setItem(STORAGE_PROVIDER, "supabase");
      }
    } catch (e) {}
  }

  function clearStoredUser() {
    sessionStorage.removeItem(STORAGE_USER);
    sessionStorage.removeItem(STORAGE_PROVIDER);
    try {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_PROVIDER);
    } catch (e2) {}
  }

  function syncSessionToStorage(session, remember) {
    var mapped = mapUser(session && session.user);
    if (mapped) {
      persistUser(mapped, remember);
    }
    return mapped;
  }

  function getRedirectBase() {
    if (window.location.protocol === "file:") {
      return "";
    }
    return window.location.origin;
  }

  function authCallbackUrl() {
    var base = getRedirectBase();
    return base ? base + "/auth-callback.html" : "auth-callback.html";
  }

  function resetPasswordUrl() {
    var base = getRedirectBase();
    return base ? base + "/reset-password.html" : "reset-password.html";
  }

  function translateError(message) {
    var msg = String(message || "");
    if (/invalid login credentials/i.test(msg)) {
      return "Nieprawidłowy e-mail lub hasło.";
    }
    if (/email not confirmed/i.test(msg)) {
      return "Potwierdź adres e-mail — sprawdź skrzynkę lub wpisz kod z wiadomości.";
    }
    if (/user already registered/i.test(msg)) {
      return "Konto z tym adresem e-mail już istnieje. Zaloguj się lub zresetuj hasło.";
    }
    if (/password should be at least/i.test(msg)) {
      return "Hasło jest za krótkie (minimum 6 znaków w Supabase).";
    }
    if (/rate limit/i.test(msg)) {
      return "Za dużo prób — odczekaj chwilę i spróbuj ponownie.";
    }
    return msg || "Wystąpił błąd logowania. Spróbuj ponownie.";
  }

  window.AmiQAuth = {
    isLive: isConfigured,

    getClient: getClient,

    mapUser: mapUser,

    persistUser: persistUser,

    clearStoredUser: clearStoredUser,

    translateError: translateError,

    getSession: function () {
      var client = getClient();
      if (!client) return Promise.resolve({ session: null, user: null });
      return client.auth.getSession().then(function (result) {
        var user = syncSessionToStorage(result.data.session, true);
        return { session: result.data.session, user: user, error: result.error };
      });
    },

    signIn: function (email, password, remember) {
      var client = getClient();
      if (!client) {
        return Promise.resolve({ ok: false, error: "Auth nie jest skonfigurowany." });
      }
      return client.auth
        .signInWithPassword({ email: email, password: password })
        .then(function (result) {
          if (result.error) {
            return { ok: false, error: translateError(result.error.message) };
          }
          var user = syncSessionToStorage(result.data.session, remember);
          return { ok: true, user: user, session: result.data.session };
        });
    },

    signUp: function (email, password, name) {
      var client = getClient();
      if (!client) {
        return Promise.resolve({ ok: false, error: "Auth nie jest skonfigurowany." });
      }
      return client.auth
        .signUp({
          email: email,
          password: password,
          options: {
            data: { full_name: name },
            emailRedirectTo: authCallbackUrl()
          }
        })
        .then(function (result) {
          if (result.error) {
            return { ok: false, error: translateError(result.error.message) };
          }
          var needsConfirm = !result.data.session;
          if (result.data.session) {
            syncSessionToStorage(result.data.session, true);
          }
          return {
            ok: true,
            needsConfirm: needsConfirm,
            user: mapUser(result.data.user),
            session: result.data.session
          };
        });
    },

    resendSignup: function (email) {
      var client = getClient();
      if (!client) return Promise.resolve({ ok: false, error: "Auth nie jest skonfigurowany." });
      return client.auth.resend({ type: "signup", email: email }).then(function (result) {
        if (result.error) {
          return { ok: false, error: translateError(result.error.message) };
        }
        return { ok: true };
      });
    },

    verifyEmailOtp: function (email, token, otpType) {
      var client = getClient();
      if (!client) return Promise.resolve({ ok: false, error: "Auth nie jest skonfigurowany." });
      return client.auth
        .verifyOtp({ email: email, token: token, type: otpType || "signup" })
        .then(function (result) {
        if (result.error) {
          return { ok: false, error: translateError(result.error.message) };
        }
        var user = syncSessionToStorage(result.data.session, true);
        return { ok: true, user: user, session: result.data.session };
      });
    },

    requestPasswordReset: function (email) {
      var client = getClient();
      if (!client) return Promise.resolve({ ok: false, error: "Auth nie jest skonfigurowany." });
      return client.auth.resetPasswordForEmail(email, { redirectTo: resetPasswordUrl() }).then(function (result) {
        if (result.error) {
          return { ok: false, error: translateError(result.error.message) };
        }
        return { ok: true };
      });
    },

    updatePassword: function (password) {
      var client = getClient();
      if (!client) return Promise.resolve({ ok: false, error: "Auth nie jest skonfigurowany." });
      return client.auth.updateUser({ password: password }).then(function (result) {
        if (result.error) {
          return { ok: false, error: translateError(result.error.message) };
        }
        if (result.data.user) {
          syncSessionToStorage({ user: result.data.user }, true);
        }
        return { ok: true };
      });
    },

    signOut: function () {
      var client = getClient();
      clearStoredUser();
      if (!client) return Promise.resolve();
      return client.auth.signOut().catch(function () {});
    },

    handleAuthCallback: function () {
      var client = getClient();
      if (!client) return Promise.resolve({ ok: false });
      return client.auth.getSession().then(function (result) {
        if (result.error || !result.data.session) {
          return { ok: false, error: result.error };
        }
        syncSessionToStorage(result.data.session, true);
        return { ok: true, user: mapUser(result.data.session.user) };
      });
    },

    hasRecoverySession: function () {
      var client = getClient();
      if (!client) return Promise.resolve(false);
      return client.auth.getSession().then(function (result) {
        return !!(result.data.session && result.data.session.user);
      });
    }
  };
})();
