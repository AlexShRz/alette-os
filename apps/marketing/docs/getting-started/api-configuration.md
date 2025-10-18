# Api client
**An api client** in Alette Signal is a router that takes
[request blueprint](configuring-requests#configuring-requests) 
configuration and routes it to the core system for execution.

## Configuring api client
To configure your api client you can use the provided `client()` function:
```ts
// src/api/base.ts
import { client, setOrigin, setContext } from "@alette/signal";

export const api = client(
    setOrigin('https://www.wikipedia.org/'),
    setContext({ hey: 'Alette Signal' })
);
```
:::warning
You should have 1 api client for your whole application.
:::

## Api client instruction
**An api client instruction** is an event describing what the api client should do.
Api client instructions can be applied using the `.tell()` method:
```ts
export const api = client(/* ... */);

api.tell(
    setOrigin('https://www.wikipedia.org/')
)
```

You can also send multiple instructions at once:
```ts
api.tell(
    setOrigin('https://www.wikipedia.org/'),
    setContext({ hey: 'Alette Signal' })
)
```
:::info 
The api client configuration is done via instructions only. In comparison to class methods,
instructions keep TypeScript types performant by not forcing your IDE to load everything at once. 
:::

## Api client question
**An api client question** is an event asking for data from the api client config.
Api client questions can be asked using the `.ask()` method:
```ts
import { forContext, forOrigin } from '@alette/signal'

// returns { hey: 'Alette Signal' }
const globalContext = await api.ask(forContext())

// returns 'https://www.wikipedia.org/'
const globalOrigin = await api.ask(forOrigin())
```
:::warning
You cannot put multiple api client questions inside one `.ask()` method. 
Each api question requires a separate `.ask()` method call. 
:::
:::info
Each api question is prefixed with `for` for differentiation from [api instructions](#api-client-instruction).
:::

## Resetting api client
**Resetting an api client** refers to the process of wiping all api state
and reapplying initial instructions passed to `client()`.

To reset the api client, call the `.reset()` method:
```ts
api.reset()
```

:::danger 
1. Only instructions passed to `client()` will be reapplied.
Api instructions passed to the `.tell()` method will be ignored.
2. During `.reset()` all in-flight requests are interrupted.
:::

:::tip
1. The `.reset()` method can be used to wipe api state after each test:
```ts
// vitest.setup.ts
import { api } from './src/api/base'; // import your configured api

afterEach(() => {
    api.reset()
})
```
2. To learn more about api testing, refer to the [Alette Signal testing guide](../testing/environment-requirements.md).
:::