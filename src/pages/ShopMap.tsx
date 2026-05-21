import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Store, Phone, Search, Crosshair, Plus, Smartphone } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, where, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { cn } from '../lib/utils';

// Optimized Marker Icons for Mobile
const shopMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/869/869636.png', 
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
  className: 'drop-shadow-xl saturate-150 animate-pulse-slow'
});

const userMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61168.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'rounded-full border-2 border-white shadow-lg bg-brand-primary'
});

interface Shop {
  id: string;
  displayName: string;
  shopName?: string;
  shopType?: string;
  whatsapp?: string;
  photoURL?: string;
  isEnlisted?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

// Android Hardware Check (Simple)
const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const mem = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  return mem < 4 || cores < 4;
};

// Helper component to center map
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const SHOP_TYPES = [
  "মুদি দোকান (Grocery)",
  "ফার্মেসি (Pharmacy)",
  "রেস্টুরেন্ট (Restaurant)",
  "হার্ডওয়্যার (Hardware)",
  "অন্যান্য (Other)"
];

const BANGLADESH_BOUNDS: L.LatLngBoundsExpression = [
  [20.3446669, 88.0129852], // Southwest (Coast)
  [26.634064, 92.6727209]   // Northeast (Hills)
];

export const ShopMap = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [isPinning, setIsPinning] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState(SHOP_TYPES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapDistanceFilter, setMapDistanceFilter] = useState<number | null>(null);

  const filteredShops = shops.filter(shop => {
    const query = searchQuery.toLowerCase();
    return (shop.shopName?.toLowerCase().includes(query) || 
            shop.shopType?.toLowerCase().includes(query) ||
            shop.displayName?.toLowerCase().includes(query) ||
            false);
  });

  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
    
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Structured behavioral signaling
        try {
          await setDoc(doc(db, 'users', u.uid), {
            lastActive: serverTimestamp(),
            deviceInfo: {
              platform: navigator.platform,
              isLowEnd: isLowEndDevice()
            }
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${u.uid}`);
        }
      }
    });

    // PRIVACY FIRST: Only fetch shops that are explicitly enlisted
    const q = query(collection(db, 'users'), where('isEnlisted', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shopData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Shop))
        .filter(s => s.location && s.location.lat && s.location.lng);
      setShops(shopData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Get current user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setIsLoading(false);
        },
        () => {
          // Default to Dhaka coordinates if location fails
          setUserLocation([23.8103, 90.4125]);
          setIsLoading(false);
        }
      );
    } else {
      setUserLocation([23.8103, 90.4125]);
      setIsLoading(false);
    }

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, []);

  const handlePinShop = async () => {
    if (!user || !userLocation || !shopName.trim()) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        shopName: shopName,
        shopType: shopType,
        isEnlisted: true,
        location: {
          lat: userLocation[0],
          lng: userLocation[1]
        }
      });
      setIsPinning(false);
      setShopName('');
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    setIsGeocoding(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      let lat: number | null = null;
      let lng: number | null = null;

      if (apiKey) {
        // Use Google Maps Geocoding API with constraints to Bangladesh
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            locationQuery
          )}&components=country:BD&key=${apiKey}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          lat = data.results[0].geometry.location.lat;
          lng = data.results[0].geometry.location.lng;
        }
      } else {
        // Fallback to OSM Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            locationQuery
          )}&countrycodes=bd&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      }

      if (lat !== null && lng !== null) {
        setUserLocation([lat, lng]);
      } else {
        console.warn('Location not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <PageWrapper>
      <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter leading-none">দোকান ম্যাপ</h2>
          </div>
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPinning(true)}
              className="w-12 h-12 bg-brand-primary rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-6"
            >
              <Plus className="text-white" size={24} />
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-2 space-y-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="দোকানের নাম বা ধরণ দিয়ে খুজেন..."
              className="w-full bg-white border-2 border-slate-900 rounded-2xl py-3 pl-12 pr-4 font-bold text-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <form onSubmit={handleLocationSearch} className="relative group flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="এলাকা বা পোস্ট কোড (উদাঃ গুলশান, 1212)"
                className="w-full bg-white border-2 border-slate-900 rounded-2xl py-3 pl-12 pr-4 font-bold text-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none outline-none transition-all"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={isGeocoding || !locationQuery.trim()}
              className={cn(
                "px-4 bg-emerald-500 text-white font-black italic uppercase rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
                (isGeocoding || !locationQuery.trim()) && "opacity-50 grayscale"
              )}
            >
              {isGeocoding ? '...' : 'খুজুন'}
            </button>
          </form>
        </div>

        {/* Map Container - 3D Tilted Perspective (Disabled for low-end devices) */}
        <div className={cn("flex-1 rounded-3xl border-4 border-slate-900 overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] relative z-0", !isLowEnd && "perspective-1000")}>
          <div 
            className={cn("w-full h-full transform transition-transform duration-700 ease-out", !isLowEnd && "preserve-3d")} 
            style={{ transform: (!isLowEnd && isPinning) ? 'rotateX(5deg) scale(0.95)' : 'rotateX(0deg) scale(1)' }}
          >
            {!isLoading && userLocation ? (
              <MapContainer 
                center={userLocation} 
                zoom={15} 
                minZoom={7}
                maxBounds={BANGLADESH_BOUNDS}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                preferCanvas={true} // Performance optimization for low-end Android
              >
                <ChangeView center={userLocation} zoom={15} />
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Marker */}
                <Marker position={userLocation} icon={userMarkerIcon}>
                  <Popup>
                    <div className="p-2 font-black italic uppercase text-xs">আপনি এখানে</div>
                  </Popup>
                </Marker>

                {/* Shop Markers with Persistent Labels */}
                {filteredShops.map(shop => (
                  <Marker 
                    key={shop.id} 
                    position={[shop.location!.lat, shop.location!.lng]}
                    icon={shopMarkerIcon}
                    eventHandlers={{
                      click: () => {
                        if (user) {
                          // Behavioral Signaling: Log interaction
                          try {
                            addDoc(collection(db, 'interactions'), {
                              userId: user.uid,
                              targetId: shop.id,
                              type: 'map_click',
                              timestamp: serverTimestamp()
                            });
                          } catch (error) {
                            handleFirestoreError(error, OperationType.CREATE, 'interactions');
                          }
                        }
                      }
                    }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -20]} className="shop-label-glass">
                      <div className="px-2 py-0.5 font-black uppercase text-[8px] italic text-slate-900 leading-tight">
                        <span className="block border-b border-slate-900/10 pb-0.5">{shop.shopName}</span>
                        <span className="text-brand-primary block pt-0.5">{shop.displayName}</span>
                      </div>
                    </Tooltip>
                    <Popup>
                    <div className="p-2 min-w-[150px]">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center border-2 border-slate-900 overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          {shop.photoURL ? <img src={shop.photoURL} alt="" className="w-full h-full object-cover" /> : <Store size={18} />}
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase italic leading-none">{shop.shopName || "দোকান"}</h4>
                          <p className="text-[10px] text-brand-primary font-black uppercase italic mt-0.5">{shop.shopType}</p>
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">মালিক (OWNER)</p>
                        <p className="text-xs font-black italic">{shop.displayName}</p>
                      </div>
                      <div className="space-y-2">
                        {shop.whatsapp && (
                          <button 
                            onClick={() => window.open(`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`, '_blank')}
                            className="w-full flex items-center justify-center gap-2 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform"
                          >
                            <Phone size={12} fill="currentColor" />
                            WHATSAPP
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto text-slate-300 animate-bounce mb-4" size={48} />
                <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs">লোকেশন লোড হচ্ছে...</p>
              </div>
            </div>
          )}
        </div>

          {/* User Location Reset Button */}
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                  setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                });
              }
            }}
            className="absolute bottom-6 right-6 z-[1000] w-12 h-12 bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center active:scale-90 transition-transform"
          >
            <Crosshair className="text-slate-950" size={24} />
          </button>
        </div>

        {/* Legend / Info */}
        <div className="flex gap-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-primary rounded-full border border-slate-900"></div>
            <span className="text-[10px] font-black uppercase italic text-slate-500">আপনার লোকেশন</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-yellow rounded-full border border-slate-900"></div>
            <span className="text-[10px] font-black uppercase italic text-slate-500">অন্যান্য দোকান</span>
          </div>
        </div>
      </div>

      {/* Pin Shop Dialog */}
      <AnimatePresence>
        {isPinning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl border-4 border-slate-900 p-6 shadow-[12px_12px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-yellow rounded-2xl border-2 border-slate-900 flex items-center justify-center">
                  <Store className="text-slate-950" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic leading-none">আপনার দোকান পিন করেন</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">ম্যাপে সবাই আপনার দোকান দেখতে পারবে</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase italic text-slate-400 ml-1">দোকানের নাম (SHOP NAME)</label>
                  <input 
                    type="text" 
                    placeholder="উদাঃ বিসমিল্লাহ মুদি দোকান"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-900 focus:border-brand-primary outline-none transition-colors mt-1"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase italic text-slate-400 ml-1">দোকানের ধরণ (SHOP TYPE)</label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-900 focus:border-brand-primary outline-none transition-colors"
                      value={shopType}
                      onChange={(e) => setShopType(e.target.value)}
                    >
                      {SHOP_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center gap-3">
                  <MapPin className="text-brand-primary" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase italic text-slate-400">বর্তমান লোকেশন</p>
                    <p className="text-xs font-bold text-slate-700">{userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : 'পাওয়া যায়নি'}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsPinning(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-500 font-black uppercase italic rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    বাদ দিন
                  </button>
                  <button 
                    onClick={handlePinShop}
                    disabled={!shopName.trim()}
                    className={cn(
                      "flex-1 py-3 px-4 bg-brand-primary text-white font-black uppercase italic rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
                      !shopName.trim() && "opacity-50 grayscale pointer-events-none"
                    )}
                  >
                    পিন করেন
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};
