# Single-direction cursor pagination
**Single-direction cursor pagination** is a version of 
[cursor pagination](cursor-pagination.md) 
that loads **either** preceding or following [response chunks](pagination.md#response-chunk) 
using the current [cursor](cursor-pagination.md#what-is-a-cursor) as a reference point. 

:::warning
Single-direction cursor pagination is work in progress.
:::

## Single-direction pagination limitations
**Single-direction cursor pagination has 2 limitations**:
1. **No multi direction support** - a cursor returned by the server is bound to the preceding  
or following response chunk load direction, making pagination one directional.
2. **Custom ordering is not allowed** - response chunk load order
is determined by the server and cannot be changed.

## Single-direction pagination request
Work in progress.