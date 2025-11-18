// Core domain types for the Campaign Anomaly Detection System

export type CampaignVertical =
  | 'E-commerce'
  | 'Finance'
  | 'SaaS'
  | 'Travel'
  | 'B2B'
  | 'Healthcare'
  | 'Education';

export type CampaignObjective =
  | 'Performance'
  | 'Brand Awareness'
  | 'Video'
  | 'App Install';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';

export type MonitorType = 'SIMPLE' | 'COMPOSITE' | 'GRANULAR';

export type MonitorState = 'OK' | 'IN_ALARM';

export type AlarmSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlarmState = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';

export type ResolutionMethod = 'USER_ACTION' | 'AUTO_RESOLVED' | 'DISMISSED';

export type Sensitivity = 'Strict' | 'Balanced' | 'Loose';

export type MetricCategory = 'Volume' | 'Efficiency' | 'Quality' | 'Financial';

export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

// Campaign
export interface Campaign {
  id: string;
  name: string;
  vertical: CampaignVertical;
  objective: CampaignObjective;
  dailyBudget: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: CampaignStatus;
  targeting: {
    geos: string[]; // ISO country codes
    devices: DeviceType[];
    placements?: string[]; // SSP names
  };
  monitoringEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  sensitivity: Sensitivity;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Monitor
export interface Monitor {
  id: string;
  campaignId: string;
  metricId: string;
  metricName: string;
  metricCategory: MetricCategory;
  monitorType: MonitorType;
  enabled: boolean;
  sensitivity: Sensitivity;
  compositeConfig?: {
    n: number; // N of M data points must breach
    m: number;
  };
  granularDimensions?: string[]; // ['geo', 'device']
  createdAt: string; // ISO timestamp
}

// Monitor State
export interface MonitorStateData {
  monitorId: string;
  state: MonitorState;
  currentValue: number;
  expectedValue: number;
  anomalyScore: number; // Z-score
  enteredStateAt: string; // ISO timestamp
  dataPointsBreached?: number; // For composite monitors
  dimensions?: Record<string, string>; // For granular monitors
  updatedAt: string; // ISO timestamp
}

// Alarm
export interface Alarm {
  id: string;
  monitorId: string;
  campaignId: string;
  campaignName: string;
  metricName: string;
  severity: AlarmSeverity;
  state: AlarmState;
  triggeredAt: string; // ISO timestamp
  resolvedAt?: string; // ISO timestamp
  resolutionMethod?: ResolutionMethod;
  estimatedImpactUSD?: number;
  currentValue: number;
  expectedValue: number;
  deviationPercent: number;
  dimensionalBreakdown?: Record<string, any>;
  insights?: AlarmInsights;
}

// AI-Generated Insights
export interface AlarmInsights {
  summary: string;
  rootCauses: Array<{
    cause: string;
    confidence: number; // 0-1
  }>;
  recommendations: Array<{
    action: string;
    reasoning: string;
    expectedImpact: string;
    confidence: ConfidenceLevel;
  }>;
  generatedAt: string; // ISO timestamp
}

// Metric Value (Time Series)
export interface MetricValue {
  campaignId: string;
  metricId: string;
  timestamp: string; // ISO timestamp
  value: number;
  dimensions?: Record<string, any>; // { geo: 'US', device: 'mobile' }
}

// User Preferences
export interface NotificationChannels {
  email: boolean;
  sms?: boolean;
  push?: boolean;
  phone?: boolean;
}

export interface UserPreferences {
  notificationPreferences: {
    critical: NotificationChannels;
    high: NotificationChannels;
    medium: NotificationChannels;
    low: NotificationChannels;
  };
  defaultSensitivity: Sensitivity;
  emailAddress: string;
  phoneNumber?: string;
  theme: 'light' | 'dark';
}

// Onboarding State
export interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCreatedFirstCampaign: boolean;
  hasEnabledMonitoring: boolean;
  hasViewedFirstAlarm: boolean;
  hasAppliedRecommendation: boolean;
  completedAt?: string; // ISO timestamp
}

