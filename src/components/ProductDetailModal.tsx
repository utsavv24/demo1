import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Minus, 
  ShoppingBag, 
  AlertTriangle, 
  FileText, 
  Pill, 
  Clock, 
  Activity 
} from 'lucide-react';
import { Product } from '../types/pharmacy';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenPrescriptionModal: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenPrescriptionModal
}) => {
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const inCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
  const currentPrice = product.discountPrice ?? product.price;

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="relative h-64 sm:h-72 bg-slate-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {product.isRxRequired ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Prescription Required (Rx)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Over-the-Counter (OTC)
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 shadow-md backdrop-blur-xs">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-1 text-amber-500 font-semibold text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-slate-800">{product.rating || 4.8}</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal">{product.ratingCount || 140} verified reviews</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {product.title}
            </h2>

            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-extrabold text-teal-700">
                ₹{currentPrice.toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                In Stock ({product.stock} units)
              </span>
            </div>
          </div>

          {/* Rx Warning Notice if applicable */}
          {product.isRxRequired && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold block mb-0.5">Doctor's Prescription Mandated</strong>
                As per pharmacy guidelines, an authorized medical prescription is required before dispensing this medication. You can upload your prescription directly during checkout or now.
                <button
                  onClick={() => {
                    onClose();
                    onOpenPrescriptionModal();
                  }}
                  className="mt-2 text-xs font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Upload Prescription Now
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-teal-600" /> Clinical Overview
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {product.description}
            </p>
          </div>

          {/* Active Ingredients & Usage Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Pill className="w-4 h-4 text-teal-600" /> Active Composition
              </h5>
              <p className="text-xs text-slate-700 leading-normal">
                {product.ingredients || 'Standard certified pharmaceutical formulation.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-teal-600" /> Dosage & Administration
              </h5>
              <p className="text-xs text-slate-700 leading-normal">
                {product.usage || 'Take as advised by your healthcare practitioner.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-slate-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-2.5 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart (₹{(currentPrice * quantity).toFixed(2)})</span>
              {inCart > 0 && (
                <span className="text-xs bg-teal-800/80 px-2 py-0.5 rounded-full ml-1 font-medium">
                  {inCart} already in cart
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
