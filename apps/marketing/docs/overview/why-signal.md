# Why Alette Signal
Alette Signal is a Front-End Data Fetching library, designed to work everywhere and be used by everyone - from trainees to CTOs.

## Accessible for every skill level
It abstracts the complexity by exposing "sentence like" request 
composition api and giving you **full runtime type safety**.

``` ts
import {
	path,
	debounce,
	input,
	map,
	output,
	retry,
	retryWhen,
	runOnMount,
	wait, 
} from "@alette/signal";
import { z } from "zod";
import { query } from "../api/base";

const Posts = z.object({ url: z.string(), name: z.string() }).loose().array();
const PostStatus = z.enum(["draft", "published"]);

export const getPosts = query(
	input(PostStatus),
	output(Posts),
	path(({ args: status, context: {/*...*/} }) => `/posts/${status}`),
	retry({
		times: 2,
		backoff: ["1 second", "5 seconds"],
		unlessStatus: [403],
	}),
);

/**
 * Create new request configuration using
 * the previous one as a foundation.
 */
export const getPostsForSelect = getPosts.with(
	debounce("300 millis"),
	runOnMount(false),
	map((posts) => posts.map(({ url, name }) => ({ url, name }))),
	retryWhen(async ({ error, attempt }, { args: status }) => {
		if (error.getStatus() === 429 && status === "draft") {
			await wait("5 seconds");
			return true;
		}

		return false;
	}),
);

const postsWithDraftStatus = await getPosts.execute({
	args: "draft",
	skipRetry: true,
});

const { cancel, when, execute, unmount } = getPostsForSelect.mount();
execute({ args: "published" });

const unsubscribe = when(({ isSuccess, isError, data, error }) => {
	if (isSuccess && data) {
		console.log({ data });
		unsubscribe();
	}

	if (isError && error) {
		console.log({ error });
		unsubscribe();
		unmount();
	}
});
```

## Learn once, use everywhere

Alette Signal APIs are *identical*, whether you are using it with WebWorkers, simple JS or UI frameworks, making integration and learning process easy:
1. It can be integrated with any UI framework in 30 lines or less. And as a framework adapter maintainer you get everything for free when new "core" update ships without having to adapt anything to your framework.
2. Also, it enables you to define request configuration in one place and share it across your monorepo packages or environments like Browser and WebWorkers.

``` tsx
import React from "react";
import { tapMount, tapUnmount } from "@alette/signal";
import { useApi } from "@alette/signal-react";
import { sendEvent } from "../api/analytics";
import { getPostsForSelect } from "../api/posts";
import {
	setPostSelectedMounted,
	setPostSelectedUnmounted
} from './store/actions';

export const PostSelect: React.FC<{ status: "draft" | "published" }> = ({
	status,
}) => {
	const {
		isUninitialized,
		isError,
		isLoading,
		isSuccess,
		data,
		error,
		execute,
		cancel,
		unmount,
	} = useApi(
		getPostsForSelect
			.with(
				tapMount(({ context: { dispatch } }) => {
					dispatch(setPostSelectedMounted());
				}),
				tapUnmount(async ({ context: { dispatch } }) => {
					dispatch(setPostSelectedUnmounted());
					await sendEvent.execute({
						args: {
							name: "POST_SELECT_UNMOUNTED",
							context: { postStatus: status },
						},
					});
				}),
			)
			.using(() => ({
				args: status,
				skipRetry: status === "draft",
			})),
		[status],
	);

	const newStatus = status === "draft" ? "published" : "draft";

	return (
		<div>
			<button
				value={newStatus}
				onClick={(e) => {
					execute({ args: e.target.value });
				}}
			>
				{`Refetch using ${newStatus}`}
			</button>
			{/* ... */}
		</div>
	);
};
```
## Everything is a plugin
Alette Signal is fully plugin based, allowing you to abstract *any* data provider behind a plugin (currently in alpha), be it a 3rd party SDK, REST API or local storage. In fact, even `query()`, `mutation()` and `custom()` are all just "blueprints" composed from the middleware you use, and tied to the `core` plugin you activate during set up.

``` ts
import {  
    activatePlugins,  
    client,  
    coreApiPlugin,  
    setOrigin,  
} from "@alette/signal";
  
export const core = coreApiPlugin();  
  
export const api = client(  
    setOrigin("https://example.com"),  
    activatePlugins(core.plugin),  
);  
  
export const { query, mutation, custom, token, cookie } = core.use();
```
## No compromises
Alette Signal gives you all you need to ship - from debouncing and throttling to asynchronous retries and file upload tracking, helping you actually build the product you want, without forcing you to reinvent the wheel.

