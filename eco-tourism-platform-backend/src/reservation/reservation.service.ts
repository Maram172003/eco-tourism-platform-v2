import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationParticipant } from './entities/reservation-participant.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferSession } from '../offer/entities/offer-session.entity';
import { ConfirmReservationDto, CreateReservationDto, RespondToInvitationDto } from './dto/reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationParticipant)
    private readonly participantRepo: Repository<ReservationParticipant>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(OfferSession)
    private readonly sessionRepo: Repository<OfferSession>,
  ) {}

  async create(organizerId: string, dto: CreateReservationDto): Promise<Reservation> {
    const offer = await this.offerRepo.findOne({ where: { id: dto.offer_id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    if (offer.status !== 'approved') throw new BadRequestException('Cette offre n\'est pas disponible à la réservation.');

    // Vérification de la session si fournie
    let session: OfferSession | null = null;
    if (dto.session_id) {
      session = await this.sessionRepo.findOne({ where: { id: dto.session_id } });
      if (!session) throw new NotFoundException('Séance introuvable.');
      if (session.status !== 'scheduled') throw new BadRequestException('Cette séance n\'est plus disponible.');
      const available = (session.capacity ?? offer.capacity ?? 0) - session.spots_taken;
      if (dto.participant_count > available) {
        throw new BadRequestException(`Plus assez de places disponibles (${available} restantes).`);
      }
    }

    const invitedIds = dto.invited_user_ids ?? [];
    const participantCount = dto.reservation_type === 'group' ? 1 + invitedIds.length : dto.participant_count;

    const pricePerPerson = offer.price ? Number(offer.price) : null;
    const totalPrice = pricePerPerson !== null ? pricePerPerson * participantCount : null;
    const depositAmount =
      totalPrice !== null && offer.deposit_percentage
        ? Math.round((totalPrice * offer.deposit_percentage) / 100 * 100) / 100
        : null;

    // instant → confirmed directement ; manual/conditional → pending
    const initialStatus = offer.confirmation_mode === 'instant' ? 'confirmed' : 'pending';

    const reservation = this.reservationRepo.create({
      offer_id: dto.offer_id,
      session_id: dto.session_id ?? null,
      organizer_id: organizerId,
      reservation_type: dto.reservation_type,
      status: initialStatus,
      reservation_date: dto.reservation_date ? new Date(dto.reservation_date) : null,
      participant_count: participantCount,
      price_per_person: pricePerPerson,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      deposit_paid: false,
      payment_status: 'unpaid',
      notes: dto.notes ?? null,
    });

    const saved = await this.reservationRepo.save(reservation);

    // Mise à jour des places prises dans la séance
    if (session) {
      session.spots_taken += participantCount;
      if (session.spots_taken >= (session.capacity ?? offer.capacity ?? 0)) {
        session.status = 'full';
      }
      await this.sessionRepo.save(session);
    }

    if (dto.reservation_type === 'group' && invitedIds.length > 0) {
      const participants = invitedIds.map((userId) =>
        this.participantRepo.create({
          reservation_id: saved.id,
          user_id: userId,
          status: 'pending',
        }),
      );
      await this.participantRepo.save(participants);
    }

    return this.findOne(saved.id);
  }

  // Mes réservations (organisées + invitations reçues)
  async findMine(userId: string): Promise<{ organized: Reservation[]; invited: ReservationParticipant[] }> {
    const organized = await this.reservationRepo.find({
      where: { organizer_id: userId },
      relations: ['offer', 'session', 'participants'],
      order: { created_at: 'DESC' },
    });

    const invited = await this.participantRepo.find({
      where: { user_id: userId },
      relations: ['reservation', 'reservation.offer'],
      order: { invited_at: 'DESC' },
    });

    return { organized, invited };
  }

  // Réservations reçues par le prestataire (pour toutes ses offres)
  async findForProvider(providerId: string): Promise<Reservation[]> {
    return this.reservationRepo
      .createQueryBuilder('r')
      .innerJoin('r.offer', 'o')
      .where('o.author_id = :providerId', { providerId })
      .leftJoinAndSelect('r.offer', 'offer')
      .leftJoinAndSelect('r.session', 'session')
      .orderBy('r.created_at', 'DESC')
      .getMany();
  }

  async findPendingInvitations(userId: string): Promise<ReservationParticipant[]> {
    return this.participantRepo.find({
      where: { user_id: userId, status: 'pending' },
      relations: ['reservation', 'reservation.offer'],
      order: { invited_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ['offer', 'session', 'participants'],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable.');
    return reservation;
  }

  // Le prestataire confirme ou rejette la réservation
  async confirmByProvider(providerId: string, reservationId: string, dto: ConfirmReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(reservationId);
    const offer = await this.offerRepo.findOne({ where: { id: reservation.offer_id } });
    if (!offer || offer.author_id !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas le prestataire de cette offre.');
    }
    if (reservation.status !== 'pending') {
      throw new BadRequestException('Cette réservation ne peut plus être traitée.');
    }
    reservation.status = dto.status;
    if (dto.cancellation_reason) reservation.cancellation_reason = dto.cancellation_reason;
    return this.reservationRepo.save(reservation);
  }

  async respondToInvitation(userId: string, reservationId: string, dto: RespondToInvitationDto): Promise<ReservationParticipant> {
    const participant = await this.participantRepo.findOne({
      where: { reservation_id: reservationId, user_id: userId },
    });
    if (!participant) throw new NotFoundException('Invitation introuvable.');
    if (participant.status !== 'pending') throw new BadRequestException('Vous avez déjà répondu à cette invitation.');

    participant.status = dto.status;
    participant.responded_at = new Date();
    await this.participantRepo.save(participant);

    if (dto.status === 'accepted') await this.checkAndConfirm(reservationId);

    return participant;
  }

  async cancelReservation(userId: string, reservationId: string): Promise<Reservation> {
    const reservation = await this.findOne(reservationId);
    if (reservation.organizer_id !== userId) {
      throw new ForbiddenException('Seul l\'organisateur peut annuler la réservation.');
    }
    if (['cancelled', 'completed'].includes(reservation.status)) {
      throw new BadRequestException('Cette réservation ne peut pas être annulée.');
    }
    reservation.status = 'cancelled';
    return this.reservationRepo.save(reservation);
  }

  private async checkAndConfirm(reservationId: string): Promise<void> {
    const participants = await this.participantRepo.find({ where: { reservation_id: reservationId } });
    if (participants.every((p) => p.status === 'accepted')) {
      await this.reservationRepo.update(reservationId, { status: 'confirmed' });
    }
  }
}
