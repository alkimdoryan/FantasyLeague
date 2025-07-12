import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface Standing {
  Team: string
  Played: number
  Won: number
  Drawn: number
  Lost: number
  'Goals For': number
  'Goals Against': number
  'Goal Difference': number
  Points: number
  Form: string
}

interface SeasonStats {
  total_matches: number
  total_goals: number
  avg_goals_per_match: number
  home_wins: number
  away_wins: number
  draws: number
}

interface PlayerStat {
  Player: string
  Team: string
  Position: string
  Country: string
  'Average Rating': number
  Goals: number
  Assists: number
  'Minutes Played': number
  'Total Shots': number
  'Shots on Target': number
  'Pass Accuracy': number
  'Key Passes': number
  'Total Duels': number
  'Duels Won': number
  Tackles: number
  Blocks: number
  Interceptions: number
  'Fouls Won': number
  'Fouls Committed': number
  'Yellow Cards': number
  'Red Cards': number
  'Goalkeeper Saves': number
  'Goals Conceded': number
}

interface DreamTeamPlayer {
  Player: string
  Team: string
  Position: string
  Score: number
}

const LeaguesPage: React.FC = () => {
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'standings' | 'players' | 'dreamteam' | 'stats'>('standings')

  // Data states
  const [standings, setStandings] = useState<Standing[]>([])
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([])
  const [dreamTeam, setDreamTeam] = useState<DreamTeamPlayer[]>([])
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)

  useEffect(() => {
    fetchLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      fetchSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonData(selectedSeason)
    }
  }, [selectedSeason])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
      console.error('Error fetching leagues:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasons = async (leagueId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
    } catch (err) {
      setError('Sezonlar yüklenemedi')
      console.error('Error fetching seasons:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasonData = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const [standingsRes, playersRes, dreamTeamRes, statsRes] = await Promise.all([
        apiService.getLeagueStandings(seasonId),
        apiService.getPlayerStats(seasonId, 20),
        apiService.getDreamTeam(seasonId),
        apiService.getSeasonStats(seasonId)
      ])

      setStandings(standingsRes.data.data)
      setTopPlayers(playersRes.data.data)
      setDreamTeam(dreamTeamRes.data.data)
      setSeasonStats(statsRes.data.data)
    } catch (err) {
      setError('Sezon verileri yüklenemedi')
      console.error('Error fetching season data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (teamName: string) => {
    if (selectedSeason) {
      navigate(`/team/${selectedSeason}/${encodeURIComponent(teamName)}`)
    }
  }

  const handlePlayerClick = (playerName: string) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(playerName)}`)
    }
  }

  const getFormIcon = (form: string) => {
    if (!form) return ''
    return form.split('').map(char => {
      switch (char) {
        case '🟢': return '✅'
        case '🔴': return '❌'
        case '⚪': return '⚖️'
        default: return char
      }
    }).join('')
  }

  const getRankColor = (position: number) => {
    if (position <= 4) return 'bg-green-100 text-green-800'
    if (position <= 6) return 'bg-blue-100 text-blue-800'
    if (position >= 18) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatLeagueName = (name: string) => {
    return name.replace(/^\d+\s*/, '')
  }

  const handleLeagueChange = (leagueId: number) => {
    setSelectedLeague(leagueId)
    setSelectedSeason(null)
    setStandings([])
    setTopPlayers([])
    setDreamTeam([])
    setSeasonStats(null)
  }

  const handleSeasonChange = (seasonId: number) => {
    setSelectedSeason(seasonId)
  }

  const handleTabChange = (tab: 'standings' | 'players' | 'dreamteam' | 'stats') => {
    setActiveTab(tab)
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Lig Analizi</h1>
          <p className="text-gray-600">Kapsamlı lig istatistikleri ve takım sıralamaları</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => handleLeagueChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz...</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {formatLeagueName(league.name)} - {league.country}
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
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz...</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season} - {season.match_count} maç
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'standings', name: 'Puan Durumu', icon: '📊' },
                  { id: 'players', name: 'En İyi Oyuncular', icon: '⭐' },
                  { id: 'dreamteam', name: 'Rüya Takımı', icon: '🏆' },
                  { id: 'stats', name: 'Sezon İstatistikleri', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* Standings Tab */}
                  {activeTab === 'standings' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📊 Puan Durumu</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sıra
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                O
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                G
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                B
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                M
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                YG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AV
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Form
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {standings.map((team, index) => (
                              <tr 
                                key={team.Team} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleTeamClick(team.Team)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getRankColor(index + 1)}`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(team.Team)}
                                        alt={team.Team}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {team.Team}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Played}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Won}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Drawn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Lost}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals For']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals Against']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={team['Goal Difference'] > 0 ? 'text-green-600' : team['Goal Difference'] < 0 ? 'text-red-600' : 'text-gray-500'}>
                                    {team['Goal Difference'] > 0 ? '+' : ''}{team['Goal Difference']}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {team.Points}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex space-x-1">
                                    {team.Form && team.Form.split('').map((result, i) => (
                                      <span key={i} className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                        result === '🟢' ? 'bg-green-500 text-white' : 
                                        result === '🔴' ? 'bg-red-500 text-white' : 
                                        'bg-gray-400 text-white'
                                      }`}>
                                        {result === '🟢' ? 'G' : result === '🔴' ? 'M' : 'B'}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Players Tab */}
                  {activeTab === 'players' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">⭐ En İyi Oyuncular</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Oyuncu
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Poz
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ort
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gol
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asist
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dk
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topPlayers.map((player, index) => (
                              <tr 
                                key={`${player.Player}-${player.Team}`} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handlePlayerClick(player.Player)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getPlayerImagePath(player.Player)}
                                        alt={player.Player}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {player.Player}
                                      </div>
                                      <div className="text-sm text-gray-500">{player.Country}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-6 w-6 mr-2">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(player.Team)}
                                        alt={player.Team}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                    </div>
                                    <div className="text-sm text-gray-900">{player.Team}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm mr-1">{getPositionIcon(player.Position)}</span>
                                    <span className="text-sm text-gray-500">{player.Position}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {player['Average Rating']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Goals}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Assists}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player['Minutes Played']}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Dream Team Tab */}
                  {activeTab === 'dreamteam' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">🏆 Rüya Takımı</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dreamTeam.map((player, index) => (
                          <div 
                            key={`${player.Player}-${player.Team}`} 
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handlePlayerClick(player.Player)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-600">{player.Position}</span>
                              <span className="text-sm font-bold text-blue-700">{player.Score}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <ImageWithFallback
                                  src={getPlayerImagePath(player.Player)}
                                  alt={player.Player}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {player.Player}
                                </div>
                                <div className="text-sm text-gray-500">{player.Team}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && seasonStats && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📈 Sezon İstatistikleri</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚽</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-900">Toplam Maç</p>
                              <p className="text-2xl font-bold text-blue-600">{seasonStats.total_matches}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🥅</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-900">Toplam Gol</p>
                              <p className="text-2xl font-bold text-green-600">{seasonStats.total_goals}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">📊</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-yellow-900">Maç Başı Ortalama</p>
                              <p className="text-2xl font-bold text-yellow-600">{seasonStats.avg_goals_per_match}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🏠</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-red-900">Ev Sahibi Galibiyeti</p>
                              <p className="text-2xl font-bold text-red-600">{seasonStats.home_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">✈️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-purple-900">Deplasman Galibiyeti</p>
                              <p className="text-2xl font-bold text-purple-600">{seasonStats.away_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚖️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Beraberlik</p>
                              <p className="text-2xl font-bold text-gray-600">{seasonStats.draws}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaguesPage 
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface Standing {
  Team: string
  Played: number
  Won: number
  Drawn: number
  Lost: number
  'Goals For': number
  'Goals Against': number
  'Goal Difference': number
  Points: number
  Form: string
}

interface SeasonStats {
  total_matches: number
  total_goals: number
  avg_goals_per_match: number
  home_wins: number
  away_wins: number
  draws: number
}

interface PlayerStat {
  Player: string
  Team: string
  Position: string
  Country: string
  'Average Rating': number
  Goals: number
  Assists: number
  'Minutes Played': number
  'Total Shots': number
  'Shots on Target': number
  'Pass Accuracy': number
  'Key Passes': number
  'Total Duels': number
  'Duels Won': number
  Tackles: number
  Blocks: number
  Interceptions: number
  'Fouls Won': number
  'Fouls Committed': number
  'Yellow Cards': number
  'Red Cards': number
  'Goalkeeper Saves': number
  'Goals Conceded': number
}

interface DreamTeamPlayer {
  Player: string
  Team: string
  Position: string
  Score: number
}

const LeaguesPage: React.FC = () => {
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'standings' | 'players' | 'dreamteam' | 'stats'>('standings')

  // Data states
  const [standings, setStandings] = useState<Standing[]>([])
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([])
  const [dreamTeam, setDreamTeam] = useState<DreamTeamPlayer[]>([])
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)

  useEffect(() => {
    fetchLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      fetchSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonData(selectedSeason)
    }
  }, [selectedSeason])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
      console.error('Error fetching leagues:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasons = async (leagueId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
    } catch (err) {
      setError('Sezonlar yüklenemedi')
      console.error('Error fetching seasons:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasonData = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const [standingsRes, playersRes, dreamTeamRes, statsRes] = await Promise.all([
        apiService.getLeagueStandings(seasonId),
        apiService.getPlayerStats(seasonId, 20),
        apiService.getDreamTeam(seasonId),
        apiService.getSeasonStats(seasonId)
      ])

      setStandings(standingsRes.data.data)
      setTopPlayers(playersRes.data.data)
      setDreamTeam(dreamTeamRes.data.data)
      setSeasonStats(statsRes.data.data)
    } catch (err) {
      setError('Sezon verileri yüklenemedi')
      console.error('Error fetching season data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (teamName: string) => {
    if (selectedSeason) {
      navigate(`/team/${selectedSeason}/${encodeURIComponent(teamName)}`)
    }
  }

  const handlePlayerClick = (playerName: string) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(playerName)}`)
    }
  }

  const getFormIcon = (form: string) => {
    if (!form) return ''
    return form.split('').map(char => {
      switch (char) {
        case '🟢': return '✅'
        case '🔴': return '❌'
        case '⚪': return '⚖️'
        default: return char
      }
    }).join('')
  }

  const getRankColor = (position: number) => {
    if (position <= 4) return 'bg-green-100 text-green-800'
    if (position <= 6) return 'bg-blue-100 text-blue-800'
    if (position >= 18) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatLeagueName = (name: string) => {
    return name.replace(/^\d+\s*/, '')
  }

  const handleLeagueChange = (leagueId: number) => {
    setSelectedLeague(leagueId)
    setSelectedSeason(null)
    setStandings([])
    setTopPlayers([])
    setDreamTeam([])
    setSeasonStats(null)
  }

  const handleSeasonChange = (seasonId: number) => {
    setSelectedSeason(seasonId)
  }

  const handleTabChange = (tab: 'standings' | 'players' | 'dreamteam' | 'stats') => {
    setActiveTab(tab)
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Lig Analizi</h1>
          <p className="text-gray-600">Kapsamlı lig istatistikleri ve takım sıralamaları</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => handleLeagueChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz...</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {formatLeagueName(league.name)} - {league.country}
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
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz...</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season} - {season.match_count} maç
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'standings', name: 'Puan Durumu', icon: '📊' },
                  { id: 'players', name: 'En İyi Oyuncular', icon: '⭐' },
                  { id: 'dreamteam', name: 'Rüya Takımı', icon: '🏆' },
                  { id: 'stats', name: 'Sezon İstatistikleri', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* Standings Tab */}
                  {activeTab === 'standings' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📊 Puan Durumu</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sıra
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                O
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                G
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                B
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                M
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                YG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AV
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Form
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {standings.map((team, index) => (
                              <tr 
                                key={team.Team} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleTeamClick(team.Team)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getRankColor(index + 1)}`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(team.Team)}
                                        alt={team.Team}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {team.Team}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Played}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Won}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Drawn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Lost}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals For']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals Against']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={team['Goal Difference'] > 0 ? 'text-green-600' : team['Goal Difference'] < 0 ? 'text-red-600' : 'text-gray-500'}>
                                    {team['Goal Difference'] > 0 ? '+' : ''}{team['Goal Difference']}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {team.Points}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex space-x-1">
                                    {team.Form && team.Form.split('').map((result, i) => (
                                      <span key={i} className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                        result === '🟢' ? 'bg-green-500 text-white' : 
                                        result === '🔴' ? 'bg-red-500 text-white' : 
                                        'bg-gray-400 text-white'
                                      }`}>
                                        {result === '🟢' ? 'G' : result === '🔴' ? 'M' : 'B'}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Players Tab */}
                  {activeTab === 'players' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">⭐ En İyi Oyuncular</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Oyuncu
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Poz
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ort
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gol
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asist
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dk
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topPlayers.map((player, index) => (
                              <tr 
                                key={`${player.Player}-${player.Team}`} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handlePlayerClick(player.Player)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getPlayerImagePath(player.Player)}
                                        alt={player.Player}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {player.Player}
                                      </div>
                                      <div className="text-sm text-gray-500">{player.Country}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-6 w-6 mr-2">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(player.Team)}
                                        alt={player.Team}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                    </div>
                                    <div className="text-sm text-gray-900">{player.Team}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm mr-1">{getPositionIcon(player.Position)}</span>
                                    <span className="text-sm text-gray-500">{player.Position}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {player['Average Rating']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Goals}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Assists}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player['Minutes Played']}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Dream Team Tab */}
                  {activeTab === 'dreamteam' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">🏆 Rüya Takımı</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dreamTeam.map((player, index) => (
                          <div 
                            key={`${player.Player}-${player.Team}`} 
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handlePlayerClick(player.Player)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-600">{player.Position}</span>
                              <span className="text-sm font-bold text-blue-700">{player.Score}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <ImageWithFallback
                                  src={getPlayerImagePath(player.Player)}
                                  alt={player.Player}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {player.Player}
                                </div>
                                <div className="text-sm text-gray-500">{player.Team}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && seasonStats && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📈 Sezon İstatistikleri</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚽</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-900">Toplam Maç</p>
                              <p className="text-2xl font-bold text-blue-600">{seasonStats.total_matches}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🥅</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-900">Toplam Gol</p>
                              <p className="text-2xl font-bold text-green-600">{seasonStats.total_goals}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">📊</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-yellow-900">Maç Başı Ortalama</p>
                              <p className="text-2xl font-bold text-yellow-600">{seasonStats.avg_goals_per_match}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🏠</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-red-900">Ev Sahibi Galibiyeti</p>
                              <p className="text-2xl font-bold text-red-600">{seasonStats.home_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">✈️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-purple-900">Deplasman Galibiyeti</p>
                              <p className="text-2xl font-bold text-purple-600">{seasonStats.away_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚖️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Beraberlik</p>
                              <p className="text-2xl font-bold text-gray-600">{seasonStats.draws}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaguesPage 
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface Standing {
  Team: string
  Played: number
  Won: number
  Drawn: number
  Lost: number
  'Goals For': number
  'Goals Against': number
  'Goal Difference': number
  Points: number
  Form: string
}

interface SeasonStats {
  total_matches: number
  total_goals: number
  avg_goals_per_match: number
  home_wins: number
  away_wins: number
  draws: number
}

interface PlayerStat {
  Player: string
  Team: string
  Position: string
  Country: string
  'Average Rating': number
  Goals: number
  Assists: number
  'Minutes Played': number
  'Total Shots': number
  'Shots on Target': number
  'Pass Accuracy': number
  'Key Passes': number
  'Total Duels': number
  'Duels Won': number
  Tackles: number
  Blocks: number
  Interceptions: number
  'Fouls Won': number
  'Fouls Committed': number
  'Yellow Cards': number
  'Red Cards': number
  'Goalkeeper Saves': number
  'Goals Conceded': number
}

interface DreamTeamPlayer {
  Player: string
  Team: string
  Position: string
  Score: number
}

const LeaguesPage: React.FC = () => {
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'standings' | 'players' | 'dreamteam' | 'stats'>('standings')

  // Data states
  const [standings, setStandings] = useState<Standing[]>([])
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([])
  const [dreamTeam, setDreamTeam] = useState<DreamTeamPlayer[]>([])
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)

  useEffect(() => {
    fetchLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      fetchSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonData(selectedSeason)
    }
  }, [selectedSeason])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
      console.error('Error fetching leagues:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasons = async (leagueId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
    } catch (err) {
      setError('Sezonlar yüklenemedi')
      console.error('Error fetching seasons:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasonData = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const [standingsRes, playersRes, dreamTeamRes, statsRes] = await Promise.all([
        apiService.getLeagueStandings(seasonId),
        apiService.getPlayerStats(seasonId, 20),
        apiService.getDreamTeam(seasonId),
        apiService.getSeasonStats(seasonId)
      ])

      setStandings(standingsRes.data.data)
      setTopPlayers(playersRes.data.data)
      setDreamTeam(dreamTeamRes.data.data)
      setSeasonStats(statsRes.data.data)
    } catch (err) {
      setError('Sezon verileri yüklenemedi')
      console.error('Error fetching season data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (teamName: string) => {
    if (selectedSeason) {
      navigate(`/team/${selectedSeason}/${encodeURIComponent(teamName)}`)
    }
  }

  const handlePlayerClick = (playerName: string) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(playerName)}`)
    }
  }

  const getFormIcon = (form: string) => {
    if (!form) return ''
    return form.split('').map(char => {
      switch (char) {
        case '🟢': return '✅'
        case '🔴': return '❌'
        case '⚪': return '⚖️'
        default: return char
      }
    }).join('')
  }

  const getRankColor = (position: number) => {
    if (position <= 4) return 'bg-green-100 text-green-800'
    if (position <= 6) return 'bg-blue-100 text-blue-800'
    if (position >= 18) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatLeagueName = (name: string) => {
    return name.replace(/^\d+\s*/, '')
  }

  const handleLeagueChange = (leagueId: number) => {
    setSelectedLeague(leagueId)
    setSelectedSeason(null)
    setStandings([])
    setTopPlayers([])
    setDreamTeam([])
    setSeasonStats(null)
  }

  const handleSeasonChange = (seasonId: number) => {
    setSelectedSeason(seasonId)
  }

  const handleTabChange = (tab: 'standings' | 'players' | 'dreamteam' | 'stats') => {
    setActiveTab(tab)
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Lig Analizi</h1>
          <p className="text-gray-600">Kapsamlı lig istatistikleri ve takım sıralamaları</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => handleLeagueChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz...</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {formatLeagueName(league.name)} - {league.country}
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
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz...</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season} - {season.match_count} maç
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'standings', name: 'Puan Durumu', icon: '📊' },
                  { id: 'players', name: 'En İyi Oyuncular', icon: '⭐' },
                  { id: 'dreamteam', name: 'Rüya Takımı', icon: '🏆' },
                  { id: 'stats', name: 'Sezon İstatistikleri', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* Standings Tab */}
                  {activeTab === 'standings' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📊 Puan Durumu</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sıra
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                O
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                G
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                B
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                M
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                YG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AV
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Form
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {standings.map((team, index) => (
                              <tr 
                                key={team.Team} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleTeamClick(team.Team)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getRankColor(index + 1)}`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(team.Team)}
                                        alt={team.Team}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {team.Team}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Played}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Won}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Drawn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Lost}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals For']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals Against']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={team['Goal Difference'] > 0 ? 'text-green-600' : team['Goal Difference'] < 0 ? 'text-red-600' : 'text-gray-500'}>
                                    {team['Goal Difference'] > 0 ? '+' : ''}{team['Goal Difference']}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {team.Points}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex space-x-1">
                                    {team.Form && team.Form.split('').map((result, i) => (
                                      <span key={i} className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                        result === '🟢' ? 'bg-green-500 text-white' : 
                                        result === '🔴' ? 'bg-red-500 text-white' : 
                                        'bg-gray-400 text-white'
                                      }`}>
                                        {result === '🟢' ? 'G' : result === '🔴' ? 'M' : 'B'}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Players Tab */}
                  {activeTab === 'players' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">⭐ En İyi Oyuncular</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Oyuncu
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Poz
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ort
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gol
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asist
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dk
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topPlayers.map((player, index) => (
                              <tr 
                                key={`${player.Player}-${player.Team}`} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handlePlayerClick(player.Player)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getPlayerImagePath(player.Player)}
                                        alt={player.Player}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {player.Player}
                                      </div>
                                      <div className="text-sm text-gray-500">{player.Country}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-6 w-6 mr-2">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(player.Team)}
                                        alt={player.Team}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                    </div>
                                    <div className="text-sm text-gray-900">{player.Team}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm mr-1">{getPositionIcon(player.Position)}</span>
                                    <span className="text-sm text-gray-500">{player.Position}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {player['Average Rating']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Goals}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Assists}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player['Minutes Played']}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Dream Team Tab */}
                  {activeTab === 'dreamteam' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">🏆 Rüya Takımı</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dreamTeam.map((player, index) => (
                          <div 
                            key={`${player.Player}-${player.Team}`} 
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handlePlayerClick(player.Player)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-600">{player.Position}</span>
                              <span className="text-sm font-bold text-blue-700">{player.Score}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <ImageWithFallback
                                  src={getPlayerImagePath(player.Player)}
                                  alt={player.Player}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {player.Player}
                                </div>
                                <div className="text-sm text-gray-500">{player.Team}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && seasonStats && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📈 Sezon İstatistikleri</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚽</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-900">Toplam Maç</p>
                              <p className="text-2xl font-bold text-blue-600">{seasonStats.total_matches}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🥅</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-900">Toplam Gol</p>
                              <p className="text-2xl font-bold text-green-600">{seasonStats.total_goals}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">📊</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-yellow-900">Maç Başı Ortalama</p>
                              <p className="text-2xl font-bold text-yellow-600">{seasonStats.avg_goals_per_match}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🏠</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-red-900">Ev Sahibi Galibiyeti</p>
                              <p className="text-2xl font-bold text-red-600">{seasonStats.home_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">✈️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-purple-900">Deplasman Galibiyeti</p>
                              <p className="text-2xl font-bold text-purple-600">{seasonStats.away_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚖️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Beraberlik</p>
                              <p className="text-2xl font-bold text-gray-600">{seasonStats.draws}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaguesPage 
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { getPlayerImagePath, getTeamLogoPath, getPositionIcon } from '../utils/imageUtils'

interface League {
  id: number
  name: string
  country: string
  logo_url: string
}

interface Season {
  id: number
  season: string
  league_name: string
  match_count: number
}

interface Standing {
  Team: string
  Played: number
  Won: number
  Drawn: number
  Lost: number
  'Goals For': number
  'Goals Against': number
  'Goal Difference': number
  Points: number
  Form: string
}

interface SeasonStats {
  total_matches: number
  total_goals: number
  avg_goals_per_match: number
  home_wins: number
  away_wins: number
  draws: number
}

interface PlayerStat {
  Player: string
  Team: string
  Position: string
  Country: string
  'Average Rating': number
  Goals: number
  Assists: number
  'Minutes Played': number
  'Total Shots': number
  'Shots on Target': number
  'Pass Accuracy': number
  'Key Passes': number
  'Total Duels': number
  'Duels Won': number
  Tackles: number
  Blocks: number
  Interceptions: number
  'Fouls Won': number
  'Fouls Committed': number
  'Yellow Cards': number
  'Red Cards': number
  'Goalkeeper Saves': number
  'Goals Conceded': number
}

interface DreamTeamPlayer {
  Player: string
  Team: string
  Position: string
  Score: number
}

const LeaguesPage: React.FC = () => {
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'standings' | 'players' | 'dreamteam' | 'stats'>('standings')

  // Data states
  const [standings, setStandings] = useState<Standing[]>([])
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([])
  const [dreamTeam, setDreamTeam] = useState<DreamTeamPlayer[]>([])
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)

  useEffect(() => {
    fetchLeagues()
  }, [])

  useEffect(() => {
    if (selectedLeague) {
      fetchSeasons(selectedLeague)
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonData(selectedSeason)
    }
  }, [selectedSeason])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const response = await apiService.getLeagues()
      setLeagues(response.data.data)
    } catch (err) {
      setError('Ligler yüklenemedi')
      console.error('Error fetching leagues:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasons = async (leagueId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getSeasonsByLeague(leagueId)
      setSeasons(response.data.data)
      setSelectedSeason(null)
    } catch (err) {
      setError('Sezonlar yüklenemedi')
      console.error('Error fetching seasons:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasonData = async (seasonId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const [standingsRes, playersRes, dreamTeamRes, statsRes] = await Promise.all([
        apiService.getLeagueStandings(seasonId),
        apiService.getPlayerStats(seasonId, 20),
        apiService.getDreamTeam(seasonId),
        apiService.getSeasonStats(seasonId)
      ])

      setStandings(standingsRes.data.data)
      setTopPlayers(playersRes.data.data)
      setDreamTeam(dreamTeamRes.data.data)
      setSeasonStats(statsRes.data.data)
    } catch (err) {
      setError('Sezon verileri yüklenemedi')
      console.error('Error fetching season data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (teamName: string) => {
    if (selectedSeason) {
      navigate(`/team/${selectedSeason}/${encodeURIComponent(teamName)}`)
    }
  }

  const handlePlayerClick = (playerName: string) => {
    if (selectedSeason) {
      navigate(`/player/${selectedSeason}/${encodeURIComponent(playerName)}`)
    }
  }

  const getFormIcon = (form: string) => {
    if (!form) return ''
    return form.split('').map(char => {
      switch (char) {
        case '🟢': return '✅'
        case '🔴': return '❌'
        case '⚪': return '⚖️'
        default: return char
      }
    }).join('')
  }

  const getRankColor = (position: number) => {
    if (position <= 4) return 'bg-green-100 text-green-800'
    if (position <= 6) return 'bg-blue-100 text-blue-800'
    if (position >= 18) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatLeagueName = (name: string) => {
    return name.replace(/^\d+\s*/, '')
  }

  const handleLeagueChange = (leagueId: number) => {
    setSelectedLeague(leagueId)
    setSelectedSeason(null)
    setStandings([])
    setTopPlayers([])
    setDreamTeam([])
    setSeasonStats(null)
  }

  const handleSeasonChange = (seasonId: number) => {
    setSelectedSeason(seasonId)
  }

  const handleTabChange = (tab: 'standings' | 'players' | 'dreamteam' | 'stats') => {
    setActiveTab(tab)
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Lig Analizi</h1>
          <p className="text-gray-600">Kapsamlı lig istatistikleri ve takım sıralamaları</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏆 Lig Seçimi
              </label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => handleLeagueChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Lig seçiniz...</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {formatLeagueName(league.name)} - {league.country}
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
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={!selectedLeague}
              >
                <option value="">Sezon seçiniz...</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.season} - {season.match_count} maç
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {selectedSeason && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'standings', name: 'Puan Durumu', icon: '📊' },
                  { id: 'players', name: 'En İyi Oyuncular', icon: '⭐' },
                  { id: 'dreamteam', name: 'Rüya Takımı', icon: '🏆' },
                  { id: 'stats', name: 'Sezon İstatistikleri', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* Standings Tab */}
                  {activeTab === 'standings' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📊 Puan Durumu</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sıra
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                O
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                G
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                B
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                M
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                YG
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AV
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Form
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {standings.map((team, index) => (
                              <tr 
                                key={team.Team} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleTeamClick(team.Team)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getRankColor(index + 1)}`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(team.Team)}
                                        alt={team.Team}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {team.Team}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Played}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Won}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Drawn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team.Lost}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals For']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {team['Goals Against']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={team['Goal Difference'] > 0 ? 'text-green-600' : team['Goal Difference'] < 0 ? 'text-red-600' : 'text-gray-500'}>
                                    {team['Goal Difference'] > 0 ? '+' : ''}{team['Goal Difference']}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {team.Points}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex space-x-1">
                                    {team.Form && team.Form.split('').map((result, i) => (
                                      <span key={i} className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                        result === '🟢' ? 'bg-green-500 text-white' : 
                                        result === '🔴' ? 'bg-red-500 text-white' : 
                                        'bg-gray-400 text-white'
                                      }`}>
                                        {result === '🟢' ? 'G' : result === '🔴' ? 'M' : 'B'}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Players Tab */}
                  {activeTab === 'players' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">⭐ En İyi Oyuncular</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Oyuncu
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Takım
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Poz
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ort
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gol
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asist
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dk
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topPlayers.map((player, index) => (
                              <tr 
                                key={`${player.Player}-${player.Team}`} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handlePlayerClick(player.Player)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                                      <ImageWithFallback
                                        src={getPlayerImagePath(player.Player)}
                                        alt={player.Player}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                        {player.Player}
                                      </div>
                                      <div className="text-sm text-gray-500">{player.Country}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-6 w-6 mr-2">
                                      <ImageWithFallback
                                        src={getTeamLogoPath(player.Team)}
                                        alt={player.Team}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                    </div>
                                    <div className="text-sm text-gray-900">{player.Team}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm mr-1">{getPositionIcon(player.Position)}</span>
                                    <span className="text-sm text-gray-500">{player.Position}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {player['Average Rating']}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Goals}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player.Assists}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {player['Minutes Played']}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Dream Team Tab */}
                  {activeTab === 'dreamteam' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">🏆 Rüya Takımı</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dreamTeam.map((player, index) => (
                          <div 
                            key={`${player.Player}-${player.Team}`} 
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handlePlayerClick(player.Player)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-600">{player.Position}</span>
                              <span className="text-sm font-bold text-blue-700">{player.Score}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <ImageWithFallback
                                  src={getPlayerImagePath(player.Player)}
                                  alt={player.Player}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {player.Player}
                                </div>
                                <div className="text-sm text-gray-500">{player.Team}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && seasonStats && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">📈 Sezon İstatistikleri</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚽</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-900">Toplam Maç</p>
                              <p className="text-2xl font-bold text-blue-600">{seasonStats.total_matches}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🥅</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-900">Toplam Gol</p>
                              <p className="text-2xl font-bold text-green-600">{seasonStats.total_goals}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">📊</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-yellow-900">Maç Başı Ortalama</p>
                              <p className="text-2xl font-bold text-yellow-600">{seasonStats.avg_goals_per_match}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🏠</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-red-900">Ev Sahibi Galibiyeti</p>
                              <p className="text-2xl font-bold text-red-600">{seasonStats.home_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">✈️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-purple-900">Deplasman Galibiyeti</p>
                              <p className="text-2xl font-bold text-purple-600">{seasonStats.away_wins}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⚖️</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Beraberlik</p>
                              <p className="text-2xl font-bold text-gray-600">{seasonStats.draws}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaguesPage 