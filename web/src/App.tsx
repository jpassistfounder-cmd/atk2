import React, { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Watchlist } from './pages/Watchlist';
import { PositionManager } from './pages/PositionManager';
import { Analytics } from './pages/Analytics';
import { useATKStore } from './store/atk.store';
import './App.css';

type Page = 'dashboard' | 'watchlist' | 'positions' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
  const { account, setAccount, setHealth } = useATKStore();

  useEffect(() => {
    // Check server health
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [setHealth]);

  // Create demo account on load
  useEffect(() => {
    if (!account) {
      const demoAccount = {
        id: 'demo-account-1',
        name: 'Demo Account',
        balance: 10000,
        usedMargin: 0,
        availableMargin: 10000,
      };
      setAccount(demoAccount);
    }
  }, [account, setAccount]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'watchlist':
        return <Watchlist />;
      case 'positions':
        return <PositionManager />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">ATK</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                currentPage === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('watchlist')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                currentPage === 'watchlist'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              👁️ Watchlist
            </button>
            <button
              onClick={() => setCurrentPage('positions')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                currentPage === 'positions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              📊 Positions
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                currentPage === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              📈 Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
