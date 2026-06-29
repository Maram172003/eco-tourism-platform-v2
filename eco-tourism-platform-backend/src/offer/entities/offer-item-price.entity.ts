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
 * Prix par catégorie de participant pour un OfferItem
 * Exemples : "Adulte: 25 DT", "Enfant (6-12 ans): 15 DT", "Étudiant: 20 DT"
 * Chaque ligne peut avoir une unité de facturation différente
 */
@Entity('offer_item_prices')
export class OfferItemPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OfferItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem;

  @Column()
  label!: string;
  // "Adulte", "Enfant (6-12 ans)", "Étudiant"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 'TND' })
  currency!: string;

  @Column({ default: 'per_person' })
  pricing_unit!: string;
  // 'per_person' | 'per_night' | 'per_hour' | 'per_half_day' | 'per_day'

  @Column({ type: 'int', nullable: true })
  min_quantity!: number | null;

  @Column({ type: 'int', nullable: true })
  max_quantity!: number | null;

  @Column({ default: false })
  is_default!: boolean;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}
