// The blog: the newest post large, the others as cards. In G's style.
import { useData } from 'vike-react/useData'
import { PostMeta } from '../../src/PostMeta.jsx'

// A date in a teaser stands in <time>, as in the post.
const withDates = text => text.split(/(\d{4}-\d{2}-\d{2})/).map((part, i) => i % 2 ? <time key={i} dateTime={part}>{part}</time> : part)

function Card ({ p, featured }) {
  return (
    <a className={`post-card${featured ? ' featured' : ''}`} href={p.route}>
      {p.image && <img src={p.image} alt={p.imageAlt} loading={featured ? 'eager' : 'lazy'} />}
      <div className='post-card-text'>
        {p.tags[0] && <p className='post-topic'>{p.tags[0]}</p>}
        <h2>{p.title}</h2>
        {p.description && <p className='post-teaser'>{withDates(p.description)}</p>}
        <PostMeta date={p.date} minutes={p.minutes} />
      </div>
    </a>
  )
}

export default function Page () {
  const [first, ...rest] = useData().posts
  return (
    <div className='wrap blog'>
      <header className='blog-head'>
        <h1>Blog</h1>
        <p className='lead'>Technical posts about i18next: releases, guides and what is coming. <a href='/blog/feed.xml' rel='external'>RSS</a></p>
      </header>
      {first && <Card p={first} featured />}
      {rest.length > 0 && <div className='post-grid'>{rest.map(p => <Card key={p.route} p={p} />)}</div>}
    </div>
  )
}
