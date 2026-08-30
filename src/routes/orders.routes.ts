import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrderExecutor } from '../services/order-executor';
import { RiskController } from '../services/risk-controller';

export function createOrderRoutes(prisma: PrismaClient): Router {
  const router = express.Router();
  const orderExecutor = new OrderExecutor(prisma);
  const riskController = new RiskController(prisma);

  // Create order
  router.post('/orders', async (req: Request, res: Response) => {
    try {
      const { accountId, symbol, side, quantity, price, orderType } = req.body;

      // Validate order
      const validation = await riskController.validateOrder(accountId, symbol, side, quantity, price);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.reason });
      }

      const order = await orderExecutor.createOrder(
        accountId,
        symbol,
        side,
        quantity,
        price,
        orderType
      );
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get order
  router.get('/orders/:id', async (req: Request, res: Response) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
      });
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // List orders
  router.get('/orders', async (req: Request, res: Response) => {
    try {
      const { accountId, symbol, status } = req.query;
      const where: any = {};
      if (accountId) where.accountId = accountId;
      if (symbol) where.symbol = symbol;
      if (status) where.status = status;

      const orders = await prisma.order.findMany({ where });
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Fill order
  router.post('/orders/:id/fill', async (req: Request, res: Response) => {
    try {
      const { fillPrice, fillQuantity } = req.body;
      const order = await orderExecutor.fillOrder(req.params.id, fillPrice, fillQuantity);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
