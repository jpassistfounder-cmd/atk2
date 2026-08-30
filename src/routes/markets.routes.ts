import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MarketDataService } from '../services/market-data.service';
import { FrontDoorScanner } from '../services/front-door.scanner';
import { AttentionUniverse } from '../services/attention-universe';
import { BinanceFuturesGateway } from '../services/binance.gateway';

export function createMarketRoutes(
  prisma: PrismaClient,
  binance: BinanceFuturesGateway
): Router {
  const router = express.Router();
  const marketDataService = new MarketDataService(prisma, binance);
  const scanner = new FrontDoorScanner(prisma);
  const universe = new AttentionUniverse(prisma);

  // Initialize markets
  router.post('/markets/initialize', async (req: Request, res: Response) => {
    try {
      const { symbols } = req.body;
      const markets = await marketDataService.initializeMarkets(symbols);
      res.json({ count: markets.length, markets });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Fetch candles
  router.post('/markets/candles/fetch', async (req: Request, res: Response) => {
    try {
      const { symbol, timeframe, limit } = req.body;
      const candles = await marketDataService.fetchAndStoreCandles(symbol, timeframe, limit);
      res.json({ count: candles.length, candles });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get candles
  router.get('/markets/:symbol/candles', async (req: Request, res: Response) => {
    try {
      const { timeframe, limit } = req.query;
      const candles = await marketDataService.getLatestCandles(
        req.params.symbol,
        (timeframe as string) || '1h',
        parseInt((limit as string) || '100')
      );
      res.json(candles);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get market stats
  router.get('/markets/:symbol/stats', async (req: Request, res: Response) => {
    try {
      const stats = await marketDataService.getMarketStats(req.params.symbol);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Scan markets
  router.post('/markets/scan', async (req: Request, res: Response) => {
    try {
      const markets = await prisma.market.findMany();
      const results = await scanner.qualifyMarkets(markets);
      const qualified = results.filter(r => r.qualified);
      res.json({ total: results.length, qualified: qualified.length, results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get top symbols
  router.get('/markets/top-symbols', async (req: Request, res: Response) => {
    try {
      const topSymbols = await universe.getTopSymbols();
      res.json(topSymbols);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
