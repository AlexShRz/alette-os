# Api plugins
**An api plugin** in Alette Signal is a module defining and configuring 
[request blueprints](configuring-requests#configuring-requests)
before exposing them for usage. On its own `blueprint()` contains no middleware, and needs to be defined and
configured by plugin authors using built-in middleware.

## Core plugin blueprints
**Alette Signal core plugin exposes 3 configured request blueprints out of the box:**
1. [Query](../request-behaviour/query.md) - preconfigured for `GET` HTTP requests.
2. [Mutation](../request-behaviour/mutation.md) - preconfigured for `POST`, `PATCH`, `DELETE` and `PUT` HTTP requests.
3. [Custom](../request-behaviour/custom.md) - used for executing [dependent requests](../request-behaviour/custom.md#dependent-requests),
   or creating custom request behaviours by composing middleware.
```ts [api/base.ts]
import { coreApiPlugin } from '@alette/signal';

export const core = coreApiPlugin();
export const { query, mutation, custom } = core.use();
```
::: info
Alette Signal treats `query()`, `mutation()` and `custom()` as middleware "black boxes", nothing more.
The same is true for any blueprints plugin authors may define.
:::
::: danger
A plugin must [be activated](./api-plugins.md#api-plugin-activation) for its request blueprints to work.
:::

## Api plugin activation
To activate api plugins, use `activatePlugins()` [api instruction](api-configuration#api-client-instruction):
```ts [api/client.ts]
import { client, activatePlugins, coreApiPlugin } from "@alette/signal";
import { core } from './base.ts'

export const api = client(
    /* ... */
    activatePlugins(core.plugin),
);
```
:::danger
Api plugins must be activated for their request blueprints to work.
:::

## Api plugin deactivation
To deactivate api plugins, use `deactivatePlugins()` [api instruction](api-configuration#api-client-instruction):
```ts
api.tell(deactivatePlugins(core.plugin))
```
:::danger
During plugin deactivation all in-flight requests created from its 
request blueprints are interrupted.
:::