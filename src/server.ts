import express, { Request, Response } from 'express'
import bodyparser from 'body-parser'
import cors from 'cors'

import routes from './routes'

const PORT = 3000
const HOST = '0.0.0.0'

export const app: express.Application = express()
const router = routes()

app.use(
  cors(),
  express.json({
    limit: '50mb'
  }),
  bodyparser.json()
)

app.get('/health', (req: Request, res: Response) => {
  res.json('health checked...')
})

app.use('/api', router.boardRouter)

app.listen(PORT, HOST, () => console.log(`PORT:${PORT} 서버 구동중...`))
