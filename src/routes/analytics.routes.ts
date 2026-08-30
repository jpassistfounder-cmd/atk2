import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export function setupAnalyticsRoutes(prisma: PrismaClient): Router {
  router.get('/outcomes/:accountId', async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const outcomes = await prisma.outcome.findMany({
        where: { accountId: req.params.accountId },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string),
      });
      res.json(outcomes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/outcomes/:accountId/stats', async (req, res) => {
    try {
      const outcomes = await prisma.outcome.findMany({
        where: { accountId: req.params.accountId },
      });

      const totalPnL = outcomes.reduce((sum, o) => sum + o.pnl, 0);
      const winningTrades = outcomes.filter(o => o.pnl > 0);
      const losingTrades = outcomes.filter(o => o.pnl <= 0);
      const winRate = outcomes.length > 0 ? (winningTrades.length / outcomes.length) * 100 : 0;
      const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, o) => sum + o.pnl, 0) / winningTrades.length : 0;
      const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, o) => sum + o.pnl, 0) / losingTrades.length) : 0;
      const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
      const avgDuration = outcomes.length > 0 ? outcomes.reduce((sum, o) => sum + o.duration, 0) / outcomes.length : 0;

      res.json({
        totalTrades: outcomes.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        totalPnL,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
        avgDuration,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/learning/:symbol', async (req, res) => {
    try {
      const patterns = await prisma.learning.findMany({
        where: { symbol: req.params.symbol },
        orderBy: { profitFactor: 'desc' },
        take: 20,
      });
      res.json(patterns);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/signals/:symbol', async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const signals = await prisma.signal.findMany({
        where: { symbol: req.params.symbol },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string),
      });
      res.json(signals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/decisions/:symbol', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const decisions = await prisma.decisionTrace.findMany({
        where: { symbol: req.params.symbol },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string),
      });
      res.json(decisions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
