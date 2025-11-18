/**
 * Alarm Detail Page - Full detailed view of a specific alarm
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Lightbulb,
  CheckCircle,
  X,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { formatRelativeTime, formatCurrency, getSeverityColor } from '@/utils/helpers';
import type { Alarm, Campaign, Monitor } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Tab({ active, onClick, children }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function AlarmDetail() {
  const { alarmId } = useParams<{ alarmId: string }>();
  const navigate = useNavigate();
  const { alarms, campaigns, monitors, updateOnboarding, onboarding } = useApp();

  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [activeTab, setActiveTab] = useState<'device' | 'geo' | 'exchange'>('device');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (alarmId) {
      const foundAlarm = alarms.find((a) => a.id === alarmId);
      setAlarm(foundAlarm || null);

      if (foundAlarm) {
        const foundCampaign = campaigns.find((c) => c.id === foundAlarm.campaignId);
        setCampaign(foundCampaign || null);

        const foundMonitor = monitors.find((m) => m.id === foundAlarm.monitorId);
        setMonitor(foundMonitor || null);

        // Mark as viewed
        if (!onboarding.hasViewedFirstAlarm) {
          updateOnboarding({ hasViewedFirstAlarm: true });
        }
      }
    }
  }, [alarmId, alarms, campaigns, monitors, onboarding, updateOnboarding]);

  if (!alarm || !campaign || !monitor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading alarm details..." />
      </div>
    );
  }

  const severityColors = getSeverityColor(alarm.severity);

  // Generate mock historical data for the chart
  const chartData = generateHistoricalChartData(alarm);

  const handleBack = () => {
    navigate(-1);
  };

  const handleApplyRecommendation = async (recIndex: number) => {
    setLoadingAction(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoadingAction(false);

    if (!onboarding.hasAppliedRecommendation) {
      updateOnboarding({ hasAppliedRecommendation: true });
    }

    alert(`Recommendation applied! (Demo mode - no actual changes made)`);
  };

  const handleDismissAlarm = async () => {
    if (!window.confirm('Are you sure you want to dismiss this alarm?')) return;

    setLoadingAction(true);
    // In real app, would update alarm state
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoadingAction(false);
    navigate('/');
  };

  const handleSnooze = async () => {
    setLoadingAction(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoadingAction(false);
    alert('Alarm snoozed for 2 hours');
  };

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
            <div className="flex items-center gap-3 mb-2">
              <Badge severity={alarm.severity} size="lg">
                {alarm.severity}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900">
                {alarm.metricName} Alert
              </h1>
            </div>
            <p className="text-gray-600">
              Campaign: {campaign.name} • {campaign.vertical} • {campaign.objective}
            </p>
          </div>
          <div className={`text-right`}>
            <p className="text-sm text-gray-600 mb-1">Triggered</p>
            <p className="text-lg font-semibold text-gray-900">{formatRelativeTime(alarm.triggeredAt)}</p>
            <p className="text-sm text-gray-500">{new Date(alarm.triggeredAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <Badge variant={alarm.state === 'ACTIVE' ? 'danger' : alarm.state === 'RESOLVED' ? 'success' : 'default'}>
            {alarm.state}
          </Badge>
          {alarm.estimatedImpactUSD && (
            <Badge variant="warning">
              <DollarSign className="w-3 h-3 mr-1" />
              Est. Loss: {formatCurrency(alarm.estimatedImpactUSD)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Breakdown (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Performance Trend (Last 24 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="expectedRange"
                      fill="#10b98114"
                      stroke="none"
                      name="Expected Range"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 3 }}
                      name="Actual Value"
                    />
                    <Line
                      type="monotone"
                      dataKey="expected"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Expected Value"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Current Metrics Summary */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Current Value</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alarm.currentValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Expected Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alarm.expectedValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Deviation</p>
                  <p className={`text-2xl font-bold ${Math.abs(alarm.deviationPercent) > 30 ? 'text-red-600' : 'text-amber-600'}`}>
                    {alarm.deviationPercent > 0 ? '+' : ''}
                    {alarm.deviationPercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensional Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensional Breakdown</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Analyze performance across different dimensions
              </p>
            </CardHeader>
            <CardContent>
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-4">
                  <Tab active={activeTab === 'device'} onClick={() => setActiveTab('device')}>
                    By Device
                  </Tab>
                  <Tab active={activeTab === 'geo'} onClick={() => setActiveTab('geo')}>
                    By Geography
                  </Tab>
                  <Tab active={activeTab === 'exchange'} onClick={() => setActiveTab('exchange')}>
                    By Exchange
                  </Tab>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'device' && (
                <DimensionalBreakdownView
                  title="Device Performance"
                  data={[
                    { name: 'Desktop', value: 2.8, expected: 2.5, status: 'OK', traffic: '35%' },
                    { name: 'Mobile', value: 0.8, expected: 2.0, status: 'ALARM', traffic: '45%' },
                    { name: 'Tablet', value: 2.1, expected: 1.8, status: 'OK', traffic: '20%' },
                  ]}
                  primaryIssue="Mobile"
                />
              )}

              {activeTab === 'geo' && (
                <DimensionalBreakdownView
                  title="Geographic Performance"
                  data={[
                    { name: 'US', value: 2.3, expected: 2.2, status: 'OK', traffic: '40%' },
                    { name: 'UK', value: 0.9, expected: 2.1, status: 'ALARM', traffic: '30%' },
                    { name: 'CA', value: 2.4, expected: 2.0, status: 'OK', traffic: '20%' },
                    { name: 'AU', value: 2.2, expected: 2.0, status: 'OK', traffic: '10%' },
                  ]}
                  primaryIssue="UK"
                />
              )}

              {activeTab === 'exchange' && (
                <DimensionalBreakdownView
                  title="Exchange Performance"
                  data={[
                    { name: 'Google AdX', value: 2.5, expected: 2.3, status: 'OK', traffic: '50%' },
                    { name: 'Media.Net', value: 0.5, expected: 2.0, status: 'ALARM', traffic: '30%' },
                    { name: 'Xandr', value: 2.3, expected: 2.1, status: 'OK', traffic: '20%' },
                  ]}
                  primaryIssue="Media.Net"
                />
              )}

              {/* Cross-Dimensional Analysis */}
              {alarm.dimensionalBreakdown && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Primary Issue Identified</h4>
                      <p className="text-sm text-red-800 mb-3">
                        UK Mobile traffic on Media.Net exchange is driving 90% of the overall CTR drop.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-red-700 font-medium">CTR:</span> 0.3% (Expected: 2.2%)
                        </div>
                        <div>
                          <span className="text-red-700 font-medium">Deviation:</span> -86%
                        </div>
                        <div>
                          <span className="text-red-700 font-medium">Traffic Share:</span> 45%
                        </div>
                        <div>
                          <span className="text-red-700 font-medium">Est. Waste:</span> $2,880/day
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Analysis and Actions (1/3 width) */}
        <div className="space-y-6">
          {/* AI Analysis */}
          {alarm.insights ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{alarm.insights.summary}</p>
                </div>

                {/* Root Causes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Root Causes</h4>
                  <div className="space-y-2">
                    {alarm.insights.rootCauses.map((cause, index) => (
                      <div key={index} className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Confidence</span>
                          <span className="text-sm font-bold text-amber-700">
                            {(cause.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{cause.cause}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {alarm.insights.recommendations.map((rec, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900 text-sm">#{index + 1}: {rec.action}</h5>
                          <Badge
                            variant={
                              rec.confidence === 'High'
                                ? 'success'
                                : rec.confidence === 'Medium'
                                ? 'warning'
                                : 'info'
                            }
                            size="sm"
                          >
                            {rec.confidence}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">{rec.reasoning}</p>
                        <p className="text-xs text-blue-700 font-medium mb-3">
                          Impact: {rec.expectedImpact}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleApplyRecommendation(index)}
                          disabled={loadingAction}
                          fullWidth
                        >
                          {loadingAction ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <LoadingSpinner text="Generating AI insights..." />
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" fullWidth onClick={handleSnooze} disabled={loadingAction}>
                <Clock className="w-4 h-4 mr-2" />
                Snooze for 2 Hours
              </Button>
              <Button variant="outline" fullWidth onClick={handleDismissAlarm} disabled={loadingAction}>
                <X className="w-4 h-4 mr-2" />
                Dismiss Alarm
              </Button>
              <Button variant="outline" fullWidth onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                View Campaign Details
              </Button>
            </CardContent>
          </Card>

          {/* Action Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Action Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  time={alarm.triggeredAt}
                  title="Alarm Triggered"
                  description="HIGH severity detected"
                  icon={<AlertCircle className="w-4 h-4 text-red-500" />}
                />
                <TimelineItem
                  time={alarm.triggeredAt}
                  title="Email Sent"
                  description="Notification sent to user"
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                />
                <TimelineItem
                  time={alarm.triggeredAt}
                  title="Push Notification"
                  description="Mobile alert delivered"
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface DimensionalData {
  name: string;
  value: number;
  expected: number;
  status: 'OK' | 'ALARM';
  traffic: string;
}

interface DimensionalBreakdownViewProps {
  title: string;
  data: DimensionalData[];
  primaryIssue?: string;
}

function DimensionalBreakdownView({ title, data, primaryIssue }: DimensionalBreakdownViewProps) {
  return (
    <div className="space-y-4">
      {data.map((item) => {
        const deviation = ((item.value - item.expected) / item.expected) * 100;
        const isIssue = item.status === 'ALARM';

        return (
          <div
            key={item.name}
            className={`border rounded-lg p-4 ${
              isIssue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500">Traffic: {item.traffic}</p>
              </div>
              <Badge variant={isIssue ? 'danger' : 'success'}>
                {isIssue ? 'ALARM' : 'OK'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-600 text-xs">Current</p>
                <p className={`font-bold ${isIssue ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.value.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Expected</p>
                <p className="font-bold text-gray-900">{item.expected.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Deviation</p>
                <p className={`font-bold ${deviation < -20 ? 'text-red-600' : 'text-gray-900'}`}>
                  {deviation > 0 ? '+' : ''}
                  {deviation.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isIssue ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((item.value / item.expected) * 100, 100)}%` }}
                />
              </div>
            </div>

            {item.name === primaryIssue && (
              <div className="mt-3 flex items-center text-xs text-red-700 font-medium">
                <AlertCircle className="w-3 h-3 mr-1" />
                PRIMARY ISSUE
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function TimelineItem({ time, title, description, icon }: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-sm text-gray-900">{title}</h5>
        <p className="text-xs text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(time)}</p>
      </div>
    </div>
  );
}

// Helper function to generate mock historical data
function generateHistoricalChartData(alarm: Alarm) {
  const data = [];
  const now = new Date();
  const hours = 24;

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourLabel = time.getHours() + ':00';

    // Simulate data with anomaly starting 6 hours ago
    const isAnomaly = i <= 6;
    const actual = isAnomaly
      ? alarm.currentValue + (Math.random() - 0.5) * 0.2
      : alarm.expectedValue + (Math.random() - 0.5) * 0.3;
    
    const expected = alarm.expectedValue + (Math.random() - 0.5) * 0.1;
    const expectedRange = expected * 1.25; // Upper bound of expected range

    data.push({
      time: hourLabel,
      actual: parseFloat(actual.toFixed(2)),
      expected: parseFloat(expected.toFixed(2)),
      expectedRange: parseFloat(expectedRange.toFixed(2)),
    });
  }

  return data;
}
