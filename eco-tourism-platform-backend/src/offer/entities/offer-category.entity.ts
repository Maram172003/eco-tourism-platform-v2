import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Lookup table des catégories d'offres (10 lignes fixes)
 * Remplace progressivement le champ varchar `offer_type` sur offers
 */
@Entity('offer_categories')
export class OfferCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50 })
  slug!: string;
  // 'eco_tour' | 'accommodation' | 'activity' | 'restaurant' | 'craft'
  // | 'workshop' | 'transfer' | 'sejour' | 'circuit' | 'other'

  @Column({ length: 100 })
  label!: string;
  // Libellé affiché : 'Éco-Tour', 'Hébergement', etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon!: string | null;
  // Icône emoji ou identifiant

  @Column({ default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;
}
