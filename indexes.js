/**
 * ============================================================
 *  DISPATCH NEWS PORTAL — indexes.js
 *  Index Creation Commands with Explanations
 *  Run against: dispatch_portal
 * ============================================================
 *
 *  LEGEND
 *  ------
 *  1  = ascending   -1 = descending
 *  "text" = full-text index
 *  Compound indexes listed most-selective field first
 * ============================================================
 */

use("dispatch_portal");

// ════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════

// Unique slug — primary lookup key for URL routing
db.categories.createIndex(
  { slug: 1 },
  { unique: true, name: "uq_categories_slug" }
);

// Navigation queries (active categories sorted by display order)
db.categories.createIndex(
  { status: 1, sort_order: 1 },
  { name: "idx_categories_status_sort" }
);

// Subcategory tree traversal
db.categories.createIndex(
  { parent_id: 1 },
  { name: "idx_categories_parent",
    partialFilterExpression: { parent_id: { $exists: true, $ne: null } }
  }
);


// ════════════════════════════════════════════
// TAGS
// ════════════════════════════════════════════

db.tags.createIndex(
  { slug: 1 },
  { unique: true, name: "uq_tags_slug" }
);

// Autocomplete / search
db.tags.createIndex(
  { name: "text" },
  { name: "text_tags_name" }
);

// Popular tags widget (sorted by article count)
db.tags.createIndex(
  { article_count: -1 },
  { name: "idx_tags_article_count_desc" }
);


// ════════════════════════════════════════════
// AUTHORS
// ════════════════════════════════════════════

db.authors.createIndex(
  { slug: 1 },
  { unique: true, name: "uq_authors_slug" }
);

db.authors.createIndex(
  { email: 1 },
  { unique: true, name: "uq_authors_email" }
);

// Author byline page (active authors)
db.authors.createIndex(
  { status: 1, role: 1 },
  { name: "idx_authors_status_role" }
);

// Join to users collection
db.authors.createIndex(
  { user_id: 1 },
  { name: "idx_authors_user_id",
    partialFilterExpression: { user_id: { $ne: null } }
  }
);


// ════════════════════════════════════════════
// ARTICLES  (most critical collection)
// ════════════════════════════════════════════

// Primary URL routing — must be unique
db.articles.createIndex(
  { slug: 1 },
  { unique: true, name: "uq_articles_slug" }
);

// Homepage: published articles sorted newest-first
db.articles.createIndex(
  { status: 1, published_at: -1 },
  { name: "idx_articles_status_published_at",
    partialFilterExpression: { status: "published" }
  }
);

// Category listing page: published articles by category, newest-first
db.articles.createIndex(
  { category_id: 1, status: 1, published_at: -1 },
  { name: "idx_articles_category_status_published" }
);

// Featured/homepage slots
db.articles.createIndex(
  { is_featured: 1, featured_position: 1, status: 1 },
  { name: "idx_articles_featured_position",
    partialFilterExpression: { is_featured: true, status: "published" }
  }
);

// Breaking news banner
db.articles.createIndex(
  { is_breaking: 1, breaking_expires_at: 1 },
  { name: "idx_articles_breaking",
    partialFilterExpression: { is_breaking: true }
  }
);

// Author profile page: articles by author, newest-first
db.articles.createIndex(
  { author_id: 1, status: 1, published_at: -1 },
  { name: "idx_articles_author_status_published" }
);

// Tag archive page
db.articles.createIndex(
  { tags: 1, status: 1, published_at: -1 },
  { name: "idx_articles_tags_status_published" }
);

// Trending / most-viewed sort (used by background job)
db.articles.createIndex(
  { view_count: -1, status: 1 },
  { name: "idx_articles_view_count_desc",
    partialFilterExpression: { status: "published" }
  }
);

// Scheduled publishing job (finds articles due to go live)
db.articles.createIndex(
  { status: 1, scheduled_at: 1 },
  { name: "idx_articles_scheduled",
    partialFilterExpression: { status: "scheduled" }
  }
);

// Paywalled content gate
db.articles.createIndex(
  { is_paywalled: 1, status: 1 },
  { name: "idx_articles_paywalled",
    partialFilterExpression: { is_paywalled: true }
  }
);

// Newsletter inclusion query
db.articles.createIndex(
  { newsletter_id: 1 },
  { name: "idx_articles_newsletter_id",
    partialFilterExpression: { newsletter_included: true }
  }
);

// FULL-TEXT SEARCH — title, excerpt, content
db.articles.createIndex(
  { title: "text", excerpt: "text", content: "text" },
  {
    name: "text_articles_search",
    weights: { title: 10, excerpt: 5, content: 1 },
    default_language: "english"
  }
);


// ════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════

db.users.createIndex(
  { email: 1 },
  { unique: true, name: "uq_users_email",
    collation: { locale: "en", strength: 2 }   // case-insensitive uniqueness
  }
);

db.users.createIndex(
  { username: 1 },
  { unique: true, name: "uq_users_username" }
);

db.users.createIndex(
  { status: 1, role: 1 },
  { name: "idx_users_status_role" }
);

// Auth queries: account lockout check
db.users.createIndex(
  { locked_until: 1 },
  { name: "idx_users_locked_until",
    partialFilterExpression: { locked_until: { $exists: true, $ne: null } }
  }
);

// Password reset token lookup
db.users.createIndex(
  { password_reset_token: 1 },
  { name: "idx_users_password_reset_token",
    sparse: true
  }
);

// Email verify token lookup
db.users.createIndex(
  { email_verify_token: 1 },
  { name: "idx_users_email_verify_token",
    sparse: true
  }
);

