import nodemailer from 'nodemailer';
import pino from 'pino';
import { config } from '../config/env';

const logger = pino({ name: 'emailService' });

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createTransporter() {
  // If SMTP credentials provided, use real SMTP
  if (config.SMTP_USER && config.SMTP_PASS) {
    return nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  // Otherwise use console fallback (development)
  return null;
}

const transporter = createTransporter();

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!transporter) {
    // Console fallback
    logger.info(
      {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 200) + '...',
      },
      '📧 [EMAIL STUB] Would send email:'
    );
    console.log('------- EMAIL STUB -------');
    console.log(`TO: ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`HTML: ${options.html.substring(0, 300)}`);
    console.log('--------------------------');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `Dispatch News <${config.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info({ messageId: info.messageId, to: options.to }, '✅ Email sent');
  } catch (err) {
    logger.error({ err, to: options.to }, '❌ Failed to send email');
    throw err;
  }
}

export async function sendVerifyEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${config.CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your Dispatch account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Dispatch News</h1>
        <h2>Verify Your Email</h2>
        <p>Thank you for registering! Please verify your email address by clicking the button below.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 24 hours.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">You received this because you registered at dispatch.news</p>
      </div>
    `,
    text: `Verify your Dispatch account: ${verifyUrl}`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your Dispatch password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Dispatch News</h1>
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Dispatch News | noreply@dispatch.news</p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to Dispatch News!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Welcome to Dispatch, ${username}!</h1>
        <p>Your account has been verified and you're ready to explore the latest news.</p>
        <a href="${config.CLIENT_URL}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Read Today's News
        </a>
      </div>
    `,
    text: `Welcome to Dispatch, ${username}! Visit ${config.CLIENT_URL} to start reading.`,
  });
}
