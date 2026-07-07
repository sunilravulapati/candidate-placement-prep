// backend/src/utils/storage.ts
import { v2 as cloudinary } from 'cloudinary';

export interface StorageMetadata {
  provider: string; // e.g. 'CLOUDINARY'
  publicId: string;
  secureUrl: string;
  resourceType: string;
  mimeType: string;
  fileSize: number;
}

export interface FileStorageProvider {
  /**
   * Uploads a file to storage and returns its metadata.
   */
  upload(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<StorageMetadata>;

  /**
   * Deletes a file from storage.
   */
  delete(publicId: string, resourceType: string): Promise<void>;

  /**
   * Replaces an existing file in storage.
   */
  replace(
    publicId: string,
    resourceType: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<StorageMetadata>;

  /**
   * Fetches metadata for an existing file.
   */
  getMetadata(publicId: string, resourceType: string): Promise<any>;
}

export class CloudinaryStorageProvider implements FileStorageProvider {
  private configure(): void {
    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
    if (!cloudinaryUrl) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL in the server environment.');
    }

    let parsed: URL;
    try {
      parsed = new URL(cloudinaryUrl);
    } catch {
      throw new Error('CLOUDINARY_URL is malformed. Expected cloudinary://API_KEY:API_SECRET@CLOUD_NAME.');
    }

    if (parsed.protocol !== 'cloudinary:' || !parsed.hostname || !parsed.username || !parsed.password) {
      throw new Error('CLOUDINARY_URL is incomplete. Expected cloudinary://API_KEY:API_SECRET@CLOUD_NAME.');
    }

    cloudinary.config({
      cloud_name: decodeURIComponent(parsed.hostname),
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password),
      secure: true,
    });
  }

  private validateUpload(fileBuffer: Buffer, mimeType: string): void {
    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new Error('Cannot upload an empty file buffer to Cloudinary.');
    }
    if (!mimeType) {
      throw new Error('Cannot upload a file without a MIME type.');
    }
    if (mimeType === 'application/pdf' && fileBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('The uploaded buffer does not contain a valid PDF signature.');
    }
  }

  private errorMessage(operation: string, error: unknown): Error {
    const details = error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String(error.message)
        : String(error);
    return new Error(`Cloudinary ${operation} failed: ${details}`);
  }

  async upload(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<StorageMetadata> {
    this.configure();
    this.validateUpload(fileBuffer, mimeType);

    return new Promise((resolve, reject) => {
      let settled = false;
      const rejectOnce = (error: unknown) => {
        if (settled) return;
        settled = true;
        reject(this.errorMessage('upload', error));
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'prepgenie/documents',
          resource_type: 'auto', // Cloudinary detects 'raw' or 'image' based on mime
          use_filename: true,
          unique_filename: true,
          filename_override: fileName,
        },
        (error, result) => {
          if (error || !result) {
            rejectOnce(error || new Error('Cloudinary returned no upload result.'));
            return;
          }

          if (settled) return;
          settled = true;
          resolve({
            provider: 'CLOUDINARY',
            publicId: result.public_id,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            mimeType: mimeType,
            fileSize: result.bytes,
          });
        }
      );

      uploadStream.once('error', rejectOnce);
      uploadStream.end(fileBuffer);
    });
  }

  async delete(publicId: string, resourceType: string): Promise<void> {
    this.configure();
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as any });
    } catch (error) {
      throw this.errorMessage('delete', error);
    }
  }

  async replace(
    publicId: string,
    resourceType: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<StorageMetadata> {
    this.configure();
    this.validateUpload(fileBuffer, mimeType);

    return new Promise((resolve, reject) => {
      let settled = false;
      const rejectOnce = (error: unknown) => {
        if (settled) return;
        settled = true;
        reject(this.errorMessage('replacement', error));
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId, // overwrite the existing file
          resource_type: resourceType as any,
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            rejectOnce(error || new Error('Cloudinary returned no replacement result.'));
            return;
          }

          if (settled) return;
          settled = true;
          resolve({
            provider: 'CLOUDINARY',
            publicId: result.public_id,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            mimeType: mimeType,
            fileSize: result.bytes,
          });
        }
      );

      uploadStream.once('error', rejectOnce);
      uploadStream.end(fileBuffer);
    });
  }

  async getMetadata(publicId: string, resourceType: string): Promise<any> {
    this.configure();
    try {
      return await cloudinary.api.resource(publicId, { resource_type: resourceType as any });
    } catch (error) {
      throw this.errorMessage('metadata lookup', error);
    }
  }
}

// Export default singleton instance
export const storageProvider: FileStorageProvider = new CloudinaryStorageProvider();
