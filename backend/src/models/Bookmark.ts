import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  articleId: mongoose.Types.ObjectId;
  collection?: string;
  note?: string;
  tags?: string[];
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    collection: { type: String, maxlength: 100, trim: true },
    note: { type: String, maxlength: 1000, trim: true },
    tags: [{ type: String }],
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

// Unique constraint: one bookmark per user per article
bookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ userId: 1, collection: 1 });

export const BookmarkModel: Model<IBookmark> = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
