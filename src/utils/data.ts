import { parse } from 'papaparse';
import { format, parseISO, subMonths } from 'date-fns';
import type { 
  SalesRecord, 
  DepartmentSales, 
  CustomerSales, 
  ProductSales,
  SalesRepPerformance,
  Alert 
} from '../types';

export async function loadSalesData(): Promise<SalesRecord[]> {
  const response = await fetch('/data/sales-by-item-report-Fri, 30 May 2025 04_18_46 GMT.csv');
  const csv = await response.text();
  
  const { data } = parse(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });

  return data as SalesRecord[];
}

export function getDepartmentFromProduct(product: string): string {
  if (product.toLowerCase().includes('basil')) return 'Herbs';
  if (product.toLowerCase().includes('carrot')) return 'Roots';
  if (product.toLowerCase().includes('pepper')) return 'Vegetables';
  if (product.toLowerCase().includes('kale') || 
      product.toLowerCase().includes('chard')) return 'Leafy Greens';
  return 'Other';
}

export function calculateDepartmentSales(data: SalesRecord[]): DepartmentSales[] {
  const departments = new Map<string, DepartmentSales>();

  data.forEach(record => {
    const dept = getDepartmentFromProduct(record.Product);
    const current = departments.get(dept) || {
      department: dept,
      totalSales: 0,
      totalProfit: 0,
      profitMargin: 0
    };

    current.totalSales += record['Total Revenue'];
    current.totalProfit += record['Total Profit $'];
    departments.set(dept, current);
  });

  return Array.from(departments.values()).map(dept => ({
    ...dept,
    profitMargin: (dept.totalProfit / dept.totalSales) * 100
  }));
}

export function calculateCustomerSales(data: SalesRecord[]): CustomerSales[] {
  const customers = new Map<string, CustomerSales>();

  data.forEach(record => {
    const current = customers.get(record.Customer) || {
      customer: record.Customer,
      totalSales: 0,
      totalProfit: 0,
      profitMargin: 0,
      orderCount: 0
    };

    current.totalSales += record['Total Revenue'];
    current.totalProfit += record['Total Profit $'];
    current.orderCount += 1;
    customers.set(record.Customer, current);
  });

  return Array.from(customers.values())
    .map(customer => ({
      ...customer,
      profitMargin: (customer.totalProfit / customer.totalSales) * 100
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

export function calculateProductSales(data: SalesRecord[]): ProductSales[] {
  const products = new Map<string, ProductSales>();

  data.forEach(record => {
    const current = products.get(record.Product) || {
      product: record.Product,
      totalSales: 0,
      totalProfit: 0,
      profitMargin: 0,
      unitsSold: 0
    };

    current.totalSales += record['Total Revenue'];
    current.totalProfit += record['Total Profit $'];
    current.unitsSold += record.Quantity;
    products.set(record.Product, current);
  });

  return Array.from(products.values())
    .map(product => ({
      ...product,
      profitMargin: (product.totalProfit / product.totalSales) * 100
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

export function calculateSalesRepPerformance(data: SalesRecord[]): SalesRepPerformance[] {
  const reps = new Map<string, SalesRepPerformance>();

  data.forEach(record => {
    const current = reps.get(record['Sales Rep']) || {
      name: record['Sales Rep'],
      totalSales: 0,
      totalProfit: 0,
      customerCount: new Set(),
      orderCount: 0
    };

    current.totalSales += record['Total Revenue'];
    current.totalProfit += record['Total Profit $'];
    current.customerCount.add(record.Customer);
    current.orderCount += 1;
    reps.set(record['Sales Rep'], current);
  });

  return Array.from(reps.values())
    .map(rep => ({
      ...rep,
      customerCount: rep.customerCount.size
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

export function generateAlerts(data: SalesRecord[]): Alert[] {
  const alerts: Alert[] = [];
  const profitMarginThreshold = 10;
  const sixMonthsAgo = subMonths(new Date(), 6);

  // Check for low profit margins
  data.forEach(record => {
    if (record['Total Profit %'] < profitMarginThreshold) {
      alerts.push({
        type: 'warning',
        message: `Low profit margin for ${record.Product}`,
        details: `Current margin: ${record['Total Profit %'].toFixed(1)}%`
      });
    }
  });

  // Check for unpaid invoices
  const unpaidInvoices = data.filter(record => 
    record['Invoice Payment Status'] === 'Unpaid' && 
    parseISO(record['Reqs. Date']) < sixMonthsAgo
  );

  if (unpaidInvoices.length > 0) {
    alerts.push({
      type: 'danger',
      message: 'Outstanding unpaid invoices',
      details: `${unpaidInvoices.length} invoices pending payment`
    });
  }

  return alerts;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM d, yyyy');
}

import Papa from 'papaparse';

export async function mergeMultipleCSVs(): Promise<SalesRecord[]> {
  const fileNames = [
    '/data/sales-by-item-report-Fri, 30 May 2025 04_18_46 GMT.csv',
    '/data/sales-by-item-report-Fri, 30 May 2025 04_30_57 GMT.csv'
  ];

  const allData: SalesRecord[] = [];

  for (const fileName of fileNames) {
    const response = await fetch(fileName);
    const csvText = await response.text();
    const parsed = Papa.parse<SalesRecord>(csvText, {
      header: true,
      skipEmptyLines: true
    });
    allData.push(...parsed.data);
  }

  // Sort by date for consistency
  allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return allData;
}