import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  className?: string;
}

export function MetricCard({ title, value, trend, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}