import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('publication_likes')
@Unique(['publication_id', 'user_id'])
export class PublicationLike {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') publication_id!: string;
  @Column('uuid') user_id!: string;
  @Column({ type: 'varchar' }) user_role!: string;
  @CreateDateColumn() created_at!: Date;
}
