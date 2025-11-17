# Configuring requests
Configuring requests in Alette Signal is done by providing middleware
to request blueprints. 

## Request blueprint
**A request blueprint** is a set of predefined request instructions, 
executed by the Alette Signal "core" system. When a request is finished, the
promise returned after calling the request blueprint is resolved or rejected:
```ts
const getPosts = query(
    path('/posts')
);

await getPosts();
```

## Request arguments
To define request arguments, provide the `input()` middleware to a request blueprint:
```ts
import { input, as, coreApiPlugin } from '@alette/signal';
import * as z from 'zod';

const core = coreApiPlugin();
const { query } = core.use();

const myQuery = query(
    input(z.object({ hey: z.string() }))
);
```
The `input()` middleware accepts a [Zod](https://zod.dev/) schema or 
any other runtime validation schema implementing the [Standard Schema](https://standardschema.dev/) interface. To skip runtime validation,
use the `as()` type placeholder instead:
```ts
import { as, /* ... */ } from '@alette/signal';

const myQuery = query(
    input(as<{ hey: string }>())
);
```

::: tip
The `as()` type placeholder implements the Standard Schema interface, making
it possible to use it instead of runtime schemas like Zod.
:::
::: danger
The `as()` type placeholder does not validate provided types at runtime.
:::

To pass arguments to request blueprints, use the `args` property:
```ts
const response = await myQuery({ 
	args: { hey: 'Alette Signal' } 
});
```

## Request output
To define request output, provide the `output()` middleware to a request blueprint:
```ts
import { output, /* ... */ } from '@alette/signal';

const myQuery = query(
    /* ... */
	output(z.object({ hello: z.string() })),
);

/* 
* The "response" variable is now 
* of the "{ hello: string }" type.
* */
const response = await myQuery({
    args: { hey: 'Alette Signal' }
});
```

The `output()` middleware accepts a [Zod](https://zod.dev/) schema or
any other runtime validation schema implementing the [Standard Schema](https://standardschema.dev/) interface. To skip runtime validation,
use the `as()` type placeholder instead:
```ts
import { as, /* ... */ } from '@alette/signal';

const myQuery = query(
    output(as<{ hello: string }>()),
);
```

## Request settings
**Request settings** are typed values required by middleware 
and accepted by the `()` method, or the `execute()` function
exposed by [mounted requests](request-modes.md#mounted-request-mode):
```ts
await myQuery(
    // Request settings
    { 
        args: { hey: 'Alette Signal' }
    }
);
```
:::info
Request settings are dynamic based on middleware present
in request blueprints.
:::

### Request setting binding
**Request setting binding** is a technique allowing [request blueprints](#request-blueprint)
to reuse the same request settings for every request.

To bind request settings to request blueprints use the `.using()` method:
```ts
const boundQuery = myQuery.using(() => ({
    args: { hey: 'Alette Signal' }
}));
```

The function passed to the `.using()` method is invoked on each
request execution, allowing the request to keep request settings up-to-date:
```ts
let name = "Alette Signal 1";

const boundQuery = myQuery.using(() => ({
    args: { hey: name }
}));

// Will use "Alette Signal 1"
await boundQuery();

name = "Alette Signal 2";

// Will use "Alette Signal 2"
await boundQuery();
```

:::tip
You can think of the `.using()` method as a variation of native JS `.bind()`.
:::

Now `boundQuery` can be executed as is:
```ts
// Each invocation is using the same request settings
// { args: { hey: 'Alette Signal' } }
await boundQuery();
await boundQuery();
await boundQuery();
```

To override bound settings, provide new request settings to `()`:
```ts
await boundQuery({
    args: { hey: 'Not Alette Signal?' }
});
```
:::danger
The `.using()` method creates a new request blueprint with bound settings using 
`myQuery()` as a foundation - it does not return a reference to `myQuery()` back.

This can be validated by running a JS object reference check:
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

## Request behaviour inheritance
To inherit request behaviour, call the `.with()` method on a [request blueprint](#request-blueprint):
```ts
import { input, output, as } from '@alette/signal';

// ...

const myQuery = query(
    /* ... */
    input(as<{ hey: string }>())
);

// Inherits all middleware from "myQuery"
const myQuery2 = myQuery.with(
    output(as<{ welcome: string }>())
);

// Now TypeScript type of "response" is 
// "{ welcome: string }", not "unknown".
const response = await myQuery2({ 
	args: { hey: 'Alette Signal' } 
});
```
::: danger
The `.with()` request blueprint method **clones** the original request blueprint
together with its middleware and returns a new one.
It does not return a reference to `myQuery()` back, meaning
**`myQuery()` and `myQuery2()` are 2 different requests**.

This can be validated by running a JS object reference check:
```ts
myQuery === myQuery2 // returns false
```
:::

## Request blueprint factory
**Request blueprint factory** is a function containing previously provided middleware,
while accepting new middleware as arguments. 

To turn request blueprints into factories, call the 
request blueprint `.toFactory()` method.
```ts
const baseQuery = myQuery
    .with(
        output(as<{ welcome: string }>())
    )
    .toFactory()
```

Now, `baseQuery()` has a preconfigured behaviour defined by the `input()` and `output()` middleware,
while allowing other middleware to override it:
```ts
import { output, as } from '@alette/signal'

// ...

const queryFromBaseQuery = baseQuery(
    output(as<{ overriddenOutput: true }>())
)

// Now TypeScript type of "response" is 
// "{ overriddenOutput: true }", not "{ welcome: string }".
const response = await queryFromBaseQuery({ 
    args: { hey: 'Alette Signal' }
})
```
:::info
Under the hood, [request blueprint factories use `.with()`](#request-behaviour-inheritance).
:::