import { TypeORMError } from 'typeorm'
import {
  Fail,
  fail,
  guardSomeObject,
  hasOwnProperty,
  uuid
} from '../../../core'
import { isValidRole, Role } from '../../catalog'

import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Account, Profile } from '../entity'

type Input = {
  id?: string
  role: typeof Role[number]
  nickname: string
  profile_image_uri?: string
  determination?: string
  // TODO Optional 처리 어떻게 해야 할지?
  prepared_exam?: {
    kind: string
    details?: {
      age?: string
      rank?: string
      area?: string
      favorite: boolean
    }[]
  }
  accountId?: string
}

type Output = {
  id: string
}

export class CreateOrUpdateProfile extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // role
    if (!hasOwnProperty(input, 'role')) {
      err.msg = '`role` is required.'
      return false
    }

    if (typeof input.role !== 'string') {
      err.msg = '`role` should be string type.'
      return false
    }

    if (!isValidRole(input.role)) {
      err.msg = '`role` is invalid.'
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

    // accountId
    if (hasOwnProperty(input, 'accountId')) {
      if (typeof input.accountId !== 'string') {
        err.msg = '`accountId` should be string type.'
        return false
      }
    }

    // TODO profile_image_uri, determination, prepared_exam

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    const accountRepo = conn.getRepository(Account)
    const profileRepo = conn.getRepository(Profile)
    const limitedRoleCount = {
      MEMBER: 2,
      STAFF: 1,
      MANAGER: 1
    }

    try {
      const maybeAccount = await accountRepo
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.profiles', 'profiles')
        .where('account.id = :id', { id: input.accountId })
        .andWhere('account.is_active = :is_active', { is_active: true })
        .getOne()

      // 등록된 accountId가 아니면 불가
      if (!maybeAccount) {
        return fail(`'${input.accountId}' is not found in Accounts.`, 404)
      }

      const maybeProfile = await profileRepo.findOne(
        { id: input.id, is_active: true },
        { cache: true }
      )
      // input.id가 있지만 profile에 없으면 고정id로 생성되므로 fail처리
      if (input.id && !maybeProfile) {
        return fail(`'${input.id}' dose not exist for update.`, 403)
      }

      const action = maybeProfile ? 'Update' : 'Create'

      // By Who?
      const executor = input.accountId
      const role = input.role
      const nickname = input.nickname

      // owner
      const owner = maybeProfile ? maybeProfile.accountId : undefined

      if (action === 'Create') {
        // 동일한 nickName이 있다면 생성 불가
        const maybeProfileByNickname = await profileRepo.findOne(
          { nickname: nickname },
          { cache: true }
        )
        if (maybeProfileByNickname) {
          return fail(`Nickname '${nickname}' already exists.`, 400)
        }

        // 프로필 생성 개수 제한
        if (maybeAccount.profiles) {
          const result = maybeAccount.profiles.filter(
            (profile) => profile.role === role
          )
          if (result.length >= limitedRoleCount[role]) {
            return fail(
              `Cannot create role of '${role}' in profile more than ${limitedRoleCount[role]}.`,
              400
            )
          }
        }
        return null
      }

      if (action === 'Update' && executor === owner) {
        const previousRole = maybeProfile?.role
        const previousNickname = maybeProfile?.nickname
        // 수정 시 role 변경 불가
        if (role !== previousRole) {
          return fail('Cannot change Role of a profile.', 400)
        }
        // nickname 수정 시, 동일한 nickname이 있다면 변경 불가
        if (nickname !== previousNickname) {
          const maybeProfileByNickname = await profileRepo.findOne({
            nickname: nickname
          })
          if (maybeProfileByNickname) {
            return fail(`Nickname '${nickname}' already exists.`, 400)
          }
        }
        return null
      }

      return fail('Executor and owner should be the same.', 403)
    } catch (e) {
      let err = e
      if (err instanceof TypeORMError) {
        err = `${err.name}: ${err.message}`
      }
      return fail(err as string, 503)
    }
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const accountRepo = conn.getRepository(Account)
    const profileRepo = conn.getRepository(Profile)

    try {
      const account = await accountRepo
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.profiles', 'profiles')
        .where('account.id = :id', { id: input.accountId })
        .andWhere('account.is_active = :is_active', { is_active: true })
        .getOne()

      const profile = profileRepo.create({
        id: input.id ?? uuid(),
        is_active: true,
        role: input.role,
        nickname: input.nickname,
        profile_image_uri: input.profile_image_uri,
        determination: input.determination,
        prepared_exam: input.prepared_exam,
        account: account
      })

      const savedProfile = await profileRepo.save(profile)

      return {
        id: savedProfile.id
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
  const usecase = new CreateOrUpdateProfile({
    role: 'TEACHER',
    nickname: '3급 학생',
    determination: '이번 시험은 무조건 1등급이다!!',
    profile_image_uri: '',
    prepared_exam: {
      kind: '수능',
      details: [
        {
          age: '고2',
          favorite: true
        },
        {
          age: '고3',
          favorite: false
        }
      ]
    },
    accountId: 'vhGuqxYIEhyB75IzLfUu7'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
