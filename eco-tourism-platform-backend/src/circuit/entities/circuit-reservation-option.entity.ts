import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CircuitReservation } from './circuit-reservation.entity';
import { CircuitOption } from './circuit-option.entity';

/**
 * Options choisies par le voyageur dans sa réservation de circuit
 * Chaque ligne = une option + la quantité + le prix unitaire appliqué
 * Permet de reconstituer la facture détaillée de la réservation
 */
@Entity('circuit_reservation_options')
export class CircuitReservationOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CircuitReservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuit_reservation_id' })
  circuitReservation!: CircuitReservation;

  @ManyToOne(() => CircuitOption)
  @JoinColumn({ name: 'circuit_option_id' })
  circuitOption!: CircuitOption;

  @Column({ type: 'uuid', nullable: true })
  offer_item_session_id!: string | null;
  // Session concrète choisie (ex: créneau tyrolienne de 10h)

  @Column({ type: 'int', nullable: true })
  quantity!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_price!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_price!: number | null;
}
