import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CircuitDay } from './circuit-day.entity';

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

  @CreateDateColumn()
  created_at!: Date;
}
