import { Connection, TypeORMError } from 'typeorm'
import { buildPaginator } from 'typeorm-cursor-pagination'

import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { Usecase, ValidationError } from '../../common'
import { Profile } from '../entity'

type Input = {
  orderKey?: 'role'
  orderType?: 'ASC' | 'DESC'
  accountId: string
  accountIdByToken?: string
}

type Output = {
  profiles: Profile[]
  count: number
}

export class QueryProfile extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // accountId
    if (!hasOwnProperty(input, 'accountId')) {
      err.msg = '`accountId` is required.'
      return false
    }

    if (typeof input.accountId !== 'string') {
      err.msg = '`accountId` should be string type.'
      return false
    }

    // accountIdByToken
    if (
      hasOwnProperty(input, 'accountIdByToken') &&
      input.accountIdByToken !== undefined
    ) {
      if (typeof input.accountIdByToken !== 'string') {
        err.msg = '`accountIdByToken` should be string type.'
        return false
      }
    }

    return true
  }
  async authorize(conn: Connection, input: Input): Promise<null | Fail> {
    // 실행 account와 조회되는 account가 동일한가
    if (input.accountIdByToken) {
      const executor = input.accountIdByToken
      const owner = input.accountId
      if (executor !== owner) {
        return fail('Executor and owner should be the same.', 403)
      }
    }
    return null
  }

  async execute(conn: Connection, input: Input): Promise<Output | Fail> {
    const repo = conn.getRepository(Profile)

    const orderKey = input.orderKey ?? 'role'
    const orderType = input.orderType ?? 'DESC'

    const profileQuery = repo
      .createQueryBuilder('profile')
      .where(`"accountId" = :accountId`, { accountId: input.accountId })
      .andWhere(`"is_active" = :is_active`, { is_active: true })

    try {
      const [profiles, count] = await profileQuery
        .orderBy(orderKey, orderType)
        .getManyAndCount()

      return {
        profiles: profiles,
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
  const usecase = new QueryProfile({
    filter: { accountId: 'bygH9UJTxVn2r130U-FS0' }
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
