import { Fail, fail, isFail } from '../../core'
import { establishConnection, TypeOrmConnection } from './orm-helper'

export type ValidationError = {
  msg?: string
}

export abstract class Usecase<T, U> {
  input: unknown
  err: ValidationError = {}
  logger: (msg: any) => void

  constructor(input: unknown) {
    this.input = input
    this.logger = console.log
  }

  async exe() {
    if (!this.validate(this.input, this.err)) {
      return fail(`Invalid Usecase Input, ${this.err.msg}`, 400)
    }

    const connOrFail = await this.connect()
    if (isFail(connOrFail)) {
      this.logger(connOrFail)
      return fail('Failed to connect to database.', 503)
    }

    const conn = connOrFail

    const authOrFail = await this.authorize(conn, this.input)
    if (authOrFail !== null) {
      this.logger(authOrFail)
      return fail(
        `Failed to Authorize, ${authOrFail.message}`,
        authOrFail.status ?? 403
      )
    }

    const outcome = await this.execute(conn, this.input)

    this.logger(`outcome', ${outcome}`)
    return outcome
  }

  async connect(): Promise<TypeOrmConnection | Fail> {
    const connectionOrFail = await establishConnection()
    return connectionOrFail
  }

  abstract authorize(conn: TypeOrmConnection, input: T): Promise<null | Fail>
  abstract execute(conn: TypeOrmConnection, input: T): Promise<U | Fail>
  abstract validate(input: unknown, err: ValidationError): input is T
}
