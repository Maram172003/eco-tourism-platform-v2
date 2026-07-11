import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('follows')
@Unique(['follower_id', 'following_id'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  follower_id!: string;

  // eco_traveler | guide | provider
  @Column({ type: 'varchar' })
  follower_type!: string;

  @Column('uuid')
  following_id!: string;

  // guide | provider
  @Column({ type: 'varchar' })
  following_type!: string;

  @CreateDateColumn()
  created_at!: Date;
}
