import React, { useState } from 'react'
import { Card, Row, Col, Typography, Statistic, Select, Table, Spin, Alert } from 'antd'
import { TrophyOutlined, TeamOutlined, CrownOutlined, DollarCircleOutlined } from '@ant-design/icons'
import { useLeagues, useSeasons, useLeagueStandings, usePlayerStats } from '../hooks/useLeagues'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const { Title } = Typography
const { Option } = Select

const DashboardPage: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<number>()
  const [selectedSeason, setSelectedSeason] = useState<number>()

  const { data: leagues, isLoading: leaguesLoading } = useLeagues()
  const { data: seasons, isLoading: seasonsLoading } = useSeasons(selectedLeague || 0)
  const { data: standings, isLoading: standingsLoading } = useLeagueStandings(selectedSeason || 0)
  const { data: players, isLoading: playersLoading } = usePlayerStats(selectedSeason || 0, undefined, 10)

  const standingsColumns = [
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Played',
      dataIndex: 'played',
      key: 'played',
      width: 80,
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      sorter: (a: any, b: any) => a.points - b.points,
    },
    {
      title: 'GD',
      dataIndex: 'goal_difference',
      key: 'goal_difference',
      width: 80,
    },
    {
      title: 'Form',
      dataIndex: 'form',
      key: 'form',
      width: 100,
      render: (form: string) => (
        <span className="font-mono text-sm">{form || 'N/A'}</span>
      ),
    },
  ]

  const playersColumns = [
    {
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: 80,
    },
    {
      title: 'Rating',
      dataIndex: 'avg_rating',
      key: 'avg_rating',
      width: 80,
      render: (rating: number) => rating?.toFixed(1) || 'N/A',
    },
    {
      title: 'Goals',
      dataIndex: 'goals',
      key: 'goals',
      width: 80,
    },
    {
      title: 'Assists',
      dataIndex: 'assists',
      key: 'assists',
      width: 80,
    },
  ]

  const topStandings = standings?.slice(0, 5) || []

  if (leaguesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="mb-6">Dashboard</Title>
        
        {/* League & Season Selection */}
        <Card className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <label className="block text-sm font-medium mb-2">Select League</label>
              <Select
                placeholder="Choose a league"
                style={{ width: '100%' }}
                value={selectedLeague}
                onChange={setSelectedLeague}
                loading={leaguesLoading}
              >
                {leagues?.map((league) => (
                  <Option key={league.id} value={league.id}>
                    {league.name} ({league.country})
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={12}>
              <label className="block text-sm font-medium mb-2">Select Season</label>
              <Select
                placeholder="Choose a season"
                style={{ width: '100%' }}
                value={selectedSeason}
                onChange={setSelectedSeason}
                loading={seasonsLoading}
                disabled={!selectedLeague}
              >
                {seasons?.map((season) => (
                  <Option key={season.id} value={season.id}>
                    {season.season} ({season.match_count} matches)
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Points"
                value={1234}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Leagues"
                value={leagues?.length || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Teams"
                value={standings?.length || 0}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Token Balance"
                value={150.5}
                prefix={<DollarCircleOutlined />}
                suffix="CHZ"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {selectedSeason && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="League Standings (Top 5)" className="h-full">
                {standingsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : topStandings.length > 0 ? (
                  <Table
                    dataSource={topStandings}
                    columns={standingsColumns}
                    pagination={false}
                    size="small"
                    rowKey={(record) => record.team}
                  />
                ) : (
                  <Alert message="No standings data available" type="info" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top Players" className="h-full">
                {playersLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : players && players.length > 0 ? (
                  <Table
                    dataSource={players}
                    columns={playersColumns}
                    pagination={false}
                    size="small"
                    rowKey={(record) => `${record.player}-${record.team}`}
                  />
                ) : (
                  <Alert message="No player data available" type="info" />
                )}
              </Card>
            </Col>
          </Row>
        )}

        {!selectedSeason && (
          <Alert
            message="Select League and Season"
            description="Please select a league and season from the dropdowns above to view dashboard data."
            type="info"
            showIcon
            className="text-center"
          />
        )}
      </div>
    </div>
  )
}

export default DashboardPage 