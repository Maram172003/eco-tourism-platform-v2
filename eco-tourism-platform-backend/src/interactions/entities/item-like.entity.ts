import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('item_likes')
@Unique(['target_type', 'target_id', 'user_id'])
export class ItemLike {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) target_type!: string; // 'offer' | 'project'
  @Column('uuid') target_id!: string;
  @Column('uuid') user_id!: string;
  @Column({ type: 'varchar' }) user_role!: string;
  @CreateDateColumn() created_at!: Date;
}
