import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';
import { Bell, TrendingUp, Zap, Shield } from 'lucide-react';

export function WelcomeModal() {
  const navigate = useNavigate();
  const { onboarding, completeWelcome } = useApp();

  const handleGetStarted = () => {
    completeWelcome();
    navigate('/campaigns/new');
  };

  const handleClose = () => {
    completeWelcome();
  };

  return (
    <Modal isOpen={!onboarding.hasSeenWelcome} onClose={handleClose} size="lg">
      <ModalHeader onClose={handleClose}>
        Welcome to Campaign Anomaly Detection
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              AI-Powered Campaign Monitoring
            </h3>
            <p className="text-gray-600">
              Automatically detect anomalies, get intelligent insights, and optimize your
              advertising campaigns in real-time.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Alerts</h4>
              <p className="text-sm text-gray-600">
                Get notified instantly when metrics deviate from expected patterns
              </p>
            </div>

            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Insights</h4>
              <p className="text-sm text-gray-600">
                Understand root causes and get actionable recommendations powered by AI
              </p>
            </div>

            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Auto-Optimization</h4>
              <p className="text-sm text-gray-600">
                Apply recommended actions to improve campaign performance automatically
              </p>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h4 className="font-semibold text-gray-900 mb-3">Getting Started</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Create your first campaign with targeting and budget settings</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Enable monitoring to start tracking campaign metrics</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Review alarms and apply AI-powered recommendations</span>
              </li>
            </ol>
          </div>

          {/* Demo Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> This application uses simulated data to demonstrate
              anomaly detection capabilities. Real campaigns would integrate with your ad
              platform APIs.
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose}>
          Skip Tour
        </Button>
        <Button onClick={handleGetStarted}>
          Create First Campaign
        </Button>
      </ModalFooter>
    </Modal>
  );
}
