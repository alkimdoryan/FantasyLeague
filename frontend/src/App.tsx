import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import LeaguesPage from './pages/LeaguesPage'
import PlayersPage from './pages/PlayersPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import { WalletProvider } from './contexts/WalletContext'
import './App.css'

const { Content } = Layout

function App() {
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Content>
      </Layout>
    </WalletProvider>
  )
}

export default App 