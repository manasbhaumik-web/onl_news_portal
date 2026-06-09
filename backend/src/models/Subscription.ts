import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPaymentHistory {
  amountCents: number;
  currency: string;
  paidAt: Date;
  invoiceId: string;
  status: 'success' | 'failed' | 'refunded';
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'free' | 'premium' | 'professional';
  billingCycle?: 'monthly' | 'annual' | 'lifetime' | 'trial';
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  amountCents?: number;
  currency?: string;
  paymentProvider?: 'stripe' | 'paypal' | 'manual' | 'none';
  externalSubscriptionId?: string | null;
  externalCustomerId?: string | null;
  startedAt: Date;
  expiresAt?: Date | null;
  trialEndsAt?: Date | null;
  cancelledAt?: Date | null;
  autoRenew?: boolean;
  paymentHistory?: IPaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['free', 'premium', 'professional'],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual', 'lifetime', 'trial'],
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
      required: true,
      default: 'active',
    },
    amountCents: { type: Number, min: 0 },
    currency: { type: String, maxlength: 3 },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual', 'none'],
      default: 'none',
    },
    externalSubscriptionId: { type: String, default: null },
    externalCustomerId: { type: String, default: null },
    startedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    autoRenew: { type: Boolean, default: true },
    paymentHistory: [
      {
        amountCents: { type: Number },
        currency: { type: String },
        paidAt: { type: Date },
        invoiceId: { type: String },
        status: { type: String, enum: ['success', 'failed', 'refunded'] },
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

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ expiresAt: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });

export const SubscriptionModel: Model<ISubscription> = mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema
);
