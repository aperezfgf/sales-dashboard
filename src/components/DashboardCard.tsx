
import React, { useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

interface DashboardCardProps {
  title: string;
  data: { label: string; value: number }[];
  chartType?: 'bar' | 'line' | 'pie';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, data, chartType = 'bar' }) => {
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [filter, setFilter] = useState<string>('All');

  const uniqueLabels = Array.from(new Set(data.map(d => d.label)));

  const filteredData = filter === 'All' ? data : data.filter(d => d.label === filter);

  const chartData = {
    labels: filteredData.map((d) => d.label),
    datasets: [
      {
        label: title,
        data: filteredData.map((d) => d.value),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'line':
        return <Line data={chartData} />;
      case 'pie':
        return <Pie data={chartData} />;
      default:
        return <Bar data={chartData} />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="All">All</option>
            {uniqueLabels.map((label, idx) => (
              <option key={idx} value={label}>{label}</option>
            ))}
          </select>
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value as 'bar' | 'line' | 'pie')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      </div>
      {renderChart()}
    </div>
  );
};
