/**
 * Loading Skeletons - Beautiful loading states for various components
 */

import React from 'react';

export function AlarmCardSkeleton() {
  return (
    <div className="border-l-4 border-gray-200 bg-white p-4 rounded-r-lg shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-5 bg-gray-200 rounded" />
            <div className="w-32 h-5 bg-gray-200 rounded" />
          </div>
          <div className="w-full h-4 bg-gray-200 rounded" />
          <div className="w-3/4 h-4 bg-gray-200 rounded" />
          <div className="flex gap-4">
            <div className="w-24 h-3 bg-gray-200 rounded" />
            <div className="w-24 h-3 bg-gray-200 rounded" />
            <div className="w-28 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-48 h-6 bg-gray-200 rounded" />
        <div className="w-16 h-5 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="w-20 h-4 bg-gray-200 rounded" />
          <div className="w-24 h-4 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="w-20 h-4 bg-gray-200 rounded" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="w-20 h-4 bg-gray-200 rounded" />
          <div className="w-28 h-4 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex-1 h-8 bg-gray-200 rounded" />
          <div className="w-10 h-8 bg-gray-200 rounded" />
          <div className="w-10 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="w-48 h-4 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="w-16 h-5 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="w-32 h-4 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="w-16 h-5 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-4 h-4 bg-gray-200 rounded" />
        </div>
      </td>
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="mb-4">
        <div className="w-48 h-5 bg-gray-200 rounded mb-2" />
        <div className="w-64 h-4 bg-gray-200 rounded" />
      </div>
      <div className="h-[300px] bg-gray-100 rounded flex items-end justify-around gap-2 p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="w-20 h-4 bg-gray-200 rounded mb-2" />
          <div className="w-16 h-8 bg-gray-200 rounded" />
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="w-64 h-8 bg-gray-200 rounded mb-2" />
            <div className="w-48 h-4 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-10 bg-gray-200 rounded" />
            <div className="w-32 h-10 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-32 h-5 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
