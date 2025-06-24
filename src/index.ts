import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { CONFIG } from './config/env.config'
import route from './routes/index'
import { logUrl } from '../src/middlewares/url-logger.middleware'
import { connectDB } from './config/db.config'
import { globalErrorHandler } from './middlewares/global-error-handler.middleware'

const app: Application = express()
app.disable('x-powered-by')
     

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  })
)

app.use(bodyParser.urlencoded({ limit: '500mb', extended: false }))


// parse application/json
app.use(bodyParser.json({ limit: '500mb' }))
app.use(express.json({ limit: '500mb' }))

app.use(logUrl)

app.use('/api', route)

app.get('/status', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is working properly!' })

  return
})

app.use(globalErrorHandler)

connectDB().then(() => {
  bootstrap()
})


const bootstrap = async () => {

  // Process handlers for uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)

  })

  try {
    app.listen(CONFIG.PORT, () => {
      console.log(`Server is running on port ${CONFIG.PORT}`)
    })
  } catch (error) {
    console.error('app bootstrap error: ', error)
    process.exit(1)
  }
}