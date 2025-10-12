# Request state
**Request state** in Alette Signal is a record describing
the current [request execution stage](request-lifecycle.md).

## Accessing request state
To access request state once, call the `getState()` function
of a mounted request:
```ts
const { getState } = query.mount()

const {
    isUninitialized,
    isLoading,
    isSuccess,
    isError,
    data,
    error,
    settings    
} = getState()
```
:::warning
`getState()` is accessible only in
[mounted requests](../getting-started/request-modes.md#mounted-request-mode).
:::

## Subscribing to changes
To subscribe to request state changes, pass a callback to the `when()` function
of a mounted request:
```ts
const { when } = query.mount()

const unsubscribe = when(({ 
  isUninitialized,
  isLoading,
  isSuccess,
  isError,
  data,
  error,
  settings
}) => {
    // react to changes here
});
```
:::warning
`when()` is accessible only in
[mounted requests](../getting-started/request-modes.md#mounted-request-mode).
:::

To unsubscribe from request state changes, call `unsubscribe()`:
```ts
const { when } = query.mount()

const unsubscribe = when(({ isSuccess }) => {
    if (isSuccess) {
        unsubscribe()
    }
});
```

:::tip
Request state subscribers are unsubscribed automatically after request `unmount()`.
```ts
const { when, unmount } = query.mount()

// Will be unsubscribed automatically
const unsubscribe = when(() => {});

// After some time
unmount()

// Not needed
// unsubscribe()
```
:::

## Analyzing request state
To analyze request state, refer to these 6 state combinations:

1. **The "uninitialized" request state combination** represents a 
request that has not been started yet:
```ts
{
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
    data: null;
    error: null;
    settings: null;
}
```
2. **The "loading" request state combination** represents an
   in-flight request:
```ts
{
    isUninitialized: false; // is always "false" from now on
    isLoading: true;
    isSuccess: false;
    isError: false;
    data: null;
    error: null;
    settings: null;
}
```
3. **The "error" request state combination** represents a
request that has been finished with a recoverable error:
```ts
{
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
    data: null;
    error: [Your_Error_Type];
    settings: [Used_Request_Settings];
}
```
4. **The "success" request state combination** represents a
   request that has been finished with a successful response:
```ts
{
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
    data: [Your_Response_Type];
    error: null;
    settings: [Used_Request_Settings];
}
```
5. **The "failed-and-restarting" request state combination** represents a
   request that has failed with a recoverable error and is being restarted:
```ts
{
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: true;
    data: null;
    error: [Your_Error_Type];
    settings: [Used_Request_Settings];
}
```
6. **The "succeeded-and-restarting" request state combination** represents a
   request that has succeeded with a response and is being restarted:
```ts
{
    isUninitialized: false;
    isLoading: true;
    isSuccess: true;
    isError: false;
    data: [Your_Response_Type];
    error: null;
    settings: [Used_Request_Settings];
}
```
:::info
"Request restarting" means calling the `execute()` or `reload()` functions of a 
mounted request.
:::