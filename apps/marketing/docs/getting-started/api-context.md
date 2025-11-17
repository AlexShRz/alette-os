# Api context
**Api context** in Alette Signal is a value sharing mechanism that shares values 
across the whole api system.

## Setting api context type
To set api context type, you need to override Alette Signal `IGlobalContext`
interface:
```ts [api/context.ts]
import { coreApiPlugin, setContext } from "@alette/signal";

interface IApiContext {
    hey: string;
}

declare module "@alette/signal" {
    interface IGlobalContext extends IApiContext {}
}

export const setDefinedContext = setContext({ hey: 'hello!' });
```

:::danger
1. Overriding `IGlobalContext` does not set the actual context value - 
the `context` property inside middleware stays `undefined` at runtime. 
2. To avoid this, use `setContext()` instruction to [set api context value](#setting-api-context).
:::

## Setting api context
To set api context, use `setContext()`
[api client instruction](api-configuration#api-client-instruction):
```ts [api/client.ts]
import { client } from '@alette/signal';
import { setDefinedContext } from './context';

export const api = client(
    setDefinedContext,
);

/*...*/
```

Now your context type can be seen in middleware:
```ts [api/posts.ts]
export const getPosts = query(
    queryParams(({ context: { hey } }) => ({
        name: hey
    }))
)
```

To change api context use `.tell()`:
```ts
api.tell(setContext({ hey: 'Not Alette Signal?' }))
```
:::danger
Api context set via `.tell()` will be wiped after 
[api client reset](api-configuration#resetting-api-client).
:::

The api context can also be set by passing a function to `setContext()`:
```ts
setContext(() => ({ hey: 'Alette Signal' }))
// or
setContext(async () => ({ hey: 'Alette Signal' }))
```

:::info
Alette Signal waits for async `setContext()` 
to finish before running requests.
:::

## Accessing api context
To access api context, use `forContext()` [api client question](api-configuration#api-client-question):
```ts
import { forContext } from '@alette/signal';

// ...

// returns { hey: 'Alette Signal' }
const apiContext = await api.ask(forContext());
```

To access context in middleware use the `context` property:
```ts [api/posts.ts]
export const getPosts = query(
    queryParams(({ context: { hey } }) => ({
        name: hey
    }))
)
```
:::tip
The `context` property is accessible in every middleware.
:::

## Full api client configuration with context
```ts [api/context.ts]
import { coreApiPlugin, setContext } from "@alette/signal";

interface IApiContext {
    hey: string;
}

declare module "@alette/signal" {
    interface IGlobalContext extends IApiContext {}
}

export const setDefinedContext = setContext({ hey: 'hello!' });
```
```ts [api/base.ts]
import { coreApiPlugin, setContext } from "@alette/signal";

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
import { client, activatePlugins } from "@alette/signal";
import { setDefinedContext } from "./context.ts";
import { 
    core,
	baseQuery,
	baseMutation,
	baseCustom
} from "./base.ts";

export const api = client(
    setDefinedContext,
    activatePlugins(core.plugin)
);

export const query = baseQuery.toFactory();
export const mutation = baseMutation.toFactory();
export const custom = baseCustom.toFactory();
```
:::tip
To learn more about `.toFactory()`, refer to the [Alette Signal blueprint
factory documentation](configuring-requests.md#request-blueprint-factory).
:::

## Direct value access
**Direct value access** is an antipattern where global values are accessed
directly inside api code without passing them through api context.

**Direct value access** makes code untestable:
```ts [context/index.ts]
export const myContext = {
    name: 'Alette Signal'
}
```
```ts [api/posts.ts]
import { myContext } from '../context'

export const getPosts = query(
    queryParams(() => {
        // The "name" property cannot be changed later in tests
        const value = myContext.name
        return {
            name: value
        }
    })
)
```

To avoid this, _always_ pass values the api depends on 
through the api context:
```ts [context/index.ts]
export const myContext = {
    name: 'Alette Signal'
}
```

```ts [api/base.ts]
import { myContext } from '../context'

api.tell(setContext(myContext))
```
```ts [api/posts.ts]
export const getPosts = query(
    queryParams(({ context: { name } }) => ({
        name: value
    }))
)
```

Now, context values can be mocked in tests via `setContext()`:
```ts [apiContext.test.ts]
// ...

test('it uses context name as a query parameter', async () => {
    const expectedName = 'Not Alette Signal'
    
    api.tell(setContext({
        ...myContext,
        name: expectedName
    }))

    // Later...
    expect(returnedName).toEqual(expectedName)
})
```

## Did you know?
Alette Signal api context is a
    [Dependency Injection](https://stackify.com/dependency-injection/) mechanism.