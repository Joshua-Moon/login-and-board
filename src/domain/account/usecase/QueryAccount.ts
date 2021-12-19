import { Connection, TypeORMError } from 'typeorm'
import { buildPaginator } from 'typeorm-cursor-pagination'

import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { Usecase, ValidationError } from '../../common'
import { Account } from '../entity'

type Input = {
  orderKey?: 'created_at' | 'updated_at'
  orderType?: 'ASC' | 'DESC'
  email: string
  adminId?: string
}

type Output = {
  accounts: Account[]
  count: number
}

export class QueryAccount extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // orderKey
    if (hasOwnProperty(input, 'orderKey') && input.orderKey !== undefined) {
      if (input.orderKey !== 'created_at' && input.orderKey !== 'updated_at') {
        err.msg = '`orderKey` should be `created_at` or `updated_at`.'
        return false
      }
    }

    // orderType
    if (hasOwnProperty(input, 'orderType') && input.orderType !== undefined) {
      if (input.orderType !== 'ASC' && input.orderType !== 'DESC') {
        err.msg = '`orderType` should be `ASC` or `DESC`.'
        return false
      }
    }

    // email
    if (!hasOwnProperty(input, 'email')) {
      err.msg = '`email` is required.'
      return false
    }

    if (typeof input.email !== 'string') {
      err.msg = '`email` should be string type.'
      return false
    }

    return true
  }

  async authorize(conn: Connection, input: Input): Promise<null | Fail> {
    // const repo = conn.getRepository(AdminEntity)
    // try {
    //   const maybeEntity = await repo.findOne(input.adminId)
    //   if (!maybeEntity) {
    //     return fail('Only admin can access.', 403)
    //   }
    // } catch (e) {
    //         let err = e
    // if (err instanceof TypeORMError) {
    //   err = `${err.name}: ${err.message}`
    // }
    // return fail(err as string, 503)
    // }
    return null
  }

  async execute(conn: Connection, input: Input): Promise<Output | Fail> {
    const accountRepo = conn.getRepository(Account)

    const orderKey = input.orderKey ?? 'created_at'
    const orderType = input.orderType ?? 'DESC'

    const accountQuery = accountRepo
      .createQueryBuilder('account')
      .leftJoin('account.auths', 'auths')
      .addSelect([
        'auths.id',
        'auths.auth_kind',
        'auths.loginfo.user_id',
        'auths.loginfo.email'
      ])
      .where('auths.loginfoEmail = :email', { email: input.email })
      .andWhere('account.is_active = :is_active', { is_active: true })

    try {
      const [accounts, count] = await accountQuery
        .orderBy(orderKey, orderType)
        .getManyAndCount()

      return {
        accounts: accounts,
        count: count
      }
    } catch (e) {
      let err = e
      if (err instanceof TypeORMError) {
        err = `${err.name}: ${err.message}`
      }
      return fail(err as string, 503)
    }
  }
}

/**
 * Executable main
 */

async function main() {
  const usecase = new QueryAccount({
    filter: { email: 'user1@email.com' }
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
