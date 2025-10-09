# Mutation
**A mutation** in Alette Signal is a [request blueprint](../getting-started/configuring-requests.md)
provided by the "core" plugin and is preconfigured for sending `POST`, `PUT`, `PATCH` and `DELETE` HTTP requests.

## Preconfigured mutation behaviour
1. Uses the `POST` HTTP method by default to send a request to the server.
2. Is not executed on mount by default.
3. Retries the request _once_ on failure if the returned error
   contains the `401` HTTP status.
4. Throws a `RequestFailedError` if the response returned from the server does not have a `2xx` HTTP status.
5. Throws a `HttpMethodValidationError` if a mutation request was attempted with the `GET` HTTP method provided.

:::warning
Mutations are designed for modifying data on your backend.
If you want to get server data without side effects on your backend, use [query](./query.md).
:::

## Using mutation blueprint
To use the mutation request blueprint, extract it from the Alette Signal "core" plugin:
```ts
// ./src/api/base.ts
import { client, activatePlugins, coreApiPlugin } from "@alette/signal";

const core = coreApiPlugin();

export const api = client(
    /* ... */
    activatePlugins(core.plugin),
);

export const { mutation } = core.use();
```

Now you can add middleware and execute requests:
```ts
// ./src/api/email.ts
import { input, output, path, body } from '@alette/signal';
import { mutation } from "./base";
import * as z from 'zod';

export const scheduleEmail = mutation(
    input(
        z.object({
            id: z.string(),
            receiver: z.string().default("alette-signal@mail.com"),
            topic: z.string().default("Hello!"),
            message: z.string().default("How are things?")
        })
    ),
    output(z.string()),
    path('/email/schedule'),
    body(({ args }) => args)
);

export const cancelScheduledEmail = mutation(
    input(z.string()),
    output(z.boolean()),
    path('/email/cancel'),
    body(({ args: scheduledEmailId }) => ({
        id: scheduledEmailId
    }))
);

// Later...
const scheduledEmailId = await scheduleEmail.execute()
// or
await cancelScheduledEmail.execute({ args: scheduledEmailId })
```

