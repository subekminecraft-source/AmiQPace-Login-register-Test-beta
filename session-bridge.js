(function () {
  "use strict";

  var AUTH_KEYS = ["amiqplace_user", "amiqplace_trial_active", "amiqplace_plan"];

  function syncKey(key) {
    try {
      var sessionVal = sessionStorage.getItem(key);
      var localVal = localStorage.getItem(key);
      if (sessionVal && !localVal) {
        localStorage.setItem(key, sessionVal);
      }
      if (!sessionVal && localVal) {
        sessionStorage.setItem(key, localVal);
      }
      if (sessionVal && localVal && sessionVal !== localVal) {
        localStorage.setItem(key, sessionVal);
      }
    } catch (e) {}
  }

  AUTH_KEYS.forEach(syncKey);
})();
