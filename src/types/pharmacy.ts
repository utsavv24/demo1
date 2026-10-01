export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
  phone?: string;
  createdAt?: string;
}

export type ProductCategory = 
  | 'All'
  | 'OTC Medicines'
  | 'Personal Care'
  | 'Baby Care'
  | 'Healthcare Devices'
  | 'Vitamins & Supplements';

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  discountPrice?: number;
  isRxRequired: boolean;
  stock: number;
  imageUrl: string;
  description: string;
  ingredients?: string;
  usage?: string;
  rating?: number;
  ratingCount?: number;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Approved' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  isRxRequired: boolean;
  imageUrl: string;
}

export interface Order {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  prescriptionUrl?: string;
  isRxVerified?: boolean;
  createdAt: string;
}

export type PrescriptionStatus = 'Pending Review' | 'Approved' | 'Rejected';

export interface Prescription {
  uploadId: string;
  userId: string;
  userEmail: string;
  userName: string;
  imageUrl: string;
  notes?: string;
  status: PrescriptionStatus;
  createdAt: string;
}
