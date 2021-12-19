import { Repository, TypeORMError } from 'typeorm'
import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { TypeOrmConnection, Usecase, ValidationError } from '../../common'
import { Profile } from '../entity'

type Input = {
  id: string
  accountId?: string
}

type Output = {
  profile: Profile
}

export class GetProfile extends Usecase<Input, Output> {
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

    // accountId
    if (hasOwnProperty(input, 'accountId')) {
      if (typeof input.accountId !== 'string') {
        err.msg = '`accountId` should be string type.'
        return false
      }
    }

    return true
  }
  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    return null
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const profileRepo = conn.getRepository(Profile)

    try {
      const maybeProfile = await profileRepo.findOne({
        id: input.id,
        is_active: true
      })
      if (!maybeProfile) {
        return fail(`'${input.id}' is not found in Profiles.`, 404)
      }
      const profile = maybeProfile
      return {
        profile: profile
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
