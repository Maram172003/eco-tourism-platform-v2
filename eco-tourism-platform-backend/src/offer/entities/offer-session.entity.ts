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

  // Date de la séance (pour scheduled / recurring)
  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', nullable: true })
  start_time!: string | null; // "09:00"

  @Column({ type: 'varchar', nullable: true })
  end_time!: string | null; // "12:00"

  // Capacité maximale pour cette séance (override de offer.capacity si défini)
  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  // Nombre de places déjà prises
  @Column({ type: 'int', default: 0 })
  spots_taken!: number;

  // Guide assigné à cette séance (optionnel)
  @Column({ type: 'uuid', nullable: true })
  guide_id!: string | null;

  // scheduled | cancelled | completed | full
  @Column({ type: 'varchar', default: 'scheduled' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
