// Date and reading time of a blog post, on the list and on the post.
export function PostMeta ({ date, updated, minutes }) {
  return <p className='post-meta'><time dateTime={date}>{date}</time>{updated && <>, updated <time dateTime={updated}>{updated}</time></>} · {minutes} min read</p>
}
