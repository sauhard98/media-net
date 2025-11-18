import React, { ReactNode } from 'react';
import { cn } from '@/utils/helpers';
import type { AlarmSeverity, AlarmState, MonitorState } from '@/types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  severity?: AlarmSeverity;
  state?: AlarmState | MonitorState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant,
  severity,
  state,
  size = 'md',
  className,
}: BadgeProps) {
  // Determine variant from severity or state
  let computedVariant = variant;

  if (severity) {
    const severityMap: Record<AlarmSeverity, BadgeProps['variant']> = {
      CRITICAL: 'danger',
      HIGH: 'warning',
      MEDIUM: 'warning',
      LOW: 'info',
    };
    computedVariant = severityMap[severity];
  }

  if (state) {
    const stateMap: Record<AlarmState | MonitorState, BadgeProps['variant']> = {
      ACTIVE: 'danger',
      RESOLVED: 'success',
      DISMISSED: 'default',
      IN_ALARM: 'danger',
      OK: 'success',
    };
    computedVariant = stateMap[state];
  }

  const baseStyles = 'inline-flex items-center rounded-full font-medium';

  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const finalVariant = computedVariant || 'default';

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[finalVariant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
