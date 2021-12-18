import { Connection, TypeORMError } from 'typeorm'
import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'

import { Usecase, ValidationError } from '../../common'
import { Board } from '../entity'

type Input = {
  id: string
}
type Output = {
  board: Board
}

export class GetBoard extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // id
    if (!hasOwnProperty(input, 'id')) {
      err.msg = '`id` is required.'
      return false
    }

    if (typeof input.id !== 'string') {
      err.msg = '`id` should be string type.'
      return false
    }

    return true
  }

  async authorize(conn: Connection, input: Input): Promise<Fail | null> {
    return null
  }

  async execute(conn: Connection, input: Input): Promise<Output | Fail> {
    const boardRepo = conn.getRepository(Board)
    try {
      const boardOrEmpty = await boardRepo.findOne(input.id)
      if (!boardOrEmpty) {
        return fail(`'${input.id}' is not found in Boards.`, 404)
      }
      return {
        board: boardOrEmpty
      }
    } catch (e) {
      let err = e
      if (err instanceof TypeORMError) {
        err = `${err.name}: ${err.message}`
      }
      return fail(err as string, 503)
    }
  }
}

/**
 * Executable main
 */

async function main() {
  const usecase = new GetBoard({
    id: 'kjekjfijljkelijie'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
