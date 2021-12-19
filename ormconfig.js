// typeorm
// `js` or `ts`

const projectConfig = require('./proj.config')
const dev = projectConfig.__ENV__ === 'dev'

function entityGlob(targetLang) {
  if (targetLang === 'js') {
    return `${__dirname}/build/domain/**/entity/index.js`
  }

  if (targetLang === 'ts') {
    return `${__dirname}/src/domain/**/entity/index.ts`
  }

  throw new Error('proj.config.TARGET_LANG is not set property.')
}

module.exports = {
  type: 'postgres',
  host: projectConfig.__DB_HOST__,
  port: projectConfig.__DB_PORT__,
  database: projectConfig.__DB_NAME__,
  username: projectConfig.__DB_USER__,
  password: projectConfig.__DB_PW__,
  synchronize: dev, // 자동으로 테이블 생성 여부. production에서는 true 금지.
  logging: ['warn', 'error'],
  cache: true,
  entities: [entityGlob(projectConfig.__TARGET_LANG__)],
  cli: {
    migrationsDir: 'src/migration'
  }
}
