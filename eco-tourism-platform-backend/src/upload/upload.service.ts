import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'eco-tourism', resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(new InternalServerErrorException('Upload échoué.'));
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }

  async deleteByUrl(url: string): Promise<void> {
    // Extrait le public_id depuis l'URL Cloudinary
    const match = url.match(/\/eco-tourism\/([^.]+)/);
    if (!match) return;
    await cloudinary.uploader.destroy(`eco-tourism/${match[1]}`).catch(() => {});
  }
}
