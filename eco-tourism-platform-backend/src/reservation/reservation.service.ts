import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationParticipant } from './entities/reservation-participant.entity';
import {
  CreateReservationDto,
  CreateGuideReservationDto,
} from './dto/create-reservation.dto';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { OfferItemCapacity } from '../offer/entities/offer-item-capacity.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { GuideOfferingSession } from '../guide/entities/guide-offering-session.entity';
import { NotificationService } from '../notification/notification.service';
import { CapacityDomainService } from '../domain/capacity-domain.service';
import { ReservationDomainService } from '../domain/reservation-domain.service';
import { EcoTravelerService } from '../eco-traveler/eco-traveler.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationParticipant)
    private readonly participantRepo: Repository<ReservationParticipant>,
    @InjectRepository(OfferItemSession)
    private readonly sessionRepo: Repository<OfferItemSession>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(OfferItem)
    private readonly offerItemRepo: Repository<OfferItem>,
    @InjectRepository(OfferItemCapacity)
    private readonly capacityRepo: Repository<OfferItemCapacity>,
    @InjectRepository(GuideOffering)
    private readonly guideOfferingRepo: Repository<GuideOffering>,
    @InjectRepository(GuideOfferingSession)
    private readonly guideSessionRepo: Repository<GuideOfferingSession>,
    private readonly notificationService: NotificationService,
    private readonly capacityService: CapacityDomainService,
    private readonly reservationDomain: ReservationDomainService,
    private readonly ecoTravelerService: EcoTravelerService,
  ) {}

  /**
   * Crée une réservation avec ses participants
   * Génère une référence unique pour le suivi
   */
  async create(
    travelerId: string,
    dto: CreateReservationDto,
  ): Promise<Reservation> {
    let session: OfferItemSession | null = null;
    if (dto.session_id) {
      session = await this.sessionRepo.findOne({
        where: { id: dto.session_id },
      });
      if (!session) throw new NotFoundException('Session introuvable');
      if (session.status === 'full')
        throw new BadRequestException('Cette session est complète');
      if (
        session.remaining_capacity !== null &&
        session.remaining_capacity <= 0
      ) {
        throw new BadRequestException(
          'Plus de places disponibles pour cette session',
        );
      }
    }

    const offer = await this.offerRepo.findOne({ where: { id: dto.offer_id } });
    if (!offer) throw new NotFoundException('Offre introuvable');

    // ── Vérification des délais de réservation ──
    if (dto.offer_item_id && dto.session_id && session) {
      const offerItem = await this.offerItemRepo.findOne({
        where: { id: dto.offer_item_id },
      });
      if (offerItem?.booking_deadline_days != null && session.date) {
        const sessionDate = new Date(session.date);
        const now = new Date();
        const daysUntilSession = Math.ceil(
          (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilSession < offerItem.booking_deadline_days) {
          throw new BadRequestException(
            `La réservation doit être faite au moins ${offerItem.booking_deadline_days} jour(s) avant la session (plus que ${daysUntilSession} jour(s))`,
          );
        }
      }
    }

    // ── Vérification de la capacité via CapacityDomainService ──
    if (dto.offer_item_id) {
      const sessionDate = session?.date ?? null;
      const participantCount = dto.participants?.length ?? 1;
      const available = await this.capacityService.checkAvailability(
        dto.offer_item_id,
        sessionDate,
        participantCount,
      );
      if (!available) {
        throw new BadRequestException(
          'Capacité insuffisante pour cette prestation',
        );
      }
    }

    // ── Vérification min/max participants ──
    const participantCount = dto.participants?.length ?? 1;
    if (offer.min_group_size && participantCount < offer.min_group_size) {
      throw new BadRequestException(
        `Minimum ${offer.min_group_size} participant(s) requis pour cette offre`,
      );
    }
    if (offer.max_group_size && participantCount > offer.max_group_size) {
      throw new BadRequestException(
        `Maximum ${offer.max_group_size} participant(s) autorisé(s) pour cette offre`,
      );
    }

    // ── Vérification double réservation même session ──
    if (dto.session_id) {
      const existingReservation = await this.reservationRepo.findOne({
        where: {
          traveler: { id: travelerId } as any,
          session: { id: dto.session_id } as any,
          status: Not('cancelled'),
        },
      });
      if (existingReservation) {
        throw new BadRequestException('Vous avez déjà réservé cette session');
      }
    }

    // ── Calcul du prix côté serveur ──
    let totalPrice = 0;

    if (dto.offer_item_id) {
      const offerItem = await this.offerItemRepo.findOne({
        where: { id: dto.offer_item_id },
        relations: ['prices'],
      });
      if (offerItem && offerItem.prices?.length) {
        const priceRow =
          offerItem.prices.find((p) => p.is_default) ?? offerItem.prices[0];
        const unitPrice =
          session?.price_override != null
            ? Number(session.price_override)
            : Number(priceRow.price);
        const pricingUnit = priceRow.pricing_unit ?? 'per_person';
        const nights = dto.nights ?? offerItem.details_json?.nights ?? 1;

        switch (pricingUnit) {
          case 'per_person_per_night':
          case 'per_night':
            totalPrice = unitPrice * participantCount * nights;
            break;
          case 'per_room_per_night':
            totalPrice = unitPrice * nights;
            break;
          case 'per_bed': {
            const bedCount =
              offerItem.details_json?.bed_count ?? participantCount;
            totalPrice = unitPrice * bedCount * nights;
            break;
          }
          case 'per_person':
          default:
            totalPrice = unitPrice * participantCount;
            break;
        }
      }
    } else if (offer.price) {
      // Offre sans item selectionne : utiliser le prix indicatif de l'offre
      totalPrice = Number(offer.price) * participantCount;
    } else {
      // Offre avec items mais pas d'item selectionne : somme des prix par defaut
      const allItems = await this.offerItemRepo.find({
        where: { offer: { id: dto.offer_id } },
        relations: ['prices'],
      });
      if (allItems.length) {
        const sumDefaultPrices = allItems.reduce((sum, item) => {
          const priceRow =
            item.prices?.find((p) => p.is_default) ?? item.prices?.[0];
          return sum + (priceRow ? Number(priceRow.price) : 0);
        }, 0);
        totalPrice = sumDefaultPrices * participantCount;
      }
    }

    const refSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reservation = this.reservationRepo.create({
      reservation_ref: `BK-${refSuffix}`,
      traveler: { id: travelerId } as User,
      offer: { id: dto.offer_id } as Offer,
      offerItem: dto.offer_item_id
        ? ({ id: dto.offer_item_id } as OfferItem)
        : null,
      session: dto.session_id
        ? ({ id: dto.session_id } as OfferItemSession)
        : null,
      total_price: totalPrice,
      currency: dto.currency ?? 'TND',
      special_requests: dto.special_requests ?? null,
      confirmation_mode: dto.confirmation_mode ?? 'automatic',
      status: dto.confirmation_mode === 'manual' ? 'pending' : 'confirmed',
    });
    const saved = await this.reservationRepo.save(reservation);

    // ── Décrémentation de la capacité via CapacityDomainService ──
    if (dto.offer_item_id) {
      const sessionDate = session?.date ?? null;
      await this.capacityService.reserve(
        dto.offer_item_id,
        sessionDate,
        participantCount,
      );
    }

    // ── Mise à jour du score de durabilité (composante réservations 40%) ──
    this.ecoTravelerService
      .recomputeReservationsScore(travelerId)
      .catch(() => {});

    if (dto.participants?.length) {
      const participants = dto.participants.map((p) =>
        this.participantRepo.create({
          reservation: { id: saved.id } as Reservation,
          full_name: p.full_name,
          age: p.age ?? null,
          document_type: p.document_type ?? null,
          document_number: p.document_number ?? null,
          is_group_leader: p.is_group_leader ?? false,
        }),
      );
      await this.participantRepo.save(participants);
    }

    const notifType =
      reservation.status === 'confirmed'
        ? 'booking_confirmed'
        : 'booking_request';
    const notifTitle =
      reservation.status === 'confirmed'
        ? 'Réservation confirmée'
        : 'Demande de réservation';
    const travelerMsg =
      reservation.status === 'confirmed'
        ? `Votre réservation ${saved.reservation_ref} pour "${offer.title}" a été confirmée.`
        : `Votre demande de réservation ${saved.reservation_ref} pour "${offer.title}" a été envoyée. Le prestataire va la confirmer.`;
    this.notificationService
      .create(
        travelerId,
        notifType,
        notifTitle,
        travelerMsg,
        `/bookings/${saved.id}`,
      )
      .catch(() => {});

    if (offer.author_id && offer.author_id !== travelerId) {
      const providerMsg =
        reservation.status === 'confirmed'
          ? `Nouvelle réservation ${saved.reservation_ref} confirmée pour "${offer.title}" par un voyageur.`
          : `Nouvelle demande de réservation ${saved.reservation_ref} pour "${offer.title}" en attente de votre confirmation.`;
      this.notificationService
        .create(
          offer.author_id,
          'new_booking_request',
          'Nouvelle réservation',
          providerMsg,
          `/dashboard/incoming`,
        )
        .catch(() => {});
    }

    return this.reservationRepo.findOne({
      where: { id: saved.id },
      relations: ['participants', 'offer'],
    }) as Promise<Reservation>;
  }

  /** Récupère les réservations d'un voyageur */
  async findByTraveler(travelerId: string): Promise<Reservation[]> {
    return this.reservationRepo.find({
      where: { traveler: { id: travelerId } },
      relations: [
        'offer',
        'offerItem',
        'session',
        'guideOffering',
        'guideOfferingSession',
        'participants',
      ],
      order: { created_at: 'DESC' },
    });
  }

  /** Récupère une réservation par son ID */
  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: [
        'offer',
        'offerItem',
        'session',
        'guideOffering',
        'guideOfferingSession',
        'participants',
        'traveler',
      ],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    return reservation;
  }

  /** Annule une réservation (par le voyageur) */
  async cancel(
    id: string,
    travelerId: string,
    reason?: string,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (reservation.traveler.id !== travelerId) {
      throw new ForbiddenException(
        'Vous ne pouvez annuler que vos propres réservations',
      );
    }
    if (
      !this.reservationDomain.validateTransition(
        reservation.status,
        'cancelled',
        'booking',
      )
    ) {
      throw new BadRequestException(
        `Impossible d'annuler une réservation avec le statut "${reservation.status}"`,
      );
    }

    // ── Vérification du délai d'annulation ──
    if (reservation.offerItem?.id && reservation.session?.id) {
      const offerItem = await this.offerItemRepo.findOne({
        where: { id: reservation.offerItem.id },
      });
      const session = await this.sessionRepo.findOne({
        where: { id: reservation.session.id },
      });
      if (offerItem?.cancellation_deadline_days != null && session?.date) {
        const sessionDate = new Date(session.date);
        const now = new Date();
        const daysUntilSession = Math.ceil(
          (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilSession < offerItem.cancellation_deadline_days) {
          throw new BadRequestException(
            `L'annulation doit être faite au moins ${offerItem.cancellation_deadline_days} jour(s) avant la session (plus que ${daysUntilSession} jour(s))`,
          );
        }
      }
    }

    reservation.status = 'cancelled';
    reservation.cancelled_at = new Date();
    reservation.cancel_reason = reason ?? null;
    const saved = await this.reservationRepo.save(reservation);

    this.ecoTravelerService
      .recomputeReservationsScore(travelerId)
      .catch(() => {});

    // Restaurer la capacité via CapacityDomainService
    if (reservation.offerItem?.id) {
      const sessionDate = reservation.session?.date ?? null;
      const participantCount = reservation.participants?.length ?? 1;
      await this.capacityService.restore(
        reservation.offerItem.id,
        sessionDate,
        participantCount,
      );
    }

    // Restaurer la capacité de la session guide
    if (reservation.guideOfferingSession?.id) {
      const session = await this.guideSessionRepo.findOne({
        where: { id: reservation.guideOfferingSession.id },
      });
      if (session && session.remaining_capacity !== null) {
        const participantCount = reservation.participants?.length ?? 1;
        session.remaining_capacity += participantCount;
        if (session.status === 'full') {
          session.status = 'available';
        }
        await this.guideSessionRepo.save(session);
      }
    }

    // Notifier le voyageur
    this.notificationService
      .create(
        travelerId,
        'booking_cancelled',
        'Réservation annulée',
        `Votre réservation ${saved.reservation_ref} a été annulée.${reason ? ` Motif : ${reason}` : ''}`,
        `/bookings/${saved.id}`,
      )
      .catch(() => {});

    // Notifier le provider
    if (reservation.offer) {
      const offer = await this.offerRepo.findOne({
        where: { id: reservation.offer.id },
      });
      if (offer?.author_id && offer.author_id !== travelerId) {
        this.notificationService
          .create(
            offer.author_id,
            'booking_cancelled',
            'Réservation annulée',
            `La réservation ${saved.reservation_ref} pour "${offer.title}" a été annulée par le voyageur.${reason ? ` Motif : ${reason}` : ''}`,
            `/dashboard/incoming`,
          )
          .catch(() => {});
      }
    }
    return saved;
  }

  /** Confirme ou refuse une réservation (par le provider ou le guide, mode manuel) */
  async confirm(
    id: string,
    providerId: string,
    dto?: { status?: string; reason?: string },
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
    const nextStatus = dto?.status === 'rejected' ? 'rejected' : 'confirmed';

    const offer = reservation.offer
      ? await this.offerRepo.findOne({ where: { id: reservation.offer.id } })
      : null;
    // Une réservation porte soit une offre (provider) soit une prestation guide
    const authorId = offer
      ? offer.author_id
      : (reservation.guideOffering?.guide_id ?? null);
    if (!authorId || authorId !== providerId) {
      throw new ForbiddenException(
        'Vous ne pouvez gérer que les réservations de vos propres prestations',
      );
    }
    if (
      !this.reservationDomain.validateTransition(
        reservation.status,
        nextStatus,
        'booking',
      )
    ) {
      throw new BadRequestException(
        `Cette réservation ne peut pas passer au statut "${nextStatus}"`,
      );
    }

    const itemTitle =
      offer?.title ?? reservation.guideOffering?.title ?? 'prestation';

    if (nextStatus === 'rejected') {
      reservation.status = 'rejected';
      reservation.cancel_reason = dto?.reason ?? null;
      const saved = await this.reservationRepo.save(reservation);

      // Restaurer la capacité réservée (offre ou session guide)
      await this.restoreReservationCapacity(reservation);

      this.ecoTravelerService
        .recomputeReservationsScore(reservation.traveler.id)
        .catch(() => {});
      this.notificationService
        .create(
          reservation.traveler.id,
          'booking_rejected',
          'Réservation refusée',
          `Votre demande de réservation ${saved.reservation_ref} pour "${itemTitle}" a été refusée par le prestataire.${dto?.reason ? ` Motif : ${dto.reason}` : ''}`,
          `/reservations/${saved.id}`,
        )
        .catch(() => {});
      return saved;
    }

    reservation.status = 'confirmed';
    const saved = await this.reservationRepo.save(reservation);
    this.ecoTravelerService
      .recomputeReservationsScore(reservation.traveler.id)
      .catch(() => {});
    this.notificationService
      .create(
        reservation.traveler.id,
        'booking_confirmed',
        'Réservation confirmée',
        `Votre réservation ${saved.reservation_ref} pour "${itemTitle}" a été confirmée par le prestataire.`,
        `/reservations/${saved.id}`,
      )
      .catch(() => {});
    return saved;
  }

  /** Récupère les réservations pour les offres d'un provider */
  async findByOfferAuthor(authorId: string): Promise<Reservation[]> {
    return this.reservationRepo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.offer', 'offer')
      .leftJoinAndSelect('reservation.guideOffering', 'guideOffering')
      .leftJoinAndSelect('reservation.traveler', 'traveler')
      .leftJoinAndSelect('reservation.participants', 'participants')
      .where('offer.author_id = :authorId', { authorId })
      .orWhere('guideOffering.guide_id = :authorId', { authorId })
      .orderBy('reservation.created_at', 'DESC')
      .getMany();
  }

  /** Ajoute des participants à une réservation existante et recalcule le prix */
  async addParticipants(
    reservationId: string,
    travelerId: string,
    participants: {
      full_name: string;
      age?: number;
      document_type?: string;
      document_number?: string;
      is_group_leader?: boolean;
    }[],
  ): Promise<Reservation> {
    const reservation = await this.findById(reservationId);
    if (reservation.traveler.id !== travelerId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres réservations',
      );
    }
    if (reservation.status === 'cancelled') {
      throw new ForbiddenException(
        "Impossible d'ajouter des participants à une réservation annulée",
      );
    }

    // Vérifier la capacité avant d'ajouter
    const additionalCount = participants.length;
    if (reservation.offerItem && additionalCount > 0) {
      const offerItem = await this.offerItemRepo.findOne({
        where: { id: reservation.offerItem.id },
      });
      if (offerItem) {
        const hasCapacity = await this.capacityService.checkAvailability(
          offerItem.id,
          reservation.session?.date ?? null,
          additionalCount,
        );
        if (!hasCapacity) {
          throw new BadRequestException(
            `Capacité insuffisante : ${additionalCount} place(s) demandé(s) non disponibles`,
          );
        }
      }
    }

    const entities = participants.map((p) =>
      this.participantRepo.create({
        reservation: { id: reservationId } as Reservation,
        full_name: p.full_name,
        age: p.age ?? null,
        document_type: p.document_type ?? null,
        document_number: p.document_number ?? null,
        is_group_leader: p.is_group_leader ?? false,
      }),
    );
    await this.participantRepo.save(entities);

    // Réserver capacité pour les nouveaux participants
    if (reservation.offerItem && additionalCount > 0) {
      await this.capacityService.reserve(
        reservation.offerItem.id,
        reservation.session?.date ?? null,
        additionalCount,
      );
    }

    // Recalculer le prix avec le nouveau nombre total de participants
    const updatedReservation = await this.findById(reservationId);
    const totalCount = updatedReservation.participants?.length ?? 1;
    let totalPrice = 0;

    if (updatedReservation.offerItem) {
      const offerItem = await this.offerItemRepo.findOne({
        where: { id: updatedReservation.offerItem.id },
        relations: ['prices'],
      });
      if (offerItem && offerItem.prices?.length) {
        const priceRow =
          offerItem.prices.find((p) => p.is_default) ?? offerItem.prices[0];
        const unitPrice = Number(priceRow.price);
        const pricingUnit = priceRow.pricing_unit ?? 'per_person';
        const nights = offerItem.details_json?.nights ?? 1;

        switch (pricingUnit) {
          case 'per_person_per_night':
          case 'per_night':
            totalPrice = unitPrice * totalCount * nights;
            break;
          case 'per_room_per_night':
            totalPrice = unitPrice * nights;
            break;
          case 'per_bed': {
            const bedCount = offerItem.details_json?.bed_count ?? totalCount;
            totalPrice = unitPrice * bedCount * nights;
            break;
          }
          case 'per_person':
          default:
            totalPrice = unitPrice * totalCount;
            break;
        }
      }
    } else if (updatedReservation.offer?.price) {
      totalPrice = Number(updatedReservation.offer.price) * totalCount;
    } else if (updatedReservation.offer) {
      // Offre avec items : somme des prix par defaut
      const allItems = await this.offerItemRepo.find({
        where: { offer: { id: updatedReservation.offer.id } },
        relations: ['prices'],
      });
      if (allItems.length) {
        const sumDefaultPrices = allItems.reduce((sum, item) => {
          const priceRow =
            item.prices?.find((p) => p.is_default) ?? item.prices?.[0];
          return sum + (priceRow ? Number(priceRow.price) : 0);
        }, 0);
        totalPrice = sumDefaultPrices * totalCount;
      }
    }

    updatedReservation.total_price = totalPrice;
    await this.reservationRepo.save(updatedReservation);

    return this.findById(reservationId);
  }

  // ── Gestion du cycle de vie ──────────────────────────────────────

  /**
   * Marque les réservations pending > 48h comme expired
   */
  async checkExpiredReservations(): Promise<number> {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const expired = await this.reservationRepo.find({
      where: { status: 'pending', created_at: LessThan(cutoff) },
      relations: [
        'offerItem',
        'session',
        'guideOfferingSession',
        'participants',
      ],
    });
    for (const reservation of expired) {
      reservation.status = 'expired';
      await this.reservationRepo.save(reservation);
      await this.restoreReservationCapacity(reservation);
      this.ecoTravelerService
        .recomputeReservationsScore(reservation.traveler.id)
        .catch(() => {});
      this.notificationService
        .create(
          reservation.traveler.id,
          'booking_expired',
          'Réservation expirée',
          `Votre réservation ${reservation.reservation_ref} a expirée faute de confirmation dans les 48h.`,
          `/reservations/${reservation.id}`,
        )
        .catch(() => {});
    }
    return expired.length;
  }

  /**
   * Transition automatique confirmed → completed quand la session est passée
   */
  async finalizeCompletedReservations(): Promise<number> {
    const now = new Date();
    const completed = await this.reservationRepo.find({
      where: { status: 'confirmed' },
      relations: ['session', 'participants'],
    });
    let count = 0;
    for (const reservation of completed) {
      if (
        reservation.session?.date &&
        new Date(reservation.session.date) < now
      ) {
        reservation.status = 'completed';
        await this.reservationRepo.save(reservation);
        count++;
      }
    }
    return count;
  }

  /**
   * Restaure la capacité d'une réservation (session + stock global)
   */
  private async restoreReservationCapacity(
    reservation: Reservation,
  ): Promise<void> {
    if (reservation.offerItem?.id) {
      const sessionDate = reservation.session?.date ?? null;
      const participantCount = reservation.participants?.length ?? 1;
      await this.capacityService.restore(
        reservation.offerItem.id,
        sessionDate,
        participantCount,
      );
    }
    if (reservation.guideOfferingSession?.id) {
      const session = await this.guideSessionRepo.findOne({
        where: { id: reservation.guideOfferingSession.id },
      });
      if (session && session.remaining_capacity !== null) {
        const participantCount = reservation.participants?.length ?? 1;
        session.remaining_capacity += participantCount;
        if (session.status === 'full') {
          session.status = 'available';
        }
        await this.guideSessionRepo.save(session);
      }
    }
  }

  // ── Guide Offering Booking ──────────────────────────────────────

  async createGuideReservation(
    travelerId: string,
    dto: CreateGuideReservationDto,
  ): Promise<Reservation> {
    const offering = await this.guideOfferingRepo.findOne({
      where: { id: dto.guide_offering_id },
      relations: ['guide'],
    });
    if (!offering) throw new NotFoundException('Prestation guide introuvable');
    if (offering.status !== 'active')
      throw new BadRequestException("Cette prestation n'est pas active");

    const session = await this.guideSessionRepo.findOne({
      where: {
        id: dto.guide_offering_session_id,
        guideOffering: { id: dto.guide_offering_id },
      },
    });
    if (!session) throw new NotFoundException('Session introuvable');
    if (session.status === 'cancelled')
      throw new BadRequestException('Cette session est annulée');
    const sessionCapacity =
      session.remaining_capacity ?? session.total_capacity ?? null;
    const participantCount = dto.participants?.length ?? 0;

    if (sessionCapacity !== null) {
      if (sessionCapacity <= 0)
        throw new BadRequestException('Cette session est complète');
      if (participantCount > sessionCapacity) {
        throw new BadRequestException(
          `Capacité insuffisante : ${sessionCapacity} place(s) restante(s)`,
        );
      }
    }

    const total_price = participantCount * Number(offering.price);

    const bookingRef =
      'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const reservation = this.reservationRepo.create({
      reservation_ref: bookingRef,
      traveler: { id: travelerId } as any,
      guideOffering: offering,
      guideOfferingSession: session,
      total_price,
      currency: dto.currency ?? 'TND',
      special_requests: dto.special_requests ?? null,
      status:
        offering.confirmation_mode === 'automatic' ? 'confirmed' : 'pending',
      confirmation_mode: offering.confirmation_mode,
    });

    const saved = await this.reservationRepo.save(reservation);

    if (dto.participants?.length) {
      const participants = dto.participants.map((p, i) =>
        this.participantRepo.create({
          reservation: saved,
          full_name: p.full_name,
          age: p.age ?? null,
          document_type: p.document_type ?? null,
          document_number: p.document_number ?? null,
          is_group_leader: i === 0 ? true : (p.is_group_leader ?? false),
        }),
      );
      await this.participantRepo.save(participants);
    }

    if (session.remaining_capacity !== null) {
      session.remaining_capacity -= participantCount;
      if (session.remaining_capacity <= 0) session.status = 'full';
    }
    await this.guideSessionRepo.save(session);

    this.ecoTravelerService
      .recomputeReservationsScore(travelerId)
      .catch(() => {});

    try {
      await this.notificationService.create(
        offering.guide.user_id,
        'guide_booking',
        'Nouvelle réservation guide',
        `Réservation ${bookingRef} pour ${participantCount > 0 ? participantCount + ' participant(s)' : '1 voyageur'} le ${session.date.toLocaleDateString('fr-FR')}`,
        `/dashboard/bookings/${saved.id}`,
      );
    } catch {}

    return this.findById(saved.id);
  }
}
