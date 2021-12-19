import bcrypt from 'bcrypt'
import { TypeORMError } from 'typeorm'

import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { TypeOrmConnection, Usecase, ValidationError } from '../../common'
import { Auth } from '../entity'

type Input = {
  email: string
  password: string
}

type Output = {
  id: string
}

export class EmailLogin extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type'
      return false
    }

    // email
    if (!hasOwnProperty(input, 'email')) {
      err.msg = '`email` is required'
      return false
    }

    if (typeof input.email !== 'string') {
      err.msg = '`email` should be string type'
      return false
    }

    // password
    if (!hasOwnProperty(input, 'password')) {
      err.msg = '`password` is required'
      return false
    }

    if (typeof input.password !== 'string') {
      err.msg = '`password` should be string type'
      return false
    }

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    return null
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const authRepo = conn.getRepository(Auth)

    try {
      const maybeAuth = await authRepo
        .createQueryBuilder('auth')
        .leftJoinAndSelect('auth.account', 'account')
        .where('auth.loginfoEmail = :email', { email: input.email })
        .andWhere('account.is_active = :is_active', { is_active: true })
        .getOne()

      if (!maybeAuth) {
        return fail(`'${input.email}' does not exist`, 404)
      }
      const auth = maybeAuth

      const hashedPassword = auth.loginfo.password as string
      if (!bcrypt.compareSync(input.password, hashedPassword)) {
        return fail('Wrong password', 400)
      }

      return {
        id: auth?.account.id
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
  const usecase = new EmailLogin({
    email: 'test@test.com',
    password: 'test1234'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
