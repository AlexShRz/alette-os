# Api client
**An api client** in Alette Signal is a router that takes
[request blueprint](configuring-requests#configuring-requests) 
configuration and **routes it** to the core system for execution.

## Configuring api client
To configure the api client, use the provided `client()` function:
```ts [api/client.ts]
import { client } from "@alette/signal";

export const api = client();
```

By default, `client()` uses `globalThis.location.origin` as [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin)
for all requests _routed through it_. To set origin manually, use the `setOrigin()` [api client instruction](#api-client-instruction).
```ts [api/client.ts]
import { client } from "@alette/signal";

export const api = client(
    setOrigin('https://alette-os.com')
);
```

:::warning
A single application should have 1 api client.
:::

## Api client instruction
**Api client instructions** are events describing what the `client()` should do. 
They can be applied with `.tell()` or passed to `client()`.
```ts
export const api = client(/* ... */);

api.tell(
    setOrigin('https://www.wikipedia.org/')
);
```
```ts
import { client } from "@alette/signal";

export const api = client(
    setOrigin('https://alette-os.com')
);
```

To send multiple instructions at once, pass them to the `.tell()` method or `client()`:
```ts
api.tell(
    setOrigin('https://www.wikipedia.org/'),
    setContext({ hey: 'Alette Signal' })
)
```
```ts
import { client } from "@alette/signal";

export const api = client(
    setOrigin('https://alette-os.com'),
    setContext({ hey: 'Alette Signal' })
);
```
:::info 
The api client configuration is done via instructions only. In comparison to class methods,
instructions keep TypeScript types performant by not forcing IDEs to load everything at once. 
:::

## Api client question
**An api client question** is an event asking for data from the api client config.
Api client questions can be asked using the `.ask()` method:
```ts [api/client.ts]
import { setOrigin, client } from '@alette/signal';

export const api = client(
    setOrigin('https://www.wikipedia.org/'),
);
```
```ts [test.ts]
import { forOrigin } from '@alette/signal';

// returns 'https://www.wikipedia.org/'
const globalOrigin = await api.ask(forOrigin());
```
:::warning
Multiple api client questions cannot be put inside one `.ask()` method. 
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
```ts [vitest.setup.ts]
import { api } from './src/api/base.ts'; // import the configured api

afterEach(() => {
    api.reset()
})
```
2. To learn more about api testing, refer to the [Alette Signal testing guide](../testing/environment-requirements.md).
:::

## Full api client configuration
```ts [api/base.ts]
import { coreApiPlugin } from "@alette/signal";

export const core = coreApiPlugin();

const {
    query: baseQuery,
    mutation: baseMutation,
    custom: baseCustom,
} = core.use();
```
:::tip
To learn more about plugins, refer to the [Alette Signal api plugin documentation](api-plugins.md).
:::
```ts [api/client.ts]
import { client, activatePlugins, setOrigin } from "@alette/signal";
import { 
    core,
	baseQuery,
	baseMutation,
	baseCustom
} from "./base.ts";

export const api = client(
    activatePlugins(core.plugin)
);

export const query = baseQuery.toFactory();
export const mutation = baseMutation.toFactory();
export const custom = baseCustom.toFactory();
```
:::tip
1. To learn more about `.toFactory()`, refer to the [Alette Signal blueprint
factory documentation](configuring-requests.md#request-blueprint-factory).
2. To see more api client configuration examples, see
   [Alette Signal middleware reuse guide](./middleware-reuse.md#full-example).
:::