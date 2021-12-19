import express, { Request, Response, NextFunction, Router } from 'express'
import passport from 'passport'

import { passportConfig } from '../external/passport'
import { accountJWT } from '../middleware/jwtAuth'
import { fail, isFail, uuid } from '../core'
import { oauth_config } from '../config'
import { AccountController, ProfileController } from '../controller'
import { upload_middleware } from '../middleware/upload'
import { logger } from '../external/logger'

passportConfig.config()

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/')
  }
}
export const accountRouter: Router = express.Router()
accountRouter.use(passport.initialize())
accountRouter.use(passport.session())
const accountController = new AccountController()
const profileController = new ProfileController()

accountRouter.post(
  '/accounts/register',
  async (req: Request, res: Response) => {
    const accountId = await accountController.register(req.body)
    if (isFail(accountId)) {
      logger.error(`${accountId.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(accountId.status ?? 400).json(accountId)
    }
    return res.status(201).json(accountId)
  }
)

accountRouter.post('/accounts/login', (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    logger.error(
      `이메일 또는 비밀번호를 입력해주세요 - ${req.originalUrl} - ${req.method}`
    )
    return res.redirect(301, '/login')
  }
  passport.authenticate('localLogin', async (err: any, input: any) => {
    if (err) {
      logger.error(`${err} - ${req.originalUrl} - ${req.method}`)
      return res.status(401).json(fail(err))
    }
    const tokenOrFail = await accountController.login(input, 'EmailLogin')
    if (isFail(tokenOrFail)) {
      logger.error(
        `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
    }
    const token = tokenOrFail
    return res.status(201).json({ token })
  })(req, res)
})

accountRouter.put(
  '/accounts/reset-password',
  async (req: Request, res: Response) => {
    if (!req.body.authCode || !req.body.email || !req.body.password) {
      return res
        .status(401)
        .json(fail('AuthCode, Email and New Password should not be empty.'))
    }
    const authCode = req.body.authCode
    const email = req.body.email
    const password = req.body.password

    const accountId = await accountController.updatePassword(
      authCode,
      email,
      password
    )
    if (isFail(accountId)) {
      logger.error(`${accountId.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(accountId.status ?? 400).json(accountId)
    }
    return res.status(201).json(accountId)
  }
)

accountRouter.put(
  '/accounts/:accountId',
  accountJWT,
  async (req: Request, res: Response) => {
    const input = {
      ...req.body,
      id: req.params.accountId,
      idByToken: req.body.executedBy.id
    }
    const accountId = await accountController.update(input)
    if (isFail(accountId)) {
      logger.error(`${accountId.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(accountId.status ?? 400).json(accountId)
    }
    return res.status(201).json(accountId)
  }
)

accountRouter.get(
  '/accounts/find/:email',
  async (req: Request, res: Response) => {
    const email = req.params.email
    const result = await accountController.hasEmail(email)
    if (isFail(result)) {
      logger.error(`${result.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(result.status ?? 400).json(result)
    }
    return res.status(200).json(result)
  }
)

accountRouter.get(
  '/accounts/forget-password/:email',
  async (req: Request, res: Response) => {
    const email = req.params.email
    const successMessage = await accountController.getPasswordAuthCode(email)
    if (isFail(successMessage)) {
      logger.error(
        `${successMessage.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(successMessage.status ?? 400).json(successMessage)
    }
    return res.status(200).json(successMessage)
  }
)

accountRouter.get(
  '/accounts/auth/kakao',
  isLoggedIn,
  passport.authenticate('kakao', {
    successRedirect: '/',
    failureRedirect: '/fail'
  })
)

accountRouter.get(
  '/accounts/auth/kakao_oauth',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('kakao', async (err: any, input: any) => {
      if (err) {
        logger.error(`${err} - ${req.originalUrl} - ${req.method}`)
        return res.status(401).json(fail(err))
      }
      const tokenOrFail = await accountController.login(input, 'SocialLogin')
      if (isFail(tokenOrFail)) {
        logger.error(
          `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
        )
        return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
      }
      const token = tokenOrFail
      return res
        .status(201)
        .redirect(
          `${oauth_config.OAUTH_REDIRECT_URL}/login/mid?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`
        )
    })(req, res, next)
  }
)

accountRouter.get(
  '/accounts/auth/naver',
  isLoggedIn,
  passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/fail'
  })
)

accountRouter.get(
  '/accounts/auth/naver_oauth',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('naver', async (err: any, input: any) => {
      if (err) {
        logger.error(`${err} - ${req.originalUrl} - ${req.method}`)
        return res.status(401).json(fail(err))
      }
      const tokenOrFail = await accountController.login(input, 'SocialLogin')
      if (isFail(tokenOrFail)) {
        logger.error(
          `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
        )
        return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
      }
      const token = tokenOrFail
      return res
        .status(201)
        .redirect(
          `${oauth_config.OAUTH_REDIRECT_URL}/login/mid?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`
        )
    })(req, res, next)
  }
)

accountRouter.get(
  '/accounts/auth/facebook',
  isLoggedIn,
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/fail',
    scope: ['email']
  })
)

accountRouter.get(
  '/accounts/auth/facebook_oauth',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('facebook', async (err: any, input: any) => {
      if (err) {
        logger.error(`${err} - ${req.originalUrl} - ${req.method}`)
        return res.status(401).json(fail(err))
      }
      const tokenOrFail = await accountController.login(input, 'SocialLogin')
      if (isFail(tokenOrFail)) {
        logger.error(
          `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
        )
        return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
      }
      const token = tokenOrFail
      return res
        .status(201)
        .redirect(
          `${oauth_config.OAUTH_REDIRECT_URL}/login/mid?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`
        )
    })(req, res, next)
  }
)

accountRouter.get(
  '/accounts/auth/google',
  isLoggedIn,
  passport.authenticate('google', {
    scope: ['email'],
    successRedirect: '/',
    failureRedirect: '/fail'
  })
)

accountRouter.get(
  '/accounts/auth/google_oauth',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', async (err: any, input: any) => {
      if (err) {
        logger.error(`${err} - ${req.originalUrl} - ${req.method}`)
        return res.status(401).json(fail(err))
      }
      const tokenOrFail = await accountController.login(input, 'SocialLogin')
      if (isFail(tokenOrFail)) {
        logger.error(
          `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
        )
        return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
      }
      const token = tokenOrFail
      return res
        .status(201)
        .redirect(
          `${oauth_config.OAUTH_REDIRECT_URL}/login/mid?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`
        )
    })(req, res, next)
  }
)

accountRouter.get(
  '/accounts/auth/:email',
  async (req: Request, res: Response) => {
    const email = req.params.email
    const authCode = await accountController.getEmailAuthCode(email)
    if (isFail(authCode)) {
      logger.error(`${authCode.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(400).json(authCode)
    }
    return res.status(200).json(authCode)
  }
)

accountRouter.get('/accounts/refresh', async (req: Request, res: Response) => {
  if (req.headers.authorization && req.headers.refresh) {
    const refreshToken = req.headers.refresh as string
    const accessToken: string = req.headers.authorization.split('Bearer ')[1]

    const tokenOrFail = await accountController.replaceToken(
      refreshToken,
      accessToken
    )
    if (isFail(tokenOrFail)) {
      logger.error(
        `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
    }
    const token = tokenOrFail
    return res.status(200).json({ token })
  } else {
    logger.error(
      `Tokens are needed for refresh! - ${req.originalUrl} - ${req.method}`
    )
    return res.status(401).json(fail('Both tokens should not be empty.'))
  }
})

accountRouter.get(
  '/accounts/:accountId',
  accountJWT,
  async (req: Request, res: Response) => {
    const input = {
      id: req.params.accountId,
      idByToken: req.body.executedBy.id
    }
    const account = await accountController.findOne(input)
    if (isFail(account)) {
      logger.error(`${account.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(account.status ?? 400).json(account)
    }
    return res.status(200).json(account)
  }
)

// 개발 테스트용
accountRouter.get(
  '/accounts/login/mid',
  async (req: Request, res: Response) => {
    res.json({
      test: 'success'
    })
  }
)

accountRouter.delete(
  '/accounts',
  accountJWT,
  async (req: Request, res: Response) => {
    const input = {
      ...req.body,
      idByToken: req.body.executedBy.id
    }
    const successMessage = await accountController.delete(input)
    if (isFail(successMessage)) {
      logger.error(
        `${successMessage.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(successMessage.status ?? 400).json(successMessage)
    }
    return res.status(201).json(successMessage)
  }
)

accountRouter.post(
  '/profiles/upload',
  upload_middleware.single('profile_image'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      logger.error(
        `${req.file} 파일을 읽을 수 없습니다' - ${req.originalUrl} - ${req.method}`
      )
      return res.status(400).send(fail('Cannot read the file from req.'))
    }

    const filename = `profile_${uuid()}`
    const resultOrFail = await profileController.uploadWithS3({
      Key: `profile-images/${filename}`,
      ContentType: req.file.mimetype,
      Body: req.file.buffer
    })
    if (isFail(resultOrFail)) {
      logger.error(
        `${req.file} 파일을 읽을 수 없습니다' - ${req.originalUrl} - ${req.method}`
      )
      res.status(resultOrFail.status ?? 400).json(resultOrFail)
    } else {
      const result = resultOrFail
      res.status(201).json({
        profileImageURI: result.Location
      })
    }
  }
)

accountRouter.post(
  '/profiles',
  accountJWT,
  async (req: Request, res: Response) => {
    const input = {
      ...req.body,
      accountId: req.body.executedBy.id
    }
    const profileId = await profileController.create(input)
    if (isFail(profileId)) {
      logger.error(`${profileId.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(profileId.status ?? 400).json(profileId)
    }
    return res.status(201).json(profileId)
  }
)

accountRouter.put(
  '/profiles',
  accountJWT,
  async (req: Request, res: Response) => {
    const input = {
      ...req.body,
      accountId: req.body.executedBy.id
    }
    const profileId = await profileController.update(input)
    if (isFail(profileId)) {
      logger.error(`${profileId.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(profileId.status ?? 400).json(profileId)
    }
    return res.status(201).json(profileId)
  }
)

accountRouter.get('/profiles/refresh', async (req: Request, res: Response) => {
  if (req.headers.authorization && req.headers.refresh) {
    const refreshToken = req.headers.refresh as string
    const accessToken: string = req.headers.authorization.split('Bearer ')[1]

    const tokenOrFail = await profileController.replaceToken(
      refreshToken,
      accessToken
    )
    if (isFail(tokenOrFail)) {
      logger.error(
        `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
    }
    const token = tokenOrFail
    return res.status(200).json({ token })
  } else {
    logger.error(
      `Tokens are needed for refresh! - ${req.originalUrl} - ${req.method}`
    )
    return res.status(401).json(fail('Both tokens should not be empty.'))
  }
})

accountRouter.get(
  '/profiles/auth/:profileId',
  accountJWT,
  async (req: Request, res: Response) => {
    const profileId = req.params.profileId
    const input = {
      id: profileId,
      accountId: req.body.executedBy.id
    }
    const tokenOrFail = await profileController.generateToken(input)
    if (isFail(tokenOrFail)) {
      logger.error(
        `${tokenOrFail.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(tokenOrFail.status ?? 400).json(tokenOrFail)
    }
    const token = tokenOrFail
    return res.status(201).json({
      token
    })
  }
)

// 닉네임 중복 체크
accountRouter.get(
  '/profiles/find/:nickname',
  accountJWT,
  async (req: Request, res: Response) => {
    const nickname = req.params.nickname

    const result = await profileController.hasNickname(nickname)
    if (isFail(result)) {
      logger.error(`${result.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(result.status ?? 400).json(result)
    }
    return res.status(200).json(result)
  }
)

accountRouter.get(
  '/profiles/:profileId',
  async (req: Request, res: Response) => {
    const profileId = req.params.profileId
    const profile = await profileController.findOne({ id: profileId })
    if (isFail(profile)) {
      logger.error(`${profile.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(profile.status ?? 400).json(profile)
    }
    return res.status(200).json(profile)
  }
)

accountRouter.get(
  '/profiles',
  accountJWT,
  async (req: Request, res: Response) => {
    const orderKey = req.query.orderKey
    const orderType = req.query.orderType
    const cursor = req.query.cursor
    const windowSize = req.query.windowSize
    const accountId = req.query.accountId
    const accountIdByToken = req.body.executedBy.id

    const queryOptions = {
      orderKey: orderKey,
      orderType: orderType,
      cursor: cursor,
      windowSize: windowSize,
      accountId: accountId,
      accountIdByToken: accountIdByToken
    }

    const profiles = await profileController.findAll(queryOptions)
    if (isFail(profiles)) {
      logger.error(`${profiles.message} - ${req.originalUrl} - ${req.method}`)
      return res.status(profiles.status ?? 400).json(profiles)
    }
    return res.status(200).json(profiles)
  }
)

accountRouter.delete(
  '/profiles',
  accountJWT,
  async (req: Request, res: Response) => {
    const input = {
      ...req.body,
      accountId: req.body.executedBy.id
    }
    const successMessage = await profileController.delete(input)
    if (isFail(successMessage)) {
      logger.error(
        `${successMessage.message} - ${req.originalUrl} - ${req.method}`
      )
      return res.status(successMessage.status ?? 400).json(successMessage)
    }
    return res.status(201).json(successMessage)
  }
)
