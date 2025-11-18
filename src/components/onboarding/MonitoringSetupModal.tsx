import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AISetupLoading } from './AISetupLoading';
import type { Sensitivity, NotificationChannels } from '@/types';
import {
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  CheckCircle,
  Mail,
  MessageSquare,
  Bell,
  Phone,
} from 'lucide-react';

interface MonitoringSetupModalProps {
  isOpen: boolean;
  onComplete: (sensitivity: Sensitivity, notificationPrefs: NotificationPreferences) => void;
}

interface NotificationPreferences {
  critical: NotificationChannels;
  high: NotificationChannels;
  medium: NotificationChannels;
  low: NotificationChannels;
}

const METRICS_BY_CATEGORY = {
  Volume: [
    { name: 'Impressions', description: 'Total ad views' },
    { name: 'Clicks', description: 'User interactions' },
    { name: 'Conversions', description: 'Goal completions' },
    { name: 'Impression Share', description: 'Market coverage' },
  ],
  Efficiency: [
    { name: 'CTR', description: 'Click-through rate' },
    { name: 'CVR', description: 'Conversion rate' },
    { name: 'CPA', description: 'Cost per acquisition' },
    { name: 'ROAS', description: 'Return on ad spend' },
  ],
  Quality: [
    { name: 'Viewability', description: 'Ad visibility' },
    { name: 'Invalid Traffic', description: 'Bot detection' },
    { name: 'Ad Load Time', description: 'Performance' },
  ],
  Financial: [
    { name: 'Spend', description: 'Total cost' },
    { name: 'Budget Utilization', description: 'Budget pacing' },
    { name: 'Pacing', description: 'Delivery rate' },
  ],
};

const SENSITIVITY_OPTIONS = [
  {
    value: 'Strict' as Sensitivity,
    label: 'Strict',
    tolerance: '±15%',
    description: 'Detect small deviations. More alerts, higher precision.',
    color: 'red',
  },
  {
    value: 'Balanced' as Sensitivity,
    label: 'Balanced',
    tolerance: '±25%',
    description: 'Detect moderate deviations. Recommended for most campaigns.',
    color: 'yellow',
  },
  {
    value: 'Loose' as Sensitivity,
    label: 'Loose',
    tolerance: '±40%',
    description: 'Detect large deviations only. Fewer alerts, major issues only.',
    color: 'green',
  },
];

const NOTIFICATION_CHANNELS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'sms', label: 'SMS', icon: MessageSquare },
  { key: 'push', label: 'Push', icon: Bell },
  { key: 'phone', label: 'Phone', icon: Phone },
];

const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export function MonitoringSetupModal({ isOpen, onComplete }: MonitoringSetupModalProps) {
  const [step, setStep] = useState(1);
  const [sensitivity, setSensitivity] = useState<Sensitivity>('Balanced');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    critical: { email: true, sms: true, push: true, phone: true },
    high: { email: true, sms: false, push: true },
    medium: { email: true, push: false },
    low: { email: true },
  });
  const [showLoading, setShowLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (step === 5 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 5 && countdown === 0) {
      onComplete(sensitivity, notificationPrefs);
    }
  }, [step, countdown, sensitivity, notificationPrefs, onComplete]);

  const handleNext = () => {
    if (step === 3) {
      setShowLoading(true);
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setStep(5);
  };

  const toggleNotification = (severity: keyof NotificationPreferences, channel: string) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [severity]: {
        ...prev[severity],
        [channel]: !prev[severity][channel as keyof NotificationChannels],
      },
    }));
  };

  if (showLoading) {
    return <AISetupLoading onComplete={handleLoadingComplete} />;
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="xl">
      <ModalHeader onClose={() => {}}>
        {step === 1 && 'Set Up Automated Monitoring'}
        {step === 2 && 'Configure Sensitivity'}
        {step === 3 && 'Notification Preferences'}
        {step === 5 && 'Setup Complete!'}
      </ModalHeader>

      <ModalBody>
        {/* Step 1: Metrics Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                We'll automatically monitor these metrics for anomalies and performance issues.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {Object.entries(METRICS_BY_CATEGORY).map(([category, metrics]) => (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center space-x-2 mb-3">
                    {category === 'Volume' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                    {category === 'Efficiency' && <Zap className="w-5 h-5 text-amber-500" />}
                    {category === 'Quality' && <Shield className="w-5 h-5 text-green-500" />}
                    {category === 'Financial' && <DollarSign className="w-5 h-5 text-purple-500" />}
                    <h3 className="font-semibold text-gray-900 text-sm">{category}</h3>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    {metrics.map((metric) => (
                      <div
                        key={metric.name}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {metric.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {metric.description}
                            </div>
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                All 15 metrics will be monitored using AI-powered anomaly detection to catch
                issues before they impact your campaign performance.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Sensitivity Configuration */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Choose how sensitive the anomaly detection should be for your campaign.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {SENSITIVITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSensitivity(option.value)}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    sensitivity === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Selected indicator */}
                  {sensitivity === option.value && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    </div>
                  )}

                  {/* Label */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{option.label}</h3>
                    <div className="text-2xl font-bold text-blue-600">{option.tolerance}</div>
                  </div>

                  {/* Visual tolerance band */}
                  <div className="mb-4">
                    <div className="h-24 rounded-lg bg-gray-100 relative overflow-hidden">
                      {/* Baseline */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-400" />

                      {/* Tolerance band */}
                      <div
                        className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${
                          option.color === 'red'
                            ? 'bg-red-100 border-red-300'
                            : option.color === 'yellow'
                            ? 'bg-yellow-100 border-yellow-300'
                            : 'bg-green-100 border-green-300'
                        } border-t border-b border-dashed transition-all`}
                        style={{
                          height:
                            option.value === 'Strict'
                              ? '30%'
                              : option.value === 'Balanced'
                              ? '50%'
                              : '80%',
                        }}
                      />

                      {/* Data points */}
                      <div className="absolute inset-0 flex items-center justify-around px-2">
                        {[...Array(7)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-blue-500"
                            style={{
                              marginTop: `${Math.sin(i) * 8}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 text-center">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Notification Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Configure how you want to be notified for different severity levels.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Severity
                    </th>
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <th key={channel.key} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center space-y-1">
                          <channel.icon className="w-5 h-5 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-700">
                            {channel.label}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SEVERITY_LEVELS.map((severity) => (
                    <tr key={severity} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              severity === 'critical'
                                ? 'bg-red-500'
                                : severity === 'high'
                                ? 'bg-orange-500'
                                : severity === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="font-medium text-gray-900 capitalize">
                            {severity}
                          </span>
                        </div>
                      </td>
                      {NOTIFICATION_CHANNELS.map((channel) => (
                        <td key={channel.key} className="text-center py-4 px-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleNotification(severity, channel.key)}
                              className={`w-10 h-6 rounded-full transition-colors ${
                                notificationPrefs[severity][
                                  channel.key as keyof NotificationChannels
                                ]
                                  ? 'bg-blue-500'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                  notificationPrefs[severity][
                                    channel.key as keyof NotificationChannels
                                  ]
                                    ? 'translate-x-5'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Recommended:</strong> Enable all channels for Critical alerts to ensure
                you never miss urgent issues.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Setup Complete */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Monitoring Setup Complete!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your campaign is now being monitored by AI-powered anomaly detection. You'll
              receive alerts when we detect any unusual patterns.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">15 Metrics Monitored</div>
                    <div className="text-sm text-gray-600">
                      Volume, Efficiency, Quality, and Financial metrics
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {sensitivity} Sensitivity
                    </div>
                    <div className="text-sm text-gray-600">
                      {
                        SENSITIVITY_OPTIONS.find((s) => s.value === sensitivity)
                          ?.description
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Notifications Configured</div>
                    <div className="text-sm text-gray-600">
                      Multi-channel alerts for all severity levels
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              Redirecting to dashboard in {countdown} seconds...
            </div>
          </div>
        )}
      </ModalBody>

      {step < 5 && (
        <ModalFooter>
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === 3 ? 'Complete Setup' : 'Next'}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
