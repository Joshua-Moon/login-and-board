import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  Unique
} from 'typeorm'
import { Account } from './Account'

@Entity({ name: 'profile' })
@Unique(['nickname'])
export class Profile extends BaseEntity {
  @PrimaryColumn()
  id!: string

  @Column()
  is_active!: boolean

  @Column()
  role!: string

  @Column()
  nickname!: string

  @Column({ nullable: true })
  profile_image_uri?: string

  @Column({ nullable: true })
  determination?: string

  // TODO 타입 고민
  @Column('jsonb', { nullable: true })
  prepared_exam?: {
    kind: string
    details?: {
      age?: string
      rank?: string
      area?: string
      favorite: boolean
    }[]
  }

  @Column({ nullable: true })
  accountId?: string

  @ManyToOne(() => Account, (account) => account.profiles)
  account!: Account
}
