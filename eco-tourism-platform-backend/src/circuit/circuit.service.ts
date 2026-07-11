import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, Not, LessThan } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import {
  paginated,
  PaginatedResult,
  PaginationParams,
} from '../common/helpers/pagination';
import { Circuit } from './entities/circuit.entity';
import { CircuitDay } from './entities/circuit-day.entity';
import { CircuitProgramItem } from './entities/circuit-program-item.entity';
import { CircuitOption } from './entities/circuit-option.entity';
import { CircuitReservation } from './entities/circuit-reservation.entity';
import { CircuitReservationOption } from './entities/circuit-reservation-option.entity';
import { CircuitReservationSnapshot } from './entities/circuit-reservation-snapshot.entity';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { CreateCircuitDayDto } from './dto/create-circuit-day.dto';
import { CreateCircuitOptionDto } from './dto/create-circuit-option.dto';
import { CreateCircuitProgramItemDto } from './dto/create-circuit-program-item.dto';
import { ReserveCircuitDto } from './dto/reserve-circuit.dto';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { PricingDomainService } from '../domain/pricing-domain.service';
import { CapacityDomainService } from '../domain/capacity-domain.service';
import { ReservationApplicationService } from '../domain/reservation-application.service';
import { ReservationDomainService } from '../domain/reservation-domain.service';

