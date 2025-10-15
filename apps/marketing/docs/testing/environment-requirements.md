# Environment requirements 
Alette Signal requires a testing environment with
a [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) 
polyfill to execute requests. To install a XMLHttpRequest polyfill, run
the following command in the terminal:
::: code-group
```sh [pnpm]
pnpm add @alette/signal-test-utils@latest
```

```sh [npm]
npm install @alette/signal-test-utils@latest
```

```sh [yarn]
yarn add @alette/signal-test-utils@latest
```
:::
:::warning
This page is work in progress.
:::

## Setting up testing environment
To set up a testing environment, create a test setup file
and call the `setUpApiTestEnv` function from the `@alette/signal-test-utils` package:

```ts
// vitest.setup.ts (or jest.setup.ts if using Jest)
import { setUpApiTestEnv } from '@alette/signal-test-utils';

setUpApiTestEnv()
```
:::danger
Make sure to include the test setup file before any tests are run. 
:::