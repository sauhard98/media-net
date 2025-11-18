import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface AISetupLoadingProps {
  onComplete: () => void;
}

const SETUP_STEPS = [
  'Loading campaign data',
  'Analyzing industry benchmarks',
  'Training baseline model',
  'Validating predictions',
  'Finalizing configuration',
];

const TOTAL_DURATION = 4500; // 4.5 seconds
const STEP_DURATION = TOTAL_DURATION / SETUP_STEPS.length;

export function AISetupLoading({ onComplete }: AISetupLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (TOTAL_DURATION / 50));
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 50);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= SETUP_STEPS.length) {
          clearInterval(stepInterval);
          // Complete after a brief delay
          setTimeout(onComplete, 300);
          return prev;
        }
        return next;
      });
    }, STEP_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-md w-full px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            {/* Animated gradient spinner */}
            <div className="relative w-20 h-20">
              <svg
                className="w-20 h-20 animate-spin"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="70 200"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting Up AI Monitoring</h2>
          <p className="text-gray-600">
            Configuring anomaly detection for your campaign...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {SETUP_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step}
                className={`flex items-center space-x-3 transition-all duration-200 ${
                  isCurrent ? 'opacity-100' : isComplete ? 'opacity-75' : 'opacity-40'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {isComplete && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {isCurrent && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {isPending && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                {/* Text */}
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-blue-600'
                      : isComplete
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Overall Progress</span>
            <span className="text-xs font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
