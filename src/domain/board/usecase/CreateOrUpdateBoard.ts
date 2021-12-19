import { TypeORMError } from 'typeorm'

import {
  Fail,
  fail,
  guardSomeObject,
  hasOwnProperty,
  uuid
} from '../../../core'
import { Usecase, ValidationError, TypeOrmConnection } from '../../common'
import { Board } from '../entity'
import { BoardCategory, isValidBoardCategory } from '../../catalog'

type Input = {
  id?: string
  is_active?: boolean
  is_published?: boolean
  category: typeof BoardCategory[number]
  target_id: string
  title: string
  desc?: string
  created_by: string
}

type Output = {
  id: string
}

export class CreateOrUpdateBoard extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // is_active?
    if (hasOwnProperty(input, 'is_active') && input.is_active !== undefined) {
      if (typeof input.is_active !== 'boolean') {
        err.msg = '`is_active` should be boolean type.'
        return false
      }
    }

    // is_published?
    if (
      hasOwnProperty(input, 'is_published') &&
      input.is_published !== undefined
    ) {
      if (typeof input.is_published !== 'boolean') {
        err.msg = '`is_published` should be boolean type.'
        return false
      }
    }

    // category
    if (!hasOwnProperty(input, 'category')) {
      err.msg = '`category` is required.'
      return false
    }

    if (typeof input.category !== 'string') {
      err.msg = '`category` should be string type.'
      return false
    }

    if (!isValidBoardCategory(input.category)) {
      err.msg = '`category` is invalid.'
      return false
    }

    // title
    if (!hasOwnProperty(input, 'title')) {
      err.msg = '`title` is required.'
      return false
    }
    if (typeof input.title !== 'string') {
      err.msg = '`title` should be string type.'
      return false
    }

    // desc?
    if (hasOwnProperty(input, 'desc')) {
      if (typeof input.desc !== 'string') {
        err.msg = '`desc` should be string type.'
        return false
      }

      if (input.desc.length > 500) {
        err.msg = '`desc` should be in 500 character limit.'
        return false
      }
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
    const boardRepo = conn.getRepository(Board)
    const maybeBoard = await boardRepo.findOne(
      { id: input.id, is_active: true },
      { cache: true }
    )
    // input.id가 있지만 board에 없으면 고정id로 생성되므로 fail처리
    if (input.id && !maybeBoard) {
      return fail(`'${input.id}' dose not exist for update.`, 403)
    }

    const action = maybeBoard ? 'Update' : 'Create'

    // By Who?
    const executor = input.created_by

    // target
    const target = input.id
    const owner = maybeBoard ? maybeBoard.created_by : undefined

    if (action === 'Create') {
      return null
    }

    if (action === 'Update' && executor === owner) {
      return null
    }

    return fail(
      `Not Authorized, [${executor}, execute ${action} on ${target}.`,
      403
    )
  }

  async execute(conn: TypeOrmConnection, input: Input): Promise<Output | Fail> {
    const boardRepo = conn.getRepository(Board)

    const board = boardRepo.create({
      id: input.id ?? uuid(),
      is_active: input.is_active ?? true,
      is_published: input.is_published ?? false,
      category: input.category,
      title: input.title,
      desc: input.desc,
      created_by: input.created_by
    })

    try {
      const savedBoard = await boardRepo.save(board)
      return {
        id: savedBoard.id
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
  const usecase = new CreateOrUpdateBoard({
    category: 'SELL',
    title: '맥북 팝니다',
    desc: '새로운 맥북을 선물 받아서 내놓습니다.',
    created_by: 'twyxCMbRIhRjLjxNeu22x'
  })
  const outcome = await usecase.exe()
  console.log(outcome)
}

if (require.main === module) {
  main()
}
