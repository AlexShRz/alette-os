# Installation
To install Alette Signal, run the following command
in your terminal:
::: code-group
```sh [pnpm]
pnpm add @alette/signal@latest
```

```sh [npm]
npm install @alette/signal@latest
```

```sh [yarn]
yarn add @alette/signal@latest
```
:::

:::info
Requirements:
1. TypeScript 5.4 or newer.
2. Environment supporting [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone). 
WebWorkers support `structuredClone()` out of the box, while a polyfill is needed for old browsers.

Recommendations:
1. Use [Biome](https://biomejs.dev/) instead of Eslint for linting and formatting due to speed.
:::

## Usage with UI frameworks
To use Alette Signal with UI frameworks,
refer to the framework integration guides:
1. [React integration guide](../integrations/react-integration.md).

## Usage with state managers
To use Alette Signal with a state manager,
refer to the state manager integration guides:
1. [Redux integration guide](../integrations/state-managers/redux-integration.md).