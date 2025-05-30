
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
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [departmentSales, setDepartmentSales] = useState<DepartmentSales[]>([]);
  const [customerSales, setCustomerSales] = useState<CustomerSales[]>([]);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRepPerformance[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<string>("");

  
  const handleFileUpload = async (files: FileList) => {
    try {
      const newSalesData: SalesRecord[] = [];
      for (const file of Array.from(files)) {
        const text = await file.text();
        const parsed = (await import('papaparse')).default.parse<SalesRecord>(text, {
          header: true,
          skipEmptyLines: true
        });
        newSalesData.push(...parsed.data);
      }
      const merged = [...salesData, ...newSalesData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSalesData(merged);
      setDepartmentSales(calculateDepartmentSales(merged));
      setCustomerSales(calculateCustomerSales(merged));
      setProductSales(calculateProductSales(merged));
      setSalesReps(calculateSalesRepPerformance(merged));
      setAlerts(generateAlerts(merged));
      const first = new Date(merged[0].date);
      const last = new Date(merged[merged.length - 1].date);
      setCurrentPeriod(`${first.toLocaleDateString()} – ${last.toLocaleDateString()}`);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };


  
  const [insights, setInsights] = useState<string[]>([]);

  const generateInsights = (data: SalesRecord[]) => {
    const insights: string[] = [];

    const salesByMonth: { [key: string]: number } = {};
    const marginByMonth: { [key: string]: number } = {};

    data.forEach((record) => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      salesByMonth[key] = (salesByMonth[key] || 0) + record.sales;
      marginByMonth[key] = (marginByMonth[key] || 0) + (record.profit / record.sales);
    });

    const months = Object.keys(salesByMonth).sort();
    if (months.length >= 2) {
      const last = months[months.length - 1];
      const prev = months[months.length - 2];
      const diff = salesByMonth[last] - salesByMonth[prev];
      const pct = (diff / salesByMonth[prev]) * 100;
      const cleanedPct = isNaN(pct) ? 0 : parseFloat(pct.toFixed(1));
insights.push(`Sales ${diff > 0 ? 'increased' : 'decreased'} ${cleanedPct}% compared to last month.`);
    }
    const avgMargin = data.reduce((acc, r) => acc + (r.profit / r.sales), 0) / data.length;
    if (avgMargin < 0.15) {
      const cleanedMargin = isNaN(avgMargin) ? 0 : parseFloat((avgMargin * 100).toFixed(1));
insights.push(`Average profit margin is low: ${cleanedMargin}%. Consider reviewing product pricing.`);

    const lowProfitProducts = data.filter(r => (r.profit / r.sales) < 0.1);
    if (lowProfitProducts.length > 5) {
      insights.push(`More than 5 products are under 10% profit margin.`);
    }

    setInsights(insights);
  };


  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

  const filterByDepartment = (records: SalesRecord[]) => {
    if (selectedDepartment === 'All') return records;
    return records.filter(r => r.department === selectedDepartment);
  };


  useEffect(() => {
    async function fetchData() {
      try {
        let data = await mergeMultipleCSVs(); // New: merge multiple sales files
        data = filterByDepartment(data);
        setSalesData(data);

        const firstDate = new Date(data[0].date);
        const lastDate = new Date(data[data.length - 1].date);
       setCurrentPeriod(`${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`);

        setDepartmentSales(calculateDepartmentSales(data));
        setCustomerSales(calculateCustomerSales(data));
        setProductSales(calculateProductSales(data));
        setSalesReps(calculateSalesRepPerformance(data));
        setAlerts(generateAlerts(data));
        generateInsights(data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-6">
      
    <h1 className="text-3xl font-bold mb-4">Fresh Grown Farms Dashboard</h1>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
        <select
          className="text-sm border rounded px-3 py-1"
          onChange={(e) => {
            const [year, month] = e.target.value.split("-");
            const filtered = salesData.filter((s) => {
              const d = new Date(s.date);
              return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
            });
            if (filtered.length) {
              setDepartmentSales(calculateDepartmentSales(filtered));
              setCustomerSales(calculateCustomerSales(filtered));
              setProductSales(calculateProductSales(filtered));
              setSalesReps(calculateSalesRepPerformance(filtered));
              setAlerts(generateAlerts(filtered));
              const first = new Date(filtered[0].date);
              const last = new Date(filtered[filtered.length - 1].date);
              setCurrentPeriod(`${first.toLocaleDateString()} – ${last.toLocaleDateString()}`);
            }
          }}
        >
          <option value="">-- All Months --</option>
          {[...new Set(salesData.map(s => {
            const d = new Date(s.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          }))].map((m, idx) => (
            <option key={idx} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <button
        className="bg-purple-600 text-white text-sm px-4 py-2 rounded hover:bg-purple-700"
        onClick={() => alert('⚙️ Settings panel coming soon!')}
      >
        Open Settings
      </button>
    </div>
    
      <p className="mb-6 text-gray-500 text-sm">Period shown: <strong>{currentPeriod}</strong></p>

      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      ) : (
        <>
          
    <CsvUploader onUpload={handleFileUpload} />
      <ExportButtons data={salesData} />
      <InsightBox insights={insights} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    
            <MetricCard title="Total Sales" value={formatCurrency(salesData.reduce((acc, s) => acc + s.sales, 0))} />
            <MetricCard title="Total Profit" value={formatCurrency(salesData.reduce((acc, s) => acc + s.profit, 0))} />
            <MetricCard
  title="Average Profit Margin"
  value={() => {
    const totalProfit = salesData.reduce((acc, s) => acc + parseFloat(typeof s.profit === "string" ? s.profit.replace("%", "").trim() : s.profit), 0);
    const totalSales = salesData.reduce((acc, s) => acc + parseFloat(typeof s.sales === "string" ? s.sales.replace("%", "").trim() : s.sales), 0);
    const avg = totalSales !== 0 ? (totalProfit / totalSales) * 100 : 0;
    return `${avg.toFixed(1)}%`;
  }}
/>


          <div className="mb-6 max-h-64 overflow-y-scroll">
            <AlertsList alerts={alerts} />
          </div>

          {/* Add filters, dynamic chart types, etc. here */}
          <DashboardCard title="Sales by Department" data={departmentSales} chartType="bar" />
          <DashboardCard title="Sales by Customer" data={customerSales} chartType="bar" />
          <DashboardCard title="Sales by Product" data={productSales} chartType="bar" />
        </>
      )}
    </div>
  );
}

export default App;
