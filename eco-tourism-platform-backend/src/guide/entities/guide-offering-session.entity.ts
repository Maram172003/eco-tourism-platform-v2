import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuideOffering } from './guide-offering.entity';

@Entity('guide_offering_sessions')
export class GuideOfferingSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GuideOffering, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_offering_id' })
  guideOffering!: GuideOffering;

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

  @CreateDateColumn()
  created_at!: Date;
}
