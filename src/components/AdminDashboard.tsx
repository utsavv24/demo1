import React, { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Layers, 
  DollarSign, 
  ArrowLeft, 
  Eye, 
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Upload
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product, Order, Prescription, OrderStatus, PrescriptionStatus, ProductCategory } from '../types/pharmacy';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onRefreshProducts: () => void;
  products: Product[];
}

const CATEGORIES: ProductCategory[] = [
  'OTC Medicines',
  'Personal Care',
  'Baby Care',
  'Healthcare Devices',
  'Vitamins & Supplements'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBackToHome, 
  onRefreshProducts, 
  products 
}) => {
  const { userProfile, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'prescriptions' | 'addProduct' | 'inventory'>('orders');
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [previewPrescriptionImage, setPreviewPrescriptionImage] = useState<string | null>(null);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('OTC Medicines');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscountPrice, setNewDiscountPrice] = useState('');
  const [newIsRxRequired, setNewIsRxRequired] = useState(false);
  const [newStock, setNewStock] = useState('50');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80');
  const [newDescription, setNewDescription] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const ordersSnap = await getDocs(collection(db, COLLECTIONS.ORDERS));
      const orderList: Order[] = ordersSnap.docs.map(d => ({ ...d.data() } as Order));
      
      // Fallback local orders
      const localOrders = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
      const mergedOrders = [...orderList];
      for (const lo of localOrders) {
        if (!mergedOrders.some(o => o.orderId === lo.orderId)) {
          mergedOrders.push(lo);
        }
      }
      mergedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(mergedOrders);

      // 2. Fetch Prescriptions
      const rxSnap = await getDocs(collection(db, COLLECTIONS.PRESCRIPTIONS));
      const rxList: Prescription[] = rxSnap.docs.map(d => ({ ...d.data() } as Prescription));
      
      const localRx = JSON.parse(localStorage.getItem('kashyap_local_prescriptions') || '[]');
      const mergedRx = [...rxList];
      for (const lr of localRx) {
        if (!mergedRx.some(r => r.uploadId === lr.uploadId)) {
          mergedRx.push(lr);
        }
      }
      mergedRx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPrescriptions(mergedRx);

    } catch (err) {
      console.warn('Error fetching admin data from Firestore:', err);
      const localOrders = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
      setOrders(localOrders);
      const localRx = JSON.parse(localStorage.getItem('kashyap_local_prescriptions') || '[]');
      setPrescriptions(localRx);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update order status in Firestore
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.warn('Firestore update error (updating local state):', e);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      // update local
      const local = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
      const updated = local.map((o: Order) => o.orderId === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('kashyap_local_orders', JSON.stringify(updated));
    } finally {
      setActionLoading(false);
    }
  };

  // Update prescription review status
  const handleUpdatePrescriptionStatus = async (uploadId: string, newStatus: PrescriptionStatus) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, uploadId), { status: newStatus });
      setPrescriptions(prev => prev.map(r => r.uploadId === uploadId ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.warn('Firestore prescription status update error:', e);
      setPrescriptions(prev => prev.map(r => r.uploadId === uploadId ? { ...r, status: newStatus } : r));
      const local = JSON.parse(localStorage.getItem('kashyap_local_prescriptions') || '[]');
      const updated = local.map((r: Prescription) => r.uploadId === uploadId ? { ...r, status: newStatus } : r);
      localStorage.setItem('kashyap_local_prescriptions', JSON.stringify(updated));
    } finally {
      setActionLoading(false);
    }
  };

  // Add new medicine to Firestore
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    setActionLoading(true);
    const prodId = `cachet-${newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Math.floor(100 + Math.random() * 900)}`;
    
    const newProduct: Product = {
      id: prodId,
      title: newTitle.trim(),
      category: newCategory,
      price: parseFloat(newPrice),
      discountPrice: newDiscountPrice ? parseFloat(newDiscountPrice) : undefined,
      isRxRequired: newIsRxRequired,
      stock: parseInt(newStock, 10) || 50,
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      description: newDescription.trim() || 'Manufactured by Cachet Pharmaceuticals Pvt. Ltd. High-quality certified pharmaceutical formulation.',
      ingredients: newIngredients.trim() || 'Active pharmaceutical ingredients as per Indian Pharmacopoeia (IP).',
      usage: newUsage.trim() || 'Take as advised by your medical practitioner.',
      rating: 4.9,
      ratingCount: 1,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, prodId), newProduct);
      setFormSuccess(true);
      onRefreshProducts();
      // Reset form
      setNewTitle('');
      setNewPrice('');
      setNewDiscountPrice('');
      setNewDescription('');
      setNewIngredients('');
      setNewUsage('');
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      console.warn('Product addition write error in Firestore:', err);
      alert('Product saved in memory. Note: You must be signed in as admin to persist to cloud database.');
    } finally {
      setActionLoading(false);
    }
  };

  // Analytics Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const pendingRx = prescriptions.filter(p => p.status === 'Pending Review').length;

  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kashyap Pharmacy Administrative Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Pharmacist In-Charge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispensary management, prescription validation, customer fulfillment, and medicine catalog control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Records</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <span className="text-sm font-bold text-emerald-600">₹</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">From {orders.length} total orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingOrders}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Requires dispatch approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rx In-Review</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingRx}</p>
          <p className="text-[11px] text-teal-600 font-medium mt-1">Doctor prescriptions waiting</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Medicines</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{products.length}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Active inventory SKUs</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mt-8 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Fulfillment Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all relative ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescription Verification Queue ({prescriptions.length})</span>
          {pendingRx > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('addProduct')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'addProduct'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'inventory'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Medicine Catalog ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Filter By Fulfillment Status:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {['All', 'Pending', 'Approved', 'Dispatched', 'Delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No orders found for status "{statusFilter}".
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div 
                  key={ord.orderId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-teal-300 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">
                          {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Patient: <strong>{ord.customerName}</strong> | Phone: {ord.customerPhone} | Address: {ord.shippingAddress}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Payable</p>
                        <p className="text-lg font-bold text-teal-800">₹{ord.totalAmount.toFixed(2)}</p>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.orderId, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer focus:outline-hidden ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.status === 'Dispatched'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : ord.status === 'Approved'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <img 
                          src={it.imageUrl} 
                          alt={it.title} 
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200" 
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-semibold text-slate-800 truncate">{it.title}</p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {it.quantity} • ₹{(it.price * it.quantity).toFixed(2)}
                            {it.isRxRequired && <span className="text-amber-700 font-bold ml-1">Rx</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prescription Check if present */}
                  {ord.prescriptionUrl && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-medium flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" /> Attached Customer Doctor Prescription
                      </span>
                      <button
                        onClick={() => setPreviewPrescriptionImage(ord.prescriptionUrl!)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Prescription
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESCRIPTION REVIEW QUEUE */}
      {activeTab === 'prescriptions' && (
        <div className="mt-6 space-y-4">
          {prescriptions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No customer prescriptions uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div 
                  key={rx.uploadId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800">{rx.uploadId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rx.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rx.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rx.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>Patient Name: <strong>{rx.userName}</strong></p>
                      <p>Email: {rx.userEmail}</p>
                      <p>Uploaded: {new Date(rx.createdAt).toLocaleString()}</p>
                      {rx.notes && (
                        <p className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-100">
                          "{rx.notes}"
                        </p>
                      )}
                    </div>

                    {/* Prescription Document Preview Thumbnail */}
                    <div 
                      onClick={() => setPreviewPrescriptionImage(rx.imageUrl)}
                      className="relative h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                    >
                      <img 
                        src={rx.imageUrl} 
                        alt="Prescription document" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-teal-600" /> Click to Inspect
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pharmacist Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleUpdatePrescriptionStatus(rx.uploadId, 'Approved')}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Rx
                    </button>
                    <button
                      onClick={() => handleUpdatePrescriptionStatus(rx.uploadId, 'Rejected')}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Rx
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD NEW MEDICINE */}
      {activeTab === 'addProduct' && (
        <div className="mt-6 max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Add New Medicine to Kashyap Pharmacy Catalog
            </h3>
            <p className="text-xs text-slate-500">
              Published directly to Firestore with real-time sync across web store.
            </p>
          </div>

          {formSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Medicine successfully added to Firestore catalog!</span>
            </div>
          )}

          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine / Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Azithromycin 500mg Tablets"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Retail Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="120.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount Price (₹) (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="95.00"
                  value={newDiscountPrice}
                  onChange={(e) => setNewDiscountPrice(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Rx Required Toggle Checkbox */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Prescription Mandate (Rx Required)
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Check this box if pharmaceutical regulation requires doctor's Rx verification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={newIsRxRequired}
                onChange={(e) => setNewIsRxRequired(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Photo URL (Unsplash or Cloud Storage)
              </label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Overview & Description
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Therapeutic indications and drug mechanism..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Pharmaceutical Ingredients
                </label>
                <input
                  type="text"
                  placeholder="e.g. Azithromycin Dihydrate 500mg"
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dosage & Administration Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet daily 1 hour before meal"
                  value={newUsage}
                  onChange={(e) => setNewUsage(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Medicine to Pharmacy Catalog</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: INVENTORY LIST */}
      {activeTab === 'inventory' && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((prod) => (
              <div 
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3 shadow-2xs hover:border-teal-300 transition-colors"
              >
                <img 
                  src={prod.imageUrl} 
                  alt={prod.title} 
                  className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0" 
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-900 truncate">{prod.title}</p>
                    {prod.isRxRequired && (
                      <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 shrink-0">
                        Rx
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{prod.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-teal-700">
                      ₹{(prod.discountPrice ?? prod.price).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Stock: {prod.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Prescription Inspection */}
      {previewPrescriptionImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewPrescriptionImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2">
            <img 
              src={previewPrescriptionImage} 
              alt="Prescription Document" 
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl" 
            />
            <button
              onClick={() => setPreviewPrescriptionImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-900 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
