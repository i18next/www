// gtag starts with every consent denied; src/cookieConsent.js loads GA only after the visitor accepts.
// A file, not an inline script, so the CSP needs no 'unsafe-inline' in script-src.
window.dataLayer = window.dataLayer || []
window.gtag = function () { window.dataLayer.push(arguments) }
window.gtag('consent', 'default', { analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', ad_storage: 'denied', wait_for_update: 500 })
