import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  Loader2,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types/pharmacy';

interface CartDrawerProps {
  onOpenPrescriptionModal: () => void;
  onViewOrders: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  onOpenPrescriptionModal, 
  onViewOrders 
}) => {
  const { 
    cart, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    savings, 
    hasRxItems, 
    prescriptionUrl,
    setPrescriptionUrl,
    checkout,
    clearCart
  } = useCart();

  const { userProfile, setAuthModalOpen } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(userProfile?.name || 'Rahul Sharma');
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || 'customer@example.com');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '+91 8485057206');
  const [shippingAddress, setShippingAddress] = useState(userProfile?.address || 'Flat 402, Lotus Towers, Main Healthcare Road');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync profile data when available
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setCustomerName(userProfile.name);
      if (userProfile.email) setCustomerEmail(userProfile.email);
      if (userProfile.phone) setCustomerPhone(userProfile.phone);
      if (userProfile.address) setShippingAddress(userProfile.address);
    }
  }, [userProfile]);

  if (!isCartDrawerOpen) return null;

  const handleClose = () => {
    setIsCartDrawerOpen(false);
    if (checkoutStep === 'success') {
      setCheckoutStep('cart');
      setPlacedOrder(null);
    }
  };

  const handleProceedToDetails = () => {
    if (!userProfile) {
      setAuthModalOpen(true);
      return;
    }
    if (hasRxItems && !prescriptionUrl) {
      setErrorMsg('Please upload a prescription before proceeding to checkout.');
      return;
    }
    setErrorMsg(null);
    setCheckoutStep('details');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      setErrorMsg('Please fill in all recipient and delivery details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const order = await checkout({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress
      });
      setPlacedOrder(order);
      setCheckoutStep('success');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {checkoutStep === 'cart' && 'Your Pharmacy Cart'}
                {checkoutStep === 'details' && 'Delivery & Payment'}
                {checkoutStep === 'success' && 'Order Confirmed!'}
              </h3>
              <p className="text-xs text-slate-500">
                {checkoutStep === 'cart' && `${cart.reduce((s, i) => s + i.quantity, 0)} items selected`}
                {checkoutStep === 'details' && 'Express Doorstep Delivery'}
                {checkoutStep === 'success' && 'Dispatched from Kashyap Pharmacy'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* STEP 1: CART ITEMS */}
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-700">Your cart is empty</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Add OTC medicines, daily essentials, or upload your doctor's prescription.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Rx Alert Check Banner */}
                  {hasRxItems && (
                    <div className={`p-4 rounded-2xl border text-xs transition-all ${
                      prescriptionUrl 
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        {prescriptionUrl ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold">
                            {prescriptionUrl 
                              ? 'Prescription Attached' 
                              : 'Prescription Required for Checkout'}
                          </p>
                          <p className="text-[11px] mt-0.5 text-slate-600">
                            {prescriptionUrl
                              ? 'Your attached prescription will be reviewed by the clinical pharmacist.'
                              : 'One or more items require an authorized medical prescription by law.'}
                          </p>

                          <div className="mt-2.5 flex items-center gap-2">
                            {prescriptionUrl ? (
                              <button
                                onClick={onOpenPrescriptionModal}
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" /> Change Prescription
                              </button>
                            ) : (
                              <button
                                onClick={onOpenPrescriptionModal}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Upload Prescription (Rx)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cart Item Cards */}
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const activePrice = item.product.discountPrice ?? item.product.price;
                      return (
                        <div 
                          key={item.product.id}
                          className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center gap-3 relative"
                        >
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-semibold text-slate-900 truncate">
                                {item.product.title}
                              </h4>
                              {item.product.isRxRequired && (
                                <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                  Rx
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{item.product.category}</p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs font-bold text-teal-700">
                                ₹{(activePrice * item.quantity).toFixed(2)}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                  (₹{activePrice.toFixed(2)} ea)
                                </span>
                              </div>

                              {/* Quantity Stepper */}
                              <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden shadow-2xs">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 px-1.5 text-slate-500 hover:bg-slate-100"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center font-bold text-xs text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock}
                                  className="p-1 px-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors self-start"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP 2: SHIPPING & CHECKOUT FORM */}
          {checkoutStep === 'details' && (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Standard Delivery: Under 120 minutes from Kashyap Pharmacy hub</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Patient Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complete Delivery Address & Landmark
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3 bottom-3" />
                </div>
              </div>

              {/* Payment Method Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Payment Mode:</span>
                  <span className="text-teal-700">Cash on Delivery / UPI (GPay / PhonePe / Paytm)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pay securely upon physical verification of Cachet medicine packaging seals.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {checkoutStep === 'success' && placedOrder && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-in zoom-in">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Order Placed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Order ID: <span className="font-mono font-bold text-slate-800">{placedOrder.orderId}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-semibold text-slate-800">{placedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount to Pay:</span>
                  <span className="font-bold text-teal-700">₹{placedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                    {placedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prescription:</span>
                  <span className="font-medium text-emerald-700">
                    {placedOrder.prescriptionUrl ? '✓ Attached & In Review' : 'OTC - No Rx Required'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    onViewOrders();
                  }}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Track Order in My Orders
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Continue Browsing Catalog
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer with Price Breakdown & Action Buttons */}
        {cart.length > 0 && checkoutStep !== 'success' && (
          <div className="p-5 border-t border-slate-200/80 bg-slate-50/80 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Cachet Discount / Savings</span>
                  <span>-₹{savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Home Delivery</span>
                <span className="text-emerald-700 font-semibold">FREE (Special Offer)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-teal-700">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 text-center">{errorMsg}</p>
            )}

            {checkoutStep === 'cart' ? (
              <button
                onClick={handleProceedToDetails}
                disabled={hasRxItems && !prescriptionUrl}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
                  hasRxItems && !prescriptionUrl
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-700/20'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Securing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm & Place Order (₹{subtotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
