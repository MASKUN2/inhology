# Domain Model

The inhology domain, as an entity-relationship model. This is derived from the
persistence schema (`apps/api/prisma/schema.prisma`) and expresses the same
intent as [`../spec/README.md` §3 Domain Concepts](../spec/README.md#3-domain-concepts)
and the integrity rules in [`../spec/policies.md` §5.3](../spec/policies.md#53-relationships--integrity).

There are **four aggregate roots** — each with an independent lifecycle and its
own API resource — documented one per file:

- [`post.md`](./post.md) — **Post** (the central aggregate)
- [`tag.md`](./tag.md) — **Tag**
- [`collection.md`](./collection.md) — **Collection**
- [`comment.md`](./comment.md) — **Comment**

## Full ERD

```mermaid
erDiagram
    POST     }o--o{ TAG : "tagged (many-to-many, zero or more)"
    COLLECTION }o--o{ TAG : "rules (post must carry every one)"
    POST     ||--o{ COMMENT : "receives"
    COMMENT  |o--o{ COMMENT : "replies to (threaded)"

    POST {
        string     id PK
        string     slug UK "nullable; null while draft"
        string     title
        string     excerpt "nullable"
        string     content "markdown"
        PostStatus status "DRAFT | PUBLISHED | PRIVATE, default DRAFT"
        datetime   publishedAt "nullable, set on first publish, author-editable"
        int        readingTime "nullable, minutes"
        int        viewCount "default 0"
        datetime   createdAt
        datetime   updatedAt
        datetime   deletedAt "nullable, soft-delete marker"
    }
    TAG {
        string   id PK
        string   slug UK
        string   name
        datetime createdAt
    }
    COLLECTION {
        string   id PK
        string   slug UK
        string   title
        string   description "nullable"
        int      position "author-defined order"
        datetime createdAt
        datetime updatedAt
    }
    COMMENT {
        string        id PK
        string        content
        string        authorName
        string        authorEmail "nullable, never public"
        CommentStatus status "PENDING | APPROVED | SPAM, default PENDING"
        string        postId FK
        string        parentId FK "nullable, self"
        datetime      createdAt
        datetime      updatedAt
    }
```

## Relationships & cardinality

| From | To | Cardinality | Notes |
|---|---|---|---|
| Post | Tag | 0..* — 0..* | Many-to-many via implicit join (`PostTags`). The only grouping of posts; a post needs no tag. |
| Collection | Tag | 0..* — 0..* | Many-to-many via implicit join (`CollectionTags`). Each link is a **rule**; a collection's posts are computed (every rule tag present), never stored. |
| Post | Comment | 1 — 0..* | `onDelete: Cascade` — deleting a post deletes its comments. |
| Comment | Comment | 0..1 — 0..* | Self-relation (`CommentReplies`). A reply has one parent; `onDelete: Cascade` — deleting a parent deletes its replies. A reply must be on the **same post** as its parent. |

## Enums

- **`PostStatus`**: `DRAFT`, `PUBLISHED`, `PRIVATE` (default `DRAFT`). `PRIVATE` is a finished post whose body only the admin can read; its header is public.
- **`CommentStatus`**: `PENDING`, `APPROVED`, `SPAM` (default `PENDING`).

## Legend

- **PK** — primary key (`cuid` string). **UK** — unique key. **FK** — foreign key.
- Crow's-foot: `||` exactly one · `|o` zero-or-one · `o{` zero-or-many.
- "nullable" marks optional (`?`) attributes; all `createdAt`/`updatedAt` are
  timestamps (`updatedAt` auto-maintained; **Tag has no `updatedAt`**).
