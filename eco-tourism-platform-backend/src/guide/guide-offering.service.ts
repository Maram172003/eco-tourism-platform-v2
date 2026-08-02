import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideOffering } from './entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from './entities/guide-offering-availability-rule.entity';
import { GuideOfferingSession } from './entities/guide-offering-session.entity';
import { GuideOfferingBlock } from './entities/guide-offering-block.entity';
import { GuideOfferingPrice } from './entities/guide-offering-price.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import {
  CreateGuideOfferingDto,
  UpdateGuideOfferingDto,
  CreateGuideOfferingAvailabilityRuleDto,
  CreateGuideOfferingBlockDto,
  CreateGuideOfferingPriceDto,
  CreateGuideOfferingSessionDto,
} from './dto/guide-offering.dto';

@Injectable()
export class GuideOfferingService {
  constructor(
    @InjectRepository(GuideOffering)
    private readonly repo: Repository<GuideOffering>,
    @InjectRepository(GuideOfferingAvailabilityRule)
    private readonly ruleRepo: Repository<GuideOfferingAvailabilityRule>,
    @InjectRepository(GuideOfferingSession)
    private readonly sessionRepo: Repository<GuideOfferingSession>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(GuideOfferingBlock)
    private readonly blockRepo: Repository<GuideOfferingBlock>,
    @InjectRepository(GuideOfferingPrice)
    private readonly priceRepo: Repository<GuideOfferingPrice>,
  ) {}

  async create(
    guideId: string,
    dto: CreateGuideOfferingDto,
  ): Promise<GuideOffering> {
    const offering = this.repo.create({
      guide_id: guideId,
      title: dto.title,
      description: dto.description ?? null,
      languages: dto.languages ?? null,
      price: dto.price,
      pricing_unit: dto.pricing_unit ?? 'hour',
      min_travelers: dto.min_travelers ?? null,
      max_travelers: dto.max_travelers ?? null,
      service_zone_type: dto.service_zone_type ?? 'point',
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      radius_km: dto.radius_km ?? null,
      zone_governorate: dto.zone_governorate ?? null,
      zone_municipality: dto.zone_municipality ?? null,
      displacement_allowed: dto.displacement_allowed ?? false,
      displacement_max_km: dto.displacement_max_km ?? null,
      displacement_type: dto.displacement_type ?? null,
    });
    return this.repo.save(offering);
  }

