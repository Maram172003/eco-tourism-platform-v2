import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OfferItem } from './offer-item.entity';

/**
 * Capacité et stock d'un OfferItem
 * Définit la quantité disponible et les limites de participants
 * Utilisé pour le catalogue simple (stock global) :
 * - Un vélo : stock = 20 unités
 * - Une tente : stock = 10 unités
 * - Un atelier : max 15 participants
 */
@Entity('offer_item_capacity')
export class OfferItemCapacity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OfferItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem;

  @Column()
  capacity_type!: string;
  // 'rooms' | 'beds' | 'items' | 'persons' | 'seats' | 'spaces' | 'tents'

  @Column({ type: 'int', nullable: true })
  total_quantity!: number | null;
  // Stock total disponible

  @Column({ type: 'int', nullable: true })
  remaining_quantity!: number | null;
  // Stock restant (decremente lors des reservations)

  @Column({ type: 'int', nullable: true })
  max_persons!: number | null;
  // Capacité maximale en personnes

  @Column({ type: 'int', nullable: true })
  min_participants!: number | null;

  @Column({ type: 'int', nullable: true })
  max_participants!: number | null;

  @CreateDateColumn()
  created_at!: Date;
}
