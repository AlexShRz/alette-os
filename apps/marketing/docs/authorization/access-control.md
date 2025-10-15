# Access control
**Access control** in Alette Signal is the process of sending
tokens or cookies along with 
[request blueprint](../getting-started/configuring-requests.md#request-blueprint) data, 
allowing the server to verify **who the user is (authentication)** and **what the 
user is allowed to do (authorization)**.

## Access control helpers
**Alette Signal offers 2 access control helpers:**
1. [Token holder](token-holder.md) - used for **JSON Web Token (JWT)** and **OAuth token** based authentication and authorization.
2. [Cookie handler](cookie-handler.md) - used for cookie-based authentication and authorization.