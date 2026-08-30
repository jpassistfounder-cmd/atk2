import { PrismaClient } from '@prisma/client';
import { Candle, Market } from '../domain/types';
import { BinanceFuturesGateway } from './binance.gateway';

export class MarketDataService {
  constructor(
    private prisma: PrismaClient,
    private binance: BinanceFuturesGateway
  ) {}

  async initializeMarkets(symbols: string[]): Promise<Market[]> {
    const exchangeInfo = await this.binance.getExchangeInfo();
    const markets: Market[] = [];

    for (const symbol of symbols) {
      const symbolInfo = exchangeInfo.symbols.find(
        (s: any) => s.symbol === symbol
      );

      if (!symbolInfo) {
        console.warn(`Symbol ${symbol} not found on Binance`);
        continue;
      }

      const market = await this.prisma.market.upsert({
        where: { symbol },
        update: {},
        create: {
          symbol,
          baseAsset: symbolInfo.baseAsset,
          quoteAsset: symbolInfo.quoteAsset,
          minPrice: parseFloat(symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER')?.minPrice || '0'),
          maxPrice: parseFloat(symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER')?.maxPrice || '999999'),
          pricePrecision: symbolInfo.pricePrecision,
          quantityPrecision: symbolInfo.quantityPrecision,
          minNotional: parseFloat(
            symbolInfo.filters.find((f: any) => f.filterType === 'MIN_NOTIONAL')?.notional || '10'
          ),
        },
      });

      markets.push(market as Market);
    }

    return markets;
  }

  async fetchAndStoreCandles(
    symbol: string,
    timeframe: string = '1h',
    limit: number = 500
  ): Promise<Candle[]> {
    const candles = await this.binance.getCandles(symbol, timeframe, limit);

    const stored = await Promise.all(
      candles.map((candle) =>
        this.prisma.candle.upsert({
          where: {
            symbol_timeframe_openTime: {
              symbol,
              timeframe,
              openTime: candle.openTime,
            },
          },
          update: {
            close: candle.close,
            high: candle.high,
            low: candle.low,
            volume: candle.volume,
            quoteVolume: candle.quoteVolume,
          },
          create: candle,
        })
      )
    );

    return stored as Candle[];
  }

  async getLatestCandles(
    symbol: string,
    timeframe: string,
    limit: number = 100
  ): Promise<Candle[]> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol, timeframe },
      orderBy: { closeTime: 'desc' },
      take: limit,
    });
    return candles.reverse() as Candle[];
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const candles = await this.prisma.candle.findMany({
      where: { symbol },
      orderBy: { closeTime: 'desc' },
      take: 1,
    });
    return candles[0]?.close || 0;
  }

  async getMarketStats(symbol: string): Promise<any> {
    const ticker = await this.binance.getTicker(symbol);
    const markPrice = await this.binance.getMarkPrice(symbol);
    const fundingRate = await this.binance.getFundingRate(symbol);
    const openInterest = await this.binance.getOpenInterest(symbol);

    return {
      symbol,
      lastPrice: parseFloat(ticker.lastPrice),
      priceChange: parseFloat(ticker.priceChange),
      priceChangePercent: parseFloat(ticker.priceChangePercent),
      highPrice: parseFloat(ticker.highPrice),
      lowPrice: parseFloat(ticker.lowPrice),
      volume: parseFloat(ticker.volume),
      quoteVolume: parseFloat(ticker.quoteVolume),
      markPrice: parseFloat(markPrice.markPrice),
      indexPrice: parseFloat(markPrice.indexPrice),
      fundingRate: parseFloat(fundingRate.fundingRate),
      fundingTime: new Date(fundingRate.fundingTime),
      openInterest: parseFloat(openInterest.openInterest),
    };
  }
}
