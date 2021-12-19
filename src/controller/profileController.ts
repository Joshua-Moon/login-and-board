import AWS from 'aws-sdk'

import { fail, Fail, isFail } from '../core'
import { Profile, GetProfileByNickname } from '../domain'
import {
  CreateOrUpdateProfile,
  GetProfile,
  QueryProfile,
  DeleteProfile
} from '../domain'

import {
  Output,
  OutputId,
  OutputMessage,
  Outputs,
  OutputToken
} from '../domain/common'
import jwtUtil, { Payload } from '../external/jwtUtil'
import RedisRepo from '../external/redis'
import { s3upload, Upload } from '../external/s3'

export class ProfileController {
  async create(input: unknown): Promise<OutputId | Fail> {
    const outcomeOrFail = await new CreateOrUpdateProfile(input).exe()
    return outcomeOrFail
  }

  async update(input: unknown): Promise<OutputId | Fail> {
    const outcomeOrFail = await new CreateOrUpdateProfile(input).exe()
    return outcomeOrFail
  }

  async findOne(input: unknown): Promise<Output<Profile> | Fail> {
    const profileOrFail = await new GetProfile(input).exe()
    return profileOrFail
  }

  async findAll(input: unknown): Promise<Outputs<Profile> | Fail> {
    const profilesOrFail = await new QueryProfile(input).exe()
    return profilesOrFail
  }

  async delete(input: unknown): Promise<OutputMessage | Fail> {
    const outcomeOrFail = await new DeleteProfile(input).exe()
    return outcomeOrFail
  }

  async generateToken(input: unknown): Promise<OutputToken | Fail> {
    const profileOrFail = await new GetProfile(input).exe()
    if (isFail(profileOrFail)) {
      return profileOrFail
    }
    const { profile } = profileOrFail
    const payload = {
      id: profile.id,
      role: profile.role,
      name: profile.nickname
    }
    const accessToken = jwtUtil.sign(payload)
    const refreshToken = jwtUtil.refresh(payload)

    const redisRepo = new RedisRepo()
    const isSaved = redisRepo.set(payload.id, refreshToken)
    if (!isSaved) {
      return fail('Fail to save refresh token on database.', 401)
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }

  async replaceToken(
    refreshToken: string,
    accessToken: string
  ): Promise<OutputToken | Fail> {
    const isRefreshToken = jwtUtil.refreshVerify(refreshToken)
    if (isRefreshToken) {
      // decode 실패
      const decodedOrFail = jwtUtil.decode(refreshToken)
      if (decodedOrFail == null) {
        return fail('The refresh token is invalid for decode.', 401)
      }
      // Redis DB에 없음
      const decoded = decodedOrFail as Payload
      const redisRepo = new RedisRepo()
      const savedToken = await redisRepo.get(decoded.id)
      if (savedToken === null || savedToken !== refreshToken) {
        return fail('The refresh token is not found in database.', 401)
      }
      // 유효한 액세스토큰
      const isAccessToken = jwtUtil.verify(accessToken, true)
      if (isAccessToken) {
        return fail('The access token is not expired.', 401)
      }

      // 엑세스토큰 발급
      const payload = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name
      }
      const newAccessToken = jwtUtil.sign(payload)
      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken
      }
    } else {
      return fail('The refresh token is invalid for refreshVerify.', 401)
    }
  }

  async uploadWithS3(input: Upload) {
    return await s3upload(input)
  }

  async hasNickname(nickname: string): Promise<{ result: boolean } | Fail> {
    const profilesOrFail = await new GetProfileByNickname({
      nickname: nickname
    }).exe()

    let result: boolean

    if (isFail(profilesOrFail) && profilesOrFail.status === 404) {
      result = false
      return { result: result }
    }

    if (isFail(profilesOrFail)) {
      return profilesOrFail
    }

    result = true
    return { result: result }
  }
}
