import React from 'react';
import { PlusSquare, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { ProductCategory } from '../types/pharmacy';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenPrescriptionModal: () => void;
  setCurrentView: (view: 'home' | 'orders' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenPrescriptionModal,
  setCurrentView
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
                <PlusSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">Kashyap</span>{' '}
                <span className="text-xl font-semibold text-teal-400">Pharmacy</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Kashyap Pharmacy is an authorized clinical retailer for Cachet Pharmaceuticals Pvt. Ltd. products, delivering genuine Indian prescription medicines, Traxol, Lycostar, Pamagesic, Cavit, and healthcare devices at approved Indian MRP rates.
            </p>

            <div className="text-xs text-teal-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Drug License No: DL-20B/21B-CACHE-8921 (CDSCO / State FDA)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Pharmacy Store
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => { setCurrentView('home'); onSelectCategory('OTC Medicines'); }}
                  className="hover:text-teal-400 transition-colors"
                >
                  OTC Medicines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('home'); onSelectCategory('Vitamins & Supplements'); }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Vitamins & Supplements
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('home'); onSelectCategory('Healthcare Devices'); }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Medical Devices
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('home'); onSelectCategory('Baby Care'); }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Baby & Infant Care
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('home'); onSelectCategory('Personal Care'); }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Personal Hygiene
                </button>
              </li>
            </ul>
          </div>

          {/* Patient Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Patient Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={onOpenPrescriptionModal}
                  className="hover:text-teal-400 transition-colors"
                >
                  Upload Doctor's Prescription
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('orders')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('admin')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Pharmacist Admin Portal
                </button>
              </li>
              <li>
                <span className="text-slate-500">2-Hour Express Delivery</span>
              </li>
              <li>
                <span className="text-slate-500">Cold Chain Management</span>
              </li>
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Emergency & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <a href="tel:+918485057206" className="hover:text-teal-300 font-semibold text-white">
                  +91 8485057206
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  WhatsApp Rx
                </span>
                <a 
                  href="https://wa.me/918485057206?text=Hello%20Kashyap%20Pharmacy,%20I%20want%20to%20order%20medicines" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-emerald-400 text-slate-300"
                >
                  +91 8485057206
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>care@kashyappharmacy.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Kashyap Pharmacy Complex, Health Avenue, Medical District</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 text-center sm:flex sm:justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Kashyap Pharmacy. All rights reserved. FDA & CDSCO Compliant.</p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
            Dedicated to patient wellness & clinical excellence <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
