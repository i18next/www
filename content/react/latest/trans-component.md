---
description: "Trans keeps markup and links inside one translatable sentence, so translators see it whole."
---

# Trans component

## When you need it <a id="important-note"></a>

Only when markup or components (`strong`, `em`, a link) sit inside a sentence. For everything else, use `t()` from [useTranslation](usetranslation-hook.md).

`Trans` does not load translations: it uses the i18next instance, and the translations load through [useTranslation](usetranslation-hook.md). It renders again when the language changes, like `useTranslation`.

## Named components <a id="samples"></a><a id="alternative-usage-which-lists-the-components-v11.6.0"></a>

Name each component in `components` and use the name as a tag in the translation:

```jsx
import { Trans } from 'react-i18next';

function MyComponent({ name, count }) {
  return (
    <Trans
      i18nKey="userMessagesUnread"
      count={count}
      values={{ name }}
      components={{ bold: <strong />, inbox: <Link to="/msgs" /> }}
    />
  );
}
```

```json translation.json
{
  "userMessagesUnread_one": "Hello <bold>{{name}}</bold>, you have {{count}} unread message. <inbox>Go to messages</inbox>.",
  "userMessagesUnread_other": "Hello <bold>{{name}}</bold>, you have {{count}} unread messages. <inbox>Go to messages</inbox>."
}
```

With `name: 'Arthur'` and `count: 42` this renders:

```html
Hello <strong>Arthur</strong>, you have 42 unread messages.
<a href="/msgs">Go to messages</a>.
```

`values` holds the interpolation values. `defaults` is the text when the key has no translation yet:

```jsx
<Trans
  i18nKey="myKey"
  defaults="hello <italic>beautiful</italic> <bold>{{what}}</bold>"
  values={{ what: 'world' }}
  components={{ italic: <i />, bold: <strong /> }}
/>
// -> hello <i>beautiful</i> <strong>world</strong>
```

A named component can be used several times in one translation. When a component has children of its own, an empty tag keeps them: `components={{ wrap: <a href="#"><svg /></a> }}` with `"myKey": "Link: <wrap></wrap>"` renders the icon inside the link (`<wrap/>` does the same). Put text inside `<wrap>...</wrap>` when the translation should provide the children.

{% hint style="warning" %}
Names of self-closing HTML tags are reserved and won't work as component names, for example `link: <Link />`, `img: <img src="" />` or `media: <img src="" />`.
{% endhint %}

### Overriding component props <a id="overriding-react-component-props-v11.5.0"></a>

A translation can set props of a component, for example a different `href` per language. Values in the translation override the ones passed in `components`:

```json translation.json
{
  "myKey": "This is a <CustomLink href=\"https://example.com/\">link to example.com</CustomLink>."
}
```

```jsx
<Trans
  i18nKey="myKey"
  components={{
    CustomLink: <MyCustomLinkComponent href="value-to-be-overridden" />
  }}
/>
```

This renders `MyCustomLinkComponent` with `href="https://example.com/"`. It works the same with a components array and indexed tags:

```json translation.json
{
  "myKey": "This is a <0 href=\"https://example.com/\">link to example.com</0>."
}
```

```jsx
<Trans
  i18nKey="myKey"
  components={[<MyCustomLinkComponent href="value-to-be-overridden" />]}
/>
```

## Indexed children <a id="using-with-react-components"></a>

You can also write the sentence as children. The translation then refers to each element by its position among the children.

Before:

```jsx
function MyComponent({ name, count }) {
  return (
    <>
      Hello <strong title="This is your name">{name}</strong>, you
      have {count} unread message(s). <Link to="/msgs">Go to messages</Link>.
    </>
  );
}
```

After:

```jsx
import { Trans, useTranslation } from 'react-i18next';

function MyComponent({ name, count }) {
  const { t } = useTranslation();

  return (
    <Trans i18nKey="userMessagesUnread" count={count}>
      Hello <strong title={t('nameTitle')}>{{ name }}</strong>, you
      have {{ count }} unread messages. <Link to="/msgs">Go to messages</Link>.
    </Trans>
  );
}
```

