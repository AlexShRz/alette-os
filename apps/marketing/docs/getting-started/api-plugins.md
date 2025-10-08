# Api plugins
**An api plugin** in Alette Signal is a module that defines and configures 
[request blueprints](./configuring-requests/#configuring-requests)
before exposing them for you to use.

## Api plugin activation
To activate api plugins, use `activatePlugins()` [api instruction](./api-configuration/#api-client-instruction):
```ts
import { client, activatePlugins, coreApiPlugin } from "@alette/signal";

const core = coreApiPlugin();

export const api = client(
    /* ... */
    activatePlugins(core.plugin),
);

export const { query, mutation, custom } = core.use();
```
:::danger
Api plugins must be activated for their request blueprints to work.
:::

## Api plugin deactivation
To deactivate api plugins, use `deactivatePlugins()` [api instruction](./api-configuration/#api-client-instruction):
```ts
api.tell(deactivatePlugins(core.plugin))
```
:::danger
During plugin deactivation all in-flight requests created from its 
request blueprints are interrupted.
:::