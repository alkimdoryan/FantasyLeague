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
      const standings = await LeagueService.getLeagueStandings(seasonId)
      return ResponseHelper.success(res, 'Standings retrieved successfully', standings)
    } catch (error) {
      logger.error('Error fetching standings:', error)
      return ResponseHelper.error(res, 'Failed to fetch standings')
    }
  }

  // GET /api/leagues/seasons/:seasonId/stats
  static async getSeasonStats(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
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
      const limit = parseInt(req.query.limit as string) || 50
      const players = await LeagueService.getPlayerStats(seasonId, limit)
      return ResponseHelper.success(res, 'Player stats retrieved successfully', players)
    } catch (error) {
      logger.error('Error fetching player stats:', error)
      return ResponseHelper.error(res, 'Failed to fetch player stats')
    }
  }

  // GET /api/leagues/seasons/:seasonId/players/all
  static async getAllPlayers(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const players = await LeagueService.getAllPlayers(seasonId)
      return ResponseHelper.success(res, 'All players retrieved successfully', players)
    } catch (error) {
      logger.error('Error fetching all players:', error)
      return ResponseHelper.error(res, 'Failed to fetch all players')
    }
  }

  // GET /api/leagues/seasons/:seasonId/players/position/:position
  static async getPlayersByPosition(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const position = req.params.position.toUpperCase()
      const limit = parseInt(req.query.limit as string) || 20
      const players = await LeagueService.getPlayersByPosition(seasonId, position, limit)
      return ResponseHelper.success(res, 'Players by position retrieved successfully', players)
    } catch (error) {
      logger.error('Error fetching players by position:', error)
      return ResponseHelper.error(res, 'Failed to fetch players by position')
    }
  }

  // GET /api/leagues/seasons/:seasonId/players/team/:teamName
  static async getPlayersByTeam(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const players = await LeagueService.getPlayersByTeam(seasonId, teamName)
      return ResponseHelper.success(res, 'Players by team retrieved successfully', players)
    } catch (error) {
      logger.error('Error fetching players by team:', error)
      return ResponseHelper.error(res, 'Failed to fetch players by team')
    }
  }

  // GET /api/leagues/seasons/:seasonId/player/:playerName
  static async getPlayerDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const playerName = decodeURIComponent(req.params.playerName)
      const playerDetails = await LeagueService.getPlayerDetails(seasonId, playerName)
      return ResponseHelper.success(res, 'Player details retrieved successfully', playerDetails)
    } catch (error) {
      logger.error('Error fetching player details:', error)
      return ResponseHelper.error(res, 'Failed to fetch player details')
    }
  }

  // GET /api/leagues/seasons/:seasonId/player/:playerName/matches
  static async getPlayerMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const playerName = decodeURIComponent(req.params.playerName)
      const matches = await LeagueService.getPlayerMatches(seasonId, playerName)
      return ResponseHelper.success(res, 'Player matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching player matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch player matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/details
  static async getTeamDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const teamDetails = await LeagueService.getTeamDetails(seasonId, teamName)
      return ResponseHelper.success(res, 'Team details retrieved successfully', teamDetails)
    } catch (error) {
      logger.error('Error fetching team details:', error)
      return ResponseHelper.error(res, 'Failed to fetch team details')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/matches
  static async getTeamMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const matches = await LeagueService.getTeamMatches(seasonId, teamName)
      return ResponseHelper.success(res, 'Team matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching team matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch team matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/points-progress
  static async getTeamPointsProgress(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const progress = await LeagueService.getTeamPointsProgress(seasonId)
      return ResponseHelper.success(res, 'Team points progress retrieved successfully', progress)
    } catch (error) {
      logger.error('Error fetching team points progress:', error)
      return ResponseHelper.error(res, 'Failed to fetch team points progress')
    }
  }

  // GET /api/leagues/seasons/:seasonId/dream-team
  static async getDreamTeam(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const dreamTeam = await LeagueService.getDreamTeam(seasonId)
      return ResponseHelper.success(res, 'Dream team retrieved successfully', dreamTeam)
    } catch (error) {
      logger.error('Error fetching dream team:', error)
      return ResponseHelper.error(res, 'Failed to fetch dream team')
    }
  }

  // GET /api/leagues/seasons/:seasonId/match-details
  static async getMatchDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const homeTeam = req.query.homeTeam as string
      const awayTeam = req.query.awayTeam as string
      
      if (!homeTeam || !awayTeam) {
        return ResponseHelper.error(res, 'Home team and away team are required', undefined, 400)
      }
      
      const matchDetails = await LeagueService.getMatchDetails(seasonId, homeTeam, awayTeam)
      return ResponseHelper.success(res, 'Match details retrieved successfully', matchDetails)
    } catch (error) {
      logger.error('Error fetching match details:', error)
      return ResponseHelper.error(res, 'Failed to fetch match details')
    }
  }

  // GET /api/leagues/match/:matchId/teams
  static async getMatchTeams(req: Request, res: Response) {
    try {
      const matchId = req.params.matchId
      const teams = await LeagueService.getMatchTeams(matchId)
      return ResponseHelper.success(res, 'Match teams retrieved successfully', teams)
    } catch (error) {
      logger.error('Error fetching match teams:', error)
      return ResponseHelper.error(res, 'Failed to fetch match teams')
    }
  }
}

export default LeagueController 

  // GET /api/leagues/seasons/:seasonId/player/:playerName/matches
  static async getPlayerMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const playerName = decodeURIComponent(req.params.playerName)
      const matches = await LeagueService.getPlayerMatches(seasonId, playerName)
      return ResponseHelper.success(res, 'Player matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching player matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch player matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/details
  static async getTeamDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const teamDetails = await LeagueService.getTeamDetails(seasonId, teamName)
      return ResponseHelper.success(res, 'Team details retrieved successfully', teamDetails)
    } catch (error) {
      logger.error('Error fetching team details:', error)
      return ResponseHelper.error(res, 'Failed to fetch team details')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/matches
  static async getTeamMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const matches = await LeagueService.getTeamMatches(seasonId, teamName)
      return ResponseHelper.success(res, 'Team matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching team matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch team matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/points-progress
  static async getTeamPointsProgress(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const progress = await LeagueService.getTeamPointsProgress(seasonId)
      return ResponseHelper.success(res, 'Team points progress retrieved successfully', progress)
    } catch (error) {
      logger.error('Error fetching team points progress:', error)
      return ResponseHelper.error(res, 'Failed to fetch team points progress')
    }
  }

  // GET /api/leagues/seasons/:seasonId/dream-team
  static async getDreamTeam(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const dreamTeam = await LeagueService.getDreamTeam(seasonId)
      return ResponseHelper.success(res, 'Dream team retrieved successfully', dreamTeam)
    } catch (error) {
      logger.error('Error fetching dream team:', error)
      return ResponseHelper.error(res, 'Failed to fetch dream team')
    }
  }

  // GET /api/leagues/seasons/:seasonId/match-details
  static async getMatchDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const homeTeam = req.query.homeTeam as string
      const awayTeam = req.query.awayTeam as string
      
      if (!homeTeam || !awayTeam) {
        return ResponseHelper.error(res, 'Home team and away team are required', undefined, 400)
      }
      
      const matchDetails = await LeagueService.getMatchDetails(seasonId, homeTeam, awayTeam)
      return ResponseHelper.success(res, 'Match details retrieved successfully', matchDetails)
    } catch (error) {
      logger.error('Error fetching match details:', error)
      return ResponseHelper.error(res, 'Failed to fetch match details')
    }
  }

  // GET /api/leagues/match/:matchId/teams
  static async getMatchTeams(req: Request, res: Response) {
    try {
      const matchId = req.params.matchId
      const teams = await LeagueService.getMatchTeams(matchId)
      return ResponseHelper.success(res, 'Match teams retrieved successfully', teams)
    } catch (error) {
      logger.error('Error fetching match teams:', error)
      return ResponseHelper.error(res, 'Failed to fetch match teams')
    }
  }
}

export default LeagueController 

  // GET /api/leagues/seasons/:seasonId/player/:playerName/matches
  static async getPlayerMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const playerName = decodeURIComponent(req.params.playerName)
      const matches = await LeagueService.getPlayerMatches(seasonId, playerName)
      return ResponseHelper.success(res, 'Player matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching player matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch player matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/details
  static async getTeamDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const teamDetails = await LeagueService.getTeamDetails(seasonId, teamName)
      return ResponseHelper.success(res, 'Team details retrieved successfully', teamDetails)
    } catch (error) {
      logger.error('Error fetching team details:', error)
      return ResponseHelper.error(res, 'Failed to fetch team details')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/matches
  static async getTeamMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const matches = await LeagueService.getTeamMatches(seasonId, teamName)
      return ResponseHelper.success(res, 'Team matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching team matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch team matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/points-progress
  static async getTeamPointsProgress(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const progress = await LeagueService.getTeamPointsProgress(seasonId)
      return ResponseHelper.success(res, 'Team points progress retrieved successfully', progress)
    } catch (error) {
      logger.error('Error fetching team points progress:', error)
      return ResponseHelper.error(res, 'Failed to fetch team points progress')
    }
  }

  // GET /api/leagues/seasons/:seasonId/dream-team
  static async getDreamTeam(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const dreamTeam = await LeagueService.getDreamTeam(seasonId)
      return ResponseHelper.success(res, 'Dream team retrieved successfully', dreamTeam)
    } catch (error) {
      logger.error('Error fetching dream team:', error)
      return ResponseHelper.error(res, 'Failed to fetch dream team')
    }
  }

  // GET /api/leagues/seasons/:seasonId/match-details
  static async getMatchDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const homeTeam = req.query.homeTeam as string
      const awayTeam = req.query.awayTeam as string
      
      if (!homeTeam || !awayTeam) {
        return ResponseHelper.error(res, 'Home team and away team are required', undefined, 400)
      }
      
      const matchDetails = await LeagueService.getMatchDetails(seasonId, homeTeam, awayTeam)
      return ResponseHelper.success(res, 'Match details retrieved successfully', matchDetails)
    } catch (error) {
      logger.error('Error fetching match details:', error)
      return ResponseHelper.error(res, 'Failed to fetch match details')
    }
  }

  // GET /api/leagues/match/:matchId/teams
  static async getMatchTeams(req: Request, res: Response) {
    try {
      const matchId = req.params.matchId
      const teams = await LeagueService.getMatchTeams(matchId)
      return ResponseHelper.success(res, 'Match teams retrieved successfully', teams)
    } catch (error) {
      logger.error('Error fetching match teams:', error)
      return ResponseHelper.error(res, 'Failed to fetch match teams')
    }
  }
}

export default LeagueController 

  // GET /api/leagues/seasons/:seasonId/player/:playerName/matches
  static async getPlayerMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const playerName = decodeURIComponent(req.params.playerName)
      const matches = await LeagueService.getPlayerMatches(seasonId, playerName)
      return ResponseHelper.success(res, 'Player matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching player matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch player matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/details
  static async getTeamDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const teamDetails = await LeagueService.getTeamDetails(seasonId, teamName)
      return ResponseHelper.success(res, 'Team details retrieved successfully', teamDetails)
    } catch (error) {
      logger.error('Error fetching team details:', error)
      return ResponseHelper.error(res, 'Failed to fetch team details')
    }
  }

  // GET /api/leagues/seasons/:seasonId/team/:teamName/matches
  static async getTeamMatches(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const teamName = decodeURIComponent(req.params.teamName)
      const matches = await LeagueService.getTeamMatches(seasonId, teamName)
      return ResponseHelper.success(res, 'Team matches retrieved successfully', matches)
    } catch (error) {
      logger.error('Error fetching team matches:', error)
      return ResponseHelper.error(res, 'Failed to fetch team matches')
    }
  }

  // GET /api/leagues/seasons/:seasonId/points-progress
  static async getTeamPointsProgress(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const progress = await LeagueService.getTeamPointsProgress(seasonId)
      return ResponseHelper.success(res, 'Team points progress retrieved successfully', progress)
    } catch (error) {
      logger.error('Error fetching team points progress:', error)
      return ResponseHelper.error(res, 'Failed to fetch team points progress')
    }
  }

  // GET /api/leagues/seasons/:seasonId/dream-team
  static async getDreamTeam(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const dreamTeam = await LeagueService.getDreamTeam(seasonId)
      return ResponseHelper.success(res, 'Dream team retrieved successfully', dreamTeam)
    } catch (error) {
      logger.error('Error fetching dream team:', error)
      return ResponseHelper.error(res, 'Failed to fetch dream team')
    }
  }

  // GET /api/leagues/seasons/:seasonId/match-details
  static async getMatchDetails(req: Request, res: Response) {
    try {
      const seasonId = parseInt(req.params.seasonId)
      const homeTeam = req.query.homeTeam as string
      const awayTeam = req.query.awayTeam as string
      
      if (!homeTeam || !awayTeam) {
        return ResponseHelper.error(res, 'Home team and away team are required', undefined, 400)
      }
      
      const matchDetails = await LeagueService.getMatchDetails(seasonId, homeTeam, awayTeam)
      return ResponseHelper.success(res, 'Match details retrieved successfully', matchDetails)
    } catch (error) {
      logger.error('Error fetching match details:', error)
      return ResponseHelper.error(res, 'Failed to fetch match details')
    }
  }

  // GET /api/leagues/match/:matchId/teams
  static async getMatchTeams(req: Request, res: Response) {
    try {
      const matchId = req.params.matchId
      const teams = await LeagueService.getMatchTeams(matchId)
      return ResponseHelper.success(res, 'Match teams retrieved successfully', teams)
    } catch (error) {
      logger.error('Error fetching match teams:', error)
      return ResponseHelper.error(res, 'Failed to fetch match teams')
    }
  }
}

export default LeagueController 