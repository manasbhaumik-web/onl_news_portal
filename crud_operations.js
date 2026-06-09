/**
 * ============================================================
 *  DISPATCH NEWS PORTAL — crud_operations.js
 *  Comprehensive CRUD Query Examples
 *  MongoDB 5.0+  |  Database: dispatch_portal
 * ============================================================
 */

use("dispatch_portal");

// ════════════════════════════════════════════════════════════
//  SECTION 1 — ARTICLE OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 1.1  CREATE: New article with full metadata ─────────────
db.articles.insertOne({
  title:   "AI Regulation Summit Reaches Historic Accord",
  slug:    "ai-regulation-summit-historic-accord-2024",
  subtitle: "Global leaders agree on binding framework for AI development",
  excerpt: "World leaders gathering in Geneva have reached a landmark agreement on artificial intelligence governance, setting binding targets for safety and transparency.",
  content: "<p>World leaders gathering in Geneva...</p>",
  content_format: "html",

  author_id:  ObjectId("64f5e8a7c3b2d1e9f0a4b5c6"),   // authorIds.james
  co_authors: [],
  editor_id:  ObjectId("64f5e8a7c3b2d1e9f0a4b5c7"),

  category_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c8"),   // technology
  tags: [
    ObjectId("64f5e8a7c3b2d1e9f0a4b5d1"),   // ai
    ObjectId("64f5e8a7c3b2d1e9f0a4b5d2")    // breaking
  ],
  format: "breaking",

  featured_image: {
    media_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5e1"),
    url:     "https://dispatch.media/images/ai-summit-2024.jpg",
    alt:     "World leaders at the AI Regulation Summit in Geneva",
    caption: "Delegates sign the Geneva AI Accord",
    credit:  "Reuters / AFP"
  },
  media_attachments: [],
  gallery: [],

  status:      "published",
  published_at: new Date(),
  scheduled_at: null,
  created_at:  new Date(),
  updated_at:  new Date(),
  archived_at: null,

  is_breaking:        true,
  is_featured:        true,
  featured_position:  1,
  is_sponsored:       false,
  is_paywalled:       false,
  breaking_expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000),   // +6h

  view_count:         0,
  unique_view_count:  0,
  share_count:        0,
  comment_count:      0,
  bookmark_count:     0,
  like_count:         0,
  estimated_reading_time: 5,

  related_articles: [],

  meta: {
    title:       "AI Regulation Summit Reaches Historic Accord | Dispatch",
    description: "World leaders agree on binding AI governance framework at Geneva summit.",
    keywords:    ["AI regulation", "Geneva AI Accord", "artificial intelligence policy"],
    canonical:   "https://dispatch.news/technology/ai-regulation-summit-historic-accord-2024",
    og_image:    "https://dispatch.media/images/ai-summit-2024-og.jpg",
    no_index:    false
  },

  newsletter_included: false,
  newsletter_id: null,
  revision: 1,
  version_history: []
});

// ─── 1.2  READ: Homepage — latest published articles ─────────
db.articles.find(
  { status: "published" },
  {
    title: 1, slug: 1, excerpt: 1, author_id: 1,
    category_id: 1, featured_image: 1, published_at: 1,
    view_count: 1, is_breaking: 1, is_featured: 1
  }
)
.sort({ published_at: -1 })
.limit(20);

// ─── 1.3  READ: Featured articles for homepage hero ──────────
db.articles.find(
  { status: "published", is_featured: true },
  { title: 1, slug: 1, excerpt: 1, featured_image: 1, published_at: 1, featured_position: 1 }
)
.sort({ featured_position: 1 })
.limit(5);

// ─── 1.4  READ: Breaking news banner ─────────────────────────
db.articles.find(
  {
    status:      "published",
    is_breaking: true,
    breaking_expires_at: { $gt: new Date() }
  },
  { title: 1, slug: 1, published_at: 1, category_id: 1 }
)
.sort({ published_at: -1 })
.limit(3);

// ─── 1.5  READ: Category listing with pagination ─────────────
const PAGE      = 1;
const PAGE_SIZE = 12;

db.articles.find(
  {
    status:      "published",
    category_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c8")   // technology
  },
  { title: 1, slug: 1, excerpt: 1, featured_image: 1, published_at: 1, author_id: 1, estimated_reading_time: 1 }
)
.sort({ published_at: -1 })
.skip((PAGE - 1) * PAGE_SIZE)
.limit(PAGE_SIZE);

// ─── 1.6  READ: Single article by slug ───────────────────────
db.articles.findOne(
  { slug: "ai-regulation-summit-historic-accord-2024", status: "published" }
);