```json translation.json
{
  "nameTitle": "This is your name",
  "userMessagesUnread_one": "Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.",
  "userMessagesUnread_other": "Hello <1>{{name}}</1>, you have {{count}} unread messages. <5>Go to messages</5>."
}
```

[`i18next-cli extract`](/cli/commands/extract) writes the children as the default text. The `i18nKey` is optional if you use the text as the key.

### How to get the correct translation string?

The indexed tags (`<1></1>`) are hard to guess, and hard for translators too: a tag moved to the wrong place breaks the sentence, and a spreadsheet gives no clue what element `1` is. To get them generated:

1. Run [`i18next-cli extract`](/cli/commands/extract): it writes the string into your translation file.
2. Set `debug: true` in `i18next.init()` and look for the missing key in the console.
3. Use [saveMissing](/overview/configuration-options#saving-missing-keys) to send the string to your backend or to a function of your own.
4. Inspect the `<Trans>` element with the React Developer Tools: the tag's number is the element's index in `props.children`.

The numbers come from the children like this. For the example above:

```javascript
Trans.children = [
  'Hello ',                         // 0: a string
  { children: [{ name: 'Jan' }] },  // 1: <strong> with an interpolation object
  ', you have ',                    // 2: a string
  { count: 10 },                    // 3: an interpolation object
  ' unread messages. ',             // 4: a string
  { children: ['Go to messages'] }, // 5: <Link> with a string child
  '.'                               // 6: a string
]
```

```json translation.json
{
  "userMessagesUnread_other": "Hello <1>{{name}}</1>, you have {{count}} unread messages. <5>Go to messages</5>."
}
```

* A string stays as it is.
* An object is used for interpolation.
* An element becomes `<x></x>` around its children, where `x` is its index; its own children follow the same rules, counting from 0 again.

### Simple HTML elements <a id="usage-with-simple-html-elements-like-less-than-br-greater-than-and-others-v10.4.0"></a>

Simple HTML elements keep their name in the translation instead of an index. That works for elements without attributes (like `className`) and with no child or a single text child:

* `<br/>`
* `<strong>bold</strong>`
* `<p>some paragraph</p>`

These become indexed tags:

* `<i className="icon-gear" />`: has an attribute
* `<strong title="something">{{name}}</strong>`: has a child that is not text
* `<b>bold <i>italic</i></b>`: has a nested element

```jsx
<Trans i18nKey="welcomeUser">
  Hello <strong>{{ name }}</strong>. <Link to="/inbox">See my profile</Link>
</Trans>

<Trans i18nKey="multiline">
  Some newlines <br/> would be <br/> fine
</Trans>
```

```json translation.json
{
  "welcomeUser": "Hello <strong>{{name}}</strong>. <3>See my profile</3>",
  "multiline": "Some newlines <br/> would be <br/> fine"
}
```

Options in `i18next.options.react` for this:

* `transSupportBasicHtmlNodes` (default `true`): keeps the names of simple elements in translations instead of indexes.
* `transKeepBasicHtmlNodesFor` (default `['br', 'strong', 'i', 'p']`): the elements whose names are kept.
* `transWrapTextNodes` (default `''`): wraps each text node in the element you name, for example `'span'`. Text nodes are not wrapped by default. It works around pages that break when a browser translates them; see [i18next options](#i18next-options).

### Lists <a id="using-with-lists-v10.5.0"></a>

Set `i18nIsDynamicList` on the element that wraps an `Array.map()`. Its items then stay out of the translation string:

```jsx
<Trans i18nKey="list_map">
  My dogs are named: <ul i18nIsDynamicList>
    {['rupert', 'max'].map(dog => <li key={dog}>{dog}</li>)}
  </ul>
</Trans>
```

```json translation.json
{
  "list_map": "My dogs are named: <1></1>"
}
```

### Components array <a id="alternative-usage-components-array"></a>

`components` also takes an array; `<0>` in the text is the component at index 0:

```jsx
<Trans
  i18nKey="myKey"
  defaults="hello <0>{{what}}</0>"
  values={{ what: 'world' }}
  components={[<strong>univers</strong>]}
/>
// -> hello <strong>world</strong>
```

With [ICU as translation format](https://github.com/i18next/i18next-icu) you need this form or the named components, because the ICU syntax is not valid as JSX children.

## Interpolation

Pass the values as objects in the children:

```jsx
const person = { name: 'Henry', age: 21 };
const { name } = person;

<Trans>
  Hello {{ name }}.
</Trans>
// translation string: "Hello {{name}}."

<Trans>
  Hello {{ firstname: person.name }}.
</Trans>
// translation string: "Hello {{firstname}}."
```

### TypeScript usage

TypeScript reports an error for an object inside a React element:

```tsx
<Trans>
  Hello <i>{{name}}</i>
</Trans>
// Error: Object literal may only specify known properties...
```

React's types don't expect objects as children, but react-i18next turns them into text at run time, so a type assertion is safe:

```tsx
// a reusable type helper
type TransInterpolation = Record<string, string | number>;

<Trans>
  Hello <i>{{name} as TransInterpolation}</i>
</Trans>
```

Or cast to `any`:

```tsx
<Trans>
  Hello <i>{{name} as any}</i>
</Trans>
```

The type option `allowObjectInHTMLChildren` also removes the error, but it weakens type safety across your whole React app. It needs `import 'react-i18next/augment-react';` next to your `CustomTypeOptions` declaration, and `skipLibCheck: true` with current `@types/react` (see [Migrating v17 to v18](migrating-v17-to-v18.md#allowobjectinhtmlchildren-needs-an-import)).

## Plural

Pass the `count` prop:

```jsx
const messages = ['message one', 'message two'];

<Trans i18nKey="newMessages" count={messages.length}>
  You have {{ count: messages.length }} messages.
</Trans>
// -> You have 2 messages.
```

```json translation.json
{
  "newMessages_one": "You have one message.",
  "newMessages_other": "You have {{count}} messages."
}
```

When the children hold `{{ count }}` as a number, you can leave out the `count` prop: react-i18next takes it from the children. An explicit `count` prop wins, also `count={0}`. Without children (only `i18nKey`), `count` is required.

## Trans props

All props are optional, but without `i18nKey` the text of the children is the key.

* `i18nKey` (string): the key. It can carry the namespace as `'ns:key'` (with `nsSeparator`); with text as keys, use the `ns` prop instead: `<Trans i18nKey="myKey" ns="myNS"></Trans>`.
* `ns` (string): the namespace.
* `t` (function): the `t` function to use instead of the one from the nearest [provider](i18nextprovider.md) or the global instance, for example from `useTranslation('myNamespace')`.
* `count` (number): the value for plurals; see [Plural](#plural).
* `context` (string): the value for [context](/translation-function/context).
* `tOptions` (object): more options for `t()`, such as `context` or `postProcess`.
* `parent` (node): a component to wrap the content in (set it for all with `defaultTransParent`).
* `i18n` (object): the i18next instance, if none comes from the context.
* `defaults` (string): the default text instead of the children (useful for ICU).
* `values` (object): interpolation values that are not in the children.
* `components` (object or array): the components for named or indexed tags.
* `shouldUnescape` (boolean): ignored; `Trans` always decodes HTML entities such as `&lt; &amp; &gt;` to `< & >`, and warns when the prop is set.

### i18next options

```javascript
i18next.init({
  // ...
  react: {
    // ...
    hashTransKey: function(defaultValue) {
      // return a key based on defaultValue or if you prefer to just remind you
      // should set a key return false and throw an error
    },
    defaultTransParent: 'div', // a valid React element
    transEmptyNodeValue: '', // what to return for empty Trans
    // allow <br/> and simple HTML elements in translations
    transSupportBasicHtmlNodes: true,
    // don't convert to <1></1> if simple React elements
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    // wrap text nodes in an element, e.g. 'span' (not wrapped by default)
    transWrapTextNodes: '',
    // default props for Trans: tOptions, values, components
    transDefaultProps: undefined,
  }
});
```

Google Translate in the browser changes the DOM of a page, which can break a React app; `transWrapTextNodes: 'span'` works around it ([the React issue](https://github.com/facebook/react/issues/11538#issuecomment-390386520)).
