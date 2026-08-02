import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Collaboration } from './entities/collaboration.entity';
import { CollaborationStatus } from '../common/enums/collaboration-status.enum';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { NotificationService } from '../notification/notification.service';
import { Offer } from '../offer/entities/offer.entity';
import { Guide } from '../guide/entities/guide.entity';
import { GuideAvailabilitySlot } from '../guide/entities/guide-availability.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Organization } from '../organization/entities/organization.entity';
import { SlotLike, overlappingDays, dispoEqual, toSlotType } from '../shared/slot.utils';

const SECTION_LABEL: Record<string, string> = {
  hebergement: 'Hébergement',
  restauration: 'Restauration',
  transport: 'Transport',
  activite: 'Activité',
  atelier: 'Atelier',
  guide: 'Guidage',
  guide_touristique: 'Guidage touristique',
  guide_tour: 'Guidage touristique',
  randonnee: 'Randonnée',
  visite_culturelle: 'Visite culturelle',
  accompagnement: 'Accompagnement',
  photographie: 'Photographie',
  gastronomie: 'Gastronomie',
  bien_etre: 'Bien-être',
  autre: 'Autre',
};

/**
 * Normalise un champ tableau (dates / days_of_week) reçu du front :
 * - string vide ou tableau vide → null
 * - valeur simple → tableau d'une valeur
 * - tableau de strings → filtré, dédupliqué
 */
