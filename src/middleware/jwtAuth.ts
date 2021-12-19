import { Request, Response, NextFunction } from 'express'
import { fail } from '../core'

import jwtUtil from '../external/jwtUtil'

export const accountJWT = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('Bearer ')[1]
    const isVerified = jwtUtil.verify(token)
    if (isVerified) {
      const decode = jwtUtil.decode(token)
      req.body.executedBy = decode
      next()
    } else {
      res.status(401).json(fail('The access token is invalid.'))
    }
  } else {
    res.status(401).json(fail('The access token should not be empty.'))
  }
}
export const profileJWT = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('Bearer ')[1]
    const isVerified = jwtUtil.verify(token, true)
    if (isVerified) {
      const decode = jwtUtil.decode(token)
      req.body.executedBy = decode
      next()
    } else {
      res.status(401).json(fail('The access token is invalid.'))
    }
  } else {
    res.status(401).json(fail('The access token should not be empty.'))
  }
}
export const profileAndVisitJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('Bearer ')[1]
    const isVerified = jwtUtil.verify(token, true)
    if (isVerified) {
      const decode = jwtUtil.decode(token)
      req.body.executedBy = decode
      next()
    } else {
      res.status(401).json(fail('The access token is invalid.'))
    }
  } else {
    next()
  }
}
