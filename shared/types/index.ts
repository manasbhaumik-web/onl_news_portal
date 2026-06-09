// ============================================================
//  shared/types/index.ts
//  Shared TypeScript interfaces — used by frontend & backend
// ============================================================

// ─── Enums ───────────────────────────────────────────────────
export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'deleted';
export type ArticleFormat = 'news' | 'feature' | 'opinion' | 'breaking' | 'analysis' | 'interview' | 'review' | 'listicle';
export type UserRole = 'user' | 'author' | 'editor' | 'admin' | 'super_admin';
export type SubscriptionTier = 'free' | 'premium' | 'professional';
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam' | 'deleted';
export type EventType = 'view' | 'unique_view' | 'share' | 'comment' | 'bookmark' | 'like' | 'scroll_depth' | 'click';
export type TrendingPeriod = '1h' | '24h' | '7d' | '30d';

// ─── Base ─────────────────────────────────────────────────────
export interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Category ─────────────────────────────────────────────────
export interface Category extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  color: string;
  icon?: string;
  coverImage?: string;
  sortOrder: number;
  status: 'active' | 'inactive' | 'hidden';
  articleCount: number;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// ─── Tag ──────────────────────────────────────────────────────
export interface Tag extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
}

// ─── Author ───────────────────────────────────────────────────
export interface Author extends BaseDocument {
  userId?: string | null;
  name: string;
  slug: string;
  email: string;
  bio?: string;
  avatar?: string;
  title?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  expertise?: string[];
  articleCount: number;
  status: 'active' | 'inactive' | 'suspended';
  role: 'author' | 'editor' | 'contributor' | 'freelancer';
  joinedDate?: string;
}

// ─── Media ────────────────────────────────────────────────────
export interface MediaVariant {
  name: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface Media extends BaseDocument {
  filename: string;
  originalName?: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'gif';
  mimeType?: string;
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  durationSeconds?: number;
  altText?: string;
  caption?: string;
  credit?: string;
  tags?: string[];
  uploadedBy: string;
  articleIds?: string[];
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
  variants?: MediaVariant[];
  storageProvider?: 'local' | 's3' | 'gcs' | 'cloudinary';
}

// ─── Featured Image ───────────────────────────────────────────
export interface FeaturedImage {
  mediaId?: string;
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
}

// ─── Article ──────────────────────────────────────────────────
export interface ArticleMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface Article extends BaseDocument {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  contentFormat?: 'html' | 'markdown' | 'rich_text';

  // Authorship
  authorId: string;
  author?: Author;
  coAuthors?: string[];
  editorId?: string | null;

  // Classification
  categoryId: string;
  category?: Category;
  tags?: string[];
  tagObjects?: Tag[];
  format?: ArticleFormat;

  // Media
  featuredImage?: FeaturedImage;
  mediaAttachments?: { mediaId?: string; type?: string; url: string; caption?: string }[];
  gallery?: { mediaId?: string; url: string; alt?: string; caption?: string }[];

  // Publishing
  status: ArticleStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  archivedAt?: string | null;

  // Flags
  isBreaking?: boolean;
  isFeatured?: boolean;
  featuredPosition?: number | null;
  isSponsored?: boolean;
  isPaywalled?: boolean;
  breakingExpiresAt?: string | null;

  // Engagement (denormalized)
  viewCount?: number;
  uniqueViewCount?: number;
  shareCount?: number;
  commentCount?: number;
  bookmarkCount?: number;
  likeCount?: number;
  estimatedReadingTime?: number;

  // Relations
  relatedArticles?: string[];

  // SEO
  meta?: ArticleMeta;

  // Newsletter
  newsletterIncluded?: boolean;
  newsletterId?: string | null;

