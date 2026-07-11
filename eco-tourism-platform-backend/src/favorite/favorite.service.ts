import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  async toggle(
    userId: string,
    dto: CreateFavoriteDto,
  ): Promise<{ favorited: boolean }> {
    const existing = await this.favoriteRepo.findOne({
      where: {
        user_id: userId,
        target_type: dto.target_type,
        target_id: dto.target_id,
      },
    });

    if (existing) {
      await this.favoriteRepo.remove(existing);
      return { favorited: false };
    }

    const favorite = this.favoriteRepo.create({
      user_id: userId,
      target_type: dto.target_type,
      target_id: dto.target_id,
    });
    await this.favoriteRepo.save(favorite);
    return { favorited: true };
  }

  async findAll(userId: string, targetType?: string): Promise<Favorite[]> {
    const where: any = { user_id: userId };
    if (targetType) where.target_type = targetType;
    return this.favoriteRepo.find({ where, order: { created_at: 'DESC' } });
  }

  async check(
    userId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean> {
    const count = await this.favoriteRepo.count({
      where: { user_id: userId, target_type: targetType, target_id: targetId },
    });
    return count > 0;
  }

  async count(userId: string, targetType: string): Promise<number> {
    return this.favoriteRepo.count({
      where: { user_id: userId, target_type: targetType },
    });
  }

  async remove(
    userId: string,
    targetType: string,
    targetId: string,
  ): Promise<void> {
    const favorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, target_type: targetType, target_id: targetId },
    });
    if (!favorite) throw new NotFoundException('Favori introuvable');
    await this.favoriteRepo.remove(favorite);
  }
}
