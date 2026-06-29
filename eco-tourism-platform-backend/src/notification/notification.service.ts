import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

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
   * Crée une notification
   */
  async create(
    userId: string,
    type: string,
    title: string,
    body?: string,
    link?: string,
  ): Promise<Notification> {
    const notif = this.repo.create({
      user: { id: userId } as User,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    });
    return this.repo.save(notif);
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

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update(
      { user: { id: userId }, is_read: false },
      { is_read: true },
    );
  }

  /**
   * Compte les notifications non lues
   */
  async countUnread(userId: string): Promise<number> {
    return this.repo.count({
      where: { user: { id: userId }, is_read: false },
    });
  }
}
