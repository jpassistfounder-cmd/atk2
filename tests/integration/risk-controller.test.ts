import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { RiskController } from '../services/risk-controller';

describe('RiskController', () => {
  let prisma: PrismaClient;
  let controller: RiskController;
  let accountId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    controller = new RiskController(prisma);

    // Create test account
    const account = await prisma.paperAccount.create({
      data: {
        name: 'Risk Test Account',
        balance: 10000,
        availableMargin: 10000,
        usedMargin: 0,
      },
    });
    accountId = account.id;
  });

  afterAll(async () => {
    if (accountId) {
      await prisma.paperAccount.delete({ where: { id: accountId } });
    }
    await prisma.$disconnect();
  });

  it('should validate order within margin', async () => {
    const validation = await controller.validateOrder(
      accountId,
      'BTCUSDT',
      'BUY',
      1,
      50000
    );
    expect(validation.valid).toBe(false);
  });

  it('should calculate stop loss for LONG position', async () => {
    const stopLoss = await controller.calculateStopLoss(100, 'LONG');
    expect(stopLoss).toBeLessThan(100);
    expect(stopLoss).toBe(98);
  });

  it('should calculate take profit for LONG position', async () => {
    const takeProfit = await controller.calculateTakeProfit(100, 'LONG');
    expect(takeProfit).toBeGreaterThan(100);
    expect(takeProfit).toBe(105);
  });
});
