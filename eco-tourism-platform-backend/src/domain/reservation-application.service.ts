import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ReservationDomainService } from './reservation-domain.service';
import { CapacityDomainService } from './capacity-domain.service';
import { PricingDomainService } from './pricing-domain.service';
import { NotificationService } from '../notification/notification.service';
import { CircuitReservation } from '../circuit/entities/circuit-reservation.entity';
import { CircuitReservationSnapshot } from '../circuit/entities/circuit-reservation-snapshot.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { CircuitOption } from '../circuit/entities/circuit-option.entity';
import { CircuitProgramItem } from '../circuit/entities/circuit-program-item.entity';

@Injectable()
export class ReservationApplicationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly domainService: ReservationDomainService,
    private readonly capacityService: CapacityDomainService,
    private readonly pricingService: PricingDomainService,
    private readonly notificationService: NotificationService,
  ) {}

  getDomainService(): ReservationDomainService {
    return this.domainService;
  }

  async createTransaction<T>(
    fn: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await fn(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async reserveProgramItemsCapacity(
    programItems: CircuitProgramItem[],
    dayDates: (Date | null)[],
    participantsCount: number,
    manager?: EntityManager,
  ): Promise<void> {
    for (let i = 0; i < programItems.length; i++) {
      const prog = programItems[i];
      const dayDate = dayDates[i];
      if (prog.linked_offer_item_id && dayDate) {
        const available = await this.capacityService.checkAvailability(
          prog.linked_offer_item_id,
          dayDate,
          participantsCount,
          manager,
        );
        if (!available) {
          const dateStr = dayDate.toLocaleDateString('fr-FR');
          throw new Error(
            `Capacité insuffisante pour "${prog.title}" le ${dateStr}`,
          );
        }
        await this.capacityService.reserve(
          prog.linked_offer_item_id,
          dayDate,
          participantsCount,
          manager,
        );
      }
    }
  }

  async restoreProgramItemsCapacity(
    programItems: CircuitProgramItem[],
    dayDates: (Date | null)[],
    participantsCount: number,
    manager?: EntityManager,
  ): Promise<void> {
    for (let i = 0; i < programItems.length; i++) {
      const prog = programItems[i];
      const dayDate = dayDates[i];
      if (prog.linked_offer_item_id && dayDate) {
        await this.capacityService.restore(
          prog.linked_offer_item_id,
          dayDate,
          participantsCount,
          manager,
        );
      }
    }
  }

  async reserveOptionsCapacity(
    options: CircuitOption[],
    startDate: Date | null,
    quantities: number[],
    manager?: EntityManager,
  ): Promise<void> {
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const offerItemId = opt.offerItem?.id ?? null;
      if (offerItemId && startDate) {
        const available = await this.capacityService.checkAvailability(
          offerItemId,
          startDate,
          quantities[i],
          manager,
        );
        if (!available) {
          throw new Error(`Capacité insuffisante pour l'option "${opt.id}"`);
        }
        await this.capacityService.reserve(
          offerItemId,
          startDate,
          quantities[i],
          manager,
        );
      }
    }
  }

  async restoreOptionsCapacity(
    options: CircuitOption[],
    startDate: Date | null,
    quantities: number[],
    manager?: EntityManager,
  ): Promise<void> {
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const offerItemId = opt.offerItem?.id ?? null;
      if (offerItemId && startDate) {
        await this.capacityService.restore(
          offerItemId,
          startDate,
          quantities[i],
          manager,
        );
      }
    }
  }

  // ── Notifications unifiées ──

  async notifyTraveler(
    userId: string,
    type: string,
    title: string,
    message: string,
    link: string,
  ): Promise<void> {
    await this.notificationService
      .create(userId, type, title, message, link)
      .catch(() => {});
  }

  async notifyProvider(
    authorId: string,
    type: string,
    message: string,
    link: string,
  ): Promise<void> {
    await this.notificationService
      .create(authorId, type, 'Nouvelle réservation', message, link)
      .catch(() => {});
  }

  async notifyGuide(
    guideId: string,
    message: string,
    link: string,
  ): Promise<void> {
    await this.notificationService
      .create(
        guideId,
        'new_booking_request',
        'Nouvelle réservation circuit',
        message,
        link,
      )
      .catch(() => {});
  }

  // ── Snapshot (circuits) ──

  async createCircuitSnapshot(
    reservation: CircuitReservation,
    circuit: {
      id: string;
      title: string;
      description: string | null;
      start_date: Date | null;
      end_date: Date | null;
      duration_days: number | null;
      duration_nights: number | null;
      base_price: number | null;
      currency: string;
      max_participants: number | null;
      confirmation_mode: string | null;
      difficulty_level: string | null;
      inclusions: string | null;
      exclusions: string | null;
      author_id: string;
    },
    days: {
      day_number: number;
      date: Date | null;
      title: string;
      programItems: CircuitProgramItem[];
    }[],
    selectedOptions: { circuitOption: CircuitOption; quantity: number }[],
    pricing: { baseTotal: number; optionsTotal: number; finalTotal: number },
    participantsCount: number,
  ): Promise<void> {
    const snapshotRepo = this.dataSource.getRepository(
      CircuitReservationSnapshot,
    );
    await snapshotRepo.save(
      snapshotRepo.create({
        circuitReservation: { id: reservation.id },
        data: {
          circuit: {
            id: circuit.id,
            title: circuit.title,
            description: circuit.description,
            start_date: circuit.start_date?.toISOString?.() ?? null,
            end_date: circuit.end_date?.toISOString?.() ?? null,
            duration_days: circuit.duration_days,
            duration_nights: circuit.duration_nights,
            base_price: Number(circuit.base_price ?? 0),
            currency: circuit.currency,
            max_participants: circuit.max_participants,
            confirmation_mode: circuit.confirmation_mode,
            difficulty_level: circuit.difficulty_level,
            inclusions: circuit.inclusions,
            exclusions: circuit.exclusions,
            author_id: circuit.author_id,
          },
          program: days.map((day) => ({
            day_number: day.day_number,
            date: day.date?.toISOString?.() ?? null,
            title: day.title,
            items: day.programItems.map((prog) => ({
              title: prog.title,
              start_time: prog.start_time,
              end_time: prog.end_time,
              is_included: prog.is_included,
              price: Number(prog.price ?? 0),
              category: prog.category,
              guide_id: prog.guide_id,
              guide_name: prog.guide_name,
              linked_offer_item_id: prog.linked_offer_item_id,
            })),
          })),
          pricing: {
            participants_count: participantsCount,
            base_total: Number(pricing.baseTotal),
            options_total: Number(pricing.optionsTotal),
            final_total: Number(pricing.finalTotal),
          },
          selected_options: selectedOptions.map((sel) => ({
            option_id: sel.circuitOption.id,
            option_group: sel.circuitOption.option_group,
            option_type: sel.circuitOption.option_type,
            quantity: sel.quantity,
            unit_price: Number(sel.circuitOption.extra_price ?? 0),
            total_price:
              Number(sel.circuitOption.extra_price ?? 0) * sel.quantity,
          })),
        },
      }),
    );
  }
}
