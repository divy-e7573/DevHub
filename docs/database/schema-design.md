# DevHub MongoDB schema design

This is the approved database design for DevHub's first domain entities. It is
a design artifact only: it creates no Mongoose schemas, authentication flow,
API, controller, or service.

## Design principles

- Every top-level collection uses MongoDB's `_id` and Mongoose timestamps
  (`createdAt`, `updatedAt`). `_id` is the stable document identity; timestamps
  support ordering, audit trails, and cursor pagination.
- Use ObjectId references for independently managed or unbounded entities. A
  MongoDB reference is not a foreign key, so repositories/services must check
  existence and ownership before writes.
- Embed small, bounded values that are nearly always read with their parent.
  Embedded values do not receive independent collections or lifecycle logic.
- Store canonical, normalized values alongside display values when a value has
  a uniqueness constraint or is queried case-insensitively.
- All public list queries use cursor pagination ordered by `createdAt` and
  `_id` descending unless a collection defines a more specific ordering.
- `Like`, search indexes, authentication tokens, sessions, password resets,
  and media-library entities are intentionally out of scope for this design.

## Relationship map

```text
User 1 ─── 1 Profile
User 1 ─── * Post
User 1 ─── * Comment
Post 1 ─── * Comment
Comment 0 ─── * Comment (parentComment replies)
User * ─── * User (Follow join collection)
User 1 ─── * Notification (recipient)
User 0 ─── * Notification (actor, optional)
Conversation 2 ─── * User (embedded participant references for direct chat)
Conversation 1 ─── * Message
User 1 ─── * Message (sender)
```

`Notification.resource` is a typed polymorphic reference to a post, comment,
follow relationship, or message. It is embedded as a `{ kind, id }` descriptor
because the pair is bounded and has no independent lifecycle.

## Common fields and lifecycle

Every entity below has these fields unless stated otherwise:

| Field       | Type     | Why it exists                                                         |
| ----------- | -------- | --------------------------------------------------------------------- |
| `_id`       | ObjectId | Immutable primary document identity and reference target.             |
| `createdAt` | Date     | Creation audit time and primary cursor-sort field.                    |
| `updatedAt` | Date     | Last persisted modification time for cache and client reconciliation. |

Soft deletion is not enabled in the initial schemas. Where it is listed as a
future field, it must follow the model convention: `deletedAt: null` means
active, normal repository queries filter to active documents, and indexes for
active queries become partial indexes. Do not introduce invisible global query
middleware for this behavior.

## 1. User

`User` is the account and identity record. Public presentation data belongs in
`Profile`, not here.

| Field             | Type              | Why it exists                                                                                                                                    |
| ----------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `email`           | normalized string | Canonical account email used for future account identification; unique after lowercasing/normalization.                                          |
| `username`        | normalized string | Stable public handle used in profile URLs and lookup; unique after lowercasing/normalization.                                                    |
| `passwordHash`    | string            | Reserved credential storage for a future authentication implementation; only a hash may be stored and it must never be selected in normal reads. |
| `role`            | enum              | Records the account's product role, initially regular user or administrator, for future authorization decisions.                                 |
| `status`          | enum              | Represents account lifecycle state such as active, suspended, or deactivated without deleting identity history.                                  |
| `emailVerifiedAt` | Date or `null`    | Records future email-verification completion without a separate boolean and timestamp.                                                           |

### Constraints and indexes

- Unique index on normalized `email`.
- Unique index on normalized `username`.
- Do not index `passwordHash`.
- Do not add a broad index on `status` unless an administrative query requires
  it; its low cardinality makes it a poor standalone index.

## 2. Profile

`Profile` is a one-to-one public-facing extension of a User. It references the
account rather than duplicating account identity values.

| Field         | Type                                    | Why it exists                                                                                                   |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `user`        | ObjectId → User                         | Owns the profile and enforces the one-to-one relationship.                                                      |
| `displayName` | string                                  | Public name shown in profile and content presentation.                                                          |
| `headline`    | string or `null`                        | Short professional summary used in profile discovery and cards.                                                 |
| `bio`         | string or `null`                        | Longer public introduction.                                                                                     |
| `location`    | embedded bounded object or `null`       | Groups city, region, and country because these values are displayed together and have no independent lifecycle. |
| `avatar`      | embedded asset object or `null`         | Stores bounded provider metadata such as URL and provider public ID for the profile image.                      |
| `coverImage`  | embedded asset object or `null`         | Stores equivalent metadata for the profile cover image.                                                         |
| `skills`      | bounded embedded array                  | Holds normalized skill names and optional display labels; these values are read with the profile.               |
| `experience`  | bounded embedded array                  | Holds profile-local career entries; no independent retrieval or ownership is required.                          |
| `education`   | bounded embedded array                  | Holds profile-local education entries for the same reason.                                                      |
| `links`       | bounded embedded array                  | Stores labeled external links displayed with the profile.                                                       |
| `github`      | embedded object or `null`               | Stores a GitHub username and synchronization metadata close to the profile it enriches.                         |
| `resume`      | embedded private asset object or `null` | Stores resume provider metadata; authorization must determine whether it is exposed.                            |

