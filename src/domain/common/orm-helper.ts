import {
  Connection,
  createConnection,
  getConnection,
  getConnectionManager,
  getConnectionOptions,
  TypeORMError
} from 'typeorm'

import { Fail, fail } from '../../core/fail'

export type TypeOrmConnection = Connection

/**
 * <project root>/ormconfig.js 설정에 따라
 * 데이터 베이스 connection 객체 반환
 */
export async function establishConnection(): Promise<Connection | Fail> {
  try {
    if (getConnectionManager().has('default')) {
      return getConnection()
    }
    const connectionOptions = await getConnectionOptions()
    const connection = await createConnection(connectionOptions)
    if (!connection.isConnected) {
      return fail('Failed to connect to database.', 503)
    }

    return connection
  } catch (e) {
    let err = e
    if (err instanceof TypeORMError) {
      err = `${err.name}: ${err.message}`
    }
    return fail(err as string, 503)
  }
}
