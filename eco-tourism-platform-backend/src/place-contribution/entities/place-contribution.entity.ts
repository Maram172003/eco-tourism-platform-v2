import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Publication } from '../../publication/entities/publication.entity';
import { ContributionVote } from './contribution-vote.entity';

@Entity('place_contributions')
export class PlaceContribution {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') publication_id: string;
  @ManyToOne(() => Publication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publication_id' }) publication: Publication;

  @Column('uuid') user_id: string;
  @Column() user_role: string;

  @Column({ type: 'enum', enum: ['description', 'images'] })
  type: 'description' | 'images';

  @Column({ type: 'text', nullable: true }) content: string | null;
  @Column({ type: 'simple-array', nullable: true }) images: string[] | null;

  @Column({ default: 0 }) vote_count: number;

  @CreateDateColumn() created_at: Date;

  @OneToMany(() => ContributionVote, (v) => v.contribution)
  votes: ContributionVote[];
}
