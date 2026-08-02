import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { GuideOffering } from './entities/guide-offering.entity';
import {
  CompleteGuideProfileDto,
  UpdateGuideSpecialtiesDto,
  UpdateGuideExperienceDto,
} from './dto/guide.dto';
import { GuideMongoService } from './guide-mongo.service';
import { CertificationService } from '../certification/certification.service';
import { Collaboration } from '../collaboration/entities/collaboration.entity';
import { Review } from '../review/entities/review.entity';
import { Reservation } from '../reservation/entities/reservation.entity';

@Injectable()
export class GuideService {
  constructor(
    @InjectRepository(Guide)
    private readonly repo: Repository<Guide>,
    @InjectRepository(GuideOffering)
    private readonly offeringRepo: Repository<GuideOffering>,
    @InjectRepository(Collaboration)
    private readonly collabRepo: Repository<Collaboration>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private readonly certificationService: CertificationService,
    private readonly mongoService: GuideMongoService,
  ) {}

  async getProfile(userId: string) {
    const [sqlProfile, mongoSkills, mongoEngagement, approvedCerts] =
      await Promise.all([
        this.repo.findOne({ where: { user_id: userId } }),
        this.mongoService.getSkills(userId),
        this.mongoService.getEngagement(userId),
        this.certificationService.findApprovedByUser(userId),
      ]);

    if (sqlProfile) {
      const freshCompletion = this.calculateCompletion(sqlProfile);
      if (freshCompletion !== sqlProfile.profile_completion) {
        sqlProfile.profile_completion = freshCompletion;
        await this.repo.save(sqlProfile);
      }
    }

    return {
      user_id: sqlProfile?.user_id,
      full_name: sqlProfile?.full_name,
      guide_type: sqlProfile?.guide_type,
      bio: sqlProfile?.bio,
      country: sqlProfile?.country,
      language: sqlProfile?.language,
      photo: sqlProfile?.photo,
      cover_photo: sqlProfile?.cover_photo,
      zone: sqlProfile?.zone,
      specialties: sqlProfile?.specialties,
      languages_spoken: sqlProfile?.languages_spoken,
      years_experience: sqlProfile?.years_experience,
      status: sqlProfile?.status,
      sustainability_score: sqlProfile?.sustainability_score,
      score_questionnaire: sqlProfile?.score_questionnaire ?? null,
      score_reservations: sqlProfile?.score_reservations ?? 0,
      score_feedbacks: sqlProfile?.score_feedbacks ?? 0,
      profile_completion: sqlProfile?.profile_completion,
      is_onboarded: sqlProfile?.is_onboarded,
      // MongoDB (activités/paysages — métadonnées non vérifiées)
      skills_activities: mongoSkills?.activities ?? [],
      skills_landscapes: mongoSkills?.landscapes ?? [],
      badges: mongoEngagement?.badges ?? [],
      feedback_received: mongoEngagement?.feedback_received ?? 0,
      reservations_handled: mongoEngagement?.reservations_handled ?? 0,
      // Certifications : uniquement celles validées par l'admin (table ORM)
      certifications: approvedCerts.map((c) => ({
        label: c.name,
        proof: c.proof_url ?? c.file_url ?? '',
      })),
    };
  }

  async completeProfile(userId: string, dto: CompleteGuideProfileDto) {
    let profile = await this.repo.findOne({ where: { user_id: userId } });

    if (!profile) {
      profile = this.repo.create({ user_id: userId });
      await this.mongoService.initEngagement(userId);
    }

    profile.full_name = dto.full_name;
    profile.guide_type = dto.guide_type ?? null;
    profile.bio = dto.bio ?? null;
    profile.country = dto.country ?? null;
    profile.language = dto.language ?? null;
    profile.photo = dto.photo ?? null;
    profile.cover_photo = dto.cover_photo ?? null;
    profile.zone = dto.zone ?? null;
    profile.profile_completion = this.calculateCompletion(profile);

    return await this.repo.save(profile);
  }

  async updateSpecialties(userId: string, dto: UpdateGuideSpecialtiesDto) {
    const profile = await this.findOrFail(userId);
    profile.specialties = dto.specialties;
    profile.languages_spoken = dto.languages_spoken;
    profile.profile_completion = this.calculateCompletion(profile);

    const saved = await this.repo.save(profile);
    await this.mongoService.upsertSkills(userId, {
      activities: dto.specialties,
    });

    return saved;
  }

  async updateExperience(userId: string, dto: UpdateGuideExperienceDto) {
    const profile = await this.findOrFail(userId);
    profile.years_experience = dto.years_experience;
    profile.profile_completion = this.calculateCompletion(profile);

    const saved = await this.repo.save(profile);

    // Les certifications déclarées ici sont créées dans la table ORM (status pending)
    // → elles passent ensuite par le workflow admin (approbation/refus).
    // La preuve (URL ou fichier) est obligatoire pour chaque certification cochée.
    const validCerts = (dto.certifications ?? []).filter(
      (c) => c?.label?.trim() && c?.proof?.trim(),
    );
    if (validCerts.length > 0) {
      await this.certificationService.createFromOnboarding(
        userId,
        validCerts.map((c) => ({
          label: c.label.trim(),
          proof: (c.proof ?? '').trim(),
        })),
      );
    }

    await this.mongoService.upsertSkills(userId, {
      landscapes: dto.landscapes,
    });

    return saved;
  }

