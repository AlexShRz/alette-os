# Request throttling
**Request throttling** in Alette Signal is a 
[mounted request](../getting-started/request-modes.md#mounted-request-mode)
feature, allowing request blueprints to limit how many requests can be sent within a specified time period.

## Throttling requests
To throttle requests, add the `throttle()` middleware to a request blueprint:
```ts
const loadMorePosts = query(
    /* ... */
    throttle(300),
	// or
	throttle("300 millis"),
	// or
	throttle("1 second"),
	// or
	throttle("10 seconds")
);

const { execute } = loadMorePosts.mount();

// Will be throttled
execute();
execute();
execute();
```
:::danger
**Request throttling** is skipped for
[one shot requests](../getting-started/request-modes.md#one-shot-request-mode).
:::

## Disabling throttling
To disable throttling per request, set the `skipThrottle` request
setting to `true`:
```ts
// ...

const { execute } = loadMorePosts.mount();

// Throttle will be ignored
execute({ skipThrottle: true });

// Later...

// Will be throttled
execute();
```

## Reload throttling
Throttling also works with [request reloading](request-reloading.md):
```ts
const loadMorePosts = query(
    /* ... */
    throttle("1 second"),
);

const { execute, reload } = searchPosts.mount();

// Will be throttled
reload()
reload()
reload()
reload()
```