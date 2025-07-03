# Cross-Chain Pay

A React application for managing bulk payments of USDC across different blockchain networks using Circle's Cross-Chain Transfer Protocol (CCTP).

## Features

- Connect cryptocurrency wallet
- Select different transfer methods (same-chain, fast cross-chain, standard cross-chain)
- Manage multiple payment recipients across different networks
- Execute bulk payments to all recipients
- Monitor transaction status and payment confirmations
- Support for both mainnet and testnet environments

## Supported Networks

- Ethereum
- Polygon
- Arbitrum
- Base
- Optimism
- Avalanche
- Linea

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fcross-chain-pay)

### Manual Deployment

1. Fork or clone this repository
2. Sign up or log in to [Vercel](https://vercel.com)
3. Create a new project and import your repository
4. Configure environment variables (if needed)
5. Deploy!

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Infura API Key for RPC Connections
VITE_INFURA_API_KEY=your_infura_key_here

# Environment mode
VITE_ENVIRONMENT=production # or testnet
```

## License

MIT 