import { TypeORMError } from 'typeorm'
import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'

import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Account } from '../entity'

type Input = {
  id: string
  // TODO Optional 처리 어떻게 해야 할지?
  marketing?: {
    email?: string
    kakao?: string
  }
  idByToken: string
}

type Output = {
  id: string
}

export class UpdateAccount extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // // email
    // if (!hasOwnProperty(input, 'email')) {
    //   err.msg = '`email` is required.'
    //   return false
    // }

    // if (typeof input.email !== 'string') {
    //   err.msg = '`email` should be string type.'
    //   return false
    // }

    // // auth_kind
    // if (!hasOwnProperty(input, 'auth_kind')) {
    //   err.msg = '`auth_kind` is required.'
    //   return false
    // }

    // if (typeof input.auth_kind !== 'string') {
    //   err.msg = '`auth_kind` should be string type.'
    //   return false
    // }

    // if (!isValidAuthKind(input.auth_kind)) {
    //   err.msg = '`auth_kind` is invalid.'
    //   return false
    // }

    // idByToken
    if (!hasOwnProperty(input, 'idByToken')) {
      // err.msg = '`idByToken` is required.'
      return false
    }

    if (typeof input.idByToken !== 'string') {
      err.msg = '`idByToken` should be string type.'
      return false
    }

    // TODO marketing

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    // 실행 account와 수정되는 account가 동일한가
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
    // const authRepo = conn.getRepository(Auth)

    try {
      const maybeAccount = await accountRepo.findOne({
        id: input.id,
        is_active: true
      })
      if (!maybeAccount) {
        return fail(`'${input.id}' does not exist`, 404)
      }

      const account = accountRepo.create({
        id: input.id,
        is_active: maybeAccount.is_active,
        marketing: input.marketing
      })

      const savedAccount = await accountRepo.save(account)
      // TODO account와 auth에서 update할 수 있는 부분 논의 필요
      // const authEntity = await authRepo.findOne({ account: { id: input.id } })

      // const auth = authRepo.create({
      //   id: authEntity?.id,
      //   auth_kind: authEntity?.auth_kind,
      //   loginfo: {
      //     email: authEntity?.loginfo.email,
      //     password: authEntity?.loginfo.password
      //   },
      //   account: savedAccount
      // })
      // const savedEntity = await authRepo.save(auth)

      return {
        id: savedAccount.id
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
  const usecase = new UpdateAccount({
    id: 'pQ3P074xJ064oN8jQ1RSs',
    email: 'test@test.com',
    auth_kind: 'EMAIL',
    marketing: {
      email: 'test@test.com'
    }
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
