import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CollaborationStatus } from '../../common/enums/collaboration-status.enum';
import { Guide } from '../../guide/entities/guide.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Provider } from '../../provider/entities/provider.entity';
import { CircuitProgramItem } from '../../circuit/entities/circuit-program-item.entity';

/**
 * Collaboration entre un prestataire (provider) et un collaborateur (guide, chauffeur, artisan...)
 *
 * Utilisée pour :
 * - Les offres : le prestataire invite un guide à contribuer à une section
 * - Les circuits : le prestataire invite un guide pour une activité spécifique
 *
 * Workflow :
 *   pending  → le collaborateur n'a pas encore répondu
 *   accepted → le collaborateur a accepté, peut remplir le formulaire 8 étapes
 *   completed → le collaborateur a soumis sa contribution
 *   declined → le collaborateur a refusé l'invitation
 *   cancelled → le prestataire a annulé l'invitation
 */
@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /* ── Qui invite ────────────────────────────────────────────── */
  @Column('uuid')
  provider_id!: string;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  /* ── Qui est invité ────────────────────────────────────────── */
  @Column('uuid')
  guide_id!: string;

  @ManyToOne(() => Guide, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_id' })
  guide!: Guide;

  /* ── Bidirectionnalité (guide → provider aussi) ────────────── */
  // Invité générique : peut être un guide OU un provider (user_id)
  @Column({ type: 'uuid', nullable: true })
  invited_user_id!: string | null;

  // 'guide' | 'provider'
  @Column({ type: 'varchar', nullable: true })
  invited_user_type!: string | null;

  @Column({ type: 'varchar', nullable: true })
  invited_user_name!: string | null;

  /* ── Sur quelle offre (nullable si lié à un circuit) ───────── */
  @Column({ type: 'uuid', nullable: true })
  offer_id!: string | null;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer | null;

  /* ── Section de l'offre concernée ──────────────────────────── */
  @Column({ type: 'varchar' })
  section!: string; // 'hebergement' | 'restauration' | 'transport' | 'activite' | 'guide_tour'

  /* ── Lien vers une activité de circuit (nullable) ──────────── */
  @Column({ type: 'uuid', nullable: true })
  circuit_program_item_id!: string | null;

  @ManyToOne(() => CircuitProgramItem, {
    onDelete: 'SET NULL',
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'circuit_program_item_id' })
  circuitProgramItem!: CircuitProgramItem | null;

  /* ── Message du prestataire au collaborateur ───────────────── */
  @Column({ type: 'text', nullable: true })
  message!: string | null;

  /* ── Statut ────────────────────────────────────────────────── */
  @Column({ type: 'varchar', default: CollaborationStatus.PENDING })
  status!: CollaborationStatus;

  /* ── Réponse du collaborateur ──────────────────────────────── */
  @Column({ type: 'text', nullable: true })
  decline_reason!: string | null;

  /* ── Contribution du collaborateur (remplie en 8 étapes) ──── */
  @Column({ type: 'jsonb', nullable: true })
  contribution!: {
    // Étape 1 — Services proposés
    services?: string[];
    service_description?: string;

    // Étape 2 — Disponibilités
    availability_type?: string; // 'fixed' | 'flexible' | 'on_request'
    available_days?: string[];
    available_hours?: string;

    // Étape 3 — Tarification
    pricing_model?: string; // 'fixed' | 'hourly' | 'per_group' | 'per_person'
    suggested_price?: number; // Prix proposé par le collaborateur (valeur de référence)
    applied_price?: number; // Prix appliqué par le prestataire (modifiable, c'est ce qui entre dans le calcul)
    price?: number; // Ancien champ (legacy, gardé pour compatibilité)
    currency?: string;
    extra_fees?: { label: string; amount: number }[];
    auto_recovered?: boolean; // Prix récupéré automatiquement depuis l'offering du guide

    // Étape 4 — Langues & compétences
    languages?: string[];
    skills?: string[];
    certifications?: string[];

    // Étape 5 — Photos & médias
    photos?: string[];
    video_url?: string;

    // Étape 6 — Description & notes
    detailed_description?: string;
    notes_for_provider?: string;

    // Étape 7 — Matériel fourni
    equipment_provided?: string[];
    equipment_required?: string[];

    // Étape 8 — Confirmation
    confirmed?: boolean;
  } | null;

  /* ── Timestamps ────────────────────────────────────────────── */
  @Column({ type: 'timestamp', nullable: true })
  responded_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
