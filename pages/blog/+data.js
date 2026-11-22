import { posts } from '../../src/blog.js'

const card = ({ title, description, date, route, tags, minutes, image, imageAlt }) =>
  ({ title, description, date, route, tags, minutes, image: image ?? null, imageAlt: imageAlt ?? '' })

export const data = async () => ({ posts: (await posts()).map(card) })
