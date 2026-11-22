---
description: "The same hooks and components in a React Native or Expo app; four things differ from the web."
---

# React Native and Expo

react-i18next 18 needs React 18 or later, which means React Native 0.69 or later.

## Install

```bash
npm install react-i18next i18next intl-pluralrules
```

For the device language, add `react-native-localize` in a React Native app or `expo-localization` in an Expo app.

## Plurals on Hermes

i18next needs `Intl.PluralRules` for plurals. Hermes, the JavaScript engine of React Native and Expo, does not implement it ([Hermes' list of Intl APIs](https://github.com/facebook/hermes/blob/main/doc/IntlAPIs.md)). Import the [polyfill](https://github.com/eemeli/intl-pluralrules) before i18next:

```javascript
import 'intl-pluralrules';
```

## The device language

There is no browser to ask, so read the language from the device and pass it as `lng`. With `react-native-localize`:

```javascript
import { getLocales } from 'react-native-localize';

const lng = getLocales()[0]?.languageCode;
```

[@os-team/i18next-react-native-language-detector](https://gitlab.com/os-team/libs/utils/-/tree/main/packages/i18next-react-native-language-detector), maintained by the community, does the same as a ready language detector for `.use()`, on top of react-native-localize.

With Expo, `getLocales` comes from `expo-localization` and is called the same way.

## Bundled translation files

Import the JSON files and pass them as `resources`. i18next then initializes synchronously, so the translations are ready on the first render and nothing suspends.

```javascript
// i18n.js
import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Expo: from 'expo-localization'
import { getLocales } from 'react-native-localize';

import en from './locales/en/translation.json';
import de from './locales/de/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de }
    },
    lng: getLocales()[0]?.languageCode,
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    interpolation: {
      // React escapes what it renders; escape t() output yourself
      // before dangerouslySetInnerHTML
      escapeValue: false
    }
  });

export default i18n;
```

Import `./i18n` once, in your entry file, before the app renders. [useTranslation](latest/usetranslation-hook.md) then works in every component as described in [Getting started](getting-started.md).

## Trans inside Text

In React Native, text must be inside a `<Text>` element. `Trans` renders no element of its own unless you give it a `parent`, so render it inside `<Text>` (or pass `parent={Text}`), and map its tags to `Text` elements:

```jsx
import { Text } from 'react-native';
import { Trans } from 'react-i18next';

<Text>
  <Trans
    i18nKey="welcome"
    values={{ name }}
    components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }}
  />
</Text>
// "welcome": "Hello <bold>{{name}}</bold>, welcome back."
```

More on tags and components: [Trans component](latest/trans-component.md).
