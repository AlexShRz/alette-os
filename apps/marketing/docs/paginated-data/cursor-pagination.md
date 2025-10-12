# Cursor pagination
**Cursor pagination** is a version of [pagination](pagination.md)
used to retrieve large or changing [response chunks](pagination.md#response-chunk) 
while preserving ordering and avoiding performance issues.
Cursor pagination does not accept `page` or `offset` [pagination parameters](pagination.md#pagination-parameters),
or allow for the "jump to page" functionality,
which speeds up data retrieval on the server.

## What is a cursor?
**A cursor** in cursor pagination is a reference point 
sent by the server to the client,
indicating from where the next set of response chunks should start.

A cursor can be:
1. An id - `string` or `number`.
2. A timestamp - `created_at` or `updated_at` for time-ordered data.
3. A [base64 encoded string](https://stackoverflow.com/a/201484).

## Cursor pagination parameters
**Cursor pagination parameters** are arguments controlling
how large the paginated response will be when returned from the server.

Common cursor pagination arguments are:

| Argument     | Type                 | Purpose                                                                                                                      | Example    |
|--------------|----------------------|------------------------------------------------------------------------------------------------------------------------------|------------|
| **`limit`**  | `number`             | Specifies the number of chunks to include.                                                                                   | `limit=20` |
| **`cursor`** | `number` or `string` | Indicates from where the next set of response chunks should start. Can be used to load "previous" or "next" response chunks. | `cursor=4` |

## Cursor pagination variants
Cursor pagination has 2 variants:
1. [Single-direction cursor pagination](single-direction-cursor.md).
2. [Bi-directional cursor pagination](bi-directional-cursor.md).