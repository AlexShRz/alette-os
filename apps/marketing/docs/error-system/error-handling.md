# Error handling
Error handling in Alette Signal is performed by handling [fatal, recoverable and unknown errors](error-types.md) 
either [locally](#local-error-handling) or [globally](#global-error-handling).

## Local error handling
To handle errors locally for [mounted requests](../getting-started/request-modes.md#mounted-request-mode),
extract the error using `getState().error`, or by subscribing to the request state using `when()`:
```ts
const deletePost = mutation(/* ... */)

const { getState, when, execute } = deletePost.mount();

when(({ isError, error }) => {
    if (isError && error) {
        console.log('Failed with an error:', { error })
	}
})

execute()

// Or

// After request failure...
const { isError, error } = getState()

if (isError && error) {
    console.log('Failed with an error:', { error })
}
```

To handle errors locally for [one shot requests](../getting-started/request-modes.md#one-shot-request-mode),
wrap the request in `try/catch`:
```ts
try {
    await deletePost()
} catch (error) {
    if (error instanceof RequestFailedError) {
        console.log('Failed with an error:', { error })
	}
}
```

:::tip
To understand what request state combination represents failure, refer to the 
[request state combination](../request-behaviour/request-state.md#analyzing-request-state) 
documentation.
:::
:::tip
To understand how to retry errors, refer to the
[Alette Signal error retrying guide](../behaviour-control/request-retrying.md).
:::

## Global error handling
To handle errors globally in Alette Signal, set a global error handler 
using the `setErrorHandler()` [api instruction](../getting-started/api-configuration.md#api-client-instruction):
```ts
api.tell(
    setErrorHandler((error, { context }) => {
        // Your custom logic
	}),
)
```

Global error handlers can also be async:
```ts
setErrorHandler(async (error, { context }) => {
    // Your custom logic
})
```

:::warning
You can have only one global error handler active.  
:::
:::danger
Requests executed inside the global error handler will not complete 
if the system was shutdown after a [fatal error](../error-system/error-types.md#fatal-errors)
was caught **automatically**.
```ts
api.tell(
    setErrorHandler(async (error, {context}) => {
        if (error instanceof FatalApiError) {
            // Will never finish
            await reportError({ args: error.toString() })
        }
    })
)

const myRequest = query(
    /* ... */
    // Will fail with a fatal error and 
	// crash the system.
    path('invalid path')
);

await myRequest()
```
:::



To match a specific error type, use `instanceof`:
```ts
api.tell(
    setErrorHandler((error) => {
        if (error instanceof UnknownErrorCaught) {
            // Your custom logic
		}
	}),
)
```

To send an error for global error handling, use 
the `handleError()` [api instruction](../getting-started/api-configuration.md#api-client-instruction):
```ts
api.tell(
    setErrorHandler((error) => {
        // Your custom logic
	}),
)

api.tell(
    handleError(new MyError())
)
```
:::danger
1. Sending [fatal errors](error-types.md#fatal-errors) manually to the global error handler
**will crash the system**.
2. [Recoverable errors](error-types.md#recoverable-errors)
   are not sent to the global error handler automatically.  
:::

:::warning
Manual error sending is used **mostly** for testing -
avoid using `handleError()` in production code.
:::
