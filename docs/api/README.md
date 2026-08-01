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

The API currently exposes authentication and public-profile routes beneath the
following namespaces:

```text
/api/v1/auth
/api/v1/profiles
/api/v1/users
/api/v1/posts
```

`/api/v1/users` and `/api/v1/posts` remain reserved for future endpoint
handlers. Each feature owns its endpoint definitions inside its versioned
router. New API versions can be introduced alongside `v1` without changing
existing client contracts.

## Profiles

Profile responses expose only public identity (`id`, `name`, and `username`)
and profile data. They never include email, password hashes, roles, JWTs, or
other account-only fields.

### `GET /api/v1/profiles/:username`

Returns the public profile for a normalized username. A user without saved
profile details receives a valid empty profile projection, allowing every
registered developer to have a public profile URL. Unknown usernames return
`404 PROFILE_NOT_FOUND`.

### `PUT /api/v1/profiles/me`

Requires the HTTP-only authentication cookie. Creates the authenticated user's
one-to-one profile on first update or updates it subsequently. The request body
is strict: only `bio`, `location`, `skills`, `experience`, `education`,
`portfolio`, and `socialLinks` (`github`, `twitter`, `linkedin`) are accepted.
Nested entries have bounded lengths and URLs/dates are validated before any
database write.

### `POST /api/v1/profiles/me/avatar`

### `POST /api/v1/profiles/me/cover-image`

Both endpoints require authentication and accept a single `image` multipart
field. JPEG, PNG, and WebP images up to 5 MB are accepted, transformed and
stored in Cloudinary; only the resulting secure URL is stored in MongoDB.
They return `503 MEDIA_NOT_CONFIGURED` until all Cloudinary environment
variables are configured.

## Posts, likes, and comments

### `POST /api/v1/posts`

Requires authentication. Accepts `content` and up to four optional `images`
multipart fields. A post must include non-empty content or at least one image.
Images use the same JPEG/PNG/WebP and 5 MB limits as profile media.

### `GET /api/v1/posts`

Returns the newest-first public feed as a cursor page. `limit` is capped at
50; pass the prior response's `pageInfo.endCursor` as `cursor` for the next
page. Authenticated callers also receive the viewer-specific `isLiked` field.

### `DELETE /api/v1/posts/:id`

Requires authentication and post ownership. It removes the post and its Like
and Comment records; other users receive `403 POST_FORBIDDEN`.

### `POST` / `DELETE /api/v1/posts/:id/like`

Requires authentication. These idempotently create or remove the caller's
like and return the updated post projection. The unique Like index prevents
duplicates under concurrent requests.

### `POST` / `GET /api/v1/posts/:id/comments`

Creating a comment requires authentication and a non-empty `content` field.
Listing comments is public and uses the same cursor query parameters and
response shape as the feed.

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

## Logout

### `POST /api/v1/auth/logout`

Clears the authentication cookie using the same path, domain, Secure, and
SameSite attributes used when it was created. The endpoint is idempotent and
returns:

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

## Current user

### `GET /api/v1/auth/me`

Requires the authentication cookie. The JWT is verified by authentication
middleware, then the current user is loaded from MongoDB. Password data is
never selected or returned.

Successful responses use the same `data.user` shape as login. Missing, expired,
malformed, or structurally invalid tokens return `401` with
`AUTHENTICATION_REQUIRED`, `TOKEN_EXPIRED`, or `INVALID_TOKEN`.

## Infrastructure endpoint

### `GET /`

Confirms that the API process is running independently of product endpoints.

```json
{
  "success": true,
  "message": "DevHub API Running"
}
```
