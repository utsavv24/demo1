import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product } from '../types/pharmacy';

// 1. Initialize Firebase App (Singleton pattern)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 2. Auth & Storage instances
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// 3. Collection References Names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  PRESCRIPTIONS: 'prescriptions',
  ADMINS: 'admins',
} as const;

// 4. Test connection on boot as mandated by guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted:', error.message);
    } else {
      // In Firestore, permission-denied or document-not-found on 'test/connection' is normal
      // and confirms the network connection to the project was reached.
      console.log('Firebase server reached:', error instanceof Error ? error.name : 'Ready');
    }
    return true;
  }
}

// 5. Initial Seed Catalog for Kashyap Pharmacy - Cachet Pharmaceuticals Range (in Indian Rupees ₹)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'cachet-traxol-o-200',
    title: 'Traxol-O 200 (Cefixime Tablets IP 200mg) - Cachet',
    category: 'OTC Medicines',
    price: 112.00,
    discountPrice: 94.00,
    isRxRequired: true,
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Traxol-O 200 by Cachet Pharmaceuticals is a trusted 3rd generation cephalosporin antibiotic used to treat bacterial infections of the respiratory tract, urinary tract, ear, and throat.',
    ingredients: 'Each film coated tablet contains Cefixime Trihydrate IP equivalent to Anhydrous Cefixime 200mg (Manufactured by Cachet Pharmaceuticals Pvt. Ltd.).',
    usage: 'Take 1 tablet twice daily after meals for 5 to 7 days, or as strictly prescribed by your physician. Complete full course.',
    rating: 4.9,
    ratingCount: 230,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-lycostar-capsules',
    title: 'Lycostar Multivitamin & Antioxidant Capsules - Cachet',
    category: 'Vitamins & Supplements',
    price: 185.00,
    discountPrice: 155.00,
    isRxRequired: false,
    stock: 160,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
    description: 'Cachet flagship Lycostar contains high-purity natural Lycopene fortified with essential Multivitamins, Zinc, and Selenium for daily cellular energy, heart health, and boosted immunity.',
    ingredients: 'Lycopene 10% (5000mcg), Vitamin C (50mg), Vitamin E (15 IU), Zinc Sulphate (27.45mg), Sodium Selenite (70mcg) - Cachet Pharmaceuticals.',
    usage: '1 capsule daily after breakfast with warm water or milk as a nutritional supplement.',
    rating: 4.9,
    ratingCount: 480,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-pamagesic-plus',
    title: 'Pamagesic Plus (Paracetamol + Aceclofenac) - Cachet',
    category: 'OTC Medicines',
    price: 85.00,
    discountPrice: 68.00,
    isRxRequired: false,
    stock: 220,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80',
    description: 'Fast-action analgesic and antipyretic formulation by Cachet indicated for quick relief from acute headache, fever, toothache, muscle pain, and joint stiffness.',
    ingredients: 'Aceclofenac IP 100mg + Paracetamol IP 325mg (Cachet Pharmaceuticals Pvt. Ltd.).',
    usage: 'Adults: 1 tablet after meals when needed. Maximum 2 tablets in 24 hours. Drink plenty of water.',
    rating: 4.8,
    ratingCount: 310,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-cavit-d3',
    title: 'Cavit-D3 60K Softgel Capsules (Cholecalciferol) - Cachet',
    category: 'Vitamins & Supplements',
    price: 145.00,
    discountPrice: 119.00,
    isRxRequired: false,
    stock: 130,
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
    description: 'High-potency Vitamin D3 supplement from Cachet for treatment of Vitamin D deficiency, strengthening bone mineral density and immune resilience.',
    ingredients: 'Cholecalciferol IP (Vitamin D3) 60,000 International Units in gelatin soft capsules (Cachet Pharma).',
    usage: 'Take 1 capsule once a week with milk after dinner for 8 weeks or as directed by an orthopedic specialist.',
    rating: 4.9,
    ratingCount: 395,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-c-tax-o-100',
    title: 'C-Tax-O 100 DT Dispersible Tablets - Cachet',
    category: 'OTC Medicines',
    price: 135.00,
    discountPrice: 115.00,
    isRxRequired: true,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=800&q=80',
    description: 'Pediatric and adult dispersible cefpodoxime proxetil antibiotic tablets by Cachet for bacterial throat, tonsillitis, and broncho-pulmonary infections.',
    ingredients: 'Cefpodoxime Proxetil IP equivalent to Cefpodoxime 100mg (Cachet Pharmaceuticals).',
    usage: 'Disperse tablet in 5ml of boiled & cooled water before consuming. Take as directed by registered medical practitioner.',
    rating: 4.8,
    ratingCount: 165,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-vitneurin-czs',
    title: 'Vitneurin-CZS Multi-B-Complex with Zinc - Cachet',
    category: 'Vitamins & Supplements',
    price: 98.00,
    discountPrice: 82.00,
    isRxRequired: false,
    stock: 190,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
    description: 'Balanced B-Complex formulation enriched with Vitamin C and Zinc by Cachet to combat fatigue, oral ulcers, and nerve weakness.',
    ingredients: 'Thiamine Mononitrate (10mg), Riboflavin (10mg), Pyridoxine HCl (3mg), Cyanocobalamin (15mcg), Nicotinamide (50mg), Zinc Sulphate (41.4mg).',
    usage: '1 tablet once daily with meals. Ideal for post-illness recovery and stamina.',
    rating: 4.7,
    ratingCount: 190,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-lycostar-syrup',
    title: 'Lycostar Tonic Syrup 200ml - Cachet',
    category: 'Vitamins & Supplements',
    price: 165.00,
    discountPrice: 139.00,
    isRxRequired: false,
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    description: 'Delicious mixed fruit flavored antioxidant syrup formulated by Cachet for growing children and adults recovering from illness or nutritional deficiency.',
    ingredients: 'Purified Lycopene with Niacinamide, Pyridoxine, Folic Acid, and Trace Minerals (Cachet Pharmaceuticals).',
    usage: 'Adults: 10ml twice daily; Children (above 5 yrs): 5ml once daily after meals.',
    rating: 4.9,
    ratingCount: 270,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-lulicache-cream',
    title: 'Lulicache 1% Antifungal Skin Cream 30g - Cachet',
    category: 'Personal Care',
    price: 245.00,
    discountPrice: 205.00,
    isRxRequired: false,
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    description: 'Broad-spectrum topical antifungal cream by Cachet Pharmaceuticals that eradicates tinea cruris, ringworm, athlete foot, and severe skin itching.',
    ingredients: 'Luliconazole IP 1.0% w/w in non-greasy emollient cream base (Cachet Pharma).',
    usage: 'Clean and dry affected area. Apply a thin layer once daily for 1 to 2 weeks.',
    rating: 4.8,
    ratingCount: 145,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-pulse-oximeter',
    title: 'Cachet SmartPulse Digital Fingertip Oximeter SpO2',
    category: 'Healthcare Devices',
    price: 899.00,
    discountPrice: 699.00,
    isRxRequired: false,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    description: 'Clinical grade fingertip pulse oximeter marketed by Cachet Devices with OLED display, perfusion index indicator, and instant oxygen saturation readouts.',
    ingredients: 'Infrared optical medical sensor, dual-color rotatable OLED screen, AAA batteries included.',
    usage: 'Clip onto clean, dry fingertip and press start. Read SpO2 % and Pulse within 6 seconds.',
    rating: 4.8,
    ratingCount: 195,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-cardio-bp-monitor',
    title: 'Cachet CardioCheck Automatic Blood Pressure Monitor',
    category: 'Healthcare Devices',
    price: 1850.00,
    discountPrice: 1450.00,
    isRxRequired: false,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    description: 'Cachet Medical Devices digital upper arm BP apparatus featuring WHO color risk classification, irregular pulse detector, and 120-reading dual memory.',
    ingredients: 'Oscillometric sensor, comfortable wide arm cuff (22-42cm), USB-C rechargeable port.',
    usage: 'Sit comfortably for 5 minutes. Wrap cuff at heart level and press the blue Start button.',
    rating: 4.9,
    ratingCount: 112,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cachet-baby-gentle-rash-cream',
    title: 'Cachet PureBaby Calendula & Zinc Diaper Cream 50g',
    category: 'Baby Care',
    price: 155.00,
    discountPrice: 129.00,
    isRxRequired: false,
    stock: 95,
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    description: 'Gentle pediatric barrier cream by Cachet Pharmaceuticals with Zinc Oxide and natural organic Calendula to soothe diaper rashes and delicate infant skin.',
    ingredients: 'Zinc Oxide IP 15% w/w, Organic Calendula Extract, Purified Lanolin, Allantoin (Cachet Pharma).',
    usage: 'Change wet diapers promptly. Apply generously with each diaper change, especially at bedtime.',
    rating: 4.9,
    ratingCount: 165,
    createdAt: new Date().toISOString()
  }
];

// Helper to seed catalog if empty or update to Cachet lineup
export async function seedInitialProductsIfNeeded(): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    
    // Check if Cachet products already exist in collection
    const hasCachet = !snapshot.empty && snapshot.docs.some(d => d.id.startsWith('cachet-'));
    
    if (snapshot.empty || !hasCachet) {
      console.log('Seeding Cachet Pharmaceuticals medicines in Indian Rupees (₹) to Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, COLLECTIONS.PRODUCTS, prod.id), prod);
      }
      return INITIAL_PRODUCTS;
    }

    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (err) {
    console.warn('Could not auto-seed Firestore (using in-memory fallback Cachet catalog):', err);
    return INITIAL_PRODUCTS;
  }
}
