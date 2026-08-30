import { PrismaClient } from '@prisma/client';
import { Market, Candle } from '../domain/types';

export interface ScannerResult {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  volumeChange: number;
  priceStrength: number; // 0-1
  volumeQuality: number; // 0-1
  qualification: number; // 0-1 (overall score)
  qualified: boolean;
}

export class FrontDoorScanner {
  constructor(private prisma: PrismaClient) {}

  async qualifyMarkets(markets: Market[]): Promise<ScannerResult[]> {
    const results: ScannerResult[] = [];

    for (const market of markets) {
      const qualified = await this.qualifyMarket(market.symbol);
      results.push(qualified);
    }

    return results.sort((a, b) => b.qualification - a.qualification);
  }

  private async qualifyMarket(symbol: string): Promise<ScannerResult> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol, timeframe: '1h' },
      orderBy: { closeTime: 'desc' },
      take: 24,
    });

    if (candles.length < 24) {
      return this.createNullResult(symbol);
    }

    candles.reverse();

    const latestCandle = candles[candles.length - 1];
    const price = latestCandle.close;
    const volume24h = candles.reduce((sum, c) => sum + c.volume, 0);
    const avgVolume24h = volume24h / 24;

    // Calculate price strength (0-1)
    const priceChange = ((latestCandle.close - candles[0].open) / candles[0].open) * 100;
    const priceStrength = Math.min(Math.abs(priceChange) / 5, 1); // Normalize to 0-1

    // Calculate volume quality (0-1)
    const volumeVariance = this.calculateVariance(candles.map(c => c.volume));
    const volumeQuality = Math.min(1 - volumeVariance / 100, 1);

    // Calculate overall qualification
    const qualification = (priceStrength * 0.6 + volumeQuality * 0.4);

    return {
      symbol,
      price,
      change24h: priceChange,
      volume24h,
      volumeChange: ((candles[23].volume - candles[0].volume) / candles[0].volume) * 100,
      priceStrength,
      volumeQuality,
      qualification,
      qualified: qualification > 0.6 && volume24h > 1000000, // Threshold
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean * 100;
  }

  private createNullResult(symbol: string): ScannerResult {
    return {
      symbol,
      price: 0,
      change24h: 0,
      volume24h: 0,
      volumeChange: 0,
      priceStrength: 0,
      volumeQuality: 0,
      qualification: 0,
      qualified: false,
    };
  }
}
