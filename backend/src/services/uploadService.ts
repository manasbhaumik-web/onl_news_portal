import path from 'path';
import fs from 'fs';
import { config } from '../config/env';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  storageProvider: 'local' | 's3';
}

/**
 * Process a single uploaded file (from multer disk storage)
 * and return normalized upload result
 */
export function processUploadedFile(file: Express.Multer.File): UploadResult {
  if (config.UPLOAD_PROVIDER === 's3') {
    // S3 upload would go here — placeholder for production use
    // In real deployment, you'd use @aws-sdk/client-s3 to upload
    // For now, fall through to local
  }

  // Local disk upload (multer already saved it)
  const publicUrl = `/uploads/${file.filename}`;

  return {
    url: publicUrl,
    filename: file.filename,
    originalName: file.originalname,
    sizeBytes: file.size,
    mimeType: file.mimetype,
    storageProvider: 'local',
  };
}

/**
 * Process multiple uploaded files
 */
export function processUploadedFiles(files: Express.Multer.File[]): UploadResult[] {
  return files.map(processUploadedFile);
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.resolve(config.UPLOAD_DIR, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // File may already be deleted — ignore
  }
}

/**
 * Get the absolute path to the uploads directory
 */
export function getUploadDir(): string {
  return path.resolve(config.UPLOAD_DIR);
}

/**
 * Get public URL for a filename
 */
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
