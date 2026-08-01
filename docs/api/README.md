# API documentation

API contracts and (eventually) an OpenAPI/Swagger specification live here.

The API is organized under `/api/v1` and follows REST conventions with a
consistent response envelope:

```json
{ "success": true, "message": "...", "data": {} }
{
  "success": false,
  "message": "...",
  "error": {
    "code": "ERROR_CODE",
    "details": null
  }
}
```

Successful responses may omit `data` when an endpoint has no response payload.
Backend controllers and HTTP middleware must use the shared helpers in
`server/src/utils/response.ts` instead of constructing response envelopes
directly. The available named helpers cover successful, created, bad-request,
unauthorized, forbidden, not-found, and internal-server-error responses.

Known client, validation, database, rate-limit, and future JWT failures are
normalized into this error envelope. Unknown server errors use the
`INTERNAL_SERVER_ERROR` code and do not expose internal implementation details.

## Versioned route namespace

The API currently exposes registration and login beneath the authentication
namespace:

```text
/api/v1/auth
/api/v1/users
/api/v1/posts
```

`/api/v1/users` and `/api/v1/posts` remain reserved for future endpoint
handlers. Each feature owns its endpoint definitions inside its versioned
router. New API versions can be introduced alongside `v1` without changing
existing client contracts.

## Registration

### `POST /api/v1/auth/register`

Creates a user account after validating the request body, checking the
normalized email and username for duplicates, and hashing the password with
bcrypt. This endpoint does not issue a JWT, set a cookie, or verify email.

Request body:

```json
{
  "name": "Ada Lovelace",
  "username": "ada_lovelace",
  "email": "ada@example.com",
  "password": "correct horse battery staple"
}
```

Successful response (`201 Created`):

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Ada Lovelace",
      "username": "ada_lovelace",
      "email": "ada@example.com",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2026-07-31T00:00:00.000Z",
      "updatedAt": "2026-07-31T00:00:00.000Z"
    }
  }
}
```

Validation failures use `400 VALIDATION_ERROR`. A duplicate normalized email
or username returns `409` with `EMAIL_ALREADY_EXISTS` or
`USERNAME_ALREADY_EXISTS`; a concurrent duplicate write is normalized as
`DUPLICATE_KEY_ERROR`. Password values are never included in responses.

## Login

### `POST /api/v1/auth/login`

Validates credentials, explicitly selects the otherwise hidden password hash,
compares it with bcrypt, and signs a JWT with the configured expiry. The token
is sent only in the configured HTTP-only authentication cookie; it is never
included in the JSON response.

Request body:

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple"
}
```

Successful response (`200 OK`):

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Ada Lovelace",
      "username": "ada_lovelace",
      "email": "ada@example.com",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2026-08-01T00:00:00.000Z",
      "updatedAt": "2026-08-01T00:00:00.000Z"
    }
  }
}
```

The response sets the configurable authentication cookie with `HttpOnly`,
`SameSite`, `Secure`, `Path=/`, `Max-Age`, and `Priority=High` attributes.
Production startup fails if secure cookies are disabled, or if `SameSite=none`
is used without `Secure`. Invalid or unknown credentials return
`401 INVALID_CREDENTIALS` without revealing which value failed.

## Infrastructure endpoint

### `GET /`

Confirms that the API process is running independently of product endpoints.

```json
{
  "success": true,
  "message": "DevHub API Running"
}
```
