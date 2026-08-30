import React, { useState, useEffect } from 'react';

interface Outcome {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  duration: number;
  timestamp: string;
}

export const Analytics: React.FC = () => {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load outcomes from a mock endpoint or derive from account stats
      setOutcomes([
        {
          symbol: 'BTCUSDT',
          side: 'LONG',
          entry: 43000,
          exit: 44500,
          quantity: 0.1,
          pnl: 150,
          pnlPercent: 3.49,
          duration: 3600,
          timestamp: new Date().toISOString(),
        },
      ]);

      setStats({
        totalTrades: 1,
        winRate: 100,
        avgWin: 150,
        avgLoss: 0,
        profitFactor: Infinity,
        totalPnL: 150,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Portfolio Analytics</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Trades</p>
            <p className="text-3xl font-bold">{stats?.totalTrades || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-green-400">{stats?.winRate || 0}%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Profit Factor</p>
            <p className="text-3xl font-bold">{stats?.profitFactor?.toFixed(2) || '-'}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-3xl font-bold ${
              (stats?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${stats?.totalPnL?.toFixed(2) || '0'}
            </p>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Trade History</h2>
          {outcomes.length === 0 ? (
            <p className="text-gray-400">No trades yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Symbol</th>
                    <th className="text-left py-3 px-4">Side</th>
                    <th className="text-left py-3 px-4">Entry</th>
                    <th className="text-left py-3 px-4">Exit</th>
                    <th className="text-left py-3 px-4">Qty</th>
                    <th className="text-left py-3 px-4">P&L</th>
                    <th className="text-left py-3 px-4">%</th>
                    <th className="text-left py-3 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.map((outcome, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="py-3 px-4 font-semibold">{outcome.symbol}</td>
                      <td className={`py-3 px-4 font-semibold ${
                        outcome.side === 'LONG' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {outcome.side}
                      </td>
                      <td className="py-3 px-4">${outcome.entry.toFixed(4)}</td>
                      <td className="py-3 px-4">${outcome.exit.toFixed(4)}</td>
                      <td className="py-3 px-4">{outcome.quantity}</td>
                      <td className={`py-3 px-4 font-semibold ${
                        outcome.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${outcome.pnl.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${
                        outcome.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {outcome.pnlPercent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4">{(outcome.duration / 3600).toFixed(1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
