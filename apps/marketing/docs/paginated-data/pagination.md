# Pagination
**Pagination** is a technique consisting of splitting large responses into chunks.

## Response chunk
**A response chunk** in pagination is a piece of arbitrary data returned from the server.
A response chunk can represent a Post, a PDF, a subset of notifications, etc.

## Pagination parameters
**Pagination parameters** are arguments controlling
how large the paginated response will be when returned from the server.

Common pagination arguments are:

| Argument                                         | Type     | Purpose                                                                                  | Example                |
|--------------------------------------------------|----------|------------------------------------------------------------------------------------------|------------------------|
| **`page`**                                       | `number` | Specifies which page number to fetch (starting from 1).                                  | `page=3`               |
| **`limit`** or **`per_page`** or **`page_size`** | `number` | Specifies the number of chunks to include per page.                                      | `limit=20`             |
| **`offset`**                                     | `number` | Specifies the number of chunks to skip before returning results (alternative to `page`). | `offset=40`            |
| **`sort`**                                       | `string` | Defines how chunks are sorted by the server.                                             | `sort=created_at,desc` |

## Pagination requests
To configure a pagination request, check what [pagination parameters](#pagination-parameters)
your server can accept and how.

Then, configure your [request blueprint](../getting-started/configuring-requests.md#request-blueprint) 
to request paginated data:
```ts
const PaginationArgs = z.object({
	page: z.number().default(1),
	perPage: z.number().default(24),
	sortBy: z.enum(['created_at', 'desc', 'asc']).default('desc')
})

const Post = z.object({ /* ... */ })

export const getPosts = query(
    input(PaginationArgs),
    output(Post.array()),
	path('/posts'),
	queryParams(({ args: { page, perPage, sortBy } }) => ({
		page,
        perPage,
		sort: sortBy
	}))
)
```
:::tip
The [query](../request-behaviour/query.md) request blueprint configuration can be used for paginated data.
:::
:::tip
Servers accept pagination parameters as query parameters or 
as body payload. Check your backend documentation to understand 
how pagination arguments are passed to the server.
:::

## Executing pagination requests
To execute a pagination request, [mount the request blueprint](../getting-started/request-modes.md#mounted-request-mode)
and call `execute()` with preferred pagination parameters:
```ts
const { execute } = getPosts.mount()

execute({ args: { page: 5, perPage: 25, sortBy: 'desc' } })
```

To get paginated data once, execute the request in the [one shot mode](../getting-started/request-modes.md#one-shot-request-mode):
```ts
const paginatedData = await getPosts.execute({ 
	args: { page: 5, perPage: 25, sortBy: 'desc' } 
})
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

// Wait for the request to finish...

// Returns "{ args: { page: 5, perPage: 25, sortBy: 'desc' } }"
const usedArgs = getState().settings
```
:::tip
To understand how `getState().settings` works, refer to the
[request setting binding](../getting-started/configuring-requests.md#request-setting-binding)
and [used request settings](../getting-started/request-modes.md#used-request-settings)
documentation.
:::