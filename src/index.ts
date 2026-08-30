import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { BinanceFuturesGateway } from './services/binance.gateway';
import { CanonicalRuntimeState } from './state/canonical-runtime-state';
import { EventBus } from './state/event-bus';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import { createAccountRoutes } from './routes/accounts.routes';
import { createOrderRoutes } from './routes/orders.routes';
import { createPositionRoutes } from './routes/positions.routes';
import { createSignalRoutes } from './routes/signals.routes';
import { createMarketRoutes } from './routes/markets.routes';
import { createLearningRoutes } from './routes/learning.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const binance = new BinanceFuturesGateway(
  process.env.BINANCE_API_KEY || '',
  process.env.BINANCE_API_SECRET || ''
);
const runtimeState = new CanonicalRuntimeState(prisma);
const eventBus = new EventBus();

// Health check
app.get('/health', (req: Request, res: Response) => {
  const health = runtimeState.getHealth();
  res.json({ status: health.status, lastUpdate: health.lastUpdate });
});

// State endpoint
app.get('/state', (req: Request, res: Response) => {
  res.json(runtimeState.getState());
});

// Register routes
app.use('/api', createAccountRoutes(prisma));
app.use('/api', createOrderRoutes(prisma));
app.use('/api', createPositionRoutes(prisma));
app.use('/api', createSignalRoutes(prisma, binance));
app.use('/api', createMarketRoutes(prisma, binance));
app.use('/api', createLearningRoutes(prisma));

// Error handling
app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  runtimeState.setHealthStatus('DEGRADED', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize and start
async function start() {
  try {
    await runtimeState.initialize();
    console.log('Runtime state initialized');

    app.listen(port, () => {
      console.log(`ATK Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app, prisma, binance, runtimeState, eventBus };
