# Dispatch News Portal — Data Relationships

## Overview

This document describes all entity relationships in the `dispatch_portal` database, including embedding vs referencing decisions with rationale.

---

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DISPATCH PORTAL                             │
└─────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐        one-to-many       ┌──────────────────────┐
     │   AUTHORS    │ ────────────────────────► │     ARTICLES         │
     │  (authors)   │                           │     (articles)       │
     └──────┬───────┘                           └──────┬───┬───────────┘
            │                                          │   │
            │ one-to-one                               │   │ many-to-one
            ▼                                          │   ▼
     ┌──────────────┐                           ┌──────┴───────────────┐
     │    USERS     │◄──── one-to-many ─────────│    CATEGORIES        │
     │   (users)    │                           │   (categories)       │
     └──────┬───────┘                           └──────────────────────┘
            │
            ├──── one-to-many ───────────────► ┌──────────────────────┐
            │                                  │    BOOKMARKS         │
            │                                  │   (bookmarks)        │
            │                                  └──────────────────────┘
            │
            ├──── one-to-many ───────────────► ┌──────────────────────┐
            │                                  │   SUBSCRIPTIONS      │
            │                                  │  (subscriptions)     │
            │                                  └──────────────────────┘
            │
            └──── one-to-many ───────────────► ┌──────────────────────┐
                                               │    COMMENTS          │
                                               │   (comments)         │
                                               └──────────────────────┘
                                                         │
                                                         │ self-referential
                                                         └──── (replies)

     ┌──────────────┐        many-to-many       ┌──────────────────────┐
     │    TAGS      │ ◄─────────────────────── │     ARTICLES         │
     │   (tags)     │   (via tags[] in article) │     (articles)       │
     └──────────────┘                           └──────────────────────┘

     ┌──────────────┐        many-to-many       ┌──────────────────────┐
     │    MEDIA     │ ◄─────────────────────── │     ARTICLES         │
     │   (media)    │ (via article_ids in media │  (featured_image,    │
     └──────────────┘   & media_id refs in art) │   media_attachments) │
                                                └──────────────────────┘

     ┌──────────────┐        many-to-one        ┌──────────────────────┐
     │  TRENDING    │ ────────────────────────► │     ARTICLES         │
     │  (trending)  │                           │     (articles)       │
     └──────────────┘                           └──────────────────────┘

     ┌──────────────┐        many-to-one        ┌──────────────────────┐
     │  ANALYTICS   │ ────────────────────────► │     ARTICLES         │
     │  (analytics) │                           │     (articles)       │
     └──────────────┘                           └──────────────────────┘

     ┌──────────────┐        many-to-many       ┌──────────────────────┐
     │ NEWSLETTERS  │ ◄─────────────────────── │     ARTICLES         │
     │(newsletters) │  (via article_ids[])      │     (articles)       │
     └──────────────┘                           └──────────────────────┘
```

---

## Relationships Detail

### 1. Articles → Authors (`one-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `articles.author_id` | ObjectId → `authors._id` | **Reference** |
| `articles.co_authors[]` | ObjectId[] → `authors._id` | **Reference** |
| `articles.editor_id` | ObjectId → `authors._id` | **Reference** |

**Rationale:** Authors are reused across hundreds or thousands of articles. Embedding would create massive duplication and make author profile updates a multi-document nightmare. Referencing allows a single `$lookup` join when needed, and author profile pages use the `author_id` index directly.

---

### 2. Articles → Categories (`many-to-one`)

| Field | Type | Strategy |
|---|---|---|
| `articles.category_id` | ObjectId → `categories._id` | **Reference** |

**Rationale:** Many articles share the same category. Categories change infrequently (name, color, slug), but when they do, you would not want to update thousands of embedded documents. The `category_id` + `status` + `published_at` compound index handles category listing pages efficiently without any join for counts.

---

### 3. Articles → Tags (`many-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `articles.tags[]` | ObjectId[] → `tags._id` | **Reference array** |
| `tags.article_count` | int (denormalized) | Maintained by background job |

**Rationale:** An article has 0–20 tags, and a tag may appear on thousands of articles. A junction collection is unnecessary in MongoDB — storing ObjectIds in an embedded array allows `{ tags: tagId }` equality queries through the `idx_articles_tags_status_published` multikey index. The `tags.article_count` field is a denormalized cache updated asynchronously.

---

### 4. Articles → Comments (`one-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `comments.article_id` | ObjectId → `articles._id` | **Reference** |
| `articles.comment_count` | int (denormalized) | Cached count |

**Rationale:** Comments are a separate collection because:
- Comments are queried independently of articles (moderation queue, user history)
- An active article can accumulate thousands of comments — embedding would breach the 16MB BSON limit
- Separate collection allows TTL or archival of old comments independently
- The `comment_count` on `articles` is a denormalized cache for display without a `$lookup`

---

### 5. Comments → Comments (`self-referential / one-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `comments.parent_comment_id` | ObjectId → `comments._id` (nullable) | **Adjacency list** |
| `comments.depth` | int | Stored for query efficiency |

**Rationale:** The adjacency list model (each node stores its parent) is the right choice for MongoDB because:
- Max nesting depth is 5, so no unbounded tree traversals are needed
- `{ parent_comment_id: null }` retrieves all root comments for an article
- `{ parent_comment_id: commentId }` retrieves all direct replies efficiently
- The `depth` field prevents unbounded nesting without requiring tree traversal
- Alternative (nested sets or path enumeration) is overkill for comment depth ≤ 5

