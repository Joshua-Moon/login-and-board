import { Connection, TypeORMError } from 'typeorm'
import { buildPaginator } from 'typeorm-cursor-pagination'
import { BoardCategory, isValidBoardCategory } from '../../../catalog'

import { Fail, fail, guardSomeObject, hasOwnProperty } from '../../../core'
import { Usecase, ValidationError } from '../../common'
import { Board } from '../entity'

type Input = {
  orderKey?: 'created_at'
  orderType?: 'ASC' | 'DESC'
  cursor?: string
  windowSize?: string
  created_by?: string
  category?: typeof BoardCategory[number]
}
type Output = {
  boards: Board[]
  count: number
  cursor: string | null
}

export class QueryBoard extends Usecase<Input, Output> {
  validate(input: unknown, err: ValidationError): input is Input {
    if (!guardSomeObject(input)) {
      err.msg = '`input` is not object type.'
      return false
    }

    // orderKey?
    if (hasOwnProperty(input, 'orderKey') && input.orderKey !== undefined) {
      if (input.orderKey !== 'created_at') {
        err.msg = '`orderKey` should be `created_at`.'
        return false
      }
    }

    // orderType?
    if (hasOwnProperty(input, 'orderType') && input.orderType !== undefined) {
      if (input.orderType !== 'ASC' && input.orderType !== 'DESC') {
        err.msg = '`orderType` should be `ASC` or `DESC`.'
        return false
      }
    }

    // windowSize?
    if (hasOwnProperty(input, 'windowSize') && input.windowSize !== undefined) {
      if (typeof input.windowSize !== 'string') {
        err.msg = '`windowSize` should be string type.'
        return false
      }

      if (input.windowSize === '') {
        err.msg = '`windowSize` should not be empty.'
        return false
      }

      if (isNaN(Number(input.windowSize))) {
        err.msg = '`windowSize` should be number in string.'
        return false
      }
    }

    // cursor?
    if (hasOwnProperty(input, 'cursor') && input.cursor !== undefined) {
      if (typeof input.cursor !== 'string') {
        err.msg = '`cursor` should be string type.'
        return false
      }
    }

    // created_by?
    if (hasOwnProperty(input, 'created_by') && input.created_by !== undefined) {
      if (typeof input.created_by !== 'string') {
        err.msg = '`created_by` should be string type.'
        return false
      }
    }

    // category?
    if (hasOwnProperty(input, 'category') && input.category !== undefined) {
      if (typeof input.category !== 'string') {
        err.msg = '`category` should be string type.'
        return false
      }

      if (!isValidBoardCategory(input.category)) {
        err.msg = '`category` is invalid.'
        return false
      }
    }

    return true
  }

  async authorize(conn: Connection, input: Input): Promise<Fail | null> {
    return null
  }

  async execute(conn: Connection, input: Input): Promise<Output | Fail> {
    const boardRepo = conn.getRepository(Board)

    const orderKey = input.orderKey ?? 'created_at'
    const orderType = input.orderType ?? 'DESC'
    const cursor = input.cursor
    const windowSize = input.windowSize ?? 10

    const paginator = buildPaginator({
      entity: Board,
      paginationKeys: [orderKey, 'seq'],
      query: {
        limit: Number(windowSize),
        order: orderType,
        afterCursor: cursor
      }
    })

    const boardQuery = boardRepo.createQueryBuilder('board')

    if (input.created_by) {
      boardQuery.andWhere('board.created_by = :created_by', {
        created_by: input.created_by
      })
    }

    if (input.category) {
      boardQuery.andWhere('board.category = :category', {
        category: input.category
      })
    }

    try {
      const totalCount = await boardQuery.getCount()
      const { data, cursor } = await paginator.paginate(boardQuery)

      // valid 쿼리문 but invalid pagination
      if (totalCount > 0 && data.length === 0) {
        return fail('Invalid pagination(cursor)', 400)
      }

      return {
        boards: data,
        count: totalCount,
        cursor: cursor.afterCursor
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
