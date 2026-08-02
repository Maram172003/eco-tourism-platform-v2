import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuideOffering } from './guide-offering.entity';

@Entity('guide_offering_blocks')
export class GuideOfferingBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GuideOffering, (o) => o.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_offering_id' })
  guideOffering!: GuideOffering;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'varchar', nullable: true })
  reason!: string | null;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
