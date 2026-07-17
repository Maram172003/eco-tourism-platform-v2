import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CircuitDay } from './circuit-day.entity';
import { OfferItem } from '../../offer/entities/offer-item.entity';

/**
 * Activité / Étape d'une journée de circuit
 * Définit ce qui est prévu à un moment donné : randonnée, repas, atelier, etc.
 * Peut être lié à un OfferItem existant (linked_offer_item_id)
 */
@Entity('circuit_program_items')
export class CircuitProgramItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CircuitDay, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuit_day_id' })
  circuitDay!: CircuitDay;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'time', nullable: true })
  start_time!: string | null;

  @Column({ type: 'time', nullable: true })
  end_time!: string | null;

  @Column({ default: true })
  is_included!: boolean;
  // Inclus dans le prix de base du circuit

  @Column({ default: true })
  is_required!: boolean;
  // Obligatoire ou optionnel

  @Column({ type: 'uuid', nullable: true })
  linked_offer_item_id!: string | null;
  // FK brute vers OfferItem (permet au code d'accéder à la valeur sans charger la relation)

  @ManyToOne(() => OfferItem, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'linked_offer_item_id' })
  linkedOfferItem!: OfferItem | null;
  // Lien vers un OfferItem si cette activité correspond à un item du catalogue

  @Column({ type: 'uuid', nullable: true })
  linked_location_id!: string | null;
  // Lien vers un lieu (place_contributions)

  @Column({ type: 'varchar', length: 10, nullable: true })
  emoji!: string | null;

  @Column({ type: 'int', nullable: true })
  duration_minutes!: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distance_km!: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  transport_mode!: string | null;

  @Column({ type: 'uuid', nullable: true })
  guide_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  guide_name!: string | null;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;
  // 'hebergement' | 'activite' | 'restauration' | 'transport' | 'workshop' | etc.

  @Column({ type: 'simple-array', nullable: true })
  subtypes!: string[] | null;
  // Sous-types ex: ['randonnee', 'observation'] provenant de OFFER_DETAIL_FIELDS

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;
  // Prix individuel pour cette activité

  @Column({ type: 'simple-array', nullable: true })
  photos!: string[] | null;
  // Photos spécifiques à cette activité

  @Column({ type: 'jsonb', nullable: true })
  unit_details!: Record<string, any> | null;
  // { nb_unites, details par entité } pour les sous-types avec unités

  @Column({ type: 'jsonb', nullable: true })
  fields!: Record<string, any> | null;
  // Champs dynamiques spécifiques au sous-type (issus de OFFER_DETAIL_FIELDS)

  @Column({ type: 'jsonb', nullable: true })
  external_reference!: {
    provider_name?: string;
    phone?: string;
    address?: string;
    url?: string;
    estimated_price?: number;
    currency?: string;
    notes?: string;
    type?: 'hebergement' | 'restaurant' | 'activite' | 'transport' | 'atelier' | 'guide_service' | 'equipment_rental' | 'evenement' | 'artisanat' | 'sejour';
  } | null;

  @Column({ type: 'boolean', default: false })
  is_external_reference!: boolean;

  @Column({ type: 'varchar', nullable: true })
  external_provider_name!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
