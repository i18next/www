// Takes the page's HTML out of `data` before Vike writes `data` into the page for hydration: the HTML is in the page
// already, and src/StaticHtml.jsx reads it back from there. Without this every page carried its text twice.
export function onBeforeRender (pageContext) {
  if (pageContext.data?.html === undefined) return
  const { html, ...data } = pageContext.data
  return { pageContext: { pageHtml: html, data } }
}
