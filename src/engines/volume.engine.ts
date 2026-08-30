import { PrismaClient } from '@prisma/client';
import { Signal } from '../domain/types';

export class VolumeEngine {
  constructor(private prisma: PrismaClient) {}

  async analyzeVolume(symbol: string, timeframe: string = '1h'): Promise<Signal | null> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol, timeframe },
      orderBy: { closeTime: 'desc' },
      take: 50,
    });

    if (candles.length < 20) return null;
    candles.reverse();

    const recent = candles.slice(-20);
    const avgVolume = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;
    const lastVolume = recent[recent.length - 1].volume;
    const volumeRatio = lastVolume / avgVolume;

    // Volume strength based on ratio
    const strength = Math.min((volumeRatio - 1) / 2, 1);
    const confidence = strength > 0.5 ? Math.min(strength, 1) : 0;

    if (confidence < 0.3) return null;

    // Direction based on price and volume
    const lastCandle = recent[recent.length - 1];
    const prevCandle = recent[recent.length - 2];
    const side = lastCandle.close > prevCandle.close ? 'LONG' : 'SHORT';

    const signal: Signal = {
      id: '',
      symbol,
      engine: 'VOLUME',
      side,
      strength,
      confidence,
      timestamp: new Date(),
    };

    return signal;
  }
}
