import express, { Request, Response, NextFunction, Router } from 'express'

import { BoardController } from '../controller'
import { isFail } from '../core'

import { logger } from '../external/logger'

export const boardRouter: Router = express.Router()
const boardController = new BoardController()

boardRouter.post('/boards', async (req: Request, res: Response) => {
  const input = {
    ...req.body
  }
  const boardId = await boardController.create(input)
  if (isFail(boardId)) {
    logger.error(`${boardId.message} - ${req.originalUrl} - ${req.method}`)
    return res.status(boardId.status ?? 400).json(boardId)
  }
  return res.status(200).json(boardId)
})

boardRouter.put('/boards', async (req: Request, res: Response) => {
  const input = {
    ...req.body
  }
  const boardId = await boardController.update(input)
  if (isFail(boardId)) {
    logger.error(`${boardId.message} - ${req.originalUrl} - ${req.method}`)
    return res.status(boardId.status ?? 400).json(boardId)
  }
  return res.status(200).json(boardId)
})

boardRouter.get('/boards/:boardId', async (req: Request, res: Response) => {
  const boardId = req.params.boardId
  const board = await boardController.findOne({ id: boardId })
  if (isFail(board)) {
    logger.error(`${board.message} - ${req.originalUrl} - ${req.method}`)
    return res.status(board.status ?? 400).json(board)
  }
  return res.status(200).json(board)
})

boardRouter.get('/boards', async (req: Request, res: Response) => {
  const orderKey = req.query.orderKey
  const orderType = req.query.orderType
  const cursor = req.query.cursor
  const windowSize = req.query.windowSize
  const category = req.query.category
  const createdBy = req.query?.id ?? ''

  const queryOptions = {
    orderKey: orderKey,
    orderType: orderType,
    cursor: cursor,
    windowSize: windowSize,
    category: category,
    created_by: createdBy
  }

  const boards = await boardController.findAll(queryOptions)
  if (isFail(boards)) {
    logger.error(`${boards.message} - ${req.originalUrl} - ${req.method}`)
    return res.status(boards.status ?? 400).json(boards)
  }
  return res.status(200).json(boards)
})

boardRouter.delete('/boards', async (req: Request, res: Response) => {
  const input = {
    ...req.body,
    created_by: req.query.id
  }
  const successMessage = await boardController.delete(input)
  if (isFail(successMessage)) {
    logger.error(
      `${successMessage.message} - ${req.originalUrl} - ${req.method}`
    )
    return res.status(successMessage.status ?? 400).json(successMessage)
  }
  return res.status(200).json(successMessage)
})
