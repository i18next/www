// A page's own HTML (docs text, posts, G's pages). The server renders it from the page's data; the browser takes it
// from the page as it arrived, so it does not travel a second time in the hydration data (pages/+onBeforeRender.js
// moves it out of `data`). Links are plain page loads (clientRouting: false), so the browser only ever hydrates.
import { useState } from 'react'
import { usePageContext } from 'vike-react/usePageContext'

export function StaticHtml ({ as: Tag = 'div', ...props }) {
  const { pageHtml } = usePageContext()
  const [html] = useState(() => pageHtml ?? document.querySelector('[data-static-html]')?.innerHTML ?? '')
  return <Tag {...props} data-static-html='' dangerouslySetInnerHTML={{ __html: html }} />
}
