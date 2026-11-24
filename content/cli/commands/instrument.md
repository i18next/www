---
description: "Wrap texts written into the code in t() calls, as a first pass you review."
---

# instrument

Scans your source code for hardcoded user-facing strings and instruments them with i18next translation calls. This is useful for adding i18next instrumentation to an existing codebase that wasn't built with internationalization in mind.

{% hint style="warning" %}
`instrument` is a first pass that works from heuristics: it misses some texts and wraps some strings that are not texts. Review every change before you commit it.
{% endhint %}

```bash
npx i18next-cli instrument
```

## Options

- `--dry-run`: Preview changes without writing files to disk: each text with the key it would get, by file
- `--interactive`: Prompt for approval of each candidate string
- `--namespace <ns>`: Target a specific namespace for extracted keys
- `-q, --quiet`: Suppress spinner and output

## What it transforms

The `instrument` command detects five types of transformations:

1. **Simple string → `t()` call:**
   ```javascript
   // Before
   const msg = 'Welcome back';

   // After
   const msg = t('welcomeBack', 'Welcome back');
   ```

2. **Template literal (static only) → `t()` call:**
   ```javascript
   // Before
   const msg = `Welcome back`;

   // After
   const msg = t('welcomeBack', 'Welcome back');
   ```
   With a value inside, the value becomes a placeholder: `` `Hello ${name}` `` becomes
   `t('helloName', 'Hello {{name}}', { name })`. A literal with no word around its values (`` `${name}` ``) stays.

3. **JSX text → JSX expression with `t()`:**
   ```jsx
   // Before
   <h1>Welcome back</h1>

   // After
   <h1>{t('welcomeBack', 'Welcome back')}</h1>
   ```

4. **JSX mixed content → `<Trans>` component:**
   ```jsx
   // Before
   <p>Click <a href="/docs">here</a> to continue</p>

   // After
   <p>
     <Trans i18nKey="clickHereToContinue">
       Click <a href="/docs">here</a> to continue
     </Trans>
   </p>
   ```
   A link or text component whose only children are text (`<Link to="/docs">here</Link>`, `<Text.Strong>`) and
   `{' '}` stay in the sentence too; a button or an icon does not. The key is made from the words, and the
   `i18nKey` takes the quotes the file's JSX attributes use.

5. **Plurals → one `t()` with `count`:** a `count === 1 ? … : …` ternary, or a call of a plural helper named
   `plural`, `pluralize` or `pluralise` that takes `(count, one, other)`, also inside a template literal. `#` in
   a form stands for the number, as in ICU:
   ```javascript
   // Before
   `${n} ${plural(n, 'key', 'keys')} unused`
   plural(files.length, '# file', '# files')

   // After
   t('countKeysUnused', {
     defaultValue_one: '{{count}} key unused',
     defaultValue_other: '{{count}} keys unused',
     count: n
   })
   t('countFiles', {
     defaultValue_one: '{{count}} file',
     defaultValue_other: '{{count}} files',
     count: files.length
   })
   ```
   Once every call of an imported helper is rewritten, its import goes.

A sentence stays whole around a value: a variable, a property, a string or number formatted from one
(`{items.join(', ')}`, `{n.toLocaleString()}`, `{format.date(d)}`), a choice between such values. A variable that
holds JSX (`const link = <Link …>`) and `children` are elements, never a placeholder (a `t()` value shows an element
as `[object Object]`): the text stops at them. A placeholder is
named after what it shows: `` `Last login ${format.date(user.lastLogin)}` `` becomes `'Last login {{lastLogin}}'`;
the same expression twice is one placeholder, and a name taken already goes to what the value is of:
`` `Changes the plan of ${project.name} to ${name(plan)}` `` becomes `'Changes the plan of {{name}} to {{plan}}'`.
The words in a placeholder's value are texts of their own: `` `Search ${name || 'items'}…` `` becomes
`t('searchName', 'Search {{name}}…', { name: name || t('items', 'items') })`. A template literal with one optional part
becomes two texts: `` `uses AI tokens${left ? `, ${left} left` : ''}` `` becomes
`(left ? t('usesAiTokensLeft', 'uses AI tokens, {{left}} left', { left }) : t('usesAiTokens', 'uses AI tokens'))`. A key keeps the first words of a long text (at most 40 characters,
no `_`, which i18next reads as a plural or context suffix), and a key the code uses already is never reused for
another text nor made the parent of nested ones: `Tenants` next to an existing `t('tenants.title')` gets `tenants2`.

