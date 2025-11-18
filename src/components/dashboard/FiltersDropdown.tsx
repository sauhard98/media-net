/**
 * Dashboard Filters Dropdown - Comprehensive filtering for alarms
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Filter, X, Calendar, ChevronDown } from 'lucide-react';
import type { AlarmSeverity } from '@/types';

export interface FilterState {
  severity: AlarmSeverity[];
  campaigns: string[];
  dateRange: 'last24h' | 'last7d' | 'last30d' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  metricCategories: string[];
  actionStatus: string[];
}

interface FiltersDropdownProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCampaigns: Array<{ id: string; name: string }>;
}

export function FiltersDropdown({ filters, onFiltersChange, availableCampaigns }: FiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchCampaign, setSearchCampaign] = useState('');

  const toggleSeverity = (severity: AlarmSeverity) => {
    const newSeverities = filters.severity.includes(severity)
      ? filters.severity.filter((s) => s !== severity)
      : [...filters.severity, severity];
    onFiltersChange({ ...filters, severity: newSeverities });
  };

  const toggleCampaign = (campaignId: string) => {
    const newCampaigns = filters.campaigns.includes(campaignId)
      ? filters.campaigns.filter((c) => c !== campaignId)
      : [...filters.campaigns, campaignId];
    onFiltersChange({ ...filters, campaigns: newCampaigns });
  };

  const toggleMetricCategory = (category: string) => {
    const newCategories = filters.metricCategories.includes(category)
      ? filters.metricCategories.filter((c) => c !== category)
      : [...filters.metricCategories, category];
    onFiltersChange({ ...filters, metricCategories: newCategories });
  };

  const toggleActionStatus = (status: string) => {
    const newStatuses = filters.actionStatus.includes(status)
      ? filters.actionStatus.filter((s) => s !== status)
      : [...filters.actionStatus, status];
    onFiltersChange({ ...filters, actionStatus: newStatuses });
  };

  const resetFilters = () => {
    onFiltersChange({
      severity: [],
      campaigns: [],
      dateRange: 'last7d',
      metricCategories: [],
      actionStatus: [],
    });
  };

  const activeFilterCount =
    filters.severity.length +
    filters.campaigns.length +
    filters.metricCategories.length +
    filters.actionStatus.length +
    (filters.dateRange !== 'last7d' ? 1 : 0);

  const filteredCampaigns = availableCampaigns.filter((c) =>
    c.name.toLowerCase().includes(searchCampaign.toLowerCase())
  );

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="info" size="sm" className="ml-2">
            {activeFilterCount}
          </Badge>
        )}
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={resetFilters}>
                    Reset
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Severity
                </label>
                <div className="space-y-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as AlarmSeverity[]).map((severity) => (
                    <label
                      key={severity}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.severity.includes(severity)}
                        onChange={() => toggleSeverity(severity)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Badge severity={severity} size="sm">
                        {severity}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              {/* Campaign Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Campaigns
                </label>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchCampaign}
                  onChange={(e) => setSearchCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredCampaigns.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No campaigns found</p>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <label
                        key={campaign.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.campaigns.includes(campaign.id)}
                          onChange={() => toggleCampaign(campaign.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{campaign.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Date Range
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'last24h', label: 'Last 24 hours' },
                    { value: 'last7d', label: 'Last 7 days' },
                    { value: 'last30d', label: 'Last 30 days' },
                    { value: 'custom', label: 'Custom range' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={option.value}
                        checked={filters.dateRange === option.value}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, dateRange: e.target.value as any })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                {filters.dateRange === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={filters.customDateStart || ''}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, customDateStart: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={filters.customDateEnd || ''}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, customDateEnd: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Metric Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Metric Category
                </label>
                <div className="space-y-2">
                  {['Volume', 'Efficiency', 'Quality', 'Financial'].map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.metricCategories.includes(category)}
                        onChange={() => toggleMetricCategory(category)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Action Status
                </label>
                <div className="space-y-2">
                  {[
                    'Pending',
                    'Applied',
                    'Dismissed',
                    'Auto-resolved',
                  ].map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.actionStatus.includes(status)}
                        onChange={() => toggleActionStatus(status)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <Button fullWidth onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
