import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

/**
 * Participant individuel d'une réservation de groupe
 * Permet de connaître la composition exacte d'un groupe
 * Un booking peut avoir plusieurs participants (ex: famille de 4 personnes)
 */
@Entity('reservation_participants')
export class ReservationParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  reservation!: Reservation;

  @Column()
  full_name!: string;

  @Column({ type: 'int', nullable: true })
  age!: number | null;

  @Column({ type: 'varchar', nullable: true })
  document_type!: string | null;
  // 'passport' | 'id_card' | 'none'

  @Column({ type: 'varchar', nullable: true })
  document_number!: string | null;

  @Column({ default: false })
  is_group_leader!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
