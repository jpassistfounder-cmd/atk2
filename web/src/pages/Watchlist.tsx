import React, { useState, useEffect } from 'react';
import { useATKStore } from '../store/atk.store';

interface Market {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  priceStrength: number;
  volumeQuality: number;
  qualification: number;
  qualified: boolean;
}

export const Watchlist: React.FC = () => {
  const { account } = useATKStore();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'qualified'>('all');

  const scanMarkets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/markets/scan', { method: 'POST' });
      const data = await response.json();
      setMarkets(data.results || []);
    } catch (error) {
      console.error('Failed to scan markets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanMarkets();
  }, []);

  const filteredMarkets = filter === 'qualified'
    ? markets.filter((m) => m.qualified)
    : markets;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Watchlist Scanner</h1>
          <button
            onClick={scanMarkets}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:bg-gray-600"
          >
            {loading ? 'Scanning...' : 'Scan Markets'}
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            All ({markets.length})
          </button>
          <button
            onClick={() => setFilter('qualified')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === 'qualified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Qualified ({markets.filter((m) => m.qualified).length})
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6">Symbol</th>
                <th className="text-left py-4 px-6">Price</th>
                <th className="text-left py-4 px-6">24h Change</th>
                <th className="text-left py-4 px-6">Volume 24h</th>
                <th className="text-left py-4 px-6">Price Strength</th>
                <th className="text-left py-4 px-6">Volume Quality</th>
                <th className="text-left py-4 px-6">Score</th>
                <th className="text-left py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.map((market) => (
                <tr
                  key={market.symbol}
                  className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition"
                >
                  <td className="py-4 px-6 font-semibold">{market.symbol}</td>
                  <td className="py-4 px-6">${market.price.toFixed(4)}</td>
                  <td className={`py-4 px-6 font-semibold ${
                    market.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {market.change24h.toFixed(2)}%
                  </td>
                  <td className="py-4 px-6">${(market.volume24h / 1000000).toFixed(2)}M</td>
                  <td className="py-4 px-6">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${market.priceStrength * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${market.volumeQuality * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold">{(market.qualification * 100).toFixed(0)}%</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      market.qualified
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {market.qualified ? 'Qualified' : 'Unqualified'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
