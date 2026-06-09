# Dispatch News Portal — Schema Documentation

**Database:** `dispatch_portal`  
**MongoDB Version:** 5.0+  
**Replication:** RS0 (Primary + 2 Secondaries)  
**Transactions:** Multi-document ACID (for subscription, bookmark workflows)

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Collection: categories](#collection-categories)
3. [Collection: tags](#collection-tags)
4. [Collection: authors](#collection-authors)
5. [Collection: media](#collection-media)
6. [Collection: articles](#collection-articles)
7. [Collection: users](#collection-users)
8. [Collection: subscriptions](#collection-subscriptions)
9. [Collection: comments](#collection-comments)
10. [Collection: bookmarks](#collection-bookmarks)
11. [Collection: trending](#collection-trending)
12. [Collection: newsletters](#collection-newsletters)
13. [Collection: analytics](#collection-analytics)
14. [Indexing Strategy Summary](#indexing-strategy-summary)
15. [Security Considerations](#security-considerations)
16. [Scaling Considerations](#scaling-considerations)

---

## Database Overview

The `dispatch_portal` database supports a full-featured news publication platform with:

- **12 collections** covering content, users, engagement, and analytics
- **Validation-on-write** via `$jsonSchema` for data integrity
- **TTL indexes** for automatic expiry of trending cache and raw analytics
- **Text indexes** for full-text article search
- **Partial indexes** to reduce index size on filtered query patterns
- **Denormalized counters** on articles for zero-join homepage rendering

### Collection Summary

| Collection | Role | Est. Document Size | Write Pattern | Read Pattern |
|---|---|---|---|---|
| `categories` | Navigation taxonomy | ~1 KB | Very low | Very high |
| `tags` | Article keywords | ~500 B | Low | High |
| `authors` | Byline profiles | ~2 KB | Low | High |
| `media` | Asset metadata | ~3 KB | Medium | Medium |
| `articles` | Core content | ~50 KB | Medium | Very high |
| `users` | Accounts | ~5 KB | Medium | High |
| `subscriptions` | Billing records | ~3 KB | Low | Medium |
| `comments` | Discussions | ~1 KB | High | High |
| `bookmarks` | Saved articles | ~500 B | Medium | Medium |
| `trending` | Engagement cache | ~1 KB | High (jobs) | Very high |
| `newsletters` | Email campaigns | ~100 KB | Low | Medium |
| `analytics` | Event log | ~800 B | Very high | Medium (batch) |

---

## Collection: `categories`

**Purpose:** Navigation taxonomy. The source of truth for all category metadata including display names, URLs, colors, and SEO.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | ✅ | 2–100 chars |
| `slug` | String | ✅ | Unique; `[a-z0-9-]+` |
| `description` | String | ❌ | ≤500 chars |
| `parent_id` | ObjectId \| null | ❌ | Ref `categories._id` |
| `color` | String | ✅ | Hex `#RRGGBB` |
| `icon` | String | ❌ | ≤100 chars |
| `cover_image` | String | ❌ | URL |
| `sort_order` | Int | ❌ | ≥0 |
| `status` | String | ✅ | `active` \| `inactive` \| `hidden` |
| `meta.title` | String | ❌ | ≤200 chars |
| `meta.description` | String | ❌ | ≤500 chars |
| `meta.keywords` | String[] | ❌ | — |
| `article_count` | Int | ❌ | Denormalized; ≥0 |
| `created_at` | Date | Auto | — |
| `updated_at` | Date | Auto | — |

### Key Indexes
- `{ slug: 1 }` — unique, for URL routing
- `{ status: 1, sort_order: 1 }` — for navigation menus
- `{ parent_id: 1 }` — for subcategory tree, partial (non-null)

---

## Collection: `tags`

**Purpose:** Keyword taxonomy for cross-cutting article tagging. Used for tag archive pages, content discovery, and SEO.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `name` | String | ✅ | 1–100 chars |
| `slug` | String | ✅ | Unique; `[a-z0-9-]+` |
| `description` | String | ❌ | ≤300 chars |
| `article_count` | Int | ❌ | Denormalized; ≥0 |
| `created_at` | Date | Auto | — |
| `updated_at` | Date | Auto | — |

### Key Indexes
- `{ slug: 1 }` — unique
- `{ name: "text" }` — autocomplete
- `{ article_count: -1 }` — "Popular Tags" widget

---

## Collection: `authors`

**Purpose:** Writer and editor profiles used for article bylines, author pages, and editorial attribution.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `user_id` | ObjectId \| null | ❌ | Ref `users._id`; null for external contributors |
| `name` | String | ✅ | 2–150 chars |
| `slug` | String | ✅ | Unique; `[a-z0-9-]+` |
| `email` | String | ✅ | Unique; valid email format |
| `bio` | String | ❌ | ≤2000 chars |
| `avatar` | String | ❌ | URL |
| `title` | String | ❌ | e.g. "Senior Reporter" |
| `social_links` | Object | ❌ | twitter, linkedin, instagram, website |
| `expertise` | String[] | ❌ | Areas of expertise/beats |
| `article_count` | Int | ❌ | Denormalized; ≥0 |
| `status` | String | ✅ | `active` \| `inactive` \| `suspended` |
| `role` | String | ❌ | `author` \| `editor` \| `contributor` \| `freelancer` |
| `joined_date` | Date | ❌ | — |

### Key Indexes
- `{ slug: 1 }`, `{ email: 1 }` — unique lookups
- `{ status: 1, role: 1 }` — team directory
- `{ user_id: 1 }` — link from user account

---

## Collection: `media`

**Purpose:** Metadata store for all uploaded assets (images, videos, documents). Does not store binaries — assets live in S3/GCS/Cloudinary.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `filename` | String | ✅ | ≤500 chars |
| `url` | String | ✅ | CDN/storage URL |
| `thumbnail_url` | String | ❌ | — |
| `type` | String | ✅ | `image` \| `video` \| `audio` \| `document` \| `gif` |
| `mime_type` | String | ❌ | e.g. `image/jpeg` |
| `size_bytes` | Long | ✅ | ≥0 |
| `dimensions.width/height` | Int | ❌ | Pixels |
| `duration_seconds` | Double | ❌ | Audio/video only |
| `alt_text` | String | ❌ | ≤500 chars (accessibility) |
| `caption` | String | ❌ | ≤1000 chars |
| `credit` | String | ❌ | Photographer/source credit |
| `variants[]` | Object[] | ❌ | Optimised renditions |
| `uploaded_by` | ObjectId | ✅ | Ref `users._id` |
| `article_ids[]` | ObjectId[] | ❌ | Back-refs to `articles._id` |
| `processing_status` | String | ❌ | `pending` \| `processing` \| `complete` \| `failed` |
| `storage_provider` | String | ❌ | `s3` \| `gcs` \| `cloudinary` \| `local` |

### Key Indexes
- `{ type: 1, created_at: -1 }` — media library by type
- `{ uploaded_by: 1 }` — user's uploads
- `{ article_ids: 1 }` — find media by article
- `{ processing_status: 1 }` — job queue (partial, pending/processing only)

---

## Collection: `articles`

**Purpose:** The primary content collection. Central to all portal functionality.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `title` | String | ✅ | 5–500 chars |
| `slug` | String | ✅ | Unique; `[a-z0-9-]+` |
| `subtitle` | String | ❌ | ≤500 chars |
| `excerpt` | String | ❌ | ≤1000 chars |
| `content` | String | ✅ | Full HTML/Markdown body |
| `content_format` | String | ❌ | `html` \| `markdown` \| `rich_text` |
| `author_id` | ObjectId | ✅ | Ref `authors._id` |
| `co_authors[]` | ObjectId[] | ❌ | Refs `authors._id` |
| `editor_id` | ObjectId | ❌ | Ref `authors._id` |
| `category_id` | ObjectId | ✅ | Ref `categories._id` |
| `tags[]` | ObjectId[] | ❌ | Refs `tags._id` |
| `format` | String | ❌ | `news` \| `feature` \| `opinion` \| `breaking` \| `analysis` \| `interview` \| `review` \| `listicle` |
| `featured_image` | Object | ❌ | Embedded (url, alt, caption, credit, media_id) |
| `media_attachments[]` | Object[] | ❌ | Embedded media refs |
| `gallery[]` | Object[] | ❌ | Image gallery |
| `status` | String | ✅ | `draft` \| `review` \| `scheduled` \| `published` \| `archived` \| `deleted` |
| `published_at` | Date | ❌ | Set on publish |
| `scheduled_at` | Date | ❌ | Future publish time |
| `is_breaking` | Bool | ❌ | Breaking news flag |
| `is_featured` | Bool | ❌ | Homepage featured flag |
| `featured_position` | Int | ❌ | 1–10 homepage slot |
| `is_paywalled` | Bool | ❌ | Premium-only content |
| `breaking_expires_at` | Date | ❌ | Auto-clear breaking banner |
| `view_count` | Long | ❌ | Denormalized; ≥0 |
| `share_count` | Long | ❌ | Denormalized; ≥0 |
| `comment_count` | Long | ❌ | Denormalized; ≥0 |
| `estimated_reading_time` | Int | ❌ | Minutes; ≥1 |
| `related_articles[]` | ObjectId[] | ❌ | Curated related article refs |
| `meta` | Object | ❌ | SEO metadata (title, description, og_image) |
| `revision` | Int | ❌ | Version number; starts at 1 |
| `version_history[]` | Object[] | ❌ | Last 5 revision summaries (embedded) |

### Publishing Workflow

```
draft ──► review ──► scheduled ──► published ──► archived
              └──────────────────────────────────► deleted
```

### Key Indexes
- `{ slug: 1 }` — unique, URL routing
- `{ status: 1, published_at: -1 }` — homepage feed
- `{ category_id: 1, status: 1, published_at: -1 }` — category pages
- `{ is_featured: 1, featured_position: 1, status: 1 }` — hero section
- `{ is_breaking: 1, breaking_expires_at: 1 }` — breaking banner
- `{ title: "text", excerpt: "text", content: "text" }` — full-text search

---

## Collection: `users`

**Purpose:** User accounts with authentication, preferences, subscription tier, and a bounded reading history.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `username` | String | ✅ | Unique; 3–50 chars; `[a-zA-Z0-9_.-]+` |
| `email` | String | ✅ | Unique; valid email |
| `password_hash` | String | ✅ | bcrypt hash (never plaintext) |
| `status` | String | ✅ | `active` \| `inactive` \| `suspended` \| `deleted` |
| `role` | String | ❌ | `user` \| `author` \| `editor` \| `admin` \| `super_admin` |
| `email_verified` | Bool | ❌ | — |
| `profile` | Object | ❌ | name, bio, avatar, country, city, social_links |
| `subscription_tier` | String | ❌ | `free` \| `premium` \| `professional` |
| `preferences` | Object | ❌ | newsletter, alerts, categories, dark_mode, etc. |
| `reading_history[]` | Object[] | ❌ | Capped at 100; article_id + read_at + duration |
| `two_factor_enabled` | Bool | ❌ | TOTP-based 2FA |
| `login_attempts` | Int | ❌ | Brute-force counter |
| `locked_until` | Date | ❌ | Account lockout expiry |
| `api_keys[]` | Object[] | ❌ | Hashed API keys for integrations |
| `last_login` | Date | ❌ | — |
| `registered_at` | Date | Auto | — |

### Security Notes
- Passwords stored as **bcrypt** hashes (cost factor 12+)
- `email_verify_token` and `password_reset_token` are single-use; cleared after use
- `login_attempts` triggers lockout after 5 failures (15-minute lock)
- API key values are **hashed** before storage; displayed once to user on creation

### Key Indexes
- `{ email: 1 }` — unique, case-insensitive collation
- `{ username: 1 }` — unique
- `{ password_reset_token: 1 }` — sparse
- `{ "preferences.newsletter_subscribed": 1, subscription_tier: 1 }` — email segmentation

---

## Collection: `subscriptions`

**Purpose:** Billing records for user subscription plans. Maintains payment history and Stripe/PayPal integration data.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `user_id` | ObjectId | ✅ | Ref `users._id` |
| `plan` | String | ✅ | `free` \| `premium` \| `professional` |
| `billing_cycle` | String | ❌ | `monthly` \| `annual` \| `lifetime` \| `trial` |
| `status` | String | ✅ | `active` \| `cancelled` \| `expired` \| `past_due` \| `trialing` |
| `amount_cents` | Int | ❌ | Price in smallest currency unit |
| `currency` | String | ❌ | ISO 4217 (e.g. `USD`) |
| `payment_provider` | String | ❌ | `stripe` \| `paypal` \| `manual` \| `none` |
| `external_subscription_id` | String | ❌ | Provider's subscription ID |
| `started_at` | Date | ✅ | — |
| `expires_at` | Date | ❌ | — |
| `auto_renew` | Bool | ❌ | — |
| `payment_history[]` | Object[] | ❌ | Embedded payment events |

### Key Indexes
- `{ user_id: 1, status: 1 }` — active subscription check
- `{ expires_at: 1, status: 1 }` — renewal reminder job
- `{ external_subscription_id: 1 }` — webhook reconciliation

---

## Collection: `comments`

**Purpose:** Article comment threads with nested reply support up to depth 5.

### Threading Model

Comments use the **adjacency list** pattern:
- Root comments: `parent_comment_id = null`, `depth = 0`
- Replies: `parent_comment_id = <parent _id>`, `depth = parent.depth + 1`
- Max depth: 5 (enforced by validation + application logic)

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `article_id` | ObjectId | ✅ | Ref `articles._id` |
| `user_id` | ObjectId | ✅ | Ref `users._id` |
| `parent_comment_id` | ObjectId \| null | ❌ | null = root comment |
| `depth` | Int | ❌ | 0–5 |
| `content` | String | ✅ | 1–5000 chars |
| `status` | String | ✅ | `pending` \| `approved` \| `rejected` \| `spam` \| `deleted` |
| `is_pinned` | Bool | ❌ | Editor-pinned comment |
| `votes_up` | Int | ❌ | Upvotes; ≥0 |
| `votes_down` | Int | ❌ | Downvotes; ≥0 |
| `reply_count` | Int | ❌ | Denormalized direct reply count |
| `moderation_flags[]` | Object[] | ❌ | User reports with reason |

### Moderation Statuses

```
pending ──► approved ──► deleted (soft delete)
        └──► rejected
        └──► spam
```

New comments from unverified users default to `pending`. Verified users with good history get `approved` immediately.

### Key Indexes
- `{ article_id: 1, parent_comment_id: 1, status: 1, created_at: -1 }` — article thread
- `{ parent_comment_id: 1, status: 1, created_at: 1 }` — reply fetching
- `{ user_id: 1, status: 1, created_at: -1 }` — user's comment history
- `{ status: 1, created_at: 1 }` — moderation queue (partial: pending/flagged)

---

## Collection: `bookmarks`

**Purpose:** User-saved articles organized into optional named collections.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `user_id` | ObjectId | ✅ | Ref `users._id` |
| `article_id` | ObjectId | ✅ | Ref `articles._id` |
| `collection` | String | ❌ | User-defined folder; ≤100 chars |
| `note` | String | ❌ | Private note; ≤1000 chars |
| `tags` | String[] | ❌ | User-defined labels |
| `created_at` | Date | Auto | — |

### Key Indexes
- `{ user_id: 1, article_id: 1 }` — unique (no duplicate saves)
- `{ user_id: 1, created_at: -1 }` — user's bookmark list
- `{ user_id: 1, collection: 1, created_at: -1 }` — collection browsing

---

## Collection: `trending`

**Purpose:** Materialized view of trending articles, refreshed by a background job every 15 minutes. TTL-indexed for automatic expiry.

### Trending Score Formula

```
score = views × 1.0
      + shares × 5.0
      + comments × 3.0
      + bookmarks × 2.0
      + likes × 1.5
```

Scores are decay-adjusted by time: `effective_score = score / (hours_since_published + 2)^1.5`

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `article_id` | ObjectId | ✅ | Ref `articles._id` |
| `category_id` | ObjectId \| null | ❌ | For category-level trending |
| `period` | String | ✅ | `1h` \| `24h` \| `7d` \| `30d` |
| `score` | Double | ✅ | ≥0 |
| `rank_position` | Int | ✅ | ≥1 |
| `metrics` | Object | ❌ | Breakdown: views, shares, comments, bookmarks, likes |
| `last_updated` | Date | ✅ | — |
| `expires_at` | Date | ✅ | **TTL field** — auto-deleted after this date |

### Key Indexes
- `{ period: 1, rank_position: 1 }` — global trending list
- `{ period: 1, category_id: 1, rank_position: 1 }` — category trending
- `{ article_id: 1, period: 1 }` — unique per article+period
- `{ expires_at: 1 }` — TTL (expireAfterSeconds: 0)

---

## Collection: `newsletters`

**Purpose:** Email campaign management — configuration, article selection, scheduling, and send statistics.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `name` | String | ✅ | Internal name; ≤200 chars |
| `subject` | String | ✅ | Email subject; ≤300 chars |
| `preview_text` | String | ❌ | Email preview snippet; ≤200 chars |
| `body_html` | String | ❌ | Full HTML email body |
| `body_text` | String | ❌ | Plain-text fallback |
| `status` | String | ✅ | `draft` \| `scheduled` \| `sending` \| `sent` \| `failed` \| `archived` |
| `type` | String | ❌ | `digest` \| `breaking` \| `promotional` \| `weekly` \| `custom` |
| `scheduled_at` | Date | ❌ | — |
| `sent_at` | Date | ❌ | Actual send timestamp |
| `article_ids[]` | ObjectId[] | ❌ | Featured articles |
| `target_segments[]` | String[] | ❌ | `all` \| `free` \| `premium` \| `professional` |
| `send_stats` | Object | ❌ | delivered, opened, clicked, unsubscribed, bounced |
| `created_by` | ObjectId | ❌ | Ref `users._id` |

---

## Collection: `analytics`

**Purpose:** Raw event log for user behavior tracking. High-volume write collection with 90-day TTL. Used as input to batch aggregation jobs.

### Field Reference

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | — |
| `event_type` | String | ✅ | `view` \| `unique_view` \| `share` \| `comment` \| `bookmark` \| `like` \| `scroll_depth` \| `click` |
| `article_id` | ObjectId | ✅ | Ref `articles._id` |
| `category_id` | ObjectId \| null | ❌ | Denormalized from article |
| `user_id` | ObjectId \| null | ❌ | null for anonymous |
| `session_id` | String | ❌ | Browser session identifier |
| `anonymous_id` | String | ❌ | Fingerprint for anonymous users |
| `timestamp` | Date | ✅ | Event time |
| `source` | String | ❌ | `direct` \| `search` \| `social` \| `email` \| `referral` \| `push` |
| `platform` | String | ❌ | `web` \| `ios` \| `android` \| `amp` |
| `device_type` | String | ❌ | `desktop` \| `mobile` \| `tablet` |
| `country` | String | ❌ | ISO 3166-1 alpha-2 |
| `reading_duration_s` | Int | ❌ | Seconds on page |
| `scroll_depth_pct` | Int | ❌ | 0–100% |
| `share_platform` | String \| null | ❌ | Twitter, Facebook, etc. |

### Write Strategy
Analytics events are batched client-side (every 30 seconds or on page unload) and written via `insertMany` for throughput. Validation is set to `warn` mode to avoid write failures on high-volume paths.

### Key Indexes
- `{ article_id: 1, event_type: 1, timestamp: -1 }` — article dashboard
- `{ user_id: 1, event_type: 1, timestamp: -1 }` — user timeline
- `{ timestamp: -1, event_type: 1 }` — time-bucket aggregations
- `{ timestamp: 1 }` — TTL (expireAfterSeconds: 7776000 = 90 days)

---

## Indexing Strategy Summary

### Index Type Decisions

| Pattern | Index Type | Rationale |
|---|---|---|
| URL slug lookup | Unique single-field | Every page load; must be O(1) |
| Category + status + date | Compound | Category page queries; selectivity order matters |
| Full-text search | Text with weights | title×10, excerpt×5, content×1 |
| Trending expiry | TTL | Automatic cleanup; no cron job needed |
| Analytics expiry | TTL (90 days) | Raw events purged; aggregates retained separately |
| Email verification | Sparse | Only set on unverified accounts |
| Moderation queue | Partial | Only index pending/flagged; reduces index size by ~95% |
| Bookmark uniqueness | Unique compound | Enforce no-duplicate saves at DB level |

---

## Security Considerations

### Authentication
- Passwords: **bcrypt** with cost factor ≥ 12
- JWT tokens: Signed with RS256; short expiry (15 min access, 7 day refresh)
- 2FA: TOTP (RFC 6238); secret stored encrypted at rest
- Account lockout: 5 failed attempts → 15-minute lock

### Authorization (Role Hierarchy)

```
super_admin > admin > editor > author > user
```

| Role | Can do |
|---|---|
| `user` | Read free content; manage own bookmarks/comments |
| `author` | Create/edit own articles; upload media |
| `editor` | Manage all articles; moderate comments; send newsletters |
| `admin` | User management; subscription management |
| `super_admin` | Everything; DB config; role assignment |

### Sensitive Fields
| Field | Protection |
|---|---|
| `password_hash` | Never returned in API responses |
| `email_verify_token` | Cleared after use |
| `password_reset_token` | Hashed; cleared after use; TTL-expiring |
| `two_factor_secret` | Encrypted at rest; never exposed in API |
| `api_keys[].key_hash` | Raw key shown once; hash stored |
| User `email` | Restricted to user + admin in API responses |

### Audit Logging
- All admin actions (role changes, content deletion, subscription modifications) should be written to a separate `audit_log` collection
- Use MongoDB **Change Streams** for real-time audit capture in production

---

## Scaling Considerations

### Horizontal Scaling (Sharding)
For production at scale (>10M articles, >1M users):

| Collection | Shard Key | Rationale |
|---|---|---|
| `articles` | `{ category_id: 1, published_at: -1 }` | Co-locate category queries |
| `analytics` | `{ timestamp: 1 }` (hashed) | Even write distribution |
| `comments` | `{ article_id: 1 }` | Co-locate comment threads |
| `users` | `{ _id: "hashed" }` | Even distribution |

### Caching Layer (Redis)
These collections/queries are excellent cache candidates:
- `categories` (all) — TTL: 1 hour
- `trending` (global, 24h) — TTL: 15 minutes
- Article detail page (`slug` lookup) — TTL: 5 minutes (invalidate on update)
- Homepage featured articles — TTL: 2 minutes

### Connection Pooling
- Pool size: 10–100 connections per application instance
- `maxIdleTimeMS: 30000` to recycle idle connections
- Use MongoDB drivers' built-in connection pooling; do not open new connections per request

### Breaking News Traffic Spikes
During breaking news events, expect 10–100x normal read volume:
1. Featured image URLs served directly from CDN (bypasses DB)
2. `trending` documents cached in Redis
3. Article detail pages cached with short TTL
4. Analytics writes batched to reduce DB pressure
5. Read preference set to `secondaryPreferred` for non-critical reads