---

### 6. Users → Subscriptions (`one-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `subscriptions.user_id` | ObjectId → `users._id` | **Reference** |
| `users.subscription_tier` | string (denormalized) | Maintained on subscription change |

**Rationale:** Subscription history is important for billing reconciliation and payment audits. Embedding payment history in the user document would bloat the document over time. Separation also allows querying all subscriptions by status or plan without loading user data. The `subscription_tier` denormalization on `users` avoids a join for access control checks (the most frequent subscription query).

---

### 7. Users → Bookmarks (`one-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `bookmarks.user_id` | ObjectId → `users._id` | **Reference** |
| `bookmarks.article_id` | ObjectId → `articles._id` | **Reference** |

**Rationale:** Although bookmarks could be embedded in `users` as an array, a separate collection was chosen because:
- No limit on bookmark count per user (embedding creates document size risk)
- Bookmarks need to support querying from the article side (e.g., "how many times was this article bookmarked, and who?")
- The unique compound index `{ user_id, article_id }` prevents duplicates efficiently
- Richer metadata (collections, notes, tags) would bloat the user document

---

### 8. Articles → Media (`many-to-many`)

| Field | Type | Strategy |
|---|---|---|
| `articles.featured_image.media_id` | ObjectId → `media._id` | **Embedded reference** |
| `articles.media_attachments[].media_id` | ObjectId[] → `media._id` | **Reference** |
| `media.article_ids[]` | ObjectId[] → `articles._id` | **Back-reference array** |

**Rationale:** Media metadata (URL, alt, caption) is **partially embedded** in articles for read performance on the article page (no join needed for display). The `media_id` reference is retained for full metadata access (dimensions, variants, credits). The back-reference `article_ids[]` on media enables "find all articles using this image" queries for the media library.

---

### 9. Trending → Articles (`many-to-one`)

| Field | Type | Strategy |
|---|---|---|
| `trending.article_id` | ObjectId → `articles._id` | **Reference** |

**Rationale:** Trending is a materialized cache computed by a background job (every 15 minutes). It references articles rather than embedding them because the trending scores change frequently but the article content does not. The TTL index auto-expires stale trending documents.

---

### 10. Analytics → Articles/Users (`many-to-one`)

| Field | Type | Strategy |
|---|---|---|
| `analytics.article_id` | ObjectId → `articles._id` | **Reference** |
| `analytics.user_id` | ObjectId → `users._id` (nullable) | **Reference** |
| `analytics.category_id` | ObjectId → `categories._id` (nullable) | **Denormalized reference** |

**Rationale:** Analytics is a high-volume write collection (millions of events/day). Events are stored as individual documents (event log pattern) for flexible aggregation. `category_id` is denormalized to avoid joins in analytics dashboards. A 90-day TTL auto-purges raw events; summarized data is aggregated into separate time-series stores for long-term retention.

---

### 11. Authors → Users (`one-to-one, optional`)

| Field | Type | Strategy |
|---|---|---|
| `authors.user_id` | ObjectId → `users._id` (nullable) | **Reference** |

**Rationale:** Not all authors have user accounts (e.g., wire service credits, guest contributors). When an author does have an account, `user_id` links them for role-based access. This optional link avoids merging the `users` and `authors` collections, which would complicate the schema since many users are readers only.

---

## Embedding vs Referencing Decision Matrix

| Relationship | Strategy | Key Reason |
|---|---|---|
| Article → featured_image metadata | **Embed** (partial) | Zero-join article page render |
| Article → author | **Reference** | Author profile updates; reuse across 1000s of articles |
| Article → category | **Reference** | Category branding changes; compound index suffices |
| Article → tags | **Reference array** | Multikey index enables efficient tag queries |
| Article → version history (last 5) | **Embed** | Bounded size; same document read pattern |
| User → reading history (capped 100) | **Embed** | Bounded, always accessed with user |
| User → preferences | **Embed** | Always accessed with user; small, rarely changes |
| User → payment history | **Separate collection** | Unbounded; audit requirements |
| Comment → parent | **Adjacency list ref** | Bounded depth; simple parent/child queries |
| Trending → article | **Reference** | Score changes frequently; article content does not |
| Analytics → article/user | **Reference** | High write volume; flexible aggregation |

---

## Denormalization Strategy

These fields are deliberately duplicated to avoid expensive joins on hot read paths:

| Denormalized Field | Source of Truth | Update Trigger |
|---|---|---|
| `articles.comment_count` | `comments` collection | Comment insert/delete (background job or event) |
| `articles.view_count` | `analytics` collection | Analytics aggregation job (every 5 min) |
| `articles.share_count` | `analytics` collection | Analytics aggregation job |
| `users.subscription_tier` | `subscriptions` collection | Subscription status change webhook |
| `tags.article_count` | `articles` collection | Article publish/archive event |
| `categories.article_count` | `articles` collection | Article publish/archive event |
| `analytics.category_id` | `articles.category_id` | Set at event write time |
| `trending.metrics.*` | `analytics` collection | Trending recalculation job |

> **Rule:** Denormalize only for read-heavy fields where the join cost is significant and the update frequency is manageable. Never denormalize fields that change frequently and require strong consistency (e.g., user passwords, subscription status in billing flows).