What JSX shows is text, a single word too: JSX text (as it renders: lines joined, `&apos;` decoded), a
translatable attribute (`title`, `aria-label`, `data-tip`, …) and either branch of a choice in one
(`data-tip={open ? 'Collapse' : 'Expand'}`), and a string an element renders from an
expression (`{busy ? 'saving' : 'saved'}`, `{name || 'unnamed'}`). When one branch of a ternary is text, the
other string branch is too, and so are the sibling phrases of a text in an object of strings (`{ ht: 'by human',
tm: 'by translation memory' }`; not a single word, nor an `id`, `icon` or `className`). A component's prop is text, a single word too, when its name is or ends in `label`,
`title` or `message` (`saveLabel='set'`, `switchLabel`; not a flag such as `showTitle`), when it names a button's label
the other way round (`labelConfirm`, `labelCancel`), and the `text` of a component named for text (`<FieldLabel
text='Scopes' />`, `<FitTitle text=…>`). Any other prop is text when its value reads as a sentence: ending like one,
or starting with a capital and going on in lower case (`empty='No projects yet.'`, `tip='Copy snippet'`); not a name in
capitals (`fontFamily='Helvetica Neue'`, `eventName='Sign Up Clicked'`), a mode (`tooltip='off'`) or a command
(`text='npm install i18next'`). So are a text property's value, a single word too (`{ value: '', label: 'has' }`; not
a `name`), and what a call that sets a title gets (`useDocumentTitle('Projects')`, `setTitle(…)`; not
`getPageTitle('dashboard')`). A string in a TypeScript type is never text (`useState<{ label: 'asc' | 'desc' }>()`).

## Namespace targeting

Use `--namespace <ns>` to direct extracted keys into a specific namespace. When a non-default namespace is specified:
- React components use `useTranslation('<ns>')` with clean keys
- Non-component code uses `i18next.t('key', 'default', { ns: '<ns>' })`
- In `--interactive` mode you are prompted for the target namespace

```bash
npx i18next-cli instrument --namespace common
```

## Custom scorer hook

Override the built-in confidence heuristic via `extract.instrumentScorer` in your config. The function receives each candidate string and its context, and can:
- Return a number (0 to 1) to override the confidence score
- Return `null` to force-skip the candidate
- Return `undefined` to fall back to the built-in heuristic

```typescript
export default defineConfig({
  // ...
  extract: {
    // ...
    instrumentScorer: (content, { file, code, beforeContext, afterContext }) => {
      // Skip strings that belong to your analytics domain
      if (content.startsWith('track_')) return null;
      // Boost strings in your UI layer
      if (file.includes('/components/')) return 0.95;
      // Fall back to built-in detection for everything else
      return undefined;
    }
  }
});
```

## What it skips (by design)

The instrumenter uses confidence heuristics to avoid transforming:
- Test files (`*.test.*`, `*.spec.*`), stories (`*.stories.*`, `*.story.*`, `*.storybook.*`) and the folders
  `__tests__`, `__mocks__`, `__fixtures__`; other fixture folders go into `extract.ignore`
- Empty strings and single characters
- Pure numbers and numeric IDs
- URL strings and file paths
- CSS class names and technical identifiers
- Developer-facing error codes (all-caps patterns like `ERROR_NOT_FOUND`)
- `console.*` calls, everything in them, and variables used only there (a log line built beforehand); the same for
  texts that only build data: a URL part (`encodeURIComponent`, a `mailto:` body), a file's content (`new Blob([…])`,
  `new File()`, `saveAs()`, `fs.writeFile()`, a zip's `.file(name, data)`), also through variables
  (`const body = intro + details`, then `encodeURIComponent(body)`)
- Object keys and computed keys, compared strings and `case` values; and a string the file also uses as data
  (compared, an `id`/`key`/`value`/`type`/`code`, an entry of an `order`/`ids`/`values` list or of an `ignore`
  list, one pushed into it too: `ignore.push('Failed to fetch')`), everywhere in that
  file unless an element renders it or it is an attribute's value: a facet's `of()` returning `'no 2FA'` keeps
  matching `order: ['2FA', 'no 2FA']`
