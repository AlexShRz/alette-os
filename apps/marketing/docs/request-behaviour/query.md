# Query
**A query** in Alette Signal is a [request blueprint](../getting-started/configuring-requests.md) 
provided by the "core" plugin and is preconfigured for sending `GET` HTTP requests.

## Preconfigured query behaviour
1. Uses the `GET` HTTP method to send a request to the server.
2. Uses the `runOnMount()` middleware to start request execution immediately when the 
[request is mounted](../getting-started/request-modes.md#mounted-request-mode).
3. Retries the request _once_ if the thrown error
contains these HTTP statuses: `401`, `408`, `409`, `419`, `425`, `429`, `500`, `502`, `503`, `504`.
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
await getPostsForSelect({ search: 'Alette Signal' })
// or
await searchPosts({ search: 'Alette Signal' })
```

## Using query with UI frameworks
To use the query request blueprint with UI frameworks, 
refer to the Alette Signal framework integration guides:
1. [React integration guide](../integrations/react-integration.md).

## Disabling mounted execution
To disable [query execution on mount](#preconfigured-query-behaviour),
use the `runOnMount()` middleware:
```ts
const { execute } = getPostsForSelect
	.with(runOnMount(false))
	.mount()

// Later...
execute()
```
:::info
A query that is not executed on mount is called **"lazy"**.
:::

## Query cancellation
To cancel an in-flight query request, use `cancel()`:
```ts
const { cancel } = getPostsForSelect.mount()

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

getPostsForSelect
	.with(abortedBy(abortController))();

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