``` ts
custom(
	debounce(...)
	throttle(...)
	
	gets()
	posts()
	puts()
	deletes()
	patches()
	method('OPTIONS')
	
	bearer(myToken)
	bearer(myCookie)
	
	factory(async () => {
		const posts = await getPosts.execute()
		const postsForSelect = await getPostsForSelect.execute()
		
		return {
			original: posts,
			forSelect: postsForSelect
		}
	})
	throws(
		MyCustomError1,
		MyCustomError2,
	)
	
	reloadable(({ prev, current }) => {
		return prev?.args.id !== current.args.id
	})
	
	// Can be used to replace useEffect()
	tapMount(({ ... }) => {})
	tapUnmount(({ ... }) => {})
	tapTrigger(({ ... }) => {})
	tap(({ ... }) => {})
	tapError(({ ... }) => {})
	tapCancel(({ ... }) => {})
	tapUploadProgress(({ ... }) => {})
	tapDownloadProgress(({ ... }) => {})
	
	map(({ ... }) => {})
	mapError((error, { ... }) => {})
	
	retryWhen(async () => ...)
	retry({...})
)
```

## Cookie and Token authentication utilities
Alette Signal provides built-in `token()` and `cookie()` helpers, while also managing authentication and re-authentication automatically using the `bearer()` middleware.

``` ts
import { input } from '@alette/signal'
import { mutation, token, cookie } './api/base'
import { getPosts } './api/posts'
import * as z from 'zod';

const Credentials = z.object({
	name: z.string(),
	email: z.string()
});

const getToken = mutation(
	input(Credentials)
	...
)

const updateCookie = mutation(
	input(Credentials)
	...
)

export const jwtToken = token()
	.credentials(Credentials)
	.from(async ({ 
		prevToken,
		context,
		getCredentialsOrThrow
	}) => {
		const token = await getToken.execute({ args: getCredentialsOrThrow() })
		return token;
	})
	.refreshEvery("15 seconds")
	.build()
	
export const authCookie = cookie()
	.credentials(JwtTokenCredentials)
	.from(async ({ 
		context,
		getCredentialsOrThrow
	}) => {
		await updateCookie.execute({ args: getCredentialsOrThrow() })
	})
	.refreshEvery("20 seconds")
	.build()

const postRequest = getPosts.with(
	bearer(jwtToken)
	// or
	bearer(authCookie)
)

// Will be executed with authentication
export const getOtherPosts = postRequest.with(
	...
)

// Somewhere in your form component...
jwtToken.using({ name: 'hey', email: 'test@gmail.com' })
// or
authCookie.using({ name: 'hey', email: 'test@gmail.com' })

```

## Conversation-like api configuration
Alette Signal turns api configuration into a conversation. Want you api to do something? Just `tell()` it, or `ask()` it for data from the config.

``` ts
import {  
    client,  
    setOrigin,
    setContext,
    forOrigin,
    forContext
} from "@alette/signal";
  
export const api = client(...);  
  
api.tell(
	setOrigin("https://wikipedia.com"),
	setContext({ hello: 'Alette Signal' })
)  
const globalApiContext = await api.ask(forContext())
const globalOrigin = await api.ask(forOrigin())
```

## In-house built core
Powered by Alette Pulse as its core, Alette Signal frees you from the need to install any 3rd party library like axios, while also providing XHR polyfill for testing.

``` ts
import { request, r } from '@alette/pulse';
import { 
	aboutUploadProgress,
	aboutDownloadProgress,
	blueprint
} from '@alette/signal';
import { custom } from './api/base';

...

// Internal snippet from the "core" plugin
export const queryFactory = blueprint()  
    .specification(querySpec);
    .use(  
       ...
       factory(({ url, headers, method, credentials }, { signal, notify }) => 
		request(  
	       r.route(url),  
	       r.method(method),  
	       r.signal(signal),  
	       r.headers(headers),
	       r.withCookies(credentials),  
	       r.onUploadProgress((data) => notify(aboutUploadProgress(data))),  
	       r.onDownloadProgress((data) => notify(aboutDownloadProgress(data))),  
	    ).execute()
	   ),
    )
```

``` ts
// vitest.setup.ts
import { setUpApiTestEnv } from "@alette/signal-test-utils";
import { api } from './api/base'

setUpApiTestEnv()

afterEach(() => {
	api.reset()
})
```