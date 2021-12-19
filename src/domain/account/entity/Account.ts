import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
  BaseEntity
} from 'typeorm'
import { Auth } from './Auth'
import { Profile } from './Profile'

@Entity({ name: 'account' })
export class Account extends BaseEntity {
  @PrimaryColumn()
  id!: string

  @Column({ nullable: true })
  is_active!: boolean

  @Column({ nullable: true })
  is_tester!: boolean

  @Column(() => Marketing)
  marketing?: Marketing

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at?: Date

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date

  @OneToMany(() => Profile, (profile) => profile.account)
  profiles?: Profile[]

  @OneToMany(() => Auth, (auth) => auth.account)
  auths?: Auth[]
}

class Marketing {
  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  kakao?: string
}
