---
description: "Keys built at run time: which ones the extractor finds by itself, and how to tell it about the rest."
---

# Dynamic keys

Many "dynamic" keys need no configuration: the extractor resolves **finite** dynamic keys
with the TypeScript types and expands every possible variant:

```typescript
// Template literals with unions / ternaries / nullish coalescing:
// -> state.done.title + state.notDone.title
t(`state.${isDone ? 'done' : 'notDone'}.title`)
type Status = 'active' | 'inactive'
declare const status: Status
t(`status.${status}`)                 // -> status.active + status.inactive

// `as const` maps and arrays (also when imported from another file):
const KEYS = ['a', 'b'] as const
KEYS.map((k) => t(`item.${k}`))       // -> item.a + item.b
const MAP = { ok: 'result.ok', err: 'result.err' } as const
t(MAP[someCondition ? 'ok' : 'err'])  // -> result.ok + result.err

// Helper-function return types and `satisfies`-constrained values
```

Resolution is name-based across every scanned file, including through renaming
imports (`import { ResourceStatus as Status } from './types'`). Types declared by
a dependency work too, but only if you let the scan reach them. `node_modules` is
skipped unless an input pattern says otherwise:

```typescript
export default defineConfig({
  extract: {
    input: [
      'src/**/*.{ts,tsx}',
      // declaration file scanned for its types; a `.d.ts` holds no keys to
      // extract
      'node_modules/@acme/api-sdk/dist/*.d.ts',
    ],
  }
});
```

The same applies to a package that ships translatable sources: glob its files and
their keys are extracted like your own.

> **Careful with dependency types:** keys derived from them change when the dependency
> does. If `ResourceStatus` is an enum today and widens to `string` in the next release,
> the keys stop resolving and `removeUnusedKeys` (on by default) deletes them, during an
> `npm update` rather than in a diff you wrote. Consider copying the type into your own
> source instead and guarding it against drift, so a mismatch fails typecheck in CI
> rather than silently emptying a locale file:
>
> ```typescript
> type Equals<A, B> =
>   (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
> type Assert<T extends true> = T;
>
> // drop the `${}` when the upstream type is a string union rather than an enum
> type _driftGuard = Assert<Equals<LocalStatus, `${ResourceStatus}`>>;
> ```
>
> If you do read from `node_modules`, `preservePatterns` keeps the already-translated
> entries alive even when resolution stops producing them.

Only keys that are **truly runtime-dynamic** (e.g. built from API data) cannot
be statically resolved by any tool. For those, use `preservePatterns` to keep
the existing entries in your translation files:

```typescript
// Code like this:
const key = `user.${role}.permission`; // role comes from the server
t(key);

// With this config:
export default defineConfig({
  extract: {
    preservePatterns: ['user.*.permission']
  }
});

// Will preserve existing keys matching the pattern
```

## Comment-based extraction

Extract keys from comments for documentation or edge cases:

```javascript
// t('welcome.message', 'Welcome to our app!')
// t('user.greeting', { defaultValue: 'Hello!', ns: 'common' })
```

A commented template literal cannot name its keys, so it is not extracted. Instead it keeps the
existing keys it matches, even with `removeUnusedKeys`: `` // t(`QUARTER.${q}`) `` keeps `QUARTER.1`,
`QUARTER.2` and so on, while code can still add new `QUARTER.*` keys. Unlike `preservePatterns`, it
does not stop matching keys from being extracted.
