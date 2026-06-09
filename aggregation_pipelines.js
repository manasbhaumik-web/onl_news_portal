/**
 * ============================================================
 *  DISPATCH NEWS PORTAL — aggregation_pipelines.js
 *  Advanced MongoDB Aggregation Pipeline Examples
 *  MongoDB 5.0+  |  Database: dispatch_portal
 * ============================================================
 */

use("dispatch_portal");

// ════════════════════════════════════════════════════════════
//  PIPELINE 1 — Trending articles with full author & category
// ════════════════════════════════════════════════════════════
const trendingWithDetails = db.trending.aggregate([
  // Stage 1: Only 24-hour trending, top 10
  { $match: { period: "24h" } },
  { $sort:  { rank_position: 1 } },
  { $limit: 10 },

  // Stage 2: Join article document
  {
    $lookup: {
      from: "articles",
      localField: "article_id",
      foreignField: "_id",
      as: "article",
      pipeline: [
        {
          $project: {
            title: 1, slug: 1, excerpt: 1, published_at: 1,
            featured_image: 1, estimated_reading_time: 1,
            author_id: 1, category_id: 1, format: 1
          }
        }
      ]
    }
  },
  { $unwind: "$article" },

  // Stage 3: Join author
  {
    $lookup: {
      from: "authors",
      localField: "article.author_id",
      foreignField: "_id",
      as: "author",
      pipeline: [
        { $project: { name: 1, slug: 1, avatar: 1, title: 1 } }
      ]
    }
  },
  { $unwind: "$author" },

  // Stage 4: Join category
  {
    $lookup: {
      from: "categories",
      localField: "article.category_id",
      foreignField: "_id",
      as: "category",
      pipeline: [
        { $project: { name: 1, slug: 1, color: 1 } }
      ]
    }
  },
  { $unwind: "$category" },

  // Stage 5: Reshape output
  {
    $project: {
      rank_position: 1,
      score:         1,
      "metrics.views":    1,
      "metrics.shares":   1,
      "metrics.comments": 1,
      title:        "$article.title",
      slug:         "$article.slug",
      excerpt:      "$article.excerpt",
      published_at: "$article.published_at",
      reading_time: "$article.estimated_reading_time",
      featured_image: "$article.featured_image",
      format:       "$article.format",
      author: {
        name:   "$author.name",
        slug:   "$author.slug",
        avatar: "$author.avatar"
      },
      category: {
        name:  "$category.name",
        slug:  "$category.slug",
        color: "$category.color"
      }
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 2 — User reading statistics
// ════════════════════════════════════════════════════════════
const userReadingStats = (userId) => db.analytics.aggregate([
  {
    $match: {
      user_id:    ObjectId(userId),
      event_type: "view"
    }
  },

  // Group by article to get unique reads
  {
    $group: {
      _id:              "$article_id",
      sessions:         { $sum: 1 },
      total_duration_s: { $sum: "$reading_duration_s" },
      last_read:        { $max: "$timestamp" }
    }
  },

  // Summary stats
  {
    $group: {
      _id:                  null,
      total_articles_read:  { $sum: 1 },
      total_reading_time_s: { $sum: "$total_duration_s" },
      avg_reading_time_s:   { $avg: "$total_duration_s" },
      last_activity:        { $max: "$last_read" }
    }
  },

  {
    $project: {
      _id: 0,
      total_articles_read:  1,
      total_reading_hours:  { $divide: ["$total_reading_time_s", 3600] },
      avg_reading_minutes:  { $divide: ["$avg_reading_time_s", 60] },
      last_activity:        1
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 3 — Category performance metrics
// ════════════════════════════════════════════════════════════
const categoryPerformance = db.analytics.aggregate([
  // Last 30 days only
  {
    $match: {
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },

  // Group by category and event type
  {
    $group: {
      _id: {
        category_id: "$category_id",
        event_type:  "$event_type"
      },
      count: { $sum: 1 }
    }
  },

  // Pivot event types into a single document per category
  {
    $group: {
      _id: "$_id.category_id",
      metrics: {
        $push: { type: "$_id.event_type", count: "$count" }
      }
    }
  },

  // Flatten metrics array into named fields
  {
    $project: {
      views: {
        $reduce: {
          input: "$metrics",
          initialValue: 0,
          in: { $cond: [{ $eq: ["$$this.type", "view"] }, { $add: ["$$value", "$$this.count"] }, "$$value"] }
        }
      },
      shares: {
        $reduce: {
          input: "$metrics",
          initialValue: 0,
          in: { $cond: [{ $eq: ["$$this.type", "share"] }, { $add: ["$$value", "$$this.count"] }, "$$value"] }
        }
      },
      comments: {
        $reduce: {
          input: "$metrics",
          initialValue: 0,
          in: { $cond: [{ $eq: ["$$this.type", "comment"] }, { $add: ["$$value", "$$this.count"] }, "$$value"] }
        }
      }
    }
  },

  // Compute engagement score: views + shares*5 + comments*3
  {
    $addFields: {
      engagement_score: {
        $add: ["$views", { $multiply: ["$shares", 5] }, { $multiply: ["$comments", 3] }]
      }
    }
  },

  { $sort: { engagement_score: -1 } },

  // Join category names
  {
    $lookup: {
      from: "categories",
      localField: "_id",
      foreignField: "_id",
      as: "category"
    }
  },
  { $unwind: { path: "$category", preserveNullAndEmpty: true } },

  {
    $project: {
      category_name:    "$category.name",
      category_slug:    "$category.slug",
      category_color:   "$category.color",
      views:            1,
      shares:           1,
      comments:         1,
      engagement_score: 1
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 4 — Monthly analytics summary (time-series)
// ════════════════════════════════════════════════════════════
const monthlySummary = db.analytics.aggregate([
  {
    $match: {
      event_type: { $in: ["view", "share", "comment", "bookmark"] },
      timestamp:  { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
    }
  },

  // Bucket by month
  {
    $group: {
      _id: {
        year:  { $year:  "$timestamp" },
        month: { $month: "$timestamp" },
        type:  "$event_type"
      },
      count: { $sum: 1 }
    }
  },

  // Pivot into one doc per month
  {
    $group: {
      _id: { year: "$_id.year", month: "$_id.month" },
      events: {
        $push: { type: "$_id.type", count: "$count" }
      }
    }
  },

  // Compute total events per month
  { $addFields: { total_events: { $sum: "$events.count" } } },
  { $sort: { "_id.year": 1, "_id.month": 1 } },

  {
    $project: {
      _id:    0,
      year:   "$_id.year",
      month:  "$_id.month",
      events: 1,
      total_events: 1
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 5 — Author productivity report
// ════════════════════════════════════════════════════════════
const authorProductivity = db.articles.aggregate([
  { $match: { status: "published" } },

  {
    $group: {
      _id:            "$author_id",
      total_articles: { $sum: 1 },
      total_views:    { $sum: "$view_count" },
      total_shares:   { $sum: "$share_count" },
      total_comments: { $sum: "$comment_count" },
      avg_reading_time: { $avg: "$estimated_reading_time" },
      latest_article:   { $max: "$published_at" },
      article_ids:      { $push: "$_id" }
    }
  },

  {
    $addFields: {
      avg_views_per_article: { $divide: ["$total_views", "$total_articles"] },
      engagement_score: {
        $add: [
          "$total_views",
          { $multiply: ["$total_shares",   10] },
          { $multiply: ["$total_comments",  5] }
        ]
      }
    }
  },

  // Join author info
  {
    $lookup: {
      from: "authors",
      localField: "_id",
      foreignField: "_id",
      as: "author",
      pipeline: [
        { $project: { name: 1, slug: 1, avatar: 1, title: 1, role: 1 } }
      ]
    }
  },
  { $unwind: "$author" },

  { $sort: { engagement_score: -1 } },

  {
    $project: {
      author_name:           "$author.name",
      author_slug:           "$author.slug",
      author_role:           "$author.role",
      total_articles:        1,
      total_views:           1,
      total_shares:          1,
      total_comments:        1,
      avg_views_per_article: { $round: ["$avg_views_per_article", 0] },
      engagement_score:      { $round: ["$engagement_score",      0] },
      avg_reading_time:      { $round: ["$avg_reading_time",      1] },
      latest_article:        1
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 6 — Most engaged articles with comment counts
// ════════════════════════════════════════════════════════════
const mostEngagedArticles = db.articles.aggregate([
  { $match: { status: "published" } },

  // Compute engagement score inline
  {
    $addFields: {
      engagement_score: {
        $add: [
          "$view_count",
          { $multiply: ["$share_count",    10] },
          { $multiply: ["$comment_count",  15] },
          { $multiply: ["$bookmark_count",  5] },
          { $multiply: ["$like_count",      3] }
        ]
      }
    }
  },

  { $sort: { engagement_score: -1 } },
  { $limit: 20 },

  // Lookup live comment count (more accurate than cached field)
  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "article_id",
      as: "comments_docs",
      pipeline: [
        { $match: { status: "approved" } },
        { $count: "total" }
      ]
    }
  },

  {
    $addFields: {
      live_comment_count: {
        $ifNull: [{ $arrayElemAt: ["$comments_docs.total", 0] }, 0]
      }
    }
  },

  // Lookup author
  {
    $lookup: {
      from: "authors",
      localField: "author_id",
      foreignField: "_id",
      as: "author",
      pipeline: [
        { $project: { name: 1, slug: 1 } }
      ]
    }
  },
  { $unwind: "$author" },

  {
    $project: {
      title:              1,
      slug:               1,
      published_at:       1,
      view_count:         1,
      share_count:        1,
      bookmark_count:     1,
      like_count:         1,
      live_comment_count: 1,
      engagement_score:   { $round: ["$engagement_score", 0] },
      author_name:        "$author.name"
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 7 — Homepage feed with author & category join
//              (single-query approach for API efficiency)
// ════════════════════════════════════════════════════════════
const homepageFeed = db.articles.aggregate([
  // Stage 1: Recently published, limit to 30 candidates
  { $match: { status: "published" } },
  { $sort:  { published_at: -1 } },
  { $limit: 30 },

  // Stage 2: Author info
  {
    $lookup: {
      from: "authors",
      localField: "author_id",
      foreignField: "_id",
      as: "author",
      pipeline: [
        { $project: { name: 1, slug: 1, avatar: 1 } }
      ]
    }
  },
  { $unwind: "$author" },

  // Stage 3: Category info
  {
    $lookup: {
      from: "categories",
      localField: "category_id",
      foreignField: "_id",
      as: "category",
      pipeline: [
        { $project: { name: 1, slug: 1, color: 1 } }
      ]
    }
  },
  { $unwind: "$category" },

  // Stage 4: Shape response (exclude heavy fields)
  {
    $project: {
      title:        1, slug: 1, excerpt: 1,
      published_at: 1, is_breaking: 1, is_featured: 1,
      featured_position: 1,
      estimated_reading_time: 1,
      view_count:   1, format: 1,
      featured_image: { url: 1, alt: 1, caption: 1 },
      author:   { name: 1, slug: 1, avatar: 1 },
      category: { name: 1, slug: 1, color: 1 }
    }
  }
]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 8 — Newsletter recipient segmentation
// ════════════════════════════════════════════════════════════
const newsletterSegment = (tiers) => db.users.aggregate([
  {
    $match: {
      status:                      "active",
      email_verified:              true,
      "preferences.newsletter_subscribed": true,
      subscription_tier:           { $in: tiers }
    }
  },
  {
    $project: {
      email:             1,
      "profile.display_name": 1,
      subscription_tier: 1,
      "preferences.language": 1
    }
  }
]);

// Example: get premium + professional subscribers
const premiumSegment = newsletterSegment(["premium", "professional"]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 9 — Related articles recommendation
//              (same category, similar tags, excluding current)
// ════════════════════════════════════════════════════════════
const relatedArticles = (articleId, categoryId, articleTags) =>
  db.articles.aggregate([
    {
      $match: {
        _id:         { $ne:  ObjectId(articleId) },
        status:      "published",
        $or: [
          { category_id: ObjectId(categoryId) },
          { tags: { $in: articleTags.map(t => ObjectId(t)) } }
        ]
      }
    },

    // Score by how many tags match
    {
      $addFields: {
        matching_tags: {
          $size: {
            $ifNull: [
              {
                $setIntersection: [
                  "$tags",
                  articleTags.map(t => ObjectId(t))
                ]
              },
              []
            ]
          }
        },
        same_category: {
          $cond: [{ $eq: ["$category_id", ObjectId(categoryId)] }, 1, 0]
        }
      }
    },

    { $sort:  { same_category: -1, matching_tags: -1, published_at: -1 } },
    { $limit: 6 },

    {
      $project: {
        title: 1, slug: 1, excerpt: 1,
        featured_image: { url: 1, alt: 1 },
        published_at: 1, estimated_reading_time: 1
      }
    }
  ]);

// ════════════════════════════════════════════════════════════
//  PIPELINE 10 — Geographic traffic breakdown (analytics)
// ════════════════════════════════════════════════════════════
const geoTraffic = db.analytics.aggregate([
  {
    $match: {
      event_type: "view",
      timestamp:  { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id:   "$country",
      views: { $sum: 1 },
      unique_sessions: { $addToSet: "$session_id" }
    }
  },
  {
    $project: {
      country: "$_id",
      views:   1,
      unique_sessions: { $size: "$unique_sessions" }
    }
  },
  { $sort: { views: -1 } },
  { $limit: 50 }
]);

print("✅  Aggregation pipelines defined.");
