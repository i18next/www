---
description: "react-i18next connects i18next to React: useTranslation and Trans in your components, the same translation files and t() as everywhere else."
---

# Introduction

**Set up react-i18next with your coding agent**\
Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

The official [i18next-cli](/cli) prints the steps for the version installed in your project: wrap hardcoded strings in `t()`, extract the keys, check every language. You review the diff, and the translation files stay in your repository unless you choose a translation management service.\
⇒ [What the prompt tells your agent](/how-to/ai-coding-agents)

## What your code looks like <a id="what-does-my-code-look-like"></a>

Before:

```jsx
<p>Welcome</p>
<p>
  Hello <strong>{name}</strong>, you have {count} unread
  message(s). <Link to="/msgs">Go to messages</Link>.
</p>
```

After:

```jsx
<p>{t('welcome')}</p>
<Trans i18nKey="userMessagesUnread" count={count}>
  Hello <strong>{{ name }}</strong>, you have {{ count }} unread
  messages. <Link to="/msgs">Go to messages</Link>.
</Trans>
```

With `count`, the translation file holds one form per plural; see [Plurals](/translation-function/plurals).

## What there is <a id="what-is-react-i18next"></a>

* **[useTranslation](latest/usetranslation-hook.md) and [Trans](latest/trans-component.md):** texts in your components, also with markup and links inside.
* **[React Native and Expo](react-native.md) and [server rendering without Next.js](latest/ssr.md):** the same hooks and components beyond the browser.
* **[Next.js](/next):** next-i18next, for the App Router and the Pages Router.
* **[i18next](/introduction):** configuration, plurals, formatting and interpolation are documented there, and the same files work in every framework.

At least 1,188 of the 100,000 most linked websites run i18next in their own code (scan of 2026-11), many of them React apps: [who uses i18next](/blog/who-uses-i18next).
