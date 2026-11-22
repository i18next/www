---
description: "Your first translated React component, with i18next set up once for the whole app."
---

# Getting started

**Using a coding agent?** Paste this prompt into Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI or any agent that can run terminal commands:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

Your agent wraps the texts in `t()` and writes the translation files; you review the diff, and the translation files stay in your repository unless you choose a translation management service. ⇒ [What the prompt tells your agent](/how-to/ai-coding-agents)

## Installation <a id="install-needed-dependencies"></a><a id="install-using-npm"></a><a id="load-from-cdn"></a>

```bash
npm install react-i18next i18next
```

Script tags from a CDN (load i18next's UMD build before react-i18next's), Deno and the supported browsers: [Environments](/overview/environments).

## Configure i18next

Create a file `i18n.js` beside your `index.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations (the next section moves them into files)
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to React and react-i18next'
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue à React et react-i18next'
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // if you're using a language detector, do not define lng
    interpolation: {
      // React escapes what it renders; escape t() output yourself
      // before dangerouslySetInnerHTML
      escapeValue: false
    }
  });

export default i18n;
```

Any file name works if you import it accordingly. `i18n.use(initReactI18next)` passes the instance to react-i18next, which makes it available to all components.

Then import it in `index.js`:

```javascript
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
```

Outside a component, import your `i18n.js` and call `i18n.t('welcome')`.

React Native or Expo: the same setup, plus a polyfill for plurals on Hermes, see [React Native and Expo](react-native.md).

### Translation files

To keep the translations out of your code, load them from files and detect the user's language:

```bash
npm install i18next-http-backend i18next-browser-languagedetector
```

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // loads /locales/<language>/translation.json
  .use(LanguageDetector) // detects the user's language
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true, // logs what i18next does; turn off in production
    interpolation: {
      // React escapes what it renders; escape t() output yourself
      // before dangerouslySetInnerHTML
      escapeValue: false
    }
  });

export default i18n;
```

Create a file `public/locales/<language>/translation.json` per language, for example:

```json public/locales/en/translation.json
{
  "welcome": "Welcome to React and react-i18next"
}
```

The [React example](https://github.com/i18next/react-i18next/tree/master/example/react/public/locales) has a full set. The http backend loads the files while your app renders, so wrap your components in React's `Suspense` (next section).

{% content-ref url="guides/multiple-translation-files.md" %}
[multiple-translation-files.md](guides/multiple-translation-files.md)
{% endcontent-ref %}

## Translate your content <a id="translation-how-to"></a>

### Simple content

Before:

```jsx
<div>Welcome</div>
```

After:

```jsx
<div>{t('welcome')}</div>
```

You get the `t` function from the [useTranslation](latest/usetranslation-hook.md) hook (below). It is the main function of i18next; [Essentials](/translation-function/essentials) lists all its options.

### Using the useTranslation hook <a id="using-the-hook"></a><a id="using-the-hoc"></a><a id="using-the-withtranslation-hoc"></a>

```jsx
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('welcome')}</h1>;
}

// the http backend may still be loading the translations
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
```

The hook takes a namespace or an array of namespaces to load. The `t` function is bound to the default namespace defined on i18next init, or to the first one passed in.

```javascript
const { t, i18n } = useTranslation('common');

const { t, i18n } = useTranslation(['page1', 'common']);
```

Learn more about the hook [useTranslation](latest/usetranslation-hook.md).

### Markup and links with Trans <a id="using-the-trans-component"></a><a id="jsx-tree"></a>

To keep markup or a link inside a translation, use the `Trans` component. Keep the whole sentence in one string: translators need it to get the result right.

Before:

```jsx
<div>
  Hello <strong>{name}</strong>, you have {count} unread
  message(s). <Link to="/msgs">Go to messages</Link>.
</div>
```

After:

```jsx
<Trans i18nKey="userMessagesUnread" count={count}>
  Hello <strong>{{ name }}</strong>, you have {{ count }} unread
  messages. <Link to="/msgs">Go to messages</Link>.
</Trans>
```

With `count`, the translation file holds one form per plural; see [Plurals](/translation-function/plurals).

Learn more about the [Trans component](latest/trans-component.md).

## Next steps <a id="see-the-sample"></a><a id="do-you-directly-want-to-see-an-example"></a><a id="basic-sample"></a><a id="result"></a>

Prefer having code to check out? The [React example](https://github.com/i18next/react-i18next/tree/master/example/react) uses a [browser language detector](https://github.com/i18next/i18next-browser-languageDetector) and an [http backend](https://github.com/i18next/i18next-http-backend) to load the translations.

Then read on: the [useTranslation hook](latest/usetranslation-hook.md), the [Trans component](latest/trans-component.md) and [namespaces in components](guides/multiple-translation-files.md). Class components, the older way, get `t` as a prop from [withTranslation](latest/withtranslation-hoc.md).

To move the texts from your components into the translation files, run `i18next-cli extract`: [Extracting translations](/how-to/extracting-translations). With TypeScript, the keys can be typed, so a typo fails at compile time: [Typed keys](/overview/typescript).
