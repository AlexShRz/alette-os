# Cursor pagination
**Cursor pagination** is a version of [pagination](pagination.md)
used to retrieve large or changing [response chunks](pagination.md#response-chunk)
while preserving ordering and avoiding performance issues.
Cursor pagination does not accept `page` or `offset` [pagination parameters](pagination.md#pagination-parameters),
or allow for the "jump to page" functionality,
which speeds up data retrieval on the server.

## What is a cursor?
**A cursor** in cursor pagination is a reference point
sent by the server to the client,
indicating from where the next set of response chunks should start.

A cursor can be:
1. An id - `string` or `number`.
2. A timestamp - `created_at` or `updated_at` for time-ordered data.
3. A [base64 encoded string](https://stackoverflow.com/a/201484).

## Cursor pagination parameters
**Cursor pagination parameters** are arguments controlling
how large the paginated response will be when returned from the server.

Common cursor pagination arguments are:

| Argument     | Type                 | Purpose                                                                                                                      | Example    |
|--------------|----------------------|------------------------------------------------------------------------------------------------------------------------------|------------|
| **`limit`**  | `number`             | Specifies the number of chunks to include.                                                                                   | `limit=20` |
| **`cursor`** | `number` or `string` | Indicates from where the next set of response chunks should start. Can be used to load "previous" or "next" response chunks. | `cursor=4` |

## Cursor pagination variants
Cursor pagination has 2 variants:
1. [Single-direction cursor pagination](single-direction-cursor.md).
2. [Bi-directional cursor pagination](bi-directional-cursor.md).

## Cursor pagination requests
To configure a cursor pagination request, check what [cursor pagination parameters](#cursor-pagination-parameters)
your server can accept and how.

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
    prevCursor: z.string(),
    nextCursor: z.string()
}) 

export const getNotifications = query(
    input(CursorPaginationArgs),
    output(CursorPaginatedNotifications),
	path('/notifications'),
	queryParams(({ args: { limit, cursor } }) => ({
        limit,
        ...(cursor ? { cursor }: {})
    }))
)
```
:::tip
The [query](../request-behaviour/query.md) request blueprint configuration can be used for cursor pagination.
:::
:::tip
Servers accept [cursors](#what-is-a-cursor) as query parameters or
as body payload. Check your backend documentation to understand
how cursors are passed to the server.
:::

## Executing cursor pagination requests
To execute a cursor pagination request, [mount the request blueprint](../getting-started/request-modes.md#mounted-request-mode)
and call `execute()` to retrieve a [cursor](#what-is-a-cursor) from the server:
```ts
let prevPageCursor: string | null = null;
let nextPageCursor: string | null = null;

const { getState, execute } = getNotifications.mount()

// Gets first cursors together with response chunks
execute({ args: { limit: 24 } })

// When a successful response is received, update cursors
const { prevCursor, nextCursor } = getState().data;
prevPageCursor = prevCursor;
nextPageCursor = nextCursor;
```

Now, you can pass previous or next cursor to `execute` to get response chunks:
```ts
/// ...
const { getState, execute } = getNotifications.mount()

// Get next page
execute({ args: { cursor: nextPageCursor } })
// Get previous page
execute({ args: { cursor: prevPageCursor } })
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