import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_comments')
export class ItemComment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) target_type!: string; // 'offer' | 'project'
  @Column('uuid') target_id!: string;
  @Column('uuid') author_id!: string;
  @Column({ type: 'varchar' }) author_role!: string;
  @Column({ type: 'text' }) content!: string;
  @Column({ type: 'uuid', nullable: true, default: null }) parent_id!: string | null;
  @CreateDateColumn() created_at!: Date;
}
