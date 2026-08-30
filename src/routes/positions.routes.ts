import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrderExecutor } from '../services/order-executor';
import { ExitManager } from '../services/exit-manager';

export function createPositionRoutes(prisma: PrismaClient): Router {
  const router = express.Router();
  const orderExecutor = new OrderExecutor(prisma);
  const exitManager = new ExitManager(prisma);

  // Open position
  router.post('/positions', async (req: Request, res: Response) => {
    try {
      const { accountId, symbol, side, quantity, entryPrice, leverage } = req.body;
      const position = await orderExecutor.openPosition(
        accountId,
        symbol,
        side,
        quantity,
        entryPrice,
        leverage
      );
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get position
  router.get('/positions/:id', async (req: Request, res: Response) => {
    try {
      const position = await prisma.position.findUnique({
        where: { id: req.params.id },
      });
      res.json(position);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // List positions
  router.get('/positions', async (req: Request, res: Response) => {
    try {
      const { accountId, symbol, status } = req.query;
      const where: any = {};
      if (accountId) where.accountId = accountId;
      if (symbol) where.symbol = symbol;
      if (status) where.status = status;

      const positions = await prisma.position.findMany({ where });
      res.json(positions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update position price
  router.patch('/positions/:id/price', async (req: Request, res: Response) => {
    try {
      const { currentPrice } = req.body;
      const position = await orderExecutor.updatePositionPrice(req.params.id, currentPrice);
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Check exits
  router.post('/positions/:id/check-exit', async (req: Request, res: Response) => {
    try {
      const { currentPrice, stopLoss, takeProfit } = req.body;
      const exitReason = await exitManager.checkExits(req.params.id, currentPrice, stopLoss, takeProfit);
      res.json({ exitReason });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