// Admin list sorted by registration date
db.users.createIndex(
  { registered_at: -1 },
  { name: "idx_users_registered_at_desc" }
);

// Newsletter opt-in segmentation
db.users.createIndex(
  { "preferences.newsletter_subscribed": 1, subscription_tier: 1 },
  { name: "idx_users_newsletter_tier",
    partialFilterExpression: { "preferences.newsletter_subscribed": true }
  }
);


// ════════════════════════════════════════════
// SUBSCRIPTIONS
// ════════════════════════════════════════════

db.subscriptions.createIndex(
  { user_id: 1, status: 1 },
  { name: "idx_subscriptions_user_status" }
);

// Expiry check job (finds active subscriptions expiring soon)
db.subscriptions.createIndex(
  { expires_at: 1, status: 1 },
  { name: "idx_subscriptions_expires_at" }
);

// Payment provider reconciliation
db.subscriptions.createIndex(
  { external_subscription_id: 1 },
  { name: "idx_subscriptions_external_id", sparse: true }
);


// ════════════════════════════════════════════
// COMMENTS
// ════════════════════════════════════════════

// Article comment thread (root comments by article, newest-first)
db.comments.createIndex(
  { article_id: 1, parent_comment_id: 1, status: 1, created_at: -1 },
  { name: "idx_comments_article_parent_status_date" }
);

// Replies to a specific comment
db.comments.createIndex(
  { parent_comment_id: 1, status: 1, created_at: 1 },
  { name: "idx_comments_parent_replies",
    partialFilterExpression: { parent_comment_id: { $ne: null } }
  }
);

// User comment history
db.comments.createIndex(
  { user_id: 1, status: 1, created_at: -1 },
  { name: "idx_comments_user_status_date" }
);

// Moderation queue (pending comments)
db.comments.createIndex(
  { status: 1, created_at: 1 },
  { name: "idx_comments_moderation_queue",
    partialFilterExpression: { status: { $in: ["pending", "flagged"] } }
  }
);


// ════════════════════════════════════════════
// BOOKMARKS
// ════════════════════════════════════════════

// Unique per user+article pair (no duplicate saves)
db.bookmarks.createIndex(
  { user_id: 1, article_id: 1 },
  { unique: true, name: "uq_bookmarks_user_article" }
);

// User bookmarks list (newest first)
db.bookmarks.createIndex(
  { user_id: 1, created_at: -1 },
  { name: "idx_bookmarks_user_date" }
);

// Collection browsing
db.bookmarks.createIndex(
  { user_id: 1, collection: 1, created_at: -1 },
  { name: "idx_bookmarks_user_collection_date" }
);


// ════════════════════════════════════════════
// TRENDING
// ════════════════════════════════════════════

// Global trending list by period and rank
db.trending.createIndex(
  { period: 1, rank_position: 1 },
  { name: "idx_trending_period_rank" }
);

// Category trending
db.trending.createIndex(
  { period: 1, category_id: 1, rank_position: 1 },
  { name: "idx_trending_period_category_rank" }
);

// Unique: one rank per article per period
db.trending.createIndex(
  { article_id: 1, period: 1 },
  { unique: true, name: "uq_trending_article_period" }
);

// TTL index — auto-expire trending documents after their validity window
db.trending.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0, name: "ttl_trending_expires_at" }
);


// ════════════════════════════════════════════
// NEWSLETTERS
// ════════════════════════════════════════════

db.newsletters.createIndex(
  { status: 1, scheduled_at: 1 },
  { name: "idx_newsletters_status_scheduled",
    partialFilterExpression: { status: "scheduled" }
  }
);

db.newsletters.createIndex(
  { type: 1, sent_at: -1 },
  { name: "idx_newsletters_type_sent" }
);


// ════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════

// Primary analytics query: article performance over time
db.analytics.createIndex(
  { article_id: 1, event_type: 1, timestamp: -1 },
  { name: "idx_analytics_article_event_time" }
);

// User activity timeline
db.analytics.createIndex(
  { user_id: 1, event_type: 1, timestamp: -1 },
  { name: "idx_analytics_user_event_time",
    partialFilterExpression: { user_id: { $exists: true, $ne: null } }
  }
);

// Time-bucket queries (hourly/daily aggregations)
db.analytics.createIndex(
  { timestamp: -1, event_type: 1 },
  { name: "idx_analytics_timestamp_event" }
);

// Category analytics dashboard
db.analytics.createIndex(
  { category_id: 1, timestamp: -1 },
  { name: "idx_analytics_category_time" }
);

// Source / channel attribution
db.analytics.createIndex(
  { source: 1, timestamp: -1 },
  { name: "idx_analytics_source_time" }
);

// Country breakdown (geo analytics)
db.analytics.createIndex(
  { country: 1, timestamp: -1 },
  { name: "idx_analytics_country_time" }
);

// TTL index — auto-purge raw event rows older than 90 days
db.analytics.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000, name: "ttl_analytics_90d" }
);


// ════════════════════════════════════════════
// MEDIA
// ════════════════════════════════════════════

db.media.createIndex(
  { type: 1, created_at: -1 },
  { name: "idx_media_type_date" }
);

db.media.createIndex(
  { uploaded_by: 1 },
  { name: "idx_media_uploader" }
);

db.media.createIndex(
  { article_ids: 1 },
  { name: "idx_media_articles" }
);

db.media.createIndex(
  { processing_status: 1 },
  { name: "idx_media_processing_status",
    partialFilterExpression: { processing_status: { $in: ["pending", "processing"] } }
  }
);

print("✅  All indexes created.");
