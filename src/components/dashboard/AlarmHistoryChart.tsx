/**
 * Alarm History Chart - 30-day trend visualization
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import type { AlarmSeverity } from '@/types';

interface AlarmHistoryChartProps {
  alarmHistory: Array<{
    date: Date;
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }>;
  className?: string;
}

export function AlarmHistoryChart({ alarmHistory, className = '' }: AlarmHistoryChartProps) {
  const chartData = alarmHistory.map((item) => ({
    date: format(item.date, 'MMM dd'),
    Critical: item.critical,
    High: item.high,
    Medium: item.medium,
    Low: item.low,
    Total: item.total,
  }));

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Alarm Trend (30 Days)</h3>
        <p className="text-sm text-gray-600">
          Historical view of alarm activity across severity levels
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
            label={{ value: 'Alarms', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="Critical"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ fill: '#dc2626', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="High"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Medium"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Low"
            stroke="#6b7280"
            strokeWidth={2}
            dot={{ fill: '#6b7280', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600">Critical</div>
          <div className="text-2xl font-bold text-red-600">
            {alarmHistory.reduce((sum, item) => sum + item.critical, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600">High</div>
          <div className="text-2xl font-bold text-amber-600">
            {alarmHistory.reduce((sum, item) => sum + item.high, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600">Medium</div>
          <div className="text-2xl font-bold text-blue-600">
            {alarmHistory.reduce((sum, item) => sum + item.medium, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600">Low</div>
          <div className="text-2xl font-bold text-gray-600">
            {alarmHistory.reduce((sum, item) => sum + item.low, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to generate mock 30-day history
export function generateAlarmHistory(): Array<{
  date: Date;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}> {
  const history: any[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const critical = Math.floor(Math.random() * 5);
    const high = Math.floor(Math.random() * 8);
    const medium = Math.floor(Math.random() * 12);
    const low = Math.floor(Math.random() * 10);
    
    history.push({
      date,
      critical,
      high,
      medium,
      low,
      total: critical + high + medium + low,
    });
  }
  
  return history;
}
