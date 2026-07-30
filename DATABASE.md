# DevHub Database Design

This document is the repository-level source of truth for DevHub's MongoDB
design. It describes data ownership and query strategy only. It contains no
Mongoose implementation, API contract, controller, service, or authentication
behavior.

Supporting documents:

- [Detailed schema design](docs/database/schema-design.md)
- [Entity relationship diagram](docs/database/er-diagram.md)
- [Model conventions](docs/database/model-conventions.md)

## Design principles

- Every top-level collection has MongoDB `_id`, `createdAt`, and `updatedAt`.
- ObjectId references connect independent or unbounded entities. MongoDB does
  not enforce foreign keys, so future write paths must validate ownership and
  target existence.
- Small, bounded, parent-owned values are embedded; unbounded timelines and
  relationships are separate collections.
- Normalized values are stored where case-insensitive uniqueness or lookup is
  required.
- Public lists use cursor pagination, not offsets.
- Indexes are added for documented queries, not preemptively for every field.

## Collections

| Collection      | Purpose                                              | Important references and embedded values                                                                                                     |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`         | Account identity and lifecycle record.               | No profile embedding; Profile references User. Holds normalized email/username, account role/status, and future credential metadata.         |
| `profiles`      | Public developer presence.                           | `user -> users._id` is unique. Bounded location, media, skills, experience, education, links, GitHub, and resume metadata are embedded.      |
| `posts`         | Independently paginated developer content.           | `author -> users._id`. Bounded media is embedded; `commentCount` is a read-optimized derived value.                                          |
| `comments`      | Independently paginated post discussion and replies. | `post -> posts._id`, `author -> users._id`, optional `parentComment -> comments._id`.                                                        |
| `follows`       | Directed User-to-User relationship join collection.  | `follower -> users._id`, `following -> users._id`; neither follower list is embedded in User.                                                |
| `notifications` | Recipient inbox items.                               | `recipient -> users._id`, optional `actor -> users._id`; embedded typed `resource` descriptor points to a Post, Comment, Follow, or Message. |
| `conversations` | Direct-message container and participant read state. | Bounded `participants[].user -> users._id`; optional `participants[].lastReadMessage` and `lastMessage` point to Messages.                   |
| `messages`      | Unbounded conversation timeline.                     | `conversation -> conversations._id`, `sender -> users._id`; bounded attachment metadata is embedded.                                         |

All collection names are plural MongoDB collections. Future Mongoose model
files remain singular and lowercase, such as `post.model.ts`.

## Relationships and ObjectId reference direction

| Relationship                  | Cardinality                                             | Stored direction                                                                 | Reason                                                                      |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| User-Profile                  | User zero/one Profile; Profile exactly one User         | `profiles.user -> users._id`                                                     | Keeps private account identity separate from public profile data.           |
| User-Post                     | one User to many Posts                                  | `posts.author -> users._id`                                                      | Posts are unbounded, independently queried content.                         |
| User-Comment                  | one User to many Comments                               | `comments.author -> users._id`                                                   | Preserves author ownership and moderation history.                          |
| Post-Comment                  | one Post to many Comments                               | `comments.post -> posts._id`                                                     | Comments require their own pagination and lifecycle.                        |
| Comment reply                 | zero/one parent to many replies                         | `comments.parentComment -> comments._id`                                         | Supports bounded-depth threading without embedded reply trees.              |
| User-Follow                   | many-to-many directed relationship                      | `follows.follower -> users._id`; `follows.following -> users._id`                | Follower/following lists are unbounded.                                     |
| User-Notification             | one User to many notifications                          | `notifications.recipient -> users._id`                                           | Each notification belongs to one inbox.                                     |
| Notification actor            | zero/one User to many notifications                     | `notifications.actor -> users._id`                                               | System notifications have no actor.                                         |
| Notification resource         | optional typed target                                   | `notifications.resource.id -> target._id`                                        | The embedded `resource.kind` selects Post, Comment, Follow, or Message.     |
| User-Conversation             | many-to-many, exactly two Users per direct conversation | `conversations.participants[].user -> users._id`                                 | Participant state is bounded and read with the conversation.                |
| Conversation-Message          | one Conversation to many Messages                       | `messages.conversation -> conversations._id`                                     | Message history is unbounded and independently paginated.                   |
| User-Message                  | one User to many Messages                               | `messages.sender -> users._id`                                                   | Captures authorship independently of conversation membership.               |
| Conversation message pointers | optional pointers                                       | `conversations.lastMessage` and `participants[].lastReadMessage -> messages._id` | Supports conversation previews and read positions without scanning history. |

The Mermaid visualization of these relationships is maintained in
[docs/database/er-diagram.md](docs/database/er-diagram.md).

## Unique constraints

| Collection      | Constraint                                       | Purpose                                                                          |
| --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `users`         | normalized `email` unique                        | Prevents duplicate account email identities.                                     |
| `users`         | normalized `username` unique                     | Guarantees one stable public handle.                                             |
| `profiles`      | `user` unique                                    | Enforces at most one Profile per User.                                           |
| `follows`       | `{ follower, following }` unique                 | Prevents duplicate directed follow relationships.                                |
| `conversations` | `participantKey` unique for direct conversations | Prevents duplicate direct conversations for the same canonical participant pair. |

`participantKey` is derived from the two sorted User ObjectIds. It is a
storage-level uniqueness aid, not an API field.

## Indexes

| Collection      | Index fields and order                                            | Query supported                                       |
| --------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| `users`         | normalized `email` unique                                         | Account lookup by email.                              |
| `users`         | normalized `username` unique                                      | Public profile lookup by username.                    |
| `profiles`      | `user` unique                                                     | One-to-one profile lookup.                            |
| `posts`         | `author`, `createdAt` descending, `_id` descending                | A profile's posts, newest first.                      |
| `posts`         | `visibility`, `createdAt` descending, `_id` descending            | Public newest-first feed.                             |
| `comments`      | `post`, `parentComment`, `createdAt` descending, `_id` descending | Top-level comments and direct replies.                |
| `comments`      | `author`, `createdAt` descending, `_id` descending                | Author comment history and moderation.                |
| `follows`       | `{ follower, following }` unique                                  | Follow existence and duplicate prevention.            |
| `follows`       | `following`, `createdAt` descending, `_id` descending             | Followers list.                                       |
| `follows`       | `follower`, `createdAt` descending, `_id` descending              | Following list.                                       |
| `notifications` | `recipient`, `readAt`, `createdAt` descending, `_id` descending   | Inbox and unread inbox pagination.                    |
| `notifications` | `expiresAt` TTL, when retention is enabled                        | Automatic expiry of selected ephemeral notifications. |
| `conversations` | `participantKey` unique for direct conversations                  | Direct-conversation lookup and duplicate prevention.  |
| `conversations` | `participants.user`, `lastMessageAt` descending, `_id` descending | A user's conversation list.                           |
| `messages`      | `conversation`, `createdAt` descending, `_id` descending          | Conversation history pagination.                      |
| `messages`      | `sender`, `createdAt` descending, `_id` descending                | Sender moderation and audit queries.                  |

When soft deletion is introduced, high-traffic indexes for affected
collections become partial indexes scoped to `deletedAt: null`. Every index
must be confirmed with query plans and production metrics before it is added.

## Cursor pagination

Cursor pagination is mandatory for unbounded public collections: posts,
comments, follows, notifications, conversations, and messages.

- Sort newest-first by `createdAt` descending and `_id` descending.
- Encode the final record's timestamp and ObjectId as an opaque cursor.
- Use the same fields, order, and equality filters in the matching compound
  index.
- Validate cursor and limit values before querying.
- Fetch one record beyond the requested page size to determine `hasNextPage`.
- Return `items`, `pageInfo.endCursor`, and `pageInfo.hasNextPage`.
- Do not run an exact count on every page; provide a total only where product
  behavior explicitly requires its cost.

Offset pagination is limited to small, bounded administrative views. It is not
appropriate for timelines because inserts shift offsets and deep scans become
expensive.

## Soft delete strategy

Soft delete is a future, model-by-model decision rather than a global default.

- A soft-deletable record adds `deletedAt`; `null` means active.
- Normal repository reads explicitly include `deletedAt: null`.
- Administrative restore or include-deleted access is explicit.
- Post, Comment, and Message are likely soft-delete candidates because
  moderation and conversation continuity may require recoverability.
- Follow records are hard-deleted on unfollow because they are relationship
  state, not an initial audit record.
- Avoid implicit Mongoose query middleware for deletion filtering; it hides
  behavior from aggregation, analytics, and administrative queries.

## Search strategy

Search is not implemented in the initial schema phase. The strategy is:

1. Use unique indexed exact lookups for `username` and normalized email; never
   use unbounded regular-expression scans for identity lookup.
2. Use MongoDB Atlas Search when hosted on Atlas for relevance-ranked profile
   and post search. Initial searchable fields should be Profile display name,
   headline, bio, normalized skills, and Post body.
3. Keep search documents derived from the canonical collections. Search data is
   an index or projection, not a second source of truth.
4. Treat search updates as eventually consistent and define update/deletion
   propagation before the feature ships.
5. If Atlas Search is unavailable at the required scale, evaluate a dedicated
   search service rather than adding broad MongoDB text indexes and regex
   queries to transactional collections.

## Future scalability

- Keep arrays bounded: do not embed followers, posts, comments, messages, or
  notification history inside parent documents.
- Use the documented cursor indexes before adding cache layers; cache only
  measured hot reads such as profile cards or feed pages.
- Treat `commentCount`, `lastMessage`, `lastMessageAt`, and notification
  display data as deliberate denormalizations. Future write paths need
  idempotency and consistent update rules for them.
- Use TTL only for collections or fields with an approved retention policy;
  TTL deletion is asynchronous and unsuitable for immediate user-visible
  deletion.
- Monitor index size, write amplification, and slow query plans. Remove unused
  indexes because every index consumes memory and slows writes.
- Do not select shard keys before production access patterns are measured.
  Posts and Messages are expected high-growth collections, so their query
  shapes and distribution should be monitored before any sharding decision.
- Keep media bytes outside MongoDB. Store only bounded provider metadata in
  Profile, Post, and Message documents.

## Implementation boundaries

When implementation begins, schemas belong in `server/src/models/`; model
contracts, indexes, validation rules, and query behavior must match this
document and the linked detailed design. Repositories should select and
populate only what a query needs.

This document intentionally does not implement or define authentication,
authorization, sessions, JWTs, passwords, APIs, controllers, or services.
