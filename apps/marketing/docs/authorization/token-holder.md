# Token holder
**A token holder** in Alette Signal is an [access control](access-control.md) helper, storing a value 
acting as a JWT or OAuth token and a value acting as a refresh token,
while managing their lifecycle.

## Token provider
**A token provider** is a synchronous or asynchronous function, returning a value
acting as a JWT or OAuth token and a value acting as a refresh token to the token holder:
```ts
async ({
    id,
	prevToken,
	refreshToken,
	context,
	getCredentials,
	getCredentialsOrThrow,
}) => {
	const { accessToken, refreshToken } = await getToken.execute();
	return {
        token: accessToken,
        refreshToken
	};
}
```
:::tip
Token providers can omit refresh tokens:
```ts
async () => {
    const { accessToken, refreshToken } = await getToken.execute();
	return accessToken;
}
```
:::

## Token credentials
**Token credentials** is an arbitrary data stored inside a token holder,
and is used by [token providers](#token-provider) to [obtain](#obtaining-tokens) or
[refresh](#refreshing-tokens) tokens.
```ts
async ({
	/* ... */
	getCredentials,
	getCredentialsOrThrow,
}) => {
    const { email, password } = getCredentialsOrThrow();
	const { accessToken, refreshToken } = await getToken.execute({ 
		args: { email, password } 
    });

	return {
        token: accessToken,
        refreshToken
	};
}
```

## Configuring token holders
To configure a token holder, call the `token()`
function obtained from the
[Alette Signal core plugin](../getting-started/configuring-requests.md#plugins-in-alette-signal), and 
pass a [token provider](#token-provider) to the `.from()` token holder **builder** method:
```ts
// ./src/api/base.ts
const core = coreApiPlugin();
export const { token } = core.use();

// ./src/api/auth.ts
// ...
const getToken = mutation(/* ... */)

export const jwtToken = token()
	.from(async () => {
        const token = await getToken.execute();
        return token;
	})
	.build();
```

Return a record from the token provider to save both the token and the refresh token inside the
token holder:
```ts
export const jwtToken = token()
	.from(async () => {
        const { accessToken, refreshToken } = await getToken.execute();
        return {
            token: accessToken,
            refreshToken
		};
	})
	.build();
```

:::danger
1. If a non-string value is returned to act as a **token**, the 
`TokenTypeValidationError` [fatal error](../error-system/error-types.md#fatal-errors) will be thrown.
2. If a non-string value is returned to act as a **refresh token**, 
the `RefreshTokenTypeValidationError` [fatal error](../error-system/error-types.md#fatal-errors) will be thrown.
:::

:::tip
The initial token provider can be overridden:
```ts
export const thirdPartyToken = token()
	.from(() => {
        console.error('Third party token provider was not implemented.');
        return '';
	})
	.build();

// Overrides the initial token provider
thirdPartyToken.from(() => getToken.execute())
```
:::

:::tip
Alette Signal allows for multiple token holders in the same application:
```ts
export const jwtToken = token()
	.from(() => getToken.execute())
	.build();

export const aiKey = token()
    .from(() => process['env']['AI_KEY'])
    .build();
```
:::

## Configuring credential storage
To configure the credential storage of a token holder, pass a runtime schema 
implementing the [Standard Schema](https://standardschema.dev/) 
interface to the `.credentials()` token holder **builder** method:
```ts
const jwtToken = token()
	.credentials(z.object({
		email: z.string(),
		name: z.string()
	}))
	.from(() => getToken.execute())
	.build();
```

To access token credentials, [destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)
the first token provider argument:
```ts
const jwtToken = token()
	.credentials(z.object({
		email: z.string(),
		password: z.string()
	}))
	.from(({ 
		getCredentials,
		getCredentialsOrThrow, 
    }) => {
        const { email, password } = getCredentialsOrThrow();
        return getToken.execute({ args: { email, password } })
	})
	.build();
```

## Setting token credentials
To set token credentials, call the `.using()` token holder method:
```ts
jwtToken.using({ 
	email: 'alette-signal@mail.com',
	password: '12345',
})
```

To set token credentials while accessing previous credentials,
pass a function to the `.using()` token holder method:
```ts
jwtToken.using(({ previous, context }) => {
    const previousPassword = previous?.password;
    
    return {
        email: 'alette-signal@mail.com',
        password: previousPassword || '12345',
    };
})
```
:::tip
The `.using()` token holder method can be used with UI forms:
```tsx
// React component
const Form = () => {
    // Pseudo code
    const { subscribe, /* ... */ } = useForm();

    useEffect(
        () => subscribe(({ values: { email, password } }) => {
            jwtToken.using({ email, password });
		}),
		[]
	);
    
    return <form>{ /* ... */ }</form>
}
```
:::

## Obtaining tokens
To obtain a token from the server, invoke the [token provider](#token-provider) 
by calling the `.get()` method on the token holder:
```ts
const myJwtToken = await jwtToken.get();
```

:::tip
1. Only a single `.get()` call is made, while other calls to the same `.get()` method are queued.
2. If the token provider resolves successfully, the token value is propagated to the
queued `.get()` callers without invoking the token provider again:
```ts
const [
    token1,
    token2,
    token3,
    token4,
    token5,
] = await Promise.all([
    // Only one server request is made,
	// and every pending `get()` invocation 
	// receive the same token without 
	// calling the server again.
    jwtToken.get(),
	jwtToken.get(),
	jwtToken.get(),
	jwtToken.get(),
	jwtToken.get(),
])
```
:::

## Invalidating tokens
To refresh a token, call the `.refresh()` method on the token holder:
```ts
jwtToken.invalidate();
```

Next time the `.get()` method is called, [the token is re-obtained](#obtaining-tokens):
```ts
const newToken = await jwtToken.get();
```
:::warning
The `.invalidate()` token holder method does not call the [token provider](#token-provider) automatically.
:::

## Refreshing tokens
To refresh a token in the background, call the `.refresh()` method on the token holder:
```ts
jwtToken.refresh();
```

To refresh and get the token simultaneously, call the `.refreshAndGet()` method on the token holder:
```ts
const newToken = await jwtToken.refreshAndGet();
```

## Subscribing to token changes
To subscribe to token changes, call the `.onStatus()` token holder method:
```ts
const unsubscribe = jwtToken.onStatus({
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
Token holders allow subscribing to a subset of the token status events:
```ts
jwtToken.onStatus({
    valid: () => {
        // ...
    },
});
```
:::
:::tip
Token status subscriptions can be used to synchronize UI and token updates:
```tsx
// React component
const AuthScreen = () => {
    const [isTokenValid, setIsValid] = useState(false);

    useEffect(() => {
        return jwtToken.onStatus({
            loading: async ({ context }) => {},
            valid: async ({ context }) => {},
            invalid: async ({ context }) => {},
        })
    }, []);

    if (isTokenValid) {
        return <div>{ /*...*/ }</div>;
    }

    return <div>Unauthorized</div>;
}
```
:::

## Periodic token refresh
To set up periodic token refresh in the background,
pass an interval value to the `.refreshEvery()` token holder **builder** method:
```ts
const jwtToken = token()
	/* ... */
    .refreshEvery("20 seconds")
	// or
    .refreshEvery(5000)
	// or
    .refreshEvery("1 hour")
	.build();
```
:::info
Periodic token refresh uses the [token obtaining algorithm](#token-obtaining-algorithm) under the hood.  
:::

## Converting tokens to headers
To convert a token to HTTP headers, use the `.toHeaders()` token holder method:
```ts
const tokenValue = 'hey';

const jwtToken = token()
	.from(() => tokenValue)
	.build();

/**
* authHeaders - { Authorization: `Bearer ${tokenValue}` },
* */
const authHeaders = await jwtToken.toHeaders()
```

To change how a token is converted to HTTP headers, pass a function to the 
`.whenConvertedToHeaders()` token holder **builder** method:
```ts
const tokenValue = 'hey';

const jwtToken = token()
	.from(() => tokenValue)
	.whenConvertedToHeaders(({ token, context }) => ({
        'X-XSRF-TOKEN': token
	}))
	.build();

/**
* authHeaders -
* { 
* 	'X-XSRF-TOKEN': 'hey' 
* },
* */
const authHeaders = await jwtToken.toHeaders()
```
:::info
Alette Signal automatically [obtains tokens](#obtaining-tokens) 
being converted into headers. 
:::

## Token obtaining algorithm
**Alette Signal token obtaining algorithm has 6 steps**:
1. The `.get()` method of the token holder is called.
2. If a **valid token** is stored inside the token holder, the
   [token provider](#token-provider) is not called, and the valid token is returned.
3. If an **invalid token** is stored inside the token holder, the
   token provider is invoked.
4. If a token is absent from the token holder, the
   token provider is invoked.
5. If the token provider throws an error,
   the token stored inside the token holder is marked as **invalid**.
6. If the token provider succeeds, the token is marked as **valid** and replaces the old token stored inside
   the token holder.