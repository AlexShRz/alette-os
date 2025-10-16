# Request modes
Alette Signal has 2 request modes - **"One shot"** and **"Mounted"**. 

## "One shot" request mode
**The "one shot" request mode** is a mode where a request is executed once, and every
used middleware is shutdown.
This mode is activated when the `.execute()`
method on [request blueprints](configuring-requests.md#request-blueprint) is called:
```ts
const response = await myQuery.execute({ 
    args: { hey: 'Alette Signal' } 
})
```

::: tip
You can think of the "one shot" request mode as a
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that
resolves with a response or rejects with an error.
:::

### "Spawn" request mode
**The "spawn" request mode** is a version of the "one shot" request mode where
the request is executed in the background.
This mode is used for running request side effects while ignoring request result.

The "spawn" mode is activated when the `.spawn()` request blueprint method is called:
```ts
// Executed in the background
// returns void
myQuery.spawn({ 
    args: { hey: 'Alette Signal' } 
})
```

## "Mounted" request mode
**The "mounted" request mode** is a mode where [request blueprints](configuring-requests.md#request-blueprint)
act as "workers" processing multiple requests, 
while keeping their middleware and their state alive.

This mode is activated when the `.mount()`
request blueprints method is called:
```ts
const { execute, when, cancel, reload, unmount } = myQuery.mount()
```

:::danger
Make sure to `unmount()` your mounted requests when you are done
with them. Otherwise, middleware and their state will
be kept in memory indefinitely.
:::

### Sending requests
To send a request, call `execute()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()
execute({ args: { hey: 'Alette Signal' } })
```

### Cancelling requests
To cancel an in-flight request, call `cancel()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()
execute({ args: { hey: 'Alette Signal' } })
// After some time
cancel()
```
:::info
Request cancellation reverts request
state back to the previous one, while cancelling in-flight request
using [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) internally.
:::
:::warning
Request cancellation does not throw errors.
:::

### Subscribing to changes
To subscribe to request state changes, use `when()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()

const unsubscribe = when(({ 
  isUninitialized,
  isLoading,
  isSuccess,
  isError,
  data,
  error,
}) => {
    if (isSuccess && data) {
        console.log({ data });
        unsubscribe();
    }

    if (isError && error) {
        console.log({ error });
        unsubscribe();
        unmount();
    }
});

execute({ args: { hey: 'Alette Signal' } })
```

:::info
1. There is no limit to the amount of subscribers added with `when()`.
Every subscriber is executed sequentially one after the other when
new request state is available.
2. Every subscriber is unsubscribed automatically when `unmount()` is called.
:::

### State peeking
To "peek" at the current [request state](../request-behaviour/request-state.md) use `getState()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()

execute({ args: { hey: 'Alette Signal' } })

const {
    isUninitialized,
    isLoading,
    isSuccess,
    isError,
    data,
    error,
} = getState()
```
:::tip
1. "Peeking" can be used for request testing. For example, here is how 
to wait for the `error` request state in `vitest`:
```ts
test('it fails', async () => {
    // ...
    
    const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()
    execute({ args: { hey: 'Alette Signal' } })

    await vi.waitFor(() => {
        expect(getState().error).toBeInstanceOf(MyError)
    })
})
```
2. To learn more about api testing, refer to 
the [Alette Signal testing guide](../testing/environment-requirements.md).
:::

### Used request settings
To get used request settings, use `getState().settings`:
```ts
const { getState } = myQuery.mount()

// "settings1" is null here
const settings1 = getState().settings

execute({ args: { hey: 'Alette Signal' } })

// ...wait for the request to finish

// "settings2" is "{ args: { hey: 'Alette Signal' } }" here
const settings2 = getState().settings;
```
:::danger
The `settings` property of the state returned from `getState()` is `null`
before first request execution. The `settings` property is updated each time
the request finishes successfully or fails.
:::

### Request reloading
To execute a mounted request again with the 
same arguments, call `reload()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()
execute({ args: { hey: 'Alette Signal' } })
// After some time
reload()
```
:::tip
To learn how to control request reloading, see
[Alette Signal request reloading guide](../behaviour-control/request-reloading.md).
:::
:::danger
1. The `reload()` function expects arguments to be ready the moment it is called. If they are not available
and the `input()` middleware is present, the whole system will fail with a fatal `ArgumentValidationError`.
2. To avoid this, [bind request settings](configuring-requests/#request-setting-binding) 
using the `.using()` method. 
:::
