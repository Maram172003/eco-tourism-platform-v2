import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('conversations')
@Unique(['participant_a_id', 'participant_b_id'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  participant_a_id!: string;

  @Column({ type: 'varchar' })
  participant_a_role!: string;

  @Column('uuid')
  participant_b_id!: string;

  @Column({ type: 'varchar' })
  participant_b_role!: string;

  @CreateDateColumn()
  created_at!: Date;
}
