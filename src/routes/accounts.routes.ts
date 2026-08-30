import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaperAccountManager } from '../services/paper-account-manager';

export function createAccountRoutes(prisma: PrismaClient): Router {
  const router = express.Router();
  const accountManager = new PaperAccountManager(prisma);

  // Create account
  router.post('/accounts', async (req: Request, res: Response) => {
    try {
      const { name, initialBalance } = req.body;
      const account = await accountManager.createAccount(name, initialBalance);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get account
  router.get('/accounts/:id', async (req: Request, res: Response) => {
    try {
      const account = await accountManager.getAccount(req.params.id);
      res.json(account);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Get account stats
  router.get('/accounts/:id/stats', async (req: Request, res: Response) => {
    try {
      const stats = await accountManager.getAccountStats(req.params.id);
      res.json(stats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // List accounts
  router.get('/accounts', async (req: Request, res: Response) => {
    try {
      const accounts = await prisma.paperAccount.findMany();
      res.json(accounts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
