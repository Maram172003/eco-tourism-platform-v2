import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './entities/offer.entity';
import { OfferSession } from './entities/offer-session.entity';
import { CreateOfferDto, OfferSustainabilityDto, UpdateOfferDto } from './dto/offer.dto';
import { ProviderActivity } from '../provider-activity/entities/provider-activity.entity';
import { ActivityDetails, ActivityDetailsDocument } from '../provider-activity/schemas/activity-details.schema';

// Champs d'onboarding pouvant contraindre la capacité d'une offre
const CAPACITY_FIELD_NAMES = [
  'capacite_max', 'capacite_salle', 'nb_places', 'max_participants',
  'capacite_vehicule', 'nb_personnes_max', 'nb_lits', 'nombre_places',
];

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly repo: Repository<Offer>,

    @InjectRepository(OfferSession)
    private readonly sessionRepo: Repository<OfferSession>,

    @InjectRepository(ProviderActivity)
    private readonly activityRepo: Repository<ProviderActivity>,

    @InjectModel(ActivityDetails.name)
    private readonly activityDetailsModel: Model<ActivityDetailsDocument>,
  ) {}

  async create(authorId: string, dto: CreateOfferDto, initialStatus: string = 'pending'): Promise<Offer> {
    // Validation des contraintes si une activité est liée
    if (dto.activity_id) {
      await this.validateAgainstActivity(dto);
    }

    const offer = this.repo.create({
      author_id: authorId,
      author_type: 'provider',
      organization_id: dto.organization_id ?? null,
      activity_id: dto.activity_id ?? null,
      title: dto.title,
      description: dto.description ?? null,
      price: dto.price ?? null,
      duration: dto.duration ?? null,
      offer_type: dto.offer_type ?? null,
      offer_subtype: dto.offer_subtype ?? (dto.offer_subtypes?.[0] ?? null),
      offer_subtypes: dto.offer_subtypes?.length ? dto.offer_subtypes : null,
      offer_mode: dto.offer_mode ?? 'single',
      availability_mode: dto.availability_mode ?? null,
      availability_start: dto.availability_start ? new Date(dto.availability_start) : null,
      availability_end: dto.availability_end ? new Date(dto.availability_end) : null,
      fulfillment_mode: dto.fulfillment_mode ?? null,
      confirmation_mode: dto.confirmation_mode ?? 'manual',
      price_type: dto.price_type ?? 'per_person',
      capacity: dto.capacity ?? null,
      booking_deadline_hours: dto.booking_deadline_hours ?? null,
      confirmation_deadline_hours: dto.confirmation_deadline_hours ?? null,
      production_delay_days: dto.production_delay_days ?? null,
      deposit_percentage: dto.deposit_percentage ?? 0,
      details: dto.details ?? null,
      images: dto.images?.length ? dto.images : null,
      inclusions: dto.inclusions ?? null,
      region: dto.region ?? null,
      meeting_point: dto.meeting_point ?? null,
      meeting_lat: dto.meeting_lat ?? null,
      meeting_lng: dto.meeting_lng ?? null,
      min_group_size: dto.min_group_size ?? null,
      max_group_size: dto.max_group_size ?? null,
      min_age: dto.min_age ?? null,
      cancellation_policy: dto.cancellation_policy ?? null,
      status: initialStatus,
    });
    return this.repo.save(offer);
  }

  async findByAuthor(authorId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
    });
  }

  async findPublishedByOrganization(organizationId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { organization_id: organizationId, status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  async findPublishedByAuthor(authorId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { author_id: authorId, status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  async findAllPublic(): Promise<Offer[]> {
    return this.repo.find({
      where: { status: 'approved' },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<Offer> {
    const offer = await this.repo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    return offer;
  }

  async update(authorId: string, offerId: string, dto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');

    if (dto.activity_id) {
      await this.validateAgainstActivity({ activity_id: dto.activity_id, capacity: undefined, max_group_size: undefined, details: dto.details } as CreateOfferDto);
    }

    if (dto.title !== undefined) offer.title = dto.title;
    if (dto.organization_id !== undefined) offer.organization_id = dto.organization_id ?? null;
    if (dto.activity_id !== undefined) offer.activity_id = dto.activity_id ?? null;
    if (dto.description !== undefined) offer.description = dto.description ?? null;
    if (dto.price !== undefined) offer.price = dto.price ?? null;
    if (dto.duration !== undefined) offer.duration = dto.duration ?? null;
    if (dto.offer_type !== undefined) offer.offer_type = dto.offer_type ?? null;
    if (dto.offer_subtype !== undefined) offer.offer_subtype = dto.offer_subtype ?? null;
    if (dto.offer_subtypes !== undefined) offer.offer_subtypes = dto.offer_subtypes?.length ? dto.offer_subtypes : null;
    if (dto.offer_mode !== undefined) offer.offer_mode = dto.offer_mode ?? 'single';
    if (dto.availability_mode !== undefined) offer.availability_mode = dto.availability_mode ?? null;
    if (dto.availability_start !== undefined) offer.availability_start = dto.availability_start ? new Date(dto.availability_start) : null;
    if (dto.availability_end !== undefined) offer.availability_end = dto.availability_end ? new Date(dto.availability_end) : null;
    if (dto.images !== undefined) offer.images = dto.images?.length ? dto.images : null;
    if (dto.inclusions !== undefined) offer.inclusions = dto.inclusions ?? null;
    if (dto.region !== undefined) offer.region = dto.region ?? null;
    if (dto.meeting_point !== undefined) offer.meeting_point = dto.meeting_point ?? null;
    if (dto.meeting_lat !== undefined) offer.meeting_lat = dto.meeting_lat ?? null;
    if (dto.meeting_lng !== undefined) offer.meeting_lng = dto.meeting_lng ?? null;
    if (dto.min_group_size !== undefined) offer.min_group_size = dto.min_group_size ?? null;
    if (dto.max_group_size !== undefined) offer.max_group_size = dto.max_group_size ?? null;
    if (dto.min_age !== undefined) offer.min_age = dto.min_age ?? null;
    if (dto.cancellation_policy !== undefined) offer.cancellation_policy = dto.cancellation_policy ?? null;
    if (dto.details !== undefined) offer.details = dto.details ?? null;
    if (dto.status !== undefined) offer.status = dto.status;

    return this.repo.save(offer);
  }

  async updateOfferSustainability(authorId: string, offerId: string, dto: OfferSustainabilityDto): Promise<Offer> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    offer.sustainability_score = dto.score;
    return this.repo.save(offer);
  }

  async remove(authorId: string, offerId: string): Promise<{ message: string }> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    await this.repo.remove(offer);
    return { message: 'Offre supprimée.' };
  }

  // ─── Sessions ────────────────────────────────────────────────────────────────

  async getSessionsForOffer(offerId: string): Promise<OfferSession[]> {
    return this.sessionRepo.find({
      where: { offer_id: offerId },
      order: { date: 'ASC', start_time: 'ASC' },
    });
  }

  async createSession(authorId: string, offerId: string, dto: any): Promise<OfferSession> {
    const offer = await this.findOrFail(offerId);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    const session = this.sessionRepo.create({ offer_id: offerId, ...dto } as Partial<OfferSession>);
    return this.sessionRepo.save(session as OfferSession);
  }

  async updateSession(authorId: string, sessionId: string, dto: any): Promise<OfferSession> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Séance introuvable.');
    const offer = await this.findOrFail(session.offer_id);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async deleteSession(authorId: string, sessionId: string): Promise<{ message: string }> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Séance introuvable.');
    const offer = await this.findOrFail(session.offer_id);
    if (offer.author_id !== authorId) throw new ForbiddenException('Accès refusé.');
    await this.sessionRepo.remove(session);
    return { message: 'Séance supprimée.' };
  }

  // ─── Constraint validation ────────────────────────────────────────────────────

  private async validateAgainstActivity(dto: CreateOfferDto): Promise<void> {
    if (!dto.activity_id) return;

    const details = await this.activityDetailsModel.findOne({ activity_id: dto.activity_id });
    if (!details) return;

    const fields = details.fields as Record<string, any>;

    // Chercher la capacité max déclarée dans l'onboarding
    let maxCapacity: number | null = null;
    for (const key of CAPACITY_FIELD_NAMES) {
      const val = fields[key];
      if (val != null && !isNaN(Number(val))) {
        maxCapacity = Number(val);
        break;
      }
    }

    if (maxCapacity !== null) {
      if (dto.capacity && dto.capacity > maxCapacity) {
        throw new BadRequestException(
          `Capacité dépassée. Votre activité peut accueillir au maximum ${maxCapacity} personnes selon votre profil. Modifiez votre profil si cette capacité a changé.`,
        );
      }
      if (dto.max_group_size && dto.max_group_size > maxCapacity) {
        throw new BadRequestException(
          `Groupe maximum dépassé. Votre activité peut accueillir au maximum ${maxCapacity} personnes selon votre profil.`,
        );
      }
    }

    // Validation des niveaux : ceux de l'offre doivent être déclarés dans l'onboarding
    const niveauxOnboarding: string[] = fields['niveaux'] ?? fields['niveaux_acceptes'] ?? [];
    if (
      niveauxOnboarding.length > 0 &&
      dto.details &&
      Array.isArray((dto.details as any)['niveaux'])
    ) {
      const niveauxOffre: string[] = (dto.details as any)['niveaux'];
      const invalid = niveauxOffre.filter((n) => !niveauxOnboarding.includes(n));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Niveaux non déclarés : ${invalid.join(', ')}. Votre profil déclare uniquement : ${niveauxOnboarding.join(', ')}.`,
        );
      }
    }

    // Validation des langues guides
    const languesOnboarding: string[] = fields['langues_guides'] ?? fields['langues'] ?? [];
    if (
      languesOnboarding.length > 0 &&
      dto.details &&
      Array.isArray((dto.details as any)['langues'])
    ) {
      const languesOffre: string[] = (dto.details as any)['langues'];
      const invalid = languesOffre.filter((l) => !languesOnboarding.includes(l));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Langues non déclarées : ${invalid.join(', ')}. Votre profil déclare uniquement : ${languesOnboarding.join(', ')}.`,
        );
      }
    }
  }

  private async findOrFail(id: string): Promise<Offer> {
    const offer = await this.repo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    return offer;
  }
}
