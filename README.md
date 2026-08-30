# Autonomous Trading Kernel (ATK)

**Paper Futures Trading System with Multi-Intelligence Decision Engine**

## Features

### Core Trading
- ✅ Paper trading account simulation
- ✅ Binance Futures market data integration
- ✅ Real-time position lifecycle management
- ✅ Risk controls & circuit breaker
- ✅ Order execution & settlement

### Intelligence Engines
- 🧠 **Structure Engine** - Chart pattern recognition
- 📊 **Volume Engine** - Volume/price relationship analysis
- 📈 **Momentum Engine** - RSI, MACD, trend analysis
- 💎 **Derivatives Engine** - Options data signals
- 💧 **Liquidity Engine** - Order book analysis

### Decision System
- 🎯 **Signal Arbitration** - Multi-engine consensus
- 📍 **Decision Traces** - Full decision logging
- 📈 **Outcome Tracking** - P&L per trade
- 🧮 **Learning Module** - Pattern win rate calculation

### UI & Monitoring
- 🏠 Home Dashboard
- 👁️ Watchlist Scanner
- 📊 Market Analysis
- 💼 Position Manager
- 💰 Portfolio Analytics
- ❤️ Health Monitor

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Binance API keys

# Setup database
npm run db:migrate
npm run db:seed

# Start backend
npm run dev

# Start web frontend (in another terminal)
npm run web
```

## Architecture

```
ATK/
├── src/
│   ├── domain/          # Core business logic
│   ├── services/        # Market, intelligence, trading
│   ├── engines/         # 5 intelligence engines
│   ├── state/          # Canonical runtime state
│   ├── routes/         # Express routes
│   └── index.ts        # Server entry point
├── web/
│   ├── src/
│   │   ├── pages/      # React pages
│   │   ├── components/ # React components
│   │   └── store/      # Zustand state
│   └── vite.config.ts
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # DB migrations
└── tests/
    ├── integration/    # Service tests
    └── e2e/           # Black-box tests
```

## Development

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Status

🚀 **Phase 1: Foundation** - COMPLETE
- Package configuration
- TypeScript setup
- Database schema

⏳ **Phases 2-20**: Building...