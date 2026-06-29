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
 * Session / Créneau concret pour un OfferItem
 * Généré à partir des règles de disponibilité ou créé manuellement
 *
 * Une session = une date + heure de début + heure de fin + capacité
 * Exemple : "Atelier poterie le 15/07/2026 à 14h00, capacité 12 personnes"
 */
@Entity('offer_item_sessions')
export class OfferItemSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OfferItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'time' })
  start_time!: string;

  @Column({ type: 'time' })
  end_time!: string;

  @Column({ type: 'int', nullable: true })
  total_capacity!: number | null;

  @Column({ type: 'int', nullable: true })
  remaining_capacity!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_override!: number | null;

  @Column({ default: 'available' })
  status!: string;
  // 'available' | 'full' | 'cancelled'

  @CreateDateColumn()
  created_at!: Date;
}
