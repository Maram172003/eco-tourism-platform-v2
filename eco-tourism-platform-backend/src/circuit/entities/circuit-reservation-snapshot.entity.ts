import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CircuitReservation } from './circuit-reservation.entity';

@Entity('circuit_reservation_snapshots')
export class CircuitReservationSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => CircuitReservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuit_reservation_id' })
  circuitReservation!: CircuitReservation;

  @Column({ type: 'jsonb' })
  data!: {
    circuit: {
      id: string;
      title: string;
      description: string | null;
      start_date: string | null;
      end_date: string | null;
      duration_days: number | null;
      duration_nights: number | null;
      base_price: number | null;
      currency: string;
      max_participants: number | null;
      confirmation_mode: string | null;
      difficulty_level: string | null;
      inclusions: string | null;
      exclusions: string | null;
      author_id: string;
    };
    program: {
      day_number: number;
      date: string | null;
      title: string;
      items: {
        title: string;
        start_time: string | null;
        end_time: string | null;
        is_included: boolean;
        price: number | null;
        category: string | null;
        guide_id: string | null;
        guide_name: string | null;
        linked_offer_item_id: string | null;
      }[];
    }[];
    pricing: {
      participants_count: number;
      base_total: number;
      options_total: number;
      final_total: number;
    };
    selected_options: {
      option_id: string;
      option_group: string | null;
      option_type: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[];
  };

  @CreateDateColumn()
  created_at!: Date;
}
