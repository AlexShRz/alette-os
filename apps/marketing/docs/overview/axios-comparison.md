:::danger
⚠️ **Outdated Content:** This page contains incorrect information and can be confusing.  
It will be rewritten soon to focus on front-end monorepos.

👋 **Note from the author:**
Alette Signal and Axios are two
different things - they shouldn't _really_ be compared, at least not in the context you see below. Some 
chapters like "interceptors" are completely incorrect and will confuse you. This comparison was written hastily
in an hour or so - it misses a lot of detail, context and will be rewritten.

I recommend skipping this page completely and starting from [configuring requests](../getting-started/configuring-requests.md)
for now.
:::

# Axios vs Alette Signal
**[Axios](https://axios-http.com/docs/intro) is a promise-based _HTTP client_** for Node.js and the browser.

**[Alette Signal](why-alette-signal.md) is a _Front-End data fetching library_**, designed to be
used in any environment except Node.js:
1. Alette Signal can be used with [UI frameworks like React](../integrations/react-integration.md).
2. Alette Signal can be used in browsers and browser-based environments (WebWorkers or Service Workers).

## Server interaction
Alette Signal uses [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) for server 
interaction, just like Axios.

## Api instance
Axios:
```ts
// src/api/base.ts
import axios from 'axios';

export const instance = axios.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});
```

Alette Signal:
```ts
// src/api/client.ts
import { 
    client,
	activatePlugins,
	coreApiPlugin,
	setOrigin,
} from '@alette/signal';

export const core = coreApiPlugin();

export const api = client(
    setOrigin('https://some-domain.com/api/'),
    activatePlugins(core.plugin),
	// Timeouts are work in progress at the moment
);

export const commonHeaders = {'X-Custom-Header': 'foobar'};

export const {
    query: baseQuery,
    mutation: baseMutation,
    custom: baseCustom,
    token,
    cookie
} = core.use();
```
```ts
// src/api/base.ts
import { 
    baseQuery,
	baseMutation,
	baseCustom,
	commonHeaders
} from 'api/client.ts';
import { headers } from '@alette/signal';

export const query = baseQuery(headers(commonHeaders)).toFactory();
export const mutation = baseMutation(headers(commonHeaders)).toFactory();
export const custom = baseCustom(headers(commonHeaders)).toFactory();
```

## Performing a GET request
Axios:
```ts
import { instance } from './api/base.ts';

instance.get({
    url: '/users',
    method: 'get'
});
```

Alette Signal:
```ts
import { query } from './api/base.ts';
import { path } from '@alette/signal';

const getUsers = query(
    path('/users')
	// method: "get" is set automatically for queries
);

await getPosts.execute();

// or inline
await query(path('/users')).execute();
```

## Instance methods
Axios:
```ts
axios.get(/*...*/)
axios.delete(/*...*/)
axios.head(/*...*/)
axios.options(/*...*/)
axios.post(/*...*/)
axios.put(/*...*/)
axios.patch(/*...*/)
```

Alette Signal:
```ts
import { query, mutation, custom } from './api/base.ts';
import { path, deletes, patches, puts, posts, method } from '@alette/signal';

// GET is set automatically for queries
query(/*...*/);
// DELETE
mutation(deletes());
custom(method('HEAD'))
custom(method('OPTIONS'))
// POST is set for mutations by default
mutation(/*...*/);
// PUT
mutation(puts());
// PATCH
mutation(patches());
```

## Handling authentication errors
Axios:
```ts
instance.interceptors.response.use(undefined, async (error) => {
  if (error.response?.status === 401) {
    await refreshToken();
    return instance(error.config); // Retry original request
  }

  throw error;
});
```

Alette Signal (extending base [request blueprints](#api-instance)):
```ts
// src/api/auth.ts
import { baseMutation, token, commonHeaders } from './api/client.ts';
import { path, headers } from '@alette/signal';

// We are going to use baseMutation() here
// to avoid circular references with "src/api/base.ts"
const refreshToken = baseMutation(
    path('/token'),
    headers(commonHeaders)
);

export const jwt = token()
	.from(async () => {
        const { accessToken } = await refreshToken.execute();
        return accessToken;
	})
	.build();
```
```ts
// src/api/base.ts
import { baseQuery, baseMutation, baseCustom } from 'api/client.ts';
import { jwt } from 'api/tokens.ts';
import { bearer } from '@alette/signal';

/*
* 1. 401 status code are retried automatically 
* by "query", "mutation" and "custom"
* 2. The bearer() middleware automatically 
* invalidates token or cookie when the 401 error is 
* encountered. 
* 3. The bearer() middleware makes sure only 1 
* token request for the same token refresh 
* is dispatched at all times - you don't have to use something
* like Mutex - it's built in.
* */
export const query = baseQuery(
    headers(commonHeaders),
	bearer(jwt)
).toFactory();
export const mutation = baseMutation(
    headers(commonHeaders),
    bearer(jwt)
).toFactory();
export const custom = baseCustom(
    headers(commonHeaders),
    bearer(jwt)
).toFactory();
```
:::info
To learn more about tokens, see [Alette Signal token holder guide](../authorization/token-holder.md).
:::

## File upload
Axios:
```ts
import { instance } from './api/base.ts';

const form = new FormData();
form.append('my_field', 'my value');
form.append('my_buffer', new Blob([1,2,3]));
form.append('my_file', fileInput.files[0]);

await instance.post('/upload', form);
```

Alette Signal:
```ts
import { mutation } from './api/base.ts';
import { path, body } from '@alette/signal';

const form = new FormData();
form.append('my_field', 'my value');
form.append('my_buffer', new Blob([1,2,3]));
form.append('my_file', fileInput.files[0]);

await mutation(path('/upload'), body(form)).execute();
```
:::info
To learn more about body upload, see [Alette Signal body uploading guide](../request-behaviour/mutation.md#sending-body).
:::

## Retrying requests
**Axios does not have a built-in way of retrying requests** - you 
need to install [axios-retry](https://www.npmjs.com/package/axios-retry) or implement the retrying logic yourself.
```ts
import axiosRetry from 'axios-retry';
import axios from 'axios';
import { instance } from './api/base.ts';

axiosRetry(instance, { retries: 3 });

// The first request fails and the second returns 'ok'
instance.get('/test')
  .then(result => {
    result.data; // 'ok'
  });

// Exponential back-off retry delay between requests
axiosRetry(instance, { retryDelay: axiosRetry.exponentialDelay });

// Liner retry delay between requests
axiosRetry(instance, { retryDelay: axiosRetry.linearDelay() });

// Custom retry delay
axiosRetry(instance, { retryDelay: (retryCount) => {
  return retryCount * 1000;
}});

// Works with custom axios instances
const client = axios.create({ baseURL: 'http://example.com' });
axiosRetry(client, { retries: 3 });

client.get('/test') // The first request fails and the second returns 'ok'
  .then(result => {
    result.data; // 'ok'
  });

// Allows request-specific configuration
client
  .get('/test', {
    'axios-retry': {
      retries: 0
    }
  })
  .catch(error => { // The first request fails
    error !== undefined
  });
```

Alette Signal:
```ts
import { query } from './api/base.ts';
import { path, retry } from '@alette/signal';

await query(
    path('/test'),
    retry({ 
		times: 4,
		backoff: [1000, 5000, 10000, 15000]
	})
).execute();
```
```ts
import { query } from './api/base.ts';
import { path, retryWhen, wait } from '@alette/signal';

await query(
    path('/test'),
    retryWhen(async ({ attempt }) => {
        await wait(attempt * 1000);
        return true;
	})
).execute();
```
:::info
To learn more about request retrying, see 
[Alette Signal request retrying guide](../behaviour-control/request-retrying.md).
:::

## Progress tracking
Axios:
```ts
import { instance } from './api/base.ts';

const formData = new FormData();
formData.append("file", yourFile);

instance.post("/upload", formData, {
    onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
    },
});
```

Alette Signal:
```ts
import { mutation } from './api/base.ts';
import { path, body, tapUploadProgress } from '@alette/signal';

const formData = new FormData();
formData.append("file", yourFile);

await mutation(
    path('/upload'),
	body(formData),
    tapUploadProgress(({ progress }) => {
        console.log(`Upload progress: ${progress}%`);
	})
).execute();
```

## Interceptors
Axios:
```ts
// src/api/base.ts

// ...

instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
  { synchronous: true, runWhen: () => { /* This function returns true */ }}
);

instance.interceptors.response.use(function onFulfilled(response) {
    // Do something with response data
    return response;
  }, function onRejected(error) {
    // Do something with response error
    return Promise.reject(error);
  });
```

Alette Signal (extending base [request blueprints](#api-instance)):
```ts
// src/api/base.ts
import { baseQuery, baseMutation, baseCustom } from 'api/client.ts';
import { 
    mapError,
	map,
	tapError,
	tapError,
	tapTrigger
} from '@alette/signal';

/*
* 1. You can set unique "interceptors"
* for each request blueprint "branch" individually - when 
* you do query(...) in another file, all interceptors
* bound to "base" query will be transferred 
* to your newly defined query.
* 2. This is all reflected in TypeScript types.
* */
export const query = baseQuery(
    headers(commonHeaders),
    tapTrigger(() => {
        // Do something before request is sent
	}),
    tapError(error => {
        // Do something with response error (readonly)
    }),
	mapError(error => {
        // Do something with request error
	}),
    map(response => {
        // Do something with response data
	})
).toFactory();

export const mutation = baseMutation(
    headers(commonHeaders),
    tapTrigger(() => {
        // Do something before request is sent
    }),
    tapError(error => {
        // Do something with response error (readonly)
    }),
    mapError(error => {
        // Do something with request error
    }),
    map(response => {
        // Do something with response data
    })
).toFactory();

export const custom = baseCustom(
    headers(commonHeaders),
    tapTrigger(() => {
        // Do something before request is sent
    }),
    tapError(error => {
        // Do something with response error (readonly)
    }),
    mapError(error => {
        // Do something with request error
    }),
    map(response => {
        // Do something with response data
    })
).toFactory();
```
```ts
// src/api/foo.ts
import { query } from './api/base.ts';
import { path } from '@alette/signal';

export const getFoo = query(
    path('/foo')
);

// Will be executed with interceptors
await getFoo.execute();
```

## Handling errors
Axios:
```ts
import { instance } from 'api/base.ts';

instance.get('/user/12345')
  .catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
```

Alette Signal:
```ts
import { query } from './api/base.ts';
import { path } from '@alette/signal';

try {
	await query(path('/user/12345')).execute();
} catch (e) {
    console.log(error.getReason());
    console.log(error.getStatus());
    console.log(error.getHeaders());
    console.log(error.getServerResponse());
}
```

## Cancelling requests
Axios:
```ts
const controller = new AbortController();

axios.get('/foo/bar', {
   signal: controller.signal
}).then(function(response) {
   //...
});
// cancel the request
controller.abort()
```

Alette Signal:
```ts
import { query } from './api/base.ts';
import { path, abortedBy } from '@alette/signal';

const controller = new AbortController();

/*
* ".spawn()" runs the request 
* in the background, without returning
* a Promise back.
* */
query(
    path('/foo/bar'),
	abortedBy(controller)
).spawn();

// Cancel the request
controller.abort()
```

## UI framework integration
Axios:
```tsx
// React component
import React, { useEffect, useState } from 'react';
import { instance } from 'api/base.ts';

const PostSelect = () => {
    const [response, setResponse] = useState(null);
    
    useEffect(() => {
        /*
        * 1. Untyped + you have to track loading
        * states and everything else yourself.
        * 2. Have to execute the request on mount 
        * yourself, etc., etc.
        * */
        instance.get('/foo').then((response) => {
            setResponse(response)
		})
	}, [])
    
    return <div>{ /*...*/ }</div>
};
```

Alette Signal:
```ts
// src/api/foo.ts
import { path } from '@alette/signal';
import { query } from './api/base.ts';

export const getFoo = query(
    path('/foo')
);
```
```tsx
// React component
import React, { useEffect, useState } from 'react';
import { useApi } from '@alette/signal-react';
import { getFoo } from '../api/foo.ts'

const PostSelect = () => {
    /*
    * 1. query() is executed on component mount by default.
    * 2. Everything is tracked for you, and 
    * you can use exposed props to update PostSelect UI.
    * */
    const {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        data,
        error,
        settings,
        execute,
        cancel,
	} = useApi(getFoo);

    return (
        <>
			{isLoading && <div>Loading...</div>}
			<div>{ /*...*/ }</div>
		</>
	)
};
```