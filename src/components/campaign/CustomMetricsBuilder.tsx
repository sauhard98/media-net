/**
 * Custom Metrics Builder - Create custom metrics from formulas
 */

import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Minus,
  X as MultiplyIcon,
  Divide,
  AlertCircle,
  CheckCircle,
  Search,
  Calculator,
} from 'lucide-react';

interface CustomMetricsBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metric: CustomMetric) => void;
  defaultMetrics: Array<{ name: string; key: string; category: string }>;
}

export interface CustomMetric {
  name: string;
  formula: string;
  tokens: FormulaToken[];
  monitoringEnabled: boolean;
  sensitivity: 'Strict' | 'Balanced' | 'Loose';
}

export interface FormulaToken {
  type: 'metric' | 'operator' | 'value' | 'parenthesis';
  value: string;
  display?: string;
}

const OPERATORS = [
  { symbol: '+', label: 'Add', icon: Plus },
  { symbol: '-', label: 'Subtract', icon: Minus },
  { symbol: '*', label: 'Multiply', icon: MultiplyIcon },
  { symbol: '/', label: 'Divide', icon: Divide },
  { symbol: '(', label: 'Open Paren', icon: null },
  { symbol: ')', label: 'Close Paren', icon: null },
];

export function CustomMetricsBuilder({
  isOpen,
  onClose,
  onSave,
  defaultMetrics,
}: CustomMetricsBuilderProps) {
  const [metricName, setMetricName] = useState('');
  const [tokens, setTokens] = useState<FormulaToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState<'Strict' | 'Balanced' | 'Loose'>('Balanced');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewValue, setPreviewValue] = useState<number | null>(null);

  const filteredMetrics = defaultMetrics.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToken = (token: FormulaToken) => {
    setTokens([...tokens, token]);
    validateFormula([...tokens, token]);
  };

  const removeToken = (index: number) => {
    const newTokens = tokens.filter((_, i) => i !== index);
    setTokens(newTokens);
    validateFormula(newTokens);
  };

  const addMetric = (metric: { name: string; key: string }) => {
    addToken({
      type: 'metric',
      value: metric.key,
      display: metric.name,
    });
  };

  const addOperator = (operator: string) => {
    addToken({
      type: operator === '(' || operator === ')' ? 'parenthesis' : 'operator',
      value: operator,
      display: operator,
    });
  };

  const addValue = () => {
    const value = prompt('Enter a numeric value:');
    if (value && !isNaN(Number(value))) {
      addToken({
        type: 'value',
        value: value,
        display: value,
      });
    }
  };

  const validateFormula = (formulaTokens: FormulaToken[]) => {
    if (formulaTokens.length === 0) {
      setValidationError(null);
      setPreviewValue(null);
      return;
    }

    // Check for balanced parentheses
    let parenCount = 0;
    for (const token of formulaTokens) {
      if (token.value === '(') parenCount++;
      if (token.value === ')') parenCount--;
      if (parenCount < 0) {
        setValidationError('Unbalanced parentheses: too many closing parentheses');
        setPreviewValue(null);
        return;
      }
    }
    if (parenCount !== 0) {
      setValidationError('Unbalanced parentheses: missing closing parenthesis');
      setPreviewValue(null);
      return;
    }

    // Check for operator/operand alternation
    let lastType = '';
    for (let i = 0; i < formulaTokens.length; i++) {
      const token = formulaTokens[i];
      
      if (token.type === 'parenthesis') {
        if (token.value === '(') {
          if (lastType === 'metric' || lastType === 'value') {
            setValidationError('Invalid formula: missing operator before opening parenthesis');
            setPreviewValue(null);
            return;
          }
        } else if (token.value === ')') {
          if (lastType === 'operator') {
            setValidationError('Invalid formula: operator before closing parenthesis');
            setPreviewValue(null);
            return;
          }
        }
        lastType = token.value === '(' ? 'operator' : 'value';
      } else if (token.type === 'operator') {
        if (lastType === 'operator' && i > 0) {
          setValidationError('Invalid formula: consecutive operators');
          setPreviewValue(null);
          return;
        }
        lastType = 'operator';
      } else {
        if (lastType === 'metric' || lastType === 'value') {
          setValidationError('Invalid formula: consecutive values');
          setPreviewValue(null);
          return;
        }
        lastType = token.type;
      }
    }

    // Check last token
    if (lastType === 'operator') {
      setValidationError('Invalid formula: cannot end with an operator');
      setPreviewValue(null);
      return;
    }

    setValidationError(null);
    
    // Calculate preview (mock values)
    try {
      const mockValues: Record<string, number> = {};
      defaultMetrics.forEach((m) => {
        mockValues[m.key] = Math.random() * 1000;
      });

      let expression = formulaTokens
        .map((t) => {
          if (t.type === 'metric') {
            return mockValues[t.value] || 0;
          }
          return t.value;
        })
        .join(' ');

      // Replace * and / with JS equivalents (already correct)
      // Evaluate using Function constructor (safe for demo)
      const result = new Function(`return ${expression}`)();
      setPreviewValue(result);
    } catch (error) {
      setPreviewValue(null);
    }
  };

  const handleSave = () => {
    if (!metricName.trim()) {
      alert('Please enter a metric name');
      return;
    }

    if (tokens.length === 0) {
      alert('Please build a formula');
      return;
    }

    if (validationError) {
      alert('Please fix validation errors before saving');
      return;
    }

    const formula = tokens.map((t) => t.display).join(' ');

    onSave({
      name: metricName,
      formula,
      tokens,
      monitoringEnabled,
      sensitivity,
    });

    // Reset
    setMetricName('');
    setTokens([]);
    setSearchQuery('');
    setValidationError(null);
    setPreviewValue(null);
    onClose();
  };

  const handleClear = () => {
    setTokens([]);
    setValidationError(null);
    setPreviewValue(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Custom Metric Builder</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Create custom metrics using mathematical formulas
            </p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Metric Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Metric Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="e.g., Adjusted Revenue Per Click"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Formula Builder */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Formula <span className="text-red-500">*</span>
            </label>

            {/* Current Formula Display */}
            <div className="border border-gray-300 rounded-lg p-4 mb-3 min-h-[80px] bg-gray-50">
              {tokens.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  Add metrics, operators, and values to build your formula
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tokens.map((token, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        token.type === 'metric'
                          ? 'bg-blue-100 text-blue-800'
                          : token.type === 'operator'
                          ? 'bg-purple-100 text-purple-800'
                          : token.type === 'value'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <span className="text-sm font-medium">{token.display}</span>
                      <button
                        onClick={() => removeToken(index)}
                        className="text-current opacity-60 hover:opacity-100"
                      >
                        <MultiplyIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Status */}
            {validationError ? (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
            ) : tokens.length > 0 ? (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium">Valid formula</p>
                  {previewValue !== null && (
                    <p className="text-xs text-green-600 mt-1">
                      Preview (with sample data): {previewValue.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Clear Button */}
            {tokens.length > 0 && (
              <div className="mb-3">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear Formula
                </Button>
              </div>
            )}

            {/* Operators */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Operators</h4>
              <div className="flex flex-wrap gap-2">
                {OPERATORS.map((op) => (
                  <button
                    key={op.symbol}
                    onClick={() => addOperator(op.symbol)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {op.icon && <op.icon className="w-4 h-4" />}
                    {op.label}
                  </button>
                ))}
                <button
                  onClick={addValue}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  Add Value
                </button>
              </div>
            </div>

            {/* Metrics Selector */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Metrics</h4>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search metrics..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
                {filteredMetrics.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No metrics found</p>
                ) : (
                  filteredMetrics.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => addMetric(metric)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                          <div className="text-xs text-gray-500">{metric.category}</div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Monitoring Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Monitoring Settings</h4>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={monitoringEnabled}
                  onChange={(e) => setMonitoringEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Enable Monitoring</div>
                  <div className="text-xs text-gray-500">
                    Create alerts when this metric shows anomalies
                  </div>
                </div>
              </label>

              {monitoringEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sensitivity
                  </label>
                  <div className="space-y-2">
                    {(['Strict', 'Balanced', 'Loose'] as const).map((level) => (
                      <label
                        key={level}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="sensitivity"
                          value={level}
                          checked={sensitivity === level}
                          onChange={(e) => setSensitivity(e.target.value as any)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{level}</div>
                          <div className="text-xs text-gray-500">
                            {level === 'Strict' && '±15% deviation threshold'}
                            {level === 'Balanced' && '±25% deviation threshold (Recommended)'}
                            {level === 'Loose' && '±40% deviation threshold'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!!validationError || tokens.length === 0}>
          Save Custom Metric
        </Button>
      </ModalFooter>
    </Modal>
  );
}
