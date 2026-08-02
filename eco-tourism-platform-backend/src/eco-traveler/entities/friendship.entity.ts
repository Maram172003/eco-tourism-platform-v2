import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('friendships')
@Unique(['requester_id', 'receiver_id'])
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  requester_id!: string;

  @Column('uuid')
  receiver_id!: string;

  // pending | accepted
  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}
