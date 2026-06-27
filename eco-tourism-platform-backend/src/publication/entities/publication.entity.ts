import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  author_id!: string;

  // 'place' = lieu recommandé sur la carte / 'experience' = expérience vécue
  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  images!: string[] | null;

  // Coordonnées pour les lieux (type = 'place')
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  // Nom du lieu (pour les places)
  @Column({ type: 'varchar', nullable: true })
  place_name!: string | null;

  // Région / gouvernorat (pour les places)
  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  // pending = en attente de validation / approved = visible publiquement / rejected = refusé
  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}