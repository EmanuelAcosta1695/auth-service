import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db/connectDB.js' // .js because we are usin "type": "module"
import authRoutes from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173', credentials: true })) // true so that we can send the cookies and the request

// allows us to parse incoming requests with JSON payloads
app.use(express.json()) // It is used so that the application can understand and process data in JSON format that is sent in the body of HTTP requests (request body)

app.use(cookieParser()) // allows us to parse incoming cookies

app.use('/api/auth', authRoutes)

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`)
  next()
})

app.listen(PORT, () => {
  connectDB()
  console.log('Server is running on port: ', PORT)
})
