import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { Candle } from '../domain/types';

export interface BinanceKline {
  0: number; // Open time
  1: string; // Open
  2: string; // High
  3: string; // Low
  4: string; // Close
  5: string; // Volume
  6: number; // Close time
  7: string; // Quote volume
  8: number; // Number of trades
  9: string; // Taker buy base
  10: string; // Taker buy quote
}

export class BinanceFuturesGateway {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://fapi.binance.com';

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
  }

  private generateSignature(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  async getExchangeInfo() {
    try {
      const response = await this.client.get('/fapi/v1/exchangeInfo');
      return response.data;
    } catch (error) {
      console.error('Failed to get exchange info:', error);
      throw error;
    }
  }

  async getCandles(
    symbol: string,
    interval: string,
    limit: number = 500,
    startTime?: number
  ): Promise<Candle[]> {
    try {
      const params: any = {
        symbol,
        interval,
        limit,
      };
      if (startTime) params.startTime = startTime;

      const response = await this.client.get('/fapi/v1/klines', { params });
      return response.data.map((kline: BinanceKline) => ({
        symbol,
        timeframe: interval,
        openTime: new Date(kline[0]),
        closeTime: new Date(kline[6]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        quoteVolume: parseFloat(kline[7]),
        trades: kline[8],
        takerBuyVolume: parseFloat(kline[9]),
        takerBuyQuoteVolume: parseFloat(kline[10]),
      }));
    } catch (error) {
      console.error(`Failed to get candles for ${symbol}:`, error);
      throw error;
    }
  }

  async getOrderBook(symbol: string, limit: number = 20) {
    try {
      const response = await this.client.get('/fapi/v1/depth', {
        params: { symbol, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get order book for ${symbol}:`, error);
      throw error;
    }
  }

  async getTicker(symbol: string) {
    try {
      const response = await this.client.get('/fapi/v1/ticker/24hr', {
        params: { symbol },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get ticker for ${symbol}:`, error);
      throw error;
    }
  }

  async getMarkPrice(symbol?: string) {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.client.get('/fapi/v1/premiumIndex', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get mark price:', error);
      throw error;
    }
  }

  async getFundingRate(symbol: string) {
    try {
      const response = await this.client.get('/fapi/v1/fundingRate', {
        params: { symbol, limit: 1 },
      });
      return response.data[0];
    } catch (error) {
      console.error(`Failed to get funding rate for ${symbol}:`, error);
      throw error;
    }
  }

  async getOpenInterest(symbol: string) {
    try {
      const response = await this.client.get('/fapi/v1/openInterest', {
        params: { symbol },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get open interest for ${symbol}:`, error);
      throw error;
    }
  }

  async getLongShortRatio(symbol: string, period: number = 1) {
    try {
      const response = await this.client.get('/futures/data/globalLongShortAccountRatio', {
        params: { symbol, period, limit: 1 },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get long/short ratio for ${symbol}:`, error);
      throw error;
    }
  }
}
