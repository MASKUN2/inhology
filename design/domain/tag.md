# Tag — aggregate root

The only grouping of posts: a topic or collection label applied across many
posts. See the
[full ERD](./README.md).

```mermaid
erDiagram
    POST }o--o{ TAG : "tagged"
    COLLECTION }o--o{ TAG : "rules"

    TAG {
        string   id PK
        string   slug UK
        string   name
        datetime createdAt
    }
```

## Attributes

| Field | Type | Optional | Notes |
|---|---|---|---|
| `id` | string (cuid) | — | PK |
| `slug` | string | — | **Unique**, URL-safe; derived from the name. |
| `name` | string | — | Display name, rendered as a badge. |
| `createdAt` | datetime | — | Timestamp. **No `updatedAt`** on this model. |

## Relations

- **Posts (0..*):** many-to-many via the implicit `PostTags` join. A post may carry
  zero or more tags; a tag spans many posts.

## Invariants & rules

- Slug is **unique** and URL-safe ([§5.2](../spec/policies.md#52-identifiers)).
- A tag typed on a post is matched to an existing tag by **name
  (case-insensitive) or slug**; only an unmatched name creates a tag.
- Tag pages and tag counts cover **published posts only**
  ([§4.3](../spec/functional.md#43-tags)); the public tag bar orders tags by that
  count, highest first, and skips tags whose count is 0.
- **Collections (0..*):** a tag may be a rule of any number of collections
  ([collection.md](./collection.md)).
- Deleting a tag removes its join rows only; posts are untouched, and collection
  rules naming it disappear.
