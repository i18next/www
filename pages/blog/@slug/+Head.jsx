import { useData } from 'vike-react/useData'
import { SITE_URL } from '../../../src/sections.js'

export default function Head () {
  const { route } = useData()
  return (
    <>
      <link rel='canonical' href={SITE_URL + route} />
      <link rel='alternate' type='text/markdown' href={`${route}.md`} />
    </>
  )
}
