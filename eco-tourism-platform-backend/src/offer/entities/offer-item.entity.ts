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
import { Offer } from './offer.entity';
import { OfferItemPrice } from './offer-item-price.entity';
import { OfferItemSession } from './offer-item-session.entity';
import { OfferItemCapacity } from './offer-item-capacity.entity';
import { OfferItemAvailabilityRule } from './offer-item-availability-rule.entity';

/**
 * Élément réellement vendable dans une offre
 * Exemples : "Couscous", "Tente 2 places", "Vélo VTT", "Atelier poterie"
 * Un OfferItem est l'unité de réservation : on réserve un item, pas une offre entière
 *
 * item_type : room | bed | camping_space | dish | menu
 *            | equipment | activity | workshop | transport_service
 *
 * Les attributs spécifiques (bed_count, tent_capacity, etc.) vont dans details_json
 */
@Entity('offer_items')
export class OfferItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  item_type!: string | null;
  // 'room' | 'bed' | 'camping_space' | 'dish' | 'menu'
  // | 'equipment' | 'activity' | 'workshop' | 'transport_service'

  @Column({ type: 'json', nullable: true })
  details_json!: Record<string, any> | null;
  // Attributs spécifiques selon item_type :
  // - room : { room_type: 'private'|'double'|'family'|'suite'|'studio', bed_count: 2 }
  // - camping_space : { capacity_persons: 4 }
  // - dish : { ingredients: [...], allergens: [...] }
  // Libres pour tout autre attribut complémentaire

  @Column({ default: false })
  requires_confirmation!: boolean;

  @Column({ type: 'varchar', nullable: true })
  confirmation_mode!: string | null;
  // 'automatic' | 'manual'

  @Column({ type: 'int', nullable: true })
  booking_deadline_days!: number | null;

  @Column({ type: 'int', nullable: true })
  cancellation_deadline_days!: number | null;

  @Column({ type: 'int', nullable: true })
  production_delay_days!: number | null;

  @Column({ default: 'active' })
  status!: string;
  // 'active' | 'inactive'

  @OneToMany(() => OfferItemPrice, (p) => p.offerItem)
  prices!: OfferItemPrice[];

  @OneToMany(() => OfferItemSession, (s) => s.offerItem)
  sessions!: OfferItemSession[];

  @OneToMany(() => OfferItemCapacity, (c) => c.offerItem)
  capacity!: OfferItemCapacity[];

  @OneToMany(() => OfferItemAvailabilityRule, (r) => r.offerItem)
  availabilityRules!: OfferItemAvailabilityRule[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
