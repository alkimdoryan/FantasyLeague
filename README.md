# Socios Fantasy League

A comprehensive fantasy football application built on the Chiliz Network, utilizing Socios Fan Tokens for an immersive Web3 gaming experience.

## 🚀 Features

- **Fan Token Integration**: Real-time Socios Fan Token balance tracking and price monitoring
- **Fantasy League Management**: Create and manage fantasy teams with weekly, seasonal, and special event modes
- **Performance Analytics**: Comprehensive player and team performance analysis with interactive dashboards
- **AI Assistant**: Intelligent chatbot for financial and sports-related queries
- **Admin Panel**: Complete administrative interface for system management
- **Web3 Integration**: MetaMask and WalletConnect support for seamless blockchain interaction

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Ant Design** for UI components
- **Recharts** for data visualization
- **Ethers.js** for blockchain interaction

### Backend
- **Node.js** with TypeScript
- **Express.js** for API development
- **SQLite** database with Sequelize ORM
- **Ethers.js** for smart contract interaction
- **Node-cron** for scheduled tasks
- **Winston** for logging

### Blockchain
- **Chiliz Network** (Spicy Testnet)
- **Solidity** smart contracts
- **IPFS** for decentralized data storage

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Chiliz Network (Spicy Testnet) setup

## 🏗 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd socios-fantasy-league
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Environment Setup
Create `.env` files in both frontend and backend directories using the provided `.env.example` templates.

### 4. Database Setup
```bash
cd backend
npm run db:create
npm run migrate
npm run seed
```

### 5. Start Development Servers
```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:frontend  # Frontend: http://localhost:3000
npm run dev:backend   # Backend: http://localhost:3001
```

## 📁 Project Structure

```
socios-fantasy-league/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── migrations/         # Database migrations
├── contracts/              # Smart contracts
└── docs/                   # Documentation
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run test` - Run tests for both applications
- `npm run start` - Start production server
- `npm run install:all` - Install all dependencies

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Fantasy League
- `GET /api/leagues` - Get all leagues
- `POST /api/leagues` - Create new league
- `POST /api/leagues/:id/join` - Join a league
- `GET /api/leagues/:id/leaderboard` - Get league leaderboard

### Players & Teams
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player details
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details

### Token Management
- `GET /api/tokens/balances` - Get user token balances
- `GET /api/tokens/prices` - Get token prices

## 🔐 Smart Contracts

### FanTokenRegistry
- Manages whitelisted Socios Fan Tokens
- Provides token validation functionality

### FantasyLeagueManager
- Handles league creation and management
- Manages user registrations and team formations
- Facilitates reward distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chiliz Network for blockchain infrastructure
- Socios for Fan Token ecosystem
- React and Node.js communities for excellent tooling

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ for the Chiliz & Socios ecosystem 