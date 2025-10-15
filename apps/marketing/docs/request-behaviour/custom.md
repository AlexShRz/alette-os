# Custom
**A custom** in Alette Signal is a [request blueprint](../getting-started/configuring-requests.md)
provided by the "core" plugin and is used for creating multistep requests or returning
data from 3rd party SDKs.

## Preconfigured behaviour of "custom"
1. Has no default HTTP method set.
2. Is not executed on mount by default.
3. Retries the request _once_ if the thrown error
   is an instance of `RequestFailedError` with the `401` or `419` HTTP status code.

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

## Using "custom" with UI frameworks
To use the "custom" request blueprint with UI frameworks,
refer to the Alette Signal framework integration guides:
1. [React integration guide](../integrations/react-integration.md).

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
To access request data inside a request factory, [destructure 
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
The [Standard Schema](https://standardschema.dev/) passed to the `output()` middleware must represent the 
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
:::tip
To learn more about error processing, refer 
to [Alette Signal error handling guide](../error-system/error-handling.md).
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

## Request factory supervision
**Request factory supervision** refers to the ability of request factories to propagate
cancellation or abortion to child requests.

To enable request factory supervision, pass the provided [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
to child requests using the `abortedBy()` middleware:
```ts
factory(async (_, { signal }) => {
    const response1 = await getData1.with(abortedBy(signal)).execute(); 
    const response2 = await getData2.with(abortedBy(signal)).execute(); 

    return {
        ...response1,
        ...response2,
	}
})
```

## Request factory cancellation
To cancel request factory execution, use `cancel()`:
```ts
const getCombinedData = custom(
    factory(async (_, { signal }) => {
        const response1 = await getData1.with(abortedBy(signal)).execute();
        const response2 = await getData2.with(abortedBy(signal)).execute();

        return {
            ...response1,
            ...response2,
        }
    })
)

const { cancel } = getCombinedData.mount()
	
// Later...
cancel()
```
:::warning
Request factory cancellation does not throw errors.
:::
:::danger
If your request factory is modifying data on the server, its cancellation might
result in [false positive mutation cancellation](mutation.md#fixing-false-positive-cancellations).
:::

## Request factory abortion
To abort a request factory, call the `.abort()` method
on the [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
passed to the `abortedBy()` middleware:
```ts
const abortController = new AbortController();

const getCombinedData = custom(
    abortedBy(abortController),
    factory(async (_, { signal }) => {
        const response1 = await getData1.with(abortedBy(signal)).execute();
        const response2 = await getData2.with(abortedBy(signal)).execute();

        return {
            ...response1,
            ...response2,
        }
    })
)

getCombinedData.execute()
	
// Later...
abortController.abort()
```
:::danger
Request factory abortion throws a `RequestAbortedError`.
:::
:::danger
If your request factory is modifying data on the server, its abortion might
result in [false positive mutation cancellation](mutation.md#mutation-abortion).
:::

## Limitations of "custom"
The "custom" request blueprint has no limitations.