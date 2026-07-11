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
import { GuideOffering } from '../../guide/entities/guide-offering.entity';
import { GuideOfferingSession } from '../../guide/entities/guide-offering-session.entity';
import { BookingParticipant } from './booking-participant.entity';

/**
 * Réservation effectuée par un éco-voyageur
 * Lie un voyageur à une offre ou une prestation guide, un item et éventuellement une session
 * C'est le document central du cycle de réservation
 * Soit offer/offerItem/session (offres classiques) soit guideOffering/guideOfferingSession (prestations guide)
 */
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  booking_ref!: string;

  @Column({ type: 'uuid', nullable: true })
  traveler_id!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'traveler_id' })
  traveler!: User;

  @Column({ type: 'uuid', nullable: true })
  offer_id!: string | null;

  @ManyToOne(() => Offer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer | null;

  @ManyToOne(() => OfferItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem | null;

  @ManyToOne(() => OfferItemSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'session_id' })
  session!: OfferItemSession | null;

  @ManyToOne(() => GuideOffering, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guide_offering_id' })
  guideOffering!: GuideOffering | null;

  @ManyToOne(() => GuideOfferingSession, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guide_offering_session_id' })
  guideOfferingSession!: GuideOfferingSession | null;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number;

  @Column({ default: 'TND' })
  currency!: string;

  @Column({ type: 'text', nullable: true })
  special_requests!: string | null;

  @Column({ type: 'varchar', nullable: true })
  confirmation_mode!: string | null;

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
