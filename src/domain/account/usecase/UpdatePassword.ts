import bcrypt from 'bcrypt'
import { TypeORMError } from 'typeorm'

import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'

import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Account, Auth } from '../entity'

type Input = {
  email: string
  password: string
}

type Output = {
  id: string
}

export class UpdatePassword extends Usecase<Input, Output> {
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

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    return null
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const repo = conn.getRepository(Auth)
    const hashedPassword = bcrypt.hashSync(input.password, 10)

    try {
      const authOrFail = await repo
        .createQueryBuilder('auth')
        .leftJoinAndSelect('auth.account', 'account')
        .where('auth.loginfoEmail = :email', { email: input.email })
        .andWhere('account.is_active = :is_active', { is_active: true })
        .getOne()

      if (!authOrFail) {
        return fail(`'${input.email}'does not exist`, 404)
      }
      const auth = authOrFail

      const newAuth = repo.create({
        id: auth.id,
        auth_kind: auth.auth_kind,
        loginfo: {
          email: auth.loginfo.email,
          password: hashedPassword
        },
        account: auth.account
      })
      const savedEntity = await repo.save(newAuth)

      return {
        id: savedEntity.account.id
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
  const usecase = new UpdatePassword({
    email: 'test@test.com',
    password: 'test3333'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
