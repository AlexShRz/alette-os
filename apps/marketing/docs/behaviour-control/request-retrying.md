# Request retrying
**Request retrying** in Alette Signal is a feature allowing
[request blueprints](../getting-started/configuring-requests.md#request-blueprint)
to rerun the failing request with identical
[request settings](../getting-started/configuring-requests.md#request-settings) 
when a **retry condition** is met.

## Retrying requests
To retry a request, pass the `retry()` middleware to the request blueprint:
```ts
const deletePost = mutation(
    retry({
		times: 2,
	})
)
```
:::danger
While a request is being retried, no errors are thrown.
:::
:::warning
While a request is being retried, [debouncing](./request-debouncing.md)
and
[throttling](./request-throttling.md) are ignored.
:::
:::warning
The `retry()` middleware override previous `retry()` middleware:
```ts
const deletePost = mutation(
    retry({
        times: 2,
    })
)

const deleteDraftPost = deletePost.with(
    // This will override the "retry()" inferited
	// from the "deletePost" request blueprint
    retry({
        times: 5,
    })
)
```
:::

## Status-based retrying
To retry a failing request when a certain HTTP status is returned, configure the `whenStatus`
property of the `retry()` middleware:
```ts
const deletePost = mutation(
    retry({
		times: 2,
		whenStatus: [401, 500, 429]
	})
)
```

To retry a request based _unless_ a certain HTTP status is returned, configure the `unlessStatus`
property of the `retry()` middleware:
```ts
const deletePost = mutation(
    retry({
		times: 2,
		unlessStatus: [401, 500, 429]
	})
)
```
:::danger
The `whenStatus` property overrides the `unlessStatus` property of the `retry()` middleware:
```ts
const deletePost = mutation(
    retry({
		times: 2,
		whenStatus: [401],
		// "unlessStatus" will be ignored
		unlessStatus: [401, 500, 429]
	})
)
```
:::

## Delay between retries
To add a delay between request retry attempts, configure the `backoff`
property of the `retry()` middleware:
```ts
const deletePost = mutation(
    retry({
		times: 5,
		backoff: ["1 second", "5 seconds", "10 seconds"],
	})
)

// 1st retry
// Wait 1 second...
// 2nd retry
// Wait 5 seconds...
// 3rd retry
// Wait 10 seconds...
// 4th retry
// Wait 10 seconds...
// 5th retry
await deletePost.execute()
```

## Retry condition
**A retry condition** is a function taking information about the failed
request and returning `true` to allow for the request retry, or `false`
to prohibit the request from being retried:
```ts
async ({ error, attempt }, { args: postId, path }) => {
    if (error.getStatus() === 429) {
        return true;
    }

    return postId === 5;
}
```

## Custom retry
To create a custom retry, pass a [retry condition](#retry-condition) to the `retryWhen` middleware:
```ts
import { wait, retryWhen, input, path } from '@alette/signal';
// ...

const deletePost = mutation(
    input(as<number>()),
    path('/posts'),
    retryWhen(async ({ error, attempt }, { args: postId, path }) => {
        if (error.getStatus() === 429) {
            await wait("5 seconds");
            return true;
		}

		return postId === 5;
	})
)

await deletePost.execute({ args: 3 })
```

To add a delay between retries inside a `retryWhen()` retry condition, use
the `wait()` function provided by Alette Signal:
```ts
import { wait, /* ... */ } from '@alette/signal';

retryWhen(async ({ attempt }) => {
    if (attempt === 0) {
    	await wait(1000);
	}

    if (attempt === 1) {
        await wait("5 seconds");
    }

	await wait("10 seconds");
    return true;
})
```

:::tip
Request data is available as a second argument of the `retryWhen()` retry 
condition:
```ts
retryWhen(async (_, { args: postId, path, context }) => {
    /* ... */
})
```
:::
:::warning
While a request is being retried, [debouncing](./request-debouncing.md)
and
[throttling](./request-throttling.md) are ignored.
:::
:::warning
The `retryWhen()` middleware override previous `retryWhen()` middleware:
```ts
const deletePost = mutation(
    retryWhen(() => true)
)

const deleteDraftPost = deletePost.with(
    // This will override the "retryWhen()" inferited
	// from the "deletePost" request blueprint
    retryWhen(() => false)
)
```
:::