import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  reporter_id!: string;

  @Column({ type: 'varchar' })
  reporter_role!: string;

  @Column('uuid')
  reported_id!: string;

  @Column({ type: 'varchar' })
  reported_role!: string;

  @Column({ type: 'text' })
  reason!: string;

  // pending | resolved | dismissed
  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  // warn | ban | delete | none
  @Column({ type: 'varchar', nullable: true })
  action_taken!: string | null;

  @Column({ type: 'text', nullable: true })
  admin_note!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at!: Date | null;
}
