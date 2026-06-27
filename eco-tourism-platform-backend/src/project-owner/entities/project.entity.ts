import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectOwner } from './project-owner.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  owner_id!: string;

  @ManyToOne(() => ProjectOwner)
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'user_id' })
  owner!: ProjectOwner;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'simple-array', nullable: true })
  project_type!: string[] | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'text', nullable: true })
  photo!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  photos!: string[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: number | null;

  @Column({ type: 'varchar', nullable: true })
  opening_hours!: string | null;

  @Column({ type: 'varchar', nullable: true })
  facebook!: string | null;

  @Column({ type: 'varchar', nullable: true })
  instagram!: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string; // pending | active | rejected

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  @Column({ type: 'int', nullable: true })
  sustainability_score!: number | null;

  @Column({ type: 'simple-array', nullable: true })
  services!: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  eco_labels!: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  // Champs Prestataire supplémentaires (proposition encadrant)
  @Column({ type: 'varchar', nullable: true })
  whatsapp!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  secondary_activity_types!: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  certifications!: string[] | null;

  @Column({ type: 'text', nullable: true })
  history!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  videos!: string[] | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
