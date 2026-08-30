import React, { useState } from 'react';
import { useATKStore } from '../store/atk.store';

export const PositionManager: React.FC = () => {
  const { account, positions } = useATKStore();
  const [formData, setFormData] = useState({
    symbol: '',
    side: 'LONG' as 'LONG' | 'SHORT',
    quantity: 0,
    entryPrice: 0,
    leverage: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleOpenPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      setLoading(true);
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          ...formData,
        }),
      });

      if (response.ok) {
        setFormData({
          symbol: '',
          side: 'LONG',
          quantity: 0,
          entryPrice: 0,
          leverage: 1,
        });
        alert('Position opened successfully');
      }
    } catch (error) {
      console.error('Failed to open position:', error);
      alert('Failed to open position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Position Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Open Position</h2>
              <form onSubmit={handleOpenPosition} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g., BTCUSDT"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Side</label>
                  <select
                    value={formData.side}
                    onChange={(e) =>
                      setFormData({ ...formData, side: e.target.value as any })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  >
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Entry Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entryPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, entryPrice: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Leverage</label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    value={formData.leverage}
                    onChange={(e) =>
                      setFormData({ ...formData, leverage: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:bg-gray-600 transition"
                >
                  {loading ? 'Opening...' : 'Open Position'}
                </button>
              </form>
            </div>
          </div>

          {/* Positions List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Open Positions ({positions.length})</h2>
              {positions.length === 0 ? (
                <p className="text-gray-400">No open positions</p>
              ) : (
                <div className="space-y-4">
                  {positions.map((pos) => (
                    <div
                      key={pos.id}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xl font-bold">{pos.symbol}</p>
                          <p className={`text-sm font-semibold ${
                            pos.side === 'LONG' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {pos.side}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            pos.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${pos.unrealizedPnL.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {((pos.unrealizedPnL / (pos.entryPrice * pos.quantity)) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Qty</p>
                          <p className="font-semibold">{pos.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Entry</p>
                          <p className="font-semibold">${pos.entryPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Current</p>
                          <p className="font-semibold">${pos.currentPrice.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
