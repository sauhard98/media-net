/**
 * Helper utility functions
 */

import { format, formatDistanceToNow } from 'date-fns';
import type { AlarmSeverity, Sensitivity } from '@/types';

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format number with commas
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

// Format percentage
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Format metric value based on unit
export function formatMetricValue(value: number, unit: string): string {
  switch (unit) {
    case '$':
      return formatCurrency(value);
    case '%':
      return formatPercent(value);
    case '#':
      return formatNumber(value);
    case 'ms':
      return `${Math.round(value)}ms`;
    case 'x':
      return `${value.toFixed(2)}x`;
    case 'status':
      return value > 0 ? 'On Track' : value < 0 ? 'Under' : 'Over';
    default:
      return value.toFixed(2);
  }
}

// Format date
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Format duration in hours
export function formatDuration(startDate: string | Date, endDate?: string | Date): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0) {
    return `${diffMinutes}m`;
  }
  return `${diffHours}h ${diffMinutes}m`;
}

// Get severity color classes
export function getSeverityColor(severity: AlarmSeverity): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-600',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        border: 'border-amber-500',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-500',
      };
    case 'LOW':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-500',
      };
  }
}

// Get sensitivity threshold
export function getSensitivityThreshold(sensitivity: Sensitivity): number {
  switch (sensitivity) {
    case 'Strict':
      return 0.15; // ±15%
    case 'Balanced':
      return 0.25; // ±25%
    case 'Loose':
      return 0.40; // ±40%
  }
}

// Calculate deviation percentage
export function calculateDeviation(current: number, expected: number): number {
  if (expected === 0) return 0;
  return ((current - expected) / expected) * 100;
}

// Determine if value is in alarm state
export function isInAlarm(
  current: number,
  expected: number,
  sensitivity: Sensitivity
): boolean {
  const threshold = getSensitivityThreshold(sensitivity);
  const deviation = Math.abs(calculateDeviation(current, expected)) / 100;
  return deviation > threshold;
}

// Determine alarm severity based on deviation
export function calculateSeverity(deviation: number): AlarmSeverity {
  const absDeviation = Math.abs(deviation);

  if (absDeviation >= 60) return 'CRITICAL';
  if (absDeviation >= 40) return 'HIGH';
  if (absDeviation >= 25) return 'MEDIUM';
  return 'LOW';
}

// Generate random ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Class name helper (simple version of clsx)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Sleep utility for simulating delays
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get country name from ISO code
export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    US: 'United States',
    UK: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    IN: 'India',
    JP: 'Japan',
    BR: 'Brazil',
    MX: 'Mexico',
  };
  return countries[code] || code;
}
