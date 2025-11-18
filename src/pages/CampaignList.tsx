/**
 * Campaign List View - Complete list of all campaigns with filtering
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Search,
  Play,
  Pause,
  Trash2,
  Eye,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import type { Campaign } from '@/types';

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'status' | 'budget' | 'vertical' | 'objective' | 'created';
type SortOrder = 'asc' | 'desc';

export function CampaignList() {
  const navigate = useNavigate();
  const { campaigns, deleteCampaign, updateCampaign } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [verticalFilter, setVerticalFilter] = useState<string[]>([]);
  const [monitoringFilter, setMonitoringFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleToggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await updateCampaign({ ...campaign, status: newStatus });
  };

  const handleDeleteCampaign = async (campaignId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      await deleteCampaign(campaignId);
    }
  };

  // Apply filters and sorting
  const filteredCampaigns = campaigns
    .filter((campaign) => {
      // Search filter
      if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(campaign.status)) {
        return false;
      }

      // Vertical filter
      if (verticalFilter.length > 0 && !verticalFilter.includes(campaign.vertical)) {
        return false;
      }

      // Monitoring filter
      if (monitoringFilter === 'enabled' && !campaign.monitoringEnabled) {
        return false;
      }
      if (monitoringFilter === 'disabled' && campaign.monitoringEnabled) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'created') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (sortField === 'budget') {
        aVal = a.dailyBudget || 0;
        bVal = b.dailyBudget || 0;
      } else {
        aVal = a[sortField as keyof Campaign];
        bVal = b[sortField as keyof Campaign];
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage all your advertising campaigns</p>
          </div>
          <Button onClick={() => navigate('/campaigns/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Search & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(statusFilter.length > 0 || verticalFilter.length > 0 || monitoringFilter !== 'all') && (
              <Badge variant="info" size="sm" className="ml-2">
                {statusFilter.length + verticalFilter.length + (monitoringFilter !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>

          <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Status</h4>
                  <div className="space-y-2">
                    {['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'].map((status) => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={statusFilter.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStatusFilter([...statusFilter, status]);
                            } else {
                              setStatusFilter(statusFilter.filter((s) => s !== status));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <Badge variant={status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                          {status}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vertical Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Vertical</h4>
                  <div className="space-y-2">
                    {['E-Commerce', 'Finance', 'Travel', 'Healthcare', 'Gaming', 'Other'].map((vertical) => (
                      <label key={vertical} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={verticalFilter.includes(vertical)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setVerticalFilter([...verticalFilter, vertical]);
                            } else {
                              setVerticalFilter(verticalFilter.filter((v) => v !== vertical));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{vertical}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Monitoring Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Monitoring</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Campaigns' },
                      { value: 'enabled', label: 'Monitoring Enabled' },
                      { value: 'disabled', label: 'Monitoring Disabled' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="monitoring"
                          value={option.value}
                          checked={monitoringFilter === option.value}
                          onChange={(e) => setMonitoringFilter(e.target.value as any)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter([]);
                    setVerticalFilter([]);
                    setMonitoringFilter('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first campaign to start monitoring anomalies.
            </p>
            <Button onClick={() => navigate('/campaigns/new')}>Create First Campaign</Button>
          </CardContent>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results</h3>
            <p className="text-gray-600">No campaigns match your search and filters.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Campaign Name
                      <SortIcon field="name" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <SortIcon field="status" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('vertical')}
                    >
                      Vertical
                      <SortIcon field="vertical" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('objective')}
                    >
                      Objective
                      <SortIcon field="objective" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('budget')}
                    >
                      Budget
                      <SortIcon field="budget" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Monitoring
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={campaign.status === 'ACTIVE' ? 'success' : 'default'}
                          size="sm"
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {campaign.vertical}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {campaign.objective}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(campaign.dailyBudget)}/day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.monitoringEnabled ? (
                          <Badge variant="success" size="sm">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCampaign(campaign.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleCampaignStatus(campaign)}
                            className={`${
                              campaign.status === 'ACTIVE'
                                ? 'text-amber-600 hover:text-amber-700'
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={campaign.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                          >
                            {campaign.status === 'ACTIVE' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vertical:</span>
                    <span className="font-medium text-gray-900">{campaign.vertical}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Objective:</span>
                    <span className="font-medium text-gray-900">{campaign.objective}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(campaign.dailyBudget)}/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monitoring:</span>
                    {campaign.monitoringEnabled ? (
                      <Badge variant="success" size="sm">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        Disabled
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleViewCampaign(campaign.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCampaignStatus(campaign)}
                    >
                      {campaign.status === 'ACTIVE' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredCampaigns.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredCampaigns.length} of {campaigns.length} campaign
          {campaigns.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
