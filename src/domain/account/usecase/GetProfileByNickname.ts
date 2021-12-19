import { Repository, TypeORMError } from 'typeorm'
import { fail, Fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { TypeOrmConnection, Usecase, ValidationError } from '../../common'
import { Profile } from '../entity'

type Input = {
  nickname: string
}

type Output = {
  profile: Profile
}

export class GetProfileByNickname extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // nickname
    if (!hasOwnProperty(input, 'nickname')) {
      err.msg = '`nickname` is required.'
      return false
    }

    if (typeof input.nickname !== 'string') {
      err.msg = '`nickname` should be string type.'
      return false
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
        nickname: input.nickname
      })
      if (!maybeProfile) {
        return fail(
          `Nickname '${input.nickname}' is not found in Profiles.`,
          404
        )
      }
      return {
        profile: maybeProfile
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
