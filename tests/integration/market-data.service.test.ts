import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { MarketDataService } from '../services/market-data.service';
import { BinanceFuturesGateway } from '../services/binance.gateway';

describe('MarketDataService', () => {
  let prisma: PrismaClient;
  let service: MarketDataService;
  let binance: BinanceFuturesGateway;

  beforeAll(async () => {
    prisma = new PrismaClient();
    binance = new BinanceFuturesGateway('', '');
    service = new MarketDataService(prisma, binance);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should initialize markets from Binance', async () => {
    const symbols = ['BTCUSDT', 'ETHUSDT'];
    const markets = await service.initializeMarkets(symbols);
    expect(markets).toBeDefined();
    expect(markets.length).toBeGreaterThan(0);
  });

  it('should fetch and store candles', async () => {
    const symbol = 'BTCUSDT';
    const candles = await service.fetchAndStoreCandles(symbol, '1h', 10);
    expect(candles).toBeDefined();
    expect(Array.isArray(candles)).toBe(true);
  });

  it('should get latest candles', async () => {
    const symbol = 'BTCUSDT';
    const candles = await service.getLatestCandles(symbol, '1h', 10);
    expect(Array.isArray(candles)).toBe(true);
  });
});
