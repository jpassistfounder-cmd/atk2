import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MarketDataService } from '../services/market-data.service';
import { BinanceFuturesGateway } from '../services/binance.gateway';

const router = Router();

export function setupMarketRoutes(
  prisma: PrismaClient,
  binance: BinanceFuturesGateway
): Router {
  const marketService = new MarketDataService(prisma, binance);

  router.post('/markets/initialize', async (req, res) => {
    try {
      const { symbols } = req.body;
      const markets = await marketService.initializeMarkets(symbols);
      res.json({ success: true, markets });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/markets', async (req, res) => {
    try {
      const markets = await prisma.market.findMany();
      res.json(markets);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/markets/:symbol', async (req, res) => {
    try {
      const market = await prisma.market.findUnique({
        where: { symbol: req.params.symbol },
      });
      res.json(market);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/candles/fetch', async (req, res) => {
    try {
      const { symbol, timeframe, limit } = req.body;
      const candles = await marketService.fetchAndStoreCandles(symbol, timeframe, limit);
      res.json({ success: true, count: candles.length });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/candles/:symbol', async (req, res) => {
    try {
      const { timeframe = '1h', limit = 100 } = req.query;
      const candles = await marketService.getLatestCandles(
        req.params.symbol,
        timeframe as string,
        parseInt(limit as string)
      );
      res.json(candles);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/market-stats/:symbol', async (req, res) => {
    try {
      const stats = await marketService.getMarketStats(req.params.symbol);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