// ─── 1.7  UPDATE: Increment view count (atomic) ──────────────
db.articles.updateOne(
  { slug: "ai-regulation-summit-historic-accord-2024" },
  {
    $inc: { view_count: 1 },
    $set: { updated_at: new Date() }
  }
);

// ─── 1.8  UPDATE: Increment unique view count ────────────────
// (Called only when session_id is first seen for this article)
db.articles.updateOne(
  { slug: "ai-regulation-summit-historic-accord-2024" },
  { $inc: { unique_view_count: 1 } }
);

// ─── 1.9  UPDATE: Publish a scheduled article ────────────────
db.articles.updateOne(
  { status: "scheduled", scheduled_at: { $lte: new Date() } },
  {
    $set: {
      status:      "published",
      published_at: new Date(),
      updated_at:  new Date()
    }
  }
);

// ─── 1.10  UPDATE: Archive old articles (bulk) ───────────────
const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);   // 1 year ago
db.articles.updateMany(
  {
    status:      "published",
    published_at: { $lt: cutoff },
    is_featured:  false
  },
  {
    $set: {
      status:      "archived",
      archived_at: new Date(),
      updated_at:  new Date()
    }
  }
);

// ─── 1.11  DELETE (soft): Move article to deleted status ─────
db.articles.updateOne(
  { _id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c0") },
  { $set: { status: "deleted", updated_at: new Date() } }
);


// ════════════════════════════════════════════════════════════
//  SECTION 2 — USER OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 2.1  CREATE: Register new user ──────────────────────────
db.users.insertOne({
  username:      "alex_chen",
  email:         "alex.chen@example.com",
  password_hash: "$2b$12$HASHED_BCRYPT_VALUE_HERE",   // bcrypt hash
  status:        "active",
  role:          "user",
  email_verified: false,
  email_verify_token: "verify_abc123xyz",
  password_reset_token: null,
  password_reset_expires: null,

  profile: {
    first_name:   "Alex",
    last_name:    "Chen",
    display_name: "Alex Chen",
    bio:          null,
    avatar:       null,
    country:      "Singapore",
    city:         "Singapore",
    social_links: {}
  },

  subscription_tier: "free",

  preferences: {
    newsletter_subscribed: true,
    breaking_news_alerts:  true,
    email_digest:          "daily",
    preferred_categories:  [],
    preferred_tags:        [],
    dark_mode:             false,
    font_size:             "medium",
    language:              "en"
  },

  reading_history: [],
  two_factor_enabled: false,
  two_factor_secret:  null,
  login_attempts:     0,
  locked_until:       null,
  api_keys:           [],
  last_login:         null,
  registered_at:      new Date(),
  updated_at:         new Date()
});

// ─── 2.2  READ: Login — lookup user by email ─────────────────
db.users.findOne(
  { email: "alex.chen@example.com", status: "active" },
  { password_hash: 1, role: 1, subscription_tier: 1, email_verified: 1 }
);

// ─── 2.3  UPDATE: Record successful login ────────────────────
db.users.updateOne(
  { email: "alex.chen@example.com" },
  {
    $set: { last_login: new Date(), login_attempts: 0, updated_at: new Date() }
  }
);

// ─── 2.4  UPDATE: Upgrade subscription tier ──────────────────
db.users.updateOne(
  { _id: ObjectId("64f5e8a7c3b2d1e9f0a4b5f1") },
  {
    $set: {
      subscription_tier: "premium",
      updated_at: new Date()
    }
  }
);

// ─── 2.5  UPDATE: Add article to reading history (capped array) ──
db.users.updateOne(
  { _id: ObjectId("64f5e8a7c3b2d1e9f0a4b5f1") },
  {
    $push: {
      reading_history: {
        $each: [{
          article_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
          read_at:    new Date(),
          duration_s: 180
        }],
        $slice: -100   // keep only the last 100 entries
      }
    },
    $set: { updated_at: new Date() }
  }
);

// ─── 2.6  UPDATE: Lock account after failed attempts ─────────
db.users.updateOne(
  { email: "alex.chen@example.com" },
  {
    $inc: { login_attempts: 1 },
    $set: {
      locked_until: new Date(Date.now() + 15 * 60 * 1000),   // 15 min
      updated_at:   new Date()
    }
  }
);


// ════════════════════════════════════════════════════════════
//  SECTION 3 — COMMENT OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 3.1  CREATE: Root comment ───────────────────────────────
db.comments.insertOne({
  article_id:        ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
  user_id:           ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
  parent_comment_id: null,
  depth:             0,
  content:           "This is a landmark moment for AI governance. Finally some accountability!",
  status:            "approved",
  is_pinned:         false,
  votes_up:          12,
  votes_down:        1,
  reply_count:       3,
  moderation_flags:  [],
  edited:            false,
  edited_at:         null,
  created_at:        new Date(),
  updated_at:        new Date(),
  deleted_at:        null
});

// ─── 3.2  CREATE: Reply to a comment ─────────────────────────
db.comments.insertOne({
  article_id:        ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
  user_id:           ObjectId("64f5e8a7c3b2d1e9f0a4b5f2"),
  parent_comment_id: ObjectId("64f5e8a7c3b2d1e9f0a4b6a1"),   // parent comment
  depth:             1,
  content:           "Agreed. But how will they enforce cross-border compliance?",
  status:            "approved",
  is_pinned:         false,
  votes_up:          5,
  votes_down:        0,
  reply_count:       0,
  moderation_flags:  [],
  edited:            false,
  edited_at:         null,
  created_at:        new Date(),
  updated_at:        new Date(),
  deleted_at:        null
});

// ─── 3.3  READ: Article comments (root level, newest first) ──
db.comments.find(
  {
    article_id:        ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
    parent_comment_id: null,
    status:            "approved"
  }
)
.sort({ is_pinned: -1, created_at: -1 })
.limit(25);

// ─── 3.4  READ: Replies to a specific comment ────────────────
db.comments.find(
  {
    parent_comment_id: ObjectId("64f5e8a7c3b2d1e9f0a4b6a1"),
    status:            "approved"
  }
)
.sort({ created_at: 1 });

// ─── 3.5  UPDATE: Vote on a comment ──────────────────────────
db.comments.updateOne(
  { _id: ObjectId("64f5e8a7c3b2d1e9f0a4b6a1") },
  {
    $inc: { votes_up: 1 },
    $set: { updated_at: new Date() }
  }
);

// ─── 3.6  UPDATE: Increment parent reply counter ─────────────
db.comments.updateOne(
  { _id: ObjectId("64f5e8a7c3b2d1e9f0a4b6a1") },   // parent
  { $inc: { reply_count: 1 }, $set: { updated_at: new Date() } }
);

// ─── 3.7  UPDATE: Soft-delete comment ────────────────────────
db.comments.updateOne(
  { _id: ObjectId("64f5e8a7c3b2d1e9f0a4b6b1") },
  {
    $set: {
      status:     "deleted",
      content:    "[Comment removed]",
      deleted_at: new Date(),
      updated_at: new Date()
    }
  }
);


// ════════════════════════════════════════════════════════════
//  SECTION 4 — BOOKMARK OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 4.1  CREATE: Save article ───────────────────────────────
db.bookmarks.insertOne({
  user_id:    ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
  article_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
  collection: "Tech Reads",
  note:       "Important for thesis research",
  tags:       ["ai", "policy"],
  created_at: new Date()
});

// ─── 4.2  READ: User bookmarks list ──────────────────────────
db.bookmarks.find(
  { user_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5f1") }
)
.sort({ created_at: -1 })
.limit(20);

// ─── 4.3  READ: Bookmarks in a collection ────────────────────
db.bookmarks.find(
  {
    user_id:    ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
    collection: "Tech Reads"
  }
)
.sort({ created_at: -1 });

// ─── 4.4  DELETE: Remove bookmark ────────────────────────────
db.bookmarks.deleteOne({
  user_id:    ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
  article_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c0")
});

// ─── 4.5  READ: Check if article is bookmarked by user ───────
db.bookmarks.findOne(
  {
    user_id:    ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
    article_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c0")
  },
  { _id: 1 }
);


// ════════════════════════════════════════════════════════════
//  SECTION 5 — SUBSCRIPTION OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 5.1  CREATE: New subscription ───────────────────────────
db.subscriptions.insertOne({
  user_id:        ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
  plan:           "premium",
  billing_cycle:  "annual",
  status:         "active",
  amount_cents:   9900,
  currency:       "USD",
  payment_provider: "stripe",
  external_subscription_id: "sub_1OAbcXYZ",
  external_customer_id:     "cus_1OAbcXYZ",
  started_at:     new Date(),
  expires_at:     new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  trial_ends_at:  null,
  cancelled_at:   null,
  auto_renew:     true,
  payment_history: [
    {
      amount_cents: 9900,
      currency:     "USD",
      paid_at:      new Date(),
      invoice_id:   "inv_1OAbcXYZ",
      status:       "success"
    }
  ],
  created_at: new Date(),
  updated_at: new Date()
});

// ─── 5.2  READ: Active subscription for a user ───────────────
db.subscriptions.findOne(
  {
    user_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
    status:  "active"
  }
);

// ─── 5.3  UPDATE: Cancel subscription ────────────────────────
db.subscriptions.updateOne(
  { user_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"), status: "active" },
  {
    $set: {
      status:       "cancelled",
      auto_renew:   false,
      cancelled_at: new Date(),
      updated_at:   new Date()
    }
  }
);

// ─── 5.4  READ: Find expiring subscriptions (job) ────────────
const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
db.subscriptions.find(
  {
    status:     "active",
    auto_renew: false,
    expires_at: { $lte: threeDaysFromNow, $gt: new Date() }
  }
);


// ════════════════════════════════════════════════════════════
//  SECTION 6 — ANALYTICS OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 6.1  CREATE: Batch write analytics events ───────────────
db.analytics.insertMany([
  {
    event_type:  "view",
    article_id:  ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
    category_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c8"),
    user_id:     ObjectId("64f5e8a7c3b2d1e9f0a4b5f1"),
    session_id:  "sess_abc123",
    anonymous_id: null,
    timestamp:   new Date(),
    source:      "search",
    referrer:    "https://www.google.com",
    platform:    "web",
    device_type: "desktop",
    user_agent:  "Mozilla/5.0 ...",
    country:     "US",
    region:      "California",
    reading_duration_s: 240,
    scroll_depth_pct:   85,
    share_platform:     null
  },
  {
    event_type:  "share",
    article_id:  ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
    category_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c8"),
    user_id:     ObjectId("64f5e8a7c3b2d1e9f0a4b5f2"),
    session_id:  "sess_def456",
    anonymous_id: null,
    timestamp:   new Date(),
    source:      "direct",
    referrer:    "",
    platform:    "ios",
    device_type: "mobile",
    user_agent:  "Dispatch-iOS/1.0",
    country:     "GB",
    region:      "England",
    reading_duration_s: null,
    scroll_depth_pct:   null,
    share_platform:     "twitter"
  }
]);

// ─── 6.2  READ: Top articles today (by view count) ───────────
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

db.analytics.aggregate([
  { $match: { event_type: "view", timestamp: { $gte: todayStart } } },
  { $group: { _id: "$article_id", views: { $sum: 1 } } },
  { $sort: { views: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "articles", localField: "_id", foreignField: "_id",
      as: "article",
      pipeline: [{ $project: { title: 1, slug: 1, featured_image: 1 } }]
    }
  },
  { $unwind: "$article" }
]);


// ════════════════════════════════════════════════════════════
//  SECTION 7 — SEARCH
// ════════════════════════════════════════════════════════════

// ─── 7.1  FULL-TEXT: Search articles by keyword ──────────────
db.articles.find(
  {
    $text:   { $search: "AI regulation summit" },
    status:  "published"
  },
  { score: { $meta: "textScore" }, title: 1, slug: 1, excerpt: 1, published_at: 1 }
)
.sort({ score: { $meta: "textScore" } })
.limit(20);

// ─── 7.2  REGEX: Autocomplete suggestion (prefix match on title) ─
db.articles.find(
  {
    title:  { $regex: "^AI reg", $options: "i" },
    status: "published"
  },
  { title: 1, slug: 1 }
)
.limit(5);


// ════════════════════════════════════════════════════════════
//  SECTION 8 — TRENDING OPERATIONS
// ════════════════════════════════════════════════════════════

// ─── 8.1  READ: Global trending (24h period) ─────────────────
db.trending.find(
  { period: "24h" },
  { article_id: 1, rank_position: 1, score: 1, metrics: 1 }
)
.sort({ rank_position: 1 })
.limit(10);

// ─── 8.2  READ: Category trending ────────────────────────────
db.trending.find(
  {
    period:      "24h",
    category_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c8")
  }
)
.sort({ rank_position: 1 })
.limit(5);

// ─── 8.3  UPSERT: Update trending score for an article ───────
db.trending.updateOne(
  {
    article_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c0"),
    period:     "24h"
  },
  {
    $set: {
      score:        1523.7,
      rank_position: 1,
      metrics: { views: 12000, shares: 450, comments: 89, bookmarks: 210, likes: 774 },
      last_updated: new Date(),
      expires_at:   new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    $setOnInsert: {
      category_id: ObjectId("64f5e8a7c3b2d1e9f0a4b5c8")
    }
  },
  { upsert: true }
);

print("✅  CRUD examples complete.");
