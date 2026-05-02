// Aislemind core type system

export type Role = "customer" | "vendor" | "admin";

export type Category = "Electronics" | "Fashion" | "Footwear" | "Home" | "Beauty";

export type OrderStatus =
  | "Placed"
  | "Dispatched"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const ORDER_FLOW: OrderStatus[] = [
  "Placed",
  "Dispatched",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  storeName?: string;
  status?: "active" | "suspended" | "pending";
  suspensionReason?: string;
  createdAt: number;
}

export type PaymentMethod = "UPI" | "Card" | "Net Banking" | "Cash on Delivery";
export type ReturnStatus = "pending" | "approved" | "rejected" | "refunded";

export interface ProductSpecs {
  colors?: string[];
  sizes?: string[];
  subcategory?: string;
  specifications?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  vendorId: string;
  vendorName: string;
  price: number;
  discount?: number; // percentage
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  specs: ProductSpecs;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  qty: number;
  color?: string;
  size?: string;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  vendorId: string;
  vendorName: string;
  color?: string;
  size?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: number;
  note?: string;
}

export interface ReturnRequest {
  reason: string;
  requestedAt: number;
  status: ReturnStatus;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  cancellation?: {
    by: "customer" | "vendor";
    reason: string;
    at: number;
  };
  returnRequest?: ReturnRequest;
  paymentMethod?: PaymentMethod;
  paymentDetails?: string;
  createdAt: number;
}

export interface SupportTicket {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: Role;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: number;
  resolvedAt?: number;
}

export interface PlatformLog {
  id: string;
  type: "cancellation" | "return" | "suspension";
  actor: string;
  target: string;
  reason: string;
  fromRole: Role;
  createdAt: number;
}
