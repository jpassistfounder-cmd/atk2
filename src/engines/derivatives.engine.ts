import { PrismaClient } from '@prisma/client';
import { Signal } from '../domain/types';
import { BinanceFuturesGateway } from '../services/binance.gateway';

export class DerivativesEngine {
  constructor(
    private prisma: PrismaClient,
    private binance: BinanceFuturesGateway
  ) {}

  async analyzeDerivatives(symbol: string): Promise<Signal | null> {
    try {
      const markPrice = await this.binance.getMarkPrice(symbol);
      const fundingRate = await this.binance.getFundingRate(symbol);
      const openInterest = await this.binance.getOpenInterest(symbol);

      const indexPrice = parseFloat(markPrice.indexPrice);
      const markPriceValue = parseFloat(markPrice.markPrice);
      const fundingRateValue = parseFloat(fundingRate.fundingRate);
      const openInterestValue = parseFloat(openInterest.openInterest);

      // Basis = (Mark Price - Index Price) / Index Price
      const basis = (markPriceValue - indexPrice) / indexPrice;

      let strength = 0;
      let side: 'LONG' | 'SHORT' = 'LONG';

      // High positive funding rate = overbought (SHORT)
      if (fundingRateValue > 0.0005) {
        strength = Math.min(fundingRateValue / 0.001, 1);
        side = 'SHORT';
      } else if (fundingRateValue < -0.0005) {
        strength = Math.min(Math.abs(fundingRateValue) / 0.001, 1);
        side = 'LONG';
      }

      const confidence = strength > 0.3 ? strength : 0;

      if (confidence < 0.3) return null;

      const signal: Signal = {
        id: '',
        symbol,
        engine: 'DERIVATIVES',
        side,
        strength,
        confidence,
        timestamp: new Date(),
      };

      return signal;
    } catch (error) {
      console.error(`Failed to analyze derivatives for ${symbol}:`, error);
      return null;
    }
  }
}
