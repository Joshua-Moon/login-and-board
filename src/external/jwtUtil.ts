import jwt, { JwtPayload } from 'jsonwebtoken'
import { jwt_config } from '../config'

const secret = jwt_config.JWT_SECRET

export interface Payload {
  id: string
  role?: string
  name?: string
}

export default {
  sign: (payload: Payload): string => {
    return jwt.sign(payload, secret, {
      algorithm: 'HS256',
      expiresIn: '30m'
    })
  },
  verify: (token: string, profile?: boolean): boolean | null => {
    let decoded = null
    try {
      decoded = jwt.verify(token, secret) as JwtPayload
      if (profile) {
        const verifyProfile =
          decoded.id !== undefined &&
          decoded.role !== undefined &&
          decoded.name !== undefined
        return verifyProfile
      } else {
        const verifyAccount = decoded.id !== undefined
        return verifyAccount
      }
    } catch (e) {
      return null
    }
  },
  decode: (accountToken: string): null | JwtPayload | string => {
    return jwt.decode(accountToken)
  },
  refresh: (payload: Payload): string => {
    return jwt.sign(payload, secret, {
      algorithm: 'HS256',
      expiresIn: '14d'
    })
  },
  refreshVerify: (token: string): boolean => {
    let decoded = null
    try {
      decoded = jwt.verify(token, secret) as JwtPayload
      if (decoded.id !== undefined) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
