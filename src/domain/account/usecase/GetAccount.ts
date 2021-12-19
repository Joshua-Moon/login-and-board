import { TypeORMError } from 'typeorm'
import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { TypeOrmConnection, Usecase, ValidationError } from '../../common'
import { Account } from '../entity'

type Input = {
  id: string
  idByToken?: string
}

type Output = {
  account: Account
}

export class GetAccount extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // id
    if (!hasOwnProperty(input, 'id')) {
      err.msg = '`id` is required.'
      return false
    }

    if (typeof input.id !== 'string') {
      err.msg = '`id` should be string type.'
      return false
    }

    // idByToken
    if (hasOwnProperty(input, 'idByToken')) {
      if (typeof input.idByToken !== 'string') {
        err.msg = '`idByToken` should be string type.'
        return false
      }
    }

    return true
  }
  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    // 실행 account와 조회되는 account가 동일한가
    if (input.idByToken) {
      const executor = input.idByToken
      const owner = input.id
      if (executor !== owner) {
        return fail('Executor and owner should be the same.', 403)
      }
    }
    return null
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const repo = conn.getRepository(Account)

    try {
      const AccountOrEmpty = await repo
        .createQueryBuilder('account')
        .leftJoin('account.auths', 'auths')
        .addSelect([
          'auths.id',
          'auths.auth_kind',
          'auths.loginfo.user_id',
          'auths.loginfo.email'
        ])
        .leftJoinAndSelect('account.profiles', 'profiles')
        .where('account.id = :id', { id: input.id })
        .andWhere('account.is_active = :is_active', { is_active: true })
        .getOne()

      if (!AccountOrEmpty) {
        return fail(`'${input.id}' is not found in Accounts.`, 404)
      }
      const Account = AccountOrEmpty
      return {
        account: Account
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
  const usecase = new GetAccount({
    id: 'l4aoivum19F2lfbez0GGW'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
