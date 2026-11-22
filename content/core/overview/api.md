---
description: "Every method and event of an i18next instance, with its signature and what it returns."
---

# Methods and events

## Setup <a id="instance-creation"></a>

### init

`i18next.init(options, callback) // -> returns a Promise`

Returns a Promise; use it (`await` or `.then()`). The callback is the older way ([Older ways](#older-ways)).

The default export of the i18next module is an i18next instance ready to be initialized by calling `init`. You can create additional instances using the [createInstance](api.md#createinstance) function.

Please read the [options page](configuration-options.md) for details on configuration options.

The Promise resolves once the translations are loaded, also when loading fails: a backend's load errors come as the [failedLoading](api.md#onfailedloading) event (or in the callback, see [Older ways](api.md#older-ways)).

{% hint style="danger" %}
Do not call init multiple times.\
To change the language, use [changeLanguage](api.md#changelanguage). If you need completely different configs, use [createInstance](api.md#createinstance) or [cloneInstance](api.md#cloneinstance).
{% endhint %}

```javascript
await i18next.init({
  fallbackLng: 'en',
  ns: ['file1', 'file2'],
  defaultNS: 'file1',
  debug: true
});
i18next.t('key');
```

### use

`i18next.use(module) // -> the instance, for chaining`

The use function is there to load additional plugins to i18next.

For available modules, see the [plugins page](plugins-and-utils.md) and don't forget to read the documentation of the plugin.

```javascript
import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import intervalPlural from 'i18next-intervalplural-postprocessor';

i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(intervalPlural)
  .init(options);
```

### createInstance

`i18next.createInstance(options, callback) // -> a new instance`

Will return a new i18next instance.

Please read the [options page](configuration-options.md) for details on configuration options.

Providing a callback will automatically call init.
Without a callback, call `init()` yourself; the options passed here are merged with the defaults right away, so `instance.options` and `getFixedT()` work before `init()` (`t()` returns `''` until then). The new instance has its own logger and post-processors: it does not see what the default `i18next` instance registered with `use()`.

The callback will be called after all translations were loaded or with an error when failed (in case of using a backend).

```javascript
const newInstance = i18next.createInstance({
  fallbackLng: 'en',
  ns: ['file1', 'file2'],
  defaultNS: 'file1',
  debug: true
}, (err, t) => {
  if (err) return console.log('something went wrong loading', err);
  t('key'); // -> same as i18next.t
});

// is the same as
const sameInstance = i18next.createInstance();
sameInstance.init({
  fallbackLng: 'en',
  ns: ['file1', 'file2'],
  defaultNS: 'file1',
  debug: true
}, (err, t) => {
  if (err) return console.log('something went wrong loading', err);
  t('key'); // -> same as i18next.t
});
```

### cloneInstance

`i18next.cloneInstance(options, callback) // -> a new instance`

Creates a clone of the current instance. Shares store, plugins and initial configuration. Can be used to create an instance sharing storage but being independent of the set language or default namespaces.

A clone logs through its parent's logger (or a copy, if you pass `debug` or `prefix`) and uses its parent's post-processors, also those the parent registers later; post-processors registered on the clone stay its own.

The clone does not inherit `preload`: the parent already loaded those languages into the shared store, so the clone only loads its own language (and fallbacks). Pass `preload` in the options if the clone should load them too.

```javascript
const newInstance = i18next.cloneInstance({
  fallbackLng: 'en',
  defaultNS: 'file1'
});
```

#### forkResourceStore

By setting the forkResourceStore option to true, it will not share the store.

```javascript
const newInstance = i18next.cloneInstance({
  forkResourceStore: true,
  keySeparator: '[[my-new-separator]]'
});
```

### toJSON

`i18next.toJSON() // -> { options, store, language, languages, resolvedLanguage }`

The instance's state as a plain object, for example to pass it from the server to the client.

## Translate

### t

`i18next.t(keys, options) // -> the text`

Please have a look at the translation functions like [interpolation](../translation-function/interpolation.md), [formatting](../translation-function/formatting.md) and [plurals](../translation-function/plurals.md) for more details on using it.

You can specify either one key as a `String` or multiple keys as an `Array` of `String`. The first one that resolves will be returned.

```javascript
i18next.t('my.key'); // -> will return value in set language

i18next.t(['unknown.key', 'my.key']);
// -> will return value for 'my.key' in set language
```

#### t options

Explained on their own page:

* `defaultValue`: the text to show when the key is not found; per plural form as `defaultValue_other` ([Essentials](../translation-function/essentials.md#passing-a-default-value)).
* `ns`: the namespace, or namespaces, to look the key up in ([Essentials](../translation-function/essentials.md#accessing-keys-in-different-namespaces)).
* `count`: the number that picks the plural form; with `ordinal: true` the ordinal form ([Plurals](../translation-function/plurals.md)).
* `context`: picks the variant of the key with that context ([Context](../translation-function/context.md)).
* `replace`: the values to insert, as one object; they can also stand directly in the options ([Interpolation](../translation-function/interpolation.md)).
* `interpolation`: interpolation options for this call ([Interpolation](../translation-function/interpolation.md#all-interpolation-options)).
* `skipInterpolation`: no interpolation and no nesting for this call.
* `returnObjects`: returns the object or array under the key instead of a string ([Objects and arrays](../translation-function/objects-and-arrays.md#objects)).
* `joinArrays`: joins an array under the key into one string with this separator ([Objects and arrays](../translation-function/objects-and-arrays.md#arrays)).
* `postProcess`: the post processors to apply ([Plugins](../principles/plugins.md#post-processor)).
* `keyPrefix`: only on the `t` that `getFixedT` returns ([getFixedT](#getfixedt)).

For this call instead of the global setting ([Configuration options](configuration-options.md)):

* `lng`: one language for this call, looked up with its fallbacks: `de-CH`, then `de`, then `fallbackLng`.
* `lngs`: an exact list of languages, looked up in that order without fallbacks; `getFixedT` sets it when it gets a list of languages.
* `fallbackLng`: the fallback languages for this call; `false` means no fallback.
* `keySeparator`: the character between the levels of a nested key; `false` for flat keys.
* `nsSeparator`: the character between namespace and key; `false` turns namespace prefixes off.
* `ignoreJSONStructure`: looks a key that is not found as a nested key up as a flat key (default `true`; not in the TypeScript types).

For debugging:

* `returnDetails`: returns an object with the language, namespace, key and value used, instead of the string.

### exists

`i18next.exists(key, options) // -> true or false`

Uses the same resolve functionality as the `t` function and returns true if a key exists.

```javascript
i18next.exists('my.key'); // -> true if exists, false if not
```

### getFixedT

`i18next.getFixedT(lng, ns, keyPrefix, fixedOpts) // -> a t function`

Returns a `t` function that defaults to the given language or namespace.

All arguments can be optional/null.

`lng` and `ns` params could be arrays of languages or namespaces and will be treated as fallbacks in that case.

The optional `keyPrefix` will be automatically applied to the returned t function. For example:

```javascript
const t = i18next.getFixedT(null, null, 'user.accountSettings.changePassword')
// same as i18next.t('user.accountSettings.changePassword.title');
const title = t('title');
```

{% hint style="warning" %}
If you want to use keys with a prefixed namespace and the `keyPrefix` argument was provided, you'll need to override it in the `t` function options.

See below for an example.
{% endhint %}

```javascript
const t = i18next.getFixedT(null, null, 'user.accountSettings.changePassword')
t('ns:title'); // this will not work
t('ns:title', { keyPrefix: '' }); // this will work
```

The optional `fixedOpts.scopeNs` carries a namespace list that the **selector API** uses to detect when a path's first segment is a namespace prefix, without affecting resolution scope. This is what `react-i18next`'s `useTranslation([nsA, nsB])` passes through so that `t($ => $.nsB.foo)` correctly routes to `nsB`, while plain `t('foo')` lookups stay isolated to the primary `ns`. Set it to the same array you would pass to `useTranslation`.

As with the `t` function, you can override the languages or namespaces on the returned function by passing them in options or by prepending the namespace.

```javascript
// fix language to german
const de = i18next.getFixedT('de');
de('myKey');

// or fix the namespace to anotherNamespace
const anotherNamespace = i18next.getFixedT(null, 'anotherNamespace');
// no need to prefix ns i18n.t('anotherNamespace:anotherNamespaceKey');
anotherNamespace('anotherNamespaceKey');
```

### format

`i18next.format(data, format, lng)`

Exposes the Formatter's format function, backed by the built-in [Formatter](../translation-function/formatting.md) (or a custom Formatter module provided via `.use()`).

For formatting used in translation files, check out the [formatting doc](../translation-function/formatting.md).

```javascript
// uppercase is a format of your own (see Formatting)
i18next.services.formatter.add('uppercase', (value) => value.toUpperCase());
// key = 'hello {{what}}'
i18next.t('key', { what: i18next.format('world', 'uppercase') });
// -> hello WORLD
```

### dir

`i18next.dir(lng) // -> 'ltr' or 'rtl'`

Returns `rtl` or `ltr` depending on the language's reading direction. Without a language (before `init()`, or none resolved) it returns `ltr`.

```javascript
// for current language
i18next.dir();

// for another language
i18next.dir('en-US'); // -> "ltr";
i18next.dir('ar'); // -> "rtl";
```

## Language switching

### changeLanguage

`i18next.changeLanguage(lng, callback) // -> returns a Promise`

Returns a Promise; use it (`await` or `.then()`). The callback is the older way ([Older ways](#older-ways)).

Changes the language. The callback will be called as soon as translations were loaded or an error occurs while loading.

Calling `changeLanguage` without `lng` uses the [language detector](../principles/plugins.md#languagedetector) to choose the language to set.

**HINT:** For easy testing, setting `lng` to 'cimode' will cause the `t` function to always return the key.

```javascript
i18next.changeLanguage('en', (err, t) => {
  if (err) return console.log('something went wrong loading', err);
  t('key'); // -> same as i18next.t
});

// using Promises
i18next
  .changeLanguage('en')
  .then((t) => {
    t('key'); // -> same as i18next.t
  });

// manually re-detecting language
i18next.changeLanguage().then(...)
```

### language

`i18next.language`

Is set to the currently detected or set language.

If you need the primary used language depending on your configuration (supportedLngs, load) you will prefer using [`i18next.resolvedLanguage`](api.md#resolvedlanguage) or [`i18next.languages[0]`](api.md#languages).

### languages

`i18next.languages`

Is set to an array of language codes that will be used to look up the translation value.

When the language is set, this array is populated with the new language codes. Unless overridden, this array is populated with less-specific versions of that code for fallback purposes, followed by the list of fallback languages.

{% hint style="info" %}
Values are unique, so if they appear earlier in the array, they will not be added again.
{% endhint %}

```javascript
// initialize with fallback languages
i18next.init({
  fallbackLng: ["es", "fr", "en-US", "dev"]
});

// change the language
i18next.changeLanguage("en-US-xx");

// new language and its more generic forms, followed by fallbacks
i18next.languages; // ["en-US-xx", "en-US", "en", "es", "fr", "dev"]

// change the language again
i18next.changeLanguage("de-DE");

// previous language is not retained
i18next.languages; // ["de-DE", "de", "es", "fr", "en-US", "dev"]
```

### resolvedLanguage

`i18next.resolvedLanguage`

Is set to the current resolved language.\
It can be used as the primary used language, for example in a language switcher.

### loadLanguages

`i18next.loadLanguages(lngs, callback) // -> returns a Promise`

Returns a Promise; use it (`await` or `.then()`). The callback is the older way ([Older ways](#older-ways)).

Loads additional languages not defined in init options (preload).

```javascript
i18next.loadLanguages('de', (err) => { /* resources have been loaded */ });
i18next.loadLanguages(['de', 'fr'], (err) => {
  /* resources have been loaded */
});

// using Promises
i18next
  .loadLanguages(['de', 'fr'])
  .then(() => {});
```

## Namespaces

### loadNamespaces

`i18next.loadNamespaces(ns, callback) // -> returns a Promise`

Returns a Promise; use it (`await` or `.then()`). The callback is the older way ([Older ways](#older-ways)).

Loads additional namespaces not defined in init options.

```javascript
i18next.loadNamespaces('myNamespace', (err) => {
  /* resources have been loaded */
});
i18next.loadNamespaces(['myNamespace1', 'myNamespace2'], (err) => {
  /* resources have been loaded */
});

// using Promises
i18next
  .loadNamespaces(['myNamespace1', 'myNamespace2'])
  .then(() => {});
```

### hasLoadedNamespace

`i18next.hasLoadedNamespace(ns, options) // -> returns true or false`

Checks if a namespace has loaded yet, e.g. used by [react-i18next](/react)

### setDefaultNamespace

`i18next.setDefaultNamespace(ns)`

Changes the default namespace.

## Resources <a id="resource-handling"></a>

### reloadResources

`i18next.reloadResources(lngs, ns, callback) // -> returns a Promise`

Returns a Promise; use it (`await` or `.then()`). The callback is the older way ([Older ways](#older-ways)).

Reloads resources on given state. Optionally you can pass an array of languages and namespaces as params if you don't want to reload all.

Without languages it reloads the current languages and every language the backend loaded or tried to load, also for clones of the instance, and it retries the bundles that failed to load.

```javascript
// reload all
i18next.reloadResources();

// reload languages
i18next.reloadResources(['de', 'fr']);

// reload namespaces for all languages
i18next.reloadResources(null, ['ns1', 'ns2']);

// reload namespaces in languages
i18next.reloadResources(['de', 'fr'], ['ns1', 'ns2']);

// reload a namespace in a language
i18next.reloadResources('de', 'ns1');

// optional third param: a callback
i18next.reloadResources('de', 'ns1', () => { /* reloaded */ });

// using Promises
i18next
  .reloadResources()
  .then(() => {});
```

### hydrate

`i18next.hydrate(resources, lng) // -> returns the instance`

Puts resources rendered on the server into the store and changes to the server's language, each only the first time. For SSR integrations like react-i18next's `useSSR`; call it after `init()`. On a clone it does nothing, as a clone shares its parent's store. It sets `initializedStoreOnce` and `initializedLanguageOnce`.

```javascript
i18next.hydrate(window.__I18N_STORE__, window.__I18N_LANGUAGE__);
```

Can be accessed on `i18next` or `i18next.services.resourceStore`.

### getResource

`i18next.getResource(lng, ns, key, options)`

Gets one value by the given key.

Options:

* `keySeparator` (default `'.'`): the character between the levels of a nested key; `false` for flat keys.
* `ignoreJSONStructure` (default `true`): looks a key that is not found as a nested key up as a flat key.

### addResource

`i18next.addResource(lng, ns, key, value, options)`

Adds one key/value.

Options:

* `keySeparator` (default `'.'`): the character between the levels of a nested key; `false` for flat keys.
* `silent` (default `false`): `true` adds without emitting the `added` event.

### addResources

`i18next.addResources(lng, ns, resources)`

Adds multiple key/values.

### addResourceBundle

`i18next.addResourceBundle(lng, ns, resources, deep, overwrite)`

Adds a complete bundle.

Setting deep (default false) param to true will extend existing translations in that file. Setting deep and overwrite (default false) to true will overwrite existing translations in that file.

So omitting deep and overwrite will overwrite all existing translations with the ones provided in resources. Using deep you can choose to keep existing nested translations and to overwrite those with the new ones.

```javascript
i18next.addResourceBundle('en', 'translations', {
  key: 'value',
}, true, true);
```

### hasResourceBundle

`i18next.hasResourceBundle(lng, ns)`

Checks if a resource bundle exists.

### getDataByLanguage

`i18next.getDataByLanguage(lng)`

Returns resource data by language.

### getResourceBundle

`i18next.getResourceBundle(lng, ns)`

Returns a resource bundle.

### removeResourceBundle

`i18next.removeResourceBundle(lng, ns)`

Removes an existing bundle.

## Events

`i18next.on(name, listener)` subscribes, `i18next.once(name, listener)` subscribes for the next time only, and `i18next.emit(name, ...args)` fires an event, for example one of your own.

{% hint style="info" %}
Every event can be unsubscribed using:

`i18next.off('name', myFunction);`

All attached listeners can be unsubscribed using:

`i18next.off('name');`
{% endhint %}

### onInitialized

`i18next.on('initialized', function(options) {})`

Gets fired after initialization.

### onLanguageChanging

`i18next.on('languageChanging', function(lng) {})`

Gets fired when `changeLanguage` starts, before the language's translations are loaded.

### onLanguageChanged

`i18next.on('languageChanged', function(lng) {})`

Gets fired when changeLanguage got called.

### onLoaded

`i18next.on('loaded', function(loaded) {})`

Gets fired on loaded resources.

### onFailedLoading

`i18next.on('failedLoading', function(lng, ns, msg) {})`

Gets fired if loading resources failed (after the built-in retry algorithm).

### onMissingKey

`i18next.on('missingKey', function(lngs, namespace, key, res) {})`

Gets fired on accessing a non-existing key. Needs [saveMissing](configuration-options.md#saving-missing-keys) set to true.

<a id="store-events"></a>Please be aware that the `i18next.store` is only available on i18next after the init call.

### onAdded

`i18next.store.on('added', function(lng, ns, key, value) {})` from `addResource`

`i18next.store.on('added', function(lng, ns, resources) {})` from `addResources` and `addResourceBundle`

Gets fired when resources got added.

### onRemoved

`i18next.store.on('removed', function(lng, ns) {})`

Gets fired when resources got removed.

## Properties

* `isInitialized`: `true` once `init()` has finished.
* `options`: the options in use, merged with the defaults ([Configuration options](configuration-options.md)).
* `store`: the resource store with the loaded translations (see [Resources](#resources) and the store events).
* `services`: the services i18next set up, such as `resourceStore`, `languageUtils`, `formatter` and `backendConnector`.
* `modules`: the plugins registered with `use()`, by type.
* `language`, `languages`, `resolvedLanguage`: see [Language switching](#language-switching).

## Older ways

### Init with a callback or a promise chain

`await i18next.init(options)` (see [init](api.md#init)) does the same. The callback still works, and it is the one place besides the [failedLoading](api.md#onfailedloading) event where a load error arrives: it is called after all translations were loaded, or with an error when loading failed (in case of using a backend).

```javascript
i18next.init({
  fallbackLng: 'en',
  ns: ['file1', 'file2'],
  defaultNS: 'file1',
  debug: true
}, (err, t) => {
  if (err) return console.log('something went wrong loading', err);
  t('key'); // -> same as i18next.t
});

// with only callback
i18next.init((err, t) => {
  if (err) return console.log('something went wrong loading', err);
  t('key'); // -> same as i18next.t
});

// using Promises
i18next
  .init({ /* options */ })
  .then(function(t) { t('key'); });
```
