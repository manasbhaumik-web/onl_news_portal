import mongoose from 'mongoose';
import pino from 'pino';
import { env as config } from './env';

const logger = pino({ name: 'db', level: 'info' });

let retryCount = 0;
const MAX_RETRIES = 10;
const BASE_DELAY_MS = 1000;

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);

    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected successfully');
      retryCount = 0;
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, '❌ MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected — retrying in 5s...');
      setTimeout(() => connectWithRetry(), 5000);
    });

    await connectWithRetry();
  } catch (err) {
    logger.error({ err }, 'Fatal DB connection error');
    process.exit(1);
  }
}

async function connectWithRetry(): Promise<void> {
  if (retryCount >= MAX_RETRIES) {
    logger.error('Max DB reconnect attempts reached. Exiting.');
    process.exit(1);
  }

  const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retryCount), 30000);

  try {
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    retryCount++;
    logger.warn({ err, attempt: retryCount, nextRetryMs: delay }, 'DB connection failed — retrying...');
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectWithRetry();
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected cleanly');
}
