# CCTP USDC Transfer Application

## Overview

This is a modern web application for bulk USDC transfers using Circle's Cross-Chain Transfer Protocol (CCTP) V2. The application enables users to send USDC to multiple recipients across different blockchain networks in a single transaction flow, supporting both Fast Transfer and Standard Transfer methods.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: Zustand for global state management with persistence
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: Vite for development server and hot module replacement
- **Build**: ESBuild for production builds

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL with connect-pg-simple for session management

## Key Components

### Wallet Integration
- **Provider**: MetaMask/Web3 wallet connection
- **Network Management**: Multi-chain support with automatic network switching
- **Balance Tracking**: Real-time USDC balance monitoring

### CCTP Integration
- **Transfer Methods**: Fast Transfer (seconds) and Standard Transfer (13-19 minutes)
- **Multi-chain Support**: Ethereum, Polygon, Arbitrum, Base, OP Mainnet, Avalanche
- **Transaction Tracking**: Real-time status updates (burning, attesting, minting)

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Theme**: Consistent dark mode styling throughout
- **Component Library**: Comprehensive UI components from Radix UI
- **Form Management**: React Hook Form with Zod validation

### State Management
- **Global Store**: Zustand with persistence for user preferences
- **Local Storage**: Automatic persistence of wallet state and settings
- **Real-time Updates**: WebSocket-like updates for transaction status

## Data Flow

1. **Wallet Connection**: User connects MetaMask wallet and authorizes the application
2. **Recipient Management**: User adds multiple recipients with addresses, chains, and amounts
3. **Fee Estimation**: System calculates network fees and CCTP transfer costs
4. **Transfer Execution**: Bulk transfer initiated with CCTP burn/mint process
5. **Status Tracking**: Real-time updates on transaction progress across chains
6. **Completion**: Final confirmation and transaction history updates

## External Dependencies

### Blockchain Infrastructure
- **CCTP Contracts**: Circle's Cross-Chain Transfer Protocol smart contracts
- **USDC Token**: Native USDC contracts on supported chains
- **Web3 Provider**: MetaMask or compatible Web3 wallet
- **RPC Endpoints**: Blockchain network connections (Infura, Alchemy, etc.)

### Third-party Services
- **Circle API**: For transaction attestation and verification
- **Neon Database**: Serverless PostgreSQL hosting
- **Block Explorers**: For transaction verification and links

### Development Tools
- **Vite**: Development server and build tool
- **Replit**: Development environment integration
- **TypeScript**: Type safety and development experience

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Development Tools**: Replit integration for cloud development

### Production Build
- **Frontend**: Static assets built with Vite
- **Backend**: Node.js server bundled with ESBuild
- **Database**: Migrations run with Drizzle Kit
- **Deployment**: Single-process deployment with static file serving

### Environment Configuration
- **Database**: PostgreSQL connection string required
- **Network**: Mainnet/Testnet configuration toggle
- **API Keys**: Blockchain RPC endpoints and Circle API credentials

## Changelog

```
Changelog:
- July 02, 2025: Initial setup with CCTP V2 bulk transfer functionality
- July 02, 2025: Fixed same-domain transfer validation and network change error handling
- July 02, 2025: Added 8 additional testnet chains for comprehensive cross-chain testing:
  • Avalanche Fuji (domain 1)
  • OP Sepolia (domain 2) 
  • Polygon Amoy (domain 7)
  • Linea Sepolia (domain 9)
  • Sonic Testnet (domain 10)
  • Unichain Sepolia (domain 11)
  • World Chain Sepolia (domain 12)
  Total testnet chains: 11 (previously 3)
- July 02, 2025: Enhanced auto-updating system with real-time UI updates:
  • Auto-refresh wallet balance every 10 seconds when enabled
  • Real-time transaction status monitoring every 15 seconds  
  • Live activity feed showing wallet, balance, and transaction events
  • System status dashboard with uptime and health monitoring
  • Enhanced recipient status badges with animated icons and timestamps
  • Connection status indicators with visual feedback
  • All components now update their own states independently
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```