import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly repo: Repository<Photo>,
  ) {}

  async create(data: {
    url: string;
    entity_type: string;
    entity_id: string;
    uploaded_by: string;
    is_hero?: boolean;
  }): Promise<Photo> {
    const photo = await this.repo.save(this.repo.create(data));
    await this.recalculateHero(data.entity_type, data.entity_id);
    return photo;
  }

  async findByEntity(entityType: string, entityId: string): Promise<Photo[]> {
    return this.repo.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { is_hero: 'DESC', score: 'DESC', created_at: 'DESC' },
    });
  }

  async setHero(photoId: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    await this.recalculateHero(photo.entity_type, photo.entity_id, photoId);
    return this.repo.findOneOrFail({ where: { id: photoId } });
  }

  async upvote(photoId: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    photo.score += 1;
    const saved = await this.repo.save(photo);
    await this.recalculateHero(photo.entity_type, photo.entity_id);
    return saved;
  }

  async downvote(photoId: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    photo.score -= 1;
    const saved = await this.repo.save(photo);
    await this.recalculateHero(photo.entity_type, photo.entity_id);
    return saved;
  }

  async remove(photoId: string, userId?: string): Promise<void> {
    const photo = await this.repo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo introuvable.');
    if (userId && photo.uploaded_by !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres photos.',
      );
    }
    const { entity_type, entity_id } = photo;
    await this.repo.remove(photo);
    await this.recalculateHero(entity_type, entity_id);
  }

  async getHero(entityType: string, entityId: string): Promise<Photo | null> {
    return this.repo.findOne({
      where: { entity_type: entityType, entity_id: entityId, is_hero: true },
    });
  }

  /**
   * Recalcule la photo principale (hero) pour une entité donnée.
   * La photo avec le meilleur score devient automatiquement la hero.
   * En cas d'égalité, la plus récente l'emporte.
   * Si `forceId` est fourni, cette photo sera imposée comme hero.
   */
  async recalculateHero(
    entityType: string,
    entityId: string,
    forceId?: string,
  ): Promise<void> {
    const photos = await this.repo.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { score: 'DESC', created_at: 'DESC' },
    });
    if (photos.length === 0) return;

    // Déterminer la meilleure photo
    let bestId: string;
    if (forceId) {
      bestId = forceId;
    } else {
      bestId = photos[0].id;
    }

    // Réinitialiser toutes les photos de cette entité
    await this.repo.update(
      { entity_type: entityType, entity_id: entityId },
      { is_hero: false },
    );

    // Mettre la meilleure comme hero
    await this.repo.update(bestId, { is_hero: true });
  }
}
