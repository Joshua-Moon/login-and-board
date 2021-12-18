import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Generated,
  UpdateDateColumn
} from 'typeorm'

@Entity({ name: 'board' })
export class Board extends BaseEntity {
  @PrimaryColumn()
  id!: string

  @Column({ unique: true })
  @Generated('increment')
  seq!: number

  @Column()
  is_active!: boolean

  @Column()
  is_published!: boolean

  @Column()
  category!: string

  @Column()
  title!: string

  @Column({ nullable: true, length: 500 })
  desc?: string

  @Column()
  created_by!: string

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date
}