### Constraints and indexes

- Unique index on `user` guarantees one profile per account.
- Add a multikey index on normalized skills only when skills search is
  implemented and query plans justify it.
- Do not duplicate `email`, `username`, role, or account status here.

## 3. Post

`Post` is an independently paginated content item. The author is referenced;
small media metadata is embedded because it is rendered with the post.

| Field          | Type                         | Why it exists                                                                                  |
| -------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `author`       | ObjectId → User              | Identifies the account that owns and may edit/delete the post.                                 |
| `body`         | string                       | Stores the post's textual content.                                                             |
| `media`        | bounded embedded asset array | Stores image metadata required to render the post without a separate asset read for each item. |
| `visibility`   | enum                         | Defines audience scope, initially public or private, without encoding access policy in routes. |
| `commentCount` | non-negative integer         | Read-optimized denormalized count for feeds; Comment remains the source of truth.              |
| `editedAt`     | Date or `null`               | Distinguishes an edited post from one whose `updatedAt` changed for metadata-only reasons.     |

Future lifecycle field: `deletedAt` for recoverable moderation or user deletion.

### Constraints and indexes

- Index `{ author: 1, createdAt: -1, _id: -1 }` for a profile's posts.
- Index `{ visibility: 1, createdAt: -1, _id: -1 }` for public newest-first
  feeds; review it once a following feed query is defined.
- If soft deletion is added, make active-feed indexes partial on
  `deletedAt: null`.
- There is no likes design in this scope, so do not add `likeCount` until a
  source-of-truth Like entity and write-consistency strategy are designed.

## 4. Comment

`Comment` is independent because a post can have an unbounded number of
comments and comments require their own pagination, moderation, and author
ownership.

| Field           | Type                         | Why it exists                                                                      |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| `post`          | ObjectId → Post              | Identifies the post whose discussion contains the comment.                         |
| `author`        | ObjectId → User              | Identifies the comment owner and authorization subject.                            |
| `parentComment` | ObjectId → Comment or `null` | Supports one-level reply threading without embedding an unbounded reply tree.      |
| `body`          | string                       | Stores comment text.                                                               |
| `replyCount`    | non-negative integer         | Read-optimized count of direct replies; child comments remain the source of truth. |
| `editedAt`      | Date or `null`               | Indicates an intentional content edit.                                             |

Future lifecycle field: `deletedAt` for moderation and recoverable deletion.

### Constraints and indexes

- Index `{ post: 1, parentComment: 1, createdAt: -1, _id: -1 }` for paginated
  top-level comments and direct replies.
- Index `{ author: 1, createdAt: -1, _id: -1 }` for a user's comment history.
- Do not embed replies: one popular comment can have an unbounded reply set.

## 5. Follow

`Follow` is a join collection that represents a directed relationship between
two Users. It is not embedded in User because follower and following lists are
unbounded and independently paginated.

| Field       | Type            | Why it exists                      |
| ----------- | --------------- | ---------------------------------- |
| `follower`  | ObjectId → User | The account initiating the follow. |
| `following` | ObjectId → User | The account being followed.        |

### Constraints and indexes

- Unique compound index `{ follower: 1, following: 1 }` prevents duplicate
  follows.
- Index `{ following: 1, createdAt: -1, _id: -1 }` lists followers.
- Index `{ follower: 1, createdAt: -1, _id: -1 }` lists following accounts.
- Self-follow prevention is a domain validation rule; MongoDB indexing alone
  cannot enforce that the two ObjectIds differ.
- Unfollowing should hard-delete this relationship: it is not an audit record
  in the initial product design.

## 6. Notification

`Notification` is an inbox item for a recipient. It stores references and a
small immutable display snapshot rather than duplicating full source entities.

| Field       | Type                            | Why it exists                                                                                                              |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `recipient` | ObjectId → User                 | Identifies whose notification inbox contains the item.                                                                     |
| `actor`     | ObjectId → User or `null`       | Identifies who caused the event; `null` permits system-generated notifications.                                            |
| `type`      | enum                            | Determines the UI and allowed metadata, such as follow, comment, or message.                                               |
| `resource`  | embedded `{ kind, id }`         | Typed polymorphic pointer to the affected entity without a separate collection per notification type.                      |
| `data`      | small embedded object or `null` | Stores type-specific, non-authoritative display context so the inbox can render when the source changes or is unavailable. |
| `readAt`    | Date or `null`                  | Represents read state and timestamp in one field.                                                                          |
| `expiresAt` | Date or `null`                  | Allows selected ephemeral notifications to be removed by a TTL index.                                                      |

