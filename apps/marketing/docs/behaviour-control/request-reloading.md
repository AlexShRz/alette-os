# Request reloading
**Request reloading** in Alette Signal is a [mounted request feature](../getting-started/request-modes.md#request-reloading),
allowing request blueprints to react to external changes by re-requesting the previously obtained data
from the server.

## How does reloading work?
1. The `reload()` function of a mounted request blueprint is called.
2. If the `.using()` method is configured, the
[bound request settings function](../getting-started/configuring-requests.md#request-setting-binding)
is called, retrieving up-to-date request settings.
3. If the `reload()` function was called for the first time with the [mounted reloading](#mounted-reloading) enabled,
**the `reloadable()` check is skipped and the server endpoint is called**.
4. If a **predicate function** was not provided to the `reloadable()` middleware,
and the `input()` middleware is absent, the server endpoint is called.
5. If a **predicate function** was provided to the `reloadable()` middleware, 
the predicate function is called:
   1. If the predicate function returns `true`, the server endpoint is called.
   2. If the predicate function returns `false`, the reloading is cancelled.
6. If the `reloadable()` middleware has no arguments, and the `input()` middleware
is present, a deep equality argument check is performed:
   1. If the arguments are different, the server endpoint is called.
   2. If the arguments are identical, the reloading is cancelled.

:::info
**A predicate function** is a function that returns `true` or `false`.
:::

## Mounted reloading
**Mounted reloading** is a mounted request behaviour, allowing 
request blueprints to request data from the server by automatically calling the `reload()` function 
on `.mount()`:
```ts
const getData = custom(
    runOnMount(),
	factory(() => true)
)

const { when } = getData.mount();

// No "execute()" invocation is needed.

when(({ isLoading }) => {
    if (isLoading) {
        console.log("Mounted reloading is active.")
	}
})
```
:::info
The `runOnMount()` middleware with no arguments is identical to `runOnMount(true)`.
:::
:::warning
**Mounted reloading** is enabled by default for the [query](../request-behaviour/query.md) request blueprint.
:::

## Disabling mounted reloading
To disable mounted reloading, pass the `runOnMount()` middleware 
to the request blueprint:
```ts
const getData = custom(
    runOnMount(false),
	/* ... */
)

const { when } = getData.mount();

when(({ isLoading }) => {
    if (isLoading) {
        // Never reached
        console.log("Mounted reloading is active.")
	}
})
```

## Predicate-based mounted reload
To enable predicate-based mounted reload,
pass a **predicate function** to the `runOnMount()` middleware:
```ts
const getData = custom(
    runOnMount(({ context }) => true),
    // or
    runOnMount(async ({ context }) => false),
)
```
:::danger
The `runOnMount()` **predicate function** is called **once** on request mount.
:::

## Reload control
To control request reloading, pass a **predicate function** to the `reloadable()` middleware:
```ts
let myNumber = 5;

const getData = custom(
    input(as<number>()),
    runOnMount(false),
    reloadable(({ prev, current }, { context }) => {
        if (!prev) {
            return true;
		}
        
        return prev.args < current.args;
	})
).using(() => ({ args: myNumber }))

const { reload } = getData.mount()

// Executed - no "prev" property is available for inspection yet.
// myNumber = 5
reload()

myNumber = 3

// Skipped - the "prev" property argument number is 
// higher than 3:
// prevMyNumber = 5
// myNumber = 3
reload()

myNumber = 10

// Executed - the "prev" property argument number is 
// lower than 10:
// prevMyNumber = 5
// myNumber = 10
reload()
```

:::tip
The `reloadable()` middleware can accept async **predicate functions**:
```ts
custom(
    reloadable(
        async ({ prev, current }, { context }) => true
    )
)
```
:::