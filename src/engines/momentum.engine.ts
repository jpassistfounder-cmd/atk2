import { PrismaClient } from '@prisma/client';
import { Signal } from '../domain/types';

export class MomentumEngine {
  constructor(private prisma: PrismaClient) {}

  async analyzeMomentum(symbol: string, timeframe: string = '1h'): Promise<Signal | null> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol, timeframe },
      orderBy: { closeTime: 'desc' },
      take: 50,
    });

    if (candles.length < 14) return null;
    candles.reverse();

    // RSI Calculation
    const rsi = this.calculateRSI(candles);
    const macd = this.calculateMACD(candles);

    let strength = 0;
    let side: 'LONG' | 'SHORT' = 'LONG';

    // RSI signals
    if (rsi < 30) {
      strength = (30 - rsi) / 30;
      side = 'LONG';
    } else if (rsi > 70) {
      strength = (rsi - 70) / 30;
      side = 'SHORT';
    }

    // MACD confirmation
    if (macd.histogram > 0 && side === 'LONG') strength *= 1.2;
    if (macd.histogram < 0 && side === 'SHORT') strength *= 1.2;

    strength = Math.min(strength, 1);
    const confidence = strength > 0.4 ? strength : 0;

    if (confidence < 0.3) return null;

    const signal: Signal = {
      id: '',
      symbol,
      engine: 'MOMENTUM',
      side,
      strength,
      confidence,
      timestamp: new Date(),
    };

    return signal;
  }

  private calculateRSI(candles: any[], period: number = 14): number {
    const closes = candles.map(c => c.close);
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    const rs = avgGain / (avgLoss || 1);
    return 100 - 100 / (1 + rs);
  }

  private calculateMACD(candles: any[]): { macd: number; signal: number; histogram: number } {
    const closes = candles.map(c => c.close);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([...Array(closes.length).fill(0).map((_, i) => macd)], 9);
    return { macd, signal, histogram: macd - signal };
  }

  private calculateEMA(values: number[], period: number): number {
    const k = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
    }
    return ema;
  }
}