function normalizeArrayField(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    const clean = value
      .map((v) => String(v).trim())
      .filter(Boolean);
    return clean.length ? Array.from(new Set(clean)) : null;
  }
  if (typeof value === 'string') {
    const clean = value.trim();
    return clean.length ? [clean] : null;
  }
  return null;
}

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(Collaboration)
    private readonly repo: Repository<Collaboration>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(GuideAvailabilitySlot)
    private readonly availRepo: Repository<GuideAvailabilitySlot>,
    private readonly notificationService: NotificationService,
  ) {}

  /* ──────────────────── INVITER (bidirectionnel) ──────────── */
  // L'inviteur peut être un provider OU un guide (auteur de l'offre).
  // L'invité peut être un guide OU un provider.
  async create(inviterId: string, dto: CreateCollaborationDto) {
    const inviteeId = dto.invited_user_id ?? dto.guide_id;
    if (!inviteeId)
      throw new BadRequestException("Vous devez préciser l'invité.");
    if (inviterId === inviteeId)
      throw new BadRequestException('Vous ne pouvez pas vous inviter vous-même.');

    const offer = await this.offerRepo.findOne({ where: { id: dto.offer_id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    if (offer.author_id !== inviterId)
      throw new ForbiddenException(
        "Vous n'êtes pas l'auteur de cette offre.",
      );

    const invitedType = dto.invited_user_type ?? 'guide';
    // Prix du guide récupéré automatiquement depuis son offering (par zone)
    const seedContribution =
      invitedType === 'guide' && dto.guide_price != null
        ? {
            price: dto.guide_price,
            applied_price: dto.guide_price,
            suggested_price: dto.guide_price,
            currency: 'TND',
            auto_recovered: true,
          }
        : null;
    let invitedName = dto.invited_user_name ?? null;
    if (!invitedName) {
      if (invitedType === 'guide') {
        const g = await this.guideRepo.findOne({ where: { user_id: inviteeId } });
        invitedName = g?.full_name ?? null;
      } else {
        const p = await this.providerRepo.findOne({ where: { user_id: inviteeId } });
        invitedName = p?.full_name ?? null;
      }
    }

    // Détecter les vrais doublons (pending/accepted/completed) mais permettre la réinvitation après refus
    const existing = await this.repo.findOne({
      where: {
        offer_id: dto.offer_id,
        invited_user_id: inviteeId,
        section: dto.section,
      },
    });

    if (existing) {
      if (existing.status !== CollaborationStatus.DECLINED) {
        // déjà en cours — ne pas dupliquer
        return existing;
      }
      existing.status = CollaborationStatus.PENDING;
      existing.message = dto.message ?? null;
      existing.contribution = seedContribution;
      existing.decline_reason = null;
      existing.invited_user_type = invitedType;
      existing.invited_user_name = invitedName;
      existing.invited_user_id = inviteeId;
      if (invitedType === 'guide') existing.guide_id = inviteeId;
      const saved = await this.repo.save(existing);
      await this.notifyInvite(saved, offer, inviterId, dto.message);
      return saved;
    }

    const collab = this.repo.create({
      provider_id: inviterId, // le champ reste "auteur/inviteur" pour compat circuit/legacy
      guide_id: invitedType === 'guide' ? inviteeId : (await this.guideRepo.findOne({ where: { user_id: inviterId } }))?.user_id ?? inviterId,
      offer_id: dto.offer_id,
      section: dto.section,
      message: dto.message ?? null,
      status: CollaborationStatus.PENDING,
      contribution: seedContribution ?? undefined,
      invited_user_id: inviteeId,
      invited_user_type: invitedType,
      invited_user_name: invitedName,
    });

    const saved = await this.repo.save(collab);
    await this.notifyInvite(saved, offer, inviterId, dto.message);
    return saved;
  }

  private async notifyInvite(
    collab: Collaboration,
    offer: Offer,
    inviterId: string,
    message?: string | null,
  ) {
    const inviterType = await this.resolveUserType(inviterId);
    const inviterName =
      inviterType === 'guide'
        ? (await this.guideRepo.findOne({ where: { user_id: inviterId } }))?.full_name
        : (await this.providerRepo.findOne({ where: { user_id: inviterId } }))?.full_name;

    await this.notificationService.create(collab.invited_user_id!, 'collaboration_invite', {
      offer_id: offer.id,
      offer_title: offer.title ?? offer.id,
      inviter_name: inviterName ?? 'Un organisateur',
      section: collab.section,
      message: message ?? null,
      collab_id: collab.id,
    });
  }

  private async resolveUserType(userId: string): Promise<'guide' | 'provider'> {
    const g = await this.guideRepo.findOne({ where: { user_id: userId } });
    if (g) return 'guide';
    return 'provider';
  }

  /* ──────────────────── INVITÉ : répondre ─────────────────── */
  async respond(
    collaborationId: string,
    userId: string,
    accept: boolean,
    declineReason?: string,
  ) {
    const collab = await this.repo.findOneOrFail({
      where: { id: collaborationId },
    });

    const isInvitee =
      collab.invited_user_id === userId || collab.guide_id === userId;
    if (!isInvitee)
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à répondre à cette invitation.",
      );

    if (collab.status !== CollaborationStatus.PENDING)
      throw new BadRequestException('Cette invitation a déjà été traitée.');

    const offer = collab.offer_id
      ? await this.offerRepo.findOne({ where: { id: collab.offer_id } })
      : null;
    const offerTitle = offer?.title ?? 'une offre';

    // Conflit d'agenda si le collaborateur accepte
    if (accept && offer?.disponibilite) {
      const dispo = offer.disponibilite as SlotLike;
      if (dispo?.type) {
        const existingSlots = await this.availRepo.find({
          where: { guide_id: userId },
        });
        for (const existing of existingSlots) {
          const days = overlappingDays(dispo, existing as SlotLike);
          if (days.length > 0) {
            throw new ConflictException({
              message: "Conflit d'agenda détecté",
              conflictingSlot: { label: existing.label ?? existing.type, days },
            });
          }
        }
        // Aucun conflit → ajouter automatiquement le créneau à l'agenda
        await this.availRepo.save(
          this.availRepo.create({
            guide_id: userId,
            type: toSlotType(dispo.type),
            dates: normalizeArrayField(dispo.dates),
            start_date: dispo.start_date ?? null,
            end_date: dispo.end_date ?? null,
            days_of_week: normalizeArrayField(dispo.days_of_week),
            label: `[Collab] ${offerTitle} — ${collab.section}`,
            time_slots: dispo.time_slots ?? null,
          }),
        );
      }
    }

    if (accept) {
      collab.status = CollaborationStatus.ACCEPTED;
      collab.responded_at = new Date();
      collab.decline_reason = null;
    } else {
      collab.status = CollaborationStatus.DECLINED;
      collab.decline_reason = declineReason ?? null;
      collab.responded_at = new Date();
    }
    const saved = await this.repo.save(collab);

    const invitedName = collab.invited_user_name ?? collab.invited_user_id ?? 'Le collaborateur';
    await this.notificationService.create(collab.provider_id, accept ? 'collab_accepted' : 'collab_declined', {
      collab_id: collab.id,
      offer_id: collab.offer_id,
      offer_title: offerTitle,
      section: collab.section,
      invited_user_name: invitedName,
    });

    return saved;
  }

  /* ──────────────────── INVITÉ : contribution ─────────────── */
  async updateContribution(
    collaborationId: string,
    userId: string,
    dto: UpdateContributionDto,
  ) {
    const collab = await this.repo.findOneOrFail({
      where: { id: collaborationId },
    });

    const isInvitee =
      collab.invited_user_id === userId || collab.guide_id === userId;
    if (!isInvitee)
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cette contribution.",
      );

    if (
      collab.status !== CollaborationStatus.ACCEPTED &&
      collab.status !== CollaborationStatus.COMPLETED
    )
      throw new BadRequestException(
        'Vous devez accepter l\'invitation avant de contribuer.',
      );

    // Bloquer toute modification si l'offre est déjà publiée
    const offer = collab.offer_id
      ? await this.offerRepo.findOne({ where: { id: collab.offer_id } })
      : null;
    if (offer?.status === 'approved') {
      throw new BadRequestException(
        'Cette offre est publiée. Votre contribution ne peut plus être modifiée.',
      );
    }

    collab.contribution = {
      ...(collab.contribution ?? {}),
      ...(dto.contribution ?? {}),
    };

    if (dto.contribution?.confirmed) {
      collab.status = CollaborationStatus.COMPLETED;
      collab.completed_at = new Date();

      await this.propagateContributionToOffer(collab, offer);

      await this.notificationService.create(collab.provider_id, 'collaboration_completed', {
        collab_id: collab.id,
        offer_id: collab.offer_id,
        offer_title: offer?.title ?? 'une offre',
        section: collab.section,
        invited_user_name: collab.invited_user_name ?? 'Le collaborateur',
      });

      // Si tous les collaborateurs actifs (non-refusés) ont terminé → "attente_publication"
      if (collab.offer_id) {
        const allCollabs = await this.repo.find({
          where: { offer_id: collab.offer_id },
        });
        const activeCollabs = allCollabs.filter(
          (c) => c.status !== CollaborationStatus.DECLINED,
        );
        const allCompleted =
          activeCollabs.length > 0 &&
          activeCollabs.every(
            (c) => c.status === CollaborationStatus.COMPLETED,
          );
        if (allCompleted) {
          await this.offerRepo.update(
            { id: collab.offer_id },
            { status: 'attente_publication' } as any,
          );
        }
      }
    }

    return this.repo.save(collab);
  }

  /** Propage la contribution d'un collaborateur dans offer.details (sections service) */
  private async propagateContributionToOffer(
    collab: Collaboration,
    offer: Offer | null,
  ): Promise<void> {
    if (!offer || !collab.offer_id) return;
    const SERVICE_SECTIONS = [
      'restauration',
      'transport',
      'hebergement',
      'autre_service',
    ];
    if (!SERVICE_SECTIONS.includes(collab.section)) return;

    const data = (collab.contribution ?? {}) as Record<string, any>;
    const details: Record<string, any> = {
      ...((offer as any).details ?? {}),
    };
    if (data.types) {
      details[`${collab.section}_types`] = data.types;
    }
    if (data.svcs) {
      details[`${collab.section}_svcs`] = {
        ...((details[`${collab.section}_svcs`] as Record<string, any>) ?? {}),
        ...(data.svcs as Record<string, any>),
      };
    }
    if (data.formData && typeof data.formData === 'object') {
      Object.assign(details, data.formData as Record<string, any>);
    }
    await this.offerRepo.update({ id: collab.offer_id }, { details } as any);
  }

  /** Nettoie les clés de section d'un collaborateur dans offer.details (format PrestSubBlock flat keys) */
  private cleanSectionFromDetails(
    details: Record<string, any>,
    section: string,
  ): void {
    delete details[`${section}_types`];
    delete details[`${section}_svcs`];
    if (section === 'transport') {
      delete details.transport_eco_sous_type;
      delete details.transport_eco_details;
      delete details.transport_std_sous_type;
      delete details.transport_std_details;
    } else if (section === 'restauration') {
      delete details.restauration_mode;
      delete details.restauration_gastro_expertise;
      delete details.restauration_gastro_details;
      delete details.restauration_prest_sous_type;
      delete details.restauration_prest_details;
    } else if (section === 'hebergement') {
      delete details.hebergement_prest_sous_type;
      delete details.hebergement_prest_details;
    } else if (section === 'autre_service') {
      delete details.autre_service_sous_type;
      delete details.autre_service_details;
    }
  }

  /* ──────────────────── INVITEUR : annuler / retirer ──────── */
  async cancel(collaborationId: string, inviterId: string) {
    const collab = await this.repo.findOneOrFail({
      where: { id: collaborationId },
    });

    if (collab.provider_id !== inviterId)
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à annuler cette invitation.",
      );

    if (
      collab.status !== CollaborationStatus.PENDING &&
      collab.status !== CollaborationStatus.ACCEPTED
    )
      throw new BadRequestException(
        'Vous ne pouvez annuler que les invitations en attente ou acceptées.',
      );

    collab.status = CollaborationStatus.CANCELLED;
    return this.repo.save(collab);
  }

  /** Retire un collaborateur (kick) — l'inviteur retire une contribution active */
  async kick(collaborationId: string, inviterId: string) {
    const collab = await this.repo.findOneOrFail({
      where: { id: collaborationId },
    });
    if (collab.provider_id !== inviterId)
      throw new ForbiddenException("Vous n'êtes pas autorisé à retirer ce collaborateur.");
    if (collab.status !== CollaborationStatus.ACCEPTED && collab.status !== CollaborationStatus.COMPLETED)
      throw new BadRequestException('Ce collaborateur ne contribue pas activement.');

    const offer = collab.offer_id
      ? await this.offerRepo.findOne({ where: { id: collab.offer_id } })
      : null;
    if (offer?.status === 'approved') {
      throw new BadRequestException(
        'Cette offre est publiée. Les collaborations ne peuvent plus être modifiées.',
      );
    }

    const section = collab.section;
    // Nettoyer les données de la section dans l'offre si le collab avait déjà contribué
    if (offer && ['accepted', 'completed'].includes(collab.status)) {
      const SERVICE_SECTIONS = ['restauration', 'transport', 'hebergement', 'autre_service'];
      if (SERVICE_SECTIONS.includes(section)) {
        const details: Record<string, any> = { ...((offer as any).details ?? {}) };
        this.cleanSectionFromDetails(details, section);
        await this.offerRepo.update({ id: collab.offer_id! }, { details } as any);
      }
      // Repasser l'offre en draft si elle était en attente de publication
      if (['approved', 'attente_publication'].includes(offer.status)) {
        await this.offerRepo.update({ id: collab.offer_id! }, { status: 'draft' } as any);
      }
    }

    const offerTitle = offer?.title ?? 'une offre';
    const existingContribution = (collab.contribution ?? {}) as Record<string, any>;
    collab.status = CollaborationStatus.DECLINED;
    collab.contribution = {
      ...existingContribution,
      kicked: true,
      offer_title: offerTitle,
    } as any;
    collab.completed_at = null;
    collab.responded_at = new Date();
    const saved = await this.repo.save(collab);

    // Supprimer le créneau agenda du collaborateur retiré
    const kickedUserId = collab.invited_user_id;
    if (kickedUserId) {
      const agendaLabel = `[Collab] ${offerTitle} — ${section}`;
      const agendaSlots = await this.availRepo.find({
        where: { guide_id: kickedUserId, label: agendaLabel },
      });
      if (agendaSlots.length) await this.availRepo.remove(agendaSlots);
      if (collab.offer_id) {
        await this.notificationService.deleteForOffer(kickedUserId, 'offer_schedule_conflict', collab.offer_id).catch(() => {});
        await this.notificationService.deleteForOffer(kickedUserId, 'offer_schedule_changed', collab.offer_id).catch(() => {});
      }
    }

    await this.notificationService.create(collab.invited_user_id!, 'collab_kicked', {
      collab_id: collab.id,
      offer_id: collab.offer_id,
      offer_title: offerTitle,
      section,
      message: `Vous avez été retiré de la collaboration pour la section « ${section} » de l'offre « ${offerTitle} » par son propriétaire.`,
    });
    return saved;
  }

  /** INVITÉ : quitter la collaboration (withdraw) */
  async withdrawContribution(userId: string, collabId: string): Promise<void> {
    const collab = await this.repo.findOne({
      where: { id: collabId, invited_user_id: userId },
    });
    if (!collab) throw new NotFoundException('Invitation introuvable');
    if (!['accepted', 'completed'].includes(collab.status))
      throw new BadRequestException('Impossible de quitter cette collaboration');

    const offer = collab.offer_id
      ? await this.offerRepo.findOne({ where: { id: collab.offer_id } })
      : null;

    // Bloquer si l'offre est déjà publiée — le collaborateur ne peut plus quitter
    if (offer?.status === 'approved') {
      throw new BadRequestException(
        "Cette offre est déjà publiée. Vous ne pouvez plus quitter la collaboration. Contactez le propriétaire de l'offre.",
      );
    }

    const section = collab.section;
    // Quitter la collaboration : effacer les données et passer à "declined"
    collab.contribution = null;
    collab.status = CollaborationStatus.DECLINED;
    collab.completed_at = null;
    collab.responded_at = new Date();
    await this.repo.save(collab);

    // Nettoyer les données de la section dans offer.details
    if (offer) {
      const SERVICE_SECTIONS = ['restauration', 'transport', 'hebergement', 'autre_service'];
      if (SERVICE_SECTIONS.includes(section)) {
        const details: Record<string, any> = { ...((offer as any).details ?? {}) };
        this.cleanSectionFromDetails(details, section);
        await this.offerRepo.update({ id: collab.offer_id! }, { details } as any);
      }
      // Repasser l'offre en "draft" si elle était publiée ou en attente de publication
      if (['approved', 'attente_publication'].includes(offer.status)) {
        await this.offerRepo.update({ id: collab.offer_id! }, { status: 'draft' } as any);
      }
    }

    // Supprimer le créneau agenda créé lors de l'acceptation
    const agendaLabel = `[Collab] ${offer?.title ?? ''} — ${section}`;
    const agendaSlots = await this.availRepo.find({ where: { guide_id: userId, label: agendaLabel } });
    if (agendaSlots.length) await this.availRepo.remove(agendaSlots);
    // Nettoyer les notifications de conflit et de changement d'horaire liées à cette offre
    if (collab.offer_id) {
      await this.notificationService.deleteForOffer(userId, 'offer_schedule_conflict', collab.offer_id).catch(() => {});
      await this.notificationService.deleteForOffer(userId, 'offer_schedule_changed', collab.offer_id).catch(() => {});
    }

    // Notifier le propriétaire de l'offre que le collaborateur a quitté
    await this.notificationService.create(collab.provider_id, 'collab_quit', {
      collab_id: collab.id,
      offer_id: collab.offer_id,
      offer_title: offer?.title ?? 'votre offre',
      section,
      invited_user_name: collab.invited_user_name,
      message: `${collab.invited_user_name} a quitté la collaboration pour la section ${section} de "${offer?.title ?? 'votre offre'}".`,
    });
  }

  /** Quitter une collaboration en supprimant le créneau agenda "[Collab] …" */
  async leaveCollabBySlotLabel(userId: string, slotLabel: string): Promise<void> {
    const match = slotLabel.match(/^\[Collab\]\s+(.+?)\s+[—–-]\s+(\w+)$/);
    if (!match) throw new BadRequestException('Label de créneau invalide');
    const offerTitle = match[1].trim();
    const section = match[2].trim();

    // Supprimer immédiatement le créneau (objectif principal de l'utilisateur)
    const directSlots = await this.availRepo.find({
      where: { guide_id: userId, label: slotLabel },
    });
    if (directSlots.length) await this.availRepo.remove(directSlots);

    // Best-effort : retrouver la collaboration correspondante et la nettoyer
    const collabs = await this.repo.find({
      where: { invited_user_id: userId, section },
    });
    const active = collabs.filter((c) =>
      ['accepted', 'completed'].includes(c.status),
    );
    if (!active.length) return;

    let target: Collaboration | null = null;
    for (const c of active) {
      const offer = c.offer_id
        ? await this.offerRepo.findOne({ where: { id: c.offer_id } })
        : null;
      if (offer?.title === offerTitle) {
        target = c;
        break;
      }
    }
    if (!target && active.length === 1) target = active[0];
    if (!target) return;

    await this.withdrawContribution(userId, target.id);
  }

  /** Supprimer une collaboration (invité pour pending/declined, auteur pour tout) */
  async dismissCollaboration(userId: string, collabId: string): Promise<void> {
    let collab = await this.repo.findOne({
      where: { id: collabId, invited_user_id: userId },
    });
    let isOfferAuthor = false;
    if (!collab) {
      collab = await this.repo.findOne({ where: { id: collabId } });
      if (!collab) throw new NotFoundException('Invitation introuvable');
      const offer = collab.offer_id
        ? await this.offerRepo.findOne({ where: { id: collab.offer_id, author_id: userId } })
        : null;
      if (!offer) throw new NotFoundException('Invitation introuvable ou accès non autorisé');
      isOfferAuthor = true;
    }

    const status = collab.status;
    const offerForCheck = collab.offer_id
      ? await this.offerRepo.findOne({ where: { id: collab.offer_id } })
      : null;
    if (offerForCheck?.status === 'approved') {
      throw new BadRequestException(
        'Cette offre est publiée. Les collaborations ne peuvent plus être modifiées.',
      );
    }

    // Si le collab avait déjà contribué (accepted/completed), nettoyer ses données dans offer.details
    if (['accepted', 'completed'].includes(status) && offerForCheck) {
      const section = collab.section;
      const SERVICE_SECTIONS = ['restauration', 'transport', 'hebergement', 'autre_service'];
      if (SERVICE_SECTIONS.includes(section)) {
        const details: Record<string, any> = { ...((offerForCheck as any).details ?? {}) };
        this.cleanSectionFromDetails(details, section);
        await this.offerRepo.update({ id: collab.offer_id! }, { details } as any);
      }
      if (['approved', 'attente_publication'].includes(offerForCheck.status)) {
        await this.offerRepo.update({ id: collab.offer_id! }, { status: 'draft' } as any);
      }
    }

    // Seul le collab invité peut supprimer une invitation pending (l'auteur peut tout supprimer)
    if (!isOfferAuthor && !['pending', 'declined'].includes(status)) {
      throw new BadRequestException('Utilisez /withdraw pour quitter une collaboration acceptée');
    }

    await this.repo.delete({ id: collabId });
  }

  /* ──────────────────── GETTERS ───────────────────────────── */
  async findByProvider(providerId: string) {
    return this.enrichList(
      await this.repo.find({
        where: [
          { provider_id: providerId },
          { invited_user_id: providerId, invited_user_type: 'provider' },
        ],
        relations: ['guide', 'offer'],
        order: { created_at: 'DESC' },
      }),
    );
  }

  async findByGuide(guideId: string) {
    return this.enrichList(
      await this.repo.find({
        where: [
          { guide_id: guideId },
          { invited_user_id: guideId, invited_user_type: 'guide' },
        ],
        relations: ['provider', 'offer'],
        order: { created_at: 'DESC' },
      }),
    );
  }

  /** Enrichit les collaborations avec le titre/statut de l'offre (résout offer_deleted / collab_kicked) */
  private async enrichList(collabs: Collaboration[]) {
    return Promise.all(
      collabs.map(async (c) => {
        const offer = c.offer_id
          ? await this.offerRepo.findOne({ where: { id: c.offer_id } })
          : null;
        const contrib = (c.contribution ?? {}) as Record<string, any>;
        const isOfferDeleted = contrib.offer_deleted === true;
        const isKicked = contrib.kicked === true;
        const images: string[] | null = offer?.images ?? null;
        const cover =
          Array.isArray(images) && images.length > 0
            ? images[0]
            : (contrib.offer_cover ?? null);
        let offerStatus: string | null;
        if (isOfferDeleted) offerStatus = 'offer_deleted';
        else if (isKicked) offerStatus = 'collab_kicked';
        else offerStatus = offer?.status ?? null;
        return {
          ...c,
          offer_title: offer?.title ?? contrib.offer_title ?? 'Offre supprimée',
          offer_description: offer?.description ?? contrib.offer_description ?? null,
          offer_cover: cover,
          offer_status: offerStatus,
          guide_id: offer?.author_id ?? null,
        };
      }),
    );
  }

  async findByOffer(offerId: string) {
    const all = await this.repo.find({
      where: { offer_id: offerId },
      relations: ['guide', 'provider'],
      order: { created_at: 'ASC' },
    });
    // Exclure les collabs retirés (kicked) — ils restent en base pour l'historique du collaborateur
    return all.filter(
      (c) =>
        !(
          c.status === CollaborationStatus.DECLINED &&
          (c.contribution as any)?.kicked === true
        ),
    );
  }

  async getOfferForCollaborator(userId: string, offerId: string) {
    const offer = await this.offerRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offre introuvable');
    const isAuthor = offer.author_id === userId;
    const isInvited = await this.repo.findOne({
      where: { offer_id: offerId, invited_user_id: userId },
    });
    if (!isAuthor && !isInvited)
      throw new NotFoundException('Accès non autorisé');

    // Enrichir les details avec les collaborateurs réels (depuis la table collab, sans les kicked)
    const allCollabs = await this.repo.find({ where: { offer_id: offerId } });
    const collabs = allCollabs.filter(
      (c) =>
        !(
          c.status === CollaborationStatus.DECLINED &&
          (c.contribution as any)?.kicked === true
        ),
    );
    if (collabs.length > 0) {
      const collaborators = collabs.map((c) => ({
        id: c.invited_user_id,
        name: c.invited_user_name ?? c.invited_user_id,
        section: c.section,
        status: c.status,
      }));
      const existingDetails = ((offer as any).details ?? {}) as Record<string, any>;
      (offer as any).details = { ...existingDetails, collaborators };
    }
    return offer;
  }

  /** Recherche de collaborateurs (guides + prestataires) pour l'invitation */
  async searchCollaborators(
    query: string,
    excludeUserId?: string,
    section?: string,
    mode?: string,
  ): Promise<
    { user_id: string; name: string; photo?: string; type: string; subtitle?: string }[]
  > {
    const q = query.trim();
    if (q.length < 2) return [];
    const pattern = `%${q.toLowerCase()}%`;

    // mode = "guide" → guides seulement
    // mode = "provider" → prestataires seulement (sans filtre de catégorie)
    // mode = slug de catégorie (ex: "restaurant_terroir", "eco_tour") → prestataires de cette catégorie
    // mode absent → utiliser les catégories par défaut de la section (transport, hebergement)
    const SECTION_DEFAULTS: Record<string, string[]> = {
      transport: ['transport_eco', 'transport'],
      hebergement: ['hebergement'],
    };
    const onlyGuides = mode === 'guide';
    const providersOnly = mode === 'provider';
    let sectionCats: string[] = [];
    if (!onlyGuides && !providersOnly) {
      if (mode && mode !== 'guide') {
        sectionCats = [mode];
      } else if (!mode && section) {
        sectionCats = SECTION_DEFAULTS[section] ?? [];
      }
    }
    const onlyProviders = providersOnly || sectionCats.length > 0;

    // Guides
    const guideResults: {
      user_id: string;
      name: string;
      photo?: string;
      type: 'guide';
      subtitle?: string;
    }[] = [];
    if (!onlyProviders) {
      const guidesQb = this.guideRepo
        .createQueryBuilder('g')
        .where('LOWER(g.full_name) LIKE :q', { q: pattern })
        .select(['g.user_id', 'g.full_name', 'g.photo', 'g.zone', 'g.guide_type'])
        .limit(10);
      if (excludeUserId) guidesQb.andWhere('g.user_id != :ex', { ex: excludeUserId });
      const guides = await guidesQb.getMany();
      guideResults.push(
        ...guides.map((g) => ({
          user_id: g.user_id,
          name: g.full_name,
          photo: g.photo ?? undefined,
          type: 'guide' as const,
          subtitle: g.guide_type ?? g.zone ?? 'Guide',
        })),
      );
    }

    // Prestataires
    const providerMap = new Map<
      string,
      { user_id: string; name: string; photo?: string; type: 'provider'; subtitle?: string }
    >();
    if (!onlyGuides) {
      const orgsQb = this.orgRepo
        .createQueryBuilder('o')
        .leftJoin('providers', 'p', 'p.user_id = o.provider_id')
        .where('LOWER(o.name) LIKE :q', { q: pattern })
        .select(['o.provider_id', 'o.name', 'o.logo', 'o.provider_type', 'o.region'])
        .limit(10);
      if (excludeUserId) orgsQb.andWhere('o.provider_id != :ex', { ex: excludeUserId });
      if (sectionCats.length > 0) {
        const conditions = sectionCats
          .map(
            (_, i) =>
              `(o.provider_type = :ocat${i} OR p.activity_types LIKE :pcat${i} OR p.secondary_activity_types LIKE :pcat${i})`,
          )
          .join(' OR ');
        const params = {
          ...Object.fromEntries(sectionCats.map((cat, i) => [`ocat${i}`, cat])),
          ...Object.fromEntries(
            sectionCats.map((cat, i) => [`pcat${i}`, `%${cat}%`]),
          ),
        };
        orgsQb.andWhere(`(${conditions})`, params);
      }
      const orgs = await orgsQb.getMany();

      const providersQb = this.providerRepo
        .createQueryBuilder('p')
        .leftJoin('organizations', 'o', 'o.provider_id = p.user_id')
        .where('p.full_name IS NOT NULL')
        .andWhere('LOWER(p.full_name) LIKE :q', { q: pattern })
        .select(['p.user_id', 'p.full_name', 'p.photo'])
        .limit(10);
      if (excludeUserId) providersQb.andWhere('p.user_id != :ex', { ex: excludeUserId });
      if (sectionCats.length > 0) {
        const conditions = sectionCats
          .map(
            (_, i) =>
              `(p.activity_types LIKE :pcat${i} OR p.secondary_activity_types LIKE :pcat${i} OR o.provider_type = :ocat${i})`,
          )
          .join(' OR ');
        const params = {
          ...Object.fromEntries(
            sectionCats.map((cat, i) => [`pcat${i}`, `%${cat}%`]),
          ),
          ...Object.fromEntries(sectionCats.map((cat, i) => [`ocat${i}`, cat])),
        };
        providersQb.andWhere(`(${conditions})`, params);
      }
      const providers = await providersQb.getMany();

      for (const o of orgs) {
        providerMap.set(o.provider_id, {
          user_id: o.provider_id,
          name: o.name,
          photo: o.logo ?? undefined,
          type: 'provider',
          subtitle: o.provider_type ?? o.region ?? 'Prestataire',
        });
      }
      for (const p of providers) {
        if (!providerMap.has(p.user_id)) {
          providerMap.set(p.user_id, {
            user_id: p.user_id,
            name: p.full_name ?? '',
            photo: p.photo ?? undefined,
            type: 'provider',
            subtitle: 'Prestataire',
          });
        }
      }
    }

    return [...guideResults, ...Array.from(providerMap.values())].slice(0, 15);
  }

  async findOne(id: string) {
    const collab = await this.repo.findOne({
      where: { id },
      relations: ['guide', 'provider', 'offer'],
    });
    if (!collab) throw new NotFoundException('Collaboration introuvable.');
    return collab;
  }

  async getStats(providerId: string) {
    const all = await this.repo.find({
      where: { provider_id: providerId },
    });
    return {
      total: all.length,
      pending: all.filter((c) => c.status === CollaborationStatus.PENDING)
        .length,
      accepted: all.filter((c) => c.status === CollaborationStatus.ACCEPTED)
        .length,
      completed: all.filter((c) => c.status === CollaborationStatus.COMPLETED)
        .length,
      declined: all.filter((c) => c.status === CollaborationStatus.DECLINED)
        .length,
      cancelled: all.filter((c) => c.status === CollaborationStatus.CANCELLED)
        .length,
    };
  }

  /* ──────────────────── PUBLICATION (fusion) ───────────────── */
  // Fusion des deux flux :
  //  - publish_ready + final_price (moi) : toutes les collaborations actives sont terminées
  //  - statut attente_publication → approved (Maram) : publication explicite par l'auteur
  async confirmPublish(
    offerId: string,
    inviterId: string,
    finalPrice?: number,
  ) {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations: ['category'],
    });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    if (offer.author_id !== inviterId)
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à publier cette offre.",
      );

    const needsGuide =
      offer.requires_guide_override === true ||
      (offer.requires_guide_override === null &&
        offer.category?.requires_guide === true);

    if (needsGuide) {
      const all = await this.repo.find({ where: { offer_id: offerId } });
      const active = all.filter((c) => c.status !== CollaborationStatus.DECLINED);
      const pending = all.filter((c) =>
        c.status === CollaborationStatus.PENDING ||
        c.status === CollaborationStatus.ACCEPTED,
      ).length;
      if (pending > 0) {
        throw new BadRequestException(
          `Il reste ${pending} collaboration(s) en attente ou acceptée(s). Toutes les collaborations doivent être complétées ou refusées avant de pouvoir publier.`,
        );
      }
    }

    // Calcul du prix final = base + somme des prix appliqués des contributions complétées
    const completed = await this.repo.find({
      where: { offer_id: offerId, status: CollaborationStatus.COMPLETED },
    });
    const base = Number(offer.price ?? 0);
    const appliedSum = completed.reduce(
      (sum, c) => sum + Number(c.contribution?.applied_price ?? c.contribution?.price ?? 0),
      0,
    );
    const computedFinal = finalPrice ?? (completed.length > 0 ? base + appliedSum : base);

    if (computedFinal != null) {
      offer.price = computedFinal;
      offer.final_price = computedFinal;
    }
    offer.publish_ready = true;
    offer.status = 'attente_publication';
    await this.offerRepo.save(offer);

    for (const c of completed) {
      await this.notificationService.create(c.invited_user_id!, 'collaboration_completed', {
        offer_id: offerId,
        offer_title: offer.title ?? 'une offre',
        section: c.section,
        invited_user_name: c.invited_user_name ?? 'Le collaborateur',
      });
    }

    return offer;
  }

  /** Publication finale : attente_publication → approved */
  async publishOffer(offerId: string, authorId: string) {
    const offer = await this.offerRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    if (offer.author_id !== authorId)
      throw new ForbiddenException("Vous n'êtes pas autorisé à publier cette offre.");
    if (offer.status !== 'attente_publication')
      throw new BadRequestException("L'offre n'est pas en attente de publication.");

    // Injection des collaborateurs dans les details (visible côté voyageur)
    const collabs = await this.repo.find({ where: { offer_id: offerId } });
    const collaborators = collabs
      .filter((c) => c.status === CollaborationStatus.COMPLETED)
      .map((c) => ({
        id: c.invited_user_id ?? c.guide_id,
        name: c.invited_user_name ?? c.guide?.full_name ?? 'Collaborateur',
        section: c.section,
      }));

    offer.status = 'approved';
    (offer as any).details = {
      ...(((offer as any).details as Record<string, any>) ?? {}),
      collaborators,
    };
    await this.offerRepo.save(offer);
    return offer;
  }

  /* ──────────────────── PROVIDER: update offer price ───────── */
  async updateOfferPrice(
    offerId: string,
    providerId: string,
    price: number,
  ) {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
    });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    if (offer.author_id !== providerId)
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier le prix de cette offre.",
      );

    offer.price = price;
    offer.final_price = price;
    return this.offerRepo.save(offer);
  }

  /* ──── PROVIDER: adjust a guide's applied price (margin) ──── */
  async updateAppliedPrice(
    collaborationId: string,
    providerId: string,
    appliedPrice: number,
  ) {
    const collab = await this.repo.findOne({
      where: { id: collaborationId },
      relations: ['provider'],
    });
    if (!collab) throw new NotFoundException('Collaboration introuvable.');

    const offer = collab.offer_id
      ? await this.offerRepo.findOne({ where: { id: collab.offer_id } })
      : null;
    const authorId = offer?.author_id ?? collab.provider_id;
    if (authorId !== providerId)
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier le prix de ce guide.",
      );
    if (offer?.status === 'approved')
      throw new BadRequestException(
        'Cette offre est publiée. Le prix du guide ne peut plus être modifié.',
      );

    const current = (collab.contribution ?? {}) as Record<string, any>;
    collab.contribution = {
      ...current,
      price: current.price ?? appliedPrice,
      suggested_price: current.suggested_price ?? appliedPrice,
      applied_price: appliedPrice,
      currency: current.currency ?? 'TND',
      auto_recovered: current.auto_recovered ?? true,
    };
    return this.repo.save(collab);
  }

  /* ──────────────────── PROVIDER: get offer collab status ──── */
  async getOfferCollabStatus(offerId: string) {
    const all = await this.repo.find({
      where: { offer_id: offerId },
      relations: ['guide'],
    });

    const completed = all.filter(
      (c) => c.status === CollaborationStatus.COMPLETED,
    ).length;
    const total = all.length;
    const pending = all.filter(
      (c) =>
        c.status === CollaborationStatus.PENDING ||
        c.status === CollaborationStatus.ACCEPTED,
    ).length;

    const contributions = all
      .filter(
        (c) =>
          c.status !== CollaborationStatus.DECLINED &&
          c.status !== CollaborationStatus.CANCELLED &&
          c.contribution &&
          (c.contribution?.price != null ||
            c.contribution?.applied_price != null),
      )
      .map((c) => ({
        collab_id: c.id,
        guide_name: c.invited_user_name ?? c.guide?.full_name ?? 'Collaborateur',
        section: c.section,
        status: c.status,
        price: c.contribution?.price ?? null,
        applied_price: c.contribution?.applied_price ?? c.contribution?.price ?? null,
        currency: c.contribution?.currency ?? 'TND',
        services: c.contribution?.services ?? [],
      }));

    return {
      total,
      completed,
      pending,
      all_done: pending === 0 && total > 0,
      contributions,
    };
  }

  /* ──────────────────── AGENDA (Maram) ─────────────────────── */
  async getAvailability(userId: string) {
    // Nettoyer en arrière-plan les notifications de conflit qui ne sont plus valides
    this.syncCollabConflictNotifications(userId).catch(() => {});
    return this.availRepo.find({
      where: { guide_id: userId },
      order: { created_at: 'ASC' },
    });
  }

  async saveAvailabilitySlot(userId: string, dto: any) {
    const slot = this.availRepo.create({
      guide_id: userId,
      type: dto.type,
      dates: normalizeArrayField(dto.dates),
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      days_of_week: normalizeArrayField(dto.days_of_week),
      label: dto.label ?? null,
      time_slots: dto.time_slots ?? null,
    });
    const saved = await this.availRepo.save(slot);
    // Re-vérifier les conflits collab après tout changement de créneau personnel
    await this.syncCollabConflictNotifications(userId).catch(() => {});
    return saved;
  }

  async deleteAvailabilitySlot(userId: string, slotId: string) {
    const slot = await this.availRepo.findOne({
      where: { id: slotId, guide_id: userId },
    });
    if (!slot) throw new NotFoundException('Créneau introuvable.');
    await this.availRepo.remove(slot);
    // Re-vérifier les conflits collab après suppression d'un créneau personnel
    await this.syncCollabConflictNotifications(userId).catch(() => {});
    return { deleted: true };
  }

  /** Re-évalue toutes les notifications de conflit d'agenda du collaborateur.
   *  Si un conflit précédemment signalé n'existe plus (horaires non chevauchants),
   *  la notification est supprimée.
   */
  private async syncCollabConflictNotifications(userId: string): Promise<void> {
    const collabs = await this.repo.find({ where: { invited_user_id: userId } });
    // Traiter tous les collabs non-déclinés : les accepted/completed pour la création de slots,
    // mais aussi les pending pour le nettoyage des vieilles notifications de conflit
    const activeCollabs = collabs.filter(
      (c) => c.status !== CollaborationStatus.DECLINED,
    );

    // Nettoyer les notifications orphelines des collabs déclinés suite à suppression de l'offre
    const deletedOfferCollabs = collabs.filter(
      (c) =>
        c.status === CollaborationStatus.DECLINED &&
        (c.contribution as any)?.offer_deleted === true,
    );
    for (const c of deletedOfferCollabs) {
      const offerId = c.offer_id;
      if (!offerId) continue;
      await this.notificationService.deleteForOffer(userId, 'offer_schedule_conflict', offerId).catch(() => {});
      await this.notificationService.deleteForOffer(userId, 'offer_schedule_changed', offerId).catch(() => {});
    }

    if (!activeCollabs.length) return;

    const currentSlots = await this.availRepo.find({ where: { guide_id: userId } });
    // Seuls les créneaux personnels (pas [Collab] ni [Offre])
    const personalSlots = currentSlots.filter(
      (s) => !(s.label?.startsWith('[Collab]') || s.label?.startsWith('[Offre]')),
    );

    for (const c of activeCollabs) {
      const offerId = c.offer_id;
      if (!offerId) continue;
      const offer = await this.offerRepo.findOne({ where: { id: offerId } });
      if (!offer) {
        // Offre introuvable (supprimée sans mise à jour du statut du collab) → nettoyer les notifications
        await this.notificationService.deleteForOffer(userId, 'offer_schedule_conflict', offerId).catch(() => {});
        await this.notificationService.deleteForOffer(userId, 'offer_schedule_changed', offerId).catch(() => {});
        continue;
      }
      const disponibilite = offer.disponibilite as SlotLike | undefined;
      if (!disponibilite?.type) continue;

      const isDone =
        c.status === CollaborationStatus.ACCEPTED ||
        c.status === CollaborationStatus.COMPLETED;
      const offerTitle = offer.title ?? '';
      const collabLabel = `[Collab] ${offerTitle} — ${c.section}`;

      // S'assurer que le slot collab existe pour les collabs ayant accepté
      // (peut être absent si l'acceptation s'est faite sans disponibilité définie)
      if (isDone) {
        const collabSlotExists = currentSlots.some((s) => s.label === collabLabel);
        if (!collabSlotExists) {
          const newSlot = await this.availRepo.save(
            this.availRepo.create({
              guide_id: userId,
              type: toSlotType(disponibilite.type),
              dates: normalizeArrayField(disponibilite.dates),
              start_date: disponibilite.start_date ?? null,
              end_date: disponibilite.end_date ?? null,
              days_of_week: normalizeArrayField(disponibilite.days_of_week),
              label: collabLabel,
              time_slots: disponibilite.time_slots ?? null,
            }),
          );
          currentSlots.push(newSlot as any);
        }
      }

      let hasConflict = false;
      for (const ps of personalSlots) {
        if (overlappingDays(disponibilite, ps as SlotLike).length > 0) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        // Plus de conflit → supprimer la notification de conflit (pour pending ET accepted)
        await this.notificationService.deleteForOffer(userId, 'offer_schedule_conflict', offerId).catch(() => {});
      }
    }
  }

  /** Sync l'agenda du guide avec la disponibilité d'une offre qu'il possède */
  async updateOfferAvailability(
    userId: string,
    offerId: string,
    disponibilite: SlotLike,
  ): Promise<{ message: string }> {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId, author_id: userId },
    });
    if (!offer) throw new NotFoundException('Offre introuvable ou accès refusé');

    const offerTitle = offer.title ?? '';
    const oldDispo = offer.disponibilite as SlotLike | undefined;
    if (dispoEqual(oldDispo, disponibilite))
      return { message: 'Aucun changement de disponibilité.' };

    // ── Mettre à jour le créneau [Offre] du propriétaire ──
    const ownerLabel = `[Offre] ${offerTitle}`;
    const ownerSlots = await this.availRepo.find({ where: { guide_id: userId, label: ownerLabel } });
    if (ownerSlots.length) await this.availRepo.remove(ownerSlots);
    await this.availRepo.save(this.availRepo.create({
      guide_id: userId,
      type: toSlotType(disponibilite.type),
      dates: normalizeArrayField(disponibilite.dates),
      start_date: disponibilite.start_date ?? null,
      end_date: disponibilite.end_date ?? null,
      days_of_week: normalizeArrayField(disponibilite.days_of_week),
      label: ownerLabel,
      time_slots: disponibilite.time_slots ?? null,
    }));

    // ── Synchroniser les créneaux [Collab] des collaborateurs actifs ──
    const collabs = await this.repo.find({ where: { offer_id: offerId } });
    const activeCollabs = collabs.filter((c) => c.status !== CollaborationStatus.DECLINED);

    for (const c of activeCollabs) {
      const collabLabel = `[Collab] ${offerTitle} — ${c.section}`;
      const collabUserId = c.invited_user_id ?? c.guide_id;
      const hasDoneSlot = ['accepted', 'completed'].includes(c.status);

      const allSlots = await this.availRepo.find({ where: { guide_id: collabUserId } });
      const oldCollabSlots = allSlots.filter((s) => s.label === collabLabel);
      const otherSlots = allSlots.filter((s) => s.label !== collabLabel);

      let conflictInfo: { label: string; days: string[] } | null = null;
      for (const slot of otherSlots) {
        const days = overlappingDays(disponibilite, slot as SlotLike);
        if (days.length > 0) {
          conflictInfo = { label: slot.label ?? slot.type, days };
          break;
        }
      }

      if (hasDoneSlot) {
        if (oldCollabSlots.length) await this.availRepo.remove(oldCollabSlots);
        await this.availRepo.save(this.availRepo.create({
          guide_id: collabUserId,
          type: toSlotType(disponibilite.type),
          dates: normalizeArrayField(disponibilite.dates),
          start_date: disponibilite.start_date ?? null,
          end_date: disponibilite.end_date ?? null,
          days_of_week: normalizeArrayField(disponibilite.days_of_week),
          label: collabLabel,
          time_slots: disponibilite.time_slots ?? null,
        }));
      }

      if (conflictInfo) {
        await this.notificationService.create(collabUserId, 'offer_schedule_conflict', {
          offer_id: offerId, offer_title: offerTitle, section: c.section,
          conflicting_slot: conflictInfo.label, conflict_days: conflictInfo.days,
        });
      } else if (hasDoneSlot) {
        await this.notificationService.create(collabUserId, 'offer_schedule_changed', {
          offer_id: offerId, offer_title: offerTitle, section: c.section,
        });
      } else {
        await this.notificationService.create(collabUserId, 'offer_schedule_changed', {
          offer_id: offerId, offer_title: offerTitle, section: c.section,
        });
      }
    }

    offer.disponibilite = disponibilite as any;
    await this.offerRepo.save(offer);
    return { message: 'Disponibilité mise à jour.' };
  }

  /** Vérifie les conflits d'agenda d'une disponibilité d'offre avec les collaborateurs */
  async checkCollabConflicts(offerId: string, disponibilite: SlotLike) {
    const offer = await this.offerRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offre introuvable');

    const collabs = await this.repo.find({ where: { offer_id: offerId } });
    const activeCollabs = collabs.filter((c) => c.status !== CollaborationStatus.DECLINED);
    const result: {
      userId: string;
      userName: string;
      section: string;
      conflictSlot: string;
      conflictDays: string[];
      conflictTimeSlots: any;
    }[] = [];

    for (const c of activeCollabs) {
      const collabUserId = c.invited_user_id ?? c.guide_id;
      const collabLabel = `[Collab] ${offer.title ?? ''} — ${c.section}`;
      const allSlots = await this.availRepo.find({ where: { guide_id: collabUserId } });
      const otherSlots = allSlots.filter((s) => s.label !== collabLabel);

      for (const slot of otherSlots) {
        const days = overlappingDays(disponibilite, slot as SlotLike);
        if (days.length > 0) {
          result.push({
            userId: collabUserId,
            userName: c.invited_user_name ?? collabUserId,
            section: c.section,
            conflictSlot: slot.label ?? slot.type,
            conflictDays: days,
            conflictTimeSlots: slot.time_slots ?? null,
          });
          break;
        }
      }
    }

    return result;
  }
}
