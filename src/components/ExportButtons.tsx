
import React from 'react';

interface ExportButtonsProps {
  data: any[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ data }) => {
  const exportToCSV = () => {
    const csvContent = [
      Object.keys(data[0]).join(','), // headers
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printDashboard = () => {
    window.print();
  };

  return (
    <div className="flex gap-4 my-4">
      <button
        onClick={exportToCSV}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
      >
        Export as CSV
      </button>
      <button
        onClick={printDashboard}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
      >
        Print as PDF
      </button>
    </div>
  );
};
