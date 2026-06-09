import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IModerationFlag {
  userId: mongoose.Types.ObjectId;
  reason: 'spam' | 'abuse' | 'misinformation' | 'off_topic' | 'other';
  flaggedAt: Date;
}

export interface IComment extends Document {
  articleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId | null;
  depth: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam' | 'deleted';
  isPinned?: boolean;
  votesUp: number;
  votesDown: number;
  replyCount: number;
  moderationFlags?: IModerationFlag[];
  edited?: boolean;
  editedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth: { type: Number, required: true, min: 0, max: 5, default: 0 },
    content: { type: String, required: true, minlength: 1, maxlength: 5000, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'spam', 'deleted'],
      required: true,
      default: 'pending',
    },
    isPinned: { type: Boolean, default: false },
    votesUp: { type: Number, default: 0, min: 0 },
    votesDown: { type: Number, default: 0, min: 0 },
    replyCount: { type: Number, default: 0, min: 0 },
    moderationFlags: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: {
          type: String,
          enum: ['spam', 'abuse', 'misinformation', 'off_topic', 'other'],
        },
        flaggedAt: { type: Date, default: Date.now },
      },
    ],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
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

// Pre-save: enforce max depth of 5
commentSchema.pre('save', function (next) {
  if (this.depth > 5) {
    next(new Error('Comment nesting depth cannot exceed 5 levels'));
    return;
  }
  next();
});

// Indexes
commentSchema.index({ articleId: 1, status: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ status: 1 });

export const CommentModel: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
