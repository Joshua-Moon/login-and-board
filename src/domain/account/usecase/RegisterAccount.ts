import bcrypt from 'bcrypt'
import { TypeORMError } from 'typeorm'

import {
  Fail,
  fail,
  guardSomeObject,
  hasOwnProperty,
  uuid
} from '../../../core'
import { isValidAuthKind } from '../../catalog'

import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Account, Auth } from '../entity'

type Input = {
  email: string
  password: string
  auth_kind: string
  // TODO Optional 처리 어떻게 해야 할지?
  marketing?: {
    email?: string
    kakao?: string
  }
}

type Output = {
  id: string
}

export class RegisterAccount extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
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

    // password
    if (!hasOwnProperty(input, 'password')) {
      err.msg = '`password` is required.'
      return false
    }

    if (typeof input.password !== 'string') {
      err.msg = '`password` should be string type.'
      return false
    }

    const regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/
    if (!regex.test(input.password)) {
      err.msg =
        '`password` must be between 8 and 20 in mixed a lowercase letter, a number and a symbol'
      return false
    }

    // auth_kind
    if (!hasOwnProperty(input, 'auth_kind')) {
      err.msg = '`auth_kind` is required.'
      return false
    }

    if (typeof input.auth_kind !== 'string') {
      err.msg = '`auth_kind` should be string type.'
      return false
    }

    if (!isValidAuthKind(input.auth_kind)) {
      err.msg = '`auth_kind` is invalid.'
      return false
    }

    // TODO marketing

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    return null
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const accountRepo = conn.getRepository(Account)
    const authRepo = conn.getRepository(Auth)

    try {
      const maybeAuth = await authRepo.findOne({
        loginfo: { email: input.email }
      })
      if (maybeAuth) {
        return fail(`'${input.email}' already exists.`, 400)
      }

      const hashedPassword = bcrypt.hashSync(input.password, 10)

      const account = accountRepo.create({
        id: uuid(),
        is_active: true,
        marketing: input.marketing
      })
      const savedAccount = await accountRepo.save(account)

      const auth = authRepo.create({
        id: uuid(),
        auth_kind: input.auth_kind,
        loginfo: {
          email: input.email,
          password: hashedPassword
        },
        account: savedAccount
      })
      const savedAuth = await authRepo.save(auth)

      return {
        id: savedAuth.account.id
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
  const usecase = new RegisterAccount({
    email: 'test@test.com',
    password: 'test1234',
    auth_kind: 'email'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
