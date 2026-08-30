import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PaperAccountManager } from '../services/paper-account-manager';

describe('PaperAccountManager', () => {
  let prisma: PrismaClient;
  let manager: PaperAccountManager;
  let accountId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    manager = new PaperAccountManager(prisma);
  });

  afterAll(async () => {
    if (accountId) {
      await prisma.paperAccount.delete({ where: { id: accountId } });
    }
    await prisma.$disconnect();
  });

  it('should create a paper account', async () => {
    const account = await manager.createAccount('Test Account', 10000);
    accountId = account.id;
    expect(account).toBeDefined();
    expect(account.balance).toBe(10000);
    expect(account.availableMargin).toBe(10000);
  });

  it('should get account', async () => {
    const account = await manager.getAccount(accountId);
    expect(account).toBeDefined();
    expect(account.id).toBe(accountId);
  });

  it('should get account stats', async () => {
    const stats = await manager.getAccountStats(accountId);
    expect(stats).toBeDefined();
    expect(stats.balance).toBe(10000);
    expect(stats.totalTrades).toBe(0);
  });

  it('should update balance', async () => {
    const newBalance = 11000;
    await manager.updateBalance(accountId, 1000);
    const account = await manager.getAccount(accountId);
    expect(account.balance).toBeGreaterThan(10000);
  });
});
