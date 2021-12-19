import crypto from 'crypto'

import { fail, Fail, isFail } from '../core'
import {
  EmailLogin,
  GetAccount,
  RegisterAccount,
  SocialLogin,
  UpdateAccount,
  UpdatePassword,
  Account,
  DeleteAccount,
  GetAuth
} from '../domain'
import jwtUtil, { Payload } from '../external/jwtUtil'
import RedisRepo from '../external/redis'
import { sendMail } from '../external/mailing'
import { Output, OutputId, OutputMessage, OutputToken } from '../domain/common'

export class AccountController {
  async getEmailAuthCode(email: string): Promise<{ authCode: string } | Fail> {
    // 이메일 등록 유무
    const authOrFail = await new GetAuth({ email: email }).exe()
    if (isFail(authOrFail)) {
      return authOrFail
    }

    // mail 발송
    const authCodeOrFail = await sendMail(email)
    if (isFail(authCodeOrFail)) {
      return authCodeOrFail
    }
    const authCode = authCodeOrFail

    return {
      authCode: authCode
    }
  }

  async register(input: unknown): Promise<OutputId | Fail> {
    const outcomeOrFail = await new RegisterAccount(input).exe()
    return outcomeOrFail
  }

  async update(input: unknown): Promise<OutputId | Fail> {
    const outcomeOrFail = await new UpdateAccount(input).exe()
    return outcomeOrFail
  }

  async findOne(input: unknown): Promise<Output<Account> | Fail> {
    const accountOrFail = await new GetAccount(input).exe()
    return accountOrFail
  }

  async delete(input: unknown): Promise<OutputMessage | Fail> {
    const outcomeOrFail = await new DeleteAccount(input).exe()
    return outcomeOrFail
  }

  async login(input: unknown, action: string): Promise<OutputToken | Fail> {
    let outcomeOrFail

    if (action === 'EmailLogin') {
      outcomeOrFail = await new EmailLogin(input).exe()
    }
    if (action === 'SocialLogin') {
      outcomeOrFail = await new SocialLogin(input).exe()
    }

    if (isFail(outcomeOrFail)) {
      return outcomeOrFail
    }

    if (!outcomeOrFail) {
      return fail('Login failed.', 400)
    }

    const id = outcomeOrFail.id
    const payload = {
      id
    }
    const accessToken = jwtUtil.sign(payload)
    const refreshToken = jwtUtil.refresh(payload)

    const redisRepo = new RedisRepo()
    const isSaved = redisRepo.set(id, refreshToken)
    if (!isSaved) {
      return fail('Fail to save refresh token on database.', 401)
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }

  async hasEmail(email: string): Promise<{ result: boolean } | Fail> {
    const authOrFail = await new GetAuth({ email: email }).exe()

    let result: boolean

    if (isFail(authOrFail) && authOrFail.status === 404) {
      result = false
      return { result: result }
    }

    if (isFail(authOrFail)) {
      return authOrFail
    }

    result = true
    return { result: result }
  }

  async getPasswordAuthCode(email: string): Promise<OutputMessage | Fail> {
    // 이메일 등록 유무
    const authOrFail = await new GetAuth({ email: email }).exe()
    if (isFail(authOrFail)) {
      return authOrFail
    }

    // 인증토큰 생성 및 저장
    const authCode = crypto.randomBytes(20).toString('hex')
    const ttl = 300 // 유효시간 설정(5분) 변경 시 authPasswordMailing.html의 유효시간 안내 변경

    const redisRepo = new RedisRepo()
    const isSaved = redisRepo.setExpire(email, authCode, ttl)
    if (!isSaved) {
      return fail('Fail to save the auth code on database.', 401)
    }

    // mail 발송
    const authCodeOrFail = await sendMail(email, authCode)
    if (isFail(authCodeOrFail)) {
      return authCodeOrFail
    }

    return { message: `mailing to '${email}' succeeded.` }
  }

  async updatePassword(
    authCode: string,
    email: string,
    password: string
  ): Promise<OutputId | Fail> {
    // authCode인증
    const redisRepo = new RedisRepo()
    const savedToken = await redisRepo.get(email)
    if (savedToken === null || savedToken !== authCode) {
      return fail('The auth code is not found in database.', 401)
    }
    const input = { email, password }
    const outcomeOrFail = await new UpdatePassword(input).exe()
    return outcomeOrFail
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
      const isAccessToken = jwtUtil.verify(accessToken)
      if (isAccessToken) {
        return fail('The access token is not expired.', 401)
      }

      // 엑세스토큰 발급
      const newAccessToken = jwtUtil.sign({ id: decoded.id })
      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken
      }
    } else {
      return fail('The refresh token is invalid for refreshVerify.', 401)
    }
  }
}
