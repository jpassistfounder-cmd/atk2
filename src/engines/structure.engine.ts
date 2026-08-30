import { PrismaClient } from '@prisma/client';
import { Candle, Signal } from '../domain/types';

export class StructureEngine {
  constructor(private prisma: PrismaClient) {}

  async analyzeStructure(symbol: string, timeframe: string = '1h'): Promise<Signal | null> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol, timeframe },
      orderBy: { closeTime: 'desc' },
      take: 50,
    });

    if (candles.length < 10) return null;
    candles.reverse();

    // Pattern: Higher Highs and Higher Lows = Uptrend
    const recent = candles.slice(-10);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);

    let uptrend = 0;
    let downtrend = 0;

    for (let i = 1; i < highs.length; i++) {
      if (highs[i] > highs[i - 1] && lows[i] > lows[i - 1]) uptrend++;
      if (highs[i] < highs[i - 1] && lows[i] < lows[i - 1]) downtrend++;
    }

    const strength = Math.max(uptrend, downtrend) / 9;
    const confidence = strength > 0.6 ? Math.min(strength, 1) : 0;

    if (confidence < 0.3) return null;

    const signal: Signal = {
      id: '',
      symbol,
      engine: 'STRUCTURE',
      side: uptrend > downtrend ? 'LONG' : 'SHORT',
      strength: strength,
      confidence: confidence,
      timestamp: new Date(),
    };

    return signal;
  }
}
