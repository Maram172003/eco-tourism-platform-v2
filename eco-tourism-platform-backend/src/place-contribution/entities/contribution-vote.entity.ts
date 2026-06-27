import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { PlaceContribution } from './place-contribution.entity';

@Entity('contribution_votes')
export class ContributionVote {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') contribution_id: string;
  @ManyToOne(() => PlaceContribution, (c) => c.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contribution_id' }) contribution: PlaceContribution;

  @Column('uuid') user_id: string;

  @Column({ type: 'int', nullable: true, default: null }) image_index: number | null;

  @CreateDateColumn() created_at: Date;
}
