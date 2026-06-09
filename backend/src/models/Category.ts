import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId | null;
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
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
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
      maxlength: 500,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-Fa-f]{6}$/,
      default: '#000000',
    },
    icon: {
      type: String,
      maxlength: 100,
    },
    coverImage: {
      type: String,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'hidden'],
      required: true,
      default: 'active',
    },
    articleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    meta: {
      title: { type: String, maxlength: 200 },
      description: { type: String, maxlength: 500 },
      keywords: [{ type: String }],
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
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ status: 1, sortOrder: 1 });
categorySchema.index({ parentId: 1 });

export const CategoryModel: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
