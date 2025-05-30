
import React from 'react';

interface SalesRecord {
  date: string;
  sales: number;
}

interface Props {
  data: SalesRecord[];
}

export const SalesHeatmap: React.FC<Props> = ({ data }) => {
  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const salesByDay: { [day: string]: number } = {};

  dayMap.forEach(day => salesByDay[day] = 0);

  data.forEach((record) => {
    const day = dayMap[new Date(record.date).getDay()];
    salesByDay[day] += record.sales;
  });

  const maxSales = Math.max(...Object.values(salesByDay));

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Sales by Day of the Week</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(salesByDay).map(([day, value]) => (
          <div
            key={day}
            className="p-4 rounded text-center"
            style={{
              backgroundColor: `rgba(99, 102, 241, ${value / maxSales + 0.1})`,
              color: 'white'
            }}
          >
            <div className="font-medium">{day}</div>
            <div className="text-sm">{value.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
