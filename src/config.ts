import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env')
})

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
