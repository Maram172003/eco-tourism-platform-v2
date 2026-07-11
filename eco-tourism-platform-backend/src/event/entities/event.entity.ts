import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PlaceContribution } from '../../place-contribution/entities/place-contribution.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PlaceContribution, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'place_id' })
  place!: PlaceContribution | null;

  @Column('uuid')
  place_id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 50 })
  event_type!: string;

  @Column({ type: 'timestamp' })
  start_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date!: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  images!: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  external_url!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User | null;

  @Column('uuid')
  created_by!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
