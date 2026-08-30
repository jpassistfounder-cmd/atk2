import { create } from 'zustand';

interface Account {
  id: string;
  name: string;
  balance: number;
  usedMargin: number;
  availableMargin: number;
}

interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  status: string;
}

interface Signal {
  engine: string;
  side: 'LONG' | 'SHORT';
  strength: number;
  confidence: number;
}

interface ATKStore {
  account: Account | null;
  positions: Position[];
  signals: Record<string, Signal[]>;
  health: any;
  setAccount: (account: Account) => void;
  setPositions: (positions: Position[]) => void;
  addSignal: (symbol: string, signal: Signal) => void;
  clearSignals: () => void;
  setHealth: (health: any) => void;
}

export const useATKStore = create<ATKStore>((set) => ({
  account: null,
  positions: [],
  signals: {},
  health: null,
  setAccount: (account) => set({ account }),
  setPositions: (positions) => set({ positions }),
  addSignal: (symbol, signal) =>
    set((state) => ({
      signals: {
        ...state.signals,
        [symbol]: [...(state.signals[symbol] || []), signal],
      },
    })),
  clearSignals: () => set({ signals: {} }),
  setHealth: (health) => set({ health }),
}));
