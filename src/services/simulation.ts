/**
 * Metric simulation engine - generates realistic campaign data
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Campaign,
  CampaignVertical,
  CampaignObjective,
  MetricValue,
  DeviceType,
} from '@/types';
import { DEFAULT_METRICS } from '@/types';

// Baseline values by vertical and objective
const BASELINE_VALUES: Record<
  CampaignVertical,
  Record<CampaignObjective, Partial<Record<string, number>>>
> = {
  'E-commerce': {
    Performance: {
      impressions: 100000,
      clicks: 2500, // 2.5% CTR
      conversions: 100, // 4% CVR
      ctr: 2.5,
      cvr: 4.0,
      cpa: 30,
      cpm: 5,
      cpc: 0.5,
      viewability: 75,
      invalid_traffic: 2,
      spend: 1250,
    },
    'Brand Awareness': {
      impressions: 500000,
      clicks: 5000,
      conversions: 50,
      ctr: 1.0,
      cvr: 1.0,
      cpm: 10,
      viewability: 80,
    },
    Video: {
      impressions: 200000,
      clicks: 4000,
      ctr: 2.0,
      cpm: 15,
      viewability: 70,
    },
    'App Install': {
      impressions: 150000,
      clicks: 3000,
      conversions: 150,
      ctr: 2.0,
      cvr: 5.0,
      cpa: 25,
    },
  },
  Finance: {
    Performance: {
      impressions: 50000,
      clicks: 250,
      conversions: 5,
      ctr: 0.5,
      cvr: 2.0,
      cpa: 100,
      cpm: 12,
      cpc: 2.0,
      viewability: 80,
      invalid_traffic: 1,
    },
    'Brand Awareness': {
      impressions: 300000,
      clicks: 1500,
      ctr: 0.5,
      cpm: 15,
      viewability: 85,
    },
    Video: {
      impressions: 100000,
      clicks: 700,
      ctr: 0.7,
      cpm: 20,
    },
    'App Install': {
      impressions: 80000,
      clicks: 600,
      conversions: 30,
      ctr: 0.75,
      cvr: 5.0,
      cpa: 80,
    },
  },
  SaaS: {
    Performance: {
      impressions: 75000,
      clicks: 1200,
      conversions: 36,
      ctr: 1.6,
      cvr: 3.0,
      cpa: 50,
      cpm: 8,
      cpc: 1.5,
      viewability: 78,
    },
    'Brand Awareness': {
      impressions: 250000,
      clicks: 2500,
      ctr: 1.0,
      cpm: 12,
    },
    Video: {
      impressions: 150000,
      clicks: 2000,
      ctr: 1.3,
      cpm: 18,
    },
    'App Install': {
      impressions: 100000,
      clicks: 1500,
      conversions: 60,
      ctr: 1.5,
      cvr: 4.0,
      cpa: 40,
    },
  },
  Travel: {
    Performance: {
      impressions: 120000,
      clicks: 2400,
      conversions: 60,
      ctr: 2.0,
      cvr: 2.5,
      cpa: 40,
      cpm: 6,
    },
    'Brand Awareness': {
      impressions: 400000,
      clicks: 4000,
      ctr: 1.0,
      cpm: 10,
    },
    Video: {
      impressions: 200000,
      clicks: 3000,
      ctr: 1.5,
      cpm: 14,
    },
    'App Install': {
      impressions: 150000,
      clicks: 2250,
      conversions: 90,
      ctr: 1.5,
      cvr: 4.0,
      cpa: 35,
    },
  },
  B2B: {
    Performance: {
      impressions: 30000,
      clicks: 450,
      conversions: 15,
      ctr: 1.5,
      cvr: 3.3,
      cpa: 120,
      cpm: 15,
      cpc: 4.0,
    },
    'Brand Awareness': {
      impressions: 150000,
      clicks: 1500,
      ctr: 1.0,
      cpm: 18,
    },
    Video: {
      impressions: 80000,
      clicks: 1000,
      ctr: 1.25,
      cpm: 22,
    },
    'App Install': {
      impressions: 50000,
      clicks: 750,
      conversions: 25,
      ctr: 1.5,
      cvr: 3.3,
      cpa: 100,
    },
  },
  Healthcare: {
    Performance: {
      impressions: 60000,
      clicks: 900,
      conversions: 30,
      ctr: 1.5,
      cvr: 3.3,
      cpa: 60,
      cpm: 10,
    },
    'Brand Awareness': {
      impressions: 200000,
      clicks: 2000,
      ctr: 1.0,
      cpm: 14,
    },
    Video: {
      impressions: 120000,
      clicks: 1500,
      ctr: 1.25,
      cpm: 18,
    },
    'App Install': {
      impressions: 80000,
      clicks: 1200,
      conversions: 48,
      ctr: 1.5,
      cvr: 4.0,
      cpa: 50,
    },
  },
  Education: {
    Performance: {
      impressions: 80000,
      clicks: 1400,
      conversions: 56,
      ctr: 1.75,
      cvr: 4.0,
      cpa: 35,
      cpm: 7,
    },
    'Brand Awareness': {
      impressions: 300000,
      clicks: 3000,
      ctr: 1.0,
      cpm: 11,
    },
    Video: {
      impressions: 180000,
      clicks: 2500,
      ctr: 1.4,
      cpm: 16,
    },
    'App Install': {
      impressions: 120000,
      clicks: 1800,
      conversions: 72,
      ctr: 1.5,
      cvr: 4.0,
      cpa: 42,
    },
  },
};

// Time patterns
function getHourMultiplier(hour: number, isB2B: boolean): number {
  if (isB2B) {
    // B2B peaks 9am-5pm
    if (hour >= 9 && hour <= 17) return 1.2;
    if (hour >= 0 && hour < 6) return 0.3;
    return 0.7;
  } else {
    // B2C peaks 7pm-10pm
    if (hour >= 19 && hour <= 22) return 1.3;
    if (hour >= 0 && hour < 6) return 0.4;
    return 1.0;
  }
}

function getDayMultiplier(dayOfWeek: number, isB2B: boolean): number {
  if (isB2B) {
    // B2B drops on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0.2;
    return 1.0;
  } else {
    // B2C stable or increases on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.1;
    return 1.0;
  }
}

// Generate metric value with noise
function generateValue(
  baseValue: number,
  hour: number,
  dayOfWeek: number,
  isB2B: boolean,
  noiseLevel: number = 0.15
): number {
  const hourMult = getHourMultiplier(hour, isB2B);
  const dayMult = getDayMultiplier(dayOfWeek, isB2B);
  const noise = 1 + (Math.random() - 0.5) * 2 * noiseLevel; // ±15% noise

  return baseValue * hourMult * dayMult * noise;
}

// Generate anomaly (for demo purposes)
function shouldGenerateAnomaly(metricId: string, timestamp: Date): boolean {
  // 20% of campaigns will have anomalies
  // Seed based on metricId to make it consistent
  const seed = metricId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed % 100) / 100;

  if (random > 0.2) return false; // This campaign won't have anomalies

  // Check if this is the right time window (last 12 hours for demo)
  const hoursAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  return hoursAgo <= 12;
}

function applyAnomaly(value: number, metricId: string): number {
  // Different anomaly types
  const seed = metricId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const anomalyType = seed % 3;

  switch (anomalyType) {
    case 0:
      // Sudden drop (40-60%)
      return value * (0.4 + Math.random() * 0.2);
    case 1:
      // Spike (150-200%)
      return value * (1.5 + Math.random() * 0.5);
    case 2:
      // Gradual decline (apply in caller)
      return value * 0.95;
    default:
      return value;
  }
}

// Generate historical data (last 7 days, hourly)
export function generateHistoricalData(campaign: Campaign): MetricValue[] {
  const values: MetricValue[] = [];
  const now = new Date();
  const isB2B = campaign.vertical === 'B2B' || campaign.vertical === 'Healthcare';

  // Get baseline for this campaign
  const baseline =
    BASELINE_VALUES[campaign.vertical]?.[campaign.objective] ||
    BASELINE_VALUES['E-commerce']['Performance'];

  // Generate data for last 7 days, hourly
  for (let daysAgo = 7; daysAgo >= 0; daysAgo--) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(hour, 0, 0, 0);

      const dayOfWeek = timestamp.getDay();

      // Generate value for each metric
      DEFAULT_METRICS.forEach((metric) => {
        const baseValue = baseline[metric.id] || 100;

        let value = generateValue(baseValue, hour, dayOfWeek, isB2B);

        // Apply anomaly if applicable
        if (shouldGenerateAnomaly(metric.id + campaign.id, timestamp)) {
          value = applyAnomaly(value, metric.id + campaign.id);
        }

        values.push({
          campaignId: campaign.id,
          metricId: metric.id,
          timestamp: timestamp.toISOString(),
          value: Math.max(0, value), // Ensure non-negative
        });

        // Generate dimensional breakdown for some metrics
        if (
          ['ctr', 'cvr', 'cpa', 'impressions', 'clicks'].includes(metric.id) &&
          Math.random() > 0.7
        ) {
          // Generate geo breakdown
          campaign.targeting.geos.forEach((geo) => {
            const geoValue = value * (0.8 + Math.random() * 0.4); // ±20% variation
            values.push({
              campaignId: campaign.id,
              metricId: metric.id,
              timestamp: timestamp.toISOString(),
              value: Math.max(0, geoValue),
              dimensions: { geo },
            });
          });

          // Generate device breakdown
          campaign.targeting.devices.forEach((device) => {
            const deviceValue = value * (0.8 + Math.random() * 0.4);
            values.push({
              campaignId: campaign.id,
              metricId: metric.id,
              timestamp: timestamp.toISOString(),
              value: Math.max(0, deviceValue),
              dimensions: { device },
            });
          });
        }
      });
    }
  }

  return values;
}

// Generate expected value for a metric (used for baseline)
export function generateExpectedValue(
  campaign: Campaign,
  metricId: string
): number {
  const baseline =
    BASELINE_VALUES[campaign.vertical]?.[campaign.objective] ||
    BASELINE_VALUES['E-commerce']['Performance'];

  const baseValue = baseline[metricId] || 100;

  // Add random adjustment (-10% to +10%)
  const adjustment = 0.9 + Math.random() * 0.2;

  return baseValue * adjustment;
}

// Simulate real-time metric update
export function generateCurrentMetricValue(
  campaign: Campaign,
  metricId: string,
  expectedValue: number
): number {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isB2B = campaign.vertical === 'B2B' || campaign.vertical === 'Healthcare';

  let value = generateValue(expectedValue, hour, dayOfWeek, isB2B, 0.15);

  // Apply anomaly if applicable
  if (shouldGenerateAnomaly(metricId + campaign.id, now)) {
    value = applyAnomaly(value, metricId + campaign.id);
  }

  return Math.max(0, value);
}
