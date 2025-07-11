import { Router } from 'express'
import { LeagueController } from '../controllers/leagueController'

const router = Router()

// League routes
router.get('/', LeagueController.getAllLeagues)
router.get('/:id/seasons', LeagueController.getSeasonsByLeague)

// Season-based routes
router.get('/seasons/:seasonId/standings', LeagueController.getLeagueStandings)
router.get('/seasons/:seasonId/stats', LeagueController.getSeasonStats)
router.get('/seasons/:seasonId/players', LeagueController.getPlayerStats)
router.get('/seasons/:seasonId/dream-team', LeagueController.getDreamTeam)

export default router 