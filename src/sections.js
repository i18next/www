// The docs sections, in the order of the section bar. Safe for the browser
// (content.js adds the page lists at build time). oldHost: where GitBook served it.
export const SITE_URL = 'https://www.i18next.com'

export const SECTIONS = [
  // core: its README (GitBook's start page) moves to /introduction, the home page takes /.
  { id: 'core', title: 'i18next', base: '', readme: '/introduction', oldHost: 'www.i18next.com', github: 'https://github.com/i18next/i18next', repo: 'https://github.com/i18next/www/blob/main/content/core', description: 'The i18next core: setup, the t function, plurals, interpolation, namespaces, plugins and configuration.' },
  { id: 'react', title: 'react-i18next', base: '/react', oldHost: 'react.i18next.com', github: 'https://github.com/i18next/react-i18next', repo: 'https://github.com/i18next/www/blob/main/content/react', description: 'React bindings for i18next: useTranslation, Trans, SSR and TypeScript.' },
  { id: 'next', title: 'next-i18next', base: '/next', github: 'https://github.com/i18next/next-i18next', repo: 'https://github.com/i18next/www/blob/main/content/next', description: 'i18next for Next.js: the App Router, the Pages Router and both in one app.' },
  // next, cli and astro are written in this repo (content/<id>); core and react were imported from GitBook until the last import (2026-11-21) and are edited here since.
  { id: 'astro', title: 'Astro', base: '/astro', repo: 'https://github.com/i18next/www/blob/main/content/astro', description: 'Static Astro sites with plain i18next at build time, and i18next-cli with its Astro plugin.' },
  { id: 'cli', title: 'i18next-cli', base: '/cli', github: 'https://github.com/i18next/i18next-cli', repo: 'https://github.com/i18next/www/blob/main/content/cli', description: 'The command line tool for i18next: extract keys, report missing translations, lint, generate types.' }
]

// The section bar's last tab: the integrations beyond the five sections, a page of the core section.
export const MORE = { title: 'More', href: '/overview/supported-frameworks' }

export const sectionOf = path =>
  SECTIONS.find(s => s.base && (path === s.base || path.startsWith(`${s.base}/`))) ?? SECTIONS[0]
