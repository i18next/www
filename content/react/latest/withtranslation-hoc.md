---
description: "withTranslation passes t and the i18next instance to a class component as props."
---

# withTranslation (HOC)

For class components; in function components, use the [`useTranslation`](usetranslation-hook.md) hook.

## What it does <a id="when-to-use"></a>

`withTranslation` wraps a class component and passes it `t` and the i18next instance `i18n` as props; `i18n` is there to change the language, for example `this.props.i18n.changeLanguage('en-US')`. While the translations load, the component suspends ([Not using Suspense](#not-using-suspense)).

```jsx
import { Component } from 'react';
import { withTranslation } from 'react-i18next';

class MyComponent extends Component {
  render() {
    return <p>{this.props.t('welcome')}</p>;
  }
}

export default withTranslation()(MyComponent);
```

## withTranslation params

### Loading namespaces

```jsx
// load a specific namespace
// the t function will be set to that namespace as default
withTranslation('ns1')(MyComponent);

// inside your component MyComponent
this.props.t('key'); // will be looked up from namespace ns1

// load multiple namespaces
// the t function will be set to first namespace as default
withTranslation(['ns1', 'ns2', 'ns3'])(MyComponent);

// inside your component MyComponent
this.props.t('key'); // will be looked up from namespace ns1
this.props.t('key', { ns: 'ns2' }); // will be looked up from namespace ns2
```

### Overriding the i18next instance

```javascript
// passing in an i18n instance
// use only if you do not like the default instance
// set by i18next.use(initReactI18next) or the I18nextProvider
import i18n from './i18n';

const ExtendedComponent = withTranslation('ns1')(MyComponent);

<ExtendedComponent i18n={i18n} />
```

### Not using Suspense

```javascript
// use tReady prop in MyComponent to check if translations
// are already loaded or not
const ExtendedComponent = withTranslation()(MyComponent);

<ExtendedComponent useSuspense={false} />
```

{% hint style="info" %}
When not using Suspense, you will need to handle the not-ready state yourself, e.g. by rendering a loading component as long as `!props.tReady`. Not doing so will result in rendering your translations before they are loaded, which will cause save missing to be called although the translations exist (just not loaded yet).
{% endhint %}

## How to

### Use ref <a id="use-ref-greater-than-v10.6.0"></a>

With `withRef: true`, a ref reaches the wrapped component:

```jsx
const Wrapped = withTranslation('translation', { withRef: true })(MyComponent);

// then pass a ref in your render method like
const myRef = createRef();
<Wrapped ref={myRef} />;

// use myRef.current to access it
```

### Hoist non-react statics

The HOC does not copy the statics of your component. Use [hoist-non-react-statics](https://github.com/mridgway/hoist-non-react-statics):

```jsx
import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import hoistStatics from 'hoist-non-react-statics';

class MyComponent extends Component {
  static pageTitle = 'Profile';

  render() {
    return <p>{this.props.t('welcome')}</p>;
  }
}

export default hoistStatics(withTranslation()(MyComponent), MyComponent);
```

For one or two statics, copy them yourself: `Extended.pageTitle = MyComponent.pageTitle`.

### Use TypeScript with class components

To get proper type annotations while using TypeScript, import the interface `WithTranslation` and extend it with your own props interface.

```tsx
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

class MyComponent extends Component<IProps, IState> {
  render() {
    return <div>{this.props.t('welcome')}</div>
  }
}

interface IProps extends WithTranslation {
  prop: any;
}

interface IState {
  state: any;
}

export default withTranslation()(MyComponent);
```
