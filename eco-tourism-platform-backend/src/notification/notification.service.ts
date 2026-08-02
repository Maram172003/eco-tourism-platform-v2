import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

/**
 * Service de notification unifié.
 *
 * Signature historique (title/body/link) :
 *   create(userId, type, title, body?, link?)
 * Signature structurée jsonb (collab / agenda) :
 *   create(userId, type, data)
 *
 * Les deux formats coexistent : `title/body/link` restent alimentés pour la
 * compatibilité des consommateurs existants (reservation, trip-plan, circuit,
 * admin, messages, collaboration...), et `data` (jsonb) stocke les données
 * structurées riches (offer_id, section, inviter_name, ...).
 */
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  /**
   * Récupère les notifications d'un utilisateur
   */
  async findByUser(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Crée une notification.
   *
   * - `create(userId, type, title, body?, link?)` : format historique
   * - `create(userId, type, data)` : format structuré jsonb
   *
   * En format structuré, on dérive title/body/link depuis `data` quand c'est
   * possible pour que l'affichage historique continue de fonctionner.
   */
  async create(
    userId: string,
    type: string,
    titleOrData: string | Record<string, any>,
    body?: string,
    link?: string,
  ): Promise<Notification> {
    if (typeof titleOrData !== 'string') {
      const data = titleOrData ?? {};
      const derived = this.deriveFromData(type, data);
      const notif = this.repo.create({
        user: { id: userId } as User,
        type,
        title: derived.title,
        body: derived.body ?? null,
        link: derived.link ?? null,
        data,
      });
      return this.repo.save(notif);
    }

    const notif = this.repo.create({
      user: { id: userId } as User,
      type,
      title: titleOrData,
      body: body ?? null,
      link: link ?? null,
      data: null,
    });
    return this.repo.save(notif);
  }

  /**
   * Déduit un titre / corps / lien lisibles depuis les données structurées.
   */
  private deriveFromData(
    type: string,
    data: Record<string, any>,
  ): { title: string; body: string | null; link: string | null } {
    const offer = data.offer_title ?? 'une offre';
    const sectionLabel: Record<string, string> = {
      hebergement: 'Hébergement',
      restauration: 'Restauration',
      transport: 'Transport',
      activite: 'Activité',
      atelier: 'Atelier',
      guide: 'Guidage',
      guide_touristique: 'Guidage touristique',
      autre: 'Autre',
    };
    const section = sectionLabel[data.section ?? ''] ?? (data.section ?? '');
    const name = data.invited_user_name ?? data.inviter_name ?? data.guide_name ?? 'Un collaborateur';
    const baseLink = data.offer_id ? `/offers/${data.offer_id}` : (data.collab_id ? `/dashboard/collaborations` : null);

    switch (type) {
      case 'collaboration_invite':
        return {
          title: 'Invitation à collaborer',
          body: `${data.inviter_name ?? 'Un prestataire'} vous invite à rejoindre la section « ${section} » de l'offre « ${offer} ».`,
          link: data.offer_id ? `/offers/${data.offer_id}` : `/dashboard/collaborations`,
        };
      case 'collab_accepted':
      case 'collaboration_accepted':
        return {
          title: 'Collaboration acceptée',
          body: `${name} a accepté votre invitation pour la section « ${section} » de « ${offer} ».`,
          link: baseLink,
        };
      case 'collab_declined':
      case 'collaboration_declined':
        return {
          title: 'Invitation refusée',
          body: `${name} a refusé votre invitation pour la section « ${section} » de « ${offer} ».`,
          link: baseLink,
        };
      case 'collab_quit':
        return {
          title: 'Collaborateur retiré',
          body: `${name} a quitté la section « ${section} » de « ${offer} ».`,
          link: baseLink,
        };
      case 'collab_kicked':
        return {
          title: 'Collaboration retirée',
          body: `${name} vous a retiré·e de la section « ${section} » de « ${offer} ».`,
          link: baseLink,
        };
      case 'collaboration_completed':
        return {
          title: 'Contribution complétée',
          body: `${name} a finalisé sa contribution sur « ${offer} ».`,
          link: baseLink,
        };
      case 'offer_deleted':
        return {
          title: 'Offre supprimée',
          body: `L'offre « ${offer} » à laquelle vous collaboriez a été supprimée.`,
          link: null,
        };
      case 'offer_schedule_changed':
        return {
          title: 'Horaires mis à jour',
          body: `Les horaires de l'offre « ${offer} » (section « ${section} ») ont changé. Votre agenda a été synchronisé automatiquement.`,
          link: baseLink,
        };
      case 'offer_schedule_conflict':
        return {
          title: 'Conflit d’agenda',
          body: `Les horaires de l'offre « ${offer} » (section « ${section} ») créent un conflit avec votre agenda${data.conflicting_slot ? ` (${data.conflicting_slot})` : ''}. Réglez votre agenda pour maintenir votre collaboration.`,
          link: baseLink,
        };
      default:
        return {
          title: data.title ?? data.message ?? 'Notification',
          body: data.body ?? data.message ?? null,
          link: data.link ?? baseLink,
        };
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notif = await this.repo.findOneOrFail({
      where: { id, user: { id: userId } },
    });
    notif.is_read = true;
    return this.repo.save(notif);
  }

  /** Alias Maram : markRead(userId, id) */
  async markRead(userId: string, id: string): Promise<Notification> {
    return this.markAsRead(id, userId);
  }

  /** Marque une notification comme non lue */
  async markUnread(userId: string, id: string): Promise<Notification> {
    const notif = await this.repo.findOneOrFail({
      where: { id, user: { id: userId } },
    });
    notif.is_read = false;
    return this.repo.save(notif);
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update(
      { user: { id: userId }, is_read: false },
      { is_read: true },
    );
  }

  /** Alias Maram : markAllRead(userId) */
  async markAllRead(userId: string): Promise<void> {
    return this.markAllAsRead(userId);
  }

  /**
   * Compte les notifications non lues
   */
  async countUnread(userId: string): Promise<number> {
    return this.repo.count({
      where: { user: { id: userId }, is_read: false },
    });
  }

  /** Alias Maram : unreadCount(userId) */
  async unreadCount(userId: string): Promise<number> {
    return this.countUnread(userId);
  }

  /**
   * Supprime une notification (possession requise)
   */
  async deleteNotification(userId: string, id: string): Promise<void> {
    const notif = await this.repo.findOneOrFail({
      where: { id, user: { id: userId } },
    });
    await this.repo.remove(notif);
  }

  /**
   * Signale une notification (possession requise)
   */
  async reportNotification(userId: string, id: string): Promise<Notification> {
    const notif = await this.repo.findOneOrFail({
      where: { id, user: { id: userId } },
    });
    notif.data = { ...(notif.data ?? {}), is_reported: true };
    notif.is_read = true;
    return this.repo.save(notif);
  }

  /**
   * Supprime les notifications du même type liées à une offre (collab / agenda)
   */
  async deleteForOffer(
    userId: string,
    type: string,
    offerId: string,
  ): Promise<void> {
    const existing = await this.repo.find({
      where: { user: { id: userId }, type },
    });
    const toDelete = existing.filter((n) => n.data?.offer_id === offerId);
    if (toDelete.length) await this.repo.remove(toDelete);
  }

  /**
   * Supprime les anciennes notifications du même type/offre puis crée la nouvelle
   */
  async replaceForOffer(
    userId: string,
    type: string,
    offerId: string,
    data: Record<string, any>,
  ): Promise<Notification> {
    await this.deleteForOffer(userId, type, offerId);
    return this.create(userId, type, { ...data, offer_id: offerId });
  }
}
