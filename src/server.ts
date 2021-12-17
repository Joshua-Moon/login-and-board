import express, { Request, Response } from 'express'
import cors from 'cors'

const PORT = 3000
const HOST = '0.0.0.0'

export const app: express.Application = express()

app.use(
  cors(),
  express.json({
    limit: '50mb'
  }),
  express.urlencoded({ limit: '50mb', extended: false })
)

app.get('/health', (req: Request, res: Response) => {
  res.json('health checked...')
})

app.listen(PORT, HOST, () => console.log(`PORT:${PORT} 서버 구동중...`))
