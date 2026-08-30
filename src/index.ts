import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { BinanceFuturesGateway } from './services/binance.gateway';
import { CanonicalRuntimeState } from './state/canonical-runtime-state';
import { setupMarketRoutes } from './routes/market.routes';
import { setupAccountRoutes } from './routes/account.routes';
import { setupTradingRoutes } from './routes/trading.routes';
import { setupAnalyticsRoutes } from './routes/analytics.routes';
import { setupHealthRoutes } from './routes/health.routes';

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT || 3000;

// Initialize Binance gateway
const binanceApiKey = process.env.BINANCE_API_KEY || '';
const binanceApiSecret = process.env.BINANCE_API_SECRET || '';
const binance = new BinanceFuturesGateway(binanceApiKey, binanceApiSecret);

// Initialize runtime state
const runtimeState = new CanonicalRuntimeState(prisma);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize runtime state
runtimeState.initialize().catch(error => {
  console.error('Failed to initialize runtime state:', error);
  process.exit(1);
});

// Routes
app.use('/api', setupMarketRoutes(prisma, binance));
app.use('/api', setupAccountRoutes(prisma));
app.use('/api', setupTradingRoutes(prisma));
app.use('/api', setupAnalyticsRoutes(prisma));
app.use('/api', setupHealthRoutes(runtimeState));

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 ATK Backend running on port ${port}`);
  console.log(`📊 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