  async findByGuide(guideId: string): Promise<GuideOffering[]> {
    return this.repo.find({
      where: { guide_id: guideId },
      relations: ['availabilityRules'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<GuideOffering> {
    const offering = await this.repo.findOne({
      where: { id },
      relations: ['availabilityRules'],
    });
    if (!offering) throw new NotFoundException('Offre de guidage introuvable.');
    return offering;
  }

  async findAllPublic(): Promise<GuideOffering[]> {
    return this.repo.find({
      where: { status: 'active' },
      relations: ['availabilityRules'],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    guideId: string,
    id: string,
    dto: UpdateGuideOfferingDto,
  ): Promise<GuideOffering> {
    const offering = await this.findById(id);
    if (offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    if (dto.title !== undefined) offering.title = dto.title;
    if (dto.description !== undefined) offering.description = dto.description;
    if (dto.languages !== undefined) offering.languages = dto.languages;
    if (dto.price !== undefined) offering.price = dto.price;
    if (dto.pricing_unit !== undefined)
      offering.pricing_unit = dto.pricing_unit;
    if (dto.min_travelers !== undefined)
      offering.min_travelers = dto.min_travelers;
    if (dto.max_travelers !== undefined)
      offering.max_travelers = dto.max_travelers;
    if (dto.service_zone_type !== undefined)
      offering.service_zone_type = dto.service_zone_type;
    if (dto.lat !== undefined) offering.lat = dto.lat;
    if (dto.lng !== undefined) offering.lng = dto.lng;
    if (dto.radius_km !== undefined) offering.radius_km = dto.radius_km;
    if (dto.zone_governorate !== undefined)
      offering.zone_governorate = dto.zone_governorate;
    if (dto.zone_municipality !== undefined)
      offering.zone_municipality = dto.zone_municipality;
    if (dto.displacement_allowed !== undefined)
      offering.displacement_allowed = dto.displacement_allowed;
    if (dto.displacement_max_km !== undefined)
      offering.displacement_max_km = dto.displacement_max_km;
    if (dto.displacement_type !== undefined)
      offering.displacement_type = dto.displacement_type;
    return this.repo.save(offering);
  }

  async remove(guideId: string, id: string): Promise<{ message: string }> {
    const offering = await this.findById(id);
    if (offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    await this.repo.remove(offering);
    return { message: 'Offre de guidage supprimée.' };
  }

  async addAvailabilityRule(
    offeringId: string,
    dto: CreateGuideOfferingAvailabilityRuleDto,
    guideId: string,
  ): Promise<GuideOfferingAvailabilityRule> {
    const offering = await this.findById(offeringId);
    if (offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    const rule = this.ruleRepo.create({
      guideOffering: { id: offeringId } as GuideOffering,
      availability_type: dto.availability_type,
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      weekdays: dto.weekdays ?? null,
      start_time: dto.start_time ?? null,
      end_time: dto.end_time ?? null,
      recurrence_rule: dto.recurrence_rule ?? null,
    });
    return this.ruleRepo.save(rule);
  }

  async findAvailabilityRules(
    offeringId: string,
  ): Promise<GuideOfferingAvailabilityRule[]> {
    await this.findById(offeringId);
    return this.ruleRepo.find({
      where: { guideOffering: { id: offeringId }, is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  async removeAvailabilityRule(
    ruleId: string,
    guideId: string,
  ): Promise<{ message: string }> {
    const rule = await this.ruleRepo.findOne({
      where: { id: ruleId },
      relations: ['guideOffering'],
    });
    if (!rule)
      throw new NotFoundException('Règle de disponibilité introuvable.');
    if (rule.guideOffering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    await this.ruleRepo.remove(rule);
    return { message: 'Règle supprimée.' };
  }

  // ─── Sessions ───────────────────────────────────────

  async generateSessions(
    offeringId: string,
    daysAhead: number = 90,
    guideId?: string,
  ): Promise<GuideOfferingSession[]> {
    const offering = await this.repo.findOne({
      where: { id: offeringId },
      relations: ['availabilityRules'],
    });
    if (!offering) throw new NotFoundException('Offre de guidage introuvable.');
    if (guideId && offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');

    const rules = (offering.availabilityRules ?? []).filter((r) => r.is_active);
    if (!rules.length)
      throw new BadRequestException(
        "Aucune règle de disponibilité active. Créez d'abord une règle.",
      );

    const capacity = offering.max_travelers ?? null;

    // Conserver les sessions ayant des réservations actives, supprimer les autres
    const existing = await this.sessionRepo.find({
      where: { guideOffering: { id: offeringId } },
    });
    const bookedSessionIds: string[] = await this.reservationRepo
      .createQueryBuilder()
      .select('"guide_offering_session_id"')
      .where(
        '"guide_offering_session_id" IS NOT NULL AND status != :cancelled',
        { cancelled: 'cancelled' },
      )
      .getRawMany()
      .then((rows) =>
        rows.map((r: any) => r.guide_offering_session_id).filter(Boolean),
      );
    const bookedSet = new Set(bookedSessionIds);
    const deletable = existing.filter((s) => !bookedSet.has(s.id));
    if (deletable.length) {
      await this.sessionRepo.remove(deletable);
    }

    const sessions: GuideOfferingSession[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + daysAhead);

    for (const rule of rules) {
      if (rule.availability_type === 'on_demand') continue;

      const startTime = rule.start_time ?? '09:00';
      const endTime = rule.end_time ?? '17:00';

      switch (rule.availability_type) {
        case 'date_range': {
          if (rule.start_date && rule.end_date) {
            const start = new Date(rule.start_date);
            const end = new Date(rule.end_date);
            const weekdays = rule.weekdays;
            for (
              let d = new Date(start);
              d <= end && d <= maxDate;
              d.setDate(d.getDate() + 1)
            ) {
              if (d < today) continue;
              if (weekdays?.length && !weekdays.includes(d.getDay())) continue;
              sessions.push(
                this.sessionRepo.create({
                  guideOffering: { id: offeringId } as GuideOffering,
                  date: d.toISOString().split('T')[0],
                  start_time: startTime,
                  end_time: endTime,
                  total_capacity: capacity,
                  remaining_capacity: capacity,
                }),
              );
            }
          }
          break;
        }

        case 'weekly': {
          const weekdays = rule.weekdays ?? [1, 2, 3, 4, 5];
          for (
            let d = new Date(today);
            d <= maxDate;
            d.setDate(d.getDate() + 1)
          ) {
            if (weekdays.includes(d.getDay())) {
              sessions.push(
                this.sessionRepo.create({
                  guideOffering: { id: offeringId } as GuideOffering,
                  date: d.toISOString().split('T')[0],
                  start_time: startTime,
                  end_time: endTime,
                  total_capacity: capacity,
                  remaining_capacity: capacity,
                }),
              );
            }
          }
          break;
        }

        case 'daily': {
          for (
            let d = new Date(today);
            d <= maxDate;
            d.setDate(d.getDate() + 1)
          ) {
            sessions.push(
              this.sessionRepo.create({
                guideOffering: { id: offeringId } as GuideOffering,
                date: d.toISOString().split('T')[0],
                start_time: startTime,
                end_time: endTime,
                total_capacity: capacity,
                remaining_capacity: capacity,
              }),
            );
          }
          break;
        }
      }
    }

    return this.sessionRepo.save(sessions);
  }

  async findSessions(offeringId: string): Promise<GuideOfferingSession[]> {
    await this.findById(offeringId);
    return this.sessionRepo.find({
      where: { guideOffering: { id: offeringId } },
      order: { date: 'ASC', start_time: 'ASC' },
    });
  }

  async createSession(
    offeringId: string,
    dto: CreateGuideOfferingSessionDto,
    guideId?: string,
  ): Promise<GuideOfferingSession> {
    const offering = await this.findById(offeringId);
    if (guideId && offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    const session = this.sessionRepo.create({
      guideOffering: { id: offeringId } as GuideOffering,
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      total_capacity: dto.total_capacity ?? null,
      remaining_capacity: dto.total_capacity ?? null,
      price_override: dto.price_override ?? null,
    });
    return this.sessionRepo.save(session);
  }

  async removeSession(
    offeringId: string,
    sessionId: string,
    guideId: string,
  ): Promise<{ message: string }> {
    const offering = await this.findById(offeringId);
    if (offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, guideOffering: { id: offeringId } },
    });
    if (!session) throw new NotFoundException('Session introuvable.');
    await this.sessionRepo.remove(session);
    return { message: 'Session supprimée.' };
  }

  // ─── Blocks ──────────────────────────────────────────

  async findBlocks(offeringId: string): Promise<GuideOfferingBlock[]> {
    return this.blockRepo.find({
      where: { guideOffering: { id: offeringId }, is_active: true },
      order: { start_date: 'ASC' },
    });
  }

  async createBlock(
    offeringId: string,
    dto: CreateGuideOfferingBlockDto,
    guideId: string,
  ): Promise<GuideOfferingBlock> {
    const offering = await this.repo.findOne({ where: { id: offeringId } });
    if (!offering) throw new NotFoundException('Prestation introuvable.');
    if (offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    const block = this.blockRepo.create({
      guideOffering: { id: offeringId } as any,
      start_date: dto.start_date,
      end_date: dto.end_date,
      reason: dto.reason ?? null,
    });
    return this.blockRepo.save(block);
  }

  async removeBlock(
    blockId: string,
    guideId: string,
  ): Promise<{ message: string }> {
    const block = await this.blockRepo.findOne({
      where: { id: blockId },
      relations: ['guideOffering'],
    });
    if (!block) throw new NotFoundException('Bloc introuvable.');
    if (block.guideOffering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    await this.blockRepo.remove(block);
    return { message: 'Bloc supprimé.' };
  }

  // ─── Prices ──────────────────────────────────────────

  async findPrices(offeringId: string): Promise<GuideOfferingPrice[]> {
    return this.priceRepo.find({
      where: { guideOffering: { id: offeringId } },
      order: { created_at: 'ASC' },
    });
  }

  async createPrice(
    offeringId: string,
    dto: CreateGuideOfferingPriceDto,
    guideId: string,
  ): Promise<GuideOfferingPrice> {
    const offering = await this.repo.findOne({ where: { id: offeringId } });
    if (!offering) throw new NotFoundException('Prestation introuvable.');
    if (offering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    const price = this.priceRepo.create({
      guideOffering: { id: offeringId } as any,
      label: dto.label,
      price: dto.price,
      min_quantity: dto.min_quantity ?? null,
      max_quantity: dto.max_quantity ?? null,
      is_default: dto.is_default ?? false,
    });
    return this.priceRepo.save(price);
  }

  async removePrice(
    priceId: string,
    guideId: string,
  ): Promise<{ message: string }> {
    const price = await this.priceRepo.findOne({
      where: { id: priceId },
      relations: ['guideOffering'],
    });
    if (!price) throw new NotFoundException('Tarif introuvable.');
    if (price.guideOffering.guide_id !== guideId)
      throw new ForbiddenException('Accès refusé.');
    await this.priceRepo.remove(price);
    return { message: 'Tarif supprimé.' };
  }
}
