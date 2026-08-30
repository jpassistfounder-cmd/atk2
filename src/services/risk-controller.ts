import { PrismaClient } from '@prisma/client';
import { Position, Order } from '../domain/types';

export class RiskController {
  private readonly MAX_POSITION_SIZE = 10; // % of account
  private readonly MAX_LEVERAGE = 5;
  private readonly STOP_LOSS_PERCENT = 2; // 2% stop loss
  private readonly TAKE_PROFIT_PERCENT = 5; // 5% take profit
  private readonly CIRCUIT_BREAKER_LOSS = 5; // 5% max daily loss

  constructor(private prisma: PrismaClient) {}

  async validateOrder(
    accountId: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ): Promise<{ valid: boolean; reason?: string }> {
    // Get account
    const account = await this.prisma.paperAccount.findUnique({ where: { id: accountId } });
    if (!account) return { valid: false, reason: 'Account not found' };

    // Check margin
    const orderCost = quantity * price;
    if (orderCost > account.availableMargin) {
      return { valid: false, reason: 'Insufficient margin' };
    }

    // Check position size
    const positionPercent = (orderCost / account.balance) * 100;
    if (positionPercent > this.MAX_POSITION_SIZE) {
      return { valid: false, reason: `Position size exceeds ${this.MAX_POSITION_SIZE}%` };
    }

    // Check circuit breaker
    const dailyPnL = await this.calculateDailyPnL(accountId);
    const dailyLossPercent = (Math.abs(dailyPnL) / account.balance) * 100;
    if (dailyLossPercent > this.CIRCUIT_BREAKER_LOSS) {
      return { valid: false, reason: 'Circuit breaker triggered - daily loss limit reached' };
    }

    return { valid: true };
  }

  async calculateStopLoss(entryPrice: number, side: 'LONG' | 'SHORT'): Promise<number> {
    const stopLoss = this.STOP_LOSS_PERCENT / 100;
    return side === 'LONG' ? entryPrice * (1 - stopLoss) : entryPrice * (1 + stopLoss);
  }

  async calculateTakeProfit(entryPrice: number, side: 'LONG' | 'SHORT'): Promise<number> {
    const takeProfit = this.TAKE_PROFIT_PERCENT / 100;
    return side === 'LONG' ? entryPrice * (1 + takeProfit) : entryPrice * (1 - takeProfit);
  }

  private async calculateDailyPnL(accountId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const outcomes = await this.prisma.outcome.findMany({
      where: {
        accountId,
        timestamp: { gte: today },
      },
    });

    return outcomes.reduce((sum, o) => sum + o.pnl, 0);
  }
}
