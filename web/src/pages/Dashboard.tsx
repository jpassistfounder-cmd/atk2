import React from 'react';
import { useATKStore } from '../store/atk.store';

export const Dashboard: React.FC = () => {
  const { account, positions, health } = useATKStore();

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-2xl">Select an account to begin</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ATK Dashboard</h1>
          <p className="text-gray-400">Account: {account.name}</p>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Balance</p>
            <p className="text-3xl font-bold">${account.balance.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Used Margin</p>
            <p className="text-3xl font-bold">${account.usedMargin.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Available Margin</p>
            <p className="text-3xl font-bold text-green-400">${account.availableMargin.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Open Positions</p>
            <p className="text-3xl font-bold">{positions.length}</p>
          </div>
        </div>

        {/* Health Status */}
        {health && (
          <div className="bg-gray-800 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="font-semibold">System Health</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                health.status === 'HEALTHY'
                  ? 'bg-green-500 text-white'
                  : health.status === 'DEGRADED'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-red-500 text-white'
              }`}>
                {health.status}
              </span>
            </div>
          </div>
        )}

        {/* Positions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
          {positions.length === 0 ? (
            <p className="text-gray-400">No open positions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Symbol</th>
                    <th className="text-left py-3 px-4">Side</th>
                    <th className="text-left py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">Entry Price</th>
                    <th className="text-left py-3 px-4">Current Price</th>
                    <th className="text-left py-3 px-4">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-gray-700">
                      <td className="py-3 px-4 font-semibold">{pos.symbol}</td>
                      <td className={`py-3 px-4 font-semibold ${
                        pos.side === 'LONG' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pos.side}
                      </td>
                      <td className="py-3 px-4">{pos.quantity}</td>
                      <td className="py-3 px-4">${pos.entryPrice.toFixed(4)}</td>
                      <td className="py-3 px-4">${pos.currentPrice.toFixed(4)}</td>
                      <td className={`py-3 px-4 font-semibold ${
                        pos.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${pos.unrealizedPnL.toFixed(2)}
                      </td>
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
