import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaperAccountManager } from '../services/paper-account-manager';

const router = Router();

export function setupAccountRoutes(prisma: PrismaClient): Router {
  const accountManager = new PaperAccountManager(prisma);

  router.post('/accounts', async (req, res) => {
    try {
      const { name, balance } = req.body;
      const account = await accountManager.createAccount(name, balance);
      res.json({ success: true, account });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/accounts/:accountId', async (req, res) => {
    try {
      const account = await accountManager.getAccount(req.params.accountId);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/accounts/:accountId/stats', async (req, res) => {
    try {
      const stats = await accountManager.getAccountStats(req.params.accountId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/accounts', async (req, res) => {
    try {
      const accounts = await prisma.paperAccount.findMany();
      res.json(accounts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
