/**
 * Global Settings Page - Notification preferences, defaults, and storage management
 */

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  Mail,
  Phone,
  Smartphone,
  Settings as SettingsIcon,
  Database,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
} from 'lucide-react';
import Cookies from 'js-cookie';

type NotificationChannel = 'email' | 'sms' | 'push' | 'phone';
type AlarmSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface NotificationSettings {
  CRITICAL: NotificationChannel[];
  HIGH: NotificationChannel[];
  MEDIUM: NotificationChannel[];
  LOW: NotificationChannel[];
}

export function Settings() {
  const { preferences, updatePreferences } = useApp();

  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [defaultSensitivity, setDefaultSensitivity] = useState<'Strict' | 'Balanced' | 'Loose'>(
    'Balanced'
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    CRITICAL: ['email', 'sms', 'push', 'phone'],
    HIGH: ['email', 'sms', 'push'],
    MEDIUM: ['email', 'push'],
    LOW: ['email'],
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleToggleNotification = (severity: AlarmSeverity, channel: NotificationChannel) => {
    setNotifications((prev) => {
      const channels = prev[severity];
      const newChannels = channels.includes(channel)
        ? channels.filter((c) => c !== channel)
        : [...channels, channel];
      return { ...prev, [severity]: newChannels };
    });
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // In real app, would save to backend
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Save to preferences
    updatePreferences({
      ...preferences,
      defaultSensitivity,
    });
    
    // In real app, would save notification settings separately
    console.log('Notification settings:', notifications);

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleExportData = () => {
    const allData = {
      campaigns: Cookies.get('campaigns'),
      monitors: Cookies.get('monitors'),
      alarms: Cookies.get('alarms'),
      preferences: Cookies.get('preferences'),
      exported: new Date().toISOString(),
    };

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anomaly-detection-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          // Restore cookies
          if (data.campaigns) Cookies.set('campaigns', data.campaigns, { expires: 30 });
          if (data.monitors) Cookies.set('monitors', data.monitors, { expires: 30 });
          if (data.alarms) Cookies.set('alarms', data.alarms, { expires: 30 });
          if (data.preferences) Cookies.set('preferences', data.preferences, { expires: 30 });

          alert('Data imported successfully! Refreshing page...');
          window.location.reload();
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all data? This will delete all campaigns, monitors, and alarms. This action cannot be undone.'
      )
    ) {
      Cookies.remove('campaigns');
      Cookies.remove('monitors');
      Cookies.remove('alarms');
      Cookies.remove('monitor_states');
      Cookies.remove('metric_values');
      Cookies.remove('onboarding_state');
      
      alert('All data cleared. Refreshing page...');
      window.location.reload();
    }
  };

  const getStorageSize = () => {
    let total = 0;
    ['campaigns', 'monitors', 'alarms', 'monitor_states', 'metric_values', 'preferences'].forEach(
      (key) => {
        const value = Cookies.get(key);
        if (value) {
          total += value.length;
        }
      }
    );
    return (total / 1024).toFixed(2); // KB
  };

  const channelIcons = {
    email: Mail,
    sms: Smartphone,
    push: Bell,
    phone: Phone,
  };

  const channelLabels = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push Notification',
    phone: 'Phone Call',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your notification preferences and application settings</p>
      </div>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notification Channels by Severity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Notification Channels by Severity
                </h4>
                <div className="space-y-4">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as AlarmSeverity[]).map((severity) => (
                    <div
                      key={severity}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge severity={severity as any} size="sm">
                            {severity}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {severity === 'CRITICAL' && 'Immediate attention required'}
                            {severity === 'HIGH' && 'Requires prompt action'}
                            {severity === 'MEDIUM' && 'Monitor closely'}
                            {severity === 'LOW' && 'For awareness'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {(['email', 'sms', 'push', 'phone'] as NotificationChannel[]).map(
                          (channel) => {
                            const Icon = channelIcons[channel];
                            const isEnabled = notifications[severity].includes(channel);

                            return (
                              <button
                                key={channel}
                                onClick={() => handleToggleNotification(severity, channel)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                                  isEnabled
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                }`}
                              >
                                <Icon className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">
                                  {channelLabels[channel]}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Default Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Default Sensitivity */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Default Sensitivity for New Campaigns
                </label>
                <div className="space-y-2">
                  {(['Strict', 'Balanced', 'Loose'] as const).map((level) => (
                    <label
                      key={level}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="defaultSensitivity"
                        value={level}
                        checked={defaultSensitivity === level}
                        onChange={(e) => setDefaultSensitivity(e.target.value as any)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{level}</div>
                        <div className="text-xs text-gray-500">
                          {level === 'Strict' && '±15% deviation threshold - More alerts'}
                          {level === 'Balanced' && '±25% deviation threshold - Recommended'}
                          {level === 'Loose' && '±40% deviation threshold - Fewer alerts'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Theme (Future) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Theme <Badge variant="info" size="sm">Coming Soon</Badge>
                </label>
                <div className="flex gap-3">
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  >
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">Light</span>
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  >
                    <Moon className="w-5 h-5" />
                    <span className="font-medium">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Storage Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Storage Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Cookie Storage</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      All data is stored locally in browser cookies for 30 days. No server storage.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-blue-900">Current Usage:</span>
                      <Badge variant="info" size="sm">
                        {getStorageSize()} KB
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Actions */}
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" onClick={handleExportData} className="flex-col h-auto py-4">
                  <Download className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Export Data</span>
                  <span className="text-xs text-gray-500 mt-1">Download JSON backup</span>
                </Button>

                <Button variant="outline" onClick={handleImportData} className="flex-col h-auto py-4">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Import Data</span>
                  <span className="text-xs text-gray-500 mt-1">Restore from backup</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearData}
                  className="flex-col h-auto py-4 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Clear All Data</span>
                  <span className="text-xs mt-1">Delete everything</span>
                </Button>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Important</h4>
                    <p className="text-sm text-amber-700">
                      Clearing browser cookies or data will permanently delete all campaigns, monitors,
                      and alarms. Export your data regularly to create backups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Settings saved successfully!</span>
            </div>
          )}
          <Button onClick={handleSave} disabled={saveStatus === 'saving'} size="lg">
            {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
