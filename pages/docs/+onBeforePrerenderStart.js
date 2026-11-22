import { site } from '../../src/content.js'

export default async () => (await site()).pages.map(p => p.route)
