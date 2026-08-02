import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Guide } from './guide.entity';
import { GuideOfferingAvailabilityRule } from './guide-offering-availability-rule.entity';
import { GuideOfferingSession } from './guide-offering-session.entity';
import { GuideOfferingBlock } from './guide-offering-block.entity';
import { GuideOfferingPrice } from './guide-offering-price.entity';

@Entity('guide_offerings')
export class GuideOffering {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Guide, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_id', referencedColumnName: 'user_id' })
  guide!: Guide;

  @Column('uuid')
  guide_id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  languages!: string[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 'hour' })
  pricing_unit!: string;

  @Column({ type: 'int', nullable: true })
  min_travelers!: number | null;

  @Column({ type: 'int', nullable: true })
  max_travelers!: number | null;

  @Column({ default: 'point' })
  service_zone_type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  radius_km!: number | null;

  @Column({ type: 'varchar', nullable: true })
  zone_governorate!: string | null;

  @Column({ type: 'varchar', nullable: true })
  zone_municipality!: string | null;

  @Column({ default: false })
  displacement_allowed!: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  displacement_max_km!: number | null;

  @Column({ type: 'varchar', nullable: true })
  displacement_type!: string | null;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', default: 'manual' })
  confirmation_mode!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => GuideOfferingAvailabilityRule, (r) => r.guideOffering)
  availabilityRules!: GuideOfferingAvailabilityRule[];

  @OneToMany(() => GuideOfferingSession, (s) => s.guideOffering)
  sessions!: GuideOfferingSession[];

  @OneToMany(() => GuideOfferingBlock, (b) => b.guideOffering)
  blocks!: GuideOfferingBlock[];

  @OneToMany(() => GuideOfferingPrice, (p) => p.guideOffering)
  prices!: GuideOfferingPrice[];
}