## Using mutation with React
To use the mutation request blueprint with React,
[install Alette Signal React adapter](../getting-started/installation.md#usage-with-react).

To send a mutation request inside a React component, use the `useApi()` hook:
```tsx
import React, { useState, useRef } from 'react';
import { useQuery } from "@alette/signal-react";
import { scheduleEmail } from '../api/email';
import * as z from 'zod';
import { v4 as uuid } from 'uuid';

type EmailEditorProps = {
    topic: string
}

export const EmailEditor: React.FC<SelectComponentProps> = ({
    topic
}) => {
    const emailId = useRef(uuid())
    const [emailMessage, setEmailMessage] = useState("How are things?");
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
        scheduleEmail.using(() => ({
            args: { topic }
        })),
        [topic]
    );

    return (
        <div>
            <button
                onClick={() => {
                    execute({ args: {
                            id: emailId.current,
                            message: emailMessage
                        }})
                }}
            >
                Send
            </button>
            {/* ... */}
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
    scheduleEmail.using(() => ({
        // Will be refreshed automatically
        args: { topic }
    })),
    // If the "topic" prop of the EmailEditor changes, Alette Signal 
    // will refresh bound request settings automatically.
    [topic]
);
```
:::

## Sending body
To send a request body, use the `body()` middleware:
```ts
mutation(
    body({ hey: 'Alette Signal' })
)
```

To create a body from request data, pass a callback to the `body()` middleware:
```ts
const greet = mutation(
    input(z.string()),
    body(({ args: name }) => ({ hey: name })),
    // or
    body(async ({ args: name }) => ({ hey: name }))
)

await greet.execute({ args: 'Alette Signal' })
```

## Accepted body types
The `body()` middleware accepts 7 body types:
1. Objects convertable to `JSON`.
2. Plain text.
3. `FormData`.
4. `URLSearchParams`.
5. `Blob`.
6. `ArrayBuffer`.
7. `Uint8Array`.

## Body headers
The `body()` middleware sets request headers automatically based on passed body type. There are 7
variations of automatically injected request headers:
1. For objects convertable to `JSON`:
```ts
{
   "Content-Type": "application/json;charset=UTF-8";
}
```
2. For plain text:
```ts
{
   "Content-Type": "text/plain;charset=UTF-8";
}
```
3. For `FormData`:
```ts
{
   // Nothing
}
```
:::danger
Setting `{ "Content-Type": "multipart/form-data" }` headers for `FormData` will prevent
the browser from appending the [required boundary string](https://stackoverflow.com/a/42985029), 
which prevents the server from parsing the form data correctly.
:::
4. For `URLSearchParams`:
```ts
{
   "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8";
}
```
6. For `ArrayBuffer`, `Blob` or `Uint8Array`:
```ts
{
   "Content-Type": "application/octet-stream";
}
```

## Changing body headers
To change automatically set `body()` headers, place the `headers()` middleware after `body()` middleware:
```ts
mutation(
    // Sets { "Content-Type": "application/json;charset=UTF-8" } 
    // headers automatically.
    body({ convertMeToJson: true }), 
    // Overrides previously set headers
    headers({
       "Content-Type": "text/plain;charset=UTF-8",
    })
)
```

:::warning
User provided headers and body headers are merged if there is no collision:
```ts
mutation(
    // Sets { "Content-Type": "application/json;charset=UTF-8" } 
    // headers automatically.
    body({ convertMeToJson: true }), 
    // Does not override previously set headers, 
    // because it does not contain the "Content-Type" header.  
    headers({
       "other-header": "hello",
    })
)

// Final headers
{
   "Content-Type": "application/json;charset=UTF-8",
   "other-header": "hello"
}
```
:::

## Changing HTTP method
To change request HTTP method, use the `posts()`, `puts()`, `patches()`, `deletes()` or `method()` middleware:
```ts
mutation(
   posts(), // method('POST') under the hood 
   puts(), // method('PUT') under the hood 
   patches(), // method('PATCH') under the hood 
   deletes(), // method('DELETE') under the hood 
   method('POST'),
)
```
:::info
There is also `gets()` middleware available for [custom requests](custom.md). 
:::

## Progress tracking
To track request body upload progress, use the `tapUploadProgress()` middleware:
```ts
mutation(
    tapUploadProgress(({ progress, uploaded, remaining }) => {
        console.log(`Completed by ${progress}%`);
        console.log(`Uploaded bytes "${uploaded}"`);
        console.log(`Remaining bytes "${remaining}"`);
    }),
)
```

To track response download progress, use the `tapDownloadProgress()` middleware:
```ts
mutation(
    tapDownloadProgress(({ progress, downloaded, remaining }) => {
        console.log(`Completed by ${progress}%`);
        console.log(`Downloaded bytes "${downloaded}"`);
        console.log(`Remaining bytes "${remaining}"`);
    }),
)
```

## File upload
To upload files to your backend, use `FormData` together with the `body()` middleware:
```ts
export const uploadFiles = mutation(
    input(z.instanceOf(FormData)),
    output(z.boolean()),
    path('/files/upload'),
    body(({ args: files }) => files)
);

const collectedFiles = new FormData();
const myFile1 = new Blob();
const myFile2 = new Blob();

collectedFiles.append('file', myFile1);
collectedFiles.append('file', myFile2);

// Later...
await uploadFiles.execute({ args: collectedFiles })
```

### Tracking file upload progress
To track file upload progress, use the `tapUploadProgress()` middleware:
```ts
uploadFiles.with(
    tapUploadProgress(({ progress, uploaded, remaining }) => {
        console.log(`Completed by ${progress}%`);
        console.log(`Uploaded bytes "${uploaded}"`);
        console.log(`Remaining bytes "${remaining}"`);
    }),
);
```

## Mutation cancellation
To cancel an in-flight mutation request, use `cancel()`:
```ts
const {
    cancel
} = useApi(
    scheduleEmail.using(() => ({
        args: { topic }
    })),
    [topic]
);

// Later...
cancel()
```

:::warning
Request cancellation does not throw errors.
:::
:::danger
Mutation `cancel()` has 2 possible outcomes:
1. **The mutation is cancelled _before_ it reaches the server** and modifies your backend data.
   If this is the case, nothing should be done.
2. **The cancellation fails to catch and cancel the mutation before it reaches your server.**
   In this case, the mutation has already succeeded, but Alette Signal
   will treat it as cancelled. **This is called a "false positive mutation cancellation"**.
   :::

### Fixing false positive cancellations
To fix a false positive mutation cancellation, use the `tapCancel()` middleware to
send a request back to your server that reverts the mutation:
```ts
scheduleEmail
    .with(
        tapCancel(async ({ args: { id: emailId } }) => {
            await cancelScheduledEmail.execute({ args: emailId });
            console.log("Mutation was safely cancelled.")
        })
    )
    .using(() => ({ args: { topic } }))

// Later...
cancel()
```
:::info
Reverting a mutation manually after cancellation is called **"mutation compensation"**.
:::
:::danger
**Always revert mutations manually after cancellation** - `cancel()` by itself
can result in a "false positive" mutation cancellation.
:::

## Mutation limitations
1. Cannot use the `GET` HTTP method to execute requests.
2. Cannot implement custom request execution logic using the `factory()` middleware.
3. Cannot add new thrown error types using the `throws()` middleware.
4. Expects a response in `JSON` format back from the server.