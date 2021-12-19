import { TypeORMError } from 'typeorm'
import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Account, Profile } from '../entity'

type Input = {
  id: string
  accountId: string
}

type Output = {
  message: string
}

export class DeleteProfile extends Usecase<Input, Output> {
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

    // accountId
    if (!hasOwnProperty(input, 'accountId')) {
      // err.msg = '`accountId` is required.'
      return false
    }

    if (typeof input.accountId !== 'string') {
      err.msg = '`accountId` should be string type.'
      return false
    }

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    // 실행 account와 deactive되는 account가 동일한가
    const profileRepo = conn.getRepository(Profile)

    try {
      const maybeProfile = await profileRepo.findOne(
        { id: input.id, is_active: true },
        { cache: true }
      )

      // By Who?
      const executor = input.accountId
      // owner
      const owner = maybeProfile ? maybeProfile.accountId : undefined

      if (executor !== owner) {
        return fail('Executor and owner should be the same.', 403)
      }
      return null
    } catch (e) {
      let err = e
      if (err instanceof TypeORMError) {
        err = `${err.name}: ${err.message}`
      }
      return fail(err as string, 503)
    }
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const profileRepo = conn.getRepository(Profile)

    try {
      const maybeProfile = await profileRepo.findOne({
        id: input.id,
        is_active: true
      })
      if (!maybeProfile) {
        return fail(`'${input.id}' does not exist`, 404)
      }

      const profile = profileRepo.create({
        ...maybeProfile,
        is_active: false
      })
      await profileRepo.save(profile)
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
