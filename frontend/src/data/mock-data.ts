export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  lotPrice: number;
  lotSize: number;
  stock: number;
  inStock: boolean;
  category: string;
  wholesaler: string;
  sku: string;
}

export interface Order {
  id: string;
  date: string;
  items: { productName: string; qty: number; price: number }[];
  total: number;
  status: "Pending" | "Shipped" | "Delivered";
}

export interface Invoice {
  id: string;
  retailer: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Overdue" | "Pending";
}

export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
export const mockInvoices: Invoice[] = [];
