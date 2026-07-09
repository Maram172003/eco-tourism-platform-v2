import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Favori d'un utilisateur
 * Permet de sauvegarder des offres, circuits, projets ou guides
 */
@Entity('favorites')
@Unique(['user_id', 'target_type', 'target_id'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: string;

  @Column()
  target_type!: string;
  // 'offer' | 'circuit' | 'project' | 'guide'

  @Column()
  target_id!: string;

  @CreateDateColumn()
  created_at!: Date;
}
