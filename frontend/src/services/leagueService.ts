import api from './api'

export interface League {
  id: number
  name: string
  country?: string
  logo_url?: string
}

export interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

export interface TeamStanding {
  team: string
  played: number
  win: number
  draw: number
  loss: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: string
}

export interface PlayerStats {
  player: string
  team: string
  position: string
  avg_rating: number
  goals: number
  assists: number
}

export class LeagueService {
  static async getAllLeagues(): Promise<League[]> {
    const response = await api.get('/leagues')
    return response.data
  }

  static async getSeasonsByLeague(leagueId: number): Promise<Season[]> {
    const response = await api.get(`/leagues/${leagueId}/seasons`)
    return response.data
  }

  static async getLeagueStandings(seasonId: number): Promise<TeamStanding[]> {
    const response = await api.get(`/leagues/seasons/${seasonId}/standings`)
    return response.data
  }

  static async getPlayerStats(seasonId: number, position?: string): Promise<PlayerStats[]> {
    const params = position ? `?position=${position}` : ''
    const response = await api.get(`/leagues/seasons/${seasonId}/players${params}`)
    return response.data
  }
}

export default LeagueService 