/**
 * Cookie-based storage utilities for persisting application data
 * All data is stored as JSON in browser cookies
 */

import Cookies from 'js-cookie';
import type {
  Campaign,
  Monitor,
  MonitorStateData,
  Alarm,
  MetricValue,
  UserPreferences,
  OnboardingState,
} from '@/types';

// Cookie keys
const COOKIE_KEYS = {
  CAMPAIGNS: 'app_campaigns',
  MONITORS: 'app_monitors',
  MONITOR_STATES: 'app_monitor_states',
  ALARMS: 'app_alarms',
  METRIC_VALUES: 'app_metric_values',
  USER_PREFERENCES: 'app_user_preferences',
  ONBOARDING_STATE: 'app_onboarding_state',
} as const;

// Cookie options (30 days expiration)
const COOKIE_OPTIONS = {
  expires: 30,
  sameSite: 'lax' as const,
};

// Generic storage functions
function setCookie<T>(key: string, value: T): void {
  try {
    const jsonValue = JSON.stringify(value);
    Cookies.set(key, jsonValue, COOKIE_OPTIONS);
  } catch (error) {
    console.error(`Error setting cookie ${key}:`, error);
  }
}

function getCookie<T>(key: string, defaultValue: T): T {
  try {
    const cookie = Cookies.get(key);
    if (!cookie) return defaultValue;
    return JSON.parse(cookie) as T;
  } catch (error) {
    console.error(`Error getting cookie ${key}:`, error);
    return defaultValue;
  }
}

function removeCookie(key: string): void {
  Cookies.remove(key);
}

// Campaigns
export function getCampaigns(): Campaign[] {
  return getCookie<Campaign[]>(COOKIE_KEYS.CAMPAIGNS, []);
}

export function saveCampaigns(campaigns: Campaign[]): void {
  setCookie(COOKIE_KEYS.CAMPAIGNS, campaigns);
}

export function getCampaign(id: string): Campaign | undefined {
  const campaigns = getCampaigns();
  return campaigns.find((c) => c.id === id);
}

export function saveCampaign(campaign: Campaign): void {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === campaign.id);

  if (index >= 0) {
    campaigns[index] = { ...campaign, updatedAt: new Date().toISOString() };
  } else {
    campaigns.push(campaign);
  }

  saveCampaigns(campaigns);
}

export function deleteCampaign(id: string): void {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter((c) => c.id !== id);
  saveCampaigns(filtered);
}

// Monitors
export function getMonitors(): Monitor[] {
  return getCookie<Monitor[]>(COOKIE_KEYS.MONITORS, []);
}

export function saveMonitors(monitors: Monitor[]): void {
  setCookie(COOKIE_KEYS.MONITORS, monitors);
}

export function getMonitorsByCampaign(campaignId: string): Monitor[] {
  const monitors = getMonitors();
  return monitors.filter((m) => m.campaignId === campaignId);
}

export function getMonitor(id: string): Monitor | undefined {
  const monitors = getMonitors();
  return monitors.find((m) => m.id === id);
}

export function saveMonitor(monitor: Monitor): void {
  const monitors = getMonitors();
  const index = monitors.findIndex((m) => m.id === monitor.id);

  if (index >= 0) {
    monitors[index] = monitor;
  } else {
    monitors.push(monitor);
  }

  saveMonitors(monitors);
}

// Monitor States
export function getMonitorStates(): MonitorStateData[] {
  return getCookie<MonitorStateData[]>(COOKIE_KEYS.MONITOR_STATES, []);
}

export function saveMonitorStates(states: MonitorStateData[]): void {
  setCookie(COOKIE_KEYS.MONITOR_STATES, states);
}

export function getMonitorState(monitorId: string): MonitorStateData | undefined {
  const states = getMonitorStates();
  return states.find((s) => s.monitorId === monitorId);
}

export function saveMonitorState(state: MonitorStateData): void {
  const states = getMonitorStates();
  const index = states.findIndex((s) => s.monitorId === state.monitorId);

  state.updatedAt = new Date().toISOString();

  if (index >= 0) {
    states[index] = state;
  } else {
    states.push(state);
  }

  saveMonitorStates(states);
}

// Alarms
export function getAlarms(): Alarm[] {
  return getCookie<Alarm[]>(COOKIE_KEYS.ALARMS, []);
}

export function saveAlarms(alarms: Alarm[]): void {
  setCookie(COOKIE_KEYS.ALARMS, alarms);
}

export function getAlarm(id: string): Alarm | undefined {
  const alarms = getAlarms();
  return alarms.find((a) => a.id === id);
}

