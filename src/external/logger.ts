import winston from 'winston'

const ENV = process.env.NODE_ENV || 'dev'

export const logger = winston.loggers.get('access-log')
