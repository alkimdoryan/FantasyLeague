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

export interface SeasonStats {
  total_matches: number
  total_goals: number
  avg_goals_per_match: number
  home_wins: number
  away_wins: number
  draws: number
}

export interface DreamTeamPlayer {
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

  static async getSeasonStats(seasonId: number): Promise<SeasonStats> {
    const response = await api.get(`/leagues/seasons/${seasonId}/stats`)
    return response.data
  }

  static async getPlayerStats(seasonId: number, position?: string, limit?: number): Promise<PlayerStats[]> {
    const params = new URLSearchParams()
    if (position) params.append('position', position)
    if (limit) params.append('limit', limit.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get(`/leagues/seasons/${seasonId}/players${queryString}`)
    return response.data
  }

  static async getDreamTeam(seasonId: number): Promise<DreamTeamPlayer[]> {
    const response = await api.get(`/leagues/seasons/${seasonId}/dream-team`)
    return response.data
  }
}

export default LeagueService 
    const response = await api.get(`/leagues/seasons/${seasonId}/standings`)
    return response.data
  }

  static async getSeasonStats(seasonId: number): Promise<SeasonStats> {
    const response = await api.get(`/leagues/seasons/${seasonId}/stats`)
    return response.data
  }

  static async getPlayerStats(seasonId: number, position?: string, limit?: number): Promise<PlayerStats[]> {
    const params = new URLSearchParams()
    if (position) params.append('position', position)
    if (limit) params.append('limit', limit.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get(`/leagues/seasons/${seasonId}/players${queryString}`)
    return response.data
  }

  static async getDreamTeam(seasonId: number): Promise<DreamTeamPlayer[]> {
    const response = await api.get(`/leagues/seasons/${seasonId}/dream-team`)
    return response.data
  }
}

export default LeagueService 
    const response = await api.get(`/leagues/seasons/${seasonId}/standings`)
    return response.data
  }

  static async getSeasonStats(seasonId: number): Promise<SeasonStats> {
    const response = await api.get(`/leagues/seasons/${seasonId}/stats`)
    return response.data
  }

  static async getPlayerStats(seasonId: number, position?: string, limit?: number): Promise<PlayerStats[]> {
    const params = new URLSearchParams()
    if (position) params.append('position', position)
    if (limit) params.append('limit', limit.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get(`/leagues/seasons/${seasonId}/players${queryString}`)
    return response.data
  }

  static async getDreamTeam(seasonId: number): Promise<DreamTeamPlayer[]> {
    const response = await api.get(`/leagues/seasons/${seasonId}/dream-team`)
    return response.data
  }
}

export default LeagueService 
    const response = await api.get(`/leagues/seasons/${seasonId}/standings`)
    return response.data
  }

  static async getSeasonStats(seasonId: number): Promise<SeasonStats> {
    const response = await api.get(`/leagues/seasons/${seasonId}/stats`)
    return response.data
  }

  static async getPlayerStats(seasonId: number, position?: string, limit?: number): Promise<PlayerStats[]> {
    const params = new URLSearchParams()
    if (position) params.append('position', position)
    if (limit) params.append('limit', limit.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get(`/leagues/seasons/${seasonId}/players${queryString}`)
    return response.data
  }

  static async getDreamTeam(seasonId: number): Promise<DreamTeamPlayer[]> {
    const response = await api.get(`/leagues/seasons/${seasonId}/dream-team`)
    return response.data
  }
}

export default LeagueService 