import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { OfferItem } from '../../offer/entities/offer-item.entity';
import { OfferItemSession } from '../../offer/entities/offer-item-session.entity';
import { BookingParticipant } from './booking-participant.entity';

/**
 * Réservation effectuée par un éco-voyageur
 * Lie un voyageur à une offre, un item et éventuellement une session
 * C'est le document central du cycle de réservation
 */
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  booking_ref!: string;
  // Référence lisible : "BK-" + court aléatoire

  @ManyToOne(() => User)
  @JoinColumn({ name: 'traveler_id' })
  traveler!: User;

  @ManyToOne(() => Offer)
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer;

  @ManyToOne(() => OfferItem, { nullable: true })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem | null;

  @ManyToOne(() => OfferItemSession, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session!: OfferItemSession | null;

  @Column({ default: 'pending' })
  status!: string;
  // 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  @Column({ default: 'XAF' })
  currency!: string;

  @Column({ type: 'text', nullable: true })
  special_requests!: string | null;

  @Column({ type: 'varchar', nullable: true })
  confirmation_mode!: string | null;
  // Copié de l'offre/item au moment de la réservation ('automatic' | 'manual')

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  cancel_reason!: string | null;

  @OneToMany(() => BookingParticipant, (p) => p.booking)
  participants!: BookingParticipant[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
