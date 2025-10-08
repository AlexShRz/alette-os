# Api context
**Api context** in Alette Signal is a value sharing mechanism that shares values 
across the whole api system.

## Setting api context type
To set api context type, you need to override Alette Signal `IGlobalContext`
interface:
```ts
// ./src/api/base.ts
import { client } from '@alette/signal'

declare module "@alette/signal" {
    interface IGlobalContext {
        hey: string;
    }
}
// ...
```

Now your context type can be seen in middleware:
```ts
// ./src/api/posts.ts
export const getPosts = query(
    queryParams(({ context: { hey } }) => ({
        name: hey
    }))
)
```

:::danger
1. Overriding `IGlobalContext` does not set the actual context value - 
the `context` property inside your middleware stays `undefined` at runtime. 
2. To avoid this, use `setContext()` instruction to [set api context value](#setting-api-context).
:::

## Setting api context
To set api context, use `setContext()`
[api client instruction](api-configuration/#api-client-instruction):
```ts
import { client } from '@alette/signal'

const api = client(
    setContext({ hey: 'Alette Signal' })
)
```

To change api context use `.tell()`:
```ts
api.tell(setContext({ hey: 'Not Alette Signal?' }))
```
:::danger
Api context set via `.tell()` will wiped after 
[api client reset](api-configuration/#resetting-api-client).
:::

You can also set api context with a function passed to `setContext()`:
```ts
setContext(() => ({ hey: 'Alette Signal' }))
// or
setContext(async () => ({ hey: 'Alette Signal' }))
```

:::info4
Alette Signal waits for async `setContext()` 
to finish before running requests.
:::

## Accessing api context
To access api context, use `forContext()`
[api client question](api-configuration/#api-client-question):
```ts
import { setContext } from '@alette/signal'

// ...

// returns { hey: 'Alette Signal' }
const apiContext = await api.ask(forContext())
```

To access context in middleware use the `context` property:
```ts
// ./src/api/posts.ts
export const getPosts = query(
    queryParams(({ context: { hey } }) => ({
        name: hey
    }))
)
```

## Direct value access
**Direct value access** is an antipattern where you reference values
inside your api code without passing them through api context.

You can see how your code becomes untestable:
```ts
// ./src/context/index.ts
export const myContext = {
    name: 'Alette Signal'
}

// ./src/api/posts.ts
import { myContext } from '../../context'

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

To avoid this, _always_ pass values your api depends on 
through the api context:
```ts
// ./src/context/index.ts
export const myContext = {
    name: 'Alette Signal'
}

// ./src/api/base.ts
import { myContext } from '../../context'

api.tell(setContext(myContext))

// ./src/api/posts.ts
export const getPosts = query(
    queryParams(({ context: { name } }) => ({
        name: value
    }))
)
```

Now your context values can be easily mocked in tests via `setContext()`:
```ts
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
In more technical terms, Alette Signal api context is a
    [Dependency Injection](https://stackify.com/dependency-injection/) mechanism.