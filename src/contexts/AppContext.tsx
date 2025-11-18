/**
 * Main React context for application state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  Campaign,
  Monitor,
  MonitorStateData,
  Alarm,
  OnboardingState,
  UserPreferences,
  DashboardSummary,
} from '@/types';
import {
  getCampaigns,
  saveCampaign as saveToStorage,
  deleteCampaign as deleteFromStorage,
  getMonitorsByCampaign,
  saveMonitor as saveMonitorToStorage,
  getMonitorStates,
  getAlarms,
  getOnboardingState,
  updateOnboardingState as updateOnboardingInStorage,
  getUserPreferences,
  saveUserPreferences as savePreferencesToStorage,
  bulkSaveMetricValues,
} from '@/utils/storage';
import { createDefaultMonitors, evaluateAllMonitors, getAlarmSummary } from '@/services/anomaly';
import { generateHistoricalData } from '@/services/simulation';

interface AppContextType {
  // Campaigns
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  setActiveCampaign: (campaign: Campaign | null) => void;
  createCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaign: (campaign: Campaign) => void;
  deleteCampaign: (id: string) => void;
  enableMonitoring: (campaignId: string) => Promise<void>;
  setupMonitoring: (
    campaignId: string,
    sensitivity: string,
    notificationPrefs: Partial<UserPreferences['notificationPreferences']>
  ) => Promise<{ success: boolean; error?: string }>;

  // Monitors
  monitors: Monitor[];
  monitorStates: MonitorStateData[];

  // Alarms
  alarms: Alarm[];
  activeAlarms: Alarm[];
  dashboardSummary: DashboardSummary;

  // Onboarding
  onboarding: OnboardingState;
  updateOnboarding: (updates: Partial<OnboardingState>) => void;
  completeWelcome: () => void;

  // User preferences
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // UI state
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Refresh data
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [monitorStates, setMonitorStates] = useState<MonitorStateData[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    healthy: 0,
  });
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    hasSeenWelcome: false,
    hasCreatedFirstCampaign: false,
    hasEnabledMonitoring: false,
    hasViewedFirstAlarm: false,
    hasAppliedRecommendation: false,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
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
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Update active alarms and summary when alarms change
  useEffect(() => {
    const active = alarms.filter((a) => a.state === 'ACTIVE');
    setActiveAlarms(active);
    setDashboardSummary(getAlarmSummary(alarms));
  }, [alarms]);

  const loadData = () => {
    const loadedCampaigns = getCampaigns();
    const loadedStates = getMonitorStates();
    const loadedAlarms = getAlarms();
    const loadedOnboarding = getOnboardingState();
    const loadedPreferences = getUserPreferences();

    setCampaigns(loadedCampaigns);
    setMonitorStates(loadedStates);
    setAlarms(loadedAlarms);
    setOnboarding(loadedOnboarding);
    setPreferences(loadedPreferences);

    // Set active campaign if there's only one
    if (loadedCampaigns.length === 1 && !activeCampaign) {
      setActiveCampaign(loadedCampaigns[0]);
    }
  };

  const createCampaign = async (campaign: Campaign) => {
    setLoading(true);
    try {
      // Save campaign
      saveToStorage(campaign);

      // Generate historical data for simulation
      const historicalData = generateHistoricalData(campaign);
      bulkSaveMetricValues(historicalData);

      // Update state
      const updatedCampaigns = getCampaigns();
      setCampaigns(updatedCampaigns);
      setActiveCampaign(campaign);

      // Update onboarding
      if (!onboarding.hasCreatedFirstCampaign) {
        updateOnboarding({ hasCreatedFirstCampaign: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = (campaign: Campaign) => {
    saveToStorage(campaign);
    const updatedCampaigns = getCampaigns();
    setCampaigns(updatedCampaigns);

    if (activeCampaign?.id === campaign.id) {
      setActiveCampaign(campaign);
    }
  };

  const deleteCampaign = (id: string) => {
    deleteFromStorage(id);
    const updatedCampaigns = getCampaigns();
    setCampaigns(updatedCampaigns);

    if (activeCampaign?.id === id) {
      setActiveCampaign(null);
    }
  };

  const enableMonitoring = async (campaignId: string) => {
    setLoading(true);
    try {
      const campaign = campaigns.find((c) => c.id === campaignId);
      if (!campaign) return;

      // Update campaign
      const updatedCampaign = {
        ...campaign,
        monitoringEnabled: true,
        anomalyDetectionEnabled: true,
      };
      saveToStorage(updatedCampaign);

      // Create default monitors
      const newMonitors = createDefaultMonitors(updatedCampaign);
      newMonitors.forEach((monitor) => saveMonitorToStorage(monitor));

      // Load all monitors for this campaign
      const campaignMonitors = getMonitorsByCampaign(campaignId);
      setMonitors(campaignMonitors);

      // Evaluate monitors to generate initial alarms
      await evaluateAllMonitors(updatedCampaign, campaignMonitors);

      // Reload data
      loadData();

      // Update onboarding
      if (!onboarding.hasEnabledMonitoring) {
        updateOnboarding({ hasEnabledMonitoring: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const setupMonitoring = async (
    campaignId: string,
    sensitivity: string,
    notificationPrefs: Partial<UserPreferences['notificationPreferences']>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const campaign = campaigns.find((c) => c.id === campaignId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      // Update campaign with sensitivity
      const updatedCampaign = {
        ...campaign,
        sensitivity: sensitivity as Campaign['sensitivity'],
        monitoringEnabled: true,
        anomalyDetectionEnabled: true,
      };
      saveToStorage(updatedCampaign);

      // Update user preferences with notification settings
      const updatedPreferences = {
        ...preferences,
        notificationPreferences: {
          ...preferences.notificationPreferences,
          ...notificationPrefs,
        },
        defaultSensitivity: sensitivity as Campaign['sensitivity'],
      };
      savePreferencesToStorage(updatedPreferences);
      setPreferences(updatedPreferences);

      // Create all 15 monitors
      const newMonitors = createDefaultMonitors(updatedCampaign);
      newMonitors.forEach((monitor) => saveMonitorToStorage(monitor));

      // Load all monitors for this campaign
      const campaignMonitors = getMonitorsByCampaign(campaignId);
      setMonitors(campaignMonitors);

      // Generate historical data (already generated in createCampaign, but ensure it exists)
      const historicalData = generateHistoricalData(updatedCampaign);
      bulkSaveMetricValues(historicalData);

      // Evaluate monitors to calculate baselines and generate initial alarms
      await evaluateAllMonitors(updatedCampaign, campaignMonitors);

      // Reload all data
      loadData();

      // Update onboarding
      if (!onboarding.hasEnabledMonitoring) {
        updateOnboarding({ hasEnabledMonitoring: true });
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up monitoring:', error);
      return { success: false, error: 'Failed to setup monitoring' };
    }
  };

  const updateOnboarding = (updates: Partial<OnboardingState>) => {
    updateOnboardingInStorage(updates);
    setOnboarding(getOnboardingState());
  };

  const completeWelcome = () => {
    updateOnboarding({ hasSeenWelcome: true });
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...updates };
    savePreferencesToStorage(updated);
    setPreferences(updated);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Reload all data from storage
      loadData();

      // Re-evaluate monitors for active campaign if monitoring is enabled
      if (activeCampaign?.monitoringEnabled) {
        const campaignMonitors = getMonitorsByCampaign(activeCampaign.id);
        await evaluateAllMonitors(activeCampaign, campaignMonitors);

        // Reload alarms after evaluation
        const updatedAlarms = getAlarms();
        setAlarms(updatedAlarms);
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AppContextType = {
    campaigns,
    activeCampaign,
    setActiveCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    enableMonitoring,
    setupMonitoring,
    monitors,
    monitorStates,
    alarms,
    activeAlarms,
    dashboardSummary,
    onboarding,
    updateOnboarding,
    completeWelcome,
    preferences,
    updatePreferences,
    loading,
    setLoading,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
