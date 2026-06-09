import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    articleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
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

// Indexes
tagSchema.index({ slug: 1 }, { unique: true });
tagSchema.index({ name: 'text' });
tagSchema.index({ articleCount: -1 });

export const TagModel: Model<ITag> = mongoose.model<ITag>('Tag', tagSchema);
