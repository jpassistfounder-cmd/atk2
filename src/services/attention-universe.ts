import { PrismaClient } from '@prisma/client';
import { Candle } from '../domain/types';

export interface TopMarket {
  symbol: string;
  rank: number;
  score: number;
  volume24h: number;
  priceChange: number;
  momentum: number;
}

export class AttentionUniverse {
  private readonly MAX_SYMBOLS = 50;
  private readonly TIMEFRAME = '1h';

  constructor(private prisma: PrismaClient) {}

  async getTopSymbols(): Promise<TopMarket[]> {
    const markets = await this.prisma.market.findMany();
    const scored: TopMarket[] = [];

    for (const market of markets) {
      const score = await this.scoreSymbol(market.symbol);
      scored.push({
        symbol: market.symbol,
        rank: 0,
        ...score,
      });
    }

    // Sort by score and take top 50
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, this.MAX_SYMBOLS).map((s, i) => ({ ...s, rank: i + 1 }));
  }

  private async scoreSymbol(
    symbol: string
  ): Promise<Omit<TopMarket, 'symbol' | 'rank'>> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol, timeframe: this.TIMEFRAME },
      orderBy: { closeTime: 'desc' },
      take: 24,
    });

    if (candles.length < 24) {
      return { score: 0, volume24h: 0, priceChange: 0, momentum: 0 };
    }

    candles.reverse();

    const volume24h = candles.reduce((sum, c) => c.volume + sum, 0);
    const priceChange =
      ((candles[23].close - candles[0].open) / candles[0].open) * 100;

    // Calculate momentum (RSI-like)
    const momentum = this.calculateMomentum(candles);

    // Composite score: 50% volume, 30% price change, 20% momentum
    const volumeScore = Math.min(volume24h / 10000000, 1);
    const priceScore = Math.min(Math.abs(priceChange) / 10, 1);
    const momentumScore = (momentum + 100) / 200; // Normalize to 0-1

    const score = volumeScore * 0.5 + priceScore * 0.3 + momentumScore * 0.2;

    return { score, volume24h, priceChange, momentum };
  }

  private calculateMomentum(candles: Candle[]): number {
    const gains = candles
      .slice(1)
      .map((c, i) => (c.close - candles[i].close > 0 ? c.close - candles[i].close : 0));
    const losses = candles
      .slice(1)
      .map((c, i) => (c.close - candles[i].close < 0 ? candles[i].close - c.close : 0));

    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return rsi;
  }
}
