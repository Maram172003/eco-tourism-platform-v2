import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Circuit } from './circuit.entity';

/**
 * Option additionnelle pour un circuit
 * Le participant peut ajouter des options à son package :
 * - Transport (navette aéroport)
 * - Hébergement surclassé
 * - Équipement (location de vélo)
 * - Activité supplémentaire (tyrolienne)
 * - Repas optionnel
 *
 * Une option peut être liée à un OfferItem existant pour gérer
 * son stock, ses prix et ses sessions
 */
@Entity('circuit_options')
export class CircuitOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Circuit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuit_id' })
  circuit!: Circuit;

  @Column({ type: 'uuid', nullable: true })
  offer_item_id!: string | null;
  // Lien vers l'OfferItem correspondant (pour stock et prix)

  @Column({ type: 'varchar', nullable: true })
  option_group!: string | null;
  // 'transport' | 'accommodation' | 'equipment' | 'activity' | 'food'

  @Column()
  option_type!: string;
  // 'single_choice' | 'multiple_choice' | 'quantity' | 'time_slot'

  @Column({ default: false })
  is_required!: boolean;

  @Column({ default: false })
  is_included!: boolean;
  // Déjà inclus dans le prix de base

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  extra_price!: number | null;

  @Column({ type: 'varchar', nullable: true })
  selection_mode!: string | null;

  @Column({ type: 'int', nullable: true })
  min_quantity!: number | null;

  @Column({ type: 'int', nullable: true })
  max_quantity!: number | null;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}