// Metric Definition
export interface MetricDefinition {
  id: string;
  name: string;
  category: MetricCategory;
  description: string;
  unit: string; // '%', '$', '#', 'ms', etc.
  isRatio: boolean; // CTR, CVR, etc.
  dependsOn?: string[]; // IDs of metrics this depends on
  formula?: string; // For display purposes
}

// Default metrics
export const DEFAULT_METRICS: MetricDefinition[] = [
  // Volume Metrics
  {
    id: 'impressions',
    name: 'Impressions',
    category: 'Volume',
    description: 'Total ad impressions served',
    unit: '#',
    isRatio: false,
  },
  {
    id: 'clicks',
    name: 'Clicks',
    category: 'Volume',
    description: 'Total clicks received',
    unit: '#',
    isRatio: false,
  },
  {
    id: 'conversions',
    name: 'Conversions',
    category: 'Volume',
    description: 'Total conversions tracked',
    unit: '#',
    isRatio: false,
  },
  {
    id: 'impression_share',
    name: 'Impression Share',
    category: 'Volume',
    description: '% of available impressions won',
    unit: '%',
    isRatio: true,
  },
  // Efficiency Metrics
  {
    id: 'ctr',
    name: 'CTR',
    category: 'Efficiency',
    description: 'Click-Through Rate',
    unit: '%',
    isRatio: true,
    dependsOn: ['clicks', 'impressions'],
    formula: '(Clicks / Impressions) × 100',
  },
  {
    id: 'cvr',
    name: 'CVR',
    category: 'Efficiency',
    description: 'Conversion Rate',
    unit: '%',
    isRatio: true,
    dependsOn: ['conversions', 'clicks'],
    formula: '(Conversions / Clicks) × 100',
  },
  {
    id: 'cpa',
    name: 'CPA',
    category: 'Efficiency',
    description: 'Cost Per Acquisition',
    unit: '$',
    isRatio: true,
    dependsOn: ['spend', 'conversions'],
    formula: 'Spend / Conversions',
  },
  {
    id: 'cpm',
    name: 'CPM',
    category: 'Efficiency',
    description: 'Cost Per Mille (1000 impressions)',
    unit: '$',
    isRatio: true,
    dependsOn: ['spend', 'impressions'],
    formula: '(Spend / Impressions) × 1000',
  },
  {
    id: 'cpc',
    name: 'CPC',
    category: 'Efficiency',
    description: 'Cost Per Click',
    unit: '$',
    isRatio: true,
    dependsOn: ['spend', 'clicks'],
    formula: 'Spend / Clicks',
  },
  {
    id: 'roas',
    name: 'ROAS',
    category: 'Efficiency',
    description: 'Return on Ad Spend',
    unit: 'x',
    isRatio: true,
    dependsOn: ['revenue', 'spend'],
    formula: 'Revenue / Spend',
  },
  // Quality Metrics
  {
    id: 'viewability',
    name: 'Viewability',
    category: 'Quality',
    description: '% of impressions viewable',
    unit: '%',
    isRatio: true,
  },
  {
    id: 'invalid_traffic',
    name: 'Invalid Traffic',
    category: 'Quality',
    description: '% of traffic flagged as invalid/bot',
    unit: '%',
    isRatio: true,
  },
  {
    id: 'ad_load_time',
    name: 'Ad Load Time',
    category: 'Quality',
    description: 'Average time for ad to load',
    unit: 'ms',
    isRatio: false,
  },
  // Financial Metrics
  {
    id: 'spend',
    name: 'Spend',
    category: 'Financial',
    description: 'Total amount spent',
    unit: '$',
    isRatio: false,
  },
  {
    id: 'budget_utilization',
    name: 'Budget Utilization',
    category: 'Financial',
    description: '% of daily budget spent',
    unit: '%',
    isRatio: true,
    dependsOn: ['spend'],
    formula: '(Spend / Daily Budget) × 100',
  },
  {
    id: 'pacing',
    name: 'Pacing',
    category: 'Financial',
    description: 'Budget pacing status',
    unit: 'status',
    isRatio: false,
  },
];

// Helper type for chart data
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  expected?: number;
  upperBound?: number;
  lowerBound?: number;
}

// Dashboard Summary
export interface DashboardSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  healthy: number;
}
