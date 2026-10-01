import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  FileText, 
  ChevronRight, 
  ShoppingBag, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types/pharmacy';

interface OrdersViewProps {
  onBackToHome: () => void;
  onOpenPrescriptionModal: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onBackToHome, onOpenPrescriptionModal }) => {
  const { userProfile, setAuthModalOpen } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (userProfile?.uid) {
        // Query user's orders from Firestore
        const q = query(
          collection(db, COLLECTIONS.ORDERS),
          where('userId', '==', userProfile.uid)
        );
        const snap = await getDocs(q);
        const list: Order[] = snap.docs.map(doc => ({ ...doc.data() } as Order));
        
        // Also check any locally saved fallback orders
        const local = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
        const combined = [...list];
        for (const lo of local) {
          if (!combined.some(o => o.orderId === lo.orderId)) {
            combined.push(lo);
          }
        }
        // Sort descending by date
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(combined);
      } else {
        // If not logged in, read from local storage
        const local = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
        setOrders(local);
      }
    } catch (err) {
      console.warn('Error fetching orders from Firestore:', err);
      const local = JSON.parse(localStorage.getItem('kashyap_local_orders') || '[]');
      setOrders(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userProfile]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" /> Pharmacist Review
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-500" /> Rx Approved
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-500" /> Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Delivered
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 mb-1 transition-colors"
          >
            ← Back to Pharmacy Catalog
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600" /> My Medicine Orders & Prescriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates from Kashyap Pharmacy dispensary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenPrescriptionModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload New Rx</span>
          </button>
        </div>
      </div>

      {/* Orders List Content */}
      <div className="mt-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading your prescription orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You haven't placed any medicine orders yet. Browse our verified pharmacy catalog or upload your doctor's prescription.
              </p>
            </div>
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Browse Medicines
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all overflow-hidden"
              >
                {/* Order Summary Strip */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {order.orderId}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Deliver to: <span className="text-slate-700 font-medium">{order.customerName}</span> ({order.shippingAddress})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-base font-bold text-teal-800">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items & Prescription Details */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Items List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <img
                          src={it.imageUrl}
                          alt={it.title}
                          className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {it.title}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                            <span>Qty: {it.quantity}</span>
                            <span className="font-semibold text-teal-700">₹{(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prescription Attachment info if present */}
                  {order.prescriptionUrl && (
                    <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-teal-900 font-medium">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>Prescription Attached for Verification</span>
                      </div>
                      <a
                        href={order.prescriptionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
                      >
                        <span>View Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Order Status Progress Stepper */}
                  <div className="pt-2">
                    <div className="relative flex items-center justify-between">
                      {['Pending', 'Approved', 'Dispatched', 'Delivered'].map((step, idx) => {
                        const steps = ['Pending', 'Approved', 'Dispatched', 'Delivered'];
                        const currentIdx = steps.indexOf(order.status);
                        const isDone = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div key={step} className="flex-1 text-center relative">
                            <div className="flex items-center justify-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isDone 
                                  ? 'bg-teal-600 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-teal-100' : ''}`}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                            </div>
                            <span className={`block text-[11px] mt-1.5 font-medium ${
                              isDone ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {step === 'Pending' ? 'Verified' : step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
