---
description: "What to do when the types of `t` get in your way."
---

# Troubleshooting

## Mocking `t` with selectors in tests <a id="testing"></a><a id="mocking-the-selector-function"></a>

With the [Selector API](selector-api.md), a mock of `t` gets a function instead of a key. `keyFromSelector`, exported by i18next, turns it back into the key:

```typescript
import { keyFromSelector } from 'i18next';

const mockT = (selector: ($: Record<string, any>) => any) =>
  keyFromSelector(selector);

mockT($ => $.abc.def); // -> "abc.def"
```

## Common problems <a id="troubleshooting"></a>

### IntelliSense not working

The editor shows no keys. Its TypeScript is older than the one the types need: use TypeScript 5 or later.

### `Expected 0 arguments, but got 1.` when calling `t`

This error means TypeScript resolved your key type to `never`, so `t` accepts no key at all. The two usual causes:

1. **Your IDE uses an old bundled TypeScript version.** The type definitions require a recent TypeScript; point your editor at the workspace version (VS Code: "TypeScript: Select TypeScript Version" → "Use Workspace Version"; WebStorm: Settings → Languages & Frameworks → TypeScript → point to `node_modules/typescript`). If `tsc` on the command line typechecks fine but the IDE complains, this is almost always it.
2. **The `CustomTypeOptions` augmentation collapsed your resources type.** If the `resources` interface in your declaration file resolves to `never`/`unknown` (wrong import path to your resource file, JSON module resolution not enabled via `resolveJsonModule`, or the declaration file not being included by `tsconfig.json`), every key becomes invalid. Verify the declaration file from [Typed keys](../overview/typescript.md#create-a-declaration-file) is picked up and that hovering `CustomTypeOptions['resources']` in your editor shows your actual keys.

### Typechecking got slow with large resource files

Only with string keys. The string-key types build a union of every key, which gets expensive with many thousands of keys. Split the code into smaller packages ([monorepo](../overview/typescript.md#per-package-namespace-types-in-a-monorepo-resourcenamespacemap)), or use the selector with [`enableSelector: 'optimize'`](selector-api.md#turn-it-on), which resolves keys lazily: `t($ => $.some.key)` instead of `t('some.key')`.

### Out of memory (OOM) errors

Not with `enableSelector: 'optimize'`. Type checking with key validation can run out of memory in a large codebase with many namespaces of hundreds of keys, more so when it runs together with ESLint and typescript-eslint. The fixes:

* Run type checking and linting as separate tasks.
* Split the code into packages (monorepo).
* Give Node more memory:

  ```shell
  NODE_OPTIONS=--max-old-space-size=10240 tsc
  ```
* Switch to the selector with `enableSelector: 'optimize'`; [@i18next-selector/vite-plugin](https://github.com/ahrjarrett/i18next-selector/tree/main/packages/vite-plugin) helps with the migration.

### Interpolation values not working <a id="not-working-interpolation-values"></a>

The `t()` options are not checked against the placeholders. Placeholders are typed only when the resources keep their literal types: generate them with [`i18next-cli types`](/cli/commands/types), or write them `as const`; a plain JSON import types every value as `string`.

### `Type 'HTMLAttributes<T>' is not assignable to type...`

[`skipLibCheck`](https://www.typescriptlang.org/tsconfig#skipLibCheck) is off. Set it to `true` in your tsconfig.

### Type error: template literal

Only with string keys. A key built with a template literal loses its literal type, so TypeScript reports:

> Argument of type 'string' is not assignable to parameter of type ...

```typescript
i18next.t(`${expression}.title`);
const { t } = useTranslation(`${ns}Default`); // react-i18next
```

Assert the template string `as const`:

```typescript
i18next.t(`${expression}.title` as const);
```

### Type error: excessively deep and possibly infinite

Not with `enableSelector: 'optimize'`. Calling `t` reports:

> TS2589: Type instantiation is excessively deep and possibly infinite.

The declaration file is set up wrong, or the resources are very deep. Check the declaration against [Typed keys](../overview/typescript.md), or use `enableSelector: 'optimize'`. Before i18next 27.2.8, a `t()` call with `context` could cause it too when there are several large namespaces; update i18next.

### Tagged template literal (`react-i18next` only)

Only with string keys. With the tagged template form, the keys and the return type are not inferred, because [TemplateStringsArray](https://github.com/microsoft/TypeScript/issues/33304) takes no generic types; it accepts any string:

```typescript
t`key1.key2`;
```

### `returnObjects` without typed resources <a id="customize-t-function-return-when-returnobjects-is-set-to-true-but-customtypeoptionsresources-is-not-used"></a><a id="example-with-object"></a><a id="example-with-array"></a><a id="example-without-casting-using-type-parameters"></a>

Without `resources` in `CustomTypeOptions`, `t(key, { returnObjects: true })` returns `object | Array<string | object>`. Cast it, or pass the type as a type parameter:

```typescript
const card = t('myKey', { returnObjects: true }) as {
  title: string;
  text: string;
};

type Card = { title: string; text: string };
const card2 = t<string, { returnObjects: true }, Card>('myKey', {
  returnObjects: true,
});
```
