// G's font (Newsreader in the bakery previews), self-hosted, and the page's .md.
// Vike passes this Head on to the pages below (@slug), so the alternate follows the address.
import { usePageContext } from 'vike-react/usePageContext'

export default function Head () {
  return (
    <>
      <link rel='stylesheet' href='/assets/fonts/fonts.css' />
      <link rel='alternate' type='text/markdown' href={`${usePageContext().urlPathname}.md`} />
    </>
  )
}
