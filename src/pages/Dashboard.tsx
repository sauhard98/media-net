import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BulkActionsModal, type BulkAction } from '@/components/alarm/BulkActionsModal';
import { FiltersDropdown, type FilterState } from '@/components/dashboard/FiltersDropdown';
import { AlarmHistoryChart, generateAlarmHistory } from '@/components/dashboard/AlarmHistoryChart';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
} from 'lucide-react';
import { formatRelativeTime, formatCurrency, getSeverityColor } from '@/utils/helpers';
import type { Alarm } from '@/types';

export function Dashboard() {
  const navigate = useNavigate();
  const {
    campaigns,
    activeCampaign,
    setActiveCampaign,
    activeAlarms,
    dashboardSummary,
    loading,
    refreshData,
    onboarding,
    updateOnboarding,
  } = useApp();

  const [selectedAlarms, setSelectedAlarms] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedAlarms, setExpandedAlarms] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    severity: [],
    campaigns: [],
    dateRange: 'last7d',
    metricCategories: [],
    actionStatus: [],
  });
  const [alarmHistory] = useState(() => generateAlarmHistory());

  // Auto-select first campaign if none selected and sync active campaign with latest data
  useEffect(() => {
    if (!activeCampaign && campaigns.length > 0) {
      setActiveCampaign(campaigns[0]);
    } else if (activeCampaign) {
      // Update active campaign with latest data from campaigns array
      const updatedCampaign = campaigns.find(c => c.id === activeCampaign.id);
      if (updatedCampaign && JSON.stringify(updatedCampaign) !== JSON.stringify(activeCampaign)) {
        setActiveCampaign(updatedCampaign);
      }
    }
  }, [campaigns, activeCampaign, setActiveCampaign]);

  // Mark first alarm as viewed
  useEffect(() => {
    if (activeAlarms.length > 0 && !onboarding.hasViewedFirstAlarm) {
      updateOnboarding({ hasViewedFirstAlarm: true });
    }
  }, [activeAlarms, onboarding, updateOnboarding]);

  const handleRefresh = () => {
    refreshData();
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleViewAlarm = (alarm: Alarm) => {
    navigate(`/alarms/${alarm.id}`);
  };

  const handleToggleAlarmSelection = (alarmId: string) => {
    setSelectedAlarms((prev) =>
      prev.includes(alarmId) ? prev.filter((id) => id !== alarmId) : [...prev, alarmId]
    );
  };

  const handleSelectAllAlarms = () => {
    if (selectedAlarms.length === filteredAlarms.length) {
      setSelectedAlarms([]);
    } else {
      setSelectedAlarms(filteredAlarms.map((a) => a.id));
    }
  };

  const handleToggleExpanded = (alarmId: string) => {
    setExpandedAlarms((prev) =>
      prev.includes(alarmId) ? prev.filter((id) => id !== alarmId) : [...prev, alarmId]
    );
  };

  const handleBulkAction = async (action: BulkAction) => {
    // In real app, this would update via API
    console.log('Bulk action:', action, 'for alarms:', selectedAlarms);
    
    // Simulate action completion
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Clear selection after action
    setSelectedAlarms([]);
    
    // Optionally refresh data
    if (action.type === 'dismiss' || action.type === 'changeSensitivity') {
      refreshData();
    }
  };

  // Apply filters
  const filteredAlarms = activeAlarms.filter((alarm) => {
    // Severity filter
    if (filters.severity.length > 0 && !filters.severity.includes(alarm.severity)) {
      return false;
    }

    // Campaign filter
    if (filters.campaigns.length > 0 && !filters.campaigns.includes(alarm.campaignId)) {
      return false;
    }

    // Date range filter
    const now = new Date();
    const alarmDate = new Date(alarm.triggeredAt);
    const hoursDiff = (now.getTime() - alarmDate.getTime()) / (1000 * 60 * 60);

    if (filters.dateRange === 'last24h' && hoursDiff > 24) return false;
    if (filters.dateRange === 'last7d' && hoursDiff > 24 * 7) return false;
    if (filters.dateRange === 'last30d' && hoursDiff > 24 * 30) return false;

    return true;
  });

  if (campaigns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Campaigns Yet</h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first campaign to enable anomaly detection and monitoring.
            </p>
            <Button onClick={handleCreateCampaign} size="lg">
              Create First Campaign
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading campaign..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{activeCampaign.name}</h1>
            <p className="text-gray-600 mt-1">
              {activeCampaign.vertical} • {activeCampaign.objective}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
        <Badge variant={activeCampaign.status === 'ACTIVE' ? 'success' : 'default'}>{activeCampaign.status}</Badge>
        {activeCampaign.monitoringEnabled && (
          <Badge variant="success" className="ml-2">Monitoring Active</Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">{dashboardSummary.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">High</p>
                <p className="text-2xl font-bold text-amber-700">{dashboardSummary.high}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-700">{dashboardSummary.medium}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low</p>
                <p className="text-2xl font-bold text-gray-700">{dashboardSummary.low}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Healthy</p>
                <p className="text-2xl font-bold text-green-700">{dashboardSummary.healthy}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alarm History Chart - Show when monitoring is enabled */}
      {activeCampaign.monitoringEnabled && (
        <AlarmHistoryChart alarmHistory={alarmHistory} className="mb-8" />
      )}

      {/* Active Alarms */}
      {!activeCampaign.monitoringEnabled ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Monitoring Not Enabled
            </h3>
            <p className="text-gray-600 mb-6">
              Enable monitoring to start detecting anomalies and receiving alerts.
            </p>
            <Button
              onClick={() => {
                // In a real app, this would be a separate flow
                alert('Monitoring setup would happen here. For demo, create a new campaign.');
              }}
            >
              Enable Monitoring
            </Button>
          </CardContent>
        </Card>
      ) : activeAlarms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No active alarms. Your campaign is performing as expected.</p>
          </CardContent>
        </Card>
      ) : (
        <>

          {/* Filters & Bulk Actions Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {selectedAlarms.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(true)}
                  >
                    Bulk Actions ({selectedAlarms.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlarms([])}
                  >
                    Clear Selection
                  </Button>
                </>
              )}
            </div>
            <FiltersDropdown
              filters={filters}
              onFiltersChange={setFilters}
              availableCampaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>

          {/* Active Alarms */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Active Alarms
                  {filteredAlarms.length !== activeAlarms.length && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredAlarms.length} of {activeAlarms.length})
                    </span>
                  )}
                </CardTitle>
                <button
                  onClick={handleSelectAllAlarms}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {selectedAlarms.length === filteredAlarms.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAlarms.slice(0, 20).map((alarm) => {
                  const severityColors = getSeverityColor(alarm.severity);
                  const isExpanded = expandedAlarms.includes(alarm.id);
                  const isSelected = selectedAlarms.includes(alarm.id);

                  return (
                    <div
                      key={alarm.id}
                      className={`border-l-4 ${severityColors.border} ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      } rounded-r-lg shadow-sm hover:shadow-md transition-all`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAlarmSelection(alarm.id);
                            }}
                            className="mt-1"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          {/* Alarm Content */}
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleViewAlarm(alarm)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge severity={alarm.severity}>{alarm.severity}</Badge>
                              <h4 className="font-semibold text-gray-900">{alarm.metricName}</h4>
                            </div>
                            {alarm.insights && (
                              <p className="text-sm text-gray-600 mb-2">
                                {alarm.insights.summary}
                              </p>
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
                              {alarm.estimatedImpactUSD && (
                                <span className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Est. impact: {formatCurrency(alarm.estimatedImpactUSD)}
                                </span>
                              )}
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && alarm.insights && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                    Top Root Causes
                                  </h5>
                                  {alarm.insights.rootCauses.slice(0, 2).map((cause, idx) => (
                                    <p key={idx} className="text-xs text-gray-600 mb-1">
                                      • {cause.cause}
                                    </p>
                                  ))}
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                    Quick Action
                                  </h5>
                                  {alarm.insights.recommendations.length > 0 && (
                                    <p className="text-xs text-blue-600">
                                      {alarm.insights.recommendations[0].action}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpanded(alarm.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 mt-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        selectedAlarms={activeAlarms.filter((a) => selectedAlarms.includes(a.id))}
        onApplyAction={handleBulkAction}
      />
    </div>
  );
}
