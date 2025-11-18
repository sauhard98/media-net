/**
 * Bulk Actions Modal - Manage multiple alarms at once
 */

import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Power,
  PowerOff,
  Settings,
  Bell,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  Undo,
} from 'lucide-react';
import type { Alarm } from '@/types';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAlarms: Alarm[];
  onApplyAction: (action: BulkAction) => Promise<void>;
}

export interface BulkAction {
  type: 'turnOff' | 'turnOn' | 'changeSensitivity' | 'updateNotifications' | 'dismiss' | 'export';
  params?: any;
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

function ActionCard({ icon, title, description, children, onAction, actionLabel, disabled }: ActionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {children}
      {onAction && (
        <Button onClick={onAction} disabled={disabled} fullWidth className="mt-3">
          {actionLabel || 'Apply'}
        </Button>
      )}
    </div>
  );
}

export function BulkActionsModal({ isOpen, onClose, selectedAlarms, onApplyAction }: BulkActionsModalProps) {
  const [turnOffDuration, setTurnOffDuration] = useState<string>('24h');
  const [newSensitivity, setNewSensitivity] = useState<'Strict' | 'Balanced' | 'Loose'>('Balanced');
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: true,
    push: true,
    phone: false,
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');
  const [includeDetails, setIncludeDetails] = useState({
    alarmDetails: true,
    recommendations: true,
    actionsTaken: true,
  });
  const [loading, setLoading] = useState(false);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [lastAction, setLastAction] = useState<BulkAction | null>(null);

  const handleAction = async (action: BulkAction) => {
    setLoading(true);
    try {
      await onApplyAction(action);
      setLastAction(action);
      setShowUndoToast(true);
      
      // Auto-hide undo toast after 30 seconds
      setTimeout(() => setShowUndoToast(false), 30000);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!lastAction) return;
    
    // Reverse the last action
    let reverseAction: BulkAction | null = null;
    
    switch (lastAction.type) {
      case 'turnOff':
        reverseAction = { type: 'turnOn' };
        break;
      case 'turnOn':
        reverseAction = { type: 'turnOff', params: { duration: '1h' } };
        break;
      case 'dismiss':
        // Can't undo dismiss easily
        alert('Cannot undo dismiss action');
        return;
    }
    
    if (reverseAction) {
      await onApplyAction(reverseAction);
      setShowUndoToast(false);
      setLastAction(null);
    }
  };

  const exportAlarms = () => {
    const data = selectedAlarms.map((alarm) => ({
      id: alarm.id,
      campaign: alarm.campaignName,
      metric: alarm.metricName,
      severity: alarm.severity,
      state: alarm.state,
      triggeredAt: alarm.triggeredAt,
      currentValue: alarm.currentValue,
      expectedValue: alarm.expectedValue,
      deviation: `${alarm.deviationPercent.toFixed(2)}%`,
      estimatedImpact: alarm.estimatedImpactUSD,
      ...(includeDetails.recommendations && alarm.insights ? {
        recommendations: alarm.insights.recommendations.map(r => r.action).join('; '),
      } : {}),
    }));

    if (exportFormat === 'json') {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `alarms-export-${Date.now()}.json`, 'application/json');
    } else if (exportFormat === 'csv') {
      const csv = convertToCSV(data);
      downloadFile(csv, `alarms-export-${Date.now()}.csv`, 'text/csv');
    } else {
      alert(`${exportFormat.toUpperCase()} export coming soon!`);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];
    
    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalHeader onClose={onClose}>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bulk Actions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Managing {selectedAlarms.length} selected alarm{selectedAlarms.length !== 1 ? 's' : ''}
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Selection Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Selected Alarms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlarms.slice(0, 5).map((alarm) => (
                      <Badge key={alarm.id} severity={alarm.severity} size="sm">
                        {alarm.metricName}
                      </Badge>
                    ))}
                    {selectedAlarms.length > 5 && (
                      <Badge variant="info" size="sm">
                        +{selectedAlarms.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Turn Off Alarms */}
            <ActionCard
              icon={<PowerOff className="w-5 h-5 text-blue-600" />}
              title="Turn Off Alarms"
              description="Temporarily disable notifications for selected alarms. Monitoring continues in the background."
              onAction={() => handleAction({ type: 'turnOff', params: { duration: turnOffDuration } })}
              actionLabel={`Turn Off (${selectedAlarms.length})`}
              disabled={loading}
            >
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={turnOffDuration}
                  onChange={(e) => setTurnOffDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="24h">24 hours</option>
                  <option value="until-manual">Until I re-enable</option>
                </select>
              </div>
            </ActionCard>

            {/* Turn On Alarms */}
            <ActionCard
              icon={<Power className="w-5 h-5 text-green-600" />}
              title="Turn On Alarms"
              description="Re-enable previously disabled alarms. Notifications will resume immediately."
              onAction={() => handleAction({ type: 'turnOn' })}
              actionLabel={`Turn On (${selectedAlarms.length})`}
              disabled={loading}
            />

            {/* Change Sensitivity */}
            <ActionCard
              icon={<Settings className="w-5 h-5 text-amber-600" />}
              title="Change Sensitivity"
              description="Adjust alert thresholds. May auto-resolve or trigger new alarms based on new thresholds."
              onAction={() => handleAction({ type: 'changeSensitivity', params: { sensitivity: newSensitivity } })}
              actionLabel="Update Sensitivity"
              disabled={loading}
            >
              <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Sensitivity Level
                </label>
                {(['Strict', 'Balanced', 'Loose'] as const).map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="sensitivity"
                      value={level}
                      checked={newSensitivity === level}
                      onChange={(e) => setNewSensitivity(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{level}</div>
                      <div className="text-xs text-gray-500">
                        {level === 'Strict' && '±15% deviation'}
                        {level === 'Balanced' && '±25% deviation (Recommended)'}
                        {level === 'Loose' && '±40% deviation'}
                      </div>
                    </div>
                  </label>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
                  <p className="text-xs text-amber-800">
                    ⚠️ Changing sensitivity will recalculate alarm states. Some alarms may auto-resolve.
                  </p>
                </div>
              </div>
            </ActionCard>

            {/* Update Notifications */}
            <ActionCard
              icon={<Bell className="w-5 h-5 text-purple-600" />}
              title="Update Notification Settings"
              description="Modify how you receive alerts for these alarms."
              onAction={() => handleAction({ type: 'updateNotifications', params: notificationChannels })}
              actionLabel="Update Notifications"
              disabled={loading}
            >
              <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Channels
                </label>
                {Object.entries({
                  email: 'Email',
                  sms: 'SMS',
                  push: 'Push Notification',
                  phone: 'Phone Call',
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 p-2">
                    <input
                      type="checkbox"
                      checked={notificationChannels[key as keyof typeof notificationChannels]}
                      onChange={(e) =>
                        setNotificationChannels({ ...notificationChannels, [key]: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </ActionCard>

            {/* Dismiss All */}
            <ActionCard
              icon={<Trash2 className="w-5 h-5 text-red-600" />}
              title="Dismiss All Selected"
              description="Mark alarms as reviewed and move to history. Monitoring continues."
              onAction={() => {
                if (window.confirm(`Dismiss ${selectedAlarms.length} alarms? This action can be undone within 30 seconds.`)) {
                  handleAction({ type: 'dismiss' });
                }
              }}
              actionLabel={`Dismiss (${selectedAlarms.length})`}
              disabled={loading}
            />

            {/* Export */}
            <ActionCard
              icon={<Download className="w-5 h-5 text-indigo-600" />}
              title="Export Selected Alarms"
              description="Download alarm details for reporting or analysis."
              onAction={exportAlarms}
              actionLabel="Export"
              disabled={loading}
            >
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel (XLSX)</option>
                    <option value="pdf">PDF Report</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include
                  </label>
                  <div className="space-y-2">
                    {Object.entries({
                      alarmDetails: 'Alarm Details',
                      recommendations: 'AI Recommendations',
                      actionsTaken: 'Actions Taken',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 p-2">
                        <input
                          type="checkbox"
                          checked={includeDetails[key as keyof typeof includeDetails]}
                          onChange={(e) =>
                            setIncludeDetails({ ...includeDetails, [key]: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </ActionCard>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Undo Toast */}
      {showUndoToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 max-w-md">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Action Applied Successfully</p>
              <p className="text-sm text-gray-300">
                {lastAction?.type === 'turnOff' && `${selectedAlarms.length} alarms turned off`}
                {lastAction?.type === 'turnOn' && `${selectedAlarms.length} alarms turned on`}
                {lastAction?.type === 'changeSensitivity' && 'Sensitivity updated'}
                {lastAction?.type === 'dismiss' && `${selectedAlarms.length} alarms dismissed`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleUndo} className="flex-shrink-0">
              <Undo className="w-3 h-3 mr-1" />
              Undo
            </Button>
            <button
              onClick={() => setShowUndoToast(false)}
              className="text-gray-400 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
