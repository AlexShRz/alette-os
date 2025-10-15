# Cookie handler
**A cookie handler** in Alette Signal is an [access control](access-control.md) utility, managing
cookie lifecycle and cookie exchange between the browser and the server.

## Cookie setter
**A cookie setter** is a synchronous or asynchronous function, performing a 
cookie setting operation without returning anything back to the cookie handler.
```ts
async ({
    id,
	context,
	getCredentials,
	getCredentialsOrThrow,
}) => {
	await refreshAuthCookie.execute();
}
```
:::danger
1. [Request blueprints](../getting-started/configuring-requests.md#request-blueprint) 
obtaining or refreshing cookies, **must** 
include the `credentials()` middleware, setting `{ credentials: "include" }` under the hood:
```ts
const refreshAuthCookie = mutation(
    /*...*/
    credentials()
) 
```
2. If credentials are not included or set to `{ credentials: "omit" }`,
the server will not be able to set or update the cookie.
:::

## Cookie credentials
**Cookie credentials** is an arbitrary data stored inside a cookie handler,
and is used by [cookie setters](#cookie-setter) to [set](#setting-cookies) or
[refresh](#refreshing-cookies) the cookie.
```ts
async ({
	/* ... */
	getCredentials,
	getCredentialsOrThrow,
}) => {
    const { email, password } = getCredentialsOrThrow();
	await refreshAuthCookie.execute({ 
		args: { email, password } 
    });
}
```

## Configuring cookie handlers
To configure a cookie handler, call the `cookie()`
function obtained from the
[Alette Signal core plugin](../getting-started/configuring-requests.md#plugins-in-alette-signal), and
pass a [cookie setter](#cookie-setter) to the `.from()` cookie handler **builder** method:
```ts
// ./src/api/base.ts
const core = coreApiPlugin();
export const { cookie } = core.use();

// ./src/api/auth.ts
// ...
const refreshAuthCookie = mutation(/* ... */)

export const authCookie = cookie()
	.from(async () => {
        await refreshAuthCookie.execute();
	})
	.build();
```

:::tip
The initial cookie setter can be overridden later:
```ts
export const thirdPartyAuthCookie = cookie()
	.from(() => {
        console.error('Third party cookie setter was not implemented.');
        return '';
	})
	.build();

// Overrides the initial cookie setter
thirdPartyAuthCookie.from(() => refreshAuthCookie.execute())
```
:::

:::tip
Alette Signal allows for multiple cookie handlers in the same application:
```ts
export const appAuthCookie = cookie()
	.from(() => refreshAuthCookie.execute())
	.build();

export const serviceAuthCookie = cookie()
    .from(() => refreshServiceAuthCookie.execute())
    .build();
```
:::

## Configuring credential storage
To configure the credential storage of a cookie handler, pass a runtime schema
implementing the [Standard Schema](https://standardschema.dev/)
interface to the `.credentials()` cookie handler **builder** method:
```ts
const authCookie = cookie()
	.credentials(z.object({
		email: z.string(),
		name: z.string()
	}))
	.from(() => refreshAuthCookie.execute())
	.build();
```

To access cookie credentials, [destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)
the first cookie setter argument:
```ts
const authCookie = cookie()
	.credentials(z.object({
		email: z.string(),
		password: z.string()
	}))
	.from(async ({ 
		getCredentials,
		getCredentialsOrThrow, 
    }) => {
        const { email, password } = getCredentialsOrThrow();
        await refreshAuthCookie.execute({ args: { email, password } })
	})
	.build();
```

## Setting cookie credentials
To set cookie credentials, call the `.using()` cookie handler method:
```ts
authCookie.using({ 
	email: 'alette-signal@mail.com',
	password: '12345',
})
```

To set cookie credentials while accessing previous credentials,
pass a function to the `.using()` cookie handler method:
```ts
authCookie.using(({ previous, context }) => {
    const previousPassword = previous?.password;
    
    return {
        email: 'alette-signal@mail.com',
        password: previousPassword || '12345',
    };
})
```
:::tip
The `.using()` cookie handler method can be used with UI forms:
```tsx
// React component
const Form = () => {
    // Pseudo code
    const { subscribe, /* ... */ } = useForm();

    useEffect(
        () => subscribe(({ values: { email, password } }) => {
            authCookie.using({ email, password });
		}),
		[]
	);
    
    return <form>{ /* ... */ }</form>
}
```
:::

## Setting cookies
To set a cookie from the server, invoke the [cookie setter](#cookie-setter)
by calling the `.load()` method on the cookie handler:
```ts
await authCookie.load();
```

:::tip
1. A single `.load()` call is made, while other calls to the same `.load()` method are queued.
2. If the cookie is set successfully, all queued `.load()` callers 
are silently cancelled:
```ts
await Promise.all([
   /*
   * Only 1 cookie setting operation 
   * will be made, while all other queued calls
   * to the `.load()` method will be cancelled.
   * */
   authCookie.load(),
   authCookie.load(),
   authCookie.load(),
   authCookie.load(),
   authCookie.load(),
])
```
:::

## Invalidating cookies
To refresh a set cookie, call the `.refresh()` method on the cookie handler:
```ts
authCookie.invalidate();
```

Next time the `.load()` method is called, [the cookie is reset](#setting-cookies):
```ts
await authCookie.load();
```
:::warning
The `.invalidate()` cookie handler method does not call the [cookie setter](#cookie-setter) automatically.
:::

## Refreshing cookies
To refresh a cookie in the background, call the `.refresh()` method on the cookie handler:
```ts
authCookie.refresh();
```

## Subscribing to cookie changes
To subscribe to cookie changes, call the `.onStatus()` cookie handler method:
```ts
const unsubscribe = authCookie.onStatus({
    loading: async ({ context }) => {
        // ...
    },
    valid: async ({ context }) => {
        // ...
    },
    invalid: async ({ context }) => {
        // ...
    },
});
```
:::tip
Cookie handlers allow subscribing to a subset of the cookie status events:
```ts
authCookie.onStatus({
    valid: () => {
        // ...
    },
});
```
:::
:::tip
Cookie status subscriptions can be used to synchronize UI and cookie updates:
```tsx
// React component
const AuthScreen = () => {
    const [isCookieValue, setIsCookieValid] = useState(false);

    useEffect(() => {
        return authCookie.onStatus({
            loading: async ({ context }) => {},
            valid: async ({ context }) => {},
            invalid: async ({ context }) => {},
        })
    }, []);

    if (isCookieValue) {
        return <div>{ /*...*/ }</div>;
    }

    return <div>Unauthorized</div>;
}
```
:::

## Periodic cookie refresh
To set up periodic cookie refresh in the background,
pass an interval value to the `.refreshEvery()` cookie handler **builder** method:
```ts
const authCookie = cookie()
	/* ... */
    .refreshEvery("20 seconds")
	// or
    .refreshEvery(5000)
	// or
    .refreshEvery("1 hour")
	.build();
```
:::info
Periodic cookie refresh uses the [cookie setting algorithm](#cookie-setting-algorithm) under the hood.  
:::

## Cookie setting algorithm
**Alette Signal cookie setting algorithm has 6 steps**:
1. The `.load()` method of the cookie handler is called.
2. If the last set cookie is **valid**, the
   [cookie setter](#cookie-setter) is not called.
3. If the last set cookie is **invalid**, the
   cookie setter is invoked.
4. If the last set cookie is absent, the
   cookie setter is invoked.
5. If the cookie setter throws an error,
   the last set cookie is marked as **invalid**.
6. If the cookie setter succeeds, the cookie is marked as **valid** and 
the server replaces the old cookie automatically.