import { TypeORMError } from 'typeorm'
import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Board } from '../entity'

type Input = {
  id: string
  created_by: string
}

type Output = {
  message: string
}

export class DeleteBoard extends Usecase<Input, Output> {
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

    // created_by
    if (!hasOwnProperty(input, 'created_by')) {
      err.msg = '`created_by` is required.'
      return false
    }

    if (typeof input.created_by !== 'string') {
      err.msg = '`created_by` should be string type.'
      return false
    }

    return true
  }

  async authorize(conn: TypeOrmConnection, input: Input): Promise<null | Fail> {
    // 권한있는가?

    // Action
    const repo = conn.getRepository(Board)
    const maybeEntity = await repo.findOne({ id: input.id }, { cache: true })
    if (!maybeEntity) {
      return fail(`'${input.id}' is not found in Boards.`, 404)
    }

    const action = 'Delete'

    // By Who?
    const executor = input.created_by

    // target
    const target = input.id
    const owner = maybeEntity ? maybeEntity.created_by : undefined

    if (action === 'Delete' && executor === owner) {
      return null
    }

    return fail(
      `Not Authorized, [${executor} execute ${action} on ${target}.`,
      403
    )
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const boardRepo = conn.getRepository(Board)

    try {
      await boardRepo.delete(input.id)
      return {
        message: `Deleted Raw On ${input.id}`
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
  const usecase = new DeleteBoard({
    id: '2j0ts7BS1TCCfDPUrAovu',
    created_by: 'B6Y_L9-2bMUFijLnpfsOU'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
