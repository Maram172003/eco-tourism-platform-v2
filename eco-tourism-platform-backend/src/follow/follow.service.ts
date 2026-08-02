import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { Guide } from '../guide/entities/guide.entity';
import { Provider } from '../provider/entities/provider.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly repo: Repository<Follow>,
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(EcoTraveler)
    private readonly ecoTravelerRepo: Repository<EcoTraveler>,
  ) {}

  async follow(
    followerId: string,
    followerType: string,
    followingId: string,
    followingType: string,
  ) {
    if (followerId === followingId)
      throw new BadRequestException('Action invalide.');

    // Validate allowed follow combinations
    const allowed =
      (followerType === 'eco_traveler' &&
        (followingType === 'guide' || followingType === 'provider')) ||
      (followerType === 'provider' && followingType === 'guide') ||
      (followerType === 'guide' && followingType === 'provider');
    if (!allowed)
      throw new BadRequestException(
        "Cette relation de suivi n'est pas autorisée.",
      );

    const existing = await this.repo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    if (existing)
      throw new BadRequestException('Vous suivez déjà cet utilisateur.');

    const follow = this.repo.create({
      follower_id: followerId,
      follower_type: followerType,
      following_id: followingId,
      following_type: followingType,
    });
    return this.repo.save(follow);
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.repo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    if (!follow)
      throw new NotFoundException('Vous ne suivez pas cet utilisateur.');
    await this.repo.remove(follow);
    return { message: 'Désabonné.' };
  }

  async getFollowing(followerId: string) {
    return this.repo.find({
      where: { follower_id: followerId },
      order: { created_at: 'DESC' },
    });
  }

  async getFollowers(followingId: string) {
    return this.repo.find({
      where: { following_id: followingId },
      order: { created_at: 'DESC' },
    });
  }

  async getFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean; followId: string | null }> {
    const follow = await this.repo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    return { following: !!follow, followId: follow?.id ?? null };
  }

  async getFollowerCount(followingId: string): Promise<number> {
    return this.repo.count({ where: { following_id: followingId } });
  }

  async getFollowersOfUserWithProfiles(targetId: string) {
    const follows = await this.repo.find({
      where: { following_id: targetId },
      order: { created_at: 'DESC' },
    });
    return Promise.all(
      follows.map(async (f) => {
        if (f.follower_type === 'guide') {
          const g = await this.guideRepo.findOne({
            where: { user_id: f.follower_id },
          });
          return {
            user_id: f.follower_id,
            full_name: g?.full_name ?? null,
            photo: g?.photo ?? null,
            _type: 'guide',
            sub: g?.zone ?? null,
          };
        }
        if (f.follower_type === 'provider') {
          const o = await this.providerRepo.findOne({
            where: { user_id: f.follower_id },
          });
          return {
            user_id: f.follower_id,
            full_name: o?.full_name ?? null,
            photo: o?.photo ?? null,
            _type: 'provider',
            sub: o?.organization ?? null,
          };
        }
        const t = await this.ecoTravelerRepo.findOne({
          where: { user_id: f.follower_id },
        });
        return {
          user_id: f.follower_id,
          full_name: t?.full_name ?? null,
          photo: t?.photo ?? null,
          _type: 'eco_traveler',
          sub: t?.country ?? null,
        };
      }),
    );
  }

  async removeFollower(followingId: string, followerId: string) {
    const follow = await this.repo.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    if (!follow) throw new NotFoundException('Relation introuvable.');
    await this.repo.remove(follow);
    return { message: 'Abonné retiré.' };
  }

  async getFollowingWithProfiles(followerId: string) {
    const follows = await this.repo.find({
      where: { follower_id: followerId },
      order: { created_at: 'DESC' },
    });
    return Promise.all(
      follows.map(async (f) => {
        if (f.following_type === 'guide') {
          const g = await this.guideRepo.findOne({
            where: { user_id: f.following_id },
          });
          return {
            user_id: f.following_id,
            full_name: g?.full_name ?? null,
            photo: g?.photo ?? null,
            _type: 'guide',
            sub: g?.zone ?? null,
          };
        }
        const o = await this.providerRepo.findOne({
          where: { user_id: f.following_id },
        });
        return {
          user_id: f.following_id,
          full_name: o?.full_name ?? null,
          photo: o?.photo ?? null,
          _type: 'provider',
          sub: o?.organization ?? null,
        };
      }),
    );
  }

  async getFollowersWithProfiles(followingId: string) {
    const follows = await this.repo.find({
      where: { following_id: followingId },
      order: { created_at: 'DESC' },
    });
    return Promise.all(
      follows.map(async (f) => {
        if (f.follower_type === 'guide') {
          const g = await this.guideRepo.findOne({
            where: { user_id: f.follower_id },
          });
          return {
            user_id: f.follower_id,
            full_name: g?.full_name ?? null,
            photo: g?.photo ?? null,
            _type: 'guide',
            sub: g?.zone ?? null,
          };
        }
        if (f.follower_type === 'provider') {
          const o = await this.providerRepo.findOne({
            where: { user_id: f.follower_id },
          });
          return {
            user_id: f.follower_id,
            full_name: o?.full_name ?? null,
            photo: o?.photo ?? null,
            _type: 'provider',
            sub: o?.organization ?? null,
          };
        }
        const t = await this.ecoTravelerRepo.findOne({
          where: { user_id: f.follower_id },
        });
        return {
          user_id: f.follower_id,
          full_name: t?.full_name ?? null,
          photo: t?.photo ?? null,
          _type: 'eco_traveler',
          sub: t?.country ?? null,
        };
      }),
    );
  }
}
