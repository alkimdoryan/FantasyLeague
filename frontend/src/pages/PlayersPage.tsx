import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface Player {
  name: string
  team_name: string
  position: string
  country: string
  jerseyNumber: number
  avg_rating: number
  matches_played: number
  total_minutes: number
  total_goals: number
  total_assists: number
  total_saves: number
  total_passes: number
  accurate_passes: number
  pass_accuracy: number
  key_passes: number
  shots_on_target: number
  shots_off_target: number
  tackles: number
  interceptions: number
  duels_won: number
  duels_lost: number
  fouls_committed: number
  fouls_won: number
  performance_score: number
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

const PlayersPage: React.FC = () => {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const playersPerPage = 25

  useEffect(() => {
    loadLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      loadSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      loadPlayers(selectedSeason)
    }
  }, [selectedSeason, selectedPosition])

  const loadLeagues = async () => {
    try {
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
    }
  }

  const loadSeasons = async (leagueId: number) => {
    try {
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
      setPlayers([])
    } catch (err) {
      setError('Sezonlar yüklenemedi')
    }
  }

  const loadPlayers = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (selectedPosition === 'all') {
        response = await apiService.getAllPlayers(seasonId)
      } else {
        response = await apiService.getPlayersByPosition(seasonId, selectedPosition, 100)
      }
      
      setPlayers(response.data.data)
    } catch (err) {
      setError('Oyuncular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (player: Player) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(player.name)}`)
    }
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + playersPerPage)

  const getPositionName = (position: string) => {
    const positions = {
      'G': 'Kaleci',
      'D': 'Defans',
      'M': 'Orta Saha',
      'F': 'Forvet'
    }
    return positions[position as keyof typeof positions] || position
  }

  const getPositionColor = (position: string) => {
    const colors = {
      'G': 'bg-green-100 text-green-800',
      'D': 'bg-blue-100 text-blue-800',
      'M': 'bg-yellow-100 text-yellow-800',
      'F': 'bg-red-100 text-red-800'
    }
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const positions = [
    { value: 'all', label: 'Tüm Pozisyonlar', icon: '⚽' },
    { value: 'G', label: 'Kaleci', icon: '🧤' },
    { value: 'D', label: 'Defans', icon: '🛡️' },
    { value: 'M', label: 'Orta Saha', icon: '⚙️' },
    { value: 'F', label: 'Forvet', icon: '⚡' }
  ]

  if (loading && leagues.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚽ Oyuncular</h1>
          <p className="text-gray-600">Detaylı oyuncu istatistikleri ve performans verileri</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Sezon Seçimi
              </label>
              <select
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Pozisyon
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedSeason}
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.icon} {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Arama
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyuncu veya takım ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner />
          </div>
        )}

        {/* Players List */}
        {!loading && selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                👥 Oyuncular ({filteredPlayers.length})
              </h2>
            </div>
            
            {paginatedPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">😔</div>
                <p className="text-gray-500">Oyuncu bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedPlayers.map((player, index) => (
                  <div 
                    key={`${player.name}-${index}`} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getPlayerImagePath(player.name)}
                            alt={player.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getTeamLogoPath(player.team_name)}
                            alt={player.team_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                              {getPositionIcon(player.position)} {getPositionName(player.position)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="font-medium text-gray-700">{player.team_name}</span>
                            <span>#{player.jerseyNumber}</span>
                            <span>{player.country}</span>
                            <span>{player.matches_played} maç</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {player.performance_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Performans</div>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <span>⚽ {player.total_goals}</span>
                          <span>🎯 {player.total_assists}</span>
                          <span>⭐ {player.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} - {Math.min(startIndex + playersPerPage, filteredPlayers.length)} / {filteredPlayers.length} oyuncu
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ← Önceki
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayersPage 
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface Player {
  name: string
  team_name: string
  position: string
  country: string
  jerseyNumber: number
  avg_rating: number
  matches_played: number
  total_minutes: number
  total_goals: number
  total_assists: number
  total_saves: number
  total_passes: number
  accurate_passes: number
  pass_accuracy: number
  key_passes: number
  shots_on_target: number
  shots_off_target: number
  tackles: number
  interceptions: number
  duels_won: number
  duels_lost: number
  fouls_committed: number
  fouls_won: number
  performance_score: number
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

const PlayersPage: React.FC = () => {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const playersPerPage = 25

  useEffect(() => {
    loadLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      loadSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      loadPlayers(selectedSeason)
    }
  }, [selectedSeason, selectedPosition])

  const loadLeagues = async () => {
    try {
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
    }
  }

  const loadSeasons = async (leagueId: number) => {
    try {
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
      setPlayers([])
    } catch (err) {
      setError('Sezonlar yüklenemedi')
    }
  }

  const loadPlayers = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (selectedPosition === 'all') {
        response = await apiService.getAllPlayers(seasonId)
      } else {
        response = await apiService.getPlayersByPosition(seasonId, selectedPosition, 100)
      }
      
      setPlayers(response.data.data)
    } catch (err) {
      setError('Oyuncular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (player: Player) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(player.name)}`)
    }
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + playersPerPage)

  const getPositionName = (position: string) => {
    const positions = {
      'G': 'Kaleci',
      'D': 'Defans',
      'M': 'Orta Saha',
      'F': 'Forvet'
    }
    return positions[position as keyof typeof positions] || position
  }

  const getPositionColor = (position: string) => {
    const colors = {
      'G': 'bg-green-100 text-green-800',
      'D': 'bg-blue-100 text-blue-800',
      'M': 'bg-yellow-100 text-yellow-800',
      'F': 'bg-red-100 text-red-800'
    }
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const positions = [
    { value: 'all', label: 'Tüm Pozisyonlar', icon: '⚽' },
    { value: 'G', label: 'Kaleci', icon: '🧤' },
    { value: 'D', label: 'Defans', icon: '🛡️' },
    { value: 'M', label: 'Orta Saha', icon: '⚙️' },
    { value: 'F', label: 'Forvet', icon: '⚡' }
  ]

  if (loading && leagues.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚽ Oyuncular</h1>
          <p className="text-gray-600">Detaylı oyuncu istatistikleri ve performans verileri</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Sezon Seçimi
              </label>
              <select
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Pozisyon
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedSeason}
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.icon} {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Arama
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyuncu veya takım ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner />
          </div>
        )}

        {/* Players List */}
        {!loading && selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                👥 Oyuncular ({filteredPlayers.length})
              </h2>
            </div>
            
            {paginatedPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">😔</div>
                <p className="text-gray-500">Oyuncu bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedPlayers.map((player, index) => (
                  <div 
                    key={`${player.name}-${index}`} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getPlayerImagePath(player.name)}
                            alt={player.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getTeamLogoPath(player.team_name)}
                            alt={player.team_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                              {getPositionIcon(player.position)} {getPositionName(player.position)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="font-medium text-gray-700">{player.team_name}</span>
                            <span>#{player.jerseyNumber}</span>
                            <span>{player.country}</span>
                            <span>{player.matches_played} maç</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {player.performance_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Performans</div>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <span>⚽ {player.total_goals}</span>
                          <span>🎯 {player.total_assists}</span>
                          <span>⭐ {player.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} - {Math.min(startIndex + playersPerPage, filteredPlayers.length)} / {filteredPlayers.length} oyuncu
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ← Önceki
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayersPage 
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface Player {
  name: string
  team_name: string
  position: string
  country: string
  jerseyNumber: number
  avg_rating: number
  matches_played: number
  total_minutes: number
  total_goals: number
  total_assists: number
  total_saves: number
  total_passes: number
  accurate_passes: number
  pass_accuracy: number
  key_passes: number
  shots_on_target: number
  shots_off_target: number
  tackles: number
  interceptions: number
  duels_won: number
  duels_lost: number
  fouls_committed: number
  fouls_won: number
  performance_score: number
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

const PlayersPage: React.FC = () => {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const playersPerPage = 25

  useEffect(() => {
    loadLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      loadSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      loadPlayers(selectedSeason)
    }
  }, [selectedSeason, selectedPosition])

  const loadLeagues = async () => {
    try {
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
    }
  }

  const loadSeasons = async (leagueId: number) => {
    try {
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
      setPlayers([])
    } catch (err) {
      setError('Sezonlar yüklenemedi')
    }
  }

  const loadPlayers = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (selectedPosition === 'all') {
        response = await apiService.getAllPlayers(seasonId)
      } else {
        response = await apiService.getPlayersByPosition(seasonId, selectedPosition, 100)
      }
      
      setPlayers(response.data.data)
    } catch (err) {
      setError('Oyuncular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (player: Player) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(player.name)}`)
    }
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + playersPerPage)

  const getPositionName = (position: string) => {
    const positions = {
      'G': 'Kaleci',
      'D': 'Defans',
      'M': 'Orta Saha',
      'F': 'Forvet'
    }
    return positions[position as keyof typeof positions] || position
  }

  const getPositionColor = (position: string) => {
    const colors = {
      'G': 'bg-green-100 text-green-800',
      'D': 'bg-blue-100 text-blue-800',
      'M': 'bg-yellow-100 text-yellow-800',
      'F': 'bg-red-100 text-red-800'
    }
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const positions = [
    { value: 'all', label: 'Tüm Pozisyonlar', icon: '⚽' },
    { value: 'G', label: 'Kaleci', icon: '🧤' },
    { value: 'D', label: 'Defans', icon: '🛡️' },
    { value: 'M', label: 'Orta Saha', icon: '⚙️' },
    { value: 'F', label: 'Forvet', icon: '⚡' }
  ]

  if (loading && leagues.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚽ Oyuncular</h1>
          <p className="text-gray-600">Detaylı oyuncu istatistikleri ve performans verileri</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Sezon Seçimi
              </label>
              <select
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Pozisyon
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedSeason}
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.icon} {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Arama
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyuncu veya takım ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner />
          </div>
        )}

        {/* Players List */}
        {!loading && selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                👥 Oyuncular ({filteredPlayers.length})
              </h2>
            </div>
            
            {paginatedPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">😔</div>
                <p className="text-gray-500">Oyuncu bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedPlayers.map((player, index) => (
                  <div 
                    key={`${player.name}-${index}`} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getPlayerImagePath(player.name)}
                            alt={player.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getTeamLogoPath(player.team_name)}
                            alt={player.team_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                              {getPositionIcon(player.position)} {getPositionName(player.position)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="font-medium text-gray-700">{player.team_name}</span>
                            <span>#{player.jerseyNumber}</span>
                            <span>{player.country}</span>
                            <span>{player.matches_played} maç</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {player.performance_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Performans</div>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <span>⚽ {player.total_goals}</span>
                          <span>🎯 {player.total_assists}</span>
                          <span>⭐ {player.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} - {Math.min(startIndex + playersPerPage, filteredPlayers.length)} / {filteredPlayers.length} oyuncu
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ← Önceki
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayersPage 
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface Player {
  name: string
  team_name: string
  position: string
  country: string
  jerseyNumber: number
  avg_rating: number
  matches_played: number
  total_minutes: number
  total_goals: number
  total_assists: number
  total_saves: number
  total_passes: number
  accurate_passes: number
  pass_accuracy: number
  key_passes: number
  shots_on_target: number
  shots_off_target: number
  tackles: number
  interceptions: number
  duels_won: number
  duels_lost: number
  fouls_committed: number
  fouls_won: number
  performance_score: number
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

const PlayersPage: React.FC = () => {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const playersPerPage = 25

  useEffect(() => {
    loadLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      loadSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      loadPlayers(selectedSeason)
    }
  }, [selectedSeason, selectedPosition])

  const loadLeagues = async () => {
    try {
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
    }
  }

  const loadSeasons = async (leagueId: number) => {
    try {
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
      setPlayers([])
    } catch (err) {
      setError('Sezonlar yüklenemedi')
    }
  }

  const loadPlayers = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (selectedPosition === 'all') {
        response = await apiService.getAllPlayers(seasonId)
      } else {
        response = await apiService.getPlayersByPosition(seasonId, selectedPosition, 100)
      }
      
      setPlayers(response.data.data)
    } catch (err) {
      setError('Oyuncular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (player: Player) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(player.name)}`)
    }
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + playersPerPage)

  const getPositionName = (position: string) => {
    const positions = {
      'G': 'Kaleci',
      'D': 'Defans',
      'M': 'Orta Saha',
      'F': 'Forvet'
    }
    return positions[position as keyof typeof positions] || position
  }

  const getPositionColor = (position: string) => {
    const colors = {
      'G': 'bg-green-100 text-green-800',
      'D': 'bg-blue-100 text-blue-800',
      'M': 'bg-yellow-100 text-yellow-800',
      'F': 'bg-red-100 text-red-800'
    }
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const positions = [
    { value: 'all', label: 'Tüm Pozisyonlar', icon: '⚽' },
    { value: 'G', label: 'Kaleci', icon: '🧤' },
    { value: 'D', label: 'Defans', icon: '🛡️' },
    { value: 'M', label: 'Orta Saha', icon: '⚙️' },
    { value: 'F', label: 'Forvet', icon: '⚡' }
  ]

  if (loading && leagues.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚽ Oyuncular</h1>
          <p className="text-gray-600">Detaylı oyuncu istatistikleri ve performans verileri</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Sezon Seçimi
              </label>
              <select
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Pozisyon
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedSeason}
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.icon} {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Arama
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyuncu veya takım ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner />
          </div>
        )}

        {/* Players List */}
        {!loading && selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                👥 Oyuncular ({filteredPlayers.length})
              </h2>
            </div>
            
            {paginatedPlayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">😔</div>
                <p className="text-gray-500">Oyuncu bulunamadı</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedPlayers.map((player, index) => (
                  <div 
                    key={`${player.name}-${index}`} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getPlayerImagePath(player.name)}
                            alt={player.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={getTeamLogoPath(player.team_name)}
                            alt={player.team_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                              {getPositionIcon(player.position)} {getPositionName(player.position)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="font-medium text-gray-700">{player.team_name}</span>
                            <span>#{player.jerseyNumber}</span>
                            <span>{player.country}</span>
                            <span>{player.matches_played} maç</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {player.performance_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Performans</div>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <span>⚽ {player.total_goals}</span>
                          <span>🎯 {player.total_assists}</span>
                          <span>⭐ {player.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} - {Math.min(startIndex + playersPerPage, filteredPlayers.length)} / {filteredPlayers.length} oyuncu
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ← Önceki
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayersPage 