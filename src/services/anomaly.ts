/**
 * Anomaly detection logic and monitor evaluation
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Campaign,
  Monitor,
  MonitorStateData,
  Alarm,
  AlarmSeverity,
  MetricValue,
  Sensitivity,
} from '@/types';
import { DEFAULT_METRICS } from '@/types';
import {
  getSensitivityThreshold,
  calculateDeviation,
  calculateSeverity,
  isInAlarm,
} from '@/utils/helpers';
import {
  getMetricValuesByCampaignAndMetric,
  getMonitorState,
  saveMonitorState,
  getAlarms,
  saveAlarm,
} from '@/utils/storage';
import { generateExpectedValue, generateCurrentMetricValue } from './simulation';
import { generateAlarmInsights } from './gemini';

/**
 * Create default monitors for a campaign
 */
export function createDefaultMonitors(campaign: Campaign): Monitor[] {
  const monitors: Monitor[] = [];
  const timestamp = new Date().toISOString();

  // Create simple monitors for key metrics
  const keyMetrics = ['impressions', 'clicks', 'conversions', 'ctr', 'cvr', 'cpa', 'spend'];

  keyMetrics.forEach((metricId) => {
    const metricDef = DEFAULT_METRICS.find((m) => m.id === metricId);
    if (!metricDef) return;

    monitors.push({
      id: uuidv4(),
      campaignId: campaign.id,
      metricId,
      metricName: metricDef.name,
      metricCategory: metricDef.category,
      monitorType: 'SIMPLE',
      enabled: true,
      sensitivity: campaign.sensitivity,
      createdAt: timestamp,
    });
  });

  // Create composite monitor for CTR (2 of 3 consecutive data points)
  const ctrMetric = DEFAULT_METRICS.find((m) => m.id === 'ctr');
  if (ctrMetric) {
    monitors.push({
      id: uuidv4(),
      campaignId: campaign.id,
      metricId: 'ctr',
      metricName: `${ctrMetric.name} (Composite)`,
      metricCategory: ctrMetric.category,
      monitorType: 'COMPOSITE',
      enabled: true,
      sensitivity: campaign.sensitivity,
      compositeConfig: {
        n: 2,
        m: 3,
      },
      createdAt: timestamp,
    });
  }

  // Create granular monitors for impressions by device
  const impMetric = DEFAULT_METRICS.find((m) => m.id === 'impressions');
  if (impMetric && campaign.targeting.devices.length > 1) {
    monitors.push({
      id: uuidv4(),
      campaignId: campaign.id,
      metricId: 'impressions',
      metricName: `${impMetric.name} by Device`,
      metricCategory: impMetric.category,
      monitorType: 'GRANULAR',
      enabled: true,
      sensitivity: campaign.sensitivity,
      granularDimensions: ['device'],
      createdAt: timestamp,
    });
  }

  return monitors;
}

/**
 * Evaluate a monitor and update its state
 */
export async function evaluateMonitor(
  monitor: Monitor,
  campaign: Campaign
): Promise<{ state: MonitorStateData; alarm?: Alarm }> {
  const currentValue = generateCurrentMetricValue(
    campaign,
    monitor.metricId,
    0 // Will be calculated
  );

  const expectedValue = generateExpectedValue(campaign, monitor.metricId);

  const deviation = calculateDeviation(currentValue, expectedValue);
  const inAlarm = isInAlarm(currentValue, expectedValue, monitor.sensitivity);

  // Calculate anomaly score (Z-score approximation)
  const anomalyScore = Math.abs(deviation) / 100 / getSensitivityThreshold(monitor.sensitivity);

  const timestamp = new Date().toISOString();

  // Get previous state
  const previousState = getMonitorState(monitor.id);
  const wasInAlarm = previousState?.state === 'IN_ALARM';

  // Create new state
  const newState: MonitorStateData = {
    monitorId: monitor.id,
    state: inAlarm ? 'IN_ALARM' : 'OK',
    currentValue,
    expectedValue,
    anomalyScore,
    enteredStateAt: inAlarm && !wasInAlarm ? timestamp : previousState?.enteredStateAt || timestamp,
    updatedAt: timestamp,
  };

  // Handle composite monitors
  if (monitor.monitorType === 'COMPOSITE' && monitor.compositeConfig) {
    const { breached, count } = evaluateCompositeCondition(
      monitor,
      campaign,
      currentValue,
      expectedValue
    );
    newState.dataPointsBreached = count;
    newState.state = breached ? 'IN_ALARM' : 'OK';
  }

  // Handle granular monitors
  if (monitor.monitorType === 'GRANULAR' && monitor.granularDimensions) {
    const dimensionalData = evaluateGranularDimensions(monitor, campaign);
    newState.dimensions = dimensionalData;
  }

  saveMonitorState(newState);

  // Create alarm if transitioning to IN_ALARM state
  let alarm: Alarm | undefined;
  if (newState.state === 'IN_ALARM' && !wasInAlarm) {
    alarm = await createAlarmFromMonitor(monitor, campaign, newState);
  }

  return { state: newState, alarm };
}

/**
 * Evaluate composite monitor condition (N of M data points breached)
 */
function evaluateCompositeCondition(
  monitor: Monitor,
  campaign: Campaign,
  currentValue: number,
  expectedValue: number
): { breached: boolean; count: number } {
  if (!monitor.compositeConfig) {
    return { breached: false, count: 0 };
  }

  const { n, m } = monitor.compositeConfig;

  // Get last M data points
  const historicalValues = getMetricValuesByCampaignAndMetric(
    campaign.id,
    monitor.metricId
  ).slice(-m + 1); // -m+1 because we'll add current value

  // Add current value
  const allValues = [
    ...historicalValues.map((v) => v.value),
    currentValue,
  ];

  // Count how many breach the threshold
  let breachCount = 0;
  allValues.slice(-m).forEach((value) => {
    if (isInAlarm(value, expectedValue, monitor.sensitivity)) {
      breachCount++;
    }
  });

  return {
    breached: breachCount >= n,
    count: breachCount,
  };
}

/**
 * Evaluate granular dimensions (e.g., by device, geo)
 */
function evaluateGranularDimensions(
  monitor: Monitor,
  campaign: Campaign
): Record<string, any> {
  const dimensionalData: Record<string, any> = {};

  if (!monitor.granularDimensions) return dimensionalData;

  // For demo, generate values for each dimension
  monitor.granularDimensions.forEach((dimension) => {
    if (dimension === 'device') {
      campaign.targeting.devices.forEach((device) => {
        const baseValue = generateExpectedValue(campaign, monitor.metricId);
        const value = baseValue * (0.8 + Math.random() * 0.4); // ±20% variation
        dimensionalData[`device_${device}`] = {
          value,
          inAlarm: Math.random() > 0.7, // 30% chance of alarm for demo
        };
      });
    }

    if (dimension === 'geo') {
      campaign.targeting.geos.forEach((geo) => {
        const baseValue = generateExpectedValue(campaign, monitor.metricId);
        const value = baseValue * (0.8 + Math.random() * 0.4);
        dimensionalData[`geo_${geo}`] = {
          value,
          inAlarm: Math.random() > 0.7,
        };
      });
    }
  });

  return dimensionalData;
}

/**
 * Create an alarm from a monitor state
 */
async function createAlarmFromMonitor(
  monitor: Monitor,
  campaign: Campaign,
  state: MonitorStateData
): Promise<Alarm> {
  const deviation = calculateDeviation(state.currentValue, state.expectedValue);
  const severity = calculateSeverity(deviation);

  const alarm: Alarm = {
    id: uuidv4(),
    monitorId: monitor.id,
    campaignId: campaign.id,
    campaignName: campaign.name,
    metricName: monitor.metricName,
    severity,
    state: 'ACTIVE',
    triggeredAt: state.enteredStateAt,
    currentValue: state.currentValue,
    expectedValue: state.expectedValue,
    deviationPercent: deviation,
    dimensionalBreakdown: state.dimensions,
    estimatedImpactUSD: calculateEstimatedImpact(campaign, monitor, deviation),
  };

  // Generate AI insights asynchronously
  try {
    const insights = await generateAlarmInsights(alarm, campaign, monitor);
    alarm.insights = insights;
  } catch (error) {
    console.error('Error generating insights:', error);
  }

  saveAlarm(alarm);
  return alarm;
}

/**
 * Calculate estimated financial impact of an anomaly
 */
function calculateEstimatedImpact(
  campaign: Campaign,
  monitor: Monitor,
  deviationPercent: number
): number {
  const dailyBudget = campaign.dailyBudget;

  // Different metrics have different impact calculations
  switch (monitor.metricId) {
    case 'cpa':
      // CPA increase means higher cost per conversion
      if (deviationPercent > 0) {
        return (dailyBudget * Math.abs(deviationPercent)) / 100;
      }
      return 0;

    case 'ctr':
    case 'cvr':
      // CTR/CVR decrease means lost conversions
      if (deviationPercent < 0) {
        // Rough estimate: each % of CVR/CTR drop = X% of budget wasted
        return (dailyBudget * Math.abs(deviationPercent) * 0.5) / 100;
      }
      return 0;

    case 'impressions':
    case 'clicks':
      // Volume decrease means underdelivery
      if (deviationPercent < 0) {
        return (dailyBudget * Math.abs(deviationPercent) * 0.3) / 100;
      }
      return 0;

    case 'spend':
      // Overspending or underspending
      return (dailyBudget * Math.abs(deviationPercent)) / 100;

    case 'invalid_traffic':
      // Invalid traffic means wasted spend
      if (deviationPercent > 0) {
        return (dailyBudget * Math.abs(deviationPercent)) / 100;
      }
      return 0;

    default:
      // Generic impact calculation
      return (dailyBudget * Math.abs(deviationPercent) * 0.2) / 100;
  }
}

/**
 * Resolve an alarm
 */
export function resolveAlarm(alarmId: string, method: 'USER_ACTION' | 'AUTO_RESOLVED'): void {
  const alarms = getAlarms();
  const alarm = alarms.find((a) => a.id === alarmId);

  if (alarm && alarm.state === 'ACTIVE') {
    alarm.state = 'RESOLVED';
    alarm.resolvedAt = new Date().toISOString();
    alarm.resolutionMethod = method;
    saveAlarm(alarm);
  }
}

/**
 * Dismiss an alarm
 */
export function dismissAlarm(alarmId: string): void {
  const alarms = getAlarms();
  const alarm = alarms.find((a) => a.id === alarmId);

  if (alarm && alarm.state === 'ACTIVE') {
    alarm.state = 'DISMISSED';
    alarm.resolvedAt = new Date().toISOString();
    alarm.resolutionMethod = 'DISMISSED';
    saveAlarm(alarm);
  }
}

/**
 * Auto-resolve alarms when metric returns to normal
 */
export function autoResolveAlarms(monitor: Monitor, state: MonitorStateData): void {
  if (state.state === 'OK') {
    const alarms = getAlarms();
    const activeAlarms = alarms.filter(
      (a) => a.monitorId === monitor.id && a.state === 'ACTIVE'
    );

    activeAlarms.forEach((alarm) => {
      resolveAlarm(alarm.id, 'AUTO_RESOLVED');
    });
  }
}

/**
 * Evaluate all monitors for a campaign
 */
export async function evaluateAllMonitors(
  campaign: Campaign,
  monitors: Monitor[]
): Promise<{ states: MonitorStateData[]; newAlarms: Alarm[] }> {
  const states: MonitorStateData[] = [];
  const newAlarms: Alarm[] = [];

  for (const monitor of monitors) {
    if (!monitor.enabled) continue;

    const result = await evaluateMonitor(monitor, campaign);
    states.push(result.state);

    if (result.alarm) {
      newAlarms.push(result.alarm);
    }

    // Auto-resolve if needed
    autoResolveAlarms(monitor, result.state);
  }

  return { states, newAlarms };
}

/**
 * Get alarm summary statistics
 */
export function getAlarmSummary(alarms: Alarm[]) {
  const activeAlarms = alarms.filter((a) => a.state === 'ACTIVE');

  return {
    critical: activeAlarms.filter((a) => a.severity === 'CRITICAL').length,
    high: activeAlarms.filter((a) => a.severity === 'HIGH').length,
    medium: activeAlarms.filter((a) => a.severity === 'MEDIUM').length,
    low: activeAlarms.filter((a) => a.severity === 'LOW').length,
    healthy: alarms.length - activeAlarms.length,
  };
}
