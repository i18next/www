// og:image for every page (vike-react writes it with twitter:card summary_large_image); the images are rendered
// by scripts/postbuild.js under /og/.
import { SITE_URL } from '../src/sections.js'

// The 404 page (one file for every missing address) takes the start page's card.
export default pageContext => `${SITE_URL}/og${pageContext.urlPathname === '/' || pageContext.is404 ? '/index' : pageContext.urlPathname.replace(/\/$/, '')}.png`
