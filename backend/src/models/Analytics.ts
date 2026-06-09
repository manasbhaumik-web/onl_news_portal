import mongoose, { Document, Schema, Model } from 'mongoose';

export type EventType = 'view' | 'unique_view' | 'share' | 'comment' | 'bookmark' | 'like' | 'scroll_depth' | 'click';

export interface IAnalytics extends Document {
  eventType: EventType;
  articleId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId | null;
  userId?: mongoose.Types.ObjectId | null;
  sessionId?: string;
  anonymousId?: string;
  timestamp: Date;
  source?: 'direct' | 'search' | 'social' | 'email' | 'referral' | 'push';
  referrer?: string;
  platform?: 'web' | 'ios' | 'android' | 'amp';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  userAgent?: string;
  country?: string;
  region?: string;
  readingDurationS?: number | null;
  scrollDepthPct?: number | null;
  sharePlatform?: string | null;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    eventType: {
      type: String,
      enum: ['view', 'unique_view', 'share', 'comment', 'bookmark', 'like', 'scroll_depth', 'click'],
      required: true,
    },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String },
    anonymousId: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
    source: {
      type: String,
      enum: ['direct', 'search', 'social', 'email', 'referral', 'push'],
    },
    referrer: { type: String },
    platform: { type: String, enum: ['web', 'ios', 'android', 'amp'] },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    userAgent: { type: String },
    country: { type: String, maxlength: 3 },
    region: { type: String, maxlength: 100 },
    readingDurationS: { type: Number, default: null },
    scrollDepthPct: { type: Number, min: 0, max: 100, default: null },
    sharePlatform: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// TTL index — auto-delete analytics events after 90 days
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Query indexes
analyticsSchema.index({ articleId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ categoryId: 1, eventType: 1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });

export const AnalyticsModel: Model<IAnalytics> = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
