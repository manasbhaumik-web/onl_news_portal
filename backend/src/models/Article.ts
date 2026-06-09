import mongoose, { Document, Schema, Model } from 'mongoose';
import { generateSlug } from '../utils/slugify';

export interface IVersionHistoryEntry {
  revision: number;
  modifiedBy: mongoose.Types.ObjectId;
  modifiedAt: Date;
  summary?: string;
}

export interface IFeaturedImage {
  mediaId?: mongoose.Types.ObjectId;
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  contentFormat?: 'html' | 'markdown' | 'rich_text';

  // Authorship
  authorId: mongoose.Types.ObjectId;
  coAuthors?: mongoose.Types.ObjectId[];
  editorId?: mongoose.Types.ObjectId | null;

  // Classification
  categoryId: mongoose.Types.ObjectId;
  tags?: mongoose.Types.ObjectId[];
  format?: 'news' | 'feature' | 'opinion' | 'breaking' | 'analysis' | 'interview' | 'review' | 'listicle';

  // Media
  featuredImage?: IFeaturedImage;
  mediaAttachments?: Array<{ mediaId?: mongoose.Types.ObjectId; type?: string; url: string; caption?: string }>;
  gallery?: Array<{ mediaId?: mongoose.Types.ObjectId; url: string; alt?: string; caption?: string }>;

  // Publishing
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'deleted';
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  archivedAt?: Date | null;

  // Flags
  isBreaking?: boolean;
  isFeatured?: boolean;
  featuredPosition?: number | null;
  isSponsored?: boolean;
  isPaywalled?: boolean;
  breakingExpiresAt?: Date | null;

  // Engagement
  viewCount: number;
  uniqueViewCount: number;
  shareCount: number;
  commentCount: number;
  bookmarkCount: number;
  likeCount: number;
  estimatedReadingTime: number;

  // Relations
  relatedArticles?: mongoose.Types.ObjectId[];

  // SEO
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    noIndex?: boolean;
  };

  // Newsletter
  newsletterIncluded?: boolean;
  newsletterId?: mongoose.Types.ObjectId | null;

  // Versioning
  revision: number;
  versionHistory?: IVersionHistoryEntry[];

  createdAt: Date;
  updatedAt: Date;

  // Virtual
  url: string;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, minlength: 5, maxlength: 500, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    subtitle: { type: String, maxlength: 500, trim: true },
    excerpt: { type: String, maxlength: 1000, trim: true },
    content: { type: String, required: true },
    contentFormat: { type: String, enum: ['html', 'markdown', 'rich_text'], default: 'html' },

    authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
    coAuthors: [{ type: Schema.Types.ObjectId, ref: 'Author' }],
    editorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    format: {
      type: String,
      enum: ['news', 'feature', 'opinion', 'breaking', 'analysis', 'interview', 'review', 'listicle'],
      default: 'news',
    },

    featuredImage: {
      mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
      url: { type: String },
      alt: { type: String },
      caption: { type: String },
      credit: { type: String },
    },
    mediaAttachments: [
      {
        mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
        type: { type: String },
        url: { type: String },
        caption: { type: String },
      },
    ],
    gallery: [
      {
        mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
        url: { type: String },
        alt: { type: String },
        caption: { type: String },
      },
    ],

    status: {
      type: String,
      enum: ['draft', 'review', 'scheduled', 'published', 'archived', 'deleted'],
      required: true,
      default: 'draft',
    },
    publishedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },

    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    featuredPosition: { type: Number, min: 1, max: 10, default: null },
    isSponsored: { type: Boolean, default: false },
    isPaywalled: { type: Boolean, default: false },
    breakingExpiresAt: { type: Date, default: null },

    viewCount: { type: Number, default: 0, min: 0 },
    uniqueViewCount: { type: Number, default: 0, min: 0 },
    shareCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    estimatedReadingTime: { type: Number, default: 1, min: 1 },

    relatedArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],

    meta: {
      title: { type: String, maxlength: 200 },
      description: { type: String, maxlength: 500 },
      keywords: [{ type: String }],
      canonical: { type: String },
      ogImage: { type: String },
      noIndex: { type: Boolean, default: false },
    },

    newsletterIncluded: { type: Boolean, default: false },
    newsletterId: { type: Schema.Types.ObjectId, ref: 'Newsletter', default: null },

    revision: { type: Number, default: 1, min: 1 },
    versionHistory: [
      {
        revision: { type: Number },
        modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        modifiedAt: { type: Date },
        summary: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual: URL
articleSchema.virtual('url').get(function (this: IArticle) {
  return `/articles/${this.slug}`;
});

// Pre-save: generate slug from title if not provided
articleSchema.pre('save', async function (next) {
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }

  // Auto-calculate estimated reading time (200 wpm average)
  if (this.isModified('content') && this.content) {
    const wordCount = this.content
      .replace(/<[^>]*>/g, '') // strip HTML tags
      .split(/\s+/)
      .filter(Boolean).length;
    this.estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  next();
});

// Indexes
articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ categoryId: 1, status: 1 });
articleSchema.index({ authorId: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ isFeatured: 1, featuredPosition: 1 });
articleSchema.index({ isBreaking: 1, breakingExpiresAt: 1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ commentCount: -1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export const ArticleModel: Model<IArticle> = mongoose.model<IArticle>('Article', articleSchema);
