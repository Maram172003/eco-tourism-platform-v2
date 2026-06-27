import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('friendships')
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
