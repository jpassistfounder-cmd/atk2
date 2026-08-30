import { PrismaClient } from '@prisma/client';
import { Position, Order } from '../domain/types';

export class PaperAccountManager {
  constructor(private prisma: PrismaClient) {}

  async createAccount(name: string, initialBalance: number = 10000): Promise<any> {
    return this.prisma.paperAccount.create({
      data: {
        name,
        balance: initialBalance,
        availableMargin: initialBalance,
        usedMargin: 0,
      },
    });
  }

  async getAccount(accountId: string): Promise<any> {
    return this.prisma.paperAccount.findUnique({
      where: { id: accountId },
      include: {
        positions: { where: { status: 'OPEN' } },
        orders: { where: { status: { in: ['PENDING', 'FILLED'] } } },
      },
    });
  }

  async updateMargin(accountId: string, usedMargin: number): Promise<void> {
    const account = await this.prisma.paperAccount.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('Account not found');

    await this.prisma.paperAccount.update({
      where: { id: accountId },
      data: {
        usedMargin,
        availableMargin: account.balance - usedMargin,
      },
    });
  }

  async updateBalance(accountId: string, pnl: number): Promise<void> {
    const account = await this.prisma.paperAccount.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('Account not found');

    const newBalance = account.balance + pnl;
    await this.prisma.paperAccount.update({
      where: { id: accountId },
      data: {
        balance: newBalance,
        availableMargin: newBalance - account.usedMargin,
      },
    });
  }

  async getAccountStats(accountId: string): Promise<any> {
    const account = await this.getAccount(accountId);
    const positions = account.positions as Position[];
    const outcomes = await this.prisma.outcome.findMany({
      where: { accountId },
    });

    const totalPnL = outcomes.reduce((sum, o) => sum + o.pnl, 0);
    const totalTrades = outcomes.length;
    const winningTrades = outcomes.filter(o => o.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const unrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);

    return {
      balance: account.balance,
      usedMargin: account.usedMargin,
      availableMargin: account.availableMargin,
      totalPnL,
      unrealizedPnL,
      totalTrades,
      winRate,
      openPositions: positions.length,
    };
  }
}
