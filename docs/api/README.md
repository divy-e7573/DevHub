# API documentation

API contracts and (eventually) an OpenAPI/Swagger specification live here.

The API will be versioned under `/api` and follow REST conventions with a
consistent response envelope:

```json
{ "success": true, "data": {} }
{ "success": false, "error": { "message": "..." } }
```
