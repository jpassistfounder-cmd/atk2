import { PrismaClient } from '@prisma/client';
import { Signal } from '../domain/types';

export class CanonicalRuntimeState {
  private state: {
    markets: Map<string, any>;
    positions: Map<string, any>;
    accounts: Map<string, any>;
    signals: Map<string, Signal[]>;
    health: {
      lastUpdate: Date;
      status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
      errors: string[];
    };
  } = {
    markets: new Map(),
    positions: new Map(),
    accounts: new Map(),
    signals: new Map(),
    health: {
      lastUpdate: new Date(),
      status: 'HEALTHY',
      errors: [],
    },
  };

  constructor(private prisma: PrismaClient) {}

  async initialize(): Promise<void> {
    // Load initial state from database
    const markets = await this.prisma.market.findMany();
    markets.forEach(m => this.state.markets.set(m.symbol, m));

    this.state.health.status = 'HEALTHY';
    this.state.health.lastUpdate = new Date();
  }

  updateMarketPrice(symbol: string, price: number): void {
    const market = this.state.markets.get(symbol);
    if (market) {
      market.lastPrice = price;
      market.lastUpdate = new Date();
    }
  }

  addSignal(symbol: string, signal: Signal): void {
    const signals = this.state.signals.get(symbol) || [];
    signals.push(signal);
    this.state.signals.set(symbol, signals);
  }

  getSignals(symbol: string): Signal[] {
    return this.state.signals.get(symbol) || [];
  }

  clearSignals(symbol: string): void {
    this.state.signals.delete(symbol);
  }

  getHealth(): any {
    return this.state.health;
  }

  setHealthStatus(status: 'HEALTHY' | 'DEGRADED' | 'ERROR', error?: string): void {
    this.state.health.status = status;
    if (error) this.state.health.errors.push(error);
    this.state.health.lastUpdate = new Date();

    if (this.state.health.errors.length > 100) {
      this.state.health.errors = this.state.health.errors.slice(-100);
    }
  }

  getState(): any {
    return {
      marketCount: this.state.markets.size,
      signalsCount: Array.from(this.state.signals.values()).reduce((sum, s) => sum + s.length, 0),
      health: this.state.health,
    };
  }
}