export function getAlarmsByCampaign(campaignId: string): Alarm[] {
  const alarms = getAlarms();
  return alarms.filter((a) => a.campaignId === campaignId);
}

export function getActiveAlarms(): Alarm[] {
  const alarms = getAlarms();
  return alarms.filter((a) => a.state === 'ACTIVE');
}

export function saveAlarm(alarm: Alarm): void {
  const alarms = getAlarms();
  const index = alarms.findIndex((a) => a.id === alarm.id);

  if (index >= 0) {
    alarms[index] = alarm;
  } else {
    alarms.push(alarm);
  }

  saveAlarms(alarms);
}

// Metric Values
export function getMetricValues(): MetricValue[] {
  return getCookie<MetricValue[]>(COOKIE_KEYS.METRIC_VALUES, []);
}

export function saveMetricValues(values: MetricValue[]): void {
  setCookie(COOKIE_KEYS.METRIC_VALUES, values);
}

export function getMetricValuesByCampaign(campaignId: string): MetricValue[] {
  const values = getMetricValues();
  return values.filter((v) => v.campaignId === campaignId);
}

export function getMetricValuesByCampaignAndMetric(
  campaignId: string,
  metricId: string
): MetricValue[] {
  const values = getMetricValues();
  return values
    .filter((v) => v.campaignId === campaignId && v.metricId === metricId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function saveMetricValue(value: MetricValue): void {
  const values = getMetricValues();
  values.push(value);

  // Keep only last 7 days of data to prevent cookie size issues
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const filtered = values.filter((v) => new Date(v.timestamp) >= sevenDaysAgo);
  saveMetricValues(filtered);
}

export function bulkSaveMetricValues(values: MetricValue[]): void {
  const existing = getMetricValues();
  const combined = [...existing, ...values];

  // Keep only last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const filtered = combined.filter((v) => new Date(v.timestamp) >= sevenDaysAgo);
  saveMetricValues(filtered);
}

// User Preferences
export function getUserPreferences(): UserPreferences {
  return getCookie<UserPreferences>(COOKIE_KEYS.USER_PREFERENCES, {
    notificationPreferences: {
      critical: { email: true, sms: true, push: true, phone: true },
      high: { email: true, sms: false, push: true },
      medium: { email: true, push: false },
      low: { email: true },
    },
    defaultSensitivity: 'Balanced',
    emailAddress: '',
    theme: 'light',
  });
}

export function saveUserPreferences(preferences: UserPreferences): void {
  setCookie(COOKIE_KEYS.USER_PREFERENCES, preferences);
}

// Onboarding State
export function getOnboardingState(): OnboardingState {
  return getCookie<OnboardingState>(COOKIE_KEYS.ONBOARDING_STATE, {
    hasSeenWelcome: false,
    hasCreatedFirstCampaign: false,
    hasEnabledMonitoring: false,
    hasViewedFirstAlarm: false,
    hasAppliedRecommendation: false,
  });
}

export function saveOnboardingState(state: OnboardingState): void {
  setCookie(COOKIE_KEYS.ONBOARDING_STATE, state);
}

export function updateOnboardingState(updates: Partial<OnboardingState>): void {
  const current = getOnboardingState();
  const updated = { ...current, ...updates };

  // Check if all steps completed
  if (
    updated.hasSeenWelcome &&
    updated.hasCreatedFirstCampaign &&
    updated.hasEnabledMonitoring &&
    updated.hasViewedFirstAlarm &&
    updated.hasAppliedRecommendation &&
    !updated.completedAt
  ) {
    updated.completedAt = new Date().toISOString();
  }

  saveOnboardingState(updated);
}

// Clear all data (for testing/reset)
export function clearAllData(): void {
  Object.values(COOKIE_KEYS).forEach((key) => {
    removeCookie(key);
  });
}

// Export data (for backup/debugging)
export function exportAllData() {
  return {
    campaigns: getCampaigns(),
    monitors: getMonitors(),
    monitorStates: getMonitorStates(),
    alarms: getAlarms(),
    metricValues: getMetricValues(),
    userPreferences: getUserPreferences(),
    onboardingState: getOnboardingState(),
  };
}

// Import data (for restore)
export function importAllData(data: ReturnType<typeof exportAllData>): void {
  if (data.campaigns) saveCampaigns(data.campaigns);
  if (data.monitors) saveMonitors(data.monitors);
  if (data.monitorStates) saveMonitorStates(data.monitorStates);
  if (data.alarms) saveAlarms(data.alarms);
  if (data.metricValues) saveMetricValues(data.metricValues);
  if (data.userPreferences) saveUserPreferences(data.userPreferences);
  if (data.onboardingState) saveOnboardingState(data.onboardingState);
}
