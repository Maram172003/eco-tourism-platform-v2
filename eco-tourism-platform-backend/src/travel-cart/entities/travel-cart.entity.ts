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
import { User } from '../../users/entities/user.entity';
import { TravelCartItem } from './travel-cart-item.entity';

/**
 * Panier temporaire de voyage (Travel Cart)
 * Structure transitoire entre l'exploration et le Trip Plan validé.
 *
 * Workflow : Cart → Trip Plan → Booking
 *
 * Le panier est modifiable librement. Une fois validé,
 * il génère un TripPlan structuré avec dates et programme.
 */
@Entity('travel_carts')
export class TravelCart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'date', nullable: true })
  start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({ type: 'int', nullable: true })
  participant_count!: number | null;

  // Prix total estimé (calculé côté serveur)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_total!: number | null;

  @Column({ default: 'TND' })
  currency!: string;

  @Column({ default: 'active' })
  status!: string;
  // 'active' | 'converted' | 'abandoned'

  @OneToMany(() => TravelCartItem, (item) => item.cart, { cascade: true })
  items!: TravelCartItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
