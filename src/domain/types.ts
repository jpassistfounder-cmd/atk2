export interface Market {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minPrice: number;
  maxPrice: number;
  pricePrecision: number;
  quantityPrecision: number;
  minNotional: number;
}

export interface Candle {
  id: string;
  symbol: string;
  timeframe: string;
  openTime: Date;
  closeTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  trades: number;
  takerBuyVolume: number;
  takerBuyQuoteVolume: number;
}

export interface PaperAccount {
  id: string;
  name: string;
  balance: number;
  usedMargin: number;
  availableMargin: number;
}

export interface Position {
  id: string;
  symbol: string;
  accountId: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  marginUsed: number;
  unrealizedPnL: number;
  status: 'OPEN' | 'CLOSING' | 'CLOSED';
  openedAt: Date;
  closedAt?: Date;
}

export interface Order {
  id: string;
  symbol: string;
  accountId: string;
  positionId?: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderType: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'TAKE_PROFIT';
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  filledQuantity: number;
  filledPrice?: number;
}

export interface Signal {
  id: string;
  symbol: string;
  engine: string;
  side: 'LONG' | 'SHORT';
  strength: number;
  confidence: number;
  timestamp: Date;
}

export interface DecisionTrace {
  id: string;
  symbol: string;
  timestamp: Date;
  signals: Record<string, any>;
  decision: 'ENTER_LONG' | 'ENTER_SHORT' | 'EXIT' | 'HOLD';
  confidence: number;
  reasoning: Record<string, any>;
}

export interface Outcome {
  id: string;
  accountId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  duration: number;
}