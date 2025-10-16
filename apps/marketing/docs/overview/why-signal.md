# Why Alette Signal
**Alette Signal is a Front-End data fetching library**, 
designed to work everywhere and be used by everyone - from trainees to team leaders.

:::info
To install Alette Signal, see [Alette Signal installation guide](../getting-started/installation.md).
:::

## Adapts to your project
Alette Signal adapts to your project using [request behaviour inheritance](../getting-started/configuring-requests.md#request-behaviour-inheritance),
allowing for request composition and reuse in any environment - whether you are using WebWorkers, native JS, or 
reusing requests from a monorepo package:
```ts
const Posts = z.object({ /* ... */ }).array();
const PostStatus = z.enum([/* ... */]);

export const getPosts = query(
	input(PostStatus),
	output(Posts),
	path(({ args: status, context: {/*...*/} }) => `/posts/${status}`),
);

export const getPostsForSelect = getPosts.with(
	debounce("300 millis"),
	runOnMount(false),
	retryWhen(async ({ error, attempt }, { args: status }) => {
		if (error.getStatus() === 429 && status === "draft") {
			await wait("5 seconds");
			return true;
		}

		return false;
	}),
    map(
        (posts) => posts.map(({ url, name }) => ({ 
			label: name, value: url 
        })) 
	),
);

await getPosts.execute({ args: 'draft' });
// or
await getPostsForSelect.execute({ args: 'draft', skipRetry: true });
```

## UI agnostic core
Alette Signal core is UI agnostic and written in [Effect](https://effect.website/), 
**ensuring full type safety** and [strict error handling](../error-system/error-types.md), while 
making [UI framework integration](../getting-started/installation.md#usage-with-ui-frameworks) **take 35 lines or fewer**:
```tsx :line-numbers
// Full React integration from the "@alette/signal-react" package. 
export const useApi = <Context extends IRequestContext>(
    request: TAnyApiRequest<Context>,
    deps: unknown[] = [],
) => {
    const { controller, handlers } = useMemo(() => {
        const controller = request.control();
        return {
            controller,
            handlers: controller.getHandlers(),
        };
    }, [request.getKey()]);

    controller.setSettingSupplier(request.getSettingSupplier());

    const [requestState, updateRequestState] = useState(
        controller.getState()
	);
    useEffect(() => {
        const unsubscribe = controller.subscribe((data) => {
            updateRequestState(data);
        });

        return () => {
            unsubscribe();
            controller.dispose();
        };
    }, []);

    useEffect(() => {
        controller.reload();
    }, deps);

    return { ...requestState, ...handlers };
};
```

## Lifecycle hooks
Alette Signal requests have [lifecycle hooks](../request-behaviour/request-lifecycle.md)
allowing you to run side effects:
```tsx
// React component
const PostSelect = () => {
    const { /* ... */ } = useApi(
        deletePost.with(
            tapMount(async () => {}),
            tapUnmount(async () => {}),
            tapTrigger(async () => {}),
            tapLoading(async () => {}),
            tap(async (response) => {}),
            tapError(async (error) => {}),
            tapAbout(async () => {}),
            tapCancel(async () => {}),
            tapDownloadProgress(async ({ progress, /* ... */ }) => {}),
            tapUploadProgress(async ({ progress, /* ... */ }) => {}),
		)
	);
	
	// ...
};
```

## Plugin-based api client
Alette Signal api client is [plugin-based](../getting-started/configuring-requests.md#plugins-in-alette-signal),
allowing plugin authors to extend it:
```ts
import { client, activatePlugins, coreApiPlugin } from "@alette/signal";

const core = coreApiPlugin();

export const api = client(
    activatePlugins(core.plugin),
);

export const { query, mutation, custom } = core.use();
```

## Built for testing
Alette Signal was built with testing in mind, giving you tools like
[api instructions](../getting-started/api-configuration.md#api-client-instruction),
[api questions](../getting-started/api-configuration.md#api-client-question) and 
an [XMLHttpRequest polyfill](../testing/environment-requirements.md) to test your requests:
```ts
import { forContext, setContext } from '@alette/signal';
import { api } from './api/base';

afterEach(() => {
    api.reset();
});

test("it sets global context", async () => {
    const expectedContext1 = { hello: "Alette Signal" };
    api.tell(
        setContext(expectedContext1)
	);

    const context1 = await api.ask(forContext());
    expect(context1).toEqual(expectedContext1);

    const expectedContext2 = { hi: "there" };
    api.tell(setContext(expectedContext2));

    const context2 = await api.ask(forContext());
    expect(context2).toEqual(expectedContext2);
});
```

## Context provider
Alette Signal [context provider](../getting-started/api-context.md) allows you to share values globally
and [integrate with state managers](../getting-started/installation.md#usage-with-state-managers) while 
keeping context values typed and testable:
```ts
// Redux integration snippet
declare module "@alette/signal" {
    interface IGlobalContext {
        getState: typeof store.getState,
		dispatch: typeof store.dispatch,
    }
}

export const api = client(
    setContext({
		getState: store.getState,
		dispatch: store.dispatch,
	}),
);

// api/posts.ts
const deletePost = mutation(
    /*...*/
    tap((deletedPost, { context: { dispatch, getState } }) => {
        const { name } = getCurrentUser(getState());

        dispatch(
            showNotification({
                title: `Post "${deletedPost.title}" was deleted `
                    + `by "${name}".`
            })
        )
    })
);
```

## Re-fetching with arguments
Alette Signal allows you to
[refetch requests using new arguments](../getting-started/configuring-requests.md#request-settings) manually:
```tsx
// React component
const PostSelect = () => {
    const [search, /* ... */] = useState('');
    const { 
        /* ... */
		execute,
		cancel
	} = useApi(searchPostsForSelect);
	
	return (
        <div>
			<button 
				onClick={() => {
                    execute({ args: { search } })
				}}
			>
				Refetch manually
            </button>
			{/*...*/}
		</div>
	)
};
```

## Custom requests
Alette Signal [custom requests](../request-behaviour/custom.md) allow you to wrap 3rd party SDKs or define 
a [custom request execution logic](../request-behaviour/custom.md#request-factory), 
all while being compatible with the core system:
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

## Request reloading
Alette Signal [request reloading utilities](../behaviour-control/request-reloading.md) can bind values to request lifecycle,
while allowing you to
[control the reloading process](../behaviour-control/request-reloading.md#reload-control):
```tsx
// React component
const PostSelect = ({ search, status }) => {
    const { /* ... */ } = useApi(
        searchPostsForSelect
			.with(
			   reloadable(({ 
				   prev, 
				   current: { args: { search, status } }
               }) => search !== 'hey')
			)
			.using(() => ({ args: { search, status } })),
		[search, status]
	);
	
	// ...
};
```

## Authorization utilities
Alette Signal authorization utilities for [tokens](../authorization/token-holder.md) and
[cookies](../authorization/cookie-handler.md) allow 
you to abstract **any** authentication provider, while managing token and cookie 
refresh automatically:
```ts
const jwtToken = token()
	.credentials(
        z.object({
			email: z.string(),
			password: z.string()
		})
	)
	.from(async ({
		/* ... */
		refreshToken: prevRefreshToken,
		getCredentialsOrThrow,
		context
    }) => {
        const { email, password } = await await getCredentialsOrThrow();
        
		const { accessToken, refreshToken } = prevRefreshToken 
			? await refreshToken.execute({ 
				args: prevRefreshToken 
			})
			: await getToken.execute({
				args: {
					email,
					password
				}
			});

		return {
			token: accessToken,
			refreshToken,
		};
	})
	.refreshEvery("30 seconds")
	.build();

const deletePost = mutation(
    /* ... */
    bearer(jwtToken)
);
```

## Retrying utilities
Alette Signal [retrying utilities](../behaviour-control/request-retrying.md) allow you to define 
custom retry logic for volatile APIs:
```ts
const deletePost = mutation(
    /* ... */
    retryWhen(async ({ error, attempt }, { args: postId, path }) => {
        if (error.getStatus() === 429) {
            await wait("5 seconds");
            return true;
		}

		return postId === 5;
	})
);
```

## Powered by Alette Pulse
**Alette Pulse** is an in-house built alternative to low-level api caller libraries, 
powering Alette Signal request execution:
```ts
import { request, r } from '@alette/pulse';

request(
    r.route(url),
    r.method(method),
    r.signal(signal),
    r.headers(headers),
    r.onUploadProgress((data) => notify(aboutUploadProgress(data))),
    r.onDownloadProgress((data) => notify(aboutDownloadProgress(data))),
).execute();
```