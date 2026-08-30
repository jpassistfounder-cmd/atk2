import { PrismaClient } from '@prisma/client';

export class LearningModule {
  constructor(private prisma: PrismaClient) {}

  async updatePatternStats(symbol: string, pattern: string): Promise<void> {
    // Get recent outcomes for this symbol
    const outcomes = await this.prisma.outcome.findMany({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    if (outcomes.length === 0) return;

    const wins = outcomes.filter(o => o.pnl > 0);
    const losses = outcomes.filter(o => o.pnl <= 0);
    const winRate = wins.length / outcomes.length;
    const avgWin = wins.length > 0 ? wins.reduce((sum, o) => sum + o.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, o) => sum + o.pnl, 0) / losses.length) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 1;

    await this.prisma.learning.upsert({
      where: { symbol_pattern: { symbol, pattern } },
      update: {
        frequency: outcomes.length,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
      },
      create: {
        symbol,
        pattern,
        frequency: outcomes.length,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
      },
    });
  }

  async getPatternStats(symbol: string, pattern: string): Promise<any> {
    return this.prisma.learning.findUnique({
      where: { symbol_pattern: { symbol, pattern } },
    });
  }

  async getTopPatterns(symbol: string, limit: number = 10): Promise<any[]> {
    return this.prisma.learning.findMany({
      where: { symbol },
      orderBy: { profitFactor: 'desc' },
      take: limit,
    });
  }
}
