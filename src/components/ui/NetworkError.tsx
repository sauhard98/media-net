/**
 * Network Error Handler - Handle offline state and API errors
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

export function NetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg animate-in slide-in-from-top">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-semibold">No Internet Connection</p>
              <p className="text-sm text-red-100">
                You're offline. Some features may not work properly.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-red-600 border-white hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ApiErrorProps {
  error: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ApiErrorAlert({ error, onRetry, onDismiss }: ApiErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-1">Request Failed</h4>
          <p className="text-sm text-red-700 mb-3">{error.message}</p>
          <div className="flex gap-2">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RateLimitError({ retryAfter, onDismiss }: { retryAfter?: number; onDismiss?: () => void }) {
  const [countdown, setCountdown] = useState(retryAfter || 60);

  useEffect(() => {
    if (countdown <= 0) {
      onDismiss?.();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onDismiss]);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 mb-1">Rate Limit Exceeded</h4>
          <p className="text-sm text-amber-700 mb-2">
            Too many requests. Please wait before trying again.
          </p>
          <p className="text-sm font-medium text-amber-800">
            Retry available in {countdown} seconds
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
