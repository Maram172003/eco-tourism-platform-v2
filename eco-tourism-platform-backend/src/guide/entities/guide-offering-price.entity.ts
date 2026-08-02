import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GuideOffering } from './guide-offering.entity';

@Entity('guide_offering_prices')
export class GuideOfferingPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GuideOffering, (o) => o.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_offering_id' })
  guideOffering!: GuideOffering;

  @Column()
  label!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', nullable: true })
  min_quantity!: number | null;

  @Column({ type: 'int', nullable: true })
  max_quantity!: number | null;

  @Column({ default: false })
  is_default!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
