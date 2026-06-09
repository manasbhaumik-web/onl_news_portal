import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMediaVariant {
  name: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface IMedia extends Document {
  filename: string;
  originalName?: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'gif';
  mimeType?: string;
  sizeBytes: number;
  dimensions?: {
    width: number;
    height: number;
  };
  durationSeconds?: number | null;
  altText?: string;
  caption?: string;
  credit?: string;
  tags?: string[];
  uploadedBy: mongoose.Types.ObjectId;
  articleIds?: mongoose.Types.ObjectId[];
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
  variants?: IMediaVariant[];
  storageProvider?: 'local' | 's3' | 'gcs' | 'cloudinary';
  storagePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaVariantSchema = new Schema<IMediaVariant>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { _id: false }
);

const mediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true, maxlength: 500 },
    originalName: { type: String, maxlength: 500 },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'gif'],
      required: true,
    },
    mimeType: { type: String, maxlength: 100 },
    sizeBytes: { type: Number, required: true, min: 0 },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    durationSeconds: { type: Number, default: null },
    altText: { type: String, maxlength: 500 },
    caption: { type: String, maxlength: 1000 },
    credit: { type: String, maxlength: 300 },
    tags: [{ type: String }],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    articleIds: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'complete', 'failed'],
      default: 'complete',
    },
    variants: [mediaVariantSchema],
    storageProvider: {
      type: String,
      enum: ['local', 's3', 'gcs', 'cloudinary'],
      default: 'local',
    },
    storagePath: { type: String },
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
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ processingStatus: 1 });
mediaSchema.index({ articleIds: 1 });

export const MediaModel: Model<IMedia> = mongoose.model<IMedia>('Media', mediaSchema);