  // Versioning
  revision?: number;
}

// ─── User ─────────────────────────────────────────────────────
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  country?: string;
  city?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface UserPreferences {
  newsletterSubscribed?: boolean;
  breakingNewsAlerts?: boolean;
  emailDigest?: 'none' | 'daily' | 'weekly';
  preferredCategories?: string[];
  preferredTags?: string[];
  darkMode?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  language?: string;
}

export interface ReadingHistoryItem {
  articleId: string;
  readAt: string;
  durationS?: number;
}

export interface User extends BaseDocument {
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  role: UserRole;
  emailVerified: boolean;
  profile?: UserProfile;
  subscriptionTier: SubscriptionTier;
  preferences?: UserPreferences;
  readingHistory?: ReadingHistoryItem[];
  twoFactorEnabled?: boolean;
  lastLogin?: string | null;
  registeredAt: string;
}

// ─── Comment ──────────────────────────────────────────────────
export interface Comment extends BaseDocument {
  articleId: string;
  userId: string;
  user?: Pick<User, '_id' | 'username' | 'profile'>;
  parentCommentId?: string | null;
  depth?: number;
  content: string;
  status: CommentStatus;
  isPinned?: boolean;
  votesUp?: number;
  votesDown?: number;
  replyCount?: number;
  edited?: boolean;
  editedAt?: string | null;
  deletedAt?: string | null;
  replies?: Comment[];
}

// ─── Bookmark ─────────────────────────────────────────────────
export interface Bookmark extends BaseDocument {
  userId: string;
  articleId: string;
  article?: Article;
  collection?: string;
  note?: string;
  tags?: string[];
}

// ─── Subscription ─────────────────────────────────────────────
export interface Subscription extends BaseDocument {
  userId: string;
  plan: SubscriptionTier;
  billingCycle?: 'monthly' | 'annual' | 'lifetime' | 'trial';
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  amountCents?: number;
  currency?: string;
  startedAt: string;
  expiresAt?: string | null;
  trialEndsAt?: string | null;
  cancelledAt?: string | null;
  autoRenew?: boolean;
}

// ─── Trending ─────────────────────────────────────────────────
export interface TrendingMetrics {
  views?: number;
  shares?: number;
  comments?: number;
  bookmarks?: number;
  likes?: number;
}

export interface Trending extends BaseDocument {
  articleId: string;
  article?: Article;
  categoryId?: string | null;
  period: TrendingPeriod;
  score: number;
  rankPosition: number;
  metrics?: TrendingMetrics;
  lastUpdated: string;
  expiresAt: string;
}

// ─── Analytics ────────────────────────────────────────────────
export interface AnalyticsEvent extends BaseDocument {
  eventType: EventType;
  articleId: string;
  categoryId?: string | null;
  userId?: string | null;
  sessionId?: string;
  anonymousId?: string;
  timestamp: string;
  source?: 'direct' | 'search' | 'social' | 'email' | 'referral' | 'push';
  referrer?: string;
  platform?: 'web' | 'ios' | 'android' | 'amp';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  userAgent?: string;
  country?: string;
  region?: string;
  readingDurationS?: number;
  scrollDepthPct?: number;
  sharePlatform?: string | null;
}

// ─── Newsletter ───────────────────────────────────────────────
export interface Newsletter extends BaseDocument {
  name: string;
  subject: string;
  previewText?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'archived';
  type?: 'digest' | 'breaking' | 'promotional' | 'weekly' | 'custom';
  scheduledAt?: string | null;
  sentAt?: string | null;
  articleIds?: string[];
  targetSegments?: Array<'all' | 'free' | 'premium' | 'professional'>;
  sendStats?: {
    totalRecipients?: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    unsubscribed?: number;
    bounced?: number;
  };
  createdBy?: string;
}

// ─── API Responses ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  user: Omit<User, 'readingHistory'>;
}

// ─── Search ───────────────────────────────────────────────────
export interface SearchResult {
  articles: Article[];
  total: number;
  query: string;
  page: number;
  totalPages: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'article' | 'category' | 'tag' | 'author';
  url: string;
}

// ─── Analytics Dashboard ──────────────────────────────────────
export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  totalUsers: number;
  totalViews: number;
  totalComments: number;
  totalBookmarks: number;
  viewsToday: number;
  newUsersToday: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  views: number;
  shares: number;
  comments: number;
  engagementScore: number;
}

export interface AuthorProductivity {
  authorId: string;
  authorName: string;
  authorSlug: string;
  totalArticles: number;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  avgViewsPerArticle: number;
  engagementScore: number;
}
