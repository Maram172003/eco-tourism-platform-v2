import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from '../publication/entities/publication.entity';
import { Offer } from '../offer/entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Provider } from '../provider/entities/provider.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Publication)
    private readonly pubRepo: Repository<Publication>,

    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(EcoTraveler)
    private readonly ecoRepo: Repository<EcoTraveler>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    private readonly mailService: MailService,
  ) {}

  getPendingPublications() {
    return this.pubRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approvePublication(id: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'approved';
    pub.rejection_reason = null;
    return this.pubRepo.save(pub);
  }

  async rejectPublication(id: string, reason: string) {
    const pub = await this.findPubOrFail(id);
    pub.status = 'rejected';
    pub.rejection_reason = reason;
    return this.pubRepo.save(pub);
  }

  getPendingOffers() {
    return this.offerRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveOffer(id: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'approved';
    offer.rejection_reason = null;
    return this.offerRepo.save(offer);
  }

  async rejectOffer(id: string, reason: string) {
    const offer = await this.findOfferOrFail(id);
    offer.status = 'rejected';
    offer.rejection_reason = reason;
    return this.offerRepo.save(offer);
  }

  // Providers en attente de validation
  getPendingProviders() {
    return this.providerRepo.find({ where: { status: 'pending' }, order: { created_at: 'DESC' } });
  }

  async approveProvider(userId: string) {
    const provider = await this.providerRepo.findOne({ where: { user_id: userId } });
    if (!provider) throw new NotFoundException('Prestataire introuvable.');
    provider.status = 'active';
    provider.rejection_reason = null;
    return this.providerRepo.save(provider);
  }

  async rejectProvider(userId: string, reason: string) {
    const provider = await this.providerRepo.findOne({ where: { user_id: userId } });
    if (!provider) throw new NotFoundException('Prestataire introuvable.');
    provider.status = 'rejected';
    provider.rejection_reason = reason;
    return this.providerRepo.save(provider);
  }

  async getBannedUsers() {
    const users = await this.userRepo.find({ where: { status: 'banned' as any } });
    return Promise.all(users.map(async (u) => {
      let profile: any = null;
      if (u.role === 'eco_traveler') profile = await this.ecoRepo.findOne({ where: { user_id: u.id } });
      else if (u.role === 'provider') profile = await this.providerRepo.findOne({ where: { user_id: u.id } });
      return {
        user_id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        ban_until: u.ban_until,
        banned_at: u.updated_at,
        full_name: profile?.full_name ?? null,
        photo: profile?.photo ?? null,
      };
    }));
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
      user.ban_until = null;
    }
    user.refresh_token = null;
    user.refresh_token_expires_at = null;
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
}
