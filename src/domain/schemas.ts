import { z } from 'zod';

export const MarketSchema = z.object({
  symbol: z.string().min(1),
  baseAsset: z.string(),
  quoteAsset: z.string(),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive(),
  pricePrecision: z.number().int(),
  quantityPrecision: z.number().int(),
  minNotional: z.number().positive(),
});

export const CandleSchema = z.object({
  symbol: z.string(),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  openTime: z.date(),
  closeTime: z.date(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  quoteVolume: z.number(),
  trades: z.number().int(),
});

export const PaperAccountSchema = z.object({
  name: z.string().min(1),
  balance: z.number().positive().default(10000),
});

export const PositionSchema = z.object({
  symbol: z.string(),
  accountId: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  quantity: z.number().positive(),
  entryPrice: z.number().positive(),
  leverage: z.number().int().min(1).max(125).default(1),
});

export const OrderSchema = z.object({
  symbol: z.string(),
  accountId: z.string(),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  orderType: z.enum(['LIMIT', 'MARKET', 'STOP_LOSS', 'TAKE_PROFIT']).default('LIMIT'),
});

export const SignalSchema = z.object({
  symbol: z.string(),
  engine: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  strength: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
});

export const DecisionSchema = z.object({
  symbol: z.string(),
  decision: z.enum(['ENTER_LONG', 'ENTER_SHORT', 'EXIT', 'HOLD']),
  confidence: z.number().min(0).max(1),
  signals: z.record(z.any()),
});