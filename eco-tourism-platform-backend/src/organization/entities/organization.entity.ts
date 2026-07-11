import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  provider_id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  logo!: string | null;

  @Column({ type: 'varchar', nullable: true })
  provider_type!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', nullable: true })
  history!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  whatsapp!: string | null;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', nullable: true })
  facebook!: string | null;

  @Column({ type: 'varchar', nullable: true })
  instagram!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tiktok!: string | null;

  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', nullable: true })
  zone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  photos!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  videos!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  eco_labels!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  certifications!: Array<{ name: string; document_url?: string }> | null;

  @Column({ type: 'int', nullable: true })
  sustainability_score!: number | null;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  approval_status!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  opening_hours!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
