import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import PositionManager from './pages/PositionManager';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'scanner' | 'positions' | 'analytics'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const init = async () => {
      try {
        // Fetch initial data
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">🤖 ATK - Autonomous Trading Kernel</h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded ${
                currentPage === 'dashboard' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('scanner')}
              className={`px-4 py-2 rounded ${
                currentPage === 'scanner' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Scanner
            </button>
            <button
              onClick={() => setCurrentPage('positions')}
              className={`px-4 py-2 rounded ${
                currentPage === 'positions' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Positions
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`px-4 py-2 rounded ${
                currentPage === 'analytics' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'scanner' && <Scanner />}
        {currentPage === 'positions' && <PositionManager />}
        {currentPage === 'analytics' && <Analytics />}
      </main>
    </div>
  );
};

export default App;
