import { posts } from '../../../src/blog.js'

export default async () => (await posts()).map(p => p.route)
