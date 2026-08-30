import { PrismaClient } from '@prisma/client';
import { Signal, DecisionTrace } from '../domain/types';

export interface SignalArbitration {
  symbol: string;
  decision: 'ENTER_LONG' | 'ENTER_SHORT' | 'EXIT' | 'HOLD';
  confidence: number;
  signals: Signal[];
  reasoning: Record<string, any>;
}

export class SignalArbitrator {
  private readonly CONFIDENCE_THRESHOLD = 0.6;
  private readonly MIN_SIGNALS = 2;

  constructor(private prisma: PrismaClient) {}

  async arbitrate(symbol: string, signals: Signal[]): Promise<SignalArbitration> {
    // Filter by confidence
    const validSignals = signals.filter(s => s.confidence > 0.3);

    if (validSignals.length < this.MIN_SIGNALS) {
      return {
        symbol,
        decision: 'HOLD',
        confidence: 0,
        signals: validSignals,
        reasoning: { reason: 'Insufficient signal agreement' },
      };
    }

    // Count long vs short
    const longs = validSignals.filter(s => s.side === 'LONG');
    const shorts = validSignals.filter(s => s.side === 'SHORT');

    // Calculate weighted confidence
    const longConfidence = longs.reduce((sum, s) => sum + s.confidence * s.strength, 0) / Math.max(longs.length, 1);
    const shortConfidence = shorts.reduce((sum, s) => sum + s.confidence * s.strength, 0) / Math.max(shorts.length, 1);

    const consensus = Math.max(longConfidence, shortConfidence);
    const agreement = Math.max(longs.length, shorts.length) / validSignals.length;

    let decision: 'ENTER_LONG' | 'ENTER_SHORT' | 'EXIT' | 'HOLD' = 'HOLD';
    let confidence = 0;

    if (consensus > this.CONFIDENCE_THRESHOLD && agreement > 0.6) {
      if (longConfidence > shortConfidence) {
        decision = 'ENTER_LONG';
        confidence = longConfidence;
      } else {
        decision = 'ENTER_SHORT';
        confidence = shortConfidence;
      }
    }

    // Log decision trace
    await this.prisma.decisionTrace.create({
      data: {
        symbol,
        decision,
        confidence,
        signals: validSignals.map(s => ({
          engine: s.engine,
          side: s.side,
          strength: s.strength,
          confidence: s.confidence,
        })),
        reasoning: {
          longConfidence,
          shortConfidence,
          agreement,
          consensusThreshold: this.CONFIDENCE_THRESHOLD,
        },
      },
    });

    return {
      symbol,
      decision,
      confidence,
      signals: validSignals,
      reasoning: { longConfidence, shortConfidence, agreement },
    };
  }
}
