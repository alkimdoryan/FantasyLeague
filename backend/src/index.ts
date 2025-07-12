import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import path from 'path'
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
const PORT = process.env.PORT || 8000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8000'],
  credentials: true,
}))

// Rate limiting - more relaxed for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV === 'development'
  }
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static file serving for images
app.use('/api/data', express.static(path.join(__dirname, '../../data')))

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
      logger.info(`🖼️  Static files served from: ${path.join(__dirname, '../../data')}`)
    })
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app 
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app 
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app 
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app 