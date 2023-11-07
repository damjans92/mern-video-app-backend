import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import userRoutes from './routes/users.js'
import videoRoutes from './routes/videos.js'
import commentRoutes from './routes/comments.js'
import authRoutes from './routes/auth.js'

const app = express()
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type',
  })
)

app.use(express.json())

dotenv.config()

const connectDB = () => {
  const dbName =
    process.env.NODE_ENV === 'production' ? 'videoapp_production' : 'test'
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName,
    })
    .then(() => {
      console.log('Connected to DB')
    })
    .catch((err) => {
      throw err
    })
}

// routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/comments', commentRoutes)

app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Something went wrong'
  return res.status(status).json({
    success: false,
    status,
    message,
  })
})

app.listen(8800, () => {
  connectDB()
  console.log('Connected to server')
})
