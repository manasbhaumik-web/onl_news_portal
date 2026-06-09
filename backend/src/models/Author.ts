import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuthor extends Document {
  userId?: mongoose.Types.ObjectId | null;
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
  joinedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
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
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    },
    bio: {
      type: String,
      maxlength: 2000,
    },
    avatar: {
      type: String,
    },
    title: {
      type: String,
      maxlength: 150,
    },
    socialLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      instagram: { type: String },
      website: { type: String },
    },
    expertise: [{ type: String }],
    articleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      required: true,
      default: 'active',
    },
    role: {
      type: String,
      enum: ['author', 'editor', 'contributor', 'freelancer'],
      required: true,
      default: 'author',
    },
    joinedDate: {
      type: Date,
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
authorSchema.index({ slug: 1 }, { unique: true });
authorSchema.index({ email: 1 });
authorSchema.index({ status: 1 });
authorSchema.index({ name: 'text', bio: 'text' });

export const AuthorModel: Model<IAuthor> = mongoose.model<IAuthor>('Author', authorSchema);