### Constraints and indexes

- Index `{ recipient: 1, readAt: 1, createdAt: -1, _id: -1 }` supports inbox
  and unread-inbox pagination.
- TTL index on `expiresAt` only if product retention requires expiry; a `null`
  value keeps durable notifications.
- Do not create a generic unique constraint. Event de-duplication requires a
  product-defined idempotency key and should be designed with the event source.

## 7. Conversation

The initial design supports direct (one-to-one) conversations. Participant
state is embedded because exactly two participants and their read positions are
always accessed with the conversation. Group conversation support requires a
separate extension, not a silent relaxation of this contract.

| Field            | Type                         | Why it exists                                                                                                                                                                                            |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`           | enum                         | Explicitly records that this is a direct conversation and creates a safe extension point for future group chats.                                                                                         |
| `participants`   | embedded bounded array       | Holds exactly two participant records, each with `user` (ObjectId → User), `lastReadMessage` (ObjectId → Message or `null`), and `lastReadAt` (Date or `null`) for read receipts and unread calculation. |
| `participantKey` | canonical string             | Deterministic sorted pair of the two User ObjectIds; enables one direct conversation per pair.                                                                                                           |
| `lastMessage`    | ObjectId → Message or `null` | Points to the latest message for conversation-list previews without loading the full message page.                                                                                                       |
| `lastMessageAt`  | Date or `null`               | Supports newest-first conversation ordering without populating `lastMessage`.                                                                                                                            |

### Constraints and indexes

- Unique partial index on `participantKey` where `kind` is direct.
- Index `{ "participants.user": 1, lastMessageAt: -1, _id: -1 }` lists a
  user's direct conversations newest-first.
- The participant array must be restricted to two distinct users for `kind`
  direct. This is schema and service validation, not a database query concern.
- Do not maintain an unbounded `readBy` array on every Message; direct-message
  read state belongs to the bounded participant state above.

## 8. Message

`Message` is a separately stored, unbounded event in a Conversation. It must
not be embedded in Conversation because message history needs independent
pagination and can grow without limit.

| Field          | Type                         | Why it exists                                                              |
| -------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `conversation` | ObjectId → Conversation      | Identifies the message stream and supports conversation-scoped pagination. |
| `sender`       | ObjectId → User              | Identifies authorship and supports authorization/audit requirements.       |
| `body`         | string or `null`             | Stores textual message content; `null` permits attachment-only messages.   |
| `attachments`  | bounded embedded asset array | Stores small message-local media metadata rendered with the message.       |
| `editedAt`     | Date or `null`               | Marks intentional text edits without redefining `updatedAt`.               |

Future lifecycle field: `deletedAt` for message removal while retaining the
conversation timeline and read positions.

### Constraints and indexes

- Index `{ conversation: 1, createdAt: -1, _id: -1 }` paginates a message
  history newest-first.
- Index `{ sender: 1, createdAt: -1, _id: -1 }` supports future moderation or
  audit queries by sender.
- At least one of `body` or `attachments` must be present; this is schema
  validation when the model is implemented.

## Reference versus embedding summary

| Data                                 | Decision                         | Reason                                                                          |
| ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------- |
| User ↔ Profile                       | Reference                        | Account and public profile have different privacy and update lifecycles.        |
| Post/Comment author                  | Reference                        | Users are independent, mutable, and shared by unbounded content.                |
| Follow                               | Reference join collection        | Both sides can grow without bound and require independent pagination.           |
| Post and message media               | Embed                            | Small bounded metadata is read with the parent content.                         |
| Profile experience, education, links | Embed                            | Profile-local, bounded information without an independent lifecycle.            |
| Notification resource                | Embed typed reference descriptor | Small polymorphic pair used only by its notification.                           |
| Conversation participants            | Embed bounded reference state    | Direct chat has exactly two members and per-member read state is read together. |
| Conversation messages                | Reference                        | Histories are unbounded and independently paginated.                            |

## Implementation guardrails

When Mongoose schemas are later implemented, each one must follow
[model conventions](model-conventions.md), declare the indexes listed here,
validate all enum/size/cardinality constraints, and avoid automatic population.
Repositories should populate only the fields required by a specific query.

This design intentionally makes no decision about authentication behavior,
password hashing, sessions, JWTs, APIs, controllers, or authorization flows.
