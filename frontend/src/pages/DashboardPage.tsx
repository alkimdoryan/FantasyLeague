import React from 'react'
import { Card, Row, Col, Typography, Statistic } from 'antd'
import { TrophyOutlined, TeamOutlined, CrownOutlined, DollarCircleOutlined } from '@ant-design/icons'

const { Title } = Typography

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="mb-6">Dashboard</Title>
        
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
                value={3}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Rank"
                value={45}
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

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Recent Performance">
              <p>Performance chart will be here</p>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Active Teams">
              <p>Teams list will be here</p>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default DashboardPage 