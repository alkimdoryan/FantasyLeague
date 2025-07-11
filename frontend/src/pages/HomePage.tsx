import React from 'react'
import { Button, Card, Row, Col, Typography, Space } from 'antd'
import { TrophyOutlined, LineChartOutlined, TeamOutlined, RocketOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Title level={1} className="text-white mb-4">
            Welcome to Socios Fantasy League
          </Title>
          <Paragraph className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Create your ultimate fantasy football team using Socios Fan Tokens on the Chiliz Network.
            Compete with players worldwide and earn rewards!
          </Paragraph>
          <Space size="large">
            <Button type="primary" size="large" className="bg-white text-primary-600 hover:bg-gray-100">
              Get Started
            </Button>
            <Button ghost size="large">
              Learn More
            </Button>
          </Space>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2}>Why Choose Socios Fantasy League?</Title>
            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of fantasy sports with blockchain technology and fan tokens.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} lg={6}>
              <Card className="text-center h-full">
                <div className="mb-4">
                  <TrophyOutlined className="text-4xl text-primary-600" />
                </div>
                <Title level={4}>Compete & Win</Title>
                <Paragraph>
                  Join leagues and compete against other fantasy managers. Win prizes and climb the leaderboards.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Card className="text-center h-full">
                <div className="mb-4">
                  <LineChartOutlined className="text-4xl text-primary-600" />
                </div>
                <Title level={4}>Analytics & Insights</Title>
                <Paragraph>
                  Get detailed player statistics, performance analytics, and AI-powered insights to make better decisions.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Card className="text-center h-full">
                <div className="mb-4">
                  <TeamOutlined className="text-4xl text-primary-600" />
                </div>
                <Title level={4}>Fan Token Integration</Title>
                <Paragraph>
                  Use your Socios Fan Tokens to join leagues and unlock exclusive features in the ecosystem.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Card className="text-center h-full">
                <div className="mb-4">
                  <RocketOutlined className="text-4xl text-primary-600" />
                </div>
                <Title level={4}>Powered by Chiliz</Title>
                <Paragraph>
                  Built on the Chiliz Network for fast, secure, and cost-effective blockchain transactions.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="text-white mb-4">
            Ready to Start Your Fantasy Journey?
          </Title>
          <Paragraph className="text-xl text-blue-100 mb-8">
            Connect your wallet and create your first fantasy team today!
          </Paragraph>
          <Button type="primary" size="large" className="bg-white text-primary-600 hover:bg-gray-100">
            Connect Wallet
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage 