import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm'
import { Account } from './Account'

@Entity({ name: 'auth' })
export class Auth extends BaseEntity {
  @PrimaryColumn()
  id!: string

  @Column()
  auth_kind!: string

  @Column(() => Loginfo)
  loginfo!: Loginfo

  @ManyToOne(() => Account, (account) => account.auths)
  account!: Account

  @Column()
  accountId!: string
}

class Loginfo {
  @Column({ nullable: true })
  user_id?: string
  @Column({ nullable: true })
  email?: string
  @Column({ nullable: true })
  password?: string
}
