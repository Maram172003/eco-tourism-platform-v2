import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { Circuit } from './entities/circuit.entity';
import { CircuitDay } from './entities/circuit-day.entity';
import { CircuitProgramItem } from './entities/circuit-program-item.entity';
import { CircuitOption } from './entities/circuit-option.entity';
import { CircuitReservation } from './entities/circuit-reservation.entity';
import { CircuitReservationOption } from './entities/circuit-reservation-option.entity';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { CreateCircuitDayDto } from './dto/create-circuit-day.dto';
import { CreateCircuitOptionDto } from './dto/create-circuit-option.dto';
import { CreateCircuitProgramItemDto } from './dto/create-circuit-program-item.dto';
import { ReserveCircuitDto } from './dto/reserve-circuit.dto';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CircuitService {
  constructor(
    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,
    @InjectRepository(CircuitDay)
    private readonly dayRepo: Repository<CircuitDay>,
    @InjectRepository(CircuitProgramItem)
    private readonly programItemRepo: Repository<CircuitProgramItem>,
    @InjectRepository(CircuitOption)
    private readonly optionRepo: Repository<CircuitOption>,
    @InjectRepository(CircuitReservation)
    private readonly reservationRepo: Repository<CircuitReservation>,
    @InjectRepository(CircuitReservationOption)
    private readonly reservationOptionRepo: Repository<CircuitReservationOption>,
    private readonly notificationService: NotificationService,
    private readonly redis: RedisService,
  ) {}

  private readonly CIRCUIT_CACHE_PREFIX = 'circuit:';

  private invalidateCircuitCache(): Promise<void> {
    return this.redis.delByPattern(`${this.CIRCUIT_CACHE_PREFIX}*`);
  }

  // ─── Circuits ──────────────────────────────────────────

  async create(authorId: string, authorType: string, dto: CreateCircuitDto): Promise<Circuit> {
    const circuit = this.circuitRepo.create({
      author_id: authorId,
      author_type: authorType,
      title: dto.title,
      description: dto.description ?? null,
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      duration_days: dto.duration_days ?? null,
      duration_nights: dto.duration_nights ?? null,
      region: dto.region ?? null,
      base_price: dto.base_price ?? null,
      currency: dto.currency ?? 'XAF',
      max_participants: dto.max_participants ?? null,
      booking_deadline_days: dto.booking_deadline_days ?? null,
      confirmation_mode: dto.confirmation_mode ?? null,
      inclusions: dto.inclusions ?? null,
      exclusions: dto.exclusions ?? null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      address: dto.address ?? null,
      project_id: dto.project_id ?? null,
      images: dto.images?.length ? dto.images : null,
      status: 'pending',
    });
    const saved = await this.circuitRepo.save(circuit);
    await this.invalidateCircuitCache();
    return saved;
  }

  async findAll(status?: string, region?: string): Promise<Circuit[]> {
    const cacheKey = region
      ? `${this.CIRCUIT_CACHE_PREFIX}list:region:${region}${status ? `:status:${status}` : ''}`
      : `${this.CIRCUIT_CACHE_PREFIX}list:all${status ? `:status:${status}` : ''}`;
    const cached = await this.redis.get<Circuit[]>(cacheKey);
    if (cached) return cached;

    const where: any = {};
    if (status) where.status = status;
    if (region) where.region = region;
    const circuits = !status && !region
      ? await this.circuitRepo.find({ order: { created_at: 'DESC' } })
      : await this.circuitRepo.find({ where, order: { created_at: 'DESC' } });

    await this.redis.set(cacheKey, circuits);
    return circuits;
  }

  async findById(id: string): Promise<Circuit> {
    const cacheKey = `${this.CIRCUIT_CACHE_PREFIX}detail:${id}`;
    const cached = await this.redis.get<Circuit>(cacheKey);
    if (cached) return cached;

    const circuit = await this.circuitRepo.findOne({
      where: { id },
      relations: ['days', 'days.programItems', 'options'],
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable');

    await this.redis.set(cacheKey, circuit);
    return circuit;
  }

  async findByAuthor(authorId: string): Promise<Circuit[]> {
    return this.circuitRepo.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, dto: Partial<CreateCircuitDto>): Promise<Circuit> {
    const circuit = await this.findById(id);
    if (dto.title !== undefined) circuit.title = dto.title;
    if (dto.description !== undefined) circuit.description = dto.description ?? null;
    if (dto.start_date !== undefined) circuit.start_date = dto.start_date ? new Date(dto.start_date) : null;
    if (dto.end_date !== undefined) circuit.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.duration_days !== undefined) circuit.duration_days = dto.duration_days ?? null;
    if (dto.duration_nights !== undefined) circuit.duration_nights = dto.duration_nights ?? null;
    if (dto.region !== undefined) circuit.region = dto.region ?? null;
    if (dto.base_price !== undefined) circuit.base_price = dto.base_price ?? null;
    if (dto.currency !== undefined) circuit.currency = dto.currency ?? 'XAF';
    if (dto.max_participants !== undefined) circuit.max_participants = dto.max_participants ?? null;
    if (dto.booking_deadline_days !== undefined) circuit.booking_deadline_days = dto.booking_deadline_days ?? null;
    if (dto.confirmation_mode !== undefined) circuit.confirmation_mode = dto.confirmation_mode ?? null;
    if (dto.inclusions !== undefined) circuit.inclusions = dto.inclusions ?? null;
    if (dto.exclusions !== undefined) circuit.exclusions = dto.exclusions ?? null;
    if (dto.lat !== undefined) circuit.lat = dto.lat ?? null;
    if (dto.lng !== undefined) circuit.lng = dto.lng ?? null;
    if (dto.address !== undefined) circuit.address = dto.address ?? null;
    if (dto.project_id !== undefined) circuit.project_id = dto.project_id ?? null;
    if (dto.images !== undefined) circuit.images = dto.images?.length ? dto.images : null;
    if (dto.waypoints !== undefined) circuit.waypoints = dto.waypoints ?? null;
    const saved = await this.circuitRepo.save(circuit);
    await this.invalidateCircuitCache();
    return saved;
  }

  // ─── Jours du circuit ──────────────────────────────────

  async addDay(circuitId: string, dto: CreateCircuitDayDto, authorId?: string): Promise<CircuitDay> {
    const circuit = await this.circuitRepo.findOne({ where: { id: circuitId } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    if (authorId && circuit.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    const day = this.dayRepo.create({
      circuit: { id: circuitId } as Circuit,
      day_number: dto.day_number,
      date: dto.date ?? null,
      title: dto.title,
      description: dto.description ?? null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      location_name: dto.location_name ?? null,
    });
    return this.dayRepo.save(day);
  }

  async updateDay(circuitId: string, dayId: string, dto: Partial<CreateCircuitDayDto>, authorId?: string): Promise<CircuitDay> {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['circuit'] });
    if (!day) throw new NotFoundException('Jour introuvable');
    if (day.circuit.id !== circuitId) throw new NotFoundException('Jour n\'appartient pas à ce circuit');
    if (authorId && day.circuit?.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    if (dto.day_number !== undefined) day.day_number = dto.day_number;
    if (dto.title !== undefined) day.title = dto.title;
    if (dto.description !== undefined) day.description = dto.description ?? null;
    if (dto.date !== undefined) day.date = dto.date ? new Date(dto.date) : null;
    if (dto.lat !== undefined) day.lat = dto.lat ?? null;
    if (dto.lng !== undefined) day.lng = dto.lng ?? null;
    if (dto.location_name !== undefined) day.location_name = dto.location_name ?? null;
    return this.dayRepo.save(day);
  }

  async removeDay(circuitId: string, dayId: string, authorId?: string): Promise<void> {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['circuit'] });
    if (!day) throw new NotFoundException('Jour introuvable');
    if (day.circuit.id !== circuitId) throw new NotFoundException('Jour n\'appartient pas à ce circuit');
    if (authorId && day.circuit?.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    await this.dayRepo.remove(day);
  }

  // ─── Options du circuit ────────────────────────────────

  async addOption(circuitId: string, dto: CreateCircuitOptionDto, authorId?: string): Promise<CircuitOption> {
    const circuit = await this.circuitRepo.findOne({ where: { id: circuitId } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    if (authorId && circuit.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    const option = this.optionRepo.create({
      circuit: { id: circuitId } as Circuit,
      offer_item_id: dto.offer_item_id ?? null,
      option_group: dto.option_group ?? null,
      option_type: dto.option_type,
      is_required: dto.is_required ?? false,
      is_included: dto.is_included ?? false,
      extra_price: dto.extra_price ?? null,
      selection_mode: dto.selection_mode ?? null,
      min_quantity: dto.min_quantity ?? null,
      max_quantity: dto.max_quantity ?? null,
    });
    return this.optionRepo.save(option);
  }

  async findOptions(circuitId: string): Promise<CircuitOption[]> {
    return this.optionRepo.find({
      where: { circuit: { id: circuitId } },
    });
  }

  private normalizeTime(time: string | null | undefined): string | null {
    if (!time) return null;
    const trimmed = time.trim();
    if (/^\d{1,2}$/.test(trimmed)) {
      const h = parseInt(trimmed, 10);
      return `${String(h).padStart(2, '0')}:00`;
    }
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':');
      return `${String(parseInt(h, 10)).padStart(2, '0')}:${m}`;
    }
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
      const [h, m, s] = trimmed.split(':');
      return `${String(parseInt(h, 10)).padStart(2, '0')}:${m}:${s}`;
    }
    return trimmed;
  }

  async addProgramItem(dayId: string, dto: CreateCircuitProgramItemDto, authorId?: string): Promise<CircuitProgramItem> {
    const day = await this.dayRepo.findOne({ where: { id: dayId }, relations: ['circuit'] });
    if (!day) throw new NotFoundException('Jour introuvable');
    if (authorId && day.circuit?.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    const item = this.programItemRepo.create({
      circuitDay: { id: dayId } as CircuitDay,
      title: dto.title,
      description: dto.description ?? null,
      start_time: this.normalizeTime(dto.start_time),
      end_time: this.normalizeTime(dto.end_time),
      is_included: dto.is_included ?? true,
      is_required: dto.is_required ?? true,
      linked_offer_item_id: dto.linked_offer_item_id ?? null,
      linked_location_id: dto.linked_location_id ?? null,
      emoji: dto.emoji ?? null,
      duration_minutes: dto.duration_minutes ?? null,
      distance_km: dto.distance_km ?? null,
      transport_mode: dto.transport_mode ?? null,
    });
    return this.programItemRepo.save(item);
  }

  async updateProgramItem(itemId: string, dto: Partial<CreateCircuitProgramItemDto>, authorId?: string): Promise<CircuitProgramItem> {
    const item = await this.programItemRepo.findOne({ where: { id: itemId }, relations: ['circuitDay', 'circuitDay.circuit'] });
    if (!item) throw new NotFoundException('Activité introuvable');
    if (authorId && item.circuitDay?.circuit?.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.description !== undefined) item.description = dto.description ?? null;
    if (dto.start_time !== undefined) item.start_time = this.normalizeTime(dto.start_time);
    if (dto.end_time !== undefined) item.end_time = this.normalizeTime(dto.end_time);
    if (dto.is_included !== undefined) item.is_included = dto.is_included;
    if (dto.is_required !== undefined) item.is_required = dto.is_required;
    if (dto.linked_offer_item_id !== undefined) item.linked_offer_item_id = dto.linked_offer_item_id ?? null;
    if (dto.linked_location_id !== undefined) item.linked_location_id = dto.linked_location_id ?? null;
    if (dto.emoji !== undefined) item.emoji = dto.emoji ?? null;
    if (dto.duration_minutes !== undefined) item.duration_minutes = dto.duration_minutes ?? null;
    if (dto.distance_km !== undefined) item.distance_km = dto.distance_km ?? null;
    if (dto.transport_mode !== undefined) item.transport_mode = dto.transport_mode ?? null;
    return this.programItemRepo.save(item);
  }

  async removeProgramItem(itemId: string, authorId?: string): Promise<void> {
    const item = await this.programItemRepo.findOne({ where: { id: itemId }, relations: ['circuitDay', 'circuitDay.circuit'] });
    if (!item) throw new NotFoundException('Activité introuvable');
    if (authorId && item.circuitDay?.circuit?.author_id !== authorId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres circuits');
    }
    await this.programItemRepo.remove(item);
  }

  // ─── Réservation de circuit ────────────────────────────

  async reserve(userId: string, dto: ReserveCircuitDto): Promise<CircuitReservation> {
    const circuit = await this.circuitRepo.findOne({ where: { id: dto.circuit_id } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');

    const participantsCount = dto.participants_count ?? 1;
    if (circuit.max_participants && participantsCount > circuit.max_participants) {
      throw new BadRequestException(`Le nombre de participants (${participantsCount}) dépasse la limite (${circuit.max_participants})`);
    }

    if (circuit.confirmation_mode === 'manual') {
      const existingPending = await this.reservationRepo.count({
        where: { circuit: { id: dto.circuit_id }, status: 'pending' },
      });
      if (circuit.max_participants && (existingPending + participantsCount) > circuit.max_participants) {
        throw new BadRequestException('Pas assez de places disponibles (des réservations en attente existent)');
      }
    }

    const reservationStatus = circuit.confirmation_mode === 'manual' ? 'pending' : 'confirmed';
    const reservation = this.reservationRepo.create({
      circuit: { id: dto.circuit_id } as Circuit,
      user: { id: userId } as User,
      participants_count: participantsCount,
      base_total: dto.base_total ?? circuit.base_price ?? 0,
      options_total: 0,
      final_total: dto.base_total ?? circuit.base_price ?? 0,
      status: reservationStatus,
    });
    const saved = await this.reservationRepo.save(reservation);

    if (dto.options?.length) {
      let optionsTotal = 0;
      for (const opt of dto.options) {
        const optEntity = await this.optionRepo.findOne({ where: { id: opt.circuit_option_id } });
        if (!optEntity) continue;
        const lineTotal = (opt.unit_price ?? Number(optEntity.extra_price) ?? 0) * (opt.quantity ?? 1);
        optionsTotal += lineTotal;
        await this.reservationOptionRepo.save(
          this.reservationOptionRepo.create({
            circuitReservation: { id: saved.id } as CircuitReservation,
            circuitOption: { id: opt.circuit_option_id } as CircuitOption,
            offer_item_session_id: opt.offer_item_session_id ?? null,
            quantity: opt.quantity ?? 1,
            unit_price: opt.unit_price ?? Number(optEntity.extra_price) ?? 0,
            total_price: lineTotal,
          }),
        );
      }
      saved.options_total = optionsTotal;
      saved.final_total = (dto.base_total ?? Number(circuit.base_price) ?? 0) + optionsTotal;
      await this.reservationRepo.save(saved);
    }

    if (reservationStatus === 'confirmed') {
      this.notificationService.create(userId, 'booking_confirmed', 'Circuit réservé', `Votre réservation pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}) a été confirmée.`, `/circuits/${saved.id}`).catch(() => {});
    } else {
      this.notificationService.create(userId, 'booking_request', 'Demande de réservation', `Votre demande de réservation pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}) a été envoyée. Le prestataire va la confirmer.`, `/circuits/${saved.id}`).catch(() => {});
    }

    if (circuit.author_id && circuit.author_id !== userId) {
      const providerMsg = reservationStatus === 'confirmed'
        ? `Nouvelle réservation confirmée pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}).`
        : `Nouvelle demande de réservation pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}) en attente de votre confirmation.`;
      this.notificationService.create(circuit.author_id, 'new_booking_request', 'Nouvelle réservation circuit', providerMsg, `/dashboard/incoming`).catch(() => {});
    }

    return saved;
  }

  async confirmReservation(id: string, providerId: string): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({ where: { id }, relations: ['circuit', 'user'] });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.circuit.author_id !== providerId) {
      throw new ForbiddenException('Vous ne pouvez confirmer que les réservations de vos propres circuits');
    }
    if (reservation.status !== 'pending') {
      throw new BadRequestException('Cette réservation ne peut plus être confirmée');
    }
    reservation.status = 'confirmed';
    const saved = await this.reservationRepo.save(reservation);
    this.notificationService.create(
      reservation.user.id,
      'booking_confirmed',
      'Réservation circuit confirmée',
      `Votre réservation pour "${reservation.circuit.title}" a été confirmée par le prestataire.`,
      `/circuits/${saved.id}`,
    ).catch(() => {});
    return saved;
  }

  async findReservationsByUser(userId: string): Promise<CircuitReservation[]> {
    return this.reservationRepo.find({
      where: { user: { id: userId } },
      relations: ['circuit'],
      order: { created_at: 'DESC' },
    });
  }

  async findReservationsByCircuitAuthor(authorId: string): Promise<CircuitReservation[]> {
    return this.reservationRepo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.circuit', 'circuit')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('circuit.author_id = :authorId', { authorId })
      .orderBy('reservation.created_at', 'DESC')
      .getMany();
  }

  async remove(id: string, authorId: string): Promise<void> {
    const circuit = await this.circuitRepo.findOne({ where: { id } });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    if (circuit.author_id !== authorId) throw new ForbiddenException('Accès refusé');
    await this.circuitRepo.remove(circuit);
    await this.invalidateCircuitCache();
  }

  async updateReservation(id: string, userId: string, body: { participants_count?: number; base_total?: number }): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({ where: { id }, relations: ['circuit', 'user'] });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.user.id !== userId) throw new ForbiddenException('Accès refusé');
    if (reservation.status === 'cancelled') throw new BadRequestException('Impossible de modifier une réservation annulée');

    if (body.participants_count !== undefined) {
      reservation.participants_count = body.participants_count;
    }
    if (body.base_total !== undefined) {
      reservation.base_total = body.base_total;
      reservation.final_total = body.base_total + Number(reservation.options_total || 0);
    }

    return this.reservationRepo.save(reservation);
  }

  async cancelReservation(id: string, userId: string): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({ where: { id }, relations: ['circuit', 'user'] });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.user.id !== userId) throw new ForbiddenException('Accès refusé');
    if (reservation.status === 'cancelled') throw new BadRequestException('Déjà annulée');

    reservation.status = 'cancelled';
    const saved = await this.reservationRepo.save(reservation);

    // Notifier le voyageur
    this.notificationService.create(
      userId,
      'booking_cancelled',
      'Réservation circuit annulée',
      `Votre réservation pour "${reservation.circuit.title}" a été annulée.`,
      `/circuits/${reservation.circuit.id}`,
    ).catch(() => {});

    // Notifier le provider
    if (reservation.circuit.author_id && reservation.circuit.author_id !== userId) {
      this.notificationService.create(
        reservation.circuit.author_id,
        'booking_cancelled',
        'Réservation circuit annulée',
        `La réservation de ${reservation.user.id} pour "${reservation.circuit.title}" a été annulée.`,
        `/dashboard/incoming`,
      ).catch(() => {});
    }

    return saved;
  }

}
