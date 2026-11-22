// Consent banner from locize.com's www (src/cookieConsent.js): a bottom bar with
// equal-weight buttons, and GA4 loaded only after "Accept". GA_ID is the
// existing i18next.com property (stream "i18next - GA4", https://www.i18next.com).
import { useEffect, useState } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

const GA_ID = 'G-EHMLRHM6N4'

function loadGoogleAnalytics () {
  if (window.gtmScriptLoaded) return
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    console.log(`[consent] analytics accepted; GA4 (${GA_ID}) would load here`)
    return
  }
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  script.onload = () => {
    // Consent before config, then the page_view (links are plain page loads, so this runs on every page).
    window.gtag('consent', 'update', { analytics_storage: 'granted' })
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false })
    window.gtag('event', 'page_view', { page_title: document.title, page_location: location.href, page_path: location.pathname })
    window.gtmScriptLoaded = true
  }
  document.head.appendChild(script)
}

export function useCookieConsent () {
  const [consent, setConsent] = useState(null)
  useEffect(() => {
    if (window.__cookieConsentInitialized) {
      setTimeout(() => setConsent(CookieConsent), 0)
      return
    }
    window.__cookieConsentInitialized = true
    CookieConsent.run({
      cookie: { name: 'cc_cookie_i18next' },
      guiOptions: {
        consentModal: { layout: 'bar inline', position: 'bottom', equalWeightButtons: true, flipButtons: true },
        preferencesModal: { layout: 'box', position: 'right', equalWeightButtons: true, flipButtons: true }
      },
      categories: {
        necessary: { readOnly: true, enabled: true },
        analytics: {
          autoClear: { cookies: [{ name: /^(_ga|_gid)/ }] },
          services: {
            ga: {
              label: 'Google Analytics',
              onAccept: loadGoogleAnalytics,
              onReject: () => window.gtag?.('consent', 'update', { analytics_storage: 'denied' }),
              cookies: [{ name: /^(_ga|_gid)/ }]
            }
          }
        }
      },
      language: {
        default: 'en',
        translations: {
          en: {
            // Says what needs consent: Google Analytics, the one thing that does. A video of our own brings back a
            // service `youtube` here (src/YouTubeEmbed.jsx reads it) and its sentence.
            consentModal: {
              title: 'Google Analytics only with your consent',
              description: 'It shows us which pages help.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences',
              footer: '<a href="/privacy">Privacy</a>'
            },
            preferencesModal: {
              title: 'Consent preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                { title: 'Strictly necessary <span class="pm__badge">Always enabled</span>', description: 'Remembers your choice in this banner.', linkedCategory: 'necessary' },
                { title: 'Analytics', description: 'Google Analytics 4 (which pages are read, anonymised).', linkedCategory: 'analytics' },
                { title: 'More information', description: 'See the <a href="/privacy">privacy notice</a>.' }
              ]
            }
          }
        }
      }
    }).then(() => setConsent(CookieConsent))
  }, [])
  return consent
}
