# Request authorization
**Request authorization** in Alette Signal refers to the process of providing
[token holders](token-holder.md) 
or 
[cookie handlers](cookie-handler.md) to the 
[request blueprint](../getting-started/configuring-requests.md#request-blueprint) `bearer()` middleware.

## Sending tokens
To send a token to the server, pass a token holder to the `bearer()` middleware and execute the request:
```ts
const appQuery = query(
    bearer(jwtToken),
);

await appQuery.execute();
```

The `bearer()` middleware sends [token headers](token-holder.md#converting-tokens-to-headers)
to the server automatically, allowing the server to verify token validity:
```ts
const appQuery = query(
    bearer(jwtToken),
    // Done automatically under the hood
	// headers(() => jwtToken.toHeaders())
);
```
:::tip 
Token headers included by the `bearer()` middleware are not overridden by 
[middleware cascading](../getting-started/request-middleware.md#middleware-cascading)
if there is no header key collision:
```ts
const appQuery = query(
    // Let's say the jwtToken returns
	// "{ Authorization: '...' }" headers
    bearer(jwtToken),
   	// Will be merged with token headers
   	headers({ 'X-Alette': 'Signal' }),
);
```
:::

## Sending cookies
To send a cookie to the server, pass a cookie handler to the `bearer()` middleware and execute the request:
```ts
const appQuery = query(
    bearer(authCookie),
);

await appQuery.execute();
```

The `bearer()` middleware instructs the [request blueprint](../getting-started/configuring-requests.md#request-blueprint)
to include credentials automatically, allowing the server to verify cookie validity:
```ts
const appQuery = query(
    bearer(authCookie),
    // Done automatically under the hood
	// credentials('include')
);
```
:::tip
To override default `{ credentials: "include" }` set by the `bearer()`
middleware for cookie handlers, use the `credentials()` middleware:
```ts
const appQuery = query(
    bearer(authCookie),
	credentials('same-origin')
);
```
:::

## Selective authorization
**Selective authorization** in Alette Signal refers to the process of 
sending [tokens](#sending-tokens) or [cookies](#sending-cookies) 
with a **subset** of requests, while ignoring others.

To configure selective authorization, pass the `bearer()` middleware 
with a token or a cookie to requests requiring authorization:
```ts
const queryWithAuth = query(
    bearer(jwtToken),
);

const anotherQueryWithAuth = queryWithAuth.with(
    /* ... */
)

const mutationWithoutAuth = mutation(
    /* ... */
)
```
:::tip
To ensure a subset of requests share authorization behaviour automatically, [turn 
request blueprints into factories](../getting-started/configuring-requests.md#request-blueprint-factory):
```ts
// api/base.ts
const { query: baseQuery } = core.use(); 

export const query = baseQuery(
    bearer(jwtToken),
    /* ... */
).toFactory();

// api/posts.ts
import { query } from './base';

// Already contains "bearer(jwtToken)"
export const getPost = query(/* ... */);
```
:::

## Authorization errors
**Authorization errors** are errors thrown when the server determines 
that an authenticated user lacks permission to perform an action and
returns a `401` or `403` HTTP Status code.

Some servers can also return a `419` HTTP Status code, indicating that 
the user's session or CSRF token has expired.

The `bearer()` middleware
invalidates provided [tokens](token-holder.md#invalidating-tokens)
and [cookies](cookie-handler.md#invalidating-cookies) **automatically** when
the server returns `401` or `419` HTTP status code:
```ts
const myRequest = custom(
    bearer(authCookie),
	factory(() => {
        // Will invalidate authCookie
        throw new RequestFailedError({
			status: 401, // or 419
		})
	})
);
```
:::tip
The [query](../request-behaviour/query.md), 
[mutation](../request-behaviour/mutation.md) and 
[custom](../request-behaviour/custom.md)
request blueprints retry requests automatically 
when a `401` or `419` HTTP status code is returned from the server.
:::
:::danger
The `bearer()` middleware does not retry requests automatically. To configure 
retries for request blueprints, refer 
to the [Alette Signal request retrying guide](../behaviour-control/request-retrying.md). 
:::