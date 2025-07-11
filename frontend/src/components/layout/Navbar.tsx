import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, WalletOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Header } = Layout

const Navbar: React.FC = () => {
  const location = useLocation()

  // Mock user data - replace with actual user context
  const user = {
    name: 'John Doe',
    avatar: null,
    isConnected: false,
  }

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/dashboard',
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/leagues',
      label: <Link to="/leagues">Leagues</Link>,
    },
    {
      key: '/players',
      label: <Link to="/players">Players</Link>,
    },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => {
        // Handle logout
        console.log('Logout clicked')
      },
    },
  ]

  const handleConnectWallet = () => {
    // Handle wallet connection
    console.log('Connect wallet clicked')
  }

  return (
    <Header className="bg-white shadow-sm border-b border-gray-200 px-4">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-chiliz-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Socios Fantasy</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="flex-1 justify-center border-b-0 bg-transparent"
        />

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user.isConnected ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Button type="text" className="flex items-center space-x-2">
                <Avatar
                  size="small"
                  src={user.avatar}
                  icon={!user.avatar && <UserOutlined />}
                />
                <span className="hidden sm:inline">{user.name}</span>
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Button
                type="primary"
                icon={<WalletOutlined />}
                onClick={handleConnectWallet}
                className="flex items-center"
              >
                Connect Wallet
              </Button>
            </Space>
          )}
        </div>
      </div>
    </Header>
  )
}

export default Navbar 