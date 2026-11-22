// The privacy notice, from content/privacy.md. A filesystem route, so it wins over the docs catch-all route.
import { StaticHtml } from '../../src/StaticHtml.jsx'

export default function Page () {
  return <StaticHtml as='article' className='wrap doc page-narrow' />
}
