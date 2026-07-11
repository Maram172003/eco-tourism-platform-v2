import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('providers')
export class ProjectOwner {
  @PrimaryColumn('uuid')
  user_id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar' })
  full_name!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', nullable: true })
  language!: string | null;

  @Column({ type: 'text', nullable: true })
  photo!: string | null;

  @Column({ type: 'text', nullable: true })
  cover_photo!: string | null;

  @Column({ type: 'varchar', nullable: true })
  organization!: string | null;

  @Column({ type: 'varchar', nullable: true })
  position!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  whatsapp!: string | null;

  @Column({ type: 'varchar', nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', nullable: true })
  facebook!: string | null;

  @Column({ type: 'varchar', nullable: true })
  instagram!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tiktok!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  gps_lat!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  gps_lng!: number | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'int', nullable: true })
  years_experience!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  languages_spoken!: string[] | null;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  profile_completion!: number;

  @Column({ type: 'boolean', default: false })
  is_onboarded!: boolean;

  @Column({ type: 'int', nullable: true })
  sustainability_score!: number | null;

  @Column({ type: 'int', nullable: true })
  score_questionnaire!: number | null;

  @Column({ type: 'int', default: 0 })
  score_reservations!: number;

  @Column({ type: 'int', default: 0 })
  score_feedbacks!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
