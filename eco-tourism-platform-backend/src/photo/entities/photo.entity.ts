import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  url!: string;

  @Column({ type: 'varchar' })
  entity_type!: string;

  @Column('uuid')
  entity_id!: string;

  @Column({ type: 'boolean', default: false })
  is_hero!: boolean;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column('uuid')
  uploaded_by!: string;

  @CreateDateColumn()
  created_at!: Date;
}
