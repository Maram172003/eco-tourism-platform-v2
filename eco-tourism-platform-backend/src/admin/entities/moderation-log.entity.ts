import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('moderation_logs')
export class ModerationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  admin_id!: string;

  @Column()
  entity_type!: string;

  @Column('uuid')
  entity_id!: string;

  @Column()
  action!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