- Prompts for a language model: the functions, variables and properties named like `getSystemPrompt`,
  `userPrompt` or `aiAssistantPrompt` (a translated prompt changes what the model does)
- Analytics event names (`track`, `trackEvent`, `logEvent`, `capture`, `identify`, `gtag`), event names (`emit`,
  `on`), log and error-report calls (`logger.*`, `Sentry.*`), `new Error()` and `RegExp` arguments (errors are for
  developers; show users a text of your own), format patterns (`dayjs(d).format('DD MMM YYYY')`)
- Icon ligatures: the content of an element named `…Icon` or with a `material-icons`/`material-symbols` class (its
  `aria-label` and `data-tip` are text)
- CSS values (`var(--brand)`, `inset 0 0 5px 1px var(--shadow)`), strings in a `classes`/`style` variable, and
  everything under a `className`, `classNames`, `classes` or `style` property (`classNames: { container: () => 'btn' }`)
- Strings a text is compared with or searched for (`msg.includes('not found')`, `split`, `replace`, …),
  selectors (`querySelector`, `closest`, also called optionally: `el?.querySelector('h1, h2')`), attribute and
  storage names (`getAttribute`, `setItem`, …)
- camelCase identifiers (`aiReview`), rules and key paths (`required|min:2`), strings without a letter (` / `, or
  only a component's own placeholder: `'"{name}",'`), a region code with acronyms (`EU VAT`, `CA GST/HST`; a phrase or
  a word in capitals, `SIGN IN` or `FAQ`, stays text), code snippets shown as text (several lines of code or shell commands)
- The content of `<code>`, `<script>` and `<style>` (and of `extract.ignoredTags`); inside a sentence they stay
  part of its `<Trans>`
