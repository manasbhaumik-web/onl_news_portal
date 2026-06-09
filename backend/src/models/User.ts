import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IReadingHistoryItem {
  articleId: mongoose.Types.ObjectId;
  readAt: Date;
  durationS?: number;
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  role: 'user' | 'author' | 'editor' | 'admin' | 'super_admin';
  emailVerified: boolean;
  emailVerifyToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;

  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    avatar?: string;
    country?: string;
    city?: string;
    socialLinks?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };

  subscriptionTier: 'free' | 'premium' | 'professional';

  preferences?: {
    newsletterSubscribed?: boolean;
    breakingNewsAlerts?: boolean;
    emailDigest?: 'none' | 'daily' | 'weekly';
    preferredCategories?: mongoose.Types.ObjectId[];
    preferredTags?: mongoose.Types.ObjectId[];
    darkMode?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
    language?: string;
  };

  readingHistory?: IReadingHistoryItem[];

  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  loginAttempts?: number;
  lockedUntil?: Date | null;

  lastLogin?: Date | null;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(plainPassword: string): Promise<boolean>;
  generateVerifyToken(): string;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
      match: /^[a-zA-Z0-9_.\-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      required: true,
      default: 'active',
    },
    role: {
      type: String,
      enum: ['user', 'author', 'editor', 'admin', 'super_admin'],
      default: 'user',
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null, select: false },
    passwordResetToken: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },

    profile: {
      firstName: { type: String, maxlength: 100 },
      lastName: { type: String, maxlength: 100 },
      displayName: { type: String, maxlength: 150 },
      bio: { type: String, maxlength: 1000 },
      avatar: { type: String },
      country: { type: String, maxlength: 100 },
      city: { type: String, maxlength: 100 },
      socialLinks: {
        twitter: { type: String },
        facebook: { type: String },
        instagram: { type: String },
        linkedin: { type: String },
      },
    },

    subscriptionTier: {
      type: String,
      enum: ['free', 'premium', 'professional'],
      default: 'free',
    },

    preferences: {
      newsletterSubscribed: { type: Boolean, default: false },
      breakingNewsAlerts: { type: Boolean, default: false },
      emailDigest: { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' },
      preferredCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      preferredTags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
      darkMode: { type: Boolean, default: false },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      language: { type: String, maxlength: 10, default: 'en' },
    },

    readingHistory: {
      type: [
        {
          articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
          readAt: { type: Date, default: Date.now },
          durationS: { type: Number },
        },
      ],
      default: [],
    },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null, select: false },
    loginAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date, default: null },

    lastLogin: { type: Date, default: null },
    registeredAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.emailVerifyToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.twoFactorSecret;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Pre-save: hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  // Only hash if it doesn't look like a bcrypt hash already
  if (!this.passwordHash.startsWith('$2b$') && !this.passwordHash.startsWith('$2a$')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }

  next();
});

// Method: compare password
userSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Method: generate email verify token
userSchema.methods.generateVerifyToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

// Method: generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ emailVerifyToken: 1 });
userSchema.index({ passwordResetToken: 1 });

export const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);
