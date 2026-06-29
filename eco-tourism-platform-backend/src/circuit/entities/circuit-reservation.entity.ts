import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Circuit } from './circuit.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Réservation d'un circuit par un éco-voyageur
 * Contient le total de base (prix du package) + total des options
 * + le nombre de participants
 */
@Entity('circuit_reservations')
export class CircuitReservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Circuit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuit_id' })
  circuit!: Circuit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'int', nullable: true })
  participants_count!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_total!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  options_total!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  final_total!: number;

  @Column({ default: 'pending' })
  status!: string;
  // 'pending' | 'confirmed' | 'cancelled' | 'completed'

  @CreateDateColumn()
  created_at!: Date;
}
