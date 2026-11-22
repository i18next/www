import { readFile } from 'node:fs/promises'
import { withoutComments } from '../../src/agentPages.js'

export const data = async () => ({ route: '/with-your-agent', html: withoutComments(await readFile('content/with-your-agent.html', 'utf8')) })
