import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// GET /api/admin/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Admin dashboard' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 