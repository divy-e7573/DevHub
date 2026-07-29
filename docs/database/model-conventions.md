# MongoDB model conventions

This document defines the standard for future Mongoose models. It establishes
the persistence contract only; no business model or schema is implemented by
this document.

## Naming

- Use singular, lowercase model filenames: `post.model.ts`,
  `notification.model.ts`.
- Use PascalCase for exported Mongoose models and TypeScript entity contracts:
  `Post`, `Notification`, `PostDocument`.
- Use camelCase for document fields and relation names: `author`,
  `commentCount`, `deletedAt`.
- Let Mongoose use its normal plural collection name unless an existing
  collection requires an explicit name. Do not expose collection names to API
  consumers.
- Give references role-based names instead of generic names: `author`,
  `recipient`, `parentPost`, and `deletedBy` are clearer than `userId` when the
  role matters.

## Timestamps and document lifecycle

Every persistent top-level schema must enable Mongoose timestamps. Models must
use the supplied `createdAt` and `updatedAt` fields rather than maintaining
parallel date fields or setting them in services.

Use timestamps on embedded documents only when their independent audit history
is useful. Avoid timestamps on small, immutable value objects because they add
storage and update overhead without value.

Future model TypeScript contracts can extend `TimestampedEntity` from
`server/src/types/database.ts`; this gives service and repository code a
consistent view of generated timestamp fields without requiring a base schema.

## ObjectId references and embedding

Use `Schema.Types.ObjectId` for relationships between independently managed,
potentially unbounded documents. Every reference must declare its target model
with Mongoose `ref`, and repository-layer types should use `ObjectIdReference`.

Reference documents for relationships such as post authors, comments, follows,
notifications, and message participants. Add an index when a reference is used
to filter, join through `populate`, or enforce a relationship constraint.

Embed only bounded, read-with-parent values that have no independent lifecycle,
such as a small media metadata object. Avoid duplicating mutable profile data in
posts; if a display snapshot is needed for product reasons, name it explicitly
and treat it as a denormalized snapshot.

## Index strategy

Indexes are query contracts, not a default on every field. Add them only after
the repository query that needs them is defined, and record the supported query
beside the index in the model source.

- Use unique indexes for durable uniqueness constraints such as an email or a
  one-per-user relationship.
- Use compound indexes in the same order as the query's equality filters and
  sort order. A feed filtered by an author and sorted newest-first needs an
  index beginning with the author reference, then the sort fields.
- Include `_id` as the final cursor tie-breaker when records are ordered by
  `createdAt`; timestamp values alone are not unique.
- Use partial indexes for future soft-deleted collections so active-document
  queries do not index deleted records unnecessarily.
- Review indexes with `explain()` and production query metrics. Unused indexes
  slow writes and consume memory.

## Soft delete strategy (future)

Soft deletion is not enabled globally today. When a product requirement needs
recoverability or auditability, the affected model should add `deletedAt` with
a `null` value for active documents. The optional `deletedBy` ObjectId
reference may be added when an actor audit trail is required.

Repositories for a soft-deletable model must apply `deletedAt: null` to normal
reads and expose an explicit administrative method for including or restoring
deleted records. Do not rely on hidden Mongoose query middleware: implicit
filters make administrative, aggregation, and analytics queries difficult to
reason about.

Use a partial index scoped to active documents for every high-traffic query on
a soft-deletable model. Hard deletion remains appropriate for short-lived,
non-auditable data when a retention requirement permits it.

## Pagination strategy

Collection endpoints should use cursor (keyset) pagination, not offset-based
pagination. The cursor is an opaque encoded representation of the final
record's ordered fields. For newest-first collections, order by `createdAt`
descending and `_id` descending; the next query selects records strictly after
that tuple using the matching compound index.

Future services must validate the cursor and `limit` with Zod, cap the limit,
and request one extra record to determine `hasNextPage`. API responses should
use the shared `CursorPage<TItem>` and `CursorPageInfo` contracts:

```json
{
  "items": [],
  "pageInfo": {
    "endCursor": null,
    "hasNextPage": false
  }
}
```

Avoid calling `countDocuments()` for every page. Return a total only when the
product explicitly needs it, because an exact count can be costly for large,
high-write collections. Offset pagination is acceptable only for small,
bounded administrative lists where stable deep pagination is not required.

## Future model checklist

Before merging a model, verify that it:

- enables timestamps;
- has a clear ownership and ObjectId-reference strategy;
- documents each index's query use case;
- defines the active-document filter if it supports soft deletion;
- has a cursor-compatible index for any public list query; and
- keeps Mongoose schema definitions in `models/` while repositories own query
  composition and population decisions.
