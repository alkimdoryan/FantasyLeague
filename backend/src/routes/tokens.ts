import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// GET /api/tokens/balances
router.get('/balances', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Get token balances' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/tokens/prices
router.get('/prices', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Get token prices' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 