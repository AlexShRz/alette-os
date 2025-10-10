# React integration
To integrate Alette Signal with React UI framework, 
install the React adapter:
::: code-group
```sh [pnpm]
pnpm add @alette/signal-react@latest
```

```sh [npm]
npm install @alette/signal-react@latest
```

```sh [yarn]
yarn add @alette/signal-react@latest
```
:::

## Usage with components
To use [request blueprints](../getting-started/configuring-requests.md#configuring-requests)
with React components, pass them to the `useApi()` hook:
```tsx
import { useApi } from '@alette/signal-react';
import { getPosts } from '../api/posts' 

const Component = () => {
    const {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        data,
        error,
        execute,
        cancel,
    } = useApi(getPosts);
    
    return <div>{/* ... */}</div>
}
```
:::danger
1. The `useApi()` hook [mounts the request](../getting-started/request-modes.md#mounted-request-mode)
and initialized its middleware **once**. If the React component re-renders,
the middleware passed to the `.with()` request blueprint method will not be reinitialized:
```tsx
useApi(
    getPosts.with(
    	// runOnMount() will be initialized once
        runOnMount(false)
	)
)
```
2. `useApi()` initializing middleware once
makes passing component properties directly to the middleware
result in stale data:
```tsx
const Component = ({ name }) => {
    const {/* ... */} = useApi(
        getPosts.with(
            // The "name" property will not be updated
			// after the component re-renders.
            body({ name })
		)
	);
}
```
:::
:::tip
The `useApi()` hook accepts [query](../request-behaviour/query.md),
[mutation](../request-behaviour/mutation.md) and 
[custom](../request-behaviour/custom.md) request blueprints, as 
well as other request blueprints created by 
[plugin authors](../getting-started/configuring-requests.md#plugins-in-alette-signal).
:::

## Reloading on changes
To [reload a request](../getting-started/request-modes.md#request-reloading)
on React component property changes, 
[bind properties](../getting-started/configuring-requests.md#request-setting-binding) 
to the request and pass them to the `useApi()` dependency array:
```tsx
const Component = ({ name }) => {
    const {/* ... */} = useApi(
        getPosts.using(() => ({
			args: name
		}))
		// When the "name" property changes,
		// the request will be reloaded automatically
		// with the updated "name" value.
		[name]
	);
}
```
:::tip
The `useApi()` dependency array can accept multiple 
properties to track:
```tsx
const Component = ({ name, value, id }) => {
    const {/* ... */} = useApi(
        getPosts.using(() => ({
            args: {
                id,
                name,
				value,
			}
        }))
		[name, value, id]
    );
}
```
:::
:::warning
Passing an empty dependency array to the `useApi()` hook
results in the request reloading once on mount,
and skipping next reloads during component re-renders:
```tsx
const Component = ({ name, value, id }) => {
    const {/* ... */} = useApi(
        getPosts.using(() => ({
            args: {
                id,
                name,
				value,
			}
        })),
		// The request will be reloaded once on 
		// mount if the runOnMount() middleware was provided.
		[]
    );
}
```
:::
:::warning
Omitting the dependency array from the `useApi()` hook
results in the request reloading once on mount,
and skipping next reloads during component re-renders:
```tsx
const Component = ({ name, value, id }) => {
    const {/* ... */} = useApi(
        // The request will be reloaded once on 
        // mount if the runOnMount() middleware was provided.
        getPosts.using(() => ({
            args: {
                id,
                name,
				value,
			}
        })),
    );
}
```
:::

## Did you know?
Alette Signal React integration implementation is **35 lines total**, excluding comments.