import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async create(authorId: string, dto: CreateReviewDto): Promise<Review> {
    // Verifier si l'auteur a deja laisse un avis sur cette cible
    const existing = await this.reviewRepo.findOne({
      where: {
        author_id: authorId,
        target_type: dto.target_type,
        target_id: dto.target_id,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Vous avez déjà laissé un avis sur cet élément',
      );
    }

    const review = this.reviewRepo.create({
      author_id: authorId,
      target_type: dto.target_type,
      target_id: dto.target_id,
      rating: dto.rating,
      comment: dto.comment ?? null,
      photos: dto.photos?.length ? dto.photos : null,
    });
    return this.reviewRepo.save(review);
  }

  async findByTarget(targetType: string, targetId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { target_type: targetType, target_id: targetId },
      relations: ['author'],
      order: { created_at: 'DESC' },
    });
  }

  async getTestimonials(limit: number = 6): Promise<any[]> {
    const reviews = await this.reviewRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
    return reviews
      .filter((r) => r.comment)
      .map((r) => ({
        id: r.id,
        name: `Voyageur`,
        role: 'eco_traveler',
        text: r.comment,
        rating: r.rating,
        avatar: null,
        target_type: r.target_type,
        created_at: r.created_at,
      }));
  }

  async findByAuthor(authorId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
    });
  }

  async getAverageRating(
    targetType: string,
    targetId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(*)', 'count')
      .where('review.target_type = :targetType', { targetType })
      .andWhere('review.target_id = :targetId', { targetId })
      .getRawOne();

    return {
      average: result?.average
        ? parseFloat(parseFloat(result.average).toFixed(1))
        : 0,
      count: result?.count ? parseInt(result.count, 10) : 0,
    };
  }

  async update(
    authorId: string,
    reviewId: string,
    dto: Partial<CreateReviewDto>,
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Avis introuvable');
    if (review.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres avis',
      );
    }
    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;
    if (dto.photos !== undefined)
      review.photos = dto.photos.length ? dto.photos : null;
    return this.reviewRepo.save(review);
  }

  async remove(authorId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Avis introuvable');
    if (review.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres avis',
      );
    }
    await this.reviewRepo.remove(review);
  }
}
