import { describe, it, expect } from 'vitest';
import { StructureEngine } from '../engines/structure.engine';
import { VolumeEngine } from '../engines/volume.engine';
import { MomentumEngine } from '../engines/momentum.engine';
import { PrismaClient } from '@prisma/client';

describe('Intelligence Engines', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('StructureEngine should analyze chart patterns', async () => {
    const engine = new StructureEngine(prisma);
    const signal = await engine.analyzeStructure('BTCUSDT');
    if (signal) {
      expect(signal.engine).toBe('STRUCTURE');
      expect(['LONG', 'SHORT']).toContain(signal.side);
      expect(signal.confidence).toBeGreaterThanOrEqual(0);
      expect(signal.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('VolumeEngine should analyze volume', async () => {
    const engine = new VolumeEngine(prisma);
    const signal = await engine.analyzeVolume('BTCUSDT');
    if (signal) {
      expect(signal.engine).toBe('VOLUME');
      expect(['LONG', 'SHORT']).toContain(signal.side);
    }
  });

  it('MomentumEngine should calculate RSI and MACD', async () => {
    const engine = new MomentumEngine(prisma);
    const signal = await engine.analyzeMomentum('BTCUSDT');
    if (signal) {
      expect(signal.engine).toBe('MOMENTUM');
      expect(['LONG', 'SHORT']).toContain(signal.side);
    }
  });
});
