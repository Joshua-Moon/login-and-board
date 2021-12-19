import { TypeORMError } from 'typeorm'
import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Account } from '../entity'

type Input = {
  id: string
  idByToken: string
}

type Output = {
  message: string
}

export class DeleteAccount extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // id
    if (!hasOwnProperty(input, 'id')) {
      // err.msg = '`id` is required.'
      return false
    }

    if (typeof input.id !== 'string') {
      err.msg = '`id` should be string type.'
      return false
    }

    // idByToken
    if (!hasOwnProperty(input, 'idByToken')) {
      // err.msg = '`idByToken` is required.'
      return false
    }

    if (typeof input.idByToken !== 'string') {
      err.msg = '`idByToken` should be string type.'
      return false
    }

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    // 실행 account와 deactive되는 account가 동일한가
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
    const accountRepo = conn.getRepository(Account)

    try {
      const maybeAccount = await accountRepo.findOne({
        id: input.id,
        is_active: true
      })
      if (!maybeAccount) {
        return fail(`'${input.id}' does not exist`, 404)
      }

      const account = accountRepo.create({
        ...maybeAccount,
        is_active: false
      })
      await accountRepo.save(account)
      return {
        message: `Deleted Raw On ${input.id}`
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
