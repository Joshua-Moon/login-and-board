import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env')
})

const aws_config = {
  REGION: process.env.REGION,
  ACCESS_ID: process.env.AWS_ACCESS_KEY_ID,
  ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
}

export const s3_config = {
  ...aws_config,
  BUCKET: process.env.BUCKET || '',
  CONTENTS_BUCKET: process.env.CONTENTS_BUCKET || ''
}

export const redis_config = {
  REDIS_HOST: process.env.REDIS_HOST || 'redis',
  REDIS_PORT: process.env.REDIS_PORT || 6379
}

export const db_coinfg = {
  DB_HOST: process.env.DB_HOST || 'postgres',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'login-and-board',
  DB_USER: process.env.DB_USER || 'login-and-board-dev',
  DB_PWD: process.env.DB_PWD || 'login-and-board-dev'
}

export const jwt_config = {
  JWT_SECRET: process.env.JWT_SECRET ?? 'secret_dev'
}

export const oauth_config = {
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  KAKAO_CALLBACK_URL: process.env.KAKAO_CALLBACK_URL,
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
  NAVER_CALLBACK_URL: process.env.NAVER_CALLBACK_URL,
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  OAUTH_REDIRECT_URL: process.env.OAUTH_REDIRECT_URL
}

export const mailing_config = {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_HOST_USER: process.env.EMAIL_HOST_USER,
  EMAIL_HOST_PASSWORD: process.env.EMAIL_HOST_PASSWORD,
  CONTACT_EMAIL_HOST: process.env.CONTACT_EMAIL_HOST
}
