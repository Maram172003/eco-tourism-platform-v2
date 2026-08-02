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
import { GuideOffering } from '../../guide/entities/guide-offering.entity';
import { GuideOfferingSession } from '../../guide/entities/guide-offering-session.entity';

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

  @ManyToOne(() => GuideOffering, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'guide_offering_id' })
  guideOffering!: GuideOffering | null;

  @ManyToOne(() => GuideOfferingSession, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'guide_offering_session_id' })
  guideOfferingSession!: GuideOfferingSession | null;

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

  @Column({ type: 'uuid', nullable: true })
  guide_id!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
