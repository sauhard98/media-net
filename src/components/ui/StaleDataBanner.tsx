/**
 * Stale Data Banner - Warn users when data is outdated
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';

interface StaleDataBannerProps {
  lastRefreshTime: Date | null;
  onRefresh: () => void;
  staleThresholdHours?: number;
}

export function StaleDataBanner({
  lastRefreshTime,
  onRefresh,
  staleThresholdHours = 24,
}: StaleDataBannerProps) {
  const [isStale, setIsStale] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hoursOld, setHoursOld] = useState(0);

  useEffect(() => {
    if (!lastRefreshTime) {
      setIsStale(true);
      return;
    }

    const checkStale = () => {
      const now = new Date();
      const diff = now.getTime() - lastRefreshTime.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      setHoursOld(Math.floor(hours));
      setIsStale(hours >= staleThresholdHours);
    };

    checkStale();
    const interval = setInterval(checkStale, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastRefreshTime, staleThresholdHours]);

  if (!isStale || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Data May Be Outdated
              </p>
              <p className="text-xs text-amber-700">
                {lastRefreshTime
                  ? `Last refreshed ${hoursOld} hours ago. Consider refreshing for latest updates.`
                  : 'Unable to determine last refresh time. Please refresh to ensure data accuracy.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                onRefresh();
                setDismissed(true);
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Now
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-600 hover:text-amber-800 p-1"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StorageWarningProps {
  onClearData?: () => void;
  onExportData?: () => void;
}

export function StorageWarning({ onClearData, onExportData }: StorageWarningProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check storage usage (simplified for cookie-based storage)
    let totalSize = 0;
    ['campaigns', 'monitors', 'alarms', 'monitor_states', 'metric_values'].forEach((key) => {
      const value = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${key}=`));
      if (value) {
        totalSize += value.length;
      }
    });

    // Warn if approaching 4KB per cookie (typical browser limit)
    const largestCookie = Math.max(
      ...['campaigns', 'monitors', 'alarms', 'monitor_states', 'metric_values'].map((key) => {
        const value = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${key}=`));
        return value ? value.length : 0;
      })
    );

    if (largestCookie > 3000) {
      // 3KB threshold (75% of 4KB limit)
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                Storage Limit Warning
              </p>
              <p className="text-xs text-red-700">
                Your browser storage is nearly full. Export and clear old data to free up space.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onExportData && (
              <Button
                size="sm"
                variant="outline"
                onClick={onExportData}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Export Data
              </Button>
            )}
            {onClearData && (
              <Button
                size="sm"
                onClick={onClearData}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Clear Old Data
              </Button>
            )}
            <button
              onClick={() => setShow(false)}
              className="text-red-600 hover:text-red-800 p-1"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
