import { Request, Response } from 'express'
import { LeagueService } from '../services/leagueService'
import ResponseHelper from '../utils/responseHelper'
import { logger } from '../utils/logger'

export class LeagueController {
  // GET /api/leagues
  static async getAllLeagues(req: Request, res: Response) {
    try {
      const leagues = await LeagueService.getAllLeagues()
      return ResponseHelper.success(res, 'Leagues retrieved successfully', leagues)
    } catch (error) {
      logger.error('Error fetching leagues:', error)
      return ResponseHelper.error(res, 'Failed to fetch leagues')
    }
  }

  // GET /api/leagues/:id/seasons
  static async getSeasonsByLeague(req: Request, res: Response) {
    try {
      const leagueId = parseInt(req.params.id)
      if (isNaN(leagueId)) {
        return ResponseHelper.badRequest(res, 'Invalid league ID')
      }

      const seasons = await LeagueService.getSeasonsByLeague(leagueId)
      return ResponseHelper.success(res, 'Seasons retrieved successfully', seasons)
    } catch (error) {
      logger.error('Error fetching seasons:', error)
      return ResponseHelper.error(res, 'Failed to fetch seasons')
    }
  }

  // GET /api/leagues/seasons/:seasonId/standings
  static async getLeagueStandings(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      if (isNaN(seasonId)) {
        return ResponseHelper.badRequest(res, 'Invalid season ID')
      }

      const standings = await LeagueService.getLeagueStandings(seasonId)
      return ResponseHelper.success(res, 'League standings retrieved successfully', standings)
    } catch (error) {
      logger.error('Error fetching league standings:', error)
      return ResponseHelper.error(res, 'Failed to fetch league standings')
    }
  }

  // GET /api/leagues/seasons/:seasonId/stats
  static async getSeasonStats(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      if (isNaN(seasonId)) {
        return ResponseHelper.badRequest(res, 'Invalid season ID')
      }

      const stats = await LeagueService.getSeasonStats(seasonId)
      return ResponseHelper.success(res, 'Season stats retrieved successfully', stats)
    } catch (error) {
      logger.error('Error fetching season stats:', error)
      return ResponseHelper.error(res, 'Failed to fetch season stats')
    }
  }

  // GET /api/leagues/seasons/:seasonId/players
  static async getPlayerStats(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      if (isNaN(seasonId)) {
        return ResponseHelper.badRequest(res, 'Invalid season ID')
      }

      const { position, limit } = req.query
      const players = await LeagueService.getPlayerStats(
        seasonId, 
        position as string, 
        limit ? parseInt(limit as string) : 50
      )
      
      return ResponseHelper.success(res, 'Player stats retrieved successfully', players)
    } catch (error) {
      logger.error('Error fetching player stats:', error)
      return ResponseHelper.error(res, 'Failed to fetch player stats')
    }
  }

  // GET /api/leagues/seasons/:seasonId/dream-team
  static async getDreamTeam(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      if (isNaN(seasonId)) {
        return ResponseHelper.badRequest(res, 'Invalid season ID')
      }

      const dreamTeam = await LeagueService.getDreamTeam(seasonId)
      return ResponseHelper.success(res, 'Dream team retrieved successfully', dreamTeam)
    } catch (error) {
      logger.error('Error fetching dream team:', error)
      return ResponseHelper.error(res, 'Failed to fetch dream team')
    }
  }
}

export default LeagueController 