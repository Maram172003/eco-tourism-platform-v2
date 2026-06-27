import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('item_comment_likes')
@Unique(['comment_id', 'user_id'])
export class ItemCommentLike {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') comment_id!: string;
  @Column('uuid') user_id!: string;
  @Column({ type: 'varchar' }) user_role!: string;
  @CreateDateColumn() created_at!: Date;
}
