---
description: "Test components that translate in two ways: mock react-i18next, or run i18next with real translations in the test."
---

# Testing

## Mock react-i18next

### Mock the hook

With this mock, every component that uses `useTranslation` gets a `t` that returns the key:

```javascript
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // with TypeScript: (key: string) => key
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
  // so the i18n.js file of your app can still call .use(initReactI18next)
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
```

A test then finds the key, for example `expect(screen.getByText('welcome')).toBeInTheDocument()`.

### A mock for everything

A manual mock in `__mocks__/react-i18next.js`, next to `node_modules`, is picked up by Jest for every test. This one covers `useTranslation`, `withTranslation` and `Trans`, so components that mix them render their keys and children as plain text:

```jsx
const React = require('react');
const reactI18next = require('react-i18next');

const useMock = [(k) => k, { changeLanguage: () => new Promise(() => {}) }];
useMock.t = (k) => k;
useMock.i18n = { changeLanguage: () => new Promise(() => {}) };

module.exports = {
  ...reactI18next,
  withTranslation: () => (Component) => (props) => (
    <Component t={(k) => k} {...props} />
  ),
  Trans: ({ children, i18nKey }) => children ?? i18nKey,
  useTranslation: () => useMock,
};
```

A fuller version, with a `Trans` mock that renders nested elements, is in the [Jest example](https://github.com/i18next/react-i18next/blob/master/example/test-jest/src/__mocks__/react-i18next.js) of react-i18next.

### Spy on t

To check how a component calls `t`, mock `useTranslation` with a spy. The component:

```jsx
import { useTranslation } from 'react-i18next';

export default function CustomComponent() {
  const { t } = useTranslation();

  return <div>{t('some.key', { some: 'variable' })}</div>;
}
```

The test:

```jsx
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import CustomComponent from './CustomComponent';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

it('renders the key', () => {
  const tSpy = jest.fn((key) => key);
  useTranslation.mockReturnValue({
    t: tSpy,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  });

  render(<CustomComponent />);

  expect(screen.getByText('some.key')).toBeInTheDocument();

  // this checks how t was called, which tests your mock more than your code
  expect(tSpy).toHaveBeenCalledTimes(1);
  expect(tSpy).toHaveBeenLastCalledWith('some.key', { some: 'variable' });
});
```

With the selector API, a mock like `(str) => str` gets a function instead of the key; see [Mocking the selector function](/typescript/troubleshooting#mocking-the-selector-function).

## Test with real translations <a id="testing-without-stubbing"></a><a id="example-configuration-for-testing"></a><a id="example-test-using-this-configuration"></a>

Without mocks, the test renders the real texts. Set up an instance for the tests with your translation file as resources:

```javascript
// i18nForTests.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation from '../public/locales/en/translation.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  debug: false,
  interpolation: {
    // React escapes what it renders; escape t() output yourself
    // before dangerouslySetInnerHTML
    escapeValue: false,
  },
  resources: { en: { translation } },
});

export default i18n;
```

Then wrap the component in `I18nextProvider`:

```jsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18nForTests';
import Greeting from './Greeting';

it('shows the greeting', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <Greeting />
    </I18nextProvider>
  );
  expect(screen.getByText('Welcome')).toBeInTheDocument();
});
```

## Older ways

For class components wrapped in `withTranslation`, export the plain component as well and test that one with a `t` mock:

```javascript
export { MyComponent };
export default withTranslation('ns')(MyComponent);
```

```jsx
import { MyComponent } from './MyComponent';

render(<MyComponent t={(key) => key} />);
```

Or mock `withTranslation`, so every wrapped class component gets `t` as a prop:

```javascript
jest.mock('react-i18next', () => ({
  withTranslation: () => (Component) => {
    Component.defaultProps = {
      ...Component.defaultProps,
      t: (key) => key, // with TypeScript: (key: string) => key
    };
    return Component;
  },
}));
```
