/**
 * ============================================================
 *  DISPATCH NEWS PORTAL — database_setup.js
 *  One-shot Initialisation Script
 *  Run: mongosh dispatch_portal database_setup.js
 * ============================================================
 */

// ── 1. Switch to (or create) the database ───────────────────
use("dispatch_portal");

print("🚀  Initialising dispatch_portal database...\n");

// ── 2. Helper: drop and recreate for a clean slate ──────────
const collections = [
  "categories", "tags", "authors", "media",
  "articles", "users", "subscriptions",
  "comments", "bookmarks", "trending",
  "newsletters", "analytics"
];

collections.forEach(col => {
  if (db.getCollectionNames().includes(col)) {
    db[col].drop();
    print(`  ⚠️  Dropped existing collection: ${col}`);
  }
});

// ── 3. Load and run schema definitions ──────────────────────
//    In production run: mongosh dispatch_portal complete_schema.js
//    Here we inline the createCollection calls for convenience.

// ── 4. Seed essential lookup data ───────────────────────────
print("\n📂  Seeding categories...");

const categoryIds = {
  politics:       new ObjectId(),
  business:       new ObjectId(),
  technology:     new ObjectId(),
  entertainment:  new ObjectId(),
  travel:         new ObjectId(),
  lifestyle:      new ObjectId(),
  sports:         new ObjectId(),
  health:         new ObjectId(),
  science:        new ObjectId(),
  world:          new ObjectId()
};

