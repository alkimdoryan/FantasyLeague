import { Router } from 'express'
import { LeagueController } from '../controllers/leagueController'

const router = Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'League routes working', timestamp: new Date().toISOString() })
})

// 1. LİG GENEL GÖRÜNÜM (League Overview)
router.get('/', LeagueController.getAllLeagues)
router.get('/:id/seasons', LeagueController.getSeasonsByLeague)
router.get('/seasons/:seasonId/standings', LeagueController.getLeagueStandings)
router.get('/seasons/:seasonId/stats', LeagueController.getSeasonStats)
router.get('/seasons/:seasonId/points-progress', LeagueController.getTeamPointsProgress)

// 2. OYUNCU ENDPOİNTLERI (Player Endpoints)
router.get('/seasons/:seasonId/players', LeagueController.getPlayerStats)
router.get('/seasons/:seasonId/players/all', LeagueController.getAllPlayers)
router.get('/seasons/:seasonId/players/position/:position', LeagueController.getPlayersByPosition)
router.get('/seasons/:seasonId/players/team/:teamName', LeagueController.getPlayersByTeam)
router.get('/seasons/:seasonId/player/:playerName', LeagueController.getPlayerDetails)

// Yeni oyuncu maçları endpoint'i
router.get('/seasons/:seasonId/player/:playerName/matches', LeagueController.getPlayerMatches)

// 3. RÜYA TAKIMI (Dream Team)
router.get('/seasons/:seasonId/dream-team', LeagueController.getDreamTeam)

// 4. MAÇ DETAYLARI (Match Details)
router.get('/seasons/:seasonId/match-details', LeagueController.getMatchDetails)
router.get('/match/:matchId/teams', LeagueController.getMatchTeams)

// Yeni takım detayları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/details', LeagueController.getTeamDetails)

// Yeni takım maçları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/matches', LeagueController.getTeamMatches)

export default router 
router.get('/seasons/:seasonId/players/position/:position', LeagueController.getPlayersByPosition)
router.get('/seasons/:seasonId/players/team/:teamName', LeagueController.getPlayersByTeam)
router.get('/seasons/:seasonId/player/:playerName', LeagueController.getPlayerDetails)

// Yeni oyuncu maçları endpoint'i
router.get('/seasons/:seasonId/player/:playerName/matches', LeagueController.getPlayerMatches)

// 3. RÜYA TAKIMI (Dream Team)
router.get('/seasons/:seasonId/dream-team', LeagueController.getDreamTeam)

// 4. MAÇ DETAYLARI (Match Details)
router.get('/seasons/:seasonId/match-details', LeagueController.getMatchDetails)
router.get('/match/:matchId/teams', LeagueController.getMatchTeams)

// Yeni takım detayları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/details', LeagueController.getTeamDetails)

// Yeni takım maçları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/matches', LeagueController.getTeamMatches)

export default router 
router.get('/seasons/:seasonId/players/position/:position', LeagueController.getPlayersByPosition)
router.get('/seasons/:seasonId/players/team/:teamName', LeagueController.getPlayersByTeam)
router.get('/seasons/:seasonId/player/:playerName', LeagueController.getPlayerDetails)

// Yeni oyuncu maçları endpoint'i
router.get('/seasons/:seasonId/player/:playerName/matches', LeagueController.getPlayerMatches)

// 3. RÜYA TAKIMI (Dream Team)
router.get('/seasons/:seasonId/dream-team', LeagueController.getDreamTeam)

// 4. MAÇ DETAYLARI (Match Details)
router.get('/seasons/:seasonId/match-details', LeagueController.getMatchDetails)
router.get('/match/:matchId/teams', LeagueController.getMatchTeams)

// Yeni takım detayları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/details', LeagueController.getTeamDetails)

// Yeni takım maçları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/matches', LeagueController.getTeamMatches)

export default router 
router.get('/seasons/:seasonId/players/position/:position', LeagueController.getPlayersByPosition)
router.get('/seasons/:seasonId/players/team/:teamName', LeagueController.getPlayersByTeam)
router.get('/seasons/:seasonId/player/:playerName', LeagueController.getPlayerDetails)

// Yeni oyuncu maçları endpoint'i
router.get('/seasons/:seasonId/player/:playerName/matches', LeagueController.getPlayerMatches)

// 3. RÜYA TAKIMI (Dream Team)
router.get('/seasons/:seasonId/dream-team', LeagueController.getDreamTeam)

// 4. MAÇ DETAYLARI (Match Details)
router.get('/seasons/:seasonId/match-details', LeagueController.getMatchDetails)
router.get('/match/:matchId/teams', LeagueController.getMatchTeams)

// Yeni takım detayları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/details', LeagueController.getTeamDetails)

// Yeni takım maçları endpoint'i
router.get('/seasons/:seasonId/team/:teamName/matches', LeagueController.getTeamMatches)

export default router 