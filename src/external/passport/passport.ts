import passport from 'passport'

const LocalStrategy = require('passport-local').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const NaverStrategy = require('passport-naver').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

import { oauth_config } from '../../config'

enum AUTH_KIND {
  EMAIL = 'EMAIL',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE'
}

// TODO: 프로덕션 환경변수 보안 문제
export const localLogin = () => {
  passport.use(
    'localLogin',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async function (req: any, email: any, password: any, done: any) {
        const input = {
          email: email,
          password: password,
          auth_kind: AUTH_KIND.EMAIL
        }
        done(null, input)
      }
    )
  )
}

export const kakao = () => {
  passport.use(
    'kakao',
    new KakaoStrategy(
      {
        clientID: oauth_config.KAKAO_CLIENT_ID,
        callbackURL: oauth_config.KAKAO_CALLBACK_URL
      },
      async function (
        kakakoAccessToken: any,
        kakaoRefreshToken: any,
        profile: any,
        done: any
      ) {
        const userId = profile._json.id.toString()
        const email = profile._json.kakao_account?.email || ''
        // TODO: sns 마케팅 조사 및 추가 구현 필요
        const input = {
          user_id: userId,
          auth_kind: AUTH_KIND.KAKAO,
          marketing: {}
        }
        if (email !== '') {
          Object.assign(input.marketing, { email: email })
        }
        done(null, input)
      }
    )
  )
}

export const naver = () => {
  passport.use(
    'naver',
    new NaverStrategy(
      {
        clientID: oauth_config.NAVER_CLIENT_ID,
        clientSecret: oauth_config.NAVER_CLIENT_SECRET,
        callbackURL: oauth_config.NAVER_CALLBACK_URL
      },
      async function (
        naverAccessToken: any,
        naverRefreshToken: any,
        profile: any,
        done: any
      ) {
        const userId = profile.id.toString()
        const email = profile._json.email || ''
        const input = {
          user_id: userId,
          auth_kind: AUTH_KIND.NAVER,
          marketing: {}
        }
        if (email !== '') {
          Object.assign(input.marketing, { email: email })
        }
        done(null, input)
      }
    )
  )
}

export const facebook = () => {
  passport.use(
    'facebook',
    new FacebookStrategy(
      {
        clientID: oauth_config.FACEBOOK_CLIENT_ID,
        clientSecret: oauth_config.FACEBOOK_CLIENT_SECRET,
        callbackURL: oauth_config.FACEBOOK_CALLBACK_URL,
        profileFields: ['email']
      },
      async function (
        facebookAccessToken: any,
        facebookRefreshToken: any,
        profile: any,
        done: any
      ) {
        const userId = profile._json.id.toString()
        const email = profile._json.email || ''
        const input = {
          user_id: userId,
          auth_kind: AUTH_KIND.FACEBOOK,
          marketing: {}
        }
        if (email !== '') {
          Object.assign(input.marketing, { email: email })
        }
        done(null, input)
      }
    )
  )
}

export const google = () => {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: oauth_config.GOOGLE_CLIENT_ID,
        clientSecret: oauth_config.GOOGLE_CLIENT_SECRET,
        callbackURL: oauth_config.GOOGLE_CALLBACK_URL
      },
      async function (
        googleAccessToken: any,
        googleRefreshToken: any,
        profile: any,
        done: any
      ) {
        const userId: string = profile.id.toString()
        const email: string = profile._json.email || ''
        const input = {
          user_id: userId,
          auth_kind: AUTH_KIND.GOOGLE,
          marketing: {}
        }
        if (email !== '') {
          Object.assign(input.marketing, { email: email })
        }
        done(null, input)
      }
    )
  )
}
