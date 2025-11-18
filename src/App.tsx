import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { Dashboard } from '@/pages/Dashboard';
import { CreateCampaign } from '@/pages/CreateCampaign';
import { CampaignList } from '@/pages/CampaignList';
import { AlarmDetail } from '@/pages/AlarmDetail';
import { CampaignDetail } from '@/pages/CampaignDetail';
import { Settings as SettingsPage } from '@/pages/Settings';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { NetworkErrorHandler } from '@/components/ui/NetworkError';
import { StaleDataBanner, StorageWarning } from '@/components/ui/StaleDataBanner';
import { Bell, BarChart3, LayoutDashboard, FolderOpen, Settings } from 'lucide-react';

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Campaign Anomaly Detection
                  </h1>
                  <p className="text-xs text-gray-500">AI-Powered Monitoring</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center gap-1">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/campaigns"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/campaigns')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Campaigns
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/settings')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Campaign Anomaly Detection System - Demo Mode
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Powered by Google Gemini AI</span>
              <span>•</span>
              <span>Built with React + TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
    window.location.reload();
  };

  const handleExportData = () => {
    // This would be implemented in Settings page
    window.location.href = '/settings';
  };

  const handleClearOldData = () => {
    if (window.confirm('Clear old alarms and monitor states? Campaigns will be preserved.')) {
      document.cookie.split(';').forEach((c) => {
        const key = c.split('=')[0].trim();
        if (key === 'alarms' || key === 'monitor_states') {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      window.location.reload();
    }
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <NetworkErrorHandler />
          <StorageWarning onClearData={handleClearOldData} onExportData={handleExportData} />
          <StaleDataBanner
            lastRefreshTime={lastRefresh}
            onRefresh={handleRefresh}
            staleThresholdHours={24}
          />
          <AppLayout>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/campaigns" element={<CampaignList />} />
                <Route path="/campaigns/new" element={<CreateCampaign />} />
                <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
                <Route path="/alarms/:alarmId" element={<AlarmDetail />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
            <WelcomeModal />
          </AppLayout>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