@Injectable()
export class CircuitService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    @InjectRepository(CircuitReservationSnapshot)
    private readonly snapshotRepo: Repository<CircuitReservationSnapshot>,
    @InjectRepository(OfferItem)
    private readonly offerItemRepo: Repository<OfferItem>,
    private readonly notificationService: NotificationService,
    private readonly redis: RedisService,
    private readonly pricingService: PricingDomainService,
    private readonly capacityService: CapacityDomainService,
    private readonly reservationApp: ReservationApplicationService,
    private readonly reservationDomain: ReservationDomainService,
  ) {}

  private readonly CIRCUIT_CACHE_PREFIX = 'circuit:';

  private invalidateCircuitCache(): Promise<void> {
    return this.redis.delByPattern(`${this.CIRCUIT_CACHE_PREFIX}*`);
  }

  // ─── Circuits ──────────────────────────────────────────

  async create(
    authorId: string,
    authorType: string,
    dto: CreateCircuitDto,
  ): Promise<Circuit> {
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
      venue_id: dto.project_id ?? null,
      cover_image: dto.cover_image ?? null,
      images: dto.images?.length ? dto.images : null,
      availability: dto.availability ?? null,
      hebergement: dto.hebergement ?? null,
      status: 'pending',
    });
    const saved = await this.circuitRepo.save(circuit);
    await this.invalidateCircuitCache();
    return saved;
  }

  async findAll(
    status?: string,
    region?: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Circuit> | Circuit[]> {
    const where: any = {};
    if (status) where.status = status;
    if (region) where.region = region;

    if (!pagination?.page) {
      const circuits =
        !status && !region
          ? await this.circuitRepo.find({ order: { created_at: 'DESC' } })
          : await this.circuitRepo.find({
              where,
              order: { created_at: 'DESC' },
            });
      return circuits;
    }

    const page = pagination.page;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.circuitRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginated(data, total, page, limit);
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

  validateCircuitTransition(current: string, next: string): boolean {
    const allowed: Record<string, string[]> = {
      draft: ['pending', 'archived'],
      pending: ['approved', 'rejected', 'archived'],
      approved: ['archived'],
      rejected: ['draft', 'archived'],
      archived: [],
    };
    if (current === next) return true;
    return allowed[current]?.includes(next) ?? false;
  }

  private async assertNoConfirmedReservations(
    circuitId: string,
    message: string,
  ): Promise<void> {
    const count = await this.reservationRepo.count({
      where: { circuit: { id: circuitId }, status: 'confirmed' },
    });
    if (count > 0) {
      throw new BadRequestException(message);
    }
  }

  async update(id: string, dto: Partial<CreateCircuitDto>): Promise<Circuit> {
    const circuit = await this.findById(id);
    const protectedFields: (keyof CreateCircuitDto)[] = [
      'start_date',
      'end_date',
      'duration_days',
      'duration_nights',
      'base_price',
      'max_participants',
    ];
    const hasProtectedChanges = protectedFields.some(
      (f) => (dto as any)[f] !== undefined,
    );
    if (hasProtectedChanges) {
      await this.assertNoConfirmedReservations(
        id,
        "Impossible de modifier le prix, les dates, la durée ou la capacité maximale d'un circuit qui a des réservations confirmées.",
      );
    }

    if (dto.title !== undefined) circuit.title = dto.title;
    if (dto.description !== undefined)
      circuit.description = dto.description ?? null;
    if (dto.start_date !== undefined)
      circuit.start_date = dto.start_date ? new Date(dto.start_date) : null;
    if (dto.end_date !== undefined)
      circuit.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.duration_days !== undefined)
      circuit.duration_days = dto.duration_days ?? null;
    if (dto.duration_nights !== undefined)
      circuit.duration_nights = dto.duration_nights ?? null;
    if (dto.region !== undefined) circuit.region = dto.region ?? null;
    if (dto.base_price !== undefined)
      circuit.base_price = dto.base_price ?? null;
    if (dto.currency !== undefined) circuit.currency = dto.currency ?? 'XAF';
    if (dto.max_participants !== undefined)
      circuit.max_participants = dto.max_participants ?? null;
    if (dto.booking_deadline_days !== undefined)
      circuit.booking_deadline_days = dto.booking_deadline_days ?? null;
    if (dto.confirmation_mode !== undefined)
      circuit.confirmation_mode = dto.confirmation_mode ?? null;
    if (dto.inclusions !== undefined)
      circuit.inclusions = dto.inclusions ?? null;
    if (dto.exclusions !== undefined)
      circuit.exclusions = dto.exclusions ?? null;
    if (dto.lat !== undefined) circuit.lat = dto.lat ?? null;
    if (dto.lng !== undefined) circuit.lng = dto.lng ?? null;
    if (dto.address !== undefined) circuit.address = dto.address ?? null;
    if (dto.project_id !== undefined)
      circuit.venue_id = dto.project_id ?? null;
    if (dto.images !== undefined)
      circuit.images = dto.images?.length ? dto.images : null;
    if (dto.cover_image !== undefined)
      circuit.cover_image = dto.cover_image ?? null;
    if (dto.waypoints !== undefined) circuit.waypoints = dto.waypoints ?? null;
    if (dto.availability !== undefined)
      circuit.availability = dto.availability ?? null;
    if (dto.hebergement !== undefined)
      circuit.hebergement = dto.hebergement ?? null;
    const saved = await this.circuitRepo.save(circuit);
    await this.invalidateCircuitCache();

    // Notifier les voyageurs avec réservation confirmée
    const reservations = await this.reservationRepo.find({
      where: { circuit: { id }, status: 'confirmed' },
      relations: ['user', 'circuit'],
    });
    if (reservations.length) {
      const msg = `Le circuit "${circuit.title}" a été modifié. Vérifiez les détails.`;
      for (const r of reservations) {
        this.notificationService
          .create(
            r.user.id,
            'circuit_updated',
            'Circuit modifié',
            msg,
            `/circuits/${id}`,
          )
          .catch(() => {});
      }
      // Notifier aussi les guides concernés
      const guideIds = new Set<string>();
      const circuitWithDays = await this.circuitRepo.findOne({
        where: { id },
        relations: ['days', 'days.programItems'],
      });
      for (const day of circuitWithDays?.days ?? []) {
        for (const prog of day.programItems ?? []) {
          if (prog.guide_id) guideIds.add(prog.guide_id);
        }
      }
      for (const guideId of guideIds) {
        this.notificationService
          .create(
            guideId,
            'circuit_updated',
            'Circuit modifié',
            `Le circuit "${circuit.title}" auquel vous participez a été modifié.`,
            `/circuits/${id}`,
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  // ─── Jours du circuit ──────────────────────────────────

  async addDay(
    circuitId: string,
    dto: CreateCircuitDayDto,
    authorId?: string,
  ): Promise<CircuitDay> {
    const circuit = await this.circuitRepo.findOne({
      where: { id: circuitId },
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    if (authorId && circuit.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    await this.assertNoConfirmedReservations(
      circuitId,
      "Impossible d'ajouter un jour à un circuit qui a des réservations confirmées.",
    );
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
    const saved = await this.dayRepo.save(day);
    await this.invalidateCircuitCache();
    return saved;
  }

  async updateDay(
    circuitId: string,
    dayId: string,
    dto: Partial<CreateCircuitDayDto>,
    authorId?: string,
  ): Promise<CircuitDay> {
    const day = await this.dayRepo.findOne({
      where: { id: dayId },
      relations: ['circuit'],
    });
    if (!day) throw new NotFoundException('Jour introuvable');
    if (day.circuit.id !== circuitId)
      throw new NotFoundException("Jour n'appartient pas à ce circuit");
    if (authorId && day.circuit?.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    if (dto.day_number !== undefined) day.day_number = dto.day_number;
    if (dto.title !== undefined) day.title = dto.title;
    if (dto.description !== undefined)
      day.description = dto.description ?? null;
    if (dto.date !== undefined) day.date = dto.date ? new Date(dto.date) : null;
    if (dto.lat !== undefined) day.lat = dto.lat ?? null;
    if (dto.lng !== undefined) day.lng = dto.lng ?? null;
    if (dto.location_name !== undefined)
      day.location_name = dto.location_name ?? null;
    const saved = await this.dayRepo.save(day);
    await this.invalidateCircuitCache();
    return saved;
  }

  async removeDay(
    circuitId: string,
    dayId: string,
    authorId?: string,
  ): Promise<void> {
    const day = await this.dayRepo.findOne({
      where: { id: dayId },
      relations: ['circuit'],
    });
    if (!day) throw new NotFoundException('Jour introuvable');
    if (day.circuit.id !== circuitId)
      throw new NotFoundException("Jour n'appartient pas à ce circuit");
    if (authorId && day.circuit?.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    await this.assertNoConfirmedReservations(
      circuitId,
      "Impossible de supprimer un jour d'un circuit qui a des réservations confirmées.",
    );
    await this.dayRepo.remove(day);
    await this.invalidateCircuitCache();
  }

  // ─── Options du circuit ────────────────────────────────

  async addOption(
    circuitId: string,
    dto: CreateCircuitOptionDto,
    authorId?: string,
  ): Promise<CircuitOption> {
    const circuit = await this.circuitRepo.findOne({
      where: { id: circuitId },
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    if (authorId && circuit.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    const option = this.optionRepo.create({
      circuit: { id: circuitId } as Circuit,
      offerItem: dto.offer_item_id
        ? ({ id: dto.offer_item_id } as OfferItem)
        : null,
      option_group: dto.option_group ?? null,
      option_type: dto.option_type,
      is_required: dto.is_required ?? false,
      is_included: dto.is_included ?? false,
      extra_price: dto.extra_price ?? null,
      selection_mode: dto.selection_mode ?? null,
      min_quantity: dto.min_quantity ?? null,
      max_quantity: dto.max_quantity ?? null,
    });
    const saved = await this.optionRepo.save(option);
    await this.invalidateCircuitCache();
    return saved;
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

  async addProgramItem(
    dayId: string,
    dto: CreateCircuitProgramItemDto,
    authorId?: string,
  ): Promise<CircuitProgramItem> {
    const day = await this.dayRepo.findOne({
      where: { id: dayId },
      relations: ['circuit'],
    });
    if (!day) throw new NotFoundException('Jour introuvable');
    if (authorId && day.circuit?.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    await this.assertNoConfirmedReservations(
      day.circuit.id,
      "Impossible d'ajouter une activité à un circuit qui a des réservations confirmées.",
    );

    // Invariant : si linked_offer_item_id, l'item existe bien
    let catalogPrice: number | null = null;
    if (dto.linked_offer_item_id) {
      const item = await this.offerItemRepo.findOne({
        where: { id: dto.linked_offer_item_id },
        relations: ['prices'],
      });
      if (!item) {
        throw new NotFoundException('OfferItem référencé introuvable');
      }
      // Auto-remplissage du prix catalogue si aucun prix explicite
      if (dto.price === undefined && item.prices?.length) {
        const defaultPrice =
          item.prices.find((p) => p.is_default) ?? item.prices[0];
        catalogPrice = Number(defaultPrice.price);
      }
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
      guide_id: dto.guide_id ?? null,
      guide_name: dto.guide_name ?? null,
      category: dto.category ?? null,
      subtypes: dto.subtypes?.length ? dto.subtypes : null,
      price: dto.price ?? catalogPrice ?? null,
      photos: dto.photos?.length ? dto.photos : null,
      unit_details: dto.unit_details ?? null,
      fields: dto.fields ?? null,
      external_reference: dto.external_reference ?? null,
      is_external_reference: dto.is_external_reference ?? false,
      external_provider_name: dto.external_provider_name ?? null,
    });
    const saved = await this.programItemRepo.save(item);
    await this.invalidateCircuitCache();
    return saved;
  }

  async updateProgramItem(
    itemId: string,
    dto: Partial<CreateCircuitProgramItemDto>,
    authorId?: string,
  ): Promise<CircuitProgramItem> {
    const item = await this.programItemRepo.findOne({
      where: { id: itemId },
      relations: ['circuitDay', 'circuitDay.circuit'],
    });
    if (!item) throw new NotFoundException('Activité introuvable');
    if (authorId && item.circuitDay?.circuit?.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.description !== undefined)
      item.description = dto.description ?? null;
    if (dto.start_time !== undefined)
      item.start_time = this.normalizeTime(dto.start_time);
    if (dto.end_time !== undefined)
      item.end_time = this.normalizeTime(dto.end_time);
    if (dto.is_included !== undefined) item.is_included = dto.is_included;
    if (dto.is_required !== undefined) item.is_required = dto.is_required;
    if (dto.linked_offer_item_id !== undefined) {
      if (dto.linked_offer_item_id) {
        const linked = await this.offerItemRepo.findOne({
          where: { id: dto.linked_offer_item_id },
        });
        if (!linked)
          throw new NotFoundException('OfferItem référencé introuvable');
      }
      item.linked_offer_item_id = dto.linked_offer_item_id ?? null;
    }
    if (dto.linked_location_id !== undefined)
      item.linked_location_id = dto.linked_location_id ?? null;
    if (dto.emoji !== undefined) item.emoji = dto.emoji ?? null;
    if (dto.duration_minutes !== undefined)
      item.duration_minutes = dto.duration_minutes ?? null;
    if (dto.distance_km !== undefined)
      item.distance_km = dto.distance_km ?? null;
    if (dto.transport_mode !== undefined)
      item.transport_mode = dto.transport_mode ?? null;
    if (dto.guide_id !== undefined) item.guide_id = dto.guide_id ?? null;
    if (dto.guide_name !== undefined) item.guide_name = dto.guide_name ?? null;
    if (dto.category !== undefined) item.category = dto.category ?? null;
    if (dto.subtypes !== undefined)
      item.subtypes = dto.subtypes?.length ? dto.subtypes : null;
    if (dto.price !== undefined) item.price = dto.price ?? null;
    if (dto.photos !== undefined)
      item.photos = dto.photos?.length ? dto.photos : null;
    if (dto.unit_details !== undefined)
      item.unit_details = dto.unit_details ?? null;
    if (dto.fields !== undefined) item.fields = dto.fields ?? null;
    if (dto.external_reference !== undefined)
      item.external_reference = dto.external_reference ?? null;
    if (dto.is_external_reference !== undefined)
      item.is_external_reference = dto.is_external_reference;
    if (dto.external_provider_name !== undefined)
      item.external_provider_name = dto.external_provider_name ?? null;
    const saved = await this.programItemRepo.save(item);
    await this.invalidateCircuitCache();
    return saved;
  }

  async removeProgramItem(itemId: string, authorId?: string): Promise<void> {
    const item = await this.programItemRepo.findOne({
      where: { id: itemId },
      relations: ['circuitDay', 'circuitDay.circuit'],
    });
    if (!item) throw new NotFoundException('Activité introuvable');
    if (authorId && item.circuitDay?.circuit?.author_id !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres circuits',
      );
    }
    await this.assertNoConfirmedReservations(
      item.circuitDay.circuit.id,
      "Impossible de supprimer une activité d'un circuit qui a des réservations confirmées.",
    );
    await this.programItemRepo.remove(item);
    await this.invalidateCircuitCache();
  }

  // ─── Réservation de circuit ────────────────────────────

  async reserve(
    userId: string,
    dto: ReserveCircuitDto,
  ): Promise<CircuitReservation> {
    const circuit = await this.circuitRepo.findOne({
      where: { id: dto.circuit_id },
      relations: ['days', 'days.programItems'],
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable');
    if (circuit.status !== 'approved')
      throw new BadRequestException("Ce circuit n'est pas encore publié");

    const participantsCount = dto.participants_count ?? 1;
    if (
      circuit.max_participants &&
      participantsCount > circuit.max_participants
    ) {
      throw new BadRequestException(
        `Le nombre de participants (${participantsCount}) dépasse la limite (${circuit.max_participants})`,
      );
    }

    if (circuit.confirmation_mode === 'manual') {
      const existingPending = await this.reservationRepo.count({
        where: { circuit: { id: dto.circuit_id }, status: 'pending' },
      });
      if (
        circuit.max_participants &&
        existingPending + participantsCount > circuit.max_participants
      ) {
        throw new BadRequestException(
          'Pas assez de places disponibles (des réservations en attente existent)',
        );
      }
    }

    const result = await this.reservationApp.createTransaction(
      async (manager) => {
        // Réserver capacité pour les activités liées
        const allProgramItems: CircuitProgramItem[] = [];
        const allDayDates: (Date | null)[] = [];
        for (const day of circuit.days ?? []) {
          const dayDate = day.date || circuit.start_date;
          for (const prog of day.programItems ?? []) {
            allProgramItems.push(prog);
            allDayDates.push(dayDate);
          }
        }

        await this.reservationApp
          .reserveProgramItemsCapacity(
            allProgramItems,
            allDayDates,
            participantsCount,
            manager,
          )
          .catch((err: Error) => {
            throw new BadRequestException(err.message);
          });

        const selectedOptions: {
          circuitOption: CircuitOption;
          quantity: number;
        }[] = [];
        if (dto.options?.length) {
          for (const opt of dto.options) {
            const optEntity = await manager.findOne(CircuitOption, {
              where: { id: opt.circuit_option_id },
            });
            if (!optEntity) continue;
            selectedOptions.push({
              circuitOption: optEntity,
              quantity: opt.quantity ?? 1,
            });
          }

          await this.reservationApp
            .reserveOptionsCapacity(
              selectedOptions.map((s) => s.circuitOption),
              circuit.start_date,
              selectedOptions.map((s) => s.quantity),
              manager,
            )
            .catch((err: Error) => {
              throw new BadRequestException(err.message);
            });
        }

        const pricing = this.pricingService.calculateCircuitPrice(
          circuit,
          participantsCount,
          selectedOptions,
        );

        const reservationStatus =
          circuit.confirmation_mode === 'manual' ? 'pending' : 'confirmed';
        const reservation = this.reservationRepo.create({
          circuit: { id: dto.circuit_id } as Circuit,
          user: { id: userId } as User,
          participants_count: participantsCount,
          base_total: pricing.baseTotal,
          options_total: pricing.optionsTotal,
          final_total: pricing.finalTotal,
          status: reservationStatus,
        });
        const saved = await manager.save(reservation);

        for (const sel of selectedOptions) {
          const unitPrice = Number(sel.circuitOption.extra_price ?? 0);
          const lineTotal = unitPrice * sel.quantity;
          await manager.save(
            this.reservationOptionRepo.create({
              circuitReservation: { id: saved.id } as CircuitReservation,
              circuitOption: { id: sel.circuitOption.id } as CircuitOption,
              quantity: sel.quantity,
              unit_price: unitPrice,
              total_price: lineTotal,
            }),
          );
        }

        return { saved, selectedOptions, pricing, reservationStatus };
      },
    );

    // Notifications (hors transaction)
    if (result.reservationStatus === 'confirmed') {
      await this.reservationApp.notifyTraveler(
        userId,
        'booking_confirmed',
        'Circuit réservé',
        `Votre réservation pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}) a été confirmée.`,
        `/circuits/${result.saved.id}`,
      );
    } else {
      await this.reservationApp.notifyTraveler(
        userId,
        'booking_request',
        'Demande de réservation',
        `Votre demande de réservation pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}) a été envoyée. Le prestataire va la confirmer.`,
        `/circuits/${result.saved.id}`,
      );
    }

    if (circuit.author_id && circuit.author_id !== userId) {
      const providerMsg =
        result.reservationStatus === 'confirmed'
          ? `Nouvelle réservation confirmée pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}).`
          : `Nouvelle demande de réservation pour "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}) en attente de votre confirmation.`;
      await this.reservationApp.notifyProvider(
        circuit.author_id,
        'new_booking_request',
        providerMsg,
        `/dashboard/incoming`,
      );
    }

    const guideIds = new Set<string>();
    for (const day of circuit.days ?? []) {
      for (const prog of day.programItems ?? []) {
        if (prog.guide_id) guideIds.add(prog.guide_id);
      }
    }
    for (const guideId of guideIds) {
      if (guideId !== userId) {
        await this.reservationApp.notifyGuide(
          guideId,
          `Un circuit auquel vous participez a été réservé : "${circuit.title}" (${participantsCount} participant${participantsCount > 1 ? 's' : ''}).`,
          `/dashboard/incoming`,
        );
      }
    }

    // Snapshot figé (hors transaction)
    const snapshotDays = (circuit.days ?? []).map((day) => ({
      day_number: day.day_number,
      date: day.date,
      title: day.title,
      programItems: day.programItems ?? [],
    }));
    await this.reservationApp.createCircuitSnapshot(
      result.saved,
      circuit,
      snapshotDays,
      result.selectedOptions,
      result.pricing,
      participantsCount,
    );

    return result.saved;
  }

  async confirmReservation(
    id: string,
    providerId: string,
  ): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ['circuit', 'user'],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.circuit.author_id !== providerId) {
      throw new ForbiddenException(
        'Vous ne pouvez confirmer que les réservations de vos propres circuits',
      );
    }
    if (
      !this.reservationDomain.validateTransition(
        reservation.status,
        'confirmed',
        'circuit',
      )
    ) {
      throw new BadRequestException(
        'Cette réservation ne peut plus être confirmée',
      );
    }
    reservation.status = 'confirmed';
    const saved = await this.reservationRepo.save(reservation);
    await this.reservationApp.notifyTraveler(
      reservation.user.id,
      'booking_confirmed',
      'Réservation circuit confirmée',
      `Votre réservation pour "${reservation.circuit.title}" a été confirmée par le prestataire.`,
      `/circuits/${saved.id}`,
    );
    return saved;
  }

  async rejectReservation(
    id: string,
    providerId: string,
  ): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: [
        'circuit',
        'user',
        'circuit.days',
        'circuit.days.programItems',
      ],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.circuit.author_id !== providerId) {
      throw new ForbiddenException(
        'Vous ne pouvez refuser que les réservations de vos propres circuits',
      );
    }
    if (
      !this.reservationDomain.validateTransition(
        reservation.status,
        'rejected',
        'circuit',
      )
    ) {
      throw new BadRequestException(
        'Cette réservation ne peut plus être refusée',
      );
    }

    return this.reservationApp
      .createTransaction(async (manager) => {
        // Restaurer la capacité
        if (reservation.participants_count) {
          const allProgramItems: CircuitProgramItem[] = [];
          const allDayDates: (Date | null)[] = [];
          for (const day of reservation.circuit.days ?? []) {
            const dayDate = day.date || reservation.circuit.start_date;
            for (const prog of day.programItems ?? []) {
              allProgramItems.push(prog);
              allDayDates.push(dayDate);
            }
          }
          await this.reservationApp.restoreProgramItemsCapacity(
            allProgramItems,
            allDayDates,
            reservation.participants_count,
            manager,
          );

          const options = await manager.find(CircuitOption, {
            where: { circuit: { id: reservation.circuit.id } },
          });
          const quantities = options.map(() => 1);
          await this.reservationApp.restoreOptionsCapacity(
            options,
            reservation.circuit.start_date,
            quantities,
            manager,
          );
        }

        reservation.status = 'rejected';
        const saved = await manager.save(reservation);
        return saved;
      })
      .then(async (saved) => {
        await this.reservationApp.notifyTraveler(
          reservation.user.id,
          'booking_rejected',
          'Réservation circuit refusée',
          `Votre demande de réservation pour "${reservation.circuit.title}" a été refusée par le prestataire.`,
          `/circuits/${reservation.circuit.id}`,
        );
        return saved;
      });
  }

  async findReservationsByUser(userId: string): Promise<CircuitReservation[]> {
    return this.reservationRepo.find({
      where: { user: { id: userId } },
      relations: ['circuit'],
      order: { created_at: 'DESC' },
    });
  }

  async findReservationsByCircuitAuthor(
    authorId: string,
  ): Promise<CircuitReservation[]> {
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
    if (circuit.author_id !== authorId)
      throw new ForbiddenException('Accès refusé');
    await this.circuitRepo.remove(circuit);
    await this.invalidateCircuitCache();
  }

  async updateReservation(
    id: string,
    userId: string,
    body: { participants_count?: number },
  ): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ['circuit', 'user'],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.user.id !== userId)
      throw new ForbiddenException('Accès refusé');
    if (reservation.status === 'cancelled')
      throw new BadRequestException(
        'Impossible de modifier une réservation annulée',
      );

    if (body.participants_count !== undefined) {
      reservation.participants_count = body.participants_count;
      reservation.base_total =
        Number(reservation.circuit?.base_price ?? 0) * body.participants_count;
      reservation.final_total =
        reservation.base_total + Number(reservation.options_total || 0);
    }

    return this.reservationRepo.save(reservation);
  }

  async cancelReservation(
    id: string,
    userId: string,
  ): Promise<CircuitReservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: [
        'circuit',
        'user',
        'circuit.days',
        'circuit.days.programItems',
      ],
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.user.id !== userId)
      throw new ForbiddenException('Accès refusé');
    if (
      !this.reservationDomain.validateTransition(
        reservation.status,
        'cancelled',
        'circuit',
      )
    ) {
      throw new BadRequestException(
        'Cette réservation ne peut plus être annulée',
      );
    }

    return this.reservationApp
      .createTransaction(async (manager) => {
        // Restaurer la capacité
        if (reservation.participants_count) {
          const allProgramItems: CircuitProgramItem[] = [];
          const allDayDates: (Date | null)[] = [];
          for (const day of reservation.circuit.days ?? []) {
            const dayDate = day.date || reservation.circuit.start_date;
            for (const prog of day.programItems ?? []) {
              allProgramItems.push(prog);
              allDayDates.push(dayDate);
            }
          }
          await this.reservationApp.restoreProgramItemsCapacity(
            allProgramItems,
            allDayDates,
            reservation.participants_count,
            manager,
          );

          const options = await manager.find(CircuitOption, {
            where: { circuit: { id: reservation.circuit.id } },
          });
          const quantities = options.map(() => 1);
          await this.reservationApp.restoreOptionsCapacity(
            options,
            reservation.circuit.start_date,
            quantities,
            manager,
          );
        }

        reservation.status = 'cancelled';
        return manager.save(reservation);
      })
      .then(async (saved) => {
        // Notifications
        await this.reservationApp.notifyTraveler(
          userId,
          'booking_cancelled',
          'Réservation circuit annulée',
          `Votre réservation pour "${reservation.circuit.title}" a été annulée.`,
          `/circuits/${reservation.circuit.id}`,
        );

        if (
          reservation.circuit.author_id &&
          reservation.circuit.author_id !== userId
        ) {
          await this.reservationApp.notifyProvider(
            reservation.circuit.author_id,
            'booking_cancelled',
            `La réservation de ${reservation.user.id} pour "${reservation.circuit.title}" a été annulée.`,
            `/dashboard/incoming`,
          );
        }

        const guideIds = new Set<string>();
        for (const day of reservation.circuit.days ?? []) {
          for (const prog of day.programItems ?? []) {
            if (prog.guide_id) guideIds.add(prog.guide_id);
          }
        }
        for (const guideId of guideIds) {
          if (guideId !== userId) {
            await this.reservationApp.notifyGuide(
              guideId,
              `La réservation du circuit "${reservation.circuit.title}" auquel vous participez a été annulée.`,
              `/dashboard/incoming`,
            );
          }
        }

        return saved;
      });
  }

  async getReservationSnapshot(
    reservationId: string,
  ): Promise<CircuitReservationSnapshot | null> {
    return this.snapshotRepo.findOne({
      where: { circuitReservation: { id: reservationId } },
    });
  }

  // ── Cycle de vie automatisé ──

  async checkExpiredReservations(): Promise<number> {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const expired = await this.reservationRepo.find({
      where: { status: 'pending', created_at: LessThan(cutoff) as any },
      relations: [
        'circuit',
        'circuit.days',
        'circuit.days.programItems',
        'user',
      ],
    });
    for (const reservation of expired) {
      await this.cancelReservationCapacity(reservation);
      reservation.status = 'expired';
      await this.reservationRepo.save(reservation);
      await this.reservationApp.notifyTraveler(
        reservation.user.id,
        'booking_expired',
        'Réservation expirée',
        `Votre demande de réservation pour "${reservation.circuit.title}" a expirée faute de confirmation dans les 48h.`,
        `/circuits/${reservation.circuit.id}`,
      );
    }
    return expired.length;
  }

  async finalizeCompletedReservations(): Promise<number> {
    const now = new Date();
    const confirmed = await this.reservationRepo.find({
      where: { status: 'confirmed' },
      relations: ['circuit'],
    });
    let count = 0;
    for (const reservation of confirmed) {
      if (
        reservation.circuit.end_date &&
        new Date(reservation.circuit.end_date) < now
      ) {
        reservation.status = 'completed';
        await this.reservationRepo.save(reservation);
        count++;
      }
    }
    return count;
  }

  private async cancelReservationCapacity(
    reservation: CircuitReservation,
  ): Promise<void> {
    if (!reservation.participants_count) return;
    const circuitWithDays = await this.circuitRepo.findOne({
      where: { id: reservation.circuit.id },
      relations: ['days', 'days.programItems'],
    });
    if (!circuitWithDays) return;
    const allProgramItems: CircuitProgramItem[] = [];
    const allDayDates: (Date | null)[] = [];
    for (const day of circuitWithDays.days ?? []) {
      const dayDate = day.date || circuitWithDays.start_date;
      for (const prog of day.programItems ?? []) {
        allProgramItems.push(prog);
        allDayDates.push(dayDate);
      }
    }
    await this.reservationApp.restoreProgramItemsCapacity(
      allProgramItems,
      allDayDates,
      reservation.participants_count,
    );
    const options = await this.optionRepo.find({
      where: { circuit: { id: circuitWithDays.id } },
    });
    const quantities = options.map(() => 1);
    await this.reservationApp.restoreOptionsCapacity(
      options,
      circuitWithDays.start_date,
      quantities,
    );
  }
}
