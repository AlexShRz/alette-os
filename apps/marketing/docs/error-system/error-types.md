# Error types
There are 3 error types in Alette Signal - [fatal](#fatal-errors), [recoverable](#recoverable-errors) 
and [unknown](#unknown-errors).

## Fatal errors
**A fatal error** in Alette Signal is an **unrecoverable** error extending the `FatalApiError`
abstract class:
```ts
class MyFatalError extends FatalApiError {}
```

Fatal errors thrown from middleware are logged to the console, 
while the system is shut down, and all in-flight requests are interrupted.
```ts
const otherRequest1 = mutation(/* ... */);
const otherRequest2 = query(/* ... */);

const myRequest = custom(
    factory(() => {
        throw new MyFatalError()
	})
)

otherRequest1.spawn();
otherRequest2.spawn();

// Will crash the whole system and 
// interrupt "otherRequest1" and "otherRequest2" requests.
myRequest.spawn()
```
:::tip
To disable fatal error logging, use the `setLoggerConfig` [api client instruction](../getting-started/api-configuration.md#api-client-question):
```ts
api.tell(
    setLoggerConfig((logger) => logger.muteFatal()),
);
```
:::

## Recoverable errors
**A recoverable error** in Alette Signal is an error extending the `ApiError`
abstract class:
```ts
class MyError extends ApiError {
    protected cloneSelf() {
        return new MyError();
	}
}
```

Recoverable errors thrown from middleware can be intercepted by the request blueprint middleware 
and be mapped or [retried](../behaviour-control/request-retrying.md):
```ts
class MyNewError extends ApiError {
    protected cloneSelf() {
        return new MyNewError();
    }
}

const myRequest = custom(
    throws(MyError),
    factory(() => {
        throw new MyError()
	}),
	retry({
		times: 2,
	}),
	mapError((myError) => new MyNewError())
)

myRequest.spawn()
```
:::info
The `ApiError` abstract class requires all errors to implement the `.cloneSelf()` method.
The errors are cloned internally by Alette Signal for things like the `mapError()` middleware,
to avoid [value vs reference issues](https://www.freecodecamp.org/news/javascript-assigning-values-vs-assigning-references/). 
:::

## Unknown errors
**An unknown error** in Alette Signal is an error not registered with the `throws()` middleware. Unknown 
errors are not seen in types and treated as [fatal errors](#fatal-errors):
```ts
class MyError extends ApiError {
    protected cloneSelf() {
        return new MyError();
    }
}

const myRequest = custom(
    factory(() => {
        throw new MyError()
    }),
)

// Will crash the whole system, even though
// "MyError" is of the "recoverable" error type.
myRequest.spawn()
```

To register errors with a request blueprint, use the `throws()` middleware:
```ts
class MyError extends ApiError {
    protected cloneSelf() {
        return new MyError();
    }
}

const myRequest = custom(
    throws(MyError),
    factory(() => {
        throw new MyError()
    }),
)

// The request will fail, but the system
// will not be crashed
myRequest.spawn()
```
:::info
The `throws()` middleware can accept only [recoverable errors](#recoverable-errors).
:::
:::tip
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