// One blog post, after the layout of locize.com's posts, cut to what fits an open-source site (no sign-up boxes):
// the topic, meta line and title beside the cover; the key takeaways at the top of the text (or the lead, when a post
// has none); the page tools above the text and "On this page" in the third column, as on docs pages; at the end up
// to three related posts.
import { useData } from 'vike-react/useData'
import { PostMeta } from '../../../src/PostMeta.jsx'
import { CopyPage } from '../../../src/CopyPage.jsx'
import { StaticHtml } from '../../../src/StaticHtml.jsx'
import { Toc } from '../../../src/Toc.jsx'

export default function Page () {
  const { title, description, date, updated, tags, minutes, image, imageAlt, route, toc, takeaways, related } = useData()
  const showToc = toc.length > 2
  return (
    <article className='wrap post-page' data-pagefind-body>
      <header className='post-head'>
        <div>
          <div className='crumb' data-pagefind-ignore><a href='/blog'>Blog</a>{tags[0] && <> / {tags[0]}</>}</div>
          <h1>{title}</h1>
          <PostMeta date={date} updated={updated} minutes={minutes} />
        </div>
        {image && <img className='post-cover' src={image} alt={imageAlt} />}
      </header>
      <div className={showToc ? 'post-layout' : 'post-layout no-toc'}>
        <div className='doc post'>
          <div className='page-tools' data-pagefind-ignore><a href={`${route}.md`} rel='external'>View as Markdown</a><CopyPage md={`${route}.md`} /><a href='/blog/feed.xml' rel='external'>RSS</a></div>
          {showToc && <details className='toc-inline' data-pagefind-ignore><summary>On this page</summary><Toc toc={toc} /></details>}
          {!takeaways && description && <p className='lead'>{description}</p>}
          <StaticHtml />
          {related.length > 0 && (
            <section className='post-related' data-pagefind-ignore>
              <h2>More from the blog</h2>
              <div className='post-related-grid'>
                {related.map(p => (
                  <a key={p.route} className='post-card' href={p.route}>
                    {p.image && <img src={p.image} alt='' loading='lazy' />}
                    <div className='post-card-text'><h3>{p.title}</h3><p className='post-meta'><time dateTime={p.date}>{p.date}</time></p></div>
                  </a>
                ))}
              </div>
              <p><a href='/blog'>All posts</a></p>
            </section>
          )}
        </div>
        {showToc && <aside className='toc' data-pagefind-ignore><h5>On this page</h5><Toc toc={toc} /></aside>}
      </div>
    </article>
  )
}