  async markOnboarded(userId: string) {
    const profile = await this.findOrFail(userId);
    profile.is_onboarded = true;

    const saved = await this.repo.save(profile);
    await this.mongoService.addBadge(userId, 'Guide Éco-Certifié');

    return saved;
  }

  async updateQuestionnaireScore(userId: string, scoreQuestionnaire: number) {
    const profile = await this.findOrFail(userId);
    profile.score_questionnaire = scoreQuestionnaire;
    profile.sustainability_score = Math.round(
      scoreQuestionnaire * 0.4 +
        profile.score_reservations * 0.4 +
        profile.score_feedbacks * 0.2,
    );
    const saved = await this.repo.save(profile);
    await this.mongoService.updateScore(userId, profile.sustainability_score);
    if (profile.sustainability_score >= 80) {
      await this.mongoService.addBadge(userId, 'Guide Ambassadeur AFRATIM');
    }
    return saved;
  }

  private async findOrFail(userId: string) {
    const profile = await this.repo.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException(
        "Profil introuvable. Complétez d'abord votre profil de base.",
      );
    }
    return profile;
  }

  async getPublicProfile(guideId: string) {
    const profile = await this.repo.findOne({ where: { user_id: guideId } });
    if (!profile) throw new NotFoundException('Profil introuvable.');
    const offerings = await this.offeringRepo.find({
      where: { guide_id: guideId },
      relations: ['sessions'],
      order: { created_at: 'DESC' },
    });
    return {
      user_id: profile.user_id,
      full_name: profile.full_name,
      guide_type: profile.guide_type,
      bio: profile.bio,
      photo: profile.photo,
      cover_photo: profile.cover_photo,
      country: profile.country,
      zone: profile.zone,
      specialties: profile.specialties,
      languages_spoken: profile.languages_spoken,
      years_experience: profile.years_experience,
      sustainability_score: profile.sustainability_score,
      offerings,
    };
  }

  async getStats(userId: string) {
    const activeStatuses = [
      'accepted',
      'completed',
    ];
    const collabs = await this.collabRepo.find({
      where: [
        { guide_id: userId },
        { invited_user_id: userId, invited_user_type: 'guide' },
      ],
    });
    const activeCollabs = collabs.filter((c) =>
      activeStatuses.includes(c.status),
    );
    const collabOfferIds = [
      ...new Set(
        activeCollabs.map((c) => c.offer_id).filter(Boolean) as string[],
      ),
    ];

    // Prestations : prestations guide propres + offres où le guide collabore
    const ownOfferings = await this.offeringRepo.count({
      where: { guide_id: userId },
    });

    let reservationsOnOffers = 0;
    if (collabOfferIds.length > 0) {
      reservationsOnOffers = await this.reservationRepo
        .createQueryBuilder('r')
        .where('r.offer_id IN (:...ids)', { ids: collabOfferIds })
        .andWhere("r.status NOT IN ('cancelled')")
        .getCount();
    }

    const reservationsOnOfferings = await this.reservationRepo
      .createQueryBuilder('r')
      .innerJoin('guide_offerings', 'go', 'go.id = r.guide_offering_id')
      .where('go.guide_id = :uid', { uid: userId })
      .andWhere("r.status NOT IN ('cancelled')")
      .getCount();

    const reviews = await this.reviewRepo.find({
      where: { target_type: 'guide', target_id: userId },
    });
    const reviewCount = reviews.length;
    const reviewAvg =
      reviewCount > 0
        ? reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) / reviewCount
        : 0;

    return {
      offers: {
        total: ownOfferings + collabOfferIds.length,
        own_offerings: ownOfferings,
        collaborated: collabOfferIds.length,
        collaborated_offer_ids: collabOfferIds,
      },
      reservations: {
        total: reservationsOnOffers + reservationsOnOfferings,
        on_offers: reservationsOnOffers,
        on_offerings: reservationsOnOfferings,
      },
      reviews: {
        total: reviewCount,
        average: parseFloat(reviewAvg.toFixed(1)),
      },
    };
  }

  async searchGuides(query: string) {
    const q = query.trim();
    const builder = this.repo
      .createQueryBuilder('g')
      .select([
        'g.user_id',
        'g.full_name',
        'g.photo',
        'g.zone',
        'g.guide_type',
        'g.sustainability_score',
      ])
      .orderBy('g.full_name', 'ASC')
      .limit(50);
    if (q) {
      builder.where('(LOWER(g.full_name) LIKE :q OR LOWER(g.zone) LIKE :q OR LOWER(g.specialties::text) LIKE :q)', {
        q: `%${q.toLowerCase()}%`,
      });
    }
    return builder.getMany();
  }

  private calculateCompletion(p: Partial<Guide>): number {
    let score = 0;

    const identityFields = [p.full_name, p.country, p.language];
    score +=
      (identityFields.filter(Boolean).length / identityFields.length) * 30;

    if (p.guide_type) score += 10;
    if (p.zone) score += 10;
    if (p.specialties?.length) score += 15;
    if (p.languages_spoken?.length) score += 10;
    if (p.years_experience !== null && p.years_experience !== undefined)
      score += 15;
    if (p.photo) score += 10;

    return Math.round(score);
  }
}
