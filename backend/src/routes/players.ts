import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// GET /api/players
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Get all players' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/players/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Get player details' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 