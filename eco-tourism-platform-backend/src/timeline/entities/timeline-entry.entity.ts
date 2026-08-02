import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('timeline_entries')
export class TimelineEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  publication_id!: string;

  @Column({ type: 'int' })
  step_order!: number;

  @Column({ type: 'varchar', length: 10, default: '📍' })
  emoji!: string;

  @Column({ type: 'varchar', length: 100 })
  time_label!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', nullable: true })
  duration_minutes!: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distance_km!: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  transport_mode!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
