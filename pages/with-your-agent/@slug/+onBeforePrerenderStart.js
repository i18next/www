import { agentPages } from '../../../src/agentPages.js'

export default async () => (await agentPages()).map(p => `/with-your-agent/${p.slug}`)
