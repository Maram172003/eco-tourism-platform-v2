import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { Venue } from './entities/venue.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { CircuitReservation } from '../circuit/entities/circuit-reservation.entity';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';
import { CompleteOwnerProfileDto } from './dto/owner-profile.dto';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSustainabilityDto,
} from './dto/venue.dto';
import { ProviderMongoService } from './provider-mongo.service';
import { OwnerMongoService } from './owner-mongo.service';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly repo: Repository<Provider>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(CircuitReservation)
    private readonly circuitReservationRepo: Repository<CircuitReservation>,
    private readonly mongoService: ProviderMongoService,
    private readonly ownerMongoService: OwnerMongoService,
  ) {}

  // ─── Provider CRUD ────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateProviderDto) {
    const provider = this.repo.create({ user_id: userId, ...dto });
    return this.repo.save(provider);
  }

  async findByUserId(userId: string) {
    return this.repo.findOne({ where: { user_id: userId } });
  }

  async findById(userId: string) {
    const provider = await this.repo.findOne({ where: { user_id: userId } });
    if (!provider) throw new NotFoundException('Provider introuvable');
    return provider;
  }

  async update(userId: string, dto: UpdateProviderDto) {
    await this.findById(userId);
    await this.repo.update({ user_id: userId }, dto);
    return this.findByUserId(userId);
  }

  async findAll() {
    return this.repo.find();
  }

  // ─── Profile (merged from project-owner) ──────────────────────────────────

  async getProfile(userId: string) {
    const [sqlProfile, mongoEngagement, offerReservationCount, circuitReservationCount] = await Promise.all([
      this.repo.findOne({ where: { user_id: userId } }),
      this.ownerMongoService.getEngagement(userId),
      this.reservationRepo
        .createQueryBuilder('r')
        .innerJoin('r.offer', 'offer')
        .where('offer.author_id = :userId', { userId })
        .getCount(),
      this.circuitReservationRepo
        .createQueryBuilder('cr')
        .innerJoin('cr.circuit', 'circuit')
        .where('circuit.author_id = :userId', { userId })
        .getCount(),
    ]);

    if (sqlProfile) {
      const freshCompletion = this.calculateCompletion(sqlProfile);
      if (freshCompletion !== sqlProfile.profile_completion) {
        sqlProfile.profile_completion = freshCompletion;
        await this.repo.save(sqlProfile);
      }
    }

    const venues = await this.venueRepo.find({
      where: { provider_id: userId },
    });

    return {
      user_id: sqlProfile?.user_id,
      full_name: sqlProfile?.full_name,
      bio: sqlProfile?.bio,
      country: sqlProfile?.country,
      language: sqlProfile?.language,
      photo: sqlProfile?.photo,
      cover_photo: sqlProfile?.cover_photo,
      organization: sqlProfile?.organization,
      position: sqlProfile?.position,
      phone: sqlProfile?.phone,
      profile_completion: sqlProfile?.profile_completion,
      is_onboarded: sqlProfile?.is_onboarded,
      sustainability_score: sqlProfile?.sustainability_score ?? null,
      score_questionnaire: sqlProfile?.score_questionnaire ?? null,
      score_reservations: sqlProfile?.score_reservations ?? 0,
      score_feedbacks: sqlProfile?.score_feedbacks ?? 0,
      // MongoDB
      badges: mongoEngagement?.badges ?? [],
      total_reservations: offerReservationCount + circuitReservationCount,
      feedback_received: mongoEngagement?.feedback_received ?? 0,
      projects_count: mongoEngagement?.projects_count ?? 0,
      // Venues
      venues,
    };
  }

  async completeProfile(userId: string, dto: CompleteOwnerProfileDto) {
    let profile = await this.repo.findOne({ where: { user_id: userId } });

    if (!profile) {
      profile = this.repo.create({ user_id: userId });
      await this.ownerMongoService.initEngagement(userId);
    }

    profile.full_name = dto.full_name;
    profile.bio = dto.bio ?? null;
    profile.country = dto.country ?? null;
    profile.language = dto.language ?? null;
    profile.photo = dto.photo ?? null;
    profile.cover_photo = dto.cover_photo ?? null;
    profile.organization = dto.organization ?? null;
    profile.position = dto.position ?? null;
    profile.phone = dto.phone ?? null;
    profile.whatsapp = dto.whatsapp ?? null;
    profile.website = dto.website ?? null;
    profile.facebook = dto.facebook ?? null;
    profile.instagram = dto.instagram ?? null;
    profile.tiktok = dto.tiktok ?? null;
    profile.city = dto.city ?? null;
    profile.region = dto.region ?? null;
    profile.years_experience = dto.years_experience ?? null;
    profile.address = dto.address ?? null;
    if (dto.lat !== undefined) profile.lat = dto.lat;
    if (dto.lng !== undefined) profile.lng = dto.lng;
    profile.eco_labels = dto.certifications ?? null;
    profile.profile_completion = this.calculateCompletion(profile);

    return await this.repo.save(profile);
  }

  async markOnboarded(userId: string) {
    const profile = await this.findProviderOrFail(userId);
    profile.is_onboarded = true;

    const saved = await this.repo.save(profile);
    await this.ownerMongoService.addBadge(userId, 'Propriétaire Éco-Engagé');

    return saved;
  }

  // ─── Venues (merged from project-owner) ──────────────────────────────────

  async getVenues(userId: string) {
    return await this.venueRepo.find({ where: { provider_id: userId } });
  }

  async createVenue(userId: string, dto: CreateProjectDto) {
    await this.findProviderOrFail(userId);

    const hasAmbassador = await this.ownerMongoService.hasBadge(
      userId,
      'Propriétaire Ambassadeur AFRATIM',
    );

    const venue = this.venueRepo.create({
      provider_id: userId,
      name: dto.name,
      venue_type: dto.project_type?.length ? dto.project_type : null,
      description: dto.description ?? null,
      region: dto.region ?? null,
      address: dto.address ?? null,
      photo: dto.photos?.[0] ?? dto.photo ?? null,
      photos: dto.photos?.length ? dto.photos : null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      opening_hours: dto.opening_hours ?? null,
      facebook: dto.facebook ?? null,
      instagram: dto.instagram ?? null,
      services: dto.services ?? null,
      eco_labels: dto.eco_labels ?? null,
      website: dto.website ?? null,
      phone: dto.phone ?? null,
      status: hasAmbassador ? 'active' : 'pending',
    });

    const saved = await this.venueRepo.save(venue);

    await this.ownerMongoService.incrementProjectsCount(userId);

    return saved;
  }

  async updateVenue(userId: string, venueId: string, dto: UpdateProjectDto) {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });

    if (!venue) throw new NotFoundException('Établissement introuvable.');
    if (venue.provider_id !== userId)
      throw new ForbiddenException('Accès refusé.');

    if (dto.name !== undefined) venue.name = dto.name;
    if (dto.project_type !== undefined) venue.venue_type = dto.project_type;
    if (dto.description !== undefined) venue.description = dto.description;
    if (dto.region !== undefined) venue.region = dto.region;
    if (dto.address !== undefined) venue.address = dto.address;
    if (dto.photos !== undefined) {
      venue.photos = dto.photos.length ? dto.photos : null;
      venue.photo = dto.photos[0] ?? null;
    } else if (dto.photo !== undefined) venue.photo = dto.photo;
    if (dto.lat !== undefined) venue.lat = dto.lat;
    if (dto.lng !== undefined) venue.lng = dto.lng;
    if (dto.opening_hours !== undefined) venue.opening_hours = dto.opening_hours;
    if (dto.facebook !== undefined) venue.facebook = dto.facebook;
    if (dto.instagram !== undefined) venue.instagram = dto.instagram;
    if (dto.services !== undefined) venue.services = dto.services;
    if (dto.eco_labels !== undefined) venue.eco_labels = dto.eco_labels;
    if (dto.website !== undefined) venue.website = dto.website;
    if (dto.phone !== undefined) venue.phone = dto.phone;

    return await this.venueRepo.save(venue);
  }

  async deleteVenue(userId: string, venueId: string) {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });

    if (!venue) throw new NotFoundException('Établissement introuvable.');
    if (venue.provider_id !== userId)
      throw new ForbiddenException('Accès refusé.');

    await this.venueRepo.remove(venue);

    return { message: 'Établissement supprimé avec succès.' };
  }

  async updateVenueSustainability(
    userId: string,
    venueId: string,
    dto: ProjectSustainabilityDto,
  ): Promise<Venue> {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Établissement introuvable.');
    if (venue.provider_id !== userId)
      throw new ForbiddenException('Accès refusé.');
    venue.sustainability_score = dto.score;
    return this.venueRepo.save(venue);
  }

  async findActiveVenues(): Promise<Venue[]> {
    return this.venueRepo.find({
      where: { status: 'active' },
      order: { created_at: 'DESC' },
    });
  }

  // ─── Public Profile ──────────────────────────────────────────────────────

  async getPublicProfile(ownerId: string) {
    const owner = await this.repo.findOne({ where: { user_id: ownerId } });
    if (!owner) throw new NotFoundException('Profil introuvable.');
    const [venues, offers] = await Promise.all([
      this.venueRepo.find({
        where: { provider_id: ownerId, status: 'active' },
        order: { created_at: 'DESC' },
      }),
      this.offerRepo.find({
        where: {
          author_id: ownerId,
          author_type: 'provider',
          status: 'approved',
        },
        order: { created_at: 'DESC' },
      }),
    ]);
    return {
      user_id: owner.user_id,
      full_name: owner.full_name,
      bio: owner.bio,
      photo: owner.photo,
      cover_photo: owner.cover_photo,
      organization: owner.organization,
      position: owner.position,
      country: owner.country,
      sustainability_score: owner.sustainability_score,
      venues,
      offers,
    };
  }

  async searchOwners(query: string) {
    const q = query.trim();
    if (!q) return [];
    return this.repo
      .createQueryBuilder('o')
      .where('LOWER(o.full_name) LIKE :q OR LOWER(o.organization) LIKE :q', {
        q: `%${q.toLowerCase()}%`,
      })
      .select([
        'o.user_id',
        'o.full_name',
        'o.photo',
        'o.organization',
        'o.sustainability_score',
      ])
      .limit(20)
      .getMany();
  }

  // ─── Scores ──────────────────────────────────────────────────────────────

  async updateQuestionnaireScore(userId: string, scoreQuestionnaire: number) {
    const profile = await this.findProviderOrFail(userId);
    profile.score_questionnaire = scoreQuestionnaire;
    profile.sustainability_score = Math.round(
      scoreQuestionnaire * 0.4 +
        (profile.score_reservations ?? 0) * 0.4 +
        (profile.score_feedbacks ?? 0) * 0.2,
    );
    const saved = await this.repo.save(profile);
    if (profile.sustainability_score >= 80) {
      await this.mongoService.addBadge(
        userId,
        'Propriétaire Ambassadeur AFRATIM',
      );
    }
    return saved;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async findProviderOrFail(userId: string) {
    const profile = await this.repo.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException(
        "Profil introuvable. Complétez d'abord votre profil.",
      );
    }
    return profile;
  }

  private calculateCompletion(p: Partial<Provider>): number {
    let score = 0;

    const identityFields = [p.full_name, p.country, p.language];
    score +=
      (identityFields.filter(Boolean).length / identityFields.length) * 30;

    if (p.organization) score += 20;
    if (p.position) score += 15;
    if (p.bio) score += 15;
    if (p.phone) score += 10;
    if (p.photo) score += 10;

    return Math.round(score);
  }
}