db.categories.insertMany([
  {
    _id: categoryIds.politics,
    name: "Politics", slug: "politics",
    description: "Political news, elections, governance and policy coverage.",
    parent_id: null, color: "#DC2626", icon: "landmark",
    cover_image: "https://dispatch.media/categories/politics.jpg",
    sort_order: 1, status: "active",
    meta: { title: "Politics News", description: "Latest political news and analysis.", keywords: ["politics","government","elections"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.business,
    name: "Business", slug: "business",
    description: "Markets, economy, companies, finance and commerce.",
    parent_id: null, color: "#2563EB", icon: "briefcase",
    cover_image: "https://dispatch.media/categories/business.jpg",
    sort_order: 2, status: "active",
    meta: { title: "Business News", description: "Business and finance news.", keywords: ["business","markets","economy"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.technology,
    name: "Technology", slug: "technology",
    description: "Tech industry, AI, gadgets, software and innovation.",
    parent_id: null, color: "#7C3AED", icon: "cpu",
    cover_image: "https://dispatch.media/categories/technology.jpg",
    sort_order: 3, status: "active",
    meta: { title: "Technology News", description: "Latest tech news and gadget reviews.", keywords: ["technology","ai","gadgets"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.entertainment,
    name: "Entertainment", slug: "entertainment",
    description: "Movies, music, celebrity news and culture.",
    parent_id: null, color: "#D97706", icon: "film",
    cover_image: "https://dispatch.media/categories/entertainment.jpg",
    sort_order: 4, status: "active",
    meta: { title: "Entertainment News", description: "Celebrity, movies, music and TV.", keywords: ["entertainment","movies","music"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.travel,
    name: "Travel", slug: "travel",
    description: "Destinations, travel tips, airlines and tourism.",
    parent_id: null, color: "#059669", icon: "plane",
    cover_image: "https://dispatch.media/categories/travel.jpg",
    sort_order: 5, status: "active",
    meta: { title: "Travel News", description: "Travel guides, tips and destination news.", keywords: ["travel","destinations","tourism"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.lifestyle,
    name: "Lifestyle", slug: "lifestyle",
    description: "Health, wellness, food, fashion and everyday living.",
    parent_id: null, color: "#EC4899", icon: "heart",
    cover_image: "https://dispatch.media/categories/lifestyle.jpg",
    sort_order: 6, status: "active",
    meta: { title: "Lifestyle News", description: "Health, wellness and lifestyle news.", keywords: ["lifestyle","wellness","food"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.sports,
    name: "Sports", slug: "sports",
    description: "Football, cricket, tennis, Olympics and sports analysis.",
    parent_id: null, color: "#16A34A", icon: "trophy",
    cover_image: "https://dispatch.media/categories/sports.jpg",
    sort_order: 7, status: "active",
    meta: { title: "Sports News", description: "Sports results, analysis and live updates.", keywords: ["sports","football","cricket"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.health,
    name: "Health", slug: "health",
    description: "Medical news, research, public health and wellness.",
    parent_id: null, color: "#0891B2", icon: "activity",
    cover_image: "https://dispatch.media/categories/health.jpg",
    sort_order: 8, status: "active",
    meta: { title: "Health News", description: "Medical research and health news.", keywords: ["health","medicine","wellness"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.science,
    name: "Science", slug: "science",
    description: "Scientific discoveries, space, environment and research.",
    parent_id: null, color: "#6366F1", icon: "flask",
    cover_image: "https://dispatch.media/categories/science.jpg",
    sort_order: 9, status: "active",
    meta: { title: "Science News", description: "Scientific discoveries and research news.", keywords: ["science","space","environment"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  },
  {
    _id: categoryIds.world,
    name: "World", slug: "world",
    description: "International news, geopolitics and global events.",
    parent_id: null, color: "#B45309", icon: "globe",
    cover_image: "https://dispatch.media/categories/world.jpg",
    sort_order: 10, status: "active",
    meta: { title: "World News", description: "Global news and international affairs.", keywords: ["world","international","geopolitics"] },
    article_count: 0, created_at: new Date(), updated_at: new Date()
  }
]);
print("  ✅  Inserted 10 categories.");

// ── 5. Seed tags ─────────────────────────────────────────────
print("\n🏷️   Seeding tags...");
const tagIds = {
  ai:          new ObjectId(),
  elections:   new ObjectId(),
  startup:     new ObjectId(),
  climate:     new ObjectId(),
  healthcare:  new ObjectId(),
  crypto:      new ObjectId(),
  sustainability: new ObjectId(),
  breaking:    new ObjectId()
};

db.tags.insertMany([
  { _id: tagIds.ai,            name: "Artificial Intelligence", slug: "artificial-intelligence", description: "AI, machine learning, LLMs.",    article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.elections,     name: "Elections",               slug: "elections",               description: "Electoral politics worldwide.",  article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.startup,       name: "Startup",                 slug: "startup",                 description: "Startup ecosystem news.",        article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.climate,       name: "Climate Change",          slug: "climate-change",          description: "Climate and environment.",       article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.healthcare,    name: "Healthcare",              slug: "healthcare",              description: "Health systems and policy.",     article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.crypto,        name: "Cryptocurrency",          slug: "cryptocurrency",          description: "Crypto markets and blockchain.", article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.sustainability, name: "Sustainability",         slug: "sustainability",          description: "Sustainable development.",       article_count: 0, created_at: new Date(), updated_at: new Date() },
  { _id: tagIds.breaking,      name: "Breaking News",           slug: "breaking-news",           description: "Breaking news alerts.",          article_count: 0, created_at: new Date(), updated_at: new Date() }
]);
print("  ✅  Inserted 8 tags.");

// ── 6. Seed authors ──────────────────────────────────────────
print("\n✍️   Seeding authors...");
const authorIds = {
  sarah: new ObjectId(),
  james: new ObjectId(),
  priya: new ObjectId()
};

db.authors.insertMany([
  {
    _id: authorIds.sarah, user_id: null,
    name: "Sarah Mitchell", slug: "sarah-mitchell",
    email: "sarah.mitchell@dispatch.news",
    bio: "Political correspondent with 12 years covering Washington D.C. and international affairs. Pulitzer Prize finalist 2022.",
    avatar: "https://dispatch.media/authors/sarah-mitchell.jpg",
    title: "Senior Political Correspondent",
    social_links: { twitter: "@sarahmitchell_dc", linkedin: "sarah-mitchell-journalist", instagram: null, website: null },
    expertise: ["US Politics", "Foreign Policy", "Elections"],
    article_count: 0, status: "active", role: "author",
    joined_date: new Date("2019-03-15"), created_at: new Date(), updated_at: new Date()
  },
  {
    _id: authorIds.james, user_id: null,
    name: "James Thornton", slug: "james-thornton",
    email: "james.thornton@dispatch.news",
    bio: "Technology journalist and editor. Former software engineer turned writer. Covers AI, startups, and Silicon Valley.",
    avatar: "https://dispatch.media/authors/james-thornton.jpg",
    title: "Technology Editor",
    social_links: { twitter: "@jthornton_tech", linkedin: "james-thornton-tech", instagram: null, website: "https://jamesthornton.io" },
    expertise: ["Artificial Intelligence", "Startups", "Cybersecurity"],
    article_count: 0, status: "active", role: "editor",
    joined_date: new Date("2020-07-01"), created_at: new Date(), updated_at: new Date()
  },
  {
    _id: authorIds.priya, user_id: null,
    name: "Priya Sharma", slug: "priya-sharma",
    email: "priya.sharma@dispatch.news",
    bio: "Business and economics reporter covering global markets, trade policy, and emerging economies.",
    avatar: "https://dispatch.media/authors/priya-sharma.jpg",
    title: "Business Reporter",
    social_links: { twitter: "@priyasharma_biz", linkedin: "priya-sharma-dispatch", instagram: null, website: null },
    expertise: ["Global Markets", "Economy", "Trade Policy"],
    article_count: 0, status: "active", role: "author",
    joined_date: new Date("2021-01-20"), created_at: new Date(), updated_at: new Date()
  }
]);
print("  ✅  Inserted 3 authors.");

// ── 7. Create database admin user (placeholder — update pw!) ─
print("\n🔐  Creating DB roles (update password before production!)...");
try {
  db.createUser({
    user: "dispatch_app",
    pwd:  "CHANGE_ME_BEFORE_PRODUCTION",
    roles: [
      { role: "readWrite", db: "dispatch_portal" }
    ]
  });
  print("  ✅  Application user 'dispatch_app' created.");
} catch(e) {
  print("  ⚠️  User may already exist or insufficient privileges: " + e.message);
}

try {
  db.createUser({
    user: "dispatch_readonly",
    pwd:  "CHANGE_ME_BEFORE_PRODUCTION",
    roles: [
      { role: "read", db: "dispatch_portal" }
    ]
  });
  print("  ✅  Read-only user 'dispatch_readonly' created.");
} catch(e) {
  print("  ⚠️  Read-only user: " + e.message);
}

// ── 8. Summary ───────────────────────────────────────────────
print("\n" + "═".repeat(60));
print("  ✅  dispatch_portal initialised successfully.");
print("  📌  Next steps:");
print("       1. Run complete_schema.js   (schema + validation)");
print("       2. Run indexes.js           (all indexes)");
print("       3. Run sample_data.json     (seed data via mongoimport)");
print("       4. Update passwords above before deploying.");
print("═".repeat(60) + "\n");
