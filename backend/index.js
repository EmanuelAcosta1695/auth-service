import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db/connectDB.js' // .js because we are usin "type": "module"
import authRoutes from './routes/auth.route.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// allows us to parse incoming requests with JSON payloads
app.use(express.json()) // e utiliza para que la aplicación pueda entender y procesar datos en formato JSON que se envían en el cuerpo de las solicitudes HTTP (request body)

app.use('/api/auth', authRoutes)

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`)
  next()
})

app.listen(PORT, () => {
  connectDB()
  console.log('Server is running on port: ', PORT)
})
