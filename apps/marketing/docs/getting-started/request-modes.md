# Request modes
Alette Signal has 2 request modes - **"One shot"** and **"Mounted"**. 

## "One shot" request mode
**The "one shot" request mode** is a mode where your request is executed once, and every
used middleware is shutdown.
This mode is activated when you call the `.execute()`
method on request blueprints:
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
a request is executed in the background.
This mode is used for running request just for its side effects while ignoring the result.

You can execute requests in the "spawn" mode by calling the `.spawn()`
method on request blueprints:
```ts
// Executed in the background
// returns void
myQuery.spawn({ 
    args: { hey: 'Alette Signal' } 
})
```

## "Mounted" request mode
**The "mounted" request mode** is a mode where your request blueprint acts as 
a "worker" that can process multiple requests, 
while keeping its middleware and their state alive.

This mode is activated when you call the `.mount()`
method on request blueprints:
```ts
const { execute, when, cancel, reload, unmount } = myQuery.mount()
```

:::danger
Make sure to `unmount()` your mounted requests when you are done
with them. Otherwise, middleware and their state will
be kept in memory indefinitely.
:::

To send a request, call `execute()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()
execute({ args: { hey: 'Alette Signal' } })
```

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
  /*...*/ 
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
1. There is no limit to the amount of subscribers you add with `when()`.
Every subscriber is executed sequentially one after the other when
new request state is available.
2. Every subscriber is unsubscribed automatically when `unmount()` is called.
:::

To "peek" at the current request state use `getState()`:
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
    /*...*/
} = getState()
```
:::tip
"Peeking" is especially useful when you are testing requests. For example, here is how 
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
:::

To execute a mounted request again with the 
same arguments, call `reload()`:
```ts
const { getState, execute, when, cancel, reload, unmount } = myQuery.mount()
execute({ args: { hey: 'Alette Signal' } })
// After some time
reload()
```
:::info
`reload()` is called automatically when the `.mount()` method is called with 
`runOnMount()` middleware provided.
:::
:::danger
1. The `reload()` function expects arguments to be ready the moment it is called. If they are not available
and the `input()` middleware is present, the whole system will fail with a fatal `ArgumentValidationError`.
2. To avoid this, [bind your request settings using the `.using()` method.](configuring-requests/#request-setting-supplier) 
:::
