/**
 * Campaign Detail Page - Comprehensive view of a single campaign
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import {
  ArrowLeft,
  Settings,
  Pause,
  Play,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Target,
  Trash2,
} from 'lucide-react';
import { formatRelativeTime, formatCurrency, getSeverityColor } from '@/utils/helpers';
import type { Campaign, Monitor, Alarm, MonitorStateData } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

type TabType = 'overview' | 'monitors' | 'performance' | 'history' | 'settings';

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Tab({ active, onClick, children }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { campaigns, monitors, monitorStates, alarms, updateCampaign, deleteCampaign } = useApp();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignMonitors, setCampaignMonitors] = useState<Monitor[]>([]);
  const [campaignMonitorStates, setCampaignMonitorStates] = useState<MonitorStateData[]>([]);
  const [campaignAlarms, setCampaignAlarms] = useState<Alarm[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (campaignId) {
      const foundCampaign = campaigns.find((c) => c.id === campaignId);
      setCampaign(foundCampaign || null);

      if (foundCampaign) {
        const filteredMonitors = monitors.filter((m) => m.campaignId === campaignId);
        setCampaignMonitors(filteredMonitors);

        const monitorIds = filteredMonitors.map((m) => m.id);
        const filteredStates = monitorStates.filter((s) => monitorIds.includes(s.monitorId));
        setCampaignMonitorStates(filteredStates);

        const filteredAlarms = alarms.filter((a) => a.campaignId === campaignId);
        setCampaignAlarms(filteredAlarms);
      }
    }
  }, [campaignId, campaigns, monitors, monitorStates, alarms]);

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading campaign..." />
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  const handlePauseCampaign = () => {
    const updated = { ...campaign, status: 'PAUSED' as const };
    updateCampaign(updated);
    setCampaign(updated);
  };

  const handleResumeCampaign = () => {
    const updated = { ...campaign, status: 'ACTIVE' as const };
    updateCampaign(updated);
    setCampaign(updated);
  };

  const handleDeleteCampaign = () => {
    deleteCampaign(campaign.id);
    navigate('/');
  };

  const activeAlarms = campaignAlarms.filter((a) => a.state === 'ACTIVE');
  const resolvedAlarms = campaignAlarms.filter((a) => a.state === 'RESOLVED');

  // Calculate monitor health summary
  const monitorsInAlarm = campaignMonitorStates.filter((s) => s.state === 'IN_ALARM').length;
  const monitorsOK = campaignMonitors.length - monitorsInAlarm;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
            <p className="text-gray-600">
              {campaign.vertical} • {campaign.objective}
            </p>
          </div>
          <div className="flex gap-3">
            {campaign.status === 'ACTIVE' ? (
              <Button variant="outline" onClick={handlePauseCampaign}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button variant="outline" onClick={handleResumeCampaign}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Report
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <Badge variant={campaign.status === 'ACTIVE' ? 'success' : campaign.status === 'PAUSED' ? 'warning' : 'default'}>
            {campaign.status}
          </Badge>
          {campaign.monitoringEnabled && (
            <Badge variant="success">Monitoring Active</Badge>
          )}
          <Badge variant="info">
            ${campaign.dailyBudget.toLocaleString()}/day
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-1">
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </Tab>
          <Tab active={activeTab === 'monitors'} onClick={() => setActiveTab('monitors')}>
            Monitors
          </Tab>
          <Tab active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
            Performance
          </Tab>
          <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
            History
          </Tab>
          <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
            Settings
          </Tab>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          campaign={campaign}
          monitorsOK={monitorsOK}
          monitorsInAlarm={monitorsInAlarm}
          activeAlarms={activeAlarms}
          navigate={navigate}
        />
      )}

      {activeTab === 'monitors' && (
        <MonitorsTab
          campaign={campaign}
          monitors={campaignMonitors}
          monitorStates={campaignMonitorStates}
          onConfigureMonitor={setSelectedMonitor}
        />
      )}

      {activeTab === 'performance' && (
        <PerformanceTab campaign={campaign} />
      )}

      {activeTab === 'history' && (
        <HistoryTab alarms={campaignAlarms} campaign={campaign} navigate={navigate} />
      )}

      {activeTab === 'settings'&& (
        <SettingsTab
          campaign={campaign}
          onUpdate={updateCampaign}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      )}

      {/* Monitor Config Modal */}
      {selectedMonitor && (
        <Modal isOpen={true} onClose={() => setSelectedMonitor(null)} size="lg">
          <ModalHeader onClose={() => setSelectedMonitor(null)}>
            Configure Monitor: {selectedMonitor.metricName}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monitor Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMonitor.enabled}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedMonitor.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sensitivity
                </label>
                <div className="space-y-2">
                  {['Strict', 'Balanced', 'Loose'].map((level) => (
                    <label key={level} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="sensitivity"
                        value={level}
                        checked={selectedMonitor.sensitivity === level}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{level}</div>
                        <div className="text-xs text-gray-500">
                          {level === 'Strict' && 'Alert on ±15% deviation'}
                          {level === 'Balanced' && 'Alert on ±25% deviation'}
                          {level === 'Loose' && 'Alert on ±40% deviation'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedMonitor(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedMonitor(null)}>
              Save Changes
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Modal isOpen={true} onClose={() => setShowDeleteConfirm(false)}>
          <ModalHeader onClose={() => setShowDeleteConfirm(false)}>
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium mb-2">
                  Are you sure you want to delete this campaign?
                </p>
                <p className="text-sm text-gray-600">
                  This will permanently delete "{campaign.name}" and all associated monitors,
                  alarms, and historical data. This action cannot be undone.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCampaign}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Campaign
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

// Tab Components

interface OverviewTabProps {
  campaign: Campaign;
  monitorsOK: number;
  monitorsInAlarm: number;
  activeAlarms: Alarm[];
  navigate: (path: string) => void;
}

function OverviewTab({ campaign, monitorsOK, monitorsInAlarm, activeAlarms, navigate }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Monitor Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monitor Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Healthy</p>
                  <p className="text-3xl font-bold text-green-700">{monitorsOK}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">In Alarm</p>
                  <p className="text-3xl font-bold text-red-700">{monitorsInAlarm}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Monitors</p>
                  <p className="text-3xl font-bold text-blue-700">{monitorsOK + monitorsInAlarm}</p>
                </div>
                <Target className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Active Alarms</p>
                  <p className="text-3xl font-bold text-amber-700">{activeAlarms.length}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alarms */}
      {activeAlarms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alarms ({activeAlarms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlarms.map((alarm) => {
                const severityColors = getSeverityColor(alarm.severity);
                return (
                  <div
                    key={alarm.id}
                    className={`border-l-4 ${severityColors.border} bg-white p-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => navigate(`/alarms/${alarm.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge severity={alarm.severity}>{alarm.severity}</Badge>
                          <h4 className="font-semibold text-gray-900">{alarm.metricName}</h4>
                        </div>
                        {alarm.insights && (
                          <p className="text-sm text-gray-600 mb-2">{alarm.insights.summary}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatRelativeTime(alarm.triggeredAt)}
                          </span>
                          {alarm.deviationPercent && (
                            <span className="flex items-center">
                              {alarm.deviationPercent > 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-red-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                              )}
                              {Math.abs(alarm.deviationPercent).toFixed(1)}% deviation
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Impressions" value="125,420" trend={+5.2} />
            <MetricCard title="CTR" value="1.2%" trend={-45.0} isAlarm />
            <MetricCard title="Conversions" value="1,505" trend={+2.1} />
            <MetricCard title="CPA" value="$42.00" trend={+50.0} isAlarm />
            <MetricCard title="Spend" value="$63,210" trend={+3.5} />
            <MetricCard title="ROAS" value="3.2x" trend={-8.5} />
            <MetricCard title="Viewability" value="72%" trend={+1.2} />
            <MetricCard title="Invalid Traffic" value="2.1%" trend={-0.5} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  isAlarm?: boolean;
}

function MetricCard({ title, value, trend, isAlarm }: MetricCardProps) {
  const isPositive = trend > 0 && !isAlarm;
  const isNegative = (trend < 0 && !isAlarm) || (trend > 0 && isAlarm);

  return (
    <div className={`rounded-lg p-4 ${isAlarm ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold mb-1 ${isAlarm ? 'text-red-700' : 'text-gray-900'}`}>
        {value}
      </p>
      <div className={`flex items-center text-xs ${isNegative ? 'text-red-600' : isPositive ? 'text-green-600' : 'text-gray-600'}`}>
        {trend > 0 ? (
          <TrendingUp className="w-3 h-3 mr-1" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1" />
        )}
        {Math.abs(trend).toFixed(1)}%
      </div>
    </div>
  );
}

interface MonitorsTabProps {
  campaign: Campaign;
  monitors: Monitor[];
  monitorStates: MonitorStateData[];
  onConfigureMonitor: (monitor: Monitor) => void;
}

function MonitorsTab({ campaign, monitors, monitorStates, onConfigureMonitor }: MonitorsTabProps) {
  const [filter, setFilter] = useState<'all' | 'volume' | 'efficiency' | 'quality' | 'financial'>('all');

  const filteredMonitors = monitors.filter((m) => {
    if (filter === 'all') return true;
    return m.metricCategory.toLowerCase() === filter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Monitors ({filteredMonitors.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'volume' ? 'primary' : 'outline'}
                onClick={() => setFilter('volume')}
              >
                Volume
              </Button>
              <Button
                size="sm"
                variant={filter === 'efficiency' ? 'primary' : 'outline'}
                onClick={() => setFilter('efficiency')}
              >
                Efficiency
              </Button>
              <Button
                size="sm"
                variant={filter === 'quality' ? 'primary' : 'outline'}
                onClick={() => setFilter('quality')}
              >
                Quality
              </Button>
              <Button
                size="sm"
                variant={filter === 'financial' ? 'primary' : 'outline'}
                onClick={() => setFilter('financial')}
              >
                Financial
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Monitor Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Current</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Expected</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonitors.map((monitor) => {
                  const state = monitorStates.find((s) => s.monitorId === monitor.id);
                  const isInAlarm = state?.state === 'IN_ALARM';

                  return (
                    <tr key={monitor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{monitor.metricName}</div>
                          <div className="text-xs text-gray-500">{monitor.metricCategory}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={isInAlarm ? 'danger' : 'success'}>
                          {isInAlarm ? 'ALARM' : 'OK'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">
                        {state?.currentValue.toFixed(2) || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-gray-600">
                        {state?.expectedValue.toFixed(2) || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onConfigureMonitor(monitor)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PerformanceTabProps {
  campaign: Campaign;
}

function PerformanceTab({ campaign }: PerformanceTabProps) {
  // Generate mock data
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    impressions: Math.floor(Math.random() * 50000) + 100000,
    clicks: Math.floor(Math.random() * 2000) + 1000,
    conversions: Math.floor(Math.random() * 100) + 50,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="impressions" stroke="#3b82f6" name="Impressions" />
                <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Clicks" />
                <Line type="monotone" dataKey="conversions" stroke="#f59e0b" name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['US', 'UK', 'CA', 'AU'].map((geo) => (
              <div key={geo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{geo}</div>
                  <div className="text-sm text-gray-600">Traffic: {Math.floor(Math.random() * 40 + 20)}%</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {(Math.random() * 2 + 1).toFixed(2)}% CTR
                  </div>
                  <div className="text-sm text-green-600">+{(Math.random() * 10).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface HistoryTabProps {
  alarms: Alarm[];
  campaign: Campaign;
  navigate: (path: string) => void;
}

function HistoryTab({ alarms, campaign, navigate }: HistoryTabProps) {
  const activeAlarms = alarms.filter((a) => a.state === 'ACTIVE');
  const resolvedAlarms = alarms.filter((a) => a.state === 'RESOLVED');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alarm History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alarms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No alarm history yet
              </div>
            ) : (
              <>
                {activeAlarms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Active ({activeAlarms.length})</h4>
                    <div className="space-y-2">
                      {activeAlarms.map((alarm) => (
                        <AlarmHistoryItem key={alarm.id} alarm={alarm} navigate={navigate} />
                      ))}
                    </div>
                  </div>
                )}

                {resolvedAlarms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Resolved ({resolvedAlarms.length})</h4>
                    <div className="space-y-2">
                      {resolvedAlarms.map((alarm) => (
                        <AlarmHistoryItem key={alarm.id} alarm={alarm} navigate={navigate} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AlarmHistoryItemProps {
  alarm: Alarm;
  navigate: (path: string) => void;
}

function AlarmHistoryItem({ alarm, navigate }: AlarmHistoryItemProps) {
  const severityColors = getSeverityColor(alarm.severity);
  
  return (
    <div
      className={`border-l-4 ${severityColors.border} bg-white p-3 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => navigate(`/alarms/${alarm.id}`)}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge severity={alarm.severity} size="sm">{alarm.severity}</Badge>
            <span className="font-medium text-gray-900">{alarm.metricName}</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(alarm.triggeredAt)}
            {alarm.resolvedAt && ` • Resolved ${formatRelativeTime(alarm.resolvedAt)}`}
          </div>
        </div>
        <Badge variant={alarm.state === 'ACTIVE' ? 'danger' : 'success'}>
          {alarm.state}
        </Badge>
      </div>
    </div>
  );
}

interface SettingsTabProps {
  campaign: Campaign;
  onUpdate: (campaign: Campaign) => void;
  onDelete: () => void;
}

function SettingsTab({ campaign, onUpdate, onDelete }: SettingsTabProps) {
  const [formData, setFormData] = useState({
    name: campaign.name,
    dailyBudget: campaign.dailyBudget,
    status: campaign.status,
  });

  const handleSave = () => {
    const updated = { ...campaign, ...formData };
    onUpdate(updated);
    alert('Campaign settings saved!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={formData.dailyBudget}
                onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="ENDED">Ended</option>
            </select>
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Delete Campaign</h4>
              <p className="text-sm text-gray-600">
                Permanently delete this campaign and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="danger" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