- HTML attribute values that appear technical (which attributes hold text can be set per element, see [Translatable attributes per element](../configuration.md#translatable-attributes-per-element)); the JSX and functions inside such an attribute (`action={<Button>Change</Button>}`, `onClick={() => notify('Copied')}`) are checked as anywhere else
- Template literals with no word besides their expressions: ids, paths, keys, language codes and class names
  built in code (`` `${projectId}-${version}` ``, `` `weight_${code}` ``, `` `${baseUrl}/api/${id}` ``,
  `` `zh-${country}` ``); and values of technical properties (`` { 'Authorization': `Bearer ${token}` } ``,
  `url`, `id`, `type`, `code`, `className`, `format`, `transition`, `event`, `font`, `shortcut`, …), and a literal
  kept as its type (`'on' as const`)
- Strings already inside `t()` calls or `<Trans>`, `<IcuTrans>` and their `…WithoutContext` components (their
  `values` too), including the project's own `extract.functions` and `extract.transComponents`
- **Module-scope strings that cannot wait for their use**: a constant (`const TITLE = 'Projects'`), an entry of an
  array of strings, a value computed again on every read (a call, `` `${n++}` ``, an array), a property of an object
  passed to a call that may read it at once (`register({ title: '…' })`) or kept to a type with `satisfies`, the texts
  of an object the file changes (`PAGE.title = x`), and of a variable that code running at import reads, in the same
  file (also in a function or class called or created at module scope) or in another one
  (`Object.fromEntries(ROLES.map(…))` at module scope). The warning names each with its lines. A `t()` call there would be evaluated once, when the module is first
  imported: before i18next is initialized it returns an empty string, and it never runs again when the language
  changes. Move the text into a component, or expose the registry as a hook that calls `useTranslation()` internally:
  ```ts
  export const useSettingsSections = () => {
    const { t } = useTranslation()
    return [{ id: 'appearance', label: t('appearance', 'Appearance') }]
  }
  ```

## Module scope: translated when used

Code outside a function runs once, when the module is imported (so does the callback of a `.map()` there). Its
texts are translated when they are used instead:

- **JSX text becomes a `<Trans>`**, which translates when it renders and renders again when the language changes:
  `const NEWS = [{ content: <p>Suggested terms from your translations.</p> }]` keeps its element with
  `<p><Trans i18nKey="…">Suggested terms from your translations.</Trans></p>` in it. Not inside `<option>`, `<title>`
  or `<textarea>`, which take plain text only, nor in a Suspense `fallback`, which must not wait for the
  translations itself.
- **An object property's value is read by a getter**, each time it is used: a string, a template of names and
  properties, a choice between them, or an element:
  ```ts
  export const SETTINGS_SECTIONS = [
    { id: 'appearance', get label () { return i18next.t('appearance', 'Appearance') } },
  ]
  ```
  Code that reads `SETTINGS_SECTIONS[0].label` stays as it is. A map of texts keyed by code (`{ 'error.notFound':
  'Nothing found.' }`) works the same way.

What to look at in the review (`--dry-run` marks each getter "a getter: read when used"):

- A map whose values are **data that is sent or stored**, not shown (the text of a record a server keeps), must stay
  as it was: undo the getters there, or skip the file with `extract.ignore`.
- A getter read while modules are still being imported gets an empty string from i18next. The reads the scan sees
  (module-scope code of every file it instruments) keep their texts; a read it cannot see (a library that copies the
  object when it is set up) is yours to check. A component that reads a getter without a `t` of its own shows a new
  language once its parent renders again, as with every `i18next.t()` outside a component.
- Assigning to such a property from another file (`SETTINGS_SECTIONS[0].label = 'x'`) fails: a getter has no setter.
  An object the same file changes keeps its values.

## Auto-injection

When transformations are applied, the command automatically:
- Injects `import { useTranslation } from 'react-i18next'` in React files (or `import i18next from 'i18next'` for non-React files)
- Injects `const { t } = useTranslation()` into each React function component that contains transformed strings (an arrow component with an expression body, `() => <p>…</p>`, gets a block for it), unless it has a `t` already (a prop, or a hook from a module that re-exports it), and adds `t` to the dependencies of a `useMemo` or `useCallback` whose callback now calls it
- Places the imports after the file's import declarations and directives (`'use client'` stays first; never inside a string that shows code), and imports no name the file has already, from whatever module
- Takes `t` from a hook call the component makes already, unless a text comes before it: `const { i18n } = useTranslation('settings')` becomes `const { t, i18n } = useTranslation('settings')`, so the new keys go to that namespace; a function that is no component but binds `t` from a translation hook (a custom hook, `generateMetadata` with `getT()`) uses that `t`, not `i18next.t()`
- Detects the project's framework from `package.json` dependencies, dev and peer dependencies included; in a workspace package (npm/yarn `workspaces`, `pnpm-workspace.yaml`) also from the workspace root's
- Uses `useTranslation()` hook style `t()` inside React components, or `i18next.t()` for utility / non-component code
- Generates an `i18n.ts` (or `i18n.js` for JS-only projects) initialization file if none exists and the code imports or re-exports neither `i18next` nor `react-i18next` yet (an app that does is set up somewhere, perhaps in a shared package; an import shown in a string, a setup guide's snippet, is none), and not at the root of a workspace without a `src` folder, which no app imports from (set i18next up in the package the apps share, or in each app), pre-configured with [`i18next-resources-to-backend`](https://github.com/i18next/i18next-resources-to-backend) to lazy-load your translation files via dynamic imports, and with the browser's language (`navigator.language`, matched against your `locales`); not in a Next.js app, see below
- Adds `i18n.changeLanguage()` next to a call that sets the user's language: `setLanguage(code)`, or a settings, profile or user call with a `language`/`locale` property (`updateSettings({ language: code })`). Only where that call is a statement of its own in a block or an arrow function's body, with a plain variable or property as the language (the injected call repeats it), and not for a `language` property passed as data (`fetchTranslations({ lng })`) nor for a React state setter (`const [lng, setLng] = useState()`: a component's state, often a view's filter; a warning names each one, add the call by hand where it sets the app's language). `--dry-run` lists every such site; in an app where a language is data (a translation tool's view filter), review them

## Next.js apps ([next-i18next](/next))

An app with next-i18next (a dependency, or imported), and a Next.js app with no i18next set up at all, gets
next-i18next's calls, by where each file renders. The import graph decides: a file under `app/` is a Server
Component unless it says `'use client'`, a `'use client'` file and all it imports are Client Components, a file
under `pages/` and all it imports render with the Pages Router (imports resolve relative, through the `paths` of
`tsconfig.json` or `jsconfig.json` and from the project root). A Next.js app with i18next or react-i18next and no
next-i18next keeps `react-i18next`.

- **Server Components:** `const { t } = await getT()` from `next-i18next/server` (or from the module the app
  imports `getT` from, such as its own `createServerI18next` file), and the component becomes `async`. A
  `<Trans>` gets `t={t} i18n={i18n}` and comes from `react-i18next/TransWithoutContext`. `generateMetadata()`
  and other async functions get `getT()` as well, and `export const metadata = { title: '…' }` becomes
  `export async function generateMetadata () { const { t } = await getT(); return { title: t(…) } }`.
- **Client Components:** `const { t } = useT()` and `Trans` from `next-i18next/client`.
- **Pages Router:** `useTranslation` and `Trans` from `next-i18next/pages`. A page that loads no translations
  (no `serverSideTranslations()` in it or in a helper it imports) is named in a warning.
- **A component that Server and Client Components both render** works with neither: its texts stay, named in a
  warning, unless it gets `t` as a prop (and `i18n` too for a `<Trans>`), which it then uses.
- Left as they are, each named in a warning: texts outside components (next-i18next has no global `t`), files
  no page or layout imports (which side renders them is not known), API routes (`route.ts` under `app/`,
  `pages/api/`), Server Actions and cached functions (`'use server'`, `'use cache'`: `getT()` there needs
  `{ lng }`), a Server Component wrapped in `memo()` or `forwardRef()`, and language switches: next-i18next
  changes the language through the route or `useChangeLanguage()`.
- No init file: next-i18next sets i18next up itself. When it is not set up yet, the steps are printed (install,
  then `i18n.config`, proxy and root layout for the App Router, `appWithTranslation` and `serverSideTranslations`
  for the Pages Router).

## Workflow <a id="recommended-workflow"></a><a id="expected-workflow"></a>

Besides each text with its key, `--dry-run` and the run itself print what to look at by hand, each with its file
and lines: the module-scope texts left, the parts of a sentence (a text that starts or ends with a space, or starts
with a separator: `' (via CLI)'`, `', which needs {{name}}'`; a translator sees each alone, and other languages order
the words differently), and the React state setters it gave no language switch.

1. Preview every change:
   ```bash
   npx i18next-cli instrument --dry-run
   ```
2. Approve the candidates one by one; use `edit-key` or `skip` freely:
   ```bash
   npx i18next-cli instrument --interactive
   ```
3. Review the changes, run your tests, fix what was missed or wrapped wrongly, and commit.
4. Write the keys into the translation files:
   ```bash
   npx i18next-cli extract
   ```

## Limitations

Besides what the warning above says:

- **Other plurals:** a plural written another way than a `count === 1 ? … : …` ternary or a `plural`, `pluralize` or `pluralise` helper keeps its form and needs manual cleanup.
- **Very dynamic strings:** strings built from concatenation, template operations or computed values may not be detected correctly.
- **Framework-specific patterns:** decorators, custom hooks or directives may not be recognized.
- **Words in a plural's placeholder:** in a text with a plural, an optional part
  (`` `${n} segments need review${low ? `, ${low} with low confidence` : ''}` ``) stays in a placeholder, in English:
  write the two cases as two texts.
- **Text for a language model:** prompts are skipped by their names; text a helper of another name builds for a
  model (a length rule added to the context, a note to the model) is wrapped like any other.

## Suppressing detection with `i18next-instrument-ignore`

Both the `lint` and `instrument` commands honor an ignore comment so you can skip placeholder or intentionally-untranslated content. It works as a line or block comment, including the JSX `{/* ... */}` form, and comes in two variants:

| Directive | Scope |
| --- | --- |
| `i18next-instrument-ignore` | The **entire JSX element** that begins on the next line: its opening tag, all nested children, and its closing tag. Falls back to a single line when the next line isn't a JSX element (e.g. a plain `t()` call). |
| `i18next-instrument-ignore-next-line` | Only the **single line** immediately after the directive. |

```jsx
// Suppress a whole element (including multi-line opening tags and nested
// children)
{/* i18next-instrument-ignore */}
<div
  css={css`text-align: center;`}>
  Hi, I'm Bob 👋
  <p>This nested text is ignored too</p>
</div>

// Suppress just one line
{/* i18next-instrument-ignore-next-line */}
<p>Only this line is ignored</p>

// Also works for t() interpolation warnings in the linter
// i18next-instrument-ignore
const msg = t('Hello {{name}}!', { wrong: 'world' })
```
