import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { Venue } from '../project-owner/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Review } from '../review/entities/review.entity';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { ModerationLog } from './entities/moderation-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Publication)
    private readonly pubRepo: Repository<Publication>,

    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    @InjectRepository(GuideOffering)
    private readonly guideOfferingRepo: Repository<GuideOffering>,

    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,

    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(EcoTraveler)
    private readonly ecoRepo: Repository<EcoTraveler>,

    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(ModerationLog)
    private readonly logRepo: Repository<ModerationLog>,

    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD — Vue globale
  // ═══════════════════════════════════════════════════════════════════════════

  async getStatsOverview() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      usersByRole,
      totalPublications,
      pubsByStatus,
      totalOffers,
      offersByStatus,
      totalCircuits,
      circuitsByStatus,
      totalVenues,
      venuesByStatus,
      totalBookings,
      bookingsByStatus,
      totalGuideOfferings,
      guideOfferingsByStatus,
      totalReviews,
      recentUsers,
      bookingsToday,
      bookingsThisMonth,
      revenueToday,
      revenueThisMonth,
      suspendedProviders,
      totalOrganizations,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.createQueryBuilder('u').select('u.role', 'role').addSelect('COUNT(*)', 'count').groupBy('u.role').getRawMany(),
      this.pubRepo.count(),
      this.pubRepo.createQueryBuilder('p').select('p.status', 'status').addSelect('COUNT(*)', 'count').groupBy('p.status').getRawMany(),
      this.offerRepo.count(),
      this.offerRepo.createQueryBuilder('o').select('o.status', 'status').addSelect('COUNT(*)', 'count').groupBy('o.status').getRawMany(),
      this.circuitRepo.count(),
      this.circuitRepo.createQueryBuilder('c').select('c.status', 'status').addSelect('COUNT(*)', 'count').groupBy('c.status').getRawMany(),
      this.venueRepo.count(),
      this.venueRepo.createQueryBuilder('v').select('v.status', 'status').addSelect('COUNT(*)', 'count').groupBy('v.status').getRawMany(),
      this.bookingRepo.count(),
      this.bookingRepo.createQueryBuilder('b').select('b.status', 'status').addSelect('COUNT(*)', 'count').groupBy('b.status').getRawMany(),
      this.guideOfferingRepo.count(),
      this.guideOfferingRepo.createQueryBuilder('g').select('g.status', 'status').addSelect('COUNT(*)', 'count').groupBy('g.status').getRawMany(),
      this.reviewRepo.count(),
      this.userRepo.find({ order: { created_at: 'DESC' }, take: 5, select: ['id', 'email', 'role', 'status', 'created_at'] }),
      this.bookingRepo.createQueryBuilder('b').where('b.created_at >= :start', { start: startOfDay }).getCount(),
      this.bookingRepo.createQueryBuilder('b').where('b.created_at >= :start', { start: startOfMonth }).getCount(),
      this.bookingRepo.createQueryBuilder('b').select('COALESCE(SUM(b.total_price), 0)', 'total').where('b.created_at >= :start AND b.status IN (:...s)', { start: startOfDay, s: ['confirmed', 'completed'] }).getRawOne(),
      this.bookingRepo.createQueryBuilder('b').select('COALESCE(SUM(b.total_price), 0)', 'total').where('b.created_at >= :start AND b.status IN (:...s)', { start: startOfMonth, s: ['confirmed', 'completed'] }).getRawOne(),
      this.providerRepo.createQueryBuilder('po').where('po.status = :s', { s: 'suspended' }).getCount(),
      this.providerRepo.count(),
    ]);

    const toMap = (rows: any[]) => {
      const m: Record<string, number> = {};
      rows.forEach((r) => (m[r.status] = Number(r.count)));
      return m;
    };

    const roleMap: Record<string, number> = {};
    usersByRole.forEach((r) => (roleMap[r.role] = Number(r.count)));

    const pendingModeration =
      (pubsByStatus.find((r) => r.status === 'pending') ? Number(pubsByStatus.find((r) => r.status === 'pending').count) : 0) +
      (offersByStatus.find((r) => r.status === 'pending') ? Number(offersByStatus.find((r) => r.status === 'pending').count) : 0) +
      (circuitsByStatus.find((r) => r.status === 'pending') ? Number(circuitsByStatus.find((r) => r.status === 'pending').count) : 0) +
      (venuesByStatus.find((r) => r.status === 'pending') ? Number(venuesByStatus.find((r) => r.status === 'pending').count) : 0) +
      (guideOfferingsByStatus.find((r) => r.status === 'pending') ? Number(guideOfferingsByStatus.find((r) => r.status === 'pending').count) : 0);

    return {
      users: { total: totalUsers, by_role: roleMap, recent: recentUsers },
      organizations: { total: totalOrganizations },
      publications: { total: totalPublications, by_status: toMap(pubsByStatus) },
      offers: { total: totalOffers, by_status: toMap(offersByStatus) },
      circuits: { total: totalCircuits, by_status: toMap(circuitsByStatus) },
      venues: { total: totalVenues, by_status: toMap(venuesByStatus) },
      guide_offerings: { total: totalGuideOfferings, by_status: toMap(guideOfferingsByStatus) },
      bookings: {
        total: totalBookings,
        by_status: toMap(bookingsByStatus),
        today: bookingsToday,
        this_month: bookingsThisMonth,
        revenue_today: Number(revenueToday?.total ?? 0),
        revenue_this_month: Number(revenueThisMonth?.total ?? 0),
      },
      reviews: { total: totalReviews },
      suspended_providers: suspendedProviders,
      pending_moderation: pendingModeration,
      moderation: {
        pending_publications: pubsByStatus.find((r) => r.status === 'pending') ? Number(pubsByStatus.find((r) => r.status === 'pending').count) : 0,
        pending_offers: offersByStatus.find((r) => r.status === 'pending') ? Number(offersByStatus.find((r) => r.status === 'pending').count) : 0,
        pending_circuits: circuitsByStatus.find((r) => r.status === 'pending') ? Number(circuitsByStatus.find((r) => r.status === 'pending').count) : 0,
        pending_venues: venuesByStatus.find((r) => r.status === 'pending') ? Number(venuesByStatus.find((r) => r.status === 'pending').count) : 0,
        pending_guide_offerings: guideOfferingsByStatus.find((r) => r.status === 'pending') ? Number(guideOfferingsByStatus.find((r) => r.status === 'pending').count) : 0,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. GESTION DES UTILISATEURS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAllUsers(query: { role?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const qb = this.userRepo.createQueryBuilder('u').orderBy('u.created_at', 'DESC');

    if (query.role) qb.andWhere('u.role = :role', { role: query.role });
    if (query.status) qb.andWhere('u.status = :status', { status: query.status });
    if (query.search) qb.andWhere('(u.email ILIKE :search)', { search: `%${query.search}%` });

    const [users, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    const enriched = await Promise.all(
      users.map(async (u) => {
        let profile: any = null;
        if (u.role === ('eco_traveler' as any)) profile = await this.ecoRepo.findOne({ where: { user_id: u.id } });
        else if (u.role === ('guide' as any)) profile = await this.guideRepo.findOne({ where: { user_id: u.id } });
        else if (u.role === ('provider' as any)) profile = await this.providerRepo.findOne({ where: { user_id: u.id } });
        return {
          id: u.id,
          email: u.email,
          role: u.role,
          status: u.status,
          created_at: u.created_at,
          ban_until: u.ban_until,
          full_name: profile?.full_name ?? null,
          photo: profile?.photo ?? null,
        };
      }),
    );

    return { users: enriched, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    let profile: any = null;
    if (user.role === ('eco_traveler' as any)) profile = await this.ecoRepo.findOne({ where: { user_id: id } });
    else if (user.role === ('guide' as any)) profile = await this.guideRepo.findOne({ where: { user_id: id } });
    else if (user.role === ('provider' as any)) profile = await this.providerRepo.findOne({ where: { user_id: id } });
    return { user: { id: user.id, email: user.email, role: user.role, status: user.status, created_at: user.created_at, ban_until: user.ban_until }, profile };
  }

  async updateUserRole(id: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    if (role === 'admin') throw new BadRequestException('Impossible de définir le rôle admin via cette interface.');
    user.role = role as any;
    return this.userRepo.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    await this.userRepo.remove(user);
    return { message: 'Utilisateur supprimé.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. GESTION DES PROVIDERS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAllProviders(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const qb = this.providerRepo.createQueryBuilder('po').orderBy('po.created_at', 'DESC');

    if (query.status) qb.andWhere('po.status = :status', { status: query.status });
    if (query.search) qb.andWhere('(po.full_name ILIKE :search)', { search: `%${query.search}%` });

    const [providers, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    const enriched = await Promise.all(
      providers.map(async (p) => {
        const [venuesCount, offersCount, bookingsCount, revenue] = await Promise.all([
          this.venueRepo.createQueryBuilder('v').where('v.provider_id = :pid', { pid: p.user_id }).getCount(),
          this.offerRepo.createQueryBuilder('o').where("o.author_id = :pid AND o.author_type = 'provider'", { pid: p.user_id }).getCount(),
          this.bookingRepo.createQueryBuilder('b').innerJoin('b.offer', 'o').where("o.author_id = :pid AND o.author_type = 'provider'", { pid: p.user_id }).getCount(),
          this.bookingRepo.createQueryBuilder('b').innerJoin('b.offer', 'o').where("o.author_id = :pid AND o.author_type = 'provider' AND b.status IN (:...s)", { pid: p.user_id, s: ['confirmed', 'completed'] }).select('COALESCE(SUM(b.total_price), 0)', 'total').getRawOne(),
        ]);
        return {
          user_id: p.user_id,
          full_name: p.full_name,
          organization: p.organization,
          status: p.status,
          sustainability_score: p.sustainability_score,
          venues_count: venuesCount,
          offers_count: offersCount,
          bookings_count: bookingsCount,
          revenue: Number(revenue?.total ?? 0),
          created_at: p.created_at,
        };
      }),
    );

    return { providers: enriched, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async suspendProvider(id: string) {
    const provider = await this.providerRepo.findOne({ where: { user_id: id } });
    if (!provider) throw new NotFoundException('Provider introuvable.');
    provider.status = 'suspended';
    await this.providerRepo.save(provider);
    const user = await this.userRepo.findOne({ where: { id } });
    if (user) {
      user.status = 'banned' as any;
      await this.userRepo.save(user);
    }
    return { message: 'Provider suspendu.' };
  }

  async reactivateProvider(id: string) {
    const provider = await this.providerRepo.findOne({ where: { user_id: id } });
    if (!provider) throw new NotFoundException('Provider introuvable.');
    provider.status = 'active';
    await this.providerRepo.save(provider);
    const user = await this.userRepo.findOne({ where: { id } });
    if (user) {
      user.status = 'active' as any;
      user.ban_until = null;
      await this.userRepo.save(user);
    }
    return { message: 'Provider réactivé.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. GESTION DES RÉSERVATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAllBookings(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const qb = this.bookingRepo.createQueryBuilder('b').orderBy('b.created_at', 'DESC');

    if (query.status) qb.andWhere('b.status = :status', { status: query.status });
    if (query.search) qb.andWhere('(b.booking_ref ILIKE :search)', { search: `%${query.search}%` });

    const [bookings, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let offerTitle: string | null = null;
        let travelerEmail: string | null = null;
        if (b.offer_id) {
          const offer = await this.offerRepo.findOne({ where: { id: b.offer_id }, select: ['id', 'title'] });
          offerTitle = offer?.title ?? null;
        }
        if (b.traveler_id) {
          const traveler = await this.userRepo.findOne({ where: { id: b.traveler_id }, select: ['id', 'email'] });
          travelerEmail = traveler?.email ?? null;
        }
        return {
          id: b.id,
          booking_ref: b.booking_ref,
          status: b.status,
          total_price: b.total_price,
          currency: b.currency,
          created_at: b.created_at,
          offer_title: offerTitle,
          traveler_email: travelerEmail,
        };
      }),
    );

    return { bookings: enriched, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GESTION DES AVIS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAllReviews(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const [reviews, total] = await this.reviewRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const author = await this.userRepo.findOne({ where: { id: r.author_id }, select: ['id', 'email'] });
        return {
          id: r.id,
          author_id: r.author_id,
          author_email: author?.email ?? null,
          target_type: r.target_type,
          target_id: r.target_id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
        };
      }),
    );

    return { reviews: enriched, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async deleteReview(id: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Avis introuvable.');
    await this.reviewRepo.remove(review);
    return { message: 'Avis supprimé.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DURABILITÉ
  // ═══════════════════════════════════════════════════════════════════════════

  async getSustainabilityStats() {
    const [offersWithScore, avgOfferScore, topProviders, topVenues, offersWithCarbon] = await Promise.all([
      this.offerRepo.createQueryBuilder('o').where('o.sustainability_score IS NOT NULL').getCount(),
      this.offerRepo.createQueryBuilder('o').select('AVG(o.sustainability_score)', 'avg').where('o.sustainability_score IS NOT NULL').getRawOne(),
      this.providerRepo.createQueryBuilder('po').where('po.sustainability_score IS NOT NULL AND po.status = :s', { s: 'active' }).orderBy('po.sustainability_score', 'DESC').limit(5).getMany(),
      this.venueRepo.createQueryBuilder('v').where('v.sustainability_score IS NOT NULL AND v.status = :s', { s: 'active' }).orderBy('v.sustainability_score', 'DESC').limit(5).getMany(),
      this.offerRepo.createQueryBuilder('o').where('o.carbon_estimate_kg IS NOT NULL').select('SUM(o.carbon_estimate_kg)', 'total').getRawOne(),
    ]);

    return {
      offers_with_score: offersWithScore,
      avg_offer_score: Number(avgOfferScore?.avg ?? 0).toFixed(1),
      top_providers: topProviders.map((p) => ({ user_id: p.user_id, full_name: p.full_name, score: p.sustainability_score })),
      top_venues: topVenues.map((v) => ({ id: v.id, name: v.name, score: v.sustainability_score })),
      total_carbon_kg: Number(offersWithCarbon?.total ?? 0).toFixed(1),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLICATIONS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  getPendingPublications() {
    return this.pubRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approvePublication(id: string, adminId: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'approved';
    pub.rejection_reason = null;
    const saved = await this.pubRepo.save(pub);
    if (pub.author_id) {
      this.notificationService.create(pub.author_id, 'admin_approved', 'Publication approuvée', `Votre publication "${pub.title}" a été approuvée.`, `/publications/${pub.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'publication', id, 'approve');
    return saved;
  }

  async rejectPublication(id: string, reason: string, adminId: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'rejected';
    pub.rejection_reason = reason;
    const saved = await this.pubRepo.save(pub);
    if (pub.author_id) {
      this.notificationService.create(pub.author_id, 'admin_rejected', 'Publication rejetée', `Votre publication "${pub.title}" a été rejetée. Motif : ${reason}`, `/publications/${pub.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'publication', id, 'reject', reason);
    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OFFERS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  getPendingOffers() {
    return this.offerRepo.find({ where: [{ status: 'pending' }, { status: 'draft' }], order: { created_at: 'DESC' } });
  }

  async approveOffer(id: string, adminId: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'approved';
    offer.rejection_reason = null;
    const saved = await this.offerRepo.save(offer);
    if (offer.author_id) {
      this.notificationService.create(offer.author_id, 'admin_approved', 'Offre approuvée', `Votre offre "${offer.title}" a été approuvée.`, `/offers/${offer.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'offer', id, 'approve');
    return saved;
  }

  async rejectOffer(id: string, reason: string, adminId: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'rejected';
    offer.rejection_reason = reason;
    const saved = await this.offerRepo.save(offer);
    if (offer.author_id) {
      this.notificationService.create(offer.author_id, 'admin_rejected', 'Offre rejetée', `Votre offre "${offer.title}" a été rejetée. Motif : ${reason}`, `/offers/${offer.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'offer', id, 'reject', reason);
    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VENUES MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  getPendingProjects() {
    return this.venueRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveProject(id: string, adminId: string) {
    const venue = await this.findProjectOrFail(id);
    venue.status = 'active';
    venue.rejection_reason = null;
    const saved = await this.venueRepo.save(venue);
    if (venue.provider_id) {
      this.notificationService.create(venue.provider_id, 'admin_approved', 'Établissement approuvé', `Votre établissement "${venue.name}" a été approuvé.`, `/venues/${venue.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'venue', id, 'approve');
    return saved;
  }

  async rejectProject(id: string, reason: string, adminId: string) {
    const venue = await this.findProjectOrFail(id);
    venue.status = 'rejected';
    venue.rejection_reason = reason;
    const saved = await this.venueRepo.save(venue);
    if (venue.provider_id) {
      this.notificationService.create(venue.provider_id, 'admin_rejected', 'Établissement rejeté', `Votre établissement "${venue.name}" a été rejeté. Motif : ${reason}`, `/venues/${venue.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'venue', id, 'reject', reason);
    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CIRCUITS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  getPendingCircuits() {
    return this.circuitRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveCircuit(id: string, adminId: string) {
    const circuit = await this.findCircuitOrFail(id);
    circuit.status = 'approved';
    circuit.rejection_reason = null;
    const saved = await this.circuitRepo.save(circuit);
    if (circuit.author_id) {
      this.notificationService.create(circuit.author_id, 'admin_approved', 'Circuit approuvé', `Votre circuit "${circuit.title}" a été approuvé.`, `/circuits/${circuit.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'circuit', id, 'approve');
    return saved;
  }

  async rejectCircuit(id: string, reason: string, adminId: string) {
    const circuit = await this.findCircuitOrFail(id);
    circuit.status = 'rejected';
    circuit.rejection_reason = reason;
    const saved = await this.circuitRepo.save(circuit);
    if (circuit.author_id) {
      this.notificationService.create(circuit.author_id, 'admin_rejected', 'Circuit rejeté', `Votre circuit "${circuit.title}" a été rejeté. Motif : ${reason}`, `/circuits/${circuit.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'circuit', id, 'reject', reason);
    return saved;
  }

  async archiveCircuit(id: string, adminId: string) {
    const circuit = await this.findCircuitOrFail(id);
    circuit.status = 'archived';
    const saved = await this.circuitRepo.save(circuit);
    await this.logAction(adminId, 'circuit', id, 'archive');
    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GUIDE OFFERINGS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  getPendingGuideOfferings() {
    return this.guideOfferingRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveGuideOffering(id: string, adminId: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    offering.status = 'active';
    const saved = await this.guideOfferingRepo.save(offering);
    if (offering.guide_id) {
      this.notificationService.create(offering.guide_id, 'admin_approved', 'Service de guidage approuvé', `Votre offre "${offering.title}" a été approuvée.`, `/guide-offerings/${offering.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'guide-offering', id, 'approve');
    return saved;
  }

  async rejectGuideOffering(id: string, reason: string, adminId: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    offering.status = 'rejected';
    const saved = await this.guideOfferingRepo.save(offering);
    if (offering.guide_id) {
      this.notificationService.create(offering.guide_id, 'admin_rejected', 'Service de guidage rejeté', `Votre offre "${offering.title}" a été rejetée. Motif : ${reason}`, `/guide-offerings/${offering.id}`).catch(() => {});
    }
    await this.logAction(adminId, 'guide-offering', id, 'reject', reason);
    return saved;
  }

  async archiveGuideOffering(id: string, adminId: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    offering.status = 'archived';
    const saved = await this.guideOfferingRepo.save(offering);
    await this.logAction(adminId, 'guide-offering', id, 'archive');
    return saved;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BAN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async getBannedUsers() {
    const users = await this.userRepo.find({ where: { status: 'banned' as any } });
    return Promise.all(
      users.map(async (u) => {
        let profile: { full_name?: string | null; photo?: string | null } | null = null;
        if (u.role === ('eco_traveler' as any)) profile = await this.ecoRepo.findOne({ where: { user_id: u.id } });
        else if (u.role === ('guide' as any)) profile = await this.guideRepo.findOne({ where: { user_id: u.id } });
        else if (u.role === ('provider' as any)) profile = await this.providerRepo.findOne({ where: { user_id: u.id } });
        return { user_id: u.id, email: u.email, role: u.role, status: u.status, ban_until: u.ban_until, banned_at: u.updated_at, full_name: profile?.full_name ?? null, photo: profile?.photo ?? null };
      }),
    );
  }

  async updateBan(userId: string, banDays?: number, note?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    user.status = 'banned' as any;
    if (banDays && banDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + banDays);
      d.setHours(23, 59, 59, 999);
      user.ban_until = d;
    } else {
      user.ban_until = null as any;
    }
    user.refresh_token = null as any;
    user.refresh_token_expires_at = null as any;
    await this.userRepo.save(user);
    await this.mailService.sendAccountBanned(user.email, null, note ?? '', banDays ?? 0);
    return { message: 'Ban mis à jour.', ban_until: user.ban_until };
  }

  async unbanUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    user.status = 'active' as any;
    user.ban_until = null;
    await this.userRepo.save(user);
    await this.mailService.sendUnban(user.email);
    return { message: 'Utilisateur débanni.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAuditLogs(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const [logs, total] = await this.logRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { logs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETAIL ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getPublicationDetail(id: string) {
    const pub = await this.findPubOrFail(id);
    const author = pub.author_id
      ? await this.userRepo.findOne({ where: { id: pub.author_id }, select: ['id', 'email', 'role'] })
      : null;
    let authorProfile: any = null;
    if (author) {
      if (author.role === ('eco_traveler' as any)) authorProfile = await this.ecoRepo.findOne({ where: { user_id: author.id } });
      else if (author.role === ('guide' as any)) authorProfile = await this.guideRepo.findOne({ where: { user_id: author.id } });
      else if (author.role === ('provider' as any)) authorProfile = await this.providerRepo.findOne({ where: { user_id: author.id } });
    }
    return { ...pub, author: author ? { ...author, full_name: authorProfile?.full_name ?? null } : null };
  }

  async getOfferDetail(id: string) {
    const offer = await this.findOfferOrFail(id);
    const author = offer.author_id
      ? await this.userRepo.findOne({ where: { id: offer.author_id }, select: ['id', 'email', 'role'] })
      : null;
    let authorProfile: any = null;
    if (author) {
      if (author.role === ('provider' as any)) authorProfile = await this.providerRepo.findOne({ where: { user_id: author.id } });
      else if (author.role === ('guide' as any)) authorProfile = await this.guideRepo.findOne({ where: { user_id: author.id } });
    }
    return { ...offer, author: author ? { ...author, full_name: authorProfile?.full_name ?? null } : null };
  }

  async getVenueDetail(id: string) {
    const venue = await this.findProjectOrFail(id);
    const provider = venue.provider_id
      ? await this.providerRepo.findOne({ where: { user_id: venue.provider_id } })
      : null;
    const offersCount = await this.offerRepo.createQueryBuilder('o').where("o.author_id = :pid AND o.author_type = 'provider'", { pid: venue.provider_id }).getCount();
    return { ...venue, provider: provider ? { full_name: provider.full_name, email: null } : null, offers_count: offersCount };
  }

  async getCircuitDetail(id: string) {
    const circuit = await this.findCircuitOrFail(id);
    const author = circuit.author_id
      ? await this.userRepo.findOne({ where: { id: circuit.author_id }, select: ['id', 'email', 'role'] })
      : null;
    let authorProfile: any = null;
    if (author) {
      if (author.role === ('guide' as any)) authorProfile = await this.guideRepo.findOne({ where: { user_id: author.id } });
      else if (author.role === ('provider' as any)) authorProfile = await this.providerRepo.findOne({ where: { user_id: author.id } });
    }
    return { ...circuit, author: author ? { ...author, full_name: authorProfile?.full_name ?? null } : null };
  }

  async getGuideOfferingDetail(id: string) {
    const offering = await this.findGuideOfferingOrFail(id);
    const guide = offering.guide_id
      ? await this.guideRepo.findOne({ where: { user_id: offering.guide_id } })
      : null;
    const user = guide
      ? await this.userRepo.findOne({ where: { id: guide.user_id }, select: ['id', 'email'] })
      : null;
    return { ...offering, guide: guide ? { full_name: guide.full_name, email: user?.email ?? null } : null };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async findPubOrFail(id: string) {
    const pub = await this.pubRepo.findOne({ where: { id } });
    if (!pub) throw new NotFoundException('Publication introuvable.');
    return pub;
  }

  private async findOfferOrFail(id: string) {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable.');
    return offer;
  }

  private async findProjectOrFail(id: string) {
    const venue = await this.venueRepo.findOne({ where: { id } });
    if (!venue) throw new NotFoundException('Établissement introuvable.');
    return venue;
  }

  private async findCircuitOrFail(id: string) {
    const circuit = await this.circuitRepo.findOne({ where: { id } });
    if (!circuit) throw new NotFoundException('Circuit introuvable.');
    return circuit;
  }

  private async findGuideOfferingOrFail(id: string) {
    const offering = await this.guideOfferingRepo.findOne({ where: { id } });
    if (!offering) throw new NotFoundException('Offre de guidage introuvable.');
    return offering;
  }

  private async logAction(adminId: string, entityType: string, entityId: string, action: string, reason?: string) {
    await this.logRepo.save({ admin_id: adminId, entity_type: entityType, entity_id: entityId, action, reason: reason ?? null });
  }
}
