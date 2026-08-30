# Autonomous Trading Kernel (ATK)

**Paper Futures Trading System with Multi-Intelligence Decision Engine**

## Build Status

✅ **PHASE 1-3: FOUNDATION COMPLETE**
- Package.json configured
- TypeScript setup
- Prisma database schema
- Domain types & Zod schemas
- Environment configuration

🔄 **Building Phases 4-20...**

## Features

### Core Trading
- 📊 Paper trading account simulation
- 🔄 Binance Futures market data integration
- 📈 Real-time position lifecycle management
- 🛡️ Risk controls & circuit breaker
- 💰 Order execution & settlement

### Intelligence Engines (Coming)
- 🧠 Structure Engine - Chart pattern recognition
- 📊 Volume Engine - Volume/price relationship analysis
- 📈 Momentum Engine - RSI, MACD, trend analysis
- 💎 Derivatives Engine - Options data signals
- 💧 Liquidity Engine - Order book analysis

### Decision System (Coming)
- 🎯 Signal Arbitration - Multi-engine consensus
- 📝 Decision Traces - Full decision logging
- 📊 Outcome Tracking - P&L per trade
- 🧠 Learning Module - Pattern win rate calculation

### UI & Monitoring (Coming)
- 🏠 Home Dashboard
- 👁️ Watchlist Scanner
- 📊 Market Analysis
- 💼 Position Manager
- 💰 Portfolio Analytics
- ❤️ Health Monitor

## Quick Start (When Complete)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
npm run db:migrate
npm run db:seed

# Start backend
npm run dev

# Start frontend
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