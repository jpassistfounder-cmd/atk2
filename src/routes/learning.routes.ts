import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { LearningModule } from '../services/learning-module';

export function createLearningRoutes(prisma: PrismaClient): Router {
  const router = express.Router();
  const learning = new LearningModule(prisma);

  // Update pattern stats
  router.post('/learning/patterns/update', async (req: Request, res: Response) => {
    try {
      const { symbol, pattern } = req.body;
      await learning.updatePatternStats(symbol, pattern);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get pattern stats
  router.get('/learning/patterns/:symbol/:pattern', async (req: Request, res: Response) => {
    try {
      const stats = await learning.getPatternStats(
        req.params.symbol,
        req.params.pattern
      );
      res.json(stats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Get top patterns
  router.get('/learning/patterns/:symbol', async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const patterns = await learning.getTopPatterns(
        req.params.symbol,
        parseInt((limit as string) || '10')
      );
      res.json(patterns);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
