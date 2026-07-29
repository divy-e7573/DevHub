# API documentation

API contracts and (eventually) an OpenAPI/Swagger specification live here.

The API will be versioned under `/api` and follow REST conventions with a
consistent response envelope:

```json
{ "success": true, "data": {} }
{
  "success": false,
  "message": "...",
  "error": {
    "code": "ERROR_CODE",
    "details": null
  }
}
```

Known client, validation, database, rate-limit, and future JWT failures are
normalized into this error envelope. Unknown server errors use the
`INTERNAL_SERVER_ERROR` code and do not expose internal implementation details.

## Infrastructure endpoint

### `GET /`

Confirms that the API process is running. This is the only endpoint exposed
until product features are implemented.

```json
{
  "success": true,
  "message": "DevHub API Running"
}
```
