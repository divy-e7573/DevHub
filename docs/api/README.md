# API documentation

API contracts and (eventually) an OpenAPI/Swagger specification live here.

The API will be versioned under `/api` and follow REST conventions with a
consistent response envelope:

```json
{ "success": true, "data": {} }
{ "success": false, "message": "..." }
```

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
