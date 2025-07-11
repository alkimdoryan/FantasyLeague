import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import { initializeDatabase } from './utils/database'

// Import routes
import authRoutes from './routes/auth'
import leaguesRoutes from './routes/leagues'
import playersRoutes from './routes/players'
import tokensRoutes from './routes/tokens'
import adminRoutes from './routes/admin'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/leagues', leaguesRoutes)
app.use('/api/players', playersRoutes)
app.use('/api/tokens', tokensRoutes)
app.use('/api/admin', adminRoutes)

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Initialize database
    const dbConnected = await initializeDatabase()
    if (!dbConnected) {
      logger.error('❌ Failed to connect to database. Exiting...')
      process.exit(1)
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`)
      logger.info(`📊 Database: SQLite connected`)
    })
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app 