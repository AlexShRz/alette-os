# Access control
**Access control** in Alette Signal is the process of sending
tokens or cookies along with 
[request blueprint](../getting-started/configuring-requests.md#request-blueprint) data, 
allowing the server to verify **who the user is (authentication)** and **what the 
user is allowed to do (authorization)**.

## Access control plugin
**Access control plugin** is a built-in Alette Signal plugin, used for managing
authentication and authorization using [tokens](token-holder.md) or [cookies](cookie-handler.md).

To activate Alette Signal access control plugin use the 
`activatePlugins()` [api instruction](../getting-started/api-configuration.md#api-client-instruction):
```ts [api/baseAuth.ts]
import { coreAuthPlugin } from "@alette/signal";

export const auth = coreAuthPlugin();
export const { token, cookie } = auth.use();
```
```ts [api/client.ts]
import { client, activatePlugins } from "@alette/signal";
import { auth } from "./baseAuth.ts";

export const api = client(
    /*...*/
    activatePlugins(auth.plugin)
);
```