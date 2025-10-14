# Access control
**Access control** in Alette Signal is the process of sending
[tokens](token-holder) or [cookies](cookie-holder) along with 
[request blueprint](../getting-started/configuring-requests.md#request-blueprint) data, 
allowing the server to verify **who the user is (authentication)** and **what the 
user is allowed to do (authorization)**.

## Identifying data
**Identifying data** is the data sent to the server for verifying **who the user is**.

## Identifying data types
There are 3 identifying data types:
1. **Email and password** - credentials passed to the server to identify or register the user.
2. **OAuth token** - a `string` representing user identity verified by another service.
3. **JSON Web Token (JWT)** - a `string` containing encoded user information.

## Identifying data expiration
**Identifying data expiration** is the process where **identifying data** becomes 
invalid either on the server or on the client and needs to be refreshed:
1. `Email and password` - expire during user profile switching or when
changed either by the server or by the user.
2. `OAuth token` - expires based on rules set by the token-issuing service.
3. `JSON Web Token (JWT)` - expires based on rules set by the server.
 