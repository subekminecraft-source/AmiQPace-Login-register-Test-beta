/**
 * Skopiuj ten plik jako auth-config.js i uzupełnij dane z Supabase:
 * Dashboard → Project Settings → API → Project URL + anon public key
 *
 * W Supabase ustaw też:
 * Authentication → URL Configuration:
 *   Site URL: https://amiqplace.com (lub http://127.0.0.1:5500 na lokalne testy)
 *   Redirect URLs: https://amiqplace.com/auth-callback.html
 *                    https://amiqplace.com/reset-password.html
 *                    http://127.0.0.1:5500/auth-callback.html
 *                    http://127.0.0.1:5500/reset-password.html
 */
window.AmiQAuthConfig = {
  supabaseUrl: "https://TWOJ-PROJEKT.supabase.co",
  supabaseAnonKey: "TWOJ-ANON-KEY",
  /** false = stary tryb demo (localStorage). true = prawdziwe logowanie Supabase. */
  enabled: true
};
