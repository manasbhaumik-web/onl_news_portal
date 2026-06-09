import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INewsletter extends Document {
  name: string;
  subject: string;
  previewText?: string;
  bodyHtml?: string;
  bodyText?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'archived';
  type?: 'digest' | 'breaking' | 'promotional' | 'weekly' | 'custom';
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  categoryId?: mongoose.Types.ObjectId | null;
  articleIds?: mongoose.Types.ObjectId[];
  targetSegments?: Array<'all' | 'free' | 'premium' | 'professional'>;
  sendStats?: {
    totalRecipients?: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    unsubscribed?: number;
    bounced?: number;
  };
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    name: { type: String, required: true, maxlength: 200, trim: true },
    subject: { type: String, required: true, maxlength: 300, trim: true },
    previewText: { type: String, maxlength: 200 },
    bodyHtml: { type: String },
    bodyText: { type: String },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'archived'],
      required: true,
      default: 'draft',
    },
    type: {
      type: String,
      enum: ['digest', 'breaking', 'promotional', 'weekly', 'custom'],
      default: 'digest',
    },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    articleIds: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    targetSegments: [
      {
        type: String,
        enum: ['all', 'free', 'premium', 'professional'],
      },
    ],
    sendStats: {
      totalRecipients: { type: Number },
      delivered: { type: Number },
      opened: { type: Number },
      clicked: { type: Number },
      unsubscribed: { type: Number },
      bounced: { type: Number },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
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
newsletterSchema.index({ status: 1, scheduledAt: 1 });
newsletterSchema.index({ type: 1 });
newsletterSchema.index({ createdAt: -1 });

export const NewsletterModel: Model<INewsletter> = mongoose.model<INewsletter>('Newsletter', newsletterSchema);
