# Middleware reuse
**Middleware reuse** in Alette Signal refers to the ability of storing, preconfi

## Example with authentication + middleware reuse
```ts [api/base.ts]
import { coreApiPlugin, headers, slot } from "@alette/signal";

export const core = coreApiPlugin();

const { 
    query,
	mutation,
	custom,
} = core.use();

const withCommon = slot(
    headers({ 'X-Custom-Header': 'hello' }),
    tap((response, requestData) => {
        console.log("Received response:", { response, requestData })
    }),
    tapError((error, requestData) => {
        console.log("Failed with error:", { error, requestData })
    }),
)

export const baseQuery = query(...withCommon());
export const baseMutation = mutation(...withCommon());
export const baseCustom = custom(...withCommon());
```
```ts [api/baseAuth.ts]
import { coreAuthPlugin, path, as } from "@alette/signal";
import { baseMutation } from "./base.ts";
import { local } from "@alette/signal-storage";

export const auth = coreAuthPlugin();
export const { token } = auth.use();

// as() can be replaced with Zod. 
const Credentials = as<{ email: string, password: string; }>();
const TokenOutput = as<{ accessToken: string, refreshToken: string; }>();

/*
* 1. We are going to use baseMutation() here
* to avoid circular references
* 2. getTokens/getRefreshedTokens must never be called directly in your 
* code - always use the "jwt" token abstraction below to 
* invalidate or refresh tokens.
* */
const getTokens = baseMutation.with(
    input(Credentials),
    output(TokenOutput),
    path('/token'),
    body(({ args }) => args)
);

const getRefreshedTokens = baseMutation.with(
    input(as<string>()),
    output(TokenOutput),
    path('/token/refresh'),
    body(({ args }) => args)
);

export const jwt = token('jwt')
	.credentials(Credentials)
	.storage(local, TokenOutput)
    .from(async ({ 
		 prevToken,
		 refreshToken,
		 isInvalid,
		 getCredentialsOrThrow
    }) => {
        if (isInvalid && refreshToken) {
            return getRefreshedTokens({ args: refreshToken });
        }
        
        const credentials = await getCredentialsOrThrow();
        return getTokens({ args: credentials });
    })
    .build();
```
```ts [api/client.ts]
import { 
    activatePlugins,
	setOrigin,
	setAuthStorage,
	bearer,
	setPersistentStorage,
} from "@alette/signal";
import { 
    core,
	auth,
	baseQuery,
	baseMutation,
	baseCustom
} from "./base.ts";
import { auth, jwt } from "./baseAuth.ts";

export const api = client(
    activatePlugins(core.plugin, auth.plugin),
);

const withToken = bearer(jwt)

export const query = baseQuery(withToken).toFactory();
export const mutation = baseMutation(withToken).toFactory();
export const custom = baseCustom(withToken).toFactory();
```