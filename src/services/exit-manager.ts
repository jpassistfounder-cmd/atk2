import { PrismaClient } from '@prisma/client';

export class ExitManager {
  constructor(private prisma: PrismaClient) {}

  async checkExits(positionId: string, currentPrice: number, stopLoss: number, takeProfit: number): Promise<string | null> {
    const position = await this.prisma.position.findUnique({ where: { id: positionId } });
    if (!position || position.status !== 'OPEN') return null;

    let exitReason: string | null = null;

    if (position.side === 'LONG') {
      if (currentPrice <= stopLoss) exitReason = 'STOP_LOSS';
      if (currentPrice >= takeProfit) exitReason = 'TAKE_PROFIT';
    } else {
      if (currentPrice >= stopLoss) exitReason = 'STOP_LOSS';
      if (currentPrice <= takeProfit) exitReason = 'TAKE_PROFIT';
    }

    if (exitReason) {
      await this.executeExit(positionId, currentPrice, exitReason);
    }

    return exitReason;
  }

  private async executeExit(positionId: string, exitPrice: number, reason: string): Promise<void> {
    const position = await this.prisma.position.findUnique({ where: { id: positionId } });
    if (!position) throw new Error('Position not found');

    // Create exit record
    await this.prisma.exit.create({
      data: {
        positionId,
        reason,
        exitPrice,
        exitQuantity: position.quantity,
      },
    });

    // Create outcome
    const pnl = position.side === 'LONG'
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;

    const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;

    await this.prisma.outcome.create({
      data: {
        accountId: position.accountId,
        symbol: position.symbol,
        side: position.side,
        entry: position.entryPrice,
        exit: exitPrice,
        quantity: position.quantity,
        pnl,
        pnlPercent,
        duration: Math.floor((Date.now() - position.openedAt.getTime()) / 1000),
      },
    });

    // Close position
    await this.prisma.position.update({
      where: { id: positionId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }
}
