import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// GET /api/admin/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    res.json({ 
      message: 'Admin dashboard active',
      status: 'success',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/admin/seed
router.post('/seed', async (req: Request, res: Response) => {
  try {
    res.json({ 
      status: 'success', 
      message: 'Using existing all_league2.db database - no seed needed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/admin/test
router.get('/test', async (req: Request, res: Response) => {
  try {
    res.json({ 
      message: 'Admin test endpoint working',
      status: 'success',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router 
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/admin/seed
router.post('/seed', async (req: Request, res: Response) => {
  try {
    res.json({ 
      status: 'success', 
      message: 'Using existing all_league2.db database - no seed needed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/admin/test
router.get('/test', async (req: Request, res: Response) => {
  try {
    res.json({ 
      message: 'Admin test endpoint working',
      status: 'success',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router 
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/admin/seed
router.post('/seed', async (req: Request, res: Response) => {
  try {
    res.json({ 
      status: 'success', 
      message: 'Using existing all_league2.db database - no seed needed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/admin/test
router.get('/test', async (req: Request, res: Response) => {
  try {
    res.json({ 
      message: 'Admin test endpoint working',
      status: 'success',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router 
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/admin/seed
router.post('/seed', async (req: Request, res: Response) => {
  try {
    res.json({ 
      status: 'success', 
      message: 'Using existing all_league2.db database - no seed needed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/admin/test
router.get('/test', async (req: Request, res: Response) => {
  try {
    res.json({ 
      message: 'Admin test endpoint working',
      status: 'success',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router 