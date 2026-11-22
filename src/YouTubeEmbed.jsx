// Consent-gated YouTube player, after locize.com's www (components/YouTubeEmbed.jsx): nothing loads
// from YouTube until the visitor accepts YouTube in the cookie settings; until then, a link.
// The docs page mounts it on each <div data-youtube> that src/gitbook.js writes for {% embed %}.
import { useEffect, useState } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'

export function YouTubeEmbed ({ id, start, url }) {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    // cc:onConsent fires on every page load with a valid choice, cc:onChange when it changes.
    const update = () => setAllowed(CookieConsent.acceptedService('youtube', 'analytics'))
    update()
    window.addEventListener('cc:onConsent', update)
    window.addEventListener('cc:onChange', update)
    return () => {
      window.removeEventListener('cc:onConsent', update)
      window.removeEventListener('cc:onChange', update)
    }
  }, [])

  if (allowed) {
    return (
      <div className='youtube-player'>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0${start ? `&start=${start}` : ''}`}
          title='YouTube video'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
          loading='lazy'
        />
      </div>
    )
  }
  return (
    <div className='youtube-consent'>
      <p>This video is hosted on YouTube. To watch it here, turn on "YouTube videos" under Analytics in the cookie settings.</p>
      <p>
        <a href={url} target='_blank' rel='noopener noreferrer'>Watch on YouTube</a>
        <button type='button' onClick={() => CookieConsent.showPreferences()}>Cookie settings</button>
      </p>
    </div>
  )
}
