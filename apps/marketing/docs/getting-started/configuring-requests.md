# Configuring requests
Configuring requests in Alette Signal is done by providing middleware
to request blueprints. 

**A request blueprint** is an object that 
stores request middleware and configuration before sending them 
to the Alette Signal "core" system for execution. **You can think of request blueprints 
as a set of instructions** defined by you and executed by the Alette Signal core 
system the moment they are received.

**Request blueprints never execute requests themselves** - they delegate 
execution to the system. When a request is finished, the system sends the result back and your
promise returned from the `.execute()` method is resolved or rejected.

## Plugins in Alette Signal
**A plugin** in Alette Signal is a module that defines and configures request blueprints 
before exposing them for you to use. 
On its own `blueprint()` contains no middleware, and needs to be configured by plugin authors. 
Plugin authors can define as many blueprints as needed, and preconfigure their
behaviour using built-in middleware.

Alette Signal core plugin gives you 3 preconfigured request blueprints:
1. `query()` - preconfigured for `GET` HTTP requests
2. `mutation()` - preconfigured for `POST`, `PATCH`, `DELETE` and `PUT` HTTP requests
3. `custom()` - made for "do it yourself" request types. 
Here you can execute dependent requests and combine their results, or take create custom
request behaviours by composing middleware.

::: info
Under the hood Alette Signal makes no differentiation between `query()`, `mutation()` and `custom()`.
The system treats them as middleware "black boxes", nothing more. The same is true for any blueprints
plugin authors may define.
:::
::: danger
A plugin must [be activated](./api-plugins.md#api-plugin-activation) for its request blueprints to work. 
:::

## Defining request behaviour
Defining request behaviour is done by providing middleware to request blueprints. Let's
instruct the `query()` blueprint to accept `{ hey: string }` object as an argument by 
injecting the `input()` middleware:
```ts twoslash
import { input, as, coreApiPlugin } from '@alette/signal'

const core = coreApiPlugin()
const { query } = core.use();

const myQuery = query(
    input(as<{ hey: string }>())
)
```
By default, the `input()` middleware accepts a Zod schema or 
any other runtime validation schema that implements the [Standard Schema](https://standardschema.dev/) interface.

If you don't want runtime validation, you can use Alette Signal `as()` type placeholder instead.

::: tip
The `as()` type placeholder implements the Standard Schema interface, making
it possible to use it instead of runtime schemas like Zod.
:::
::: danger
The `as()` type placeholder does not validate provided types at runtime.
:::

Now, `myQuery` can accept arguments:
```ts
const myQuery = query(
    input(as<{ hey: string }>())
)

const response = await myQuery.execute({ args: { hey: 'Alette Signal' } })
```

You can also access your arguments in other middleware:
```ts
const myQuery = query(
    input(as<{ hey: string }>()),
    queryParams(({ args }) => ({
        name: args.hey
    }))
)

const response = await myQuery.execute({ args: { hey: 'Alette Signal' } })
```

## Request settings
**Request settings** is what the `.execute()` method accepts when it is called.
```ts
await myQuery.execute(
    // Request settings
    { 
        args: { hey: 'Alette Signal' }
    }
)
```

Request settings are typed and dynamic based on what middleware are present
in your request blueprint.

### Request setting supplier
**Request setting supplier** is a function that "binds"
request settings to request blueprints using the `.using()` method.

:::tip
You can think of the `.using()` method as a variation of native JS `.bind()`.
:::

Let's bind the `{ args: ... }` settings required by the `input()` middleware 
to our blueprint:
```ts
const boundQuery = myQuery.using(() => ({
    args: { hey: 'Alette Signal' }
}))
```

Now we can execute the query as is:
```ts
// Each invocation is using the same request settings
// { args: { hey: 'Alette Signal' } }
await boundQuery.execute()
await boundQuery.execute()
await boundQuery.execute()
```

To override bound settings you can provide new settings to `.execute()`:
```ts
await boundQuery.execute({
    args: { hey: 'Not Alette Signal?' }
})
```
:::danger
`.using()` method clones the original request blueprint
together with its middleware and returns a new one with bound settings.
It does not return a reference to `myQuery()` back.

You can validate this by running a js object reference check:
```ts
myQuery === boundQuery // returns false
```
:::

:::warning
1. When `.using()` is called, it prevents 
you from calling `.with()` again or [converting your blueprint to a factory](#request-blueprint-factory).
2. This prevents situations where you add middleware like `input()` that  
might make previously provided settings to `.using()` invalid. 
:::

## Reusing request behaviour
To reuse request behaviour, you can add middleware to request blueprints
using the `.with()` method. Let's create a `myQuery2()` request that accepts
that same arguments as `myQuery()`, but also expects `{ welcome: string }` response to be returned
from the server.

To do that, we need the `output()` middleware,
and we are going to use `myQuery()` as a foundation:
```ts
import { input, output, as } from '@alette/signal'

// ...

const myQuery = query(
    input(as<{ hey: string }>())
)

const myQuery2 = myQuery.with(
    output(as<{ welcome: string }>())
)
```

::: danger
The `.with()` request blueprint method clones the original request blueprint
together with its middleware and returns a new one.
It does not return a reference to `myQuery()` back, meaning
`myQuery()` and `myQuery2()` are 2 **completely different requests**.

You can also validate this by running a js object reference check:
```ts
myQuery === myQuery2 // returns false
```
:::

Now, `myQuery2()` expects the `{ hey: string }` arguments to be provided,
as well as `{ welcome: string }` response returned back from the server:
```ts
const myQuery2 = myQuery.with(
    output(as<{ welcome: string }>())
)

// Now TypeScript type of "response" is 
// "{ welcome: string }", not "unknown".
const response = await myQuery2.execute({ args: { hey: 'Alette Signal' } })
```

## Request blueprint factory
**Request blueprint factory** is a function that contains previously provided middleware,
while also accepting new middleware as arguments. To turn request blueprints into factories, call the 
request blueprint `.toFactory()` method.
```ts
const baseQuery = myQuery
    .with(
        output(as<{ welcome: string }>())
    )
    .toFactory()
```

Now, your `baseQuery()` acts 
like `query()`, `mutation()` and `custom()` request blueprints - 
it has a preconfigured behaviour provided by `input()` and `output()`, while allowing other middleware 
to override it:
```ts
import { output, as } from '@alette/signal'

// ...

const queryFromBaseQuery = baseQuery(
    output(as<{ overriddenOutput: true }>())
)

// Now TypeScript type of "response" is 
// "{ overriddenOutput: true }", not "{ welcome: string }".
const response = await queryFromBaseQuery.execute({ 
    args: { hey: 'Alette Signal' }
})
```

Under the hood, [request blueprint factories work identical to `.with()`](#reusing-request-behaviour).