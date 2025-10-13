# Request debouncing
**Request debouncing** in Alette Signal is a [mounted request](../getting-started/request-modes.md#mounted-request-mode)
feature, allowing request blueprints to send the **last** remembered request to the server 
after a period of inactivity.

## Debouncing requests
To debounce requests, add the `debounce()` middleware to a request blueprint:
```ts
const searchPosts = query(
    /* ... */
    debounce(300),
	// or
	debounce("300 millis"),
	// or
	debounce("1 second"),
	// or
	debounce("10 seconds")
);

const { execute } = searchPosts.mount();

// Will be debounced
execute({ args: "Alet" });
execute({ args: "Alette" });
execute({ args: "Alette Signal" });
```
:::danger
**Request debouncing** is skipped for
[one shot requests](../getting-started/request-modes.md#one-shot-request-mode).
:::

## Disabling debounce
To disable debouncing per request, set the `skipDebounce` request 
setting to `true`:
```ts
// ...

const { execute } = searchPosts.mount();

// Debounce will be ignored
execute({ args: "Alette", skipDebounce: true });

// Later...

// Will be debounced
execute({ args: "Alette Signal" });
```

## Reload debouncing
Debouncing also works with [request reloading](request-reloading.md):
```ts
let searchValue = 'hey';

const searchPosts = query(
    /* ... */
    debounce(300),
).using(() => ({ args }));

const { execute, reload } = searchPosts.mount();

// Will be debounced
reload() // arguments - "hey"
searchValue = searchValue + ' Alette'
reload() // arguments - "hey Alette"
searchValue = searchValue + ' Signal'
reload() // arguments - "hey Alette Signal"
```