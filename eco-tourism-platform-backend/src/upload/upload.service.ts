import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  private ensureConfigured() {
    if (this.configured) return;
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('Cloudinary env vars missing — upload will fail');
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.configured = true;
  }

  async uploadBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    this.ensureConfigured();
    const isPdf = mimetype === 'application/pdf';
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'eco-tourism', resource_type: isPdf ? 'raw' : 'image' },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload error:', error?.message || error);
            return reject(new InternalServerErrorException(`Upload échoué: ${error?.message || 'unknown'}`));
          }
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }

  async deleteByUrl(url: string): Promise<void> {
    this.ensureConfigured();
    const match = url.match(/\/eco-tourism\/([^.]+)/);
    if (!match) return;
    await cloudinary.uploader
      .destroy(`eco-tourism/${match[1]}`)
      .catch(() => {});
  }
}
