import sequelize from '../config/database'
import { logger } from './logger'
import '../models' // Model'ları import et
import { seedDemoData } from '../seeders/demo-data'

export const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate()
    logger.info('📊 Database connection established successfully')
    
    // Sync models (development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false, alter: true })
      logger.info('📊 Database models synchronized')
      
      // Seed demo data
      await seedDemoData()
      logger.info('📊 Demo data seeded')
    }
    
    return true
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error)
    return false
  }
}

export const closeDatabase = async () => {
  try {
    await sequelize.close()
    logger.info('📊 Database connection closed')
  } catch (error) {
    logger.error('❌ Error closing database:', error)
  }
}

export default sequelize 