# Redux integration
To integrate Redux state manager with Alette Signal, install Redux first:
::: code-group
```sh [pnpm]
pnpm add @reduxjs/toolkit@latest
```

```sh [npm]
npm install @reduxjs/toolkit@latest
```

```sh [yarn]
yarn add @reduxjs/toolkit@latest
```
:::

## Exposing store to middleware
To expose Redux store to middleware, pass Redux store functions to [api context](../../getting-started/api-context.md):
```ts
// 'src/api/base.ts'
import { client, setContext } from '@alette/signal';
import { store } from '../store';

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
```
:::warning
Passing entire Redux `store` object to the api context is not recommended - `dispatch()` and `getState()`
is enough for most use cases.
:::

## Dispatching actions
To dispatch a Redux action, extract the `dispatch()` function from the api context and call it
with an action:
```ts
import { showNotification } from '../store/notifications/actions';

const deletePost = mutation(
    /*...*/
	tap((deletedPost, { context: { dispatch } }) => {
        dispatch(showNotification({
			title: `Post "${deletedPost.title}" was successfully deleted.`
		}))
	})
);
```

## Selecting state
To select state using Redux selectors, get Redux state by calling `getState()` extracted from the api context, 
and pass it to a redux selector:
```ts
import { showNotification } from '../store/notifications/actions';
import { getCurrentUser } from '../store/user/selectors';

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