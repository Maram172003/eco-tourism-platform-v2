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
import { TripPlanItem } from './trip-plan-item.entity';

@Entity('trip_plans')
export class TripPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'eco_traveler_id' })
  ecoTraveler!: User;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'date', nullable: true })
  start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({ default: 'draft' })
  status!: string;

  @OneToMany(() => TripPlanItem, (item) => item.tripPlan)
  items!: TripPlanItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
