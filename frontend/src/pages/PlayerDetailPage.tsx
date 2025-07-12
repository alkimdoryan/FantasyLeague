import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface PlayerDetails {
  player_name: string
  team: string
  position: string
  country: string
  matches_played: number
  avg_rating: number
  total_goals: number
  total_assists: number
  total_minutes: number
  avg_minutes: number
  shots_on_target: number
  shots_off_target: number
  pass_accuracy: number
  key_passes: number
  tackles: number
  interceptions: number
  saves: number
}

interface PlayerMatch {
  match_id: number
  match_code: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  match_timestamp: number
  venue: string
  teamName: string
  position: string
  jerseyNumber: number
  minutesPlayed: number
  rating: number
  goals: number
  goalAssist: number
  saves: number
  yellowCard: number
  redCard: number
  result: string
}

const PlayerDetailPage: React.FC = () => {
  const { seasonId, playerName } = useParams<{ seasonId: string; playerName: string }>()
  const navigate = useNavigate()
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails | null>(null)
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'matches'>('stats')

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!seasonId || !playerName) return

      try {
        setLoading(true)
        setError(null)

        const [detailsResponse, matchesResponse] = await Promise.all([
          apiService.getPlayerDetails(parseInt(seasonId), playerName),
          apiService.getPlayerMatches(parseInt(seasonId), playerName)
        ])

        console.log('Player details response:', detailsResponse.data)
        console.log('Player matches response:', matchesResponse.data)

        if (detailsResponse.data && detailsResponse.data.success && detailsResponse.data.data.length > 0) {
          setPlayerDetails(detailsResponse.data.data[0])
        }

        if (matchesResponse.data && matchesResponse.data.success && matchesResponse.data.data) {
          setPlayerMatches(matchesResponse.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch player data:', err)
        setError('Oyuncu verileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [seasonId, playerName])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  const getMatchResult = (match: PlayerMatch) => {
    if (match.teamName === match.home_team) {
      if (match.home_score > match.away_score) return 'G'
      if (match.home_score < match.away_score) return 'M'
      return 'B'
    } else {
      if (match.away_score > match.home_score) return 'G'
      if (match.away_score < match.home_score) return 'M'
      return 'B'
    }
  }

  const getMatchResultColor = (result: string) => {
    switch (result) {
      case 'G': return 'bg-green-100 text-green-800'
      case 'M': return 'bg-red-100 text-red-800'
      case 'B': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">Hata!</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!playerDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <h3 className="font-semibold">Oyuncu Bulunamadı</h3>
              <p>Aranan oyuncu veya sezon bilgileri bulunamadı.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Geri
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getPlayerImagePath(playerDetails.player_name)}
                alt={playerDetails.player_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getTeamLogoPath(playerDetails.team)}
                alt={playerDetails.team}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{playerDetails.player_name}</h1>
              <p className="text-xl text-gray-600 mt-1">{playerDetails.team}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(playerDetails.position)}`}>
                  {getPositionIcon(playerDetails.position)} {getPositionName(playerDetails.position)}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">🌍</span>
                  {playerDetails.country}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">⚽</span>
                  {playerDetails.matches_played} maç
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {playerDetails.avg_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Ortalama Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 İstatistikler
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏟️ Maçlar ({playerMatches.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Genel İstatistikler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚽ Genel</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maç Sayısı</span>
                  <span className="font-medium">{playerDetails.matches_played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Dakika</span>
                  <span className="font-medium">{playerDetails.total_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Dakika</span>
                  <span className="font-medium">{playerDetails.avg_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Rating</span>
                  <span className="font-medium text-blue-600">{playerDetails.avg_rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Saldırı İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Saldırı</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goller</span>
                  <span className="font-medium text-green-600">{playerDetails.total_goals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asistler</span>
                  <span className="font-medium text-blue-600">{playerDetails.total_assists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Hedefe)</span>
                  <span className="font-medium">{playerDetails.shots_on_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Dışarı)</span>
                  <span className="font-medium">{playerDetails.shots_off_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anahtar Pas</span>
                  <span className="font-medium">{playerDetails.key_passes}</span>
                </div>
              </div>
            </div>

            {/* Savunma İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Savunma</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Müdahaleler</span>
                  <span className="font-medium">{playerDetails.tackles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Araya Girmeler</span>
                  <span className="font-medium">{playerDetails.interceptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pas Başarı %</span>
                  <span className="font-medium">{playerDetails.pass_accuracy.toFixed(1)}%</span>
                </div>
                {playerDetails.saves > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurtarışlar</span>
                    <span className="font-medium text-green-600">{playerDetails.saves}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {playerMatches.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🏟️</div>
                <p className="text-gray-500">Maç verileri bulunamadı</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🏟️ Maç Performansı</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {playerMatches.map((match, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {match.home_team}
                            </div>
                            <div className="text-xs text-gray-500">vs</div>
                            <div className="text-sm font-medium text-gray-900">
                              {match.away_team}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {match.home_score} - {match.away_score}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchResultColor(getMatchResult(match))}`}>
                              {getMatchResult(match) === 'G' ? 'Galibiyet' : getMatchResult(match) === 'M' ? 'Mağlubiyet' : 'Beraberlik'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatDate(match.match_timestamp)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {match.venue}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {match.rating ? match.rating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Rating</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{match.minutesPlayed}'</span>
                            <span>⚽ {match.goals}</span>
                            <span>🎯 {match.goalAssist}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerDetailPage 
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface PlayerDetails {
  player_name: string
  team: string
  position: string
  country: string
  matches_played: number
  avg_rating: number
  total_goals: number
  total_assists: number
  total_minutes: number
  avg_minutes: number
  shots_on_target: number
  shots_off_target: number
  pass_accuracy: number
  key_passes: number
  tackles: number
  interceptions: number
  saves: number
}

interface PlayerMatch {
  match_id: number
  match_code: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  match_timestamp: number
  venue: string
  teamName: string
  position: string
  jerseyNumber: number
  minutesPlayed: number
  rating: number
  goals: number
  goalAssist: number
  saves: number
  yellowCard: number
  redCard: number
  result: string
}

const PlayerDetailPage: React.FC = () => {
  const { seasonId, playerName } = useParams<{ seasonId: string; playerName: string }>()
  const navigate = useNavigate()
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails | null>(null)
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'matches'>('stats')

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!seasonId || !playerName) return

      try {
        setLoading(true)
        setError(null)

        const [detailsResponse, matchesResponse] = await Promise.all([
          apiService.getPlayerDetails(parseInt(seasonId), playerName),
          apiService.getPlayerMatches(parseInt(seasonId), playerName)
        ])

        console.log('Player details response:', detailsResponse.data)
        console.log('Player matches response:', matchesResponse.data)

        if (detailsResponse.data && detailsResponse.data.success && detailsResponse.data.data.length > 0) {
          setPlayerDetails(detailsResponse.data.data[0])
        }

        if (matchesResponse.data && matchesResponse.data.success && matchesResponse.data.data) {
          setPlayerMatches(matchesResponse.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch player data:', err)
        setError('Oyuncu verileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [seasonId, playerName])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  const getMatchResult = (match: PlayerMatch) => {
    if (match.teamName === match.home_team) {
      if (match.home_score > match.away_score) return 'G'
      if (match.home_score < match.away_score) return 'M'
      return 'B'
    } else {
      if (match.away_score > match.home_score) return 'G'
      if (match.away_score < match.home_score) return 'M'
      return 'B'
    }
  }

  const getMatchResultColor = (result: string) => {
    switch (result) {
      case 'G': return 'bg-green-100 text-green-800'
      case 'M': return 'bg-red-100 text-red-800'
      case 'B': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">Hata!</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!playerDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <h3 className="font-semibold">Oyuncu Bulunamadı</h3>
              <p>Aranan oyuncu veya sezon bilgileri bulunamadı.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Geri
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getPlayerImagePath(playerDetails.player_name)}
                alt={playerDetails.player_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getTeamLogoPath(playerDetails.team)}
                alt={playerDetails.team}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{playerDetails.player_name}</h1>
              <p className="text-xl text-gray-600 mt-1">{playerDetails.team}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(playerDetails.position)}`}>
                  {getPositionIcon(playerDetails.position)} {getPositionName(playerDetails.position)}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">🌍</span>
                  {playerDetails.country}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">⚽</span>
                  {playerDetails.matches_played} maç
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {playerDetails.avg_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Ortalama Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 İstatistikler
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏟️ Maçlar ({playerMatches.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Genel İstatistikler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚽ Genel</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maç Sayısı</span>
                  <span className="font-medium">{playerDetails.matches_played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Dakika</span>
                  <span className="font-medium">{playerDetails.total_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Dakika</span>
                  <span className="font-medium">{playerDetails.avg_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Rating</span>
                  <span className="font-medium text-blue-600">{playerDetails.avg_rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Saldırı İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Saldırı</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goller</span>
                  <span className="font-medium text-green-600">{playerDetails.total_goals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asistler</span>
                  <span className="font-medium text-blue-600">{playerDetails.total_assists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Hedefe)</span>
                  <span className="font-medium">{playerDetails.shots_on_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Dışarı)</span>
                  <span className="font-medium">{playerDetails.shots_off_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anahtar Pas</span>
                  <span className="font-medium">{playerDetails.key_passes}</span>
                </div>
              </div>
            </div>

            {/* Savunma İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Savunma</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Müdahaleler</span>
                  <span className="font-medium">{playerDetails.tackles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Araya Girmeler</span>
                  <span className="font-medium">{playerDetails.interceptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pas Başarı %</span>
                  <span className="font-medium">{playerDetails.pass_accuracy.toFixed(1)}%</span>
                </div>
                {playerDetails.saves > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurtarışlar</span>
                    <span className="font-medium text-green-600">{playerDetails.saves}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {playerMatches.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🏟️</div>
                <p className="text-gray-500">Maç verileri bulunamadı</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🏟️ Maç Performansı</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {playerMatches.map((match, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {match.home_team}
                            </div>
                            <div className="text-xs text-gray-500">vs</div>
                            <div className="text-sm font-medium text-gray-900">
                              {match.away_team}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {match.home_score} - {match.away_score}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchResultColor(getMatchResult(match))}`}>
                              {getMatchResult(match) === 'G' ? 'Galibiyet' : getMatchResult(match) === 'M' ? 'Mağlubiyet' : 'Beraberlik'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatDate(match.match_timestamp)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {match.venue}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {match.rating ? match.rating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Rating</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{match.minutesPlayed}'</span>
                            <span>⚽ {match.goals}</span>
                            <span>🎯 {match.goalAssist}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerDetailPage 
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface PlayerDetails {
  player_name: string
  team: string
  position: string
  country: string
  matches_played: number
  avg_rating: number
  total_goals: number
  total_assists: number
  total_minutes: number
  avg_minutes: number
  shots_on_target: number
  shots_off_target: number
  pass_accuracy: number
  key_passes: number
  tackles: number
  interceptions: number
  saves: number
}

interface PlayerMatch {
  match_id: number
  match_code: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  match_timestamp: number
  venue: string
  teamName: string
  position: string
  jerseyNumber: number
  minutesPlayed: number
  rating: number
  goals: number
  goalAssist: number
  saves: number
  yellowCard: number
  redCard: number
  result: string
}

const PlayerDetailPage: React.FC = () => {
  const { seasonId, playerName } = useParams<{ seasonId: string; playerName: string }>()
  const navigate = useNavigate()
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails | null>(null)
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'matches'>('stats')

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!seasonId || !playerName) return

      try {
        setLoading(true)
        setError(null)

        const [detailsResponse, matchesResponse] = await Promise.all([
          apiService.getPlayerDetails(parseInt(seasonId), playerName),
          apiService.getPlayerMatches(parseInt(seasonId), playerName)
        ])

        console.log('Player details response:', detailsResponse.data)
        console.log('Player matches response:', matchesResponse.data)

        if (detailsResponse.data && detailsResponse.data.success && detailsResponse.data.data.length > 0) {
          setPlayerDetails(detailsResponse.data.data[0])
        }

        if (matchesResponse.data && matchesResponse.data.success && matchesResponse.data.data) {
          setPlayerMatches(matchesResponse.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch player data:', err)
        setError('Oyuncu verileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [seasonId, playerName])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  const getMatchResult = (match: PlayerMatch) => {
    if (match.teamName === match.home_team) {
      if (match.home_score > match.away_score) return 'G'
      if (match.home_score < match.away_score) return 'M'
      return 'B'
    } else {
      if (match.away_score > match.home_score) return 'G'
      if (match.away_score < match.home_score) return 'M'
      return 'B'
    }
  }

  const getMatchResultColor = (result: string) => {
    switch (result) {
      case 'G': return 'bg-green-100 text-green-800'
      case 'M': return 'bg-red-100 text-red-800'
      case 'B': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">Hata!</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!playerDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <h3 className="font-semibold">Oyuncu Bulunamadı</h3>
              <p>Aranan oyuncu veya sezon bilgileri bulunamadı.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Geri
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getPlayerImagePath(playerDetails.player_name)}
                alt={playerDetails.player_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getTeamLogoPath(playerDetails.team)}
                alt={playerDetails.team}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{playerDetails.player_name}</h1>
              <p className="text-xl text-gray-600 mt-1">{playerDetails.team}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(playerDetails.position)}`}>
                  {getPositionIcon(playerDetails.position)} {getPositionName(playerDetails.position)}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">🌍</span>
                  {playerDetails.country}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">⚽</span>
                  {playerDetails.matches_played} maç
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {playerDetails.avg_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Ortalama Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 İstatistikler
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏟️ Maçlar ({playerMatches.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Genel İstatistikler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚽ Genel</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maç Sayısı</span>
                  <span className="font-medium">{playerDetails.matches_played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Dakika</span>
                  <span className="font-medium">{playerDetails.total_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Dakika</span>
                  <span className="font-medium">{playerDetails.avg_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Rating</span>
                  <span className="font-medium text-blue-600">{playerDetails.avg_rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Saldırı İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Saldırı</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goller</span>
                  <span className="font-medium text-green-600">{playerDetails.total_goals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asistler</span>
                  <span className="font-medium text-blue-600">{playerDetails.total_assists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Hedefe)</span>
                  <span className="font-medium">{playerDetails.shots_on_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Dışarı)</span>
                  <span className="font-medium">{playerDetails.shots_off_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anahtar Pas</span>
                  <span className="font-medium">{playerDetails.key_passes}</span>
                </div>
              </div>
            </div>

            {/* Savunma İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Savunma</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Müdahaleler</span>
                  <span className="font-medium">{playerDetails.tackles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Araya Girmeler</span>
                  <span className="font-medium">{playerDetails.interceptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pas Başarı %</span>
                  <span className="font-medium">{playerDetails.pass_accuracy.toFixed(1)}%</span>
                </div>
                {playerDetails.saves > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurtarışlar</span>
                    <span className="font-medium text-green-600">{playerDetails.saves}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {playerMatches.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🏟️</div>
                <p className="text-gray-500">Maç verileri bulunamadı</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🏟️ Maç Performansı</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {playerMatches.map((match, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {match.home_team}
                            </div>
                            <div className="text-xs text-gray-500">vs</div>
                            <div className="text-sm font-medium text-gray-900">
                              {match.away_team}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {match.home_score} - {match.away_score}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchResultColor(getMatchResult(match))}`}>
                              {getMatchResult(match) === 'G' ? 'Galibiyet' : getMatchResult(match) === 'M' ? 'Mağlubiyet' : 'Beraberlik'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatDate(match.match_timestamp)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {match.venue}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {match.rating ? match.rating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Rating</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{match.minutesPlayed}'</span>
                            <span>⚽ {match.goals}</span>
                            <span>🎯 {match.goalAssist}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerDetailPage 
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface PlayerDetails {
  player_name: string
  team: string
  position: string
  country: string
  matches_played: number
  avg_rating: number
  total_goals: number
  total_assists: number
  total_minutes: number
  avg_minutes: number
  shots_on_target: number
  shots_off_target: number
  pass_accuracy: number
  key_passes: number
  tackles: number
  interceptions: number
  saves: number
}

interface PlayerMatch {
  match_id: number
  match_code: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  match_timestamp: number
  venue: string
  teamName: string
  position: string
  jerseyNumber: number
  minutesPlayed: number
  rating: number
  goals: number
  goalAssist: number
  saves: number
  yellowCard: number
  redCard: number
  result: string
}

const PlayerDetailPage: React.FC = () => {
  const { seasonId, playerName } = useParams<{ seasonId: string; playerName: string }>()
  const navigate = useNavigate()
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails | null>(null)
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'matches'>('stats')

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!seasonId || !playerName) return

      try {
        setLoading(true)
        setError(null)

        const [detailsResponse, matchesResponse] = await Promise.all([
          apiService.getPlayerDetails(parseInt(seasonId), playerName),
          apiService.getPlayerMatches(parseInt(seasonId), playerName)
        ])

        console.log('Player details response:', detailsResponse.data)
        console.log('Player matches response:', matchesResponse.data)

        if (detailsResponse.data && detailsResponse.data.success && detailsResponse.data.data.length > 0) {
          setPlayerDetails(detailsResponse.data.data[0])
        }

        if (matchesResponse.data && matchesResponse.data.success && matchesResponse.data.data) {
          setPlayerMatches(matchesResponse.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch player data:', err)
        setError('Oyuncu verileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [seasonId, playerName])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  const getMatchResult = (match: PlayerMatch) => {
    if (match.teamName === match.home_team) {
      if (match.home_score > match.away_score) return 'G'
      if (match.home_score < match.away_score) return 'M'
      return 'B'
    } else {
      if (match.away_score > match.home_score) return 'G'
      if (match.away_score < match.home_score) return 'M'
      return 'B'
    }
  }

  const getMatchResultColor = (result: string) => {
    switch (result) {
      case 'G': return 'bg-green-100 text-green-800'
      case 'M': return 'bg-red-100 text-red-800'
      case 'B': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">Hata!</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!playerDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <h3 className="font-semibold">Oyuncu Bulunamadı</h3>
              <p>Aranan oyuncu veya sezon bilgileri bulunamadı.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Geri
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getPlayerImagePath(playerDetails.player_name)}
                alt={playerDetails.player_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={getTeamLogoPath(playerDetails.team)}
                alt={playerDetails.team}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{playerDetails.player_name}</h1>
              <p className="text-xl text-gray-600 mt-1">{playerDetails.team}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(playerDetails.position)}`}>
                  {getPositionIcon(playerDetails.position)} {getPositionName(playerDetails.position)}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">🌍</span>
                  {playerDetails.country}
                </span>
                <span className="text-gray-500 flex items-center">
                  <span className="mr-1">⚽</span>
                  {playerDetails.matches_played} maç
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {playerDetails.avg_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Ortalama Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 İstatistikler
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏟️ Maçlar ({playerMatches.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Genel İstatistikler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚽ Genel</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maç Sayısı</span>
                  <span className="font-medium">{playerDetails.matches_played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Dakika</span>
                  <span className="font-medium">{playerDetails.total_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Dakika</span>
                  <span className="font-medium">{playerDetails.avg_minutes}'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Rating</span>
                  <span className="font-medium text-blue-600">{playerDetails.avg_rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Saldırı İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Saldırı</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goller</span>
                  <span className="font-medium text-green-600">{playerDetails.total_goals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asistler</span>
                  <span className="font-medium text-blue-600">{playerDetails.total_assists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Hedefe)</span>
                  <span className="font-medium">{playerDetails.shots_on_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Şut (Dışarı)</span>
                  <span className="font-medium">{playerDetails.shots_off_target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anahtar Pas</span>
                  <span className="font-medium">{playerDetails.key_passes}</span>
                </div>
              </div>
            </div>

            {/* Savunma İstatistikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Savunma</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Müdahaleler</span>
                  <span className="font-medium">{playerDetails.tackles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Araya Girmeler</span>
                  <span className="font-medium">{playerDetails.interceptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pas Başarı %</span>
                  <span className="font-medium">{playerDetails.pass_accuracy.toFixed(1)}%</span>
                </div>
                {playerDetails.saves > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurtarışlar</span>
                    <span className="font-medium text-green-600">{playerDetails.saves}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {playerMatches.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🏟️</div>
                <p className="text-gray-500">Maç verileri bulunamadı</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🏟️ Maç Performansı</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {playerMatches.map((match, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {match.home_team}
                            </div>
                            <div className="text-xs text-gray-500">vs</div>
                            <div className="text-sm font-medium text-gray-900">
                              {match.away_team}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {match.home_score} - {match.away_score}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchResultColor(getMatchResult(match))}`}>
                              {getMatchResult(match) === 'G' ? 'Galibiyet' : getMatchResult(match) === 'M' ? 'Mağlubiyet' : 'Beraberlik'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatDate(match.match_timestamp)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {match.venue}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {match.rating ? match.rating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Rating</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{match.minutesPlayed}'</span>
                            <span>⚽ {match.goals}</span>
                            <span>🎯 {match.goalAssist}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerDetailPage 