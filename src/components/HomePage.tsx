import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Award, 
  CheckCircle2, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowRight, 
  Pill, 
  HeartHandshake, 
  Search,
  Filter,
  Check
} from 'lucide-react';
import { Product, ProductCategory } from '../types/pharmacy';
import { ProductCard } from './ProductCard';

interface HomePageProps {
  products: Product[];
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onSelectProduct: (product: Product) => void;
  onOpenPrescriptionModal: () => void;
}

const CATEGORIES: { label: ProductCategory; icon: string; count: string; bg: string }[] = [
  { label: 'OTC Medicines', icon: '💊', count: '140+ Items', bg: 'from-teal-500/10 to-teal-600/5' },
  { label: 'Vitamins & Supplements', icon: '🌿', count: '85+ Items', bg: 'from-emerald-500/10 to-emerald-600/5' },
  { label: 'Healthcare Devices', icon: '🩺', count: '30+ Items', bg: 'from-blue-500/10 to-blue-600/5' },
  { label: 'Personal Care', icon: '✨', count: '90+ Items', bg: 'from-amber-500/10 to-amber-600/5' },
  { label: 'Baby Care', icon: '🍼', count: '45+ Items', bg: 'from-rose-500/10 to-rose-600/5' },
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onOpenPrescriptionModal
}) => {
  const [filterRxOnly, setFilterRxOnly] = useState<'all' | 'rx' | 'otc'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Filter products based on category, rx type, and local search
  const filteredProducts = products.filter(p => {
    // Category check
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    // Rx check
    if (filterRxOnly === 'rx' && !p.isRxRequired) return false;
    if (filterRxOnly === 'otc' && p.isRxRequired) return false;

    // Search query check
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchIng = p.ingredients?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchIng) return false;
    }

    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cachet Pharmaceuticals Range • Lic. #DL-KP-2024</span>
              <span className="text-teal-400">•</span>
              <span className="text-emerald-300 font-bold">2-Hour Express Delivery</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Your Trusted Healthcare & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                Cachet Pharmacy Store
              </span>
            </h1>

            <p className="text-sm sm:text-base text-teal-100/90 max-w-xl leading-relaxed">
              Order verified Cachet Pharmaceuticals products (Traxol, Lycostar, Pamagesic, Cavit-D3, C-Tax-O), daily health supplements, and clinical devices in Indian Rupees (₹). Upload your doctor's prescription for instant review.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenPrescriptionModal}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 transition-all active:scale-95 group"
              >
                <FileText className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Upload Prescription to Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const catalogElement = document.getElementById('catalog-section');
                  catalogElement?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-all"
              >
                Explore Medicines
              </button>
            </div>

            {/* Quick Guarantees Bar */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-teal-700/60 max-w-lg text-xs text-teal-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Express 2-hr Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Licensed Staff</span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Upload Prescription Card Widget */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 text-slate-900 p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    Rx
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Quick Prescription Order</h3>
                    <p className="text-xs text-slate-500">Order medicines via photo upload</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Instant Link
                </span>
              </div>

              {/* Drag Drop Click area */}
              <div 
                onClick={onOpenPrescriptionModal}
                className="border-2 border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/50 hover:bg-teal-50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Click to Upload Doctor's Prescription
                </p>
                <p className="text-[11px] text-slate-500">
                  Our clinical pharmacist verifies dosage and confirms order in minutes
                </p>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep delivery with tamper-proof packaging</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free consultation with our senior pharmacist</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY QUICK FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Shop by Health Category
            </h2>
            <p className="text-xs text-slate-500">
              Handpicked pharmaceutical products tested for high purity
            </p>
          </div>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Reset Category ({selectedCategory})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => onSelectCategory(isSelected ? 'All' : cat.label)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-600/20'
                    : 'border-slate-200/90 bg-white hover:border-teal-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                    {cat.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cat.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS & MEDICINE CATALOG */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Catalog Control Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>{selectedCategory === 'All' ? 'Cachet Pharmaceuticals Medicine Catalog' : `Cachet ${selectedCategory}`}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProducts.length} verified Cachet formulations & healthcare products in Indian Rupees (₹)
            </p>
          </div>

          {/* Rx / OTC Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
              <button
                onClick={() => setFilterRxOnly('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterRxOnly === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilterRxOnly('otc')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterRxOnly === 'otc' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                OTC Only
              </button>
              <button
                onClick={() => setFilterRxOnly('rx')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterRxOnly === 'rx' ? 'bg-white text-amber-800 shadow-2xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Rx Required
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3 mt-6">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No medicines match your filter</h3>
            <p className="text-xs text-slate-500">
              Try switching category or resetting filters to browse our full catalog.
            </p>
            <button
              onClick={() => {
                onSelectCategory('All');
                setFilterRxOnly('all');
                setSearchFilter('');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HEALTHCARE VALUES & TRUST PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Why Patients Trust Kashyap Pharmacy
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Strict adherence to clinical standards, temperature-controlled transit, and authenticated medicines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">100% Genuine Certified</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Directly procured from licensed pharmaceutical manufacturers with verifiable batch certifications.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">2-Hour Rapid Delivery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Emergency and acute medications packed with high-priority dispatch straight to your home.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Doctor Rx Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every prescription undergoes rigorous dosage review by certified clinical pharmacists.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Safe Cold-Chain Storage</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Biologics, insulins, and sensitive antibiotics maintained under optimal 2°C – 8°C conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
