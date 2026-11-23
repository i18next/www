---
description: "Plugins add what the core leaves out, such as loading translations, detecting the language or another message syntax; `use()` registers them."
---

# Plugins

i18next [comes with a lot of modules](../overview/plugins-and-utils.md). There are modules to:

* [load resources](../overview/plugins-and-utils.md#backends), e.g. via [http fetch](https://github.com/i18next/i18next-http-backend) or from the [filesystem](https://github.com/i18next/i18next-fs-backend) (Node.js, Deno)
* [cache resources](../how-to/cache-and-fallback.md) using e.g. [i18next-localstorage-backend](https://github.com/i18next/i18next-localstorage-backend)
* [detect user language](../overview/plugins-and-utils.md#language-detector) by querystring, navigator, cookie, …
* [post processors](../overview/plugins-and-utils.md#post-processors) to further manipulate values, e.g. [interval plurals](../translation-function/plurals.md#interval-plurals)
* i18n formats to write translations in another syntax, e.g. [ICU or MF2](../how-to/using-icu-or-mf2.md)

```javascript
import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import intervalPlural from 'i18next-intervalplural-postprocessor';

i18next
  .use(Backend) // or any other backend implementation
  .use(LanguageDetector) // or any other implementation
  .use(intervalPlural) // or any other post processor
  .init(options);
```

For usage details please read the documentation of the plugin (readme file in the repository or npm website).

## Writing your own plugin

Each plugin type implements the interface below. You can provide a singleton or a prototype constructor (preferred for supporting multiple instances of i18next). In TypeScript, i18next exports the types: `BackendModule`, `LanguageDetectorModule` (or `LanguageDetectorAsyncModule`), `PostProcessorModule`, `LoggerModule`, `FormatterModule` and `I18nFormatModule`. [Check your plugin](#check-your-plugin) with a short script once it is written.

### Backend

Backend plugins are used to load data for i18next.

```javascript
{
  type: 'backend',
  callbackApi: false, // read and create return a promise or a value, see below
  init: function(services, backendOptions, i18nextOptions) {
    /* use services and options */
  },
  read: function(language, namespace) {
    /* return the resources, or a promise of them;
       reject or throw if loading fails */
    return Promise.resolve({ key: 'value' });
  },

  // optional, only used through i18next-multiload-backend-adapter
  readMulti: function(languages, namespaces) {
    /* return multiple resources, useful e.g. to load them in one request */
    return Promise.resolve({
      en: { translation: { key: 'value' } },
      de: { translation: { key: 'value' } }
    });
  },

  // only used in backends acting as cache layer
  save: function(language, namespace, data) {
    // store the translations
  },

  create: function(languages, namespace, key, fallbackValue, options) {
    /* save the missing translation;
       options.isUpdate tells an update from a new key */
  }
}
```

`callbackApi` (as an instance or static property) declares how i18next calls `read` and `create`:

* `false`: `read(language, namespace)` and `create(languages, namespace, key, fallbackValue, options)` return a promise or a value
* `true`: `read(language, namespace, callback)` and `create(languages, namespace, key, fallbackValue, callback, options)` (see [Older ways](#older-ways))

Without it, i18next guesses from the number of parameters (`Function.length`), which default and rest parameters change; guessing is deprecated and logs a warning in debug mode.

To reload resources, for example on an interval, call `services.utils.reloadResources()` instead of the `backendConnector`: it reads through your backend with retries and emits `loaded`, as `i18next.reloadResources()` does. Without arguments it reloads everything i18next loaded or tried to load through your backend, also for clones, and retries the bundles that failed.

{% hint style="info" %}
`readMulti` is only called by [i18next-multiload-backend-adapter](https://github.com/i18next/i18next-multiload-backend-adapter).
{% endhint %}

### languageDetector

Language detector plugins are used to detect language in user land.

```javascript
{
  type: 'languageDetector',
  async: true, // detect returns a promise
  callbackApi: false, // detect() returns a promise
                      // (true: detect(callback), see Older ways)
  init: function(services, detectorOptions, i18nextOptions) { // optional
    /* use services and options */
  },
  detect: async function() {
    /* return the detected language, e.g. from AsyncStorage */
    return 'de';
  },
  cacheUserLanguage: function(lng) { // optional; i18next does not wait for it
    /* cache language */
  }
}
```

A detector that answers at once leaves out `async` and returns the language from `detect()` directly. Either way, `detect` may return a list of languages, the most wanted first.

A detector that takes the language from a request, a URL or storage can check it with `isSafeLanguageCode(code)`, exported by i18next: letters, digits, `-`, `_`, `@` and `.` (no `..`), at most 128 characters. It is not a BCP 47 check, so codes like `en_US` pass; markup, slashes and spaces do not.

### Post processor

Post processors are used to extend or manipulate the translated values before returning them in the `t` function.

A post processor can be a plain object.

```javascript
{
  type: 'postProcessor',
  name: 'nameOfProcessor',
  process: function(value, key, options, translator) {
    /* return manipulated value */
    return value;
  }
}
```

### Logger

Override the built-in console logger.

A logger can be a plain object.

```javascript
{
  type: 'logger',

  log: function(args) {},
  warn: function(args) {},
  error: function(args) {}
}
```

### Formatter

Override the built-in [formatter](../translation-function/formatting.md).

```javascript
{
  type: 'formatter',
  init: function(services, i18nextOptions) {},
  add: function(name, fc) {},
  addCached: function(name, fc) {},
  format: function(value, format, lng, options) {
    if (!format && value instanceof Date) {
      return value.toUTCString()
    }
    return value
  }
}
```

### i18n format

i18n format plugins replace the i18next message format with another syntax, like [i18next-icu](https://github.com/i18next/i18next-icu) or [i18next-mf2](https://github.com/i18next/i18next-mf2). Only one i18nFormat plugin can be used per i18next instance.

```javascript
{
  type: 'i18nFormat',

  // called on i18next.init with the i18next instance;
  // by convention the plugin reads its options from i18next.options.i18nFormat
  init: function(i18next) {},

  // called instead of i18next's interpolation and nesting (also when
  // skipInterpolation is set);
  // the return value goes through post processing and is returned by t
  parse: function(res, options, lng, ns, key, info) {
    // res: the found value, or the defaultValue or key if nothing was found
    // options: the t options, merged over interpolation.defaultVariables
    // info.resolved: { res, usedKey, exactUsedKey, usedLng, usedNS }
    return res;
  },

  // called instead of i18next's plural and context suffix lookup, for each
  // language code and namespace;
  // finalKeys starts as [key], push more keys to it (the last one is looked up
  // first)
  addLookupKeys: function(finalKeys, key, code, ns, options) {
    return finalKeys;
  },

  // optional: if true, i18next handles objects and arrays as usual
  // (returnObjects, joinArrays);
  // if not set, they are passed to parse
  handleAsObject: false,

  // optional: replaces the lookup in the resource store
  // getResource: function(code, ns, key, options) {}
}
```

## Check your plugin

A short script shows whether i18next uses your plugin as you expect. Put it next to the plugin (or let your coding agent write it from this page), change what the table below says for your plugin type, and run it with Node.js:

```javascript
// check-plugin.mjs
import assert from 'node:assert/strict';
import i18next from 'i18next';
import MyPlugin from './my-plugin.js';

const i18n = i18next.createInstance();
await i18n.use(MyPlugin).init({
  lng: 'en',
  resources: { en: { translation: { greeting: 'Hello {{name}}' } } },
});
assert.equal(i18n.t('greeting', { name: 'Ada' }), 'Hello Ada');
console.log('ok');
```

| Plugin type | Change in the script | Check |
| --- | --- | --- |
| Backend | Leave out `resources`; pass your `backend` options | `t` returns the value your backend loaded |
| languageDetector | Leave out `lng`; add `fallbackLng: 'en'` | `i18n.language` is what your `detect` returns |
| Post processor | Nothing | `t('greeting', { name: 'Ada', postProcess: 'nameOfProcessor' })` returns the changed value |
| Logger | Add `debug: true` | Your `log` was called with an array (i18next logs `initialized`) |
| Formatter | Use the value `'{{date, myFormat}}'` | `t` returns what your `format` returns for `myFormat` |
| i18n format | Write the resources in your syntax | `t` returns the message as your `parse` formats it |

## Helpful tips

### Set the plugin type <a id="make-sure-to-set-the-plugin-type"></a>

A plugin class needs its type as a static property:

```javascript
class Backend {
  // read, create, …
}
Backend.type = 'backend';
```

Without it, `i18next.use(Backend)` throws "You are passing a wrong module! Please check the object you are passing to i18next.use()".

### Options arrive in `init`, not in the constructor <a id="create-a-private-method-to-initialize-your-plugin"></a>

i18next creates a plugin class without arguments and then calls `init` with the options from `i18next.init` (for a backend, its `backend` options). Read and check them there:

```javascript
class Backend {
  init(services, backendOptions = {}, i18nextOptions) {
    this.loadPath = backendOptions.loadPath ?? '/locales';
  }

  read(language, namespace) {
    return fetch(`${this.loadPath}/${language}/${namespace}.json`)
      .then((res) => res.json());
  }
}
Backend.type = 'backend';
Backend.callbackApi = false;
```

## Older ways

### Callback backends and detectors

With `callbackApi: true`, `read` and `create` take a callback instead of returning a promise:

```javascript
{
  type: 'backend',
  callbackApi: true,
  read: function(language, namespace, callback) {
    callback(null, { key: 'value' });
    /* if loading fails: callback(error, null) */
  },
  readMulti: function(languages, namespaces, callback) {
    callback(null, { en: { translation: { key: 'value' } } });
  },
  create: function(languages, namespace, key, fallbackValue, callback, options) {}
}
```

An async language detector with `callbackApi: true` gets a callback in `detect`:

```javascript
{
  type: 'languageDetector',
  async: true,
  callbackApi: true,
  detect: function(callback) {
    callback('de');
  }
}
```
