import { TypeORMError } from 'typeorm'
import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { TypeOrmConnection, Usecase, ValidationError } from '../../common'
import { Account, Auth } from '../entity'

type Input = {
  email: string
}

type Output = {
  auth: Auth
}

export class GetAuth extends Usecase<Input, Output> {
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

    return true
  }
  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    return null
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const AuthRepo = conn.getRepository(Auth)

    try {
      const maybeAuth = await AuthRepo.findOne({
        loginfo: { email: input.email }
      })
      if (!maybeAuth) {
        return fail(`'${input.email}' is not found in Auths.`, 404)
      }

      const auth = maybeAuth
      // password 제외
      delete auth.loginfo.password

      return {
        auth: auth
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
  const usecase = new GetAuth({
    id: 'l4aoivum19F2lfbez0GGW'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
