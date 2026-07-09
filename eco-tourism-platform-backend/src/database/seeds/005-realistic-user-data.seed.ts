import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideOffering } from '../../guide/entities/guide-offering.entity';
import { GuideOfferingAvailabilityRule } from '../../guide/entities/guide-offering-availability-rule.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { OfferItem } from '../../offer/entities/offer-item.entity';
import { OfferItemPrice } from '../../offer/entities/offer-item-price.entity';
import { TripPlan } from '../../trip-plan/entities/trip-plan.entity';
import { TripPlanItem } from '../../trip-plan/entities/trip-plan-item.entity';
import { Review } from '../../review/entities/review.entity';
import { Notification } from '../../notification/entities/notification.entity';

/**
 * Seed 005 — Realistic user data for key users
 *
 * Creates:
 *  - Additional guide_offerings + availability rules for both guides
 *  - Mobile offers for fakerbennoomen@gmail.com  (project_owner)
 *  - Trip plans mixing guide & project offerings for f.akerbennoomen@gmail.com  (eco_traveler)
 *  - Realistic reviews for guides, guide_offerings, and offers
 *
 * Run via:   npx ts-node -e "import(...)"
 * Or via the custom seed command.
 */

@Injectable()
export class RealisticUserDataSeed {
  constructor(
    @InjectRepository(GuideOffering) private goRepo: Repository<GuideOffering>,
    @InjectRepository(GuideOfferingAvailabilityRule)
    private goaRepo: Repository<GuideOfferingAvailabilityRule>,
    @InjectRepository(Offer) private offerRepo: Repository<Offer>,
    @InjectRepository(OfferItem) private oiRepo: Repository<OfferItem>,
    @InjectRepository(OfferItemPrice)
    private oipRepo: Repository<OfferItemPrice>,
    @InjectRepository(TripPlan) private tpRepo: Repository<TripPlan>,
    @InjectRepository(TripPlanItem) private tpiRepo: Repository<TripPlanItem>,
    @InjectRepository(Review) private revRepo: Repository<Review>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  private GUIDE_KARIM = '6fb2d1e7-39db-4152-b9b5-5b440f551cc9';
  private GUIDE_YOUSSEF = '87a38946-9a54-4bb4-be4a-887be312af15';
  private PO_FAKER = '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e';
  private TRAVELER_FAKER = '7b83e87d-276d-4d89-bb00-ab8ea1243a14';
  private TRAVELER_LEILA = 'a602737a-b07d-4a41-b9c3-cdf1be17036a';
  private TRAVELER_AHMED = 'b09808ee-30a9-4089-bbf7-698e73004ef4';
  private TRAVELER_SARAH = '90b4c5bf-4a47-4737-b033-f7385e22a2e6';

  private existingOfferIds: string[] = [];
  private existingGuideOfferingIds: string[] = [];

  async seed(): Promise<void> {
    console.log('[005] Seeding realistic user data...');
    await this.addGuideOfferings();
    await this.addMobileOffers();
    await this.addTripPlans();
    await this.addReviews();
    console.log('[005] Done.');
  }

  // ── 1. Guide Offerings ──────────────────────────────────────────

  private async addGuideOfferings() {
    // --- Karim: "Randonnée Ksour du Sud" (all_tunisia, on_demand) ---
    const k1 = await this.upsertGuideOffering({
      guide_id: this.GUIDE_KARIM,
      title: 'Randonnée Ksour du Sud',
      description:
        "Découverte des ksour berbères du Sud tunisien : Ksar Ouled Soltane, Ksar Hadada, Ksar Ghilane. Nuits chez l'habitant.",
      languages: 'fr,ar,en',
      price: 180,
      pricing_unit: 'day',
      service_zone_type: 'all_tunisia',
      displacement_allowed: true,
      displacement_max_km: 200,
      status: 'active',
    });
    await this.upsertAvailabilityRule(k1, { availability_type: 'on_demand' });

    // --- Karim: "Safari Photo Désert 2 jours" (point Djerba, date_range) ---
    const k2 = await this.upsertGuideOffering({
      guide_id: this.GUIDE_KARIM,
      title: 'Safari Photo Désert 2 jours',
      description:
        'Expédition photo de 2 jours dans le Grand Erg Oriental. Nuits en bivouac. Matériel photo optionnel.',
      languages: 'fr,ar,en,es',
      price: 350,
      pricing_unit: 'trip',
      service_zone_type: 'point',
      lat: 33.8085,
      lng: 10.9905,
      radius_km: 80,
      displacement_allowed: true,
      displacement_max_km: 150,
      status: 'active',
    });
    await this.upsertAvailabilityRule(k2, {
      availability_type: 'date_range',
      start_date: '2026-09-01',
      end_date: '2026-11-30',
      weekdays: '0,1,2,3,4,5,6',
    });

    // --- Youssef: "Guidage Culturel Djerba" (point, weekly, sur réservation) ---
    const y1 = await this.upsertGuideOffering({
      guide_id: this.GUIDE_YOUSSEF,
      title: 'Tour Guidé Djerba Insolite',
      description:
        "Visite des lieux cachés de Djerba : ateliers d'artisans, synagogues, marchés locaux, dégustation de produits du terroir.",
      languages: 'fr,ar,en',
      price: 80,
      pricing_unit: 'half_day',
      service_zone_type: 'point',
      lat: 33.875,
      lng: 10.86,
      displacement_allowed: true,
      displacement_max_km: 30,
      status: 'active',
    });
    await this.upsertAvailabilityRule(y1, {
      availability_type: 'weekly',
      weekdays: '1,3,5',
      start_time: '09:00',
      end_time: '13:00',
    });
    await this.upsertAvailabilityRule(y1, {
      availability_type: 'weekly',
      weekdays: '2,4',
      start_time: '14:00',
      end_time: '18:00',
    });

    // --- Youssef: "Expédition VTT Kroumirie" (radius, on_demand) ---
    const y2 = await this.upsertGuideOffering({
      guide_id: this.GUIDE_YOUSSEF,
      title: 'Expédition VTT Forêt de Kroumirie',
      description:
        'Descente VTT à travers la forêt de chênes-lièges de Kroumirie. Niveau intermédiaire à avancé. VTT et équipement fournis.',
      languages: 'fr,en',
      price: 130,
      pricing_unit: 'day',
      service_zone_type: 'radius',
      lat: 36.7837,
      lng: 8.6865,
      radius_km: 40,
      displacement_allowed: true,
      displacement_max_km: 80,
      status: 'active',
    });
    await this.upsertAvailabilityRule(y2, { availability_type: 'on_demand' });

    // --- Youssef: "Guidage Spéléologie" (point Djerba, weekly) ---
    const y3 = await this.upsertGuideOffering({
      guide_id: this.GUIDE_YOUSSEF,
      title: 'Initiation Spéléologie Djerba',
      description:
        "Découverte des grottes et cavités naturelles de l'île de Djerba. Matériel fourni. Débutants bienvenus.",
      languages: 'fr,ar',
      price: 70,
      pricing_unit: 'half_day',
      service_zone_type: 'point',
      lat: 33.82,
      lng: 10.87,
      displacement_allowed: false,
      status: 'active',
    });
    await this.upsertAvailabilityRule(y3, {
      availability_type: 'weekly',
      weekdays: '3,6',
      start_time: '08:00',
      end_time: '12:00',
    });
  }

  // ── 2. Mobile Offers for project_owner fakerbennoomen@gmail.com  ──

  private async addMobileOffers() {
    // We attach these offers to one of Faker's projects: "Coopérative Artisanale Tataouine"
    const projectId = 'b1822765-564a-470c-832b-3092cc763554';
    const categoryActivity = '21a655e0-de08-4b62-b0da-7c5337fd93be'; // activity
    const categoryCraft = '04137263-fdbc-468c-8f6b-a7c9b1cc6ae8'; // craft
    const categorySejour = '4c50bfe4-dc54-4b5d-bfa9-308c31c8b356'; // sejour

    // --- Offer 1: Mobile/guided tour ---
    const o1 = await this.upsertOffer({
      author_id: this.PO_FAKER,
      author_type: 'project_owner',
      project_id: projectId,
      title: 'Randonnée Guidée Ksour du Sud',
      description:
        'Randonnée accompagnée par un guide local à travers les ksour du Sud. Transport, repas et guide inclus.',
      price: 250,
      duration: '2 jours',
      offer_type: 'activity',
      region: 'Tataouine',
      location_type: 'mobile',
      latitude: 33.5451,
      longitude: 7.757,
      category_id: categoryActivity,
      status: 'approved',
    });
    const o1Item = await this.upsertOfferItem(o1, {
      name: 'Randonnée Ksour (1 pers.)',
      item_type: 'guided_tour',
    });
    await this.upsertPrice(o1Item, {
      label: 'Adulte',
      price: 250,
      pricing_unit: 'per_person',
      is_default: true,
    });

    // --- Offer 2: Mobile craft workshop ---
    const o2 = await this.upsertOffer({
      author_id: this.PO_FAKER,
      author_type: 'project_owner',
      project_id: projectId,
      title: 'Atelier Poterie Mobile Tataouine',
      description:
        'Atelier poterie qui se déplace chez vous (hôtel, gîte). Initiation aux techniques ancestrales. Matériel fourni.',
      price: 60,
      duration: '3h',
      offer_type: 'workshop',
      region: 'Tataouine',
      location_type: 'mobile',
      latitude: 33.5451,
      longitude: 7.757,
      category_id: categoryCraft,
      status: 'approved',
    });
    const o2Item = await this.upsertOfferItem(o2, {
      name: 'Atelier Poterie Adulte',
      item_type: 'workshop',
    });
    await this.upsertPrice(o2Item, {
      label: 'Adulte',
      price: 60,
      pricing_unit: 'per_person',
      is_default: true,
    });

    // --- Offer 3: Fixed eco-tour package ---
    const o3 = await this.upsertOffer({
      author_id: this.PO_FAKER,
      author_type: 'project_owner',
      project_id: projectId,
      title: 'Séjour Immersion Tataouine',
      description:
        "Séjour tout compris de 5 jours : hébergement chez l'habitant, randonnées, ateliers artisanaux, cuisine locale.",
      price: 750,
      duration: '5 jours',
      offer_type: 'sejour',
      region: 'Tataouine',
      location_type: 'fixed',
      meeting_point: 'Centre-ville, Tataouine',
      meeting_lat: 33.5451,
      meeting_lng: 7.757,
      category_id: categorySejour,
      status: 'approved',
    });
    const o3a = await this.upsertOfferItem(o3, {
      name: 'Séjour 5 jours (1 pers.)',
      item_type: 'package',
    });
    await this.upsertPrice(o3a, {
      label: 'Adulte',
      price: 750,
      pricing_unit: 'per_person',
      is_default: true,
    });
    const o3b = await this.upsertOfferItem(o3, {
      name: 'Repas optionnel (végétarien)',
      item_type: 'meal',
    });
    await this.upsertPrice(o3b, {
      label: 'Repas',
      price: 25,
      pricing_unit: 'per_unit',
      is_default: false,
    });
  }

  // ── 3. Trip Plans for f.akerbennoomen@gmail.com  (eco_traveler) ──

  private async addTripPlans() {
    // Fetch all offer_items created above for reference
    const myOfferItems = await this.oiRepo.find({
      where: { offer: { author_id: this.PO_FAKER } },
      relations: ['offer'],
    });

    const tripPlan = await this.tpRepo.save({
      title: 'Road Trip Sud Tunisien — Juillet 2026',
      description:
        'Plan de 7 jours combinant randonnée dans les ksour, ateliers poterie, et guidage avec Karim Bouazizi.',
      start_date: '2026-07-15',
      end_date: '2026-07-21',
      status: 'planning',
      eco_traveler_id: this.TRAVELER_FAKER,
    });

    if (myOfferItems.length >= 2) {
      // Day 1: Randonnée Ksour
      await this.tpiRepo.save({
        trip_plan_id: tripPlan.id,
        day_number: 1,
        sort_order: 1,
        offer_item_id: myOfferItems[0].id,
        notes: 'RDV 8h au centre-ville. Prévoir chaussures de marche et eau.',
      });

      // Day 3: Atelier poterie
      await this.tpiRepo.save({
        trip_plan_id: tripPlan.id,
        day_number: 3,
        sort_order: 1,
        offer_item_id: myOfferItems[1].id,
        notes: "Après-midi. L'artisan se déplace à l'hébergement.",
      });
    }

    // Add guide offering items (just store as notes with guide_id)
    const karimOfferings = await this.goRepo.find({
      where: { guide_id: this.GUIDE_KARIM },
    });
    if (karimOfferings.length > 0) {
      await this.tpiRepo.save({
        trip_plan_id: tripPlan.id,
        day_number: 2,
        sort_order: 1,
        notes: `Guidage: ${karimOfferings[0].title} avec Karim Bouazizi. ${karimOfferings[0].price} TND/jour.`,
        guide_id: this.GUIDE_KARIM,
      });
    }

    const youssefOfferings = await this.goRepo.find({
      where: { guide_id: this.GUIDE_YOUSSEF },
    });
    if (youssefOfferings.length > 0) {
      await this.tpiRepo.save({
        trip_plan_id: tripPlan.id,
        day_number: 5,
        sort_order: 1,
        notes: `Guidage: ${youssefOfferings[0].title} avec Youssef Meslek. ${youssefOfferings[0].price} TND/jour.`,
        guide_id: this.GUIDE_YOUSSEF,
      });
    }

    // Also create a simpler trip for Sarah
    const sarahPlan = await this.tpRepo.save({
      title: 'Week-end Art & Nature Djerba',
      description:
        "2 jours pour découvrir l'artisanat djerbien et les paysages naturels avec un guide local.",
      start_date: '2026-08-10',
      end_date: '2026-08-11',
      status: 'planning',
      eco_traveler_id: this.TRAVELER_SARAH,
    });
    await this.tpiRepo.save({
      trip_plan_id: sarahPlan.id,
      day_number: 1,
      sort_order: 1,
      notes:
        'Visite guidée de Houmt Souk avec Youssef Meslek — rendez-vous 9h place de la mairie.',
      guide_id: this.GUIDE_YOUSSEF,
    });

    // Trip for Leila
    const leilaPlan = await this.tpRepo.save({
      title: 'Aventure Photo Désert & Ksour',
      description:
        'Safari photo de 5 jours : Matmata, Tataouine, Douz. Guidé par Karim Bouazizi.',
      start_date: '2026-10-01',
      end_date: '2026-10-05',
      status: 'planning',
      eco_traveler_id: this.TRAVELER_LEILA,
    });
    await this.tpiRepo.save({
      trip_plan_id: leilaPlan.id,
      day_number: 2,
      sort_order: 1,
      notes:
        "Safari Photo Désert avec Karim — départ 6h de l'hôtel. Prévoir batteries de rechange !",
      guide_id: this.GUIDE_KARIM,
    });
  }

  // ── 4. Reviews ───────────────────────────────────────────────

  private async addReviews() {
    const karimOfferings = await this.goRepo.find({
      where: { guide_id: this.GUIDE_KARIM },
    });
    const youssefOfferings = await this.goRepo.find({
      where: { guide_id: this.GUIDE_YOUSSEF },
    });

    // Review Karim as a guide (by Ahmed)
    await this.upsertReview({
      author_id: this.TRAVELER_AHMED,
      target_type: 'guide',
      target_id: this.GUIDE_KARIM,
      rating: 5,
      comment:
        'Guide exceptionnel ! Karim connaît le désert comme personne. Son safari photo était incroyable, il sait exactement où trouver les meilleurs angles au coucher du soleil.',
    });
    // Review Karim's offering (by Ahmed)
    if (karimOfferings.length > 0) {
      await this.upsertReview({
        author_id: this.TRAVELER_AHMED,
        target_type: 'guide_offering',
        target_id: karimOfferings[0].id,
        rating: 5,
        comment:
          "Le trekking dans les ksour était une expérience inoubliable. Karim nous a raconté l'histoire de chaque ksar avec passion.",
      });
    }

    // Review Youssef as a guide (by Sarah)
    await this.upsertReview({
      author_id: this.TRAVELER_SARAH,
      target_type: 'guide',
      target_id: this.GUIDE_YOUSSEF,
      rating: 5,
      comment:
        'Youssef est un guide passionné et très professionnel. Sa visite de Djerba était riche en anecdotes et en découvertes. Je recommande à 100% !',
    });
    if (youssefOfferings.length > 0) {
      await this.upsertReview({
        author_id: this.TRAVELER_SARAH,
        target_type: 'guide_offering',
        target_id: youssefOfferings[0].id,
        rating: 4,
        comment:
          'Très belle randonnée. Les paysages étaient magnifiques. Seul bémol : prévoir plus de temps pour profiter des arrêts photo.',
      });
    }

    // Review Faker's mobile offre "Randonnée Guidée Ksour" (by Leila)
    const offer = await this.offerRepo.findOne({
      where: {
        author_id: this.PO_FAKER,
        title: 'Randonnée Guidée Ksour du Sud',
      },
    });
    if (offer) {
      await this.upsertReview({
        author_id: this.TRAVELER_LEILA,
        target_type: 'offer',
        target_id: offer.id,
        rating: 5,
        comment:
          "Superbe randonnée organisée de A à Z. Le guide local était très connaisseur et le repas chez l'habitant délicieux. Le transport inclus est un plus.",
      });
    }

    // Review Faker as project_owner (by Ahmed)
    await this.upsertReview({
      author_id: this.TRAVELER_AHMED,
      target_type: 'project_owner',
      target_id: this.PO_FAKER,
      rating: 4,
      comment:
        'Très bon organisateur. Les activités étaient variées et bien planifiées. Un peu de retard le premier jour mais sinon tout était parfait.',
    });

    // Notifications for the reviews
    await this.notifRepo.save({
      user_id: this.GUIDE_KARIM,
      type: 'new_review',
      title: 'Nouvel avis 5★',
      body: 'Ahmed a laissé un avis sur votre profil guide.',
      link: `/profile/guide/${this.GUIDE_KARIM}`,
      is_read: false,
    });
    await this.notifRepo.save({
      user_id: this.GUIDE_YOUSSEF,
      type: 'new_review',
      title: 'Nouvel avis 5★',
      body: 'Sarah a laissé un avis sur votre profil guide.',
      link: `/profile/guide/${this.GUIDE_YOUSSEF}`,
      is_read: false,
    });
    await this.notifRepo.save({
      user_id: this.PO_FAKER,
      type: 'new_review',
      title: 'Nouvel avis 4★',
      body: 'Ahmed a laissé un avis sur votre profil.',
      link: `/profile/project-owner/${this.PO_FAKER}`,
      is_read: false,
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  private async upsertGuideOffering(data: any): Promise<any> {
    const existing = await this.goRepo.findOne({
      where: { guide_id: data.guide_id, title: data.title },
    });
    if (existing) return existing;
    const saved = await this.goRepo.save(data);
    this.existingGuideOfferingIds.push(saved.id);
    return saved;
  }

  private async upsertAvailabilityRule(
    offering: any,
    data: any,
  ): Promise<void> {
    const existing = await this.goaRepo.findOne({
      where: {
        guideOffering: { id: offering.id },
        availability_type: data.availability_type,
      },
    });
    if (existing) return;
    await this.goaRepo.save({ ...data, guideOffering: offering });
  }

  private async upsertOffer(data: any): Promise<any> {
    const existing = await this.offerRepo.findOne({
      where: { author_id: data.author_id, title: data.title },
    });
    if (existing) return existing;
    const saved = await this.offerRepo.save(data);
    this.existingOfferIds.push(saved.id);
    return saved;
  }

  private async upsertOfferItem(offer: any, data: any): Promise<any> {
    const existing = await this.oiRepo.findOne({
      where: { offer: { id: offer.id }, name: data.name },
    });
    if (existing) return existing;
    return this.oiRepo.save({ ...data, offer: offer });
  }

  private async upsertPrice(item: any, data: any): Promise<void> {
    const existing = await this.oipRepo.findOne({
      where: { offerItem: { id: item.id }, label: data.label },
    });
    if (existing) return;
    await this.oipRepo.save({ ...data, offerItem: item });
  }

  private async upsertReview(data: any): Promise<void> {
    const existing = await this.revRepo.findOne({
      where: {
        author_id: data.author_id,
        target_type: data.target_type,
        target_id: data.target_id,
      },
    });
    if (existing) return;
    await this.revRepo.save(data);
  }
}
