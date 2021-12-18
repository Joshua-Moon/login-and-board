import { Fail } from '../core'
import { Output, OutputId, OutputMessage, Outputs } from '../domain/common'
import { Board } from '../domain/board'
import {
  CreateOrUpdateBoard,
  DeleteBoard,
  GetBoard,
  QueryBoard
} from '../domain/board'

export class BoardController {
  async create(input: unknown): Promise<OutputId | Fail> {
    const outcomeOrFail = await new CreateOrUpdateBoard(input).exe()
    return outcomeOrFail
  }
  async update(input: unknown): Promise<OutputId | Fail> {
    const outcomeOrFail = await new CreateOrUpdateBoard(input).exe()
    return outcomeOrFail
  }
  async findOne(input: unknown): Promise<Output<Board> | Fail> {
    const boardOrFail = await new GetBoard(input).exe()
    return boardOrFail
  }

  async findAll(input: unknown): Promise<Outputs<Board> | Fail> {
    const boardsOrFail = await new QueryBoard(input).exe()
    return boardsOrFail
  }

  async delete(input: unknown): Promise<OutputMessage | Fail> {
    const outcomeOrFail = await new DeleteBoard(input).exe()
    return outcomeOrFail
  }
}
