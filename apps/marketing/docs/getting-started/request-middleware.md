# Request middleware
**A request middleware** in Alette Signal is a function that instructs
the core system on how to react to request lifecycle stages.

## Middleware categories
Alette Signal has 5 middleware categories:
1. `Creation` - middleware preparing request data before execution - body, path, query
params, etc., are all configured here. For example, `input()` and `output()` are 
creational middleware.
2. `Behaviour` - middleware that modify _how_ requests are going to be executed. 
3. `Execution` - middleware that execute requests by calling REST API endpoints, etc.
4. `Transformation` - middleware transforming request response and errors.
5. `Inspection` - middleware hooking into request lifecycle and performing
side effects without modifying response and errors.

:::tip
For full middleware list consult [Alette Signal middleware reference](../middleware-reference/middleware-overview).
:::

## Middleware organization
**Middleware organization** refers to middleware ability to automatically modify and 
sort other middleware before they are initialized.

You can see this behaviour when you add 2 `input()` middleware 
to the same request:
```ts
const query1 = myQuery.with(
    input(as<{ willBeOverridden: true }>()),
    input(as<string>())
)

// The "args" prop will expect a string here,
// not "{ willBeOverridden: true }"
await query1.execute({ args: 'overridden' })
```

:::info
1. The `input()` middleware is configured to remove all previous `input()`
middleware from the chain. This is also true for other middleware like `output()`,
`runOnMount()`, `debounce()`, etc.
2. This behaviour is reflected in blueprint TypeScript types.
:::

## Middleware priority
**Middleware priority** refers to middleware order in 
request blueprint middleware lists. 

You can see this behaviour
with `retryWhen()` and `mapError()` middleware:

```ts
const query1 = myQuery.with(
    input(as<string>()),
    throws(RequestFailedError),
    mapError((error) => new MyCustomError()),
    // The "error" property inside "retryWhen()" is
    // always of "RequestFailedError" type, not "MyCustomError".
    retryWhen(async ({ error }) => {
        return true;
    })
)
```

Even though `mapError()` is placed before `retryWhen()` in
your configuration, their order will be reversed before initialization:
```ts
// After 
myQuery.with(
    input(as<string>()),
    throws(RequestFailedError),
    retryWhen(async ({ error }) => {
        return true;
    }),
    mapError((error) => new MyCustomError()),
)
```
:::info
Middleware sorting by priority is reflected in blueprint TypeScript types.
:::
:::tip
1. If you are not sure about the middleware order of your request blueprint,
always look at its TypeScript types.
2. Most middleware can expose previously set request data,
allowing you to verify its type:
```ts
const query1 = myQuery.with(
    path('/alette'),
    path(
        { /* other request data */ },
        // prevPath is of "/alette" type here
        prevPath => `${prevPath}/signal`
    ),
)
```
:::

## Middleware composition
**Middleware composition** is a feature of Alette Signal that allows same type middleware
chaining in request blueprints. 

Let's compose multiple `map()` middleware to transform our 
server response:
```ts
const query1 = myQuery.with(
    output(as<string>()),
    path('/alette'),
    map((response) => `${response}/map1`),
    map((response) => `${response}/map2`),
    map((response) => `${response}/map3`),
)

// The "response" type will be "${string}/map1/map2/map3"
const response = await query1.execute({ args: 'hey' })
```

Middleware composition also works across blueprints:
```ts
const query1 = myQuery.with(
    output(as<string>()),
    path('/alette'),
    map((response) => `${response}/map1`),
)

const query2 = query1.with(
    map((response) => `${response}/map2`),
)

const query3 = query2.with(
    map((response) => `${response}/map3`),
)

// The "response1" type will be "${string}/map1"
const response1 = await query1.execute({ args: 'hey' })
// The "response2" type will be "${string}/map1/map2"
const response2 = await query2.execute({ args: 'hey' })
// The "response3" type will be "${string}/map1/map2/map3"
const response3 = await query3.execute({ args: 'hey' })
```
:::tip
Notice how `query1`, `query2` and `query3` are executed independently
of each other, each with their own middleware list. Even through `query3`
uses `query2` as a foundation, they never collide with one another. This is 
achieved via [Alette Signal request behaviour reuse](configuring-requests/#reusing-request-behaviour).
:::

## Middleware cascading
**Middleware cascading** is a middleware behaviour that overrides previous 
request data set by other middleware. 

You can see this behaviour when adding multiple `headers()` middleware:
```ts
const query1 = myQuery.with(
    output(as<string>()),
    headers({ 'header1': 'hi' }),
    headers({ 'header2': 'hello' }),
)

// The request will be executed with
// { 'header2': 'hello' } object as headers.
await query1.execute({ args: 'hey' })
```

To preserve data provided by previous cascading middleware, you can pass
a callback as an argument and merge request data manually:
```ts
const query1 = myQuery.with(
    output(as<string>()),
    headers({ 'header1': 'hi' }),
    headers((_, prevHeaders) => ({ ...prevHeaders, 'header2': 'hello' })),
)

// Now the request will be executed with
// { 'header1': 'hi', 'header2': 'hello' } object as headers.
await query1.execute({ args: 'hey' })
```

Manual request data merging also works across blueprints: 
```ts
const query1 = myQuery.with(
    output(as<string>()),
    headers({ 'header1': 'hi' }),
)

const query2 = query1.with(
    headers((_, prevHeaders) => ({ ...prevHeaders, 'header2': 'hello' })),
)

// The request will be executed with
// { 'header1': 'hi' } object as headers.
await query1.execute({ args: 'hey' })
// The request will be executed with
// { 'header1': 'hi', 'header2': 'hello' } object as headers.
await query2.execute({ args: 'hey' })
```