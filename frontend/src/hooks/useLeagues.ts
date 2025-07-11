import { useQuery } from 'react-query'
import { LeagueService } from '../services/leagueService'

// Get all leagues
export const useLeagues = () => {
  return useQuery('leagues', LeagueService.getAllLeagues, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get seasons by league
export const useSeasons = (leagueId: number) => {
  return useQuery(
    ['seasons', leagueId],
    () => LeagueService.getSeasonsByLeague(leagueId),
    {
      enabled: !!leagueId,
      staleTime: 5 * 60 * 1000,
    }
  )
}

// Get league standings
export const useLeagueStandings = (seasonId: number) => {
  return useQuery(
    ['standings', seasonId],
    () => LeagueService.getLeagueStandings(seasonId),
    {
      enabled: !!seasonId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}

// Get season stats
export const useSeasonStats = (seasonId: number) => {
  return useQuery(
    ['seasonStats', seasonId],
    () => LeagueService.getSeasonStats(seasonId),
    {
      enabled: !!seasonId,
      staleTime: 5 * 60 * 1000,
    }
  )
}

// Get player stats
export const usePlayerStats = (seasonId: number, position?: string, limit?: number) => {
  return useQuery(
    ['playerStats', seasonId, position, limit],
    () => LeagueService.getPlayerStats(seasonId, position, limit),
    {
      enabled: !!seasonId,
      staleTime: 2 * 60 * 1000,
    }
  )
}

// Get dream team
export const useDreamTeam = (seasonId: number) => {
  return useQuery(
    ['dreamTeam', seasonId],
    () => LeagueService.getDreamTeam(seasonId),
    {
      enabled: !!seasonId,
      staleTime: 5 * 60 * 1000,
    }
  )
} 