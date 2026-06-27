import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  follower_id!: string;

  // eco_traveler | guide | project
  @Column({ type: 'varchar' })
  follower_type!: string;

  @Column('uuid')
  following_id!: string;

  // guide | project
  @Column({ type: 'varchar' })
  following_type!: string;

  @CreateDateColumn()
  created_at!: Date;
}
