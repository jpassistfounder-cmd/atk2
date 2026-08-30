import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrderExecutor } from '../services/order-executor';
import { RiskController } from '../services/risk-controller';

const router = Router();

export function setupTradingRoutes(prisma: PrismaClient): Router {
  const orderExecutor = new OrderExecutor(prisma);
  const riskController = new RiskController(prisma);

  router.post('/orders', async (req, res) => {
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
      res.json({ success: true, order });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/orders/:orderId/fill', async (req, res) => {
    try {
      const { fillPrice, fillQuantity } = req.body;
      const order = await orderExecutor.fillOrder(req.params.orderId, fillPrice, fillQuantity);
      res.json({ success: true, order });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/positions/:accountId', async (req, res) => {
    try {
      const positions = await prisma.position.findMany({
        where: { accountId: req.params.accountId, status: 'OPEN' },
      });
      res.json(positions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/positions/:positionId/details', async (req, res) => {
    try {
      const position = await prisma.position.findUnique({
        where: { id: req.params.positionId },
        include: { exits: true, orders: true },
      });
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/positions', async (req, res) => {
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
      res.json({ success: true, position });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/orders/:accountId', async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { accountId: req.params.accountId },
        orderBy: { createdAt: 'desc' },
      });
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
