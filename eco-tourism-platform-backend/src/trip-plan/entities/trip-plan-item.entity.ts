import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TripPlan } from './trip-plan.entity';
import { OfferItem } from '../../offer/entities/offer-item.entity';
import { Circuit } from '../../circuit/entities/circuit.entity';

@Entity('trip_plan_items')
export class TripPlanItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TripPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_plan_id' })
  tripPlan!: TripPlan;

  @ManyToOne(() => OfferItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem | null;

  @ManyToOne(() => Circuit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'circuit_id' })
  circuit!: Circuit | null;

  @Column({ type: 'int', nullable: true })
  day_number!: number | null;

  @Column({ default: 0 })
  sort_order!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
