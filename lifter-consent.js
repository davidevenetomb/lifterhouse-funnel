/*!
 * Lifter House — Cookie Consent + Meta Pixel + Google Analytics 4
 * - Carica Meta Pixel e GA4 sempre (in stato "revoke" / "denied")
 * - Grant / Revoke in base al consenso utente
 * - Banner: Accetta tutti / Rifiuta tutti / Personalizza
 * - Consenso salvato in localStorage per 12 mesi
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'lh_cookie_consent';
  var PIXEL_ID = '1373183478187151';
  var GA_ID = 'G-X7F175813L';

  // ---------- Storage helpers ----------
  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      // Expire dopo 12 mesi
      if (obj && obj.ts && (Date.now() - obj.ts) > 365 * 24 * 3600 * 1000) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return obj;
    } catch (e) { return null; }
  }

  function writeConsent(obj) {
    obj.ts = Date.now();
    obj.v = 1;
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  // ---------- Meta Pixel (loader sempre attivo, in revoke finché non consente) ----------
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  // TEST MODE: banner disattivato, consenso auto-grant.
  // Per ripristinare la conformità GDPR, ri-attivare lo snippet originale
  // (fbq('consent','revoke') + banner).
  fbq('init', PIXEL_ID);
  fbq('consent', 'grant');
  fbq('track', 'PageView');

  // ---------- Google Analytics 4 (gtag.js) ----------
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };

  // Consent Mode v2 — default denied (GDPR). Sarà aggiornato sotto in base al consenso.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  gtag('js', new Date());
  gtag('config', GA_ID);

  // TEST MODE: auto-grant (coerente con Meta Pixel sopra).
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted'
  });

  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(gaScript);

  // ---------- Banner UI ----------
  var BANNER_CSS = [
    '#lh-cookie-banner{position:fixed;bottom:1rem;left:1rem;right:1rem;max-width:560px;margin:0 auto;background:#0f1521;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:1.1rem 1.25rem;z-index:99999;font-family:"DM Sans",system-ui,sans-serif;color:#f0f4fa;box-shadow:0 10px 40px rgba(0,0,0,0.5)}',
    '#lh-cookie-banner h4{font-family:"Poppins",sans-serif;font-size:1rem;margin:0 0 0.35rem;font-weight:700;color:#f0f4fa}',
    '#lh-cookie-banner p{font-size:0.85rem;color:#c8d3e3;line-height:1.55;margin:0 0 0.75rem}',
    '#lh-cookie-banner p a{color:#3d9fe8;text-decoration:underline}',
    '#lh-cookie-banner .lh-cb-btns{display:flex;flex-wrap:wrap;gap:0.5rem}',
    '#lh-cookie-banner button{font-family:inherit;font-size:0.78rem;font-weight:600;padding:0.6rem 1rem;border-radius:9999px;cursor:pointer;border:1px solid rgba(255,255,255,0.22);background:transparent;color:#f0f4fa;text-transform:uppercase;letter-spacing:0.04em;line-height:1}',
    '#lh-cookie-banner button.primary{background:#3d9fe8;border-color:#3d9fe8;color:#fff}',
    '#lh-cookie-banner button.primary:hover{background:#2280c8}',
    '#lh-cookie-banner button:hover{border-color:rgba(255,255,255,0.4)}',
    '#lh-cookie-banner .lh-cb-prefs{display:none;margin:0.75rem 0;padding:0.75rem 0.9rem;background:#1e2840;border-radius:8px}',
    '#lh-cookie-banner .lh-cb-prefs.open{display:block}',
    '#lh-cookie-banner .lh-cb-row{display:flex;align-items:flex-start;gap:0.6rem;padding:0.35rem 0;font-size:0.85rem}',
    '#lh-cookie-banner .lh-cb-row input[type=checkbox]{width:18px;height:18px;margin-top:2px;flex-shrink:0}',
    '#lh-cookie-banner .lh-cb-row label{flex:1;color:#f0f4fa;font-weight:600}',
    '#lh-cookie-banner .lh-cb-row small{display:block;color:#8fa3bc;font-size:0.72rem;font-weight:400;margin-top:0.1rem;line-height:1.45}',
    '@media (max-width:500px){#lh-cookie-banner{left:0.5rem;right:0.5rem;bottom:0.5rem;padding:0.9rem 1rem}#lh-cookie-banner button{flex:1;min-width:48%}}'
  ].join('');

  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    var s = document.createElement('style');
    s.id = 'lh-cookie-banner-css';
    s.innerHTML = BANNER_CSS;
    document.head.appendChild(s);
    stylesInjected = true;
  }

  function injectBanner() {
    if (document.getElementById('lh-cookie-banner')) return;
    injectStyles();
    var existing = readConsent();
    var el = document.createElement('div');
    el.id = 'lh-cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Preferenze cookie');
    el.innerHTML =
      '<h4>Rispettiamo la tua privacy</h4>' +
      '<p>Usiamo cookie tecnici (necessari) e, previo tuo consenso, cookie di marketing per misurare l\'efficacia delle nostre campagne pubblicitarie. Puoi accettare, rifiutare o personalizzare. ' +
      '<a href="cookie-policy.html" target="_blank">Scopri di più</a></p>' +
      '<div class="lh-cb-prefs" id="lh-cb-prefs">' +
        '<div class="lh-cb-row">' +
          '<input type="checkbox" id="lh-cb-tech" checked disabled>' +
          '<label for="lh-cb-tech">Cookie tecnici<small>Sempre attivi — necessari al funzionamento del sito.</small></label>' +
        '</div>' +
        '<div class="lh-cb-row">' +
          '<input type="checkbox" id="lh-cb-mkt"' + (existing && existing.marketing ? ' checked' : '') + '>' +
          '<label for="lh-cb-mkt">Cookie di marketing e analytics<small>Meta Pixel + CAPI e Google Analytics 4 per misurare traffico e campagne. Richiede il tuo consenso.</small></label>' +
        '</div>' +
      '</div>' +
      '<div class="lh-cb-btns">' +
        '<button type="button" class="primary" id="lh-cb-accept">Accetta tutti</button>' +
        '<button type="button" id="lh-cb-reject">Rifiuta tutti</button>' +
        '<button type="button" id="lh-cb-custom">Personalizza</button>' +
        '<button type="button" id="lh-cb-save" style="display:none">Salva</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('lh-cb-accept').addEventListener('click', function () {
      applyConsent({ marketing: true });
      removeBanner();
    });
    document.getElementById('lh-cb-reject').addEventListener('click', function () {
      applyConsent({ marketing: false });
      removeBanner();
    });
    document.getElementById('lh-cb-custom').addEventListener('click', function () {
      document.getElementById('lh-cb-prefs').classList.add('open');
      document.getElementById('lh-cb-save').style.display = 'inline-block';
      this.style.display = 'none';
    });
    document.getElementById('lh-cb-save').addEventListener('click', function () {
      var mkt = !!document.getElementById('lh-cb-mkt').checked;
      applyConsent({ marketing: mkt });
      removeBanner();
    });
  }

  function removeBanner() {
    var el = document.getElementById('lh-cookie-banner');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function applyConsent(c) {
    writeConsent(c);
    if (window.fbq) {
      if (c.marketing) fbq('consent', 'grant');
      else fbq('consent', 'revoke');
    }
    if (window.gtag) {
      var state = c.marketing ? 'granted' : 'denied';
      gtag('consent', 'update', {
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        analytics_storage: state
      });
    }
  }

  // ---------- Public API ----------
  window.LifterConsent = {
    reopen: function () {
      removeBanner();
      if (document.body) injectBanner();
      else document.addEventListener('DOMContentLoaded', injectBanner);
    },
    get: readConsent,
    update: function (c) { applyConsent(c); }
  };

  // ---------- Boot ----------
  // TEST MODE: banner disattivato. Per riattivarlo, scommentare la chiamata sotto.
  // function maybeShow() { if (!readConsent()) injectBanner(); }
  // if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeShow);
  // else maybeShow();

  // Helper per Lead event (usato da index.html)
  window.lhGenEventId = function () {
    return 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  };
  window.lhGetCookie = function (name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  };
})();
