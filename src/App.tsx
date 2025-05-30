
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import { DashboardCard } from './components/DashboardCard';
import { MetricCard } from './components/MetricCard';
import { AlertsList } from './components/AlertsList';
import { InsightBox } from './components/InsightBox';
import { SalesHeatmap } from './components/SalesHeatmap';
import { ExportButtons } from './components/ExportButtons';
import { CsvUploader } from './components/CsvUploader';
import {
  loadSalesData,
  calculateDepartmentSales,
  calculateCustomerSales,
  calculateProductSales,
  calculateSalesRepPerformance,
  generateAlerts,
  formatCurrency,
  mergeMultipleCSVs  // <- new function to merge CSVs
} from './utils/data';
import type { 
  SalesRecord,
  DepartmentSales,
  CustomerSales,
  ProductSales,
  SalesRepPerformance,
  Alert
} from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

function App() {
  const totalProfit = salesData.reduce((acc, s) =>
    acc + parseFloat(typeof s.profit === "string" ? s.profit.replace("%", "").trim() : s.profit), 0
  );

  const totalSales = salesData.reduce((acc, s) =>
    acc + parseFloat(typeof s.sales === "string" ? s.sales.replace("%", "").trim() : s.sales), 0
  );

  const avgMargin = totalSales !== 0 ? (totalProfit / totalSales) * 100 : 0;
  const cleanedMargin = isNaN(avgMargin) ? "0.0%" : `${avgMargin.toFixed(1)}%`;

  return (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard title="Total Sales" value={formatCurrency(totalSales)} />
      <MetricCard title="Total Profit" value={formatCurrency(totalProfit)} />
      <MetricCard title="Average Profit Margin" value={cleanedMargin} />
    </div>

    <div className="mb-6 max-h-64 overflow-y-scroll">
      <AlertsList alerts={alerts} />
    </div>

    <DashboardCard title="Sales by Department" data={departmentSales} chartType="bar" />
    <DashboardCard title="Sales by Customer" data={customerSales} chartType="bar" />
    <DashboardCard title="Sales by Product" data={productSales} chartType="bar" />
  </>
);



}
 

export default App;
