/**
 * ============================================================
 *  DISPATCH NEWS PORTAL — complete_schema.js
 *  MongoDB Collection Schema Definitions with Validation Rules
 *  MongoDB 5.0+  |  Database: dispatch_portal
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// 1. CATEGORIES
// ─────────────────────────────────────────────────────────────
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "color", "status"],
      additionalProperties: false,
      properties: {
        _id:          { bsonType: "objectId" },
        name:         { bsonType: "string", minLength: 2, maxLength: 100, description: "Display name of the category" },
        slug:         { bsonType: "string", pattern: "^[a-z0-9-]+$", description: "URL-safe identifier" },
        description:  { bsonType: "string", maxLength: 500 },
        parent_id:    { bsonType: ["objectId", "null"], description: "Parent category for subcategories" },
        color:        { bsonType: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Hex color code for UI branding" },
        icon:         { bsonType: "string", maxLength: 100, description: "Icon identifier or SVG class name" },
        cover_image:  { bsonType: "string", description: "URL to category cover image" },
        sort_order:   { bsonType: "int", minimum: 0 },
        status:       { bsonType: "string", enum: ["active", "inactive", "hidden"] },
        meta: {
          bsonType: "object",
          properties: {
            title:       { bsonType: "string", maxLength: 200 },
            description: { bsonType: "string", maxLength: 500 },
            keywords:    { bsonType: "array", items: { bsonType: "string" } }
          }
        },
        article_count: { bsonType: "int", minimum: 0 },
        created_at:    { bsonType: "date" },
        updated_at:    { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 2. TAGS
// ─────────────────────────────────────────────────────────────
db.createCollection("tags", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug"],
      additionalProperties: false,
      properties: {
        _id:           { bsonType: "objectId" },
        name:          { bsonType: "string", minLength: 1, maxLength: 100 },
        slug:          { bsonType: "string", pattern: "^[a-z0-9-]+$" },
        description:   { bsonType: "string", maxLength: 300 },
        article_count: { bsonType: "int", minimum: 0 },
        created_at:    { bsonType: "date" },
        updated_at:    { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 3. AUTHORS
// ─────────────────────────────────────────────────────────────
db.createCollection("authors", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "slug", "status"],
      additionalProperties: false,
      properties: {
        _id:    { bsonType: "objectId" },
        user_id: { bsonType: ["objectId", "null"], description: "Reference to users collection if author has account" },
        name:   { bsonType: "string", minLength: 2, maxLength: 150 },
        slug:   { bsonType: "string", pattern: "^[a-z0-9-]+$" },
        email:  { bsonType: "string", pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$" },
        bio:    { bsonType: "string", maxLength: 2000 },
        avatar: { bsonType: "string", description: "URL to author avatar" },
        title:  { bsonType: "string", maxLength: 150, description: "e.g. Senior Reporter, Political Editor" },
        social_links: {
          bsonType: "object",
          properties: {
            twitter:   { bsonType: "string" },
            linkedin:  { bsonType: "string" },
            instagram: { bsonType: "string" },
            website:   { bsonType: "string" }
          }
        },
        expertise:    { bsonType: "array", items: { bsonType: "string" }, description: "Areas of expertise / beats" },
        article_count: { bsonType: "int", minimum: 0 },
        status:       { bsonType: "string", enum: ["active", "inactive", "suspended"] },
        role:         { bsonType: "string", enum: ["author", "editor", "contributor", "freelancer"] },
        joined_date:  { bsonType: "date" },
        created_at:   { bsonType: "date" },
        updated_at:   { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 4. MEDIA
// ─────────────────────────────────────────────────────────────
db.createCollection("media", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["filename", "url", "type", "size_bytes", "uploaded_by"],
      additionalProperties: false,
      properties: {
        _id:          { bsonType: "objectId" },
        filename:     { bsonType: "string", maxLength: 500 },
        original_name: { bsonType: "string", maxLength: 500 },
        url:          { bsonType: "string", description: "CDN or storage URL" },
        thumbnail_url: { bsonType: "string" },
        type:         { bsonType: "string", enum: ["image", "video", "audio", "document", "gif"] },
        mime_type:    { bsonType: "string", maxLength: 100 },
        size_bytes:   { bsonType: "long", minimum: 0 },
        dimensions: {
          bsonType: "object",
          properties: {
            width:  { bsonType: "int" },
            height: { bsonType: "int" }
          }
        },
        duration_seconds: { bsonType: ["double", "null"], description: "For audio/video" },
        alt_text:     { bsonType: "string", maxLength: 500 },
        caption:      { bsonType: "string", maxLength: 1000 },
        credit:       { bsonType: "string", maxLength: 300, description: "Photo/video credit" },
        tags:         { bsonType: "array", items: { bsonType: "string" } },
        uploaded_by:  { bsonType: "objectId", description: "Reference to users._id" },
        article_ids:  { bsonType: "array", items: { bsonType: "objectId" } },
        processing_status: { bsonType: "string", enum: ["pending", "processing", "complete", "failed"] },
        variants: {
          bsonType: "array",
          description: "Optimised renditions (thumbnail, medium, large)",
          items: {
            bsonType: "object",
            required: ["name", "url", "width", "height", "size_bytes"],
            properties: {
              name:       { bsonType: "string" },
              url:        { bsonType: "string" },
              width:      { bsonType: "int" },
              height:     { bsonType: "int" },
              size_bytes: { bsonType: "long" }
            }
          }
        },
        storage_provider: { bsonType: "string", enum: ["s3", "gcs", "cloudinary", "local"] },
        storage_path:     { bsonType: "string" },
        created_at:       { bsonType: "date" },
        updated_at:       { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 5. ARTICLES
// ─────────────────────────────────────────────────────────────
db.createCollection("articles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "slug", "content", "author_id", "category_id", "status"],
      additionalProperties: false,
      properties: {
        _id:          { bsonType: "objectId" },
        title:        { bsonType: "string", minLength: 5, maxLength: 500 },
        slug:         { bsonType: "string", pattern: "^[a-z0-9-]+$" },
        subtitle:     { bsonType: "string", maxLength: 500 },
        excerpt:      { bsonType: "string", maxLength: 1000, description: "Short summary for listing pages" },
        content:      { bsonType: "string", description: "Full HTML/Markdown article body" },
        content_format: { bsonType: "string", enum: ["html", "markdown", "rich_text"] },

        // Authorship
        author_id:    { bsonType: "objectId", description: "Primary author — ref authors._id" },
        co_authors:   { bsonType: "array", items: { bsonType: "objectId" }, description: "Additional authors" },
        editor_id:    { bsonType: ["objectId", "null"], description: "Assigned editor" },

        // Classification
        category_id:  { bsonType: "objectId", description: "Primary category — ref categories._id" },
        tags:         { bsonType: "array", items: { bsonType: "objectId" }, description: "Refs to tags._id" },
        format:       { bsonType: "string", enum: ["news", "feature", "opinion", "breaking", "analysis", "interview", "review", "listicle"] },

        // Media
        featured_image: {
          bsonType: "object",
          properties: {
            media_id:  { bsonType: "objectId" },
            url:       { bsonType: "string" },
            alt:       { bsonType: "string" },
            caption:   { bsonType: "string" },
            credit:    { bsonType: "string" }
          }
        },
        media_attachments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              media_id: { bsonType: "objectId" },
              type:     { bsonType: "string" },
              url:      { bsonType: "string" },
              caption:  { bsonType: "string" }
            }
          }
        },
        gallery: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              media_id: { bsonType: "objectId" },
              url:      { bsonType: "string" },
              alt:      { bsonType: "string" },
              caption:  { bsonType: "string" }
            }
          }
        },

        // Publishing workflow
        status:           { bsonType: "string", enum: ["draft", "review", "scheduled", "published", "archived", "deleted"] },
        published_at:     { bsonType: ["date", "null"] },
        scheduled_at:     { bsonType: ["date", "null"] },
        created_at:       { bsonType: "date" },
        updated_at:       { bsonType: "date" },
        archived_at:      { bsonType: ["date", "null"] },

        // Flags & positioning
        is_breaking:      { bsonType: "bool" },
        is_featured:      { bsonType: "bool" },
        featured_position: { bsonType: ["int", "null"], minimum: 1, maximum: 10, description: "Homepage slot position" },
        is_sponsored:     { bsonType: "bool" },
        is_paywalled:     { bsonType: "bool" },
        breaking_expires_at: { bsonType: ["date", "null"] },

        // Engagement metrics (updated by background jobs)
        view_count:       { bsonType: "long", minimum: 0 },
        unique_view_count: { bsonType: "long", minimum: 0 },
        share_count:      { bsonType: "long", minimum: 0 },
        comment_count:    { bsonType: "long", minimum: 0 },
        bookmark_count:   { bsonType: "long", minimum: 0 },
        like_count:       { bsonType: "long", minimum: 0 },
        estimated_reading_time: { bsonType: "int", minimum: 1, description: "Minutes" },

        // Relations
        related_articles: { bsonType: "array", items: { bsonType: "objectId" }, description: "Manually curated related articles" },

        // SEO
        meta: {
          bsonType: "object",
          properties: {
            title:       { bsonType: "string", maxLength: 200 },
            description: { bsonType: "string", maxLength: 500 },
            keywords:    { bsonType: "array", items: { bsonType: "string" } },
            canonical:   { bsonType: "string" },
            og_image:    { bsonType: "string" },
            no_index:    { bsonType: "bool" }
          }
        },

        // Newsletter integration
        newsletter_included: { bsonType: "bool" },
        newsletter_id:       { bsonType: ["objectId", "null"] },

        // Versioning
        revision: { bsonType: "int", minimum: 1 },
        version_history: {
          bsonType: "array",
          description: "Last 5 revisions embedded for quick access",
          items: {
            bsonType: "object",
            properties: {
              revision:    { bsonType: "int" },
              modified_by: { bsonType: "objectId" },
              modified_at: { bsonType: "date" },
              summary:     { bsonType: "string" }
            }
          }
        }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 6. USERS
// ─────────────────────────────────────────────────────────────
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password_hash", "status"],
      additionalProperties: false,
      properties: {
        _id:           { bsonType: "objectId" },
        username:      { bsonType: "string", minLength: 3, maxLength: 50, pattern: "^[a-zA-Z0-9_.-]+$" },
        email:         { bsonType: "string", pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$" },
        password_hash: { bsonType: "string", description: "bcrypt hash — never store plaintext" },
        status:        { bsonType: "string", enum: ["active", "inactive", "suspended", "deleted"] },
        role:          { bsonType: "string", enum: ["user", "author", "editor", "admin", "super_admin"] },
        email_verified: { bsonType: "bool" },
        email_verify_token: { bsonType: ["string", "null"] },
        password_reset_token: { bsonType: ["string", "null"] },
        password_reset_expires: { bsonType: ["date", "null"] },

        profile: {
          bsonType: "object",
          properties: {
            first_name:  { bsonType: "string", maxLength: 100 },
            last_name:   { bsonType: "string", maxLength: 100 },
            display_name: { bsonType: "string", maxLength: 150 },
            bio:         { bsonType: "string", maxLength: 1000 },
            avatar:      { bsonType: "string" },
            country:     { bsonType: "string", maxLength: 100 },
            city:        { bsonType: "string", maxLength: 100 },
            social_links: {
              bsonType: "object",
              properties: {
                twitter:   { bsonType: "string" },
                facebook:  { bsonType: "string" },
                instagram: { bsonType: "string" },
                linkedin:  { bsonType: "string" }
              }
            }
          }
        },

        subscription_tier: { bsonType: "string", enum: ["free", "premium", "professional"] },

        preferences: {
          bsonType: "object",
          properties: {
            newsletter_subscribed: { bsonType: "bool" },
            breaking_news_alerts:  { bsonType: "bool" },
            email_digest:         { bsonType: "string", enum: ["none", "daily", "weekly"] },
            preferred_categories: { bsonType: "array", items: { bsonType: "objectId" } },
            preferred_tags:       { bsonType: "array", items: { bsonType: "objectId" } },
            dark_mode:            { bsonType: "bool" },
            font_size:            { bsonType: "string", enum: ["small", "medium", "large"] },
            language:             { bsonType: "string", maxLength: 10 }
          }
        },

        // Capped reading history — last 100 article IDs (array of embedded docs)
        reading_history: {
          bsonType: "array",
          maxItems: 100,
          items: {
            bsonType: "object",
            properties: {
              article_id: { bsonType: "objectId" },
              read_at:    { bsonType: "date" },
              duration_s: { bsonType: "int", description: "Reading duration in seconds" }
            }
          }
        },

        // Auth & security
        two_factor_enabled: { bsonType: "bool" },
        two_factor_secret:  { bsonType: ["string", "null"] },
        login_attempts:     { bsonType: "int", minimum: 0 },
        locked_until:       { bsonType: ["date", "null"] },
        api_keys: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              key_hash:   { bsonType: "string" },
              name:       { bsonType: "string" },
              last_used:  { bsonType: ["date", "null"] },
              created_at: { bsonType: "date" },
              expires_at: { bsonType: ["date", "null"] }
            }
          }
        },

        last_login:     { bsonType: ["date", "null"] },
        registered_at:  { bsonType: "date" },
        updated_at:     { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 7. SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────
db.createCollection("subscriptions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "plan", "status", "started_at"],
      additionalProperties: false,
      properties: {
        _id:           { bsonType: "objectId" },
        user_id:       { bsonType: "objectId" },
        plan:          { bsonType: "string", enum: ["free", "premium", "professional"] },
        billing_cycle: { bsonType: "string", enum: ["monthly", "annual", "lifetime", "trial"] },
        status:        { bsonType: "string", enum: ["active", "cancelled", "expired", "past_due", "trialing"] },
        amount_cents:  { bsonType: "int", minimum: 0 },
        currency:      { bsonType: "string", maxLength: 3 },
        payment_provider: { bsonType: "string", enum: ["stripe", "paypal", "manual", "none"] },
        external_subscription_id: { bsonType: ["string", "null"] },
        external_customer_id:     { bsonType: ["string", "null"] },
        started_at:    { bsonType: "date" },
        expires_at:    { bsonType: ["date", "null"] },
        trial_ends_at: { bsonType: ["date", "null"] },
        cancelled_at:  { bsonType: ["date", "null"] },
        auto_renew:    { bsonType: "bool" },
        payment_history: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              amount_cents:  { bsonType: "int" },
              currency:      { bsonType: "string" },
              paid_at:       { bsonType: "date" },
              invoice_id:    { bsonType: "string" },
              status:        { bsonType: "string", enum: ["success", "failed", "refunded"] }
            }
          }
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 8. COMMENTS
// ─────────────────────────────────────────────────────────────
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["article_id", "user_id", "content", "status"],
      additionalProperties: false,
      properties: {
        _id:              { bsonType: "objectId" },
        article_id:       { bsonType: "objectId" },
        user_id:          { bsonType: "objectId" },
        parent_comment_id: { bsonType: ["objectId", "null"], description: "null = root comment; set for replies" },
        depth:            { bsonType: "int", minimum: 0, maximum: 5, description: "Nesting depth (0=root)" },
        content:          { bsonType: "string", minLength: 1, maxLength: 5000 },
        status:           { bsonType: "string", enum: ["pending", "approved", "rejected", "spam", "deleted"] },
        is_pinned:        { bsonType: "bool" },
        votes_up:         { bsonType: "int", minimum: 0 },
        votes_down:       { bsonType: "int", minimum: 0 },
        reply_count:      { bsonType: "int", minimum: 0 },
        moderation_flags: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              user_id:    { bsonType: "objectId" },
              reason:     { bsonType: "string", enum: ["spam", "abuse", "misinformation", "off_topic", "other"] },
              flagged_at: { bsonType: "date" }
            }
          }
        },
        edited:      { bsonType: "bool" },
        edited_at:   { bsonType: ["date", "null"] },
        created_at:  { bsonType: "date" },
        updated_at:  { bsonType: "date" },
        deleted_at:  { bsonType: ["date", "null"] }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 9. BOOKMARKS
// ─────────────────────────────────────────────────────────────
db.createCollection("bookmarks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "article_id"],
      additionalProperties: false,
      properties: {
        _id:        { bsonType: "objectId" },
        user_id:    { bsonType: "objectId" },
        article_id: { bsonType: "objectId" },
        collection: { bsonType: "string", maxLength: 100, description: "Optional user-defined folder/collection name" },
        note:       { bsonType: "string", maxLength: 1000, description: "User note about why they saved this" },
        tags:       { bsonType: "array", items: { bsonType: "string" } },
        created_at: { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 10. TRENDING
// ─────────────────────────────────────────────────────────────
db.createCollection("trending", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["article_id", "score", "period", "last_updated"],
      additionalProperties: false,
      properties: {
        _id:          { bsonType: "objectId" },
        article_id:   { bsonType: "objectId" },
        category_id:  { bsonType: ["objectId", "null"] },
        period:       { bsonType: "string", enum: ["1h", "24h", "7d", "30d"], description: "Trending window" },
        score:        { bsonType: "double", minimum: 0, description: "Computed engagement score" },
        rank_position: { bsonType: "int", minimum: 1 },
        metrics: {
          bsonType: "object",
          properties: {
            views:     { bsonType: "long" },
            shares:    { bsonType: "long" },
            comments:  { bsonType: "long" },
            bookmarks: { bsonType: "long" },
            likes:     { bsonType: "long" }
          }
        },
        last_updated:   { bsonType: "date" },
        expires_at:     { bsonType: "date", description: "TTL field — document auto-deleted after this time" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 11. NEWSLETTERS
// ─────────────────────────────────────────────────────────────
db.createCollection("newsletters", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "subject", "status"],
      additionalProperties: false,
      properties: {
        _id:       { bsonType: "objectId" },
        name:      { bsonType: "string", maxLength: 200, description: "Internal name" },
        subject:   { bsonType: "string", maxLength: 300 },
        preview_text: { bsonType: "string", maxLength: 200 },
        body_html:    { bsonType: "string" },
        body_text:    { bsonType: "string" },
        status:    { bsonType: "string", enum: ["draft", "scheduled", "sending", "sent", "failed", "archived"] },
        type:      { bsonType: "string", enum: ["digest", "breaking", "promotional", "weekly", "custom"] },
        scheduled_at: { bsonType: ["date", "null"] },
        sent_at:      { bsonType: ["date", "null"] },
        category_id:  { bsonType: ["objectId", "null"] },
        article_ids:  { bsonType: "array", items: { bsonType: "objectId" } },
        target_segments: {
          bsonType: "array",
          items: { bsonType: "string", enum: ["all", "free", "premium", "professional"] }
        },
        send_stats: {
          bsonType: "object",
          properties: {
            total_recipients: { bsonType: "int" },
            delivered:        { bsonType: "int" },
            opened:           { bsonType: "int" },
            clicked:          { bsonType: "int" },
            unsubscribed:     { bsonType: "int" },
            bounced:          { bsonType: "int" }
          }
        },
        created_by:  { bsonType: "objectId" },
        created_at:  { bsonType: "date" },
        updated_at:  { bsonType: "date" }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});

// ─────────────────────────────────────────────────────────────
// 12. ANALYTICS
// ─────────────────────────────────────────────────────────────
db.createCollection("analytics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_type", "article_id", "timestamp"],
      additionalProperties: false,
      properties: {
        _id:          { bsonType: "objectId" },
        event_type:   { bsonType: "string", enum: ["view", "unique_view", "share", "comment", "bookmark", "like", "scroll_depth", "click"] },
        article_id:   { bsonType: "objectId" },
        category_id:  { bsonType: ["objectId", "null"] },
        user_id:      { bsonType: ["objectId", "null"], description: "null for anonymous users" },
        session_id:   { bsonType: "string" },
        anonymous_id: { bsonType: "string", description: "Fingerprint/cookie for anonymous tracking" },
        timestamp:    { bsonType: "date" },
        source:       { bsonType: "string", enum: ["direct", "search", "social", "email", "referral", "push"] },
        referrer:     { bsonType: "string" },
        platform:     { bsonType: "string", enum: ["web", "ios", "android", "amp"] },
        device_type:  { bsonType: "string", enum: ["desktop", "mobile", "tablet"] },
        user_agent:   { bsonType: "string" },
        country:      { bsonType: "string", maxLength: 3 },
        region:       { bsonType: "string", maxLength: 100 },
        reading_duration_s: { bsonType: ["int", "null"], description: "Seconds spent reading" },
        scroll_depth_pct:   { bsonType: ["int", "null"], minimum: 0, maximum: 100 },
        share_platform:     { bsonType: ["string", "null"], enum: ["twitter", "facebook", "whatsapp", "copy", "email", "linkedin", null] }
      }
    }
  },
  validationAction: "warn",   // warn-only for high-volume analytics writes
  validationLevel: "moderate"
});

print("✅  All collections created with schema validation.");
