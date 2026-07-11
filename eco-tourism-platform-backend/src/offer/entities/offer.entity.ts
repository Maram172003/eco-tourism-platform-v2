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
import { Venue } from '../../project-owner/entities/project.entity';
import { OfferCategory } from './offer-category.entity';
import { OfferItem } from './offer-item.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Qui a créé cette offre (polymorphisme guide / provider)
  @Column('uuid')
  author_id!: string;

  @Column({ type: 'varchar', default: 'provider' })
  author_type!: string; // 'guide' | 'provider' | 'provider' (legacy)

  // FK vers l'établissement (nullable : les guides n'ont pas d'établissement)
  @Column({ type: 'uuid', nullable: true })
  venue_id!: string | null;

  @ManyToOne(() => Venue, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'venue_id' })
  venue!: Venue | null;

  // Catégorie (remplace progressivement offer_type)
  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => OfferCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category!: OfferCategory | null;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  // Prix indicatif (auto-calculé depuis les prix des items si null)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  // Durée en texte libre : "2h", "1 journée", "3 jours"
  @Column({ type: 'varchar', nullable: true })
  duration!: string | null;

  // Type d'offre (déprécié, migrer vers category_id)
  @Column({ type: 'varchar', nullable: true })
  offer_type!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  images!: string[] | null;

  @Column({ type: 'text', nullable: true })
  inclusions!: string | null;

  @Column({ type: 'varchar', nullable: true })
  region!: string | null;

  // Adresse postale complète (distincte du point de rendez-vous)
  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  // Coordonnées GPS de l'adresse (vs meeting_lat/lng pour le point de rendez-vous)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', nullable: true })
  meeting_point!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  meeting_lat!: number | null;

  @Column({ type: 'varchar', default: 'fixed' })
  location_type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  meeting_lng!: number | null;

  @Column({ type: 'int', nullable: true })
  min_group_size!: number | null;

  @Column({ type: 'int', nullable: true })
  max_group_size!: number | null;

  @Column({ type: 'int', nullable: true })
  min_age!: number | null;

  @Column({ type: 'text', nullable: true })
  cancellation_policy!: string | null;

  @Column({ type: 'int', nullable: true })
  sustainability_score!: number | null;

  // Pourcentage d'acompte (0-100%)
  @Column({ type: 'int', nullable: true, default: 0 })
  deposit_percentage!: number | null;

  // Délai de préparation (artisanat, fabrication)
  @Column({ type: 'int', nullable: true })
  production_delay_days!: number | null;

  // Mode d'exécution : 'instant_stock' | 'scheduled' | 'recurring' | 'on_request' | 'mixed'
  @Column({ type: 'varchar', nullable: true })
  fulfillment_mode!: string | null;

  // 'automatic' = confirmation instantanée, 'manual' = le provider valide
  @Column({ type: 'varchar', default: 'automatic' })
  confirmation_mode!: string;

  // pending = en attente / approved = visible / rejected = refusé / archived = masqué / inactive = désactivé
  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null;

  // Soft delete — préserver l'historique des réservations
  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @Column({ type: 'varchar', default: 'single' })
  offer_mode!: string;

  @Column({ type: 'varchar', nullable: true })
  availability_mode!: string | null;

  @Column({ type: 'date', nullable: true })
  availability_start!: Date | null;

  @Column({ type: 'date', nullable: true })
  availability_end!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  offer_subtype!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  offer_subtypes!: string[] | null;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ type: 'uuid', nullable: true })
  organization_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  activity_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  cover_image!: string | null;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  sustainability_certifications!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  sustainability_practices!: string[] | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  carbon_estimate_kg!: number | null;

  @OneToMany(() => OfferItem, (item) => item.offer)
  items!: OfferItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
