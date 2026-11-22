import vikeReact from 'vike-react/config'

export default {
  extends: [vikeReact],
  prerender: true,
  // Plain page loads: every page is static HTML, and the browser takes a page's text from it (src/StaticHtml.jsx).
  clientRouting: false,
  passToClient: ['urlPathname'], // with Server Routing the browser does not get it otherwise (pages/+Layout.jsx)
  lang: 'en',
  title: 'i18next documentation',
  description: 'i18next, the internationalization framework for JavaScript: core, React, Next.js and CLI documentation.'
}
