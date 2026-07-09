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
 * Règle de disponibilité récurrente pour un OfferItem
 * Définit quand un item est disponible (jours, créneaux, périodes)
 * Permet de générer des sessions concrètes (OfferItemSession)
 *
 * Exemples :
 * - Tous les lundis et mercredis de 9h à 12h
 * - Uniquement les week-ends du 1er juin au 30 septembre
 * - Tous les jours de 8h à 18h
 */
@Entity('offer_item_availability_rules')
export class OfferItemAvailabilityRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OfferItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem;

  @Column()
  availability_type!: string;
  // 'weekly' | 'daily' | 'date_range' | 'weekend_only' | 'custom'

  @Column({ type: 'date', nullable: true })
  start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  weekdays!: number[] | null;
  // 0=Dim, 1=Lun, ..., 6=Sam — ex: [1,2,3,4,5] = semaine

  @Column({ type: 'time', nullable: true })
  start_time!: string | null;

  @Column({ type: 'time', nullable: true })
  end_time!: string | null;

  @Column({ type: 'varchar', nullable: true })
  recurrence_rule!: string | null;
  // Format RRULE : 'FREQ=WEEKLY;BYDAY=MO,WE,FR'

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
