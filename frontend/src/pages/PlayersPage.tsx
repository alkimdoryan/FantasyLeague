import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const PlayersPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="mb-6">Players</Title>
        <Card>
          <p>Players content will be here</p>
        </Card>
      </div>
    </div>
  )
}

export default PlayersPage 