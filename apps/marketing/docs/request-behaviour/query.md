# Query
**A query** in Alette Signal is a [request blueprint](../getting-started/configuring-requests.md) 
provided by the "core" plugin and is preconfigured for sending `GET` HTTP requests.

## Preconfigured query behaviour
1. Uses the `GET` HTTP method to send a request to the server.
2. Uses the `runOnMount()` middleware to start request execution immediately when the 
[request is mounted](../getting-started/request-modes.md#mounted-request-mode).
3. Retries the request _once_ if the thrown error
contains these HTTP statuses: `401`, `408`, `409`, `425`, `429`, `500`, `502`, `503`, `504`.
4. Throws a `RequestFailedError` if the response returned from the server does not have a `2xx` HTTP status.

:::warning
Queries are designed for getting server data without it on your 
backend. If you want to modify server data, use [mutation](./mutation.md) or [custom](./custom.md).
:::

## Using query blueprint
To use the query request blueprint, extract it from the Alette Signal "core" plugin:
```ts
// ./src/api/base.ts
import { client, activatePlugins, coreApiPlugin } from "@alette/signal";

const core = coreApiPlugin();

export const api = client(
    /* ... */
    activatePlugins(core.plugin),
);

export const { query } = core.use();
```

Now you can add middleware and execute requests:
```ts
// ./src/api/posts.ts
import { 
    input,
    output,
    debounce,
    map,
    path,
    queryParams
} from '@alette/signal';
import { query } from "./base";
import * as z from 'zod';

export const Post = z.object({ /*...*/ });
export const Posts = Post.array();
export const PostStatus = z.enum(['draft', 'published'])

export const searchPosts = query(
    input(
        z.object({ 
            search: z.string().default(''),
            status: PostStatus.default('published')
        })
    ),
    output(Posts),
    path(({ args: { status } }) => `/posts/search/${status}`),
    queryParams(({ args: { search } }) => ({ search }))
);

export const getPostsForSelect = searchPosts.with(
    debounce(300),
    map((posts) => 
        posts.map(({ title, id }) => ({ label: title, value: id }))
    )
);

// Later...
await getPostsForSelect.execute({ search: 'Alette Signal' })
// or
await searchPosts.execute({ search: 'Alette Signal' })
```

## Using query with React
To use the query request blueprint with React 
[install Alette Signal React adapter](../getting-started/installation.md#usage-with-react).

To query data inside a React component use the `useApi()` hook:
```tsx
import React from 'react';
import { useQuery } from "@alette/signal-react";
import { getPostsForSelect, PostStatus } from '../api/posts';
import * as z from 'zod';

type SelectComponentProps = {
    status: z.infer<typeof PostStatus>
}

export const SelectComponent: React.FC<SelectComponentProps> = ({
    status 
}) => {
    const {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        data,
        error,
        execute,
        cancel,
    } = useApi(
        getPostsForSelect.using(() => ({ 
            args: { status }
        })), 
        [status]
    );
    
    return (
        <div>
            <input 
                onChange={({ target: { value } }) => {
                    execute({ args: { search: value } })
                }} 
            />
            <ul>
                {isLoading && (
                    <li>Loading posts...</li>
                )}
                {data && data.map(({ value, label }) => (
                    <li key={value}>{label}</li>
                ))}
            </ul>
        </div>
    )
}
```
:::info
`useApi()` [mounts the request](../getting-started/request-modes.md#mounted-request-mode) automatically.
:::
:::danger
`useApi()` mounts the request and initialized its middleware _once_.
:::
:::tip
`useApi()` refreshes 
[bound request settings](../getting-started/configuring-requests.md#request-setting-supplier)
when the dependency array values change:
```ts
const {
  /* ... */ 
} = useApi(
    getPostsForSelect.using(() => ({ 
        // Will be refreshed automatically
        args: { status }
    })),
    // If the "status" prop of the SelectComponent changes, Alette Signal 
    // will refresh bound request settings automatically.
    [status]
);
```
:::

## Disabling mounted execution
To disable [preconfigured mounted query execution](#preconfigured-query-behaviour),
use the `runOnMount()` middleware:
```ts
import { runOnMount } from '@alette/signal';

// ...

const {
  execute
} = useApi(
    getPostsForSelect
        .with(runOnMount(false))
        .using(() => ({
            args: { status }
        })),
    [status]
);

// Later...
execute()
```
:::info
A query that is not executed on mount is called **"lazy"**.
:::

## Query cancellation
To cancel an in-flight query request, use `cancel()`:
```ts
const {
  cancel
} = useApi(
    getPostsForSelect.using(() => ({
        args: { status }
    })),
    [status]
);

// Later...
cancel()
```
:::warning
Request cancellation does not throw errors.
:::

## Query abortion
To abort an in-flight query request, call the `.abort()` method 
on the [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) 
passed to the `abortedBy()` middleware:
```ts
const abortController = new AbortController();

// ...

const {
  /* ... */
} = useApi(
    getPostsForSelect
		.with(abortedBy(abortController))
		.using(() => ({
			args: { status }
		})),
    [status]
);

// Later...
abortController.abort()
```
:::danger
Request abortion throws a `RequestAbortedError`.
:::

## Query limitations
1. [Cannot send request body](https://www.baeldung.com/cs/http-get-with-body).
2. Cannot track body upload progress using the `tapUploadProgress()` middleware.
3. Cannot override used HTTP method using the `method()` middleware.
4. Cannot implement custom request execution logic using the `factory()` middleware.
5. Cannot add new thrown error types using the `throws()` middleware.
6. Expects a response in `JSON` format back from the server.