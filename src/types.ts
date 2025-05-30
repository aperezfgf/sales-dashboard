export interface SalesRecord {
  Product: string;
  Organic: boolean;
  Unit: string;
  Label: string;
  COO: string;
  'Sales Order': string;
  'Invoice #': string;
  'Invoice Payment Status': string;
  'Most Recent Invoice Paid Date': string;
  'Sale Location': string;
  'Sales Rep': string;
  'Reqs. Date': string;
  Customer: string;
  Lot: string;
  Vendor: string;
  Source: string;
  'Received Date': string;
  'Use By Date': string;
  'Pack Date': string;
  'Lot Location': string;
  Quantity: number;
  'Cost per Unit': number;
  'Price per Unit': number;
  'Total Cost': number;
  'Total Sold Lot Expenses': number;
  'Total Revenue': number;
  'Total Profit $': number;
  'Total Profit %': number;
}

export interface DepartmentSales {
  department: string;
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
}

export interface CustomerSales {
  customer: string;
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
  orderCount: number;
}

export interface ProductSales {
  product: string;
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
  unitsSold: number;
}

export interface SalesRepPerformance {
  name: string;
  totalSales: number;
  totalProfit: number;
  customerCount: number;
  orderCount: number;
}

export interface Alert {
  type: 'warning' | 'danger';
  message: string;
  details: string;
}