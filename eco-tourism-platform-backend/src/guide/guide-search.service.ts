import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { GuideOffering } from './entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from './entities/guide-offering-availability-rule.entity';
import { GuideOfferingSession } from './entities/guide-offering-session.entity';

@Injectable()
export class GuideSearchService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
    @InjectRepository(GuideOffering)
    private readonly offeringRepo: Repository<GuideOffering>,
    @InjectRepository(GuideOfferingAvailabilityRule)
    private readonly ruleRepo: Repository<GuideOfferingAvailabilityRule>,
    @InjectRepository(GuideOfferingSession)
    private readonly sessionRepo: Repository<GuideOfferingSession>,
  ) {}

  async search(params: {
    date?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    language?: string;
    max_price?: number;
    min_capacity?: number;
    displacement_allowed?: boolean;
    zone?: string;
    query?: string;
    min_rating?: number;
  }) {
    // 1. Filtrage guide (status + query)
    const guideQb = this.guideRepo
      .createQueryBuilder('guide')
      .where('guide.status = :status', { status: 'active' });

    if (params.query) {
      guideQb.andWhere('LOWER(guide.full_name) LIKE :q', {
        q: `%${params.query.toLowerCase()}%`,
      });
    }

    if (params.zone) {
      guideQb.andWhere('LOWER(guide.zone) LIKE :zone', {
        zone: `%${params.zone.toLowerCase()}%`,
      });
    }

    if (params.min_rating !== undefined) {
      guideQb.andWhere('guide.sustainability_score >= :minRating', {
        minRating: params.min_rating,
      });
    }

    const guides = await guideQb.getMany();
    if (!guides.length) return [];
    const guideIds = guides.map((g) => g.user_id);

    // 2. Filtrage offres
    const offQb = this.offeringRepo
      .createQueryBuilder('offering')
      .where('offering.guide_id IN (:...guideIds)', { guideIds })
      .andWhere('offering.status = :active', { active: 'active' });

    if (params.max_price !== undefined) {
      offQb.andWhere('offering.price <= :maxPrice', {
        maxPrice: params.max_price,
      });
    }
    if (params.language) {
      offQb.andWhere('offering.languages LIKE :lang', {
        lang: `%${params.language}%`,
      });
    }
    if (params.displacement_allowed !== undefined) {
      offQb.andWhere('offering.displacement_allowed = :disp', {
        disp: params.displacement_allowed,
      });
    }

    // 3. Filtrage spatial en SQL (haversine)
    if (params.lat !== undefined && params.lng !== undefined) {
      const lat = params.lat;
      const lng = params.lng;
      const radius = params.radius_km ?? 50;
      offQb.andWhere(
        `(
          offering.service_zone_type = 'all_tunisia'
          OR (
            offering.lat IS NOT NULL AND offering.lng IS NOT NULL AND offering.radius_km IS NOT NULL
            AND (
              6371 * acos(
                cos(radians(:lat)) * cos(radians(offering.lat))
                * cos(radians(offering.lng) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(offering.lat))
              )
            ) <= offering.radius_km
          )
          OR (
            offering.displacement_allowed = true
            AND offering.displacement_max_km IS NOT NULL
            AND offering.lat IS NOT NULL AND offering.lng IS NOT NULL
            AND (
              6371 * acos(
                cos(radians(:lat)) * cos(radians(offering.lat))
                * cos(radians(offering.lng) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(offering.lat))
              )
            ) <= offering.displacement_max_km
          )
        )`,
        { lat, lng },
      );
    }

    const offerings = await offQb.getMany();
    if (!offerings.length) return [];

    const offeringMap = new Map<string, GuideOffering[]>();
    for (const o of offerings) {
      if (!offeringMap.has(o.guide_id)) offeringMap.set(o.guide_id, []);
      offeringMap.get(o.guide_id)!.push(o);
    }

    const matchedGuideIds = new Set(offerings.map((o) => o.guide_id));

    // 4. Vérification disponibilité par date — via les sessions
    if (params.date) {
      const targetDate = new Date(params.date);

      for (const offering of offerings) {
        if (!matchedGuideIds.has(offering.guide_id)) continue;

        // Chercher une session existante pour cette date
        const session = await this.sessionRepo.findOne({
          where: {
            guideOffering: { id: offering.id },
            date: targetDate,
            status: 'available',
          },
        });

        if (
          session &&
          session.remaining_capacity !== null &&
          session.remaining_capacity > 0
        ) {
          continue; // disponible via session
        }

        // Sinon vérifier les règles de disponibilité
        const rules = await this.ruleRepo.find({
          where: {
            guideOffering: { id: offering.id },
            is_active: true,
          },
        });

        const targetDay = targetDate.getDay();
        const isAvailable = rules.some((rule) => {
          if (rule.availability_type === 'on_demand') return true;
          if (
            rule.availability_type === 'date_range' ||
            rule.availability_type === 'weekly'
          ) {
            if (rule.start_date && targetDate < new Date(rule.start_date))
              return false;
            if (rule.end_date && targetDate > new Date(rule.end_date))
              return false;
            if (rule.weekdays?.length && !rule.weekdays.includes(targetDay))
              return false;
            return true;
          }
          if (rule.availability_type === 'daily') return true;
          return false;
        });

        if (!isAvailable) matchedGuideIds.delete(offering.guide_id);
      }
    }

    const result = guides.filter((g) => matchedGuideIds.has(g.user_id));

    return result.map((g) => ({
      ...g,
      offerings: offeringMap.get(g.user_id) || [],
    }));
  }
}
