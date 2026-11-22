// Refreshes content/facts.json, the snapshot the build falls back to without network.
import { writeFile } from 'node:fs/promises'
import { readFacts } from '../src/facts.js'

const f = await readFacts()
await writeFile('content/facts.json', JSON.stringify(f, null, 2) + '\n')
console.log(`content/facts.json as of ${f.asOf}`)
