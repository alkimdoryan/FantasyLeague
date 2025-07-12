import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import LeaguesPage from './pages/LeaguesPage'
import PlayersPage from './pages/PlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import { WalletProvider } from './contexts/WalletContext'
import './App.css'

const { Content } = Layout

// Basit takım detay sayfası bileşeni
const TeamDetailPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🏟️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Takım Detay Sayfası</h1>
        <p className="text-gray-600">Bu sayfa yakında gelecek...</p>
      </div>
    </div>
  )
}

function App() {
  console.log('🚀 6. App component render ediliyor')
  
  return (
    <WalletProvider>
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/player/:seasonId/:playerName" element={<PlayerDetailPage />} />
            <Route path="/team/:seasonId/:teamName" element={<TeamDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Content>
      </Layout>
    </WalletProvider>
  )
}

export default App 
        <Content className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/player/:seasonId/:playerName" element={<PlayerDetailPage />} />
            <Route path="/team/:seasonId/:teamName" element={<TeamDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Content>
      </Layout>
    </WalletProvider>
  )
}

export default App 
        <Content className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/player/:seasonId/:playerName" element={<PlayerDetailPage />} />
            <Route path="/team/:seasonId/:teamName" element={<TeamDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Content>
      </Layout>
    </WalletProvider>
  )
}

export default App 
        <Content className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/player/:seasonId/:playerName" element={<PlayerDetailPage />} />
            <Route path="/team/:seasonId/:teamName" element={<TeamDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Content>
      </Layout>
    </WalletProvider>
  )
}

export default App 