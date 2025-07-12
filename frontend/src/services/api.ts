import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Lig listesi
  getLeagues: () => api.get('/api/leagues'),
  
  // Sezonlar listesi
  getSeasonsByLeague: (leagueId: number) => 
    api.get(`/api/leagues/${leagueId}/seasons`),
  
  // Takım puan durumu
  getLeagueStandings: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/standings`),
  
  // Sezon istatistikleri
  getSeasonStats: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/stats`),
  
  // Takım puan gelişimi
  getTeamPointsProgress: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/points-progress`),
  
  // Oyuncu istatistikleri
  getPlayerStats: (seasonId: number, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players`, { params: { limit } }),
  
  // Tüm oyuncular
  getAllPlayers: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/all`),
  
  // Pozisyon bazlı oyuncular
  getPlayersByPosition: (seasonId: number, position: string, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/position/${position}`, { params: { limit } }),
  
  // Takım bazlı oyuncular
  getPlayersByTeam: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/team/${encodeURIComponent(teamName)}`),
  
  // Oyuncu detayları
  getPlayerDetails: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}`),
  
  // Rüya takımı
  getDreamTeam: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/dream-team`),
  
  // Maç detayları
  getMatchDetails: (seasonId: number, homeTeam: string, awayTeam: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/match-details`, { 
      params: { homeTeam, awayTeam } 
    }),
  
  // Maç takımları
  getMatchTeams: (matchId: string) => 
    api.get(`/api/leagues/match/${matchId}/teams`),
  
  // Player matches
  getPlayerMatches: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}/matches`),
  
  // Team details
  getTeamDetails: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/details`),
  
  // Team matches
  getTeamMatches: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/matches`),
  
  // Admin endpoints
  adminTest: () => api.get('/api/admin/test'),
  seedData: () => api.post('/api/admin/seed'),
}

export { api }
export default apiService 
  getLeagues: () => api.get('/api/leagues'),
  
  // Sezonlar listesi
  getSeasonsByLeague: (leagueId: number) => 
    api.get(`/api/leagues/${leagueId}/seasons`),
  
  // Takım puan durumu
  getLeagueStandings: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/standings`),
  
  // Sezon istatistikleri
  getSeasonStats: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/stats`),
  
  // Takım puan gelişimi
  getTeamPointsProgress: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/points-progress`),
  
  // Oyuncu istatistikleri
  getPlayerStats: (seasonId: number, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players`, { params: { limit } }),
  
  // Tüm oyuncular
  getAllPlayers: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/all`),
  
  // Pozisyon bazlı oyuncular
  getPlayersByPosition: (seasonId: number, position: string, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/position/${position}`, { params: { limit } }),
  
  // Takım bazlı oyuncular
  getPlayersByTeam: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/team/${encodeURIComponent(teamName)}`),
  
  // Oyuncu detayları
  getPlayerDetails: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}`),
  
  // Rüya takımı
  getDreamTeam: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/dream-team`),
  
  // Maç detayları
  getMatchDetails: (seasonId: number, homeTeam: string, awayTeam: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/match-details`, { 
      params: { homeTeam, awayTeam } 
    }),
  
  // Maç takımları
  getMatchTeams: (matchId: string) => 
    api.get(`/api/leagues/match/${matchId}/teams`),
  
  // Player matches
  getPlayerMatches: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}/matches`),
  
  // Team details
  getTeamDetails: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/details`),
  
  // Team matches
  getTeamMatches: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/matches`),
  
  // Admin endpoints
  adminTest: () => api.get('/api/admin/test'),
  seedData: () => api.post('/api/admin/seed'),
}

export { api }
export default apiService 
  getLeagues: () => api.get('/api/leagues'),
  
  // Sezonlar listesi
  getSeasonsByLeague: (leagueId: number) => 
    api.get(`/api/leagues/${leagueId}/seasons`),
  
  // Takım puan durumu
  getLeagueStandings: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/standings`),
  
  // Sezon istatistikleri
  getSeasonStats: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/stats`),
  
  // Takım puan gelişimi
  getTeamPointsProgress: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/points-progress`),
  
  // Oyuncu istatistikleri
  getPlayerStats: (seasonId: number, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players`, { params: { limit } }),
  
  // Tüm oyuncular
  getAllPlayers: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/all`),
  
  // Pozisyon bazlı oyuncular
  getPlayersByPosition: (seasonId: number, position: string, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/position/${position}`, { params: { limit } }),
  
  // Takım bazlı oyuncular
  getPlayersByTeam: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/team/${encodeURIComponent(teamName)}`),
  
  // Oyuncu detayları
  getPlayerDetails: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}`),
  
  // Rüya takımı
  getDreamTeam: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/dream-team`),
  
  // Maç detayları
  getMatchDetails: (seasonId: number, homeTeam: string, awayTeam: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/match-details`, { 
      params: { homeTeam, awayTeam } 
    }),
  
  // Maç takımları
  getMatchTeams: (matchId: string) => 
    api.get(`/api/leagues/match/${matchId}/teams`),
  
  // Player matches
  getPlayerMatches: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}/matches`),
  
  // Team details
  getTeamDetails: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/details`),
  
  // Team matches
  getTeamMatches: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/matches`),
  
  // Admin endpoints
  adminTest: () => api.get('/api/admin/test'),
  seedData: () => api.post('/api/admin/seed'),
}

export { api }
export default apiService 
  getLeagues: () => api.get('/api/leagues'),
  
  // Sezonlar listesi
  getSeasonsByLeague: (leagueId: number) => 
    api.get(`/api/leagues/${leagueId}/seasons`),
  
  // Takım puan durumu
  getLeagueStandings: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/standings`),
  
  // Sezon istatistikleri
  getSeasonStats: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/stats`),
  
  // Takım puan gelişimi
  getTeamPointsProgress: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/points-progress`),
  
  // Oyuncu istatistikleri
  getPlayerStats: (seasonId: number, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players`, { params: { limit } }),
  
  // Tüm oyuncular
  getAllPlayers: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/all`),
  
  // Pozisyon bazlı oyuncular
  getPlayersByPosition: (seasonId: number, position: string, limit?: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/position/${position}`, { params: { limit } }),
  
  // Takım bazlı oyuncular
  getPlayersByTeam: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/players/team/${encodeURIComponent(teamName)}`),
  
  // Oyuncu detayları
  getPlayerDetails: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}`),
  
  // Rüya takımı
  getDreamTeam: (seasonId: number) => 
    api.get(`/api/leagues/seasons/${seasonId}/dream-team`),
  
  // Maç detayları
  getMatchDetails: (seasonId: number, homeTeam: string, awayTeam: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/match-details`, { 
      params: { homeTeam, awayTeam } 
    }),
  
  // Maç takımları
  getMatchTeams: (matchId: string) => 
    api.get(`/api/leagues/match/${matchId}/teams`),
  
  // Player matches
  getPlayerMatches: (seasonId: number, playerName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/player/${encodeURIComponent(playerName)}/matches`),
  
  // Team details
  getTeamDetails: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/details`),
  
  // Team matches
  getTeamMatches: (seasonId: number, teamName: string) => 
    api.get(`/api/leagues/seasons/${seasonId}/team/${encodeURIComponent(teamName)}/matches`),
  
  // Admin endpoints
  adminTest: () => api.get('/api/admin/test'),
  seedData: () => api.post('/api/admin/seed'),
}

export { api }
export default apiService 