# Custom
**A custom** in Alette Signal is a [request blueprint](../getting-started/configuring-requests.md)
provided by the "core" plugin and is used for creating multistep requests or returning
data from 3rd party SDKs.

## Preconfigured behaviour of "custom"
1. Has no default HTTP method set.
2. Is not executed on mount by default.
3. Retries the request _once_ if the thrown error
   is an instance of `RequestFailedError` with the `401` HTTP status.

:::warning
Custom requests are designed to be configured manually. 
If you need a request with preconfigured behaviour, use [query](query.md) or [mutation](mutation.md) instead. 
:::

## Using "custom"
To use the custom request blueprint, extract it from the Alette Signal "core" plugin:
```ts
// ./src/api/base.ts
import { client, activatePlugins, coreApiPlugin } from "@alette/signal";

const core = coreApiPlugin();

export const api = client(
    /* ... */
    activatePlugins(core.plugin),
);

export const { custom } = core.use();
```

Now you can add middleware and execute requests:
```ts
// ./src/api/sms.ts
import { input, output, path, factory, body } from '@alette/signal';
import { custom } from "./base";
import { thirdPartySMSSdk } from './smsSdk';
import * as z from 'zod';

export const sendSMS = custom(
    input(z.string()),
    output(z.boolean()),
    factory(async ({ args: message }) => {
        // Custom request logic goes here
        await thirdPartySMSSdk.send(message)
		return true;
	}),
);

// Later...
await sendSMS.execute({ args: 'Hello Alette Signal' })
```

## Request factory
**A request factory** in Alette Signal is a function that returns arbitrary data and is
passed to the `factory()` middleware.

To create a request factory, pass a callback to the `factory()` middleware:
```ts
custom(
    factory(() => {
		return true;
	})
);
```
:::info
[Query](query.md) and [mutation](mutation.md) request blueprints come with the
`factory()` middleware already configured.
:::
:::tip
The `factory()` middleware can return any data synchronously or asynchronously:
```ts
custom(
   factory(() => {
     return true;
   }),
   // or
   factory(() => {
     return localStorage.get('hey');
   }),
   // or
   factory(async () => {
      const reply = await thirdPartySMSSdk.send(message);
      return reply;
   })
);
```
:::

### Accessing request data
To access request data from a request factory, [destructure 
its first argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring):
```ts
custom(
    input(z.string()),
    body({ hey: 'Alette Signal' }),
    queryParams({ hello: 'there' }),
    factory(({ args, body, queryParams, context }) => {
		// ...
	})
);
```

## Response combining
**Response combining** is a technique consisting of calling multiple requests 
inside a [request factory](#request-factory) and combining their responses.

To combine responses, execute multiple requests inside your request factory
and combine their results:
```ts
const CombinedResponse = z.object({
   hey: z.string(),
   there: z.string(),
})

const getFullGreeting = custom(
     output(CombinedResponse),
     factory(async () => {
        // Returns { hey: string }  
        const response1 = await getGreetingStart.execute();
        // Returns { there: string }
        const response2 = await getGreetingEnd.execute();
        
        return {
           ...response1,
           ...response2
        }
     })
);

// Returns { hey: string, there: string }
const greeting = await getFullGreeting.execute()
```
:::danger
The [Standard Schema](https://standardschema.dev/) you pass to the `output()` middleware must represent the 
final combined response. Otherwise, the whole system will fail with 
a fatal `ResponseValidationError`.
:::

## Dependent requests
**A dependent request** is a request 
that relies on the result of another request before it can be executed.

To execute dependent requests, call them in sequence inside a [request factory](#request-factory):
```ts
const createNewReaderUser = custom(
   input(z.object({
      name: z.string(),
      email: z.string()
   })),
   output(z.boolean()),
   factory(async ({ args: { name, email } }) => {
      const user = await createUser.execute({ args: { name, email } });
      await assignUserRole.execute({ 
         args: { id: user.id, role: 'reader' } 
      });

      return true;
   })
);

await createNewReaderUser.execute({ 
   args: {
        name: 'Alette Signal', 
        email: 'alette-signal@mail.com' 
   } 
});
```

## Processing errors
To process errors thrown from a request factory, use the `throws()` middleware
to inform Alette Signal about possible errors:
```ts
const createNewReaderUser = custom(
    throws(CannotCreateUserError),
    factory(async () => {
        // Later...
        throw new CannotCreateUserError('The user already exists.')
    })
);
```

:::danger
An error thrown without registering it using the `throws()` middleware 
will cause the whole system to fail with a fatal `UnknownErrorCaught` error.
```ts
factory(() => {
   throw new Error('Will crash the whole system.')
})
```
:::
:::danger
All thrown recoverable errors must extend Alette Signal `ApiError` abstract class:
```ts
import { ApiError } from '@alette/signal';

export class CannotCreateUserError extends ApiError {
   constructor(protected reason = 'unknown') {
      super();
   }

   protected cloneSelf() {
      return new CannotCreateUserError(this.reason)
   }
}
```
:::

Now your error type can be seen in middleware like `mapError()` or `retryWhen()`:
```ts twoslash
const createNewReaderUser = custom(
    /* ... */
    throws(CannotCreateUserError),
    factory(async () => {
        // Later...
        throw new CannotCreateUserError('The user already exists.')
    }),
    // The "error" property in retryWhen() and mapError() is now of 
    // the "CannotCreateUserError | RequestFailedError" type
    retryWhen((error) => {
        return true;
    }),
    mapError((error) => error)
);
```
:::tip
The `throws()` middleware can accept multiple error types at once:
```ts
custom(
    throws(
        MyError1,
        MyError2,
    )
)
```
:::
:::warning
The `throws()` middleware are combined:
```ts
custom(
    throws(MyError1),
    throws(MyError2),
    // The "error" argument is now of the "MyError1 | MyError2" type.    
    mapError((error) => error)
)
```
:::

## Notification receiver
**A notification receiver** in Alette Signal is an event system connecting request factories
with the rest of the system.

To use a notification receiver, extract it from request factory second argument:
```ts
import {
    factory,
    aboutUploadProgress, 
    aboutDownloadProgress,
    tapUploadProgress,
    tapDownloadProgress,
} from '@alette/signal';

factory(async (_, { notify }) => {
    const response = await getChunkedFile
         .with(
             tapUploadProgress((progress) => {
                 notify(aboutUploadProgress(progress))
			 }),
             tapDownloadProgress((progress) => {
                 notify(aboutDownloadProgress(progress))
             }),
         )
         .execute() 
    return response;        
})
```
:::info
Notifications are prefixed with "about" for differentiation from 
[api instructions](../getting-started/api-configuration.md#api-client-instruction) and 
[api questions](../getting-started/api-configuration.md#api-client-question).
:::

## Cancelling "custom" requests

## Limitations of "custom"
The custom request blueprint has no limitations.