import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuideOffering } from './guide-offering.entity';

@Entity('guide_offering_availability_rules')
export class GuideOfferingAvailabilityRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GuideOffering, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_offering_id' })
  guideOffering!: GuideOffering;

  @Column()
  availability_type!: string;

  @Column({ type: 'date', nullable: true })
  start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  weekdays!: number[] | null;

  @Column({ type: 'time', nullable: true })
  start_time!: string | null;

  @Column({ type: 'time', nullable: true })
  end_time!: string | null;

  @Column({ type: 'varchar', nullable: true })
  recurrence_rule!: string | null;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
