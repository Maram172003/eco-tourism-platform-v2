import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Notification utilisateur
 * Générée automatiquement par les événements métier :
 * - Réservation confirmée / annulée
 * - Offre approuvée / refusée
 * - Nouveau message
 * - Disponibilité de circuit
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  type!: string;
  // 'booking_confirmed' | 'booking_cancelled' | 'booking_request'
  // | 'offer_approved' | 'offer_rejected' | 'new_message' | 'circuit_available'

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ type: 'varchar', nullable: true })
  link!: string | null;
  // Lien profond vers la page concernée (ex: "/bookings/123")

  @Column({ default: false })
  is_read!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
