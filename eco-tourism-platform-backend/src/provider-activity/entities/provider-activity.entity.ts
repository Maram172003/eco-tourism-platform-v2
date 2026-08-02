import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('provider_activities')
export class ProviderActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  provider_id!: string;

  @Index()
  @Column({ type: 'uuid' })
  organization_id!: string;

  @Column({ type: 'varchar' })
  level!: string; // 'primary' | 'secondary'

  @Column({ type: 'varchar' })
  category!: string; // eco_tour | hebergement | activite | ...

  @Column({ type: 'jsonb', nullable: true })
  subtypes!: string[] | null;

  @Column({ type: 'int', nullable: true })
  years_experience!: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
