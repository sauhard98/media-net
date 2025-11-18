import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MonitoringSetupModal } from '@/components/onboarding/MonitoringSetupModal';
import type {
  Campaign,
  CampaignVertical,
  CampaignObjective,
  DeviceType,
  Sensitivity,
} from '@/types';
import {
  ArrowLeft,
  CheckCircle,
  Monitor,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';

const VERTICALS: CampaignVertical[] = [
  'E-commerce',
  'Finance',
  'SaaS',
  'Travel',
  'B2B',
  'Healthcare',
  'Education',
];

const OBJECTIVES: CampaignObjective[] = [
  'Performance',
  'Brand Awareness',
  'Video',
  'App Install',
];

const DEVICES: { value: DeviceType; label: string; icon: typeof Monitor }[] = [
  { value: 'Desktop', label: 'Desktop', icon: Monitor },
  { value: 'Mobile', label: 'Mobile', icon: Smartphone },
  { value: 'Tablet', label: 'Tablet', icon: Tablet },
];

const GEOS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

interface FormErrors {
  name?: string;
  dailyBudget?: string;
  startDate?: string;
  endDate?: string;
  devices?: string;
  geos?: string;
}

export function CreateCampaign() {
  const navigate = useNavigate();
  const { createCampaign, setupMonitoring } = useApp();

  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysLater = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    name: '',
    vertical: 'E-commerce' as CampaignVertical,
    objective: 'Performance' as CampaignObjective,
    dailyBudget: '5000',
    startDate: today,
    endDate: thirtyDaysLater,
    geos: ['US'] as string[],
    devices: ['Desktop', 'Mobile'] as DeviceType[],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  const totalSteps = 3;

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Campaign name must be at least 3 characters';
    }

    const budget = parseFloat(formData.dailyBudget);
    if (!formData.dailyBudget || isNaN(budget)) {
      newErrors.dailyBudget = 'Daily budget is required';
    } else if (budget <= 0) {
      newErrors.dailyBudget = 'Daily budget must be greater than 0';
    } else if (budget < 100) {
      newErrors.dailyBudget = 'Daily budget should be at least $100';
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const todayStart = startOfDay(new Date());

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (isBefore(start, todayStart)) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (!isAfter(end, start)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.devices.length === 0) {
      newErrors.devices = 'Please select at least one device type';
    }

    if (formData.geos.length === 0) {
      newErrors.geos = 'Please select at least one geographic target';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleToggleDevice = (device: DeviceType) => {
    setFormData((prev) => {
      const devices = prev.devices.includes(device)
        ? prev.devices.filter((d) => d !== device)
        : [...prev.devices, device];
      return { ...prev, devices };
    });
    setErrors((prev) => ({ ...prev, devices: undefined }));
  };

  const handleToggleGeo = (geo: string) => {
    setFormData((prev) => {
      const geos = prev.geos.includes(geo)
        ? prev.geos.filter((g) => g !== geo)
        : [...prev.geos, geo];
      return { ...prev, geos };
    });
    setErrors((prev) => ({ ...prev, geos: undefined }));
  };

  const handleRemoveGeo = (geo: string) => {
    setFormData((prev) => ({
      ...prev,
      geos: prev.geos.filter((g) => g !== geo),
    }));
  };

  const handleNext = () => {
    let isValid = false;

    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else {
      isValid = true;
    }

    if (isValid && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    // Create the campaign
    const campaign: Campaign = {
      id: uuidv4(),
      name: formData.name,
      vertical: formData.vertical,
      objective: formData.objective,
      dailyBudget: parseFloat(formData.dailyBudget),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      status: 'ACTIVE',
      targeting: {
        geos: formData.geos,
        devices: formData.devices,
      },
      monitoringEnabled: false, // Will be enabled in monitoring setup
      anomalyDetectionEnabled: false,
      sensitivity: 'Balanced', // Will be set in monitoring setup
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createCampaign(campaign);
    setCreatedCampaignId(campaign.id);

    // Show monitoring setup modal
    setShowMonitoringModal(true);
  };

  const handleMonitoringComplete = async (
    sensitivity: Sensitivity,
    notificationPrefs: any
  ) => {
    if (!createdCampaignId) return;

    // Setup monitoring with preferences
    await setupMonitoring(createdCampaignId, sensitivity, notificationPrefs);

    // Close modal and navigate to dashboard
    setShowMonitoringModal(false);
    navigate('/');
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-600 mt-2">
          Set up your campaign with AI-powered anomaly detection
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3].map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
              </div>
              {idx < totalSteps - 1 && (
                <div className="flex-1 h-1 mx-4">
                  <div
                    className={`h-full transition-all ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className={step === 1 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            Basic Information
          </span>
          <span className={step === 2 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            Targeting
          </span>
          <span className={step === 3 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            Review & Create
          </span>
        </div>
      </div>

      <Card>
        <CardContent>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Q4 Holiday Campaign"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vertical <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.vertical}
                    onChange={(e) =>
                      handleChange('vertical', e.target.value as CampaignVertical)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {VERTICALS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Objective <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.objective}
                    onChange={(e) =>
                      handleChange('objective', e.target.value as CampaignObjective)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {OBJECTIVES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily Budget (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.dailyBudget}
                    onChange={(e) => handleChange('dailyBudget', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.dailyBudget ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="100"
                    placeholder="5000"
                  />
                </div>
                {errors.dailyBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.dailyBudget}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min={today}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min={formData.startDate || today}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Targeting */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target Devices <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {DEVICES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleToggleDevice(value)}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        formData.devices.includes(value)
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                      }`}
                    >
                      {formData.devices.includes(value) && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      <Icon
                        className={`w-12 h-12 mx-auto mb-3 ${
                          formData.devices.includes(value)
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <div
                        className={`font-semibold ${
                          formData.devices.includes(value)
                            ? 'text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {label}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.devices && (
                  <p className="mt-2 text-sm text-red-600">{errors.devices}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target Geographies <span className="text-red-500">*</span>
                </label>

                {/* Selected Geos - Pills */}
                {formData.geos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {formData.geos.map((geoCode) => {
                      const geo = GEOS.find((g) => g.code === geoCode);
                      return (
                        <div
                          key={geoCode}
                          className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-300"
                        >
                          <span className="text-lg">{geo?.flag}</span>
                          <span className="font-medium text-sm">{geo?.name}</span>
                          <button
                            onClick={() => handleRemoveGeo(geoCode)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Available Geos - Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {GEOS.map((geo) => (
                    <button
                      key={geo.code}
                      onClick={() => handleToggleGeo(geo.code)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.geos.includes(geo.code)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{geo.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm truncate ${
                              formData.geos.includes(geo.code)
                                ? 'text-blue-700'
                                : 'text-gray-900'
                            }`}
                          >
                            {geo.name}
                          </div>
                          <div className="text-xs text-gray-500">{geo.code}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.geos && (
                  <p className="mt-2 text-sm text-red-600">{errors.geos}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Review Your Campaign
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Campaign Name</div>
                    <div className="font-semibold text-gray-900">{formData.name}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Vertical</div>
                    <div className="font-semibold text-gray-900">{formData.vertical}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Objective</div>
                    <div className="font-semibold text-gray-900">{formData.objective}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Daily Budget</div>
                    <div className="font-semibold text-gray-900">
                      ${parseFloat(formData.dailyBudget).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Campaign Period</div>
                    <div className="font-semibold text-gray-900">
                      {format(new Date(formData.startDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(formData.endDate), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Devices</div>
                    <div className="font-semibold text-gray-900">
                      {formData.devices.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Target Geographies</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.geos.map((geoCode) => {
                      const geo = GEOS.find((g) => g.code === geoCode);
                      return (
                        <div
                          key={geoCode}
                          className="inline-flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-300"
                        >
                          <span>{geo?.flag}</span>
                          <span className="font-medium text-sm">{geo?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                  AI-Powered Monitoring Enabled
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  After creating your campaign, you'll configure automated anomaly detection
                  to monitor 15 key metrics across Volume, Efficiency, Quality, and Financial
                  categories.
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Real-time anomaly detection with customizable sensitivity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>AI-generated insights and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Multi-channel notifications (Email, SMS, Push, Phone)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Demo Mode:</strong> This application uses simulated data. In
                  production, monitoring would integrate with your ad platform APIs to track
                  real-time metrics.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handleBack}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={step === totalSteps ? handleSubmit : handleNext}>
              {step === totalSteps ? 'Create Campaign' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Setup Modal */}
      <MonitoringSetupModal
        isOpen={showMonitoringModal}
        onComplete={handleMonitoringComplete}
      />
    </div>
  );
}
