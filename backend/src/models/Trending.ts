import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITrendingMetrics {
  views?: number;
  shares?: number;
  comments?: number;
  bookmarks?: number;
  likes?: number;
}

export interface ITrending extends Document {
  articleId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId | null;
  period: '1h' | '24h' | '7d' | '30d';
  score: number;
  rankPosition: number;
  metrics?: ITrendingMetrics;
  lastUpdated: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trendingSchema = new Schema<ITrending>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    period: {
      type: String,
      enum: ['1h', '24h', '7d', '30d'],
      required: true,
    },
    score: { type: Number, required: true, min: 0 },
    rankPosition: { type: Number, required: true, min: 1 },
    metrics: {
      views: { type: Number },
      shares: { type: Number },
      comments: { type: Number },
      bookmarks: { type: Number },
      likes: { type: Number },
    },
    lastUpdated: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
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

// TTL index — auto-delete expired trending documents
trendingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
trendingSchema.index({ period: 1, score: -1 });
trendingSchema.index({ period: 1, rankPosition: 1 });
trendingSchema.index({ articleId: 1, period: 1 }, { unique: true });

export const TrendingModel: Model<ITrending> = mongoose.model<ITrending>('Trending', trendingSchema);
