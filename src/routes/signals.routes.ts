import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StructureEngine } from '../engines/structure.engine';
import { VolumeEngine } from '../engines/volume.engine';
import { MomentumEngine } from '../engines/momentum.engine';
import { DerivativesEngine } from '../engines/derivatives.engine';
import { LiquidityEngine } from '../engines/liquidity.engine';
import { BinanceFuturesGateway } from '../services/binance.gateway';
import { SignalArbitrator } from '../services/signal-arbitrator';

export function createSignalRoutes(
  prisma: PrismaClient,
  binance: BinanceFuturesGateway
): Router {
  const router = express.Router();
  const structureEngine = new StructureEngine(prisma);
  const volumeEngine = new VolumeEngine(prisma);
  const momentumEngine = new MomentumEngine(prisma);
  const derivativesEngine = new DerivativesEngine(prisma, binance);
  const liquidityEngine = new LiquidityEngine(prisma, binance);
  const arbitrator = new SignalArbitrator(prisma);

  // Analyze symbol with all engines
  router.post('/signals/analyze', async (req: Request, res: Response) => {
    try {
      const { symbol } = req.body;
      const signals = [];

      const structure = await structureEngine.analyzeStructure(symbol);
      if (structure) signals.push(structure);

      const volume = await volumeEngine.analyzeVolume(symbol);
      if (volume) signals.push(volume);

      const momentum = await momentumEngine.analyzeMomentum(symbol);
      if (momentum) signals.push(momentum);

      const derivatives = await derivativesEngine.analyzeDerivatives(symbol);
      if (derivatives) signals.push(derivatives);

      const liquidity = await liquidityEngine.analyzeLiquidity(symbol);
      if (liquidity) signals.push(liquidity);

      // Arbitrate
      const decision = await arbitrator.arbitrate(symbol, signals);

      res.json({ signals, decision });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get decision traces
  router.get('/signals/traces', async (req: Request, res: Response) => {
    try {
      const { symbol, limit } = req.query;
      const traces = await prisma.decisionTrace.findMany({
        where: symbol ? { symbol: symbol as string } : {},
        orderBy: { timestamp: 'desc' },
        take: parseInt((limit as string) || '20'),
      });
      res.json(traces);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
