# Request lifecycle
**Request lifecycle** in Alette Signal is a collection of request execution stages you 
can inspect and manipulate. 

## Request execution stages
There are 7 request execution stages:
1. [Mounted](#mounted-request-execution-stage)
2. [Unmounted](#the-unmounted-stage)
3. [Triggered](#the-triggered-stage)
4. [Cancelled](#the-cancelled-stage)
5. [Loading](#the-loading-stage)
6. [Succeeded](#the-succeeded-stage)
7. [Failed](#the-failed-stage)

## The "Mounted" stage
**The "mounted" request execution stage** is activated
when a [request is mounted](../getting-started/request-modes#mounted-request-mode) 
using the `.mount()` method:
```ts
query.mount()
```
:::tip
The "mounted" request execution stage is activated for
mounted requests even if the `runOnMount()` middleware is not present or 
set to `false` - `runOnMount(false)`.

:::
:::danger
The "mounted" request execution stage is skipped for
[one shot requests](../getting-started/request-modes.md#one-shot-request-mode).
:::

To run side effects in the "mounted" stage use the `tapMount()`
middleware:
```ts
query
    .with(
        tapMount(({ context }) => {
            console.log('Mounted')
        })
    )
    .mount()
```

:::warning
`tapUnmount()` and other middleware invoked during the "mounted" request execution stage 
cannot access request data.
:::

## The "Unmounted" stage
**The "unmounted" request execution stage** is activated when a  
mounted request is unmounted using the `unmount()` function:
```ts
const { unmount } = query.mount()
unmount()
```

:::danger
The "unmounted" request execution stage is skipped for
[one shot requests](../getting-started/request-modes.md#one-shot-request-mode).
:::

To run side effects in the "unmounted" stage use the `tapUnmount()`
middleware:
```ts
query
    .with(
        tapUnmount(({ context }) => {
            console.log('Unmounted')
        })
    )
    .mount()
```

:::warning
`tapUnmount()` and other middleware invoked during the "unmounted" request execution stage
cannot access request data.
:::

## The "Triggered" stage
**The "triggered" request execution stage** is activated when the system
_acknowledges_ a request execution instruction sent using the `.execute()` method or the `execute()` function
for [mounted requests](../getting-started/request-modes#mounted-request-mode):
```ts
await query.execute()
// or
const { execute } = query.mount()
execute()
```

:::danger
1. **In the mounted request mode** the "triggered" request execution stage does not guarantee execution -
middleware like `debounce()` or `throttle()` can still "swallow" the request.
2. The "triggered" request execution stage is skipped when the `reload()`
   function of a mounted request is called:
```ts
const { reload } = query.mount()
// Will not activate the "triggered" stage
reload()
```
:::

To run side effects during the "triggered" stage use the `tapTrigger()`
middleware:
```ts
query
    .with(
        tapTrigger(({ context }) => {
            console.log('Unmounted')
        })
    )
    .mount()
```

:::warning
`tapTrigger()` and other middleware invoked during the "triggered" request execution stage
cannot access request data.
:::

## The "Cancelled" stage
**The "cancelled" request execution stage** is activated when the system
cancels the request after receiving a cancellation instruction
from the `cancel()` function of a [mounted request](../getting-started/request-modes#mounted-request-mode):
```ts
const { cancel, execute } = query.mount()
execute()
// After some time
cancel()
```

:::danger
The "cancelled" request execution stage is skipped for
[one shot requests](../getting-started/request-modes.md#one-shot-request-mode).
:::

To run side effects during the "cancelled" stage use the `tapCancel()`
middleware:
```ts
query
    .with(
        tapCancel(({ args, path, context }) => {
            console.log(`The request was manually cancelled:`, { args })
        })
    )
    .mount()
```

## The "Loading" stage
**The "loading" request execution stage** is activated when
request execution begins.

To run side effects during the "loading" stage use the `tapLoading()`
middleware:
```ts
query
    .with(
        tapLoading(({ args, path, context }) => {
            console.log('Executing request...')
        })
    )
    .mount()
```

## The "Succeeded" stage
**The "succeeded" request execution stage** is activated when 
a successful response is received from the server.

To run side effects during the "succeeded" stage use the `tap()`
middleware:
```ts
query
    .with(
        tap(response, ({ args, path, context }) => {
            console.log(`Succeeded with:`, { response })
        })
    )
    .mount()
```

## The "Failed" stage
**The "failed" request execution stage** is activated when an error that can be recovered
from is received from the server.

To run side effects during the "failed" stage use the `tapError()`
middleware:
```ts
query
    .with(
        tapError(error, ({ args, path, context }) => {
            console.log(`Failed with an error:`, { error })
        })
    )
    .mount()
```