import { createDatabase } from 'typeorm-extension'

/**
 * <project root>/ormconfig.js 설정에 따라
 * 데이터 베이스 생성
 */
async function main() {
  await createDatabase({ ifNotExist: true, characterSet: 'UTF8' })
}

if (require.main === module) {
  main()
}
