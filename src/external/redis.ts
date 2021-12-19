import redis from 'redis'

import { redis_config } from '../config'

interface Repository {
  set(key: string, value: string): void
  get(key: string): Promise<string | null>
  delete(key: string): void
}

export default class RedisRepo implements Repository {
  client: redis.RedisClient
  constructor() {
    this.client = redis.createClient({
      port: redis_config.REDIS_PORT as number,
      host: redis_config.REDIS_HOST
    })
  }
  set(key: string, value: string): boolean {
    try {
      this.client.set(key, value)
      return true
    } catch (e) {
      return false
    }
  }
  setExpire(key: string, value: string, second: number): boolean {
    try {
      this.client.set(key, value, 'EX', second)
      return true
    } catch (e) {
      return false
    }
  }
  setObject(key: string, value: object): void {
    const valueToJson = JSON.stringify(value)
    this.client.set(key, valueToJson, 'EX', 60)
  }

  async get(key: string): Promise<string | null> {
    try {
      return new Promise((resolve, reject) => {
        this.client.get(key, (err: any, data: any) => {
          if (err) {
            reject(err)
          }
          resolve(data)
        })
      })
    } catch (e) {
      return null
    }
  }
  delete(key: string): void {
    this.client.del(key)
  }
}
