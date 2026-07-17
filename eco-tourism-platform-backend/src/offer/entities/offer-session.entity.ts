import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Offer } from './offer.entity';

@Entity('offer_sessions')
export class OfferSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  offer_id!: string;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', nullable: true })
  start_time!: string | null;

  @Column({ type: 'varchar', nullable: true })
  end_time!: string | null;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ type: 'int', default: 0 })
  spots_taken!: number;

  @Column({ type: 'uuid', nullable: true })
  guide_id!: string | null;

  @Column({ type: 'varchar', default: 'scheduled' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
