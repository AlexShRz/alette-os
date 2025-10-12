# Single-direction cursor pagination
**Single-direction cursor pagination** is a version of 
[cursor pagination](cursor-pagination.md) 
that loads **either** preceding or following [response chunks](pagination.md#response-chunk) 
using the current [cursor](cursor-pagination.md#what-is-a-cursor) as a reference point. 

## Single-direction pagination limitations
**Single-direction cursor pagination has 2 limitations**:
1. **No multi direction support** - a cursor returned by the server is bound to the preceding  
or following response chunk load direction, making pagination one directional.
2. **Custom ordering is not allowed** - response chunk load order
is determined by the server and cannot be changed.

## Single-direction pagination request
To configure a single-direction cursor pagination request, check what
[cursor pagination parameters](cursor-pagination.md#cursor-pagination-parameters) your
server accepts and how.

Then, configure your [request blueprint](../getting-started/configuring-requests.md#request-blueprint)
to request cursor paginated data:
```ts
const CursorPaginationArgs = z.object({
	limit: z.number().default(24),
	cursor: z.union([z.string(), z.null()]).optional()
})

const Notification = z.object({ /* ... */ })

const CursorPaginatedNotifications = z.object({
	data: Notification.array(),
    cursor: z.string(),
}) 

export const getNotifications = query(
    input(CursorPaginationArgs),
    output(CursorPaginatedNotifications),
	path('/notifications'),
	queryParams(({ args: { limit, cursor } }) => ({
        limit,
        ...(cursor ? { cursor }: {})
    })),
)
```
:::tip
The [query](../request-behaviour/query.md) request blueprint configuration can be used for cursor pagination.
:::
:::tip
Servers accept [cursors](cursor-pagination.md#what-is-a-cursor) as query parameters or
as body payload. Check your backend documentation to understand
how cursors are passed to the server.
:::

## Executing cursor pagination requests
To execute a cursor pagination request, [mount the request blueprint](../getting-started/request-modes.md#mounted-request-mode)
and call `execute()` to retrieve first [cursor](#what-is-a-cursor) from the server:
```ts
const { getState, when, execute } = getNotifications.mount()

when(({ isSuccess, data }) => {
    if (isSuccess && data) {
       const { cursor, data: responseChunks } = data;
	}
})

execute({ args: { limit: 24 } })
```

Next, save returned data 

Use the current data to get the cursor returned from the server and retrieve more response chunks:
```ts
const { getState, when, execute } = getNotifications.mount()
	
// ...

const cursor = getState().data?.

if (getState)

execute({ args: { limit: 24 } })
```

## Default pagination parameters
To set default pagination parameters, use
[request setting binding](../getting-started/configuring-requests.md#request-setting-binding):
```ts
getPosts.using(() => ({ 
	args: { page: 5, perPage: 25, sortBy: 'desc' } 
}))
```

Now your request will use bound pagination parameters by default:
```ts
// Returns data using 
// { page: 5, perPage: 25, sortBy: 'desc' } as arguments 
const paginatedData = await getPosts.execute()

// or
const { execute } = getPosts.mount()
execute()
```

## Used pagination parameters
To get used pagination parameters, extract the `settings` property
from the `getState()`:
```ts 
const { getState, execute } = getPosts
	.using(() => ({
		args: { page: 5, perPage: 25, sortBy: 'desc' }
	}))
	.mount()

execute()

// Returns "null" or "{ args: { page: 5, perPage: 25, sortBy: 'desc' } }"
const usedArgs = getState().settings
```
:::tip
To understand how `getState().settings` works, refer to the
[request setting binding](../getting-started/configuring-requests.md#request-setting-binding)
and [used request settings](../getting-started/request-modes.md#used-request-settings)
documentation.
:::