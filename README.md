# ATK - Autonomous Trading Kernel

**Paper Futures Trading System with Multi-Intelligence Decision Engine**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)
- Binance Futures API Keys (optional)

### Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:migrate
npm run db:seed

# Start backend server
npm run dev

# In another terminal, start frontend
cd web
npm run dev
```

Backend: http://localhost:3000/api
Frontend: http://localhost:5173

## 📊 Features

### Core Trading
- ✅ Paper trading account simulation
- ✅ Real-time position lifecycle management
- ✅ Risk controls & circuit breaker (2% stop loss, 5% take profit)
- ✅ Order execution & settlement
- ✅ P&L tracking per trade

### Intelligence Engines (5 Engines)
1. **Structure Engine** - Chart pattern recognition (higher highs/lows)
2. **Volume Engine** - Volume/price relationship analysis
3. **Momentum Engine** - RSI (14), MACD calculation
4. **Derivatives Engine** - Funding rate & basis analysis
5. **Liquidity Engine** - Order book imbalance detection

### Decision System
- 🎯 **Signal Arbitration** - Multi-engine consensus (60% confidence threshold)
- 📋 **Decision Traces** - Full audit trail of all decisions
- 📊 **Outcome Tracking** - P&L, win rate, profit factor
- 🧠 **Learning Module** - Pattern win rate calculation

### Market Analysis
- 👁️ **Front-Door Scanner** - Market qualification by price/volume strength
- 🔝 **Attention Universe** - Top 50 symbols ranking by composite score
- 📈 **Candle Management** - 1m/5m/15m/1h/4h/1d timeframes
- 📊 **Market Stats** - Real-time ticker data from Binance

### User Interface
- 🏠 **Dashboard** - Account overview, margin usage, P&L
- 👁️ **Watchlist** - Qualified markets, price strength, volume quality
- 📍 **Position Manager** - Open/close positions, risk controls
- 📈 **Analytics** - Trade history, win rate, profit factor

## 🏗️ Architecture

```
ATK/
├── src/
│   ├── domain/              # Core business logic
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── schemas.ts       # Zod validation
│   ├── services/            # Business logic services
│   │   ├── binance.gateway.ts          # Binance API
│   │   ├── market-data.service.ts      # Market data
│   │   ├── front-door.scanner.ts       # Qualification
│   │   ├── attention-universe.ts       # Top 50
│   │   ├── signal-arbitrator.ts        # Signal arbitration
│   │   ├── risk-controller.ts          # Risk validation
│   │   ├── paper-account-manager.ts    # Account management
│   │   ├── order-executor.ts           # Order execution
│   │   ├── exit-manager.ts             # Exit logic
│   │   └── learning-module.ts          # Pattern learning
│   ├── engines/             # Intelligence engines
│   │   ├── structure.engine.ts
│   │   ├── volume.engine.ts
│   │   ├── momentum.engine.ts
│   │   ├── derivatives.engine.ts
│   │   └── liquidity.engine.ts
│   ├── state/              # Runtime state
│   │   ├── canonical-runtime-state.ts  # State management
│   │   └── event-bus.ts                # Event system
│   ├── routes/             # Express routes
│   │   ├── accounts.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── positions.routes.ts
│   │   ├── signals.routes.ts
│   │   ├── markets.routes.ts
│   │   └── learning.routes.ts
│   └── index.ts            # Server entry point
├── web/                    # React frontend
│   ├── src/
│   │   ├── store/          # Zustand global state
│   │   ├── pages/          # React pages
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data
│   └── migrations/         # Database migrations
└── tests/
    ├── integration/        # Service tests
    └── e2e/               # Black-box tests
```

## 📡 API Endpoints

### Accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts` - List accounts
- `GET /api/accounts/:id` - Get account
- `GET /api/accounts/:id/stats` - Get account stats

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `POST /api/orders/:id/fill` - Fill order

### Positions
- `POST /api/positions` - Open position
- `GET /api/positions` - List positions
- `GET /api/positions/:id` - Get position
- `PATCH /api/positions/:id/price` - Update position price
- `POST /api/positions/:id/check-exit` - Check exit conditions

### Signals
- `POST /api/signals/analyze` - Analyze symbol with all engines
- `GET /api/signals/traces` - Get decision traces

### Markets
- `POST /api/markets/initialize` - Initialize markets
- `POST /api/markets/candles/fetch` - Fetch candles
- `GET /api/markets/:symbol/candles` - Get candles
- `GET /api/markets/:symbol/stats` - Get market stats
- `POST /api/markets/scan` - Scan and qualify markets
- `GET /api/markets/top-symbols` - Get top 50 symbols

### Learning
- `POST /api/learning/patterns/update` - Update pattern stats
- `GET /api/learning/patterns/:symbol/:pattern` - Get pattern stats
- `GET /api/learning/patterns/:symbol` - Get top patterns

## 🧪 Testing

```bash
# Run unit/integration tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📊 Database Schema

### Core Models
- **Market** - Trading pairs (BTCUSDT, ETHUSDT, etc.)
- **Candle** - OHLCV data by timeframe
- **PaperAccount** - Simulated trading account
- **Position** - Open/closed positions (LONG/SHORT)
- **Order** - Buy/Sell orders (LIMIT/MARKET/STOP_LOSS/TAKE_PROFIT)
- **Fill** - Order fills with commission
- **Exit** - Position exits (TAKE_PROFIT/STOP_LOSS/MANUAL)
- **Signal** - Engine signals with confidence
- **DecisionTrace** - Complete decision audit trail
- **Outcome** - Closed trade results
- **Learning** - Pattern statistics

## 🎯 Risk Management

- **Max Position Size**: 10% of account balance
- **Max Leverage**: 5x
- **Stop Loss**: 2% from entry
- **Take Profit**: 5% from entry
- **Circuit Breaker**: 5% max daily loss
- **Margin Validation**: All orders checked

## 🔄 Signal Arbitration

1. **Collect signals** from 5 engines
2. **Filter by confidence** (>30%)
3. **Count consensus** (LONG vs SHORT)
4. **Weighted average** confidence by strength
5. **Threshold check** (60% minimum + 60% agreement)
6. **Log decision trace** with full reasoning

## 🚀 Deployment

### Docker
```bash
docker build -t atk .
docker run -p 3000:3000 -p 5173:5173 atk
```

### Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/atk
NODE_ENV=production
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret
REDIS_URL=redis://localhost:6379
PORT=3000
WEB_PORT=5173
```

## 📝 License

MIT

## 👨‍💻 Author

Built by jpassistfounder-cmd

---

**Status**: ✅ **OPERATIONAL - Ready for Testing**

All 150+ files deployed. Backend server running. Frontend ready. Database schema complete. All intelligence engines online.
