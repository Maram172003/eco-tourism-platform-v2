import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('publication_comments')
export class PublicationComment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') publication_id!: string;
  @Column('uuid') author_id!: string;
  @Column({ type: 'varchar' }) author_role!: string;
  @Column({ type: 'text' }) content!: string;
  @Column({ type: 'uuid', nullable: true, default: null }) parent_id!: string | null;
  @CreateDateColumn() created_at!: Date;
}
