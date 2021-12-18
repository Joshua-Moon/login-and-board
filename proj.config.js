/**
 * Runtime 언어 선택
 * typeorm 설정에 영향을 줌
 *
 * 참조: <root>/ormconfig.js
 */
const __TARGET_LANG__ = process.env.TARGET_LANG
const __ENV__ = process.env.NODE_ENV

/**
 * Database
 * typeorm 설정에 영향을 줌
 *
 * 참조: <root>/ormconfig.js
 */
const __DB_HOST__ = process.env.DB_HOST || 'postgres'
const __DB_PORT__ = process.env.DB_PORT || 5432
const __DB_NAME__ = process.env.DB_NAME || 'login-and-board'
const __DB_USER__ = process.env.DB_USER || 'login-and-board-dev'
const __DB_PW__ = process.env.DB_PWD || 'login-and-board-dev'

module.exports = {
  __TARGET_LANG__,
  __ENV__,
  __DB_HOST__,
  __DB_PORT__,
  __DB_NAME__,
  __DB_USER__,
  __DB_PW__
}
