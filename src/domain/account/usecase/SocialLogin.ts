import { QueryFailedError, TypeORMError } from 'typeorm'
import {
  fail,
  Fail,
  guardSomeObject,
  hasOwnProperty,
  uuid
} from '../../../core'
import { isValidAuthKind } from '../../catalog'
import { TypeOrmConnection, Usecase, ValidationError } from '../../common'
import { Account, Auth } from '../entity'

type Input = {
  user_id: string
  auth_kind: string
  marketing?: {
    email?: string
    kakao?: string
  }
}

type Output = {
  id: string
}

export class SocialLogin extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type'
      return false
    }

    // user_id
    if (!hasOwnProperty(input, 'user_id')) {
      err.msg = '`user_id` is required'
      return false
    }

    if (typeof input.user_id !== 'string') {
      err.msg = '`user_id` should be string type'
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
      const auth = await authRepo
        .createQueryBuilder('auth')
        .leftJoinAndSelect('auth.account', 'account')
        .where('auth.loginfoUser_id = :user_id', { user_id: input.user_id })
        .getOne()

      if (!auth) {
        // 회원 가입
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
            user_id: input.user_id
          },
          account: savedAccount
        })
        const savedEntity = await authRepo.save(auth)

        return {
          id: savedEntity.account.id
        }
      }

      return {
        id: auth.account.id
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
  const usecase = new SocialLogin({
    user_id: 'kakaoUserId',
    auth_kind: 'kakao'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
