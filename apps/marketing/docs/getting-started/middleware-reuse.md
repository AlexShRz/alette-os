# Middleware reuse
**Middleware reuse** in Alette Signal refers to the ability of storing and sharing 
preconfigured middleware across [request blueprints](../getting-started/configuring-requests.md#request-blueprint) **while keeping types intact**.

## Preconfiguring middleware 
To preconfigure middleware, extract it into a variable and pass the required arguments:
```ts
import { headers } from '@alette/signal';

const withCommonHeaders = headers({ 'X-Header': 'hi' });
```

To preconfigure multiple middleware at once, use the `slot()` utility:
```ts
import { headers, slot, tap, tapError } from '@alette/signal';

const withCommon = slot(
    headers({ 'X-Header': 'hi' }),
    tap((response, requestData) => {
        console.log("Received response:", { response, requestData })
    }),
    tapError((error, requestData) => {
        console.log("Failed with error:", { error, requestData })
    })
);
```

The `slot()` utility can accept preconfigured middleware:
```ts
import { headers, slot, /*...*/ } from '@alette/signal';

const withCommonHeaders = headers({ 'X-Header': 'hi' });

const withCommon = slot(
    // Types are preserved
    withCommonHeaders,
    /*...*/
);
```

The `slot()` utility allows middleware to access **typed** request data:
```ts
import { output, slot, as, map } from '@alette/signal';

const Post = as<{/*...*/}>();

const withPostTransformation = slot(
    output(Post),
    map(post => ({ value: post.id, label: post.title }))
);
```

The `slot()` utility can accept [implicit middleware](./request-middleware.md#implicit-middleware):
```ts
import { slot, retry, throttle } from '@alette/signal';

const withCommon = slot(
    retry, // retry from "query()" by default
	throttle // 500ms by default 
);
```

## Applying preconfigured middleware 
To apply preconfigured middleware, pass them to a request blueprint:
```ts [api/base.ts]
import { coreApiPlugin, headers, slot } from "@alette/signal";

export const core = coreApiPlugin();
const withCommonHeaders = headers({ 'X-Header': 'hi' });

const {
    query,
    mutation,
    custom,
} = core.use();

export const baseQuery = query(withCommonHeaders);
export const baseMutation = mutation(withCommonHeaders);
export const baseCustom = custom(withCommonHeaders);
```

To apply _multiple_ preconfigured middleware, invoke the function returned from the 
`slot()` utility and spread the result into a request blueprint:
```ts [api/base.ts]
import {
    coreApiPlugin,
    headers,
    slot,
    tap,
    tapError
} from "@alette/signal";

export const core = coreApiPlugin();

const {
    query,
    mutation,
    custom,
} = core.use();

const withCommon = slot(
    headers({ 'X-Header': 'hi' }),
    tap((response, requestData) => {
        console.log("Received response:", { response, requestData })
    }),
    tapError((error, requestData) => {
        console.log("Failed with error:", { error, requestData })
    })
);

export const baseQuery = query(...withCommon());
export const baseMutation = mutation(...withCommon());
export const baseCustom = custom(...withCommon());
```

## Full example
```ts [api/base.ts]
import { 
    coreApiPlugin,
	headers,
	slot,
	tap,
	tapError
} from "@alette/signal";

export const core = coreApiPlugin();

const {
    query,
    mutation,
    custom,
} = core.use();

const withCommon = slot(
    headers({ 'X-Header': 'hi' }),
    tap((response, requestData) => {
        console.log("Received response:", { response, requestData })
    }),
    tapError((error, requestData) => {
        console.log("Failed with error:", { error, requestData })
    })
);

export const baseQuery = query(...withCommon());
export const baseMutation = mutation(...withCommon());
export const baseCustom = custom(...withCommon());
```
```ts [api/client.ts]
import { client, activatePlugins, setOrigin } from "@alette/signal";
import { 
    core,
	baseQuery,
	baseMutation,
	baseCustom
} from "./base.ts";

export const api = client(
    activatePlugins(core.plugin)
);

export const query = baseQuery.toFactory();
export const mutation = baseMutation.toFactory();
export const custom = baseCustom.toFactory();
```
:::tip
To learn more about `.toFactory()`, refer to the [Alette Signal blueprint
factory documentation](configuring-requests.md#request-blueprint-factory).
:::

Now requests will be executed with common headers and 
preconfigured `tap()` and `tapError()` loggers:
```ts [api/post.ts]
import { output, path, tap, as } from '@alette/signal';
import { query } from './client.ts';

const Post = as<{/*...*/}>();

const getPost = query(
    output(Post),
    path('/post/1'),
    tap((_, { headers }) => {
    	// Will log "{ 'X-Header': 'hi' }"
        console.log(headers);
	})
);

// The preconfigured "tap()" middleware
// will log the response
getPost.spawn();
```