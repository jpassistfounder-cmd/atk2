import { PrismaClient } from '@prisma/client';
import { Signal } from '../domain/types';
import { BinanceFuturesGateway } from '../services/binance.gateway';

export class LiquidityEngine {
  constructor(
    private prisma: PrismaClient,
    private binance: BinanceFuturesGateway
  ) {}

  async analyzeLiquidity(symbol: string): Promise<Signal | null> {
    try {
      const orderBook = await this.binance.getOrderBook(symbol, 20);
      
      const bids = orderBook.bids as [string, string][];
      const asks = orderBook.asks as [string, string][];

      // Calculate bid/ask imbalance
      const bidVolume = bids.reduce((sum, [_, qty]) => sum + parseFloat(qty), 0);
      const askVolume = asks.reduce((sum, [_, qty]) => sum + parseFloat(qty), 0);
      const imbalance = (bidVolume - askVolume) / (bidVolume + askVolume);

      // Calculate spread
      const bestAsk = parseFloat(asks[0][0]);
      const bestBid = parseFloat(bids[0][0]);
      const spread = (bestAsk - bestBid) / bestBid;

      let strength = Math.min(Math.abs(imbalance), 1);
      let side: 'LONG' | 'SHORT' = imbalance > 0 ? 'LONG' : 'SHORT';
      let confidence = strength > 0.2 ? strength * 0.8 : 0; // Lower confidence for liquidity

      if (confidence < 0.3) return null;

      const signal: Signal = {
        id: '',
        symbol,
        engine: 'LIQUIDITY',
        side,
        strength,
        confidence,
        timestamp: new Date(),
      };

      return signal;
    } catch (error) {
      console.error(`Failed to analyze liquidity for ${symbol}:`, error);
      return null;
    }
  }
}
