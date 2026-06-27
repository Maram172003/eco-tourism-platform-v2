import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('conversations')
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
