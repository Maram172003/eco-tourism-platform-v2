import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Avis / Review sur une offre, circuit, projet ou guide
 */
@Entity('reviews')
@Unique(['author_id', 'target_type', 'target_id'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column()
  author_id!: string;

  @Column()
  target_type!: string;
  // 'offer' | 'circuit' | 'project' | 'guide'

  @Column()
  target_id!: string;

  @Column({ type: 'int', default: 1 })
  rating!: number;
  // 1 a 5

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  photos!: string[] | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
