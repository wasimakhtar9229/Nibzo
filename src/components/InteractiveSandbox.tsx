/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Store, 
  Bike, 
  Settings, 
  MapPin, 
  Clock, 
  Search, 
  Tag, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  PhoneCall, 
  Send, 
  Lock, 
  CreditCard, 
  Smartphone,
  Check,
  Percent,
  PlusCircle,
  Eye,
  Trash2,
  Bell,
  RefreshCw,
  Award
} from 'lucide-react';
import { 
  UserRole, 
  SubscriptionTier, 
  Restaurant, 
  MenuItem, 
  Order, 
  OrderStatus, 
  DeliveryPartner, 
  PromoCode, 
  OrderItem
} from '../types';
import { 
  INITIAL_RESTAURANTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_RIDERS, 
  EX_PROMO_CODES, 
  SUBSCRIPTION_PLANS 
} from '../data/mockRestaurants';

export default function InteractiveSandbox() {
  // --- Persistent & In-memory Simulator States ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<DeliveryPartner[]>(INITIAL_RIDERS);
  const [promoCodes] = useState<PromoCode[]>(EX_PROMO_CODES);

  // --- Active Role / Navigation ---
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.CUSTOMER);
  
  // --- Customer States ---
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerCuisineFilter, setCustomerCuisineFilter] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number; selectedGroupCode?: string }[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [customerScreen, setCustomerScreen] = useState<'discover' | 'menu' | 'checkout' | 'track'>('discover');
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [cookingInstructions, setCookingInstructions] = useState('');
  
  // --- Restaurant States ---
  const [selectedRestId, setSelectedRestId] = useState<string>('rest_gourmet_kitchen');
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Main Course');
  const [newDishDescription, setNewDishDescription] = useState('');
  const [newDishVeg, setNewDishVeg] = useState(true);
  const [trialPhone, setTrialPhone] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [daysCounter, setDaysCounter] = useState(30);

  // --- Delivery Partner States ---
  const [selectedRiderId, setSelectedRiderId] = useState<string>('rider_pavan');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // --- Admin States ---
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(30);
  const [feePerKm, setFeePerKm] = useState(5);
  const [trialApprovalFilter, setTrialApprovalFilter] = useState<'all' | 'trial' | 'subscribed'>('all');

  // Customer Addresses
  const sampleAddresses = [
    { label: 'Home', address: 'Flat 304, Block C, Sobha Apartments, HSR Layout, Bengaluru', distance: 1.8 },
    { label: 'Work Office', address: 'WeWork Galaxy, 41-47 Outer Ring Road, Koramangala, Bengaluru', distance: 3.4 }
  ];

  const currentRestaurantObj = useMemo(() => {
    return restaurants.find(r => r.id === selectedRestId) || restaurants[0];
  }, [restaurants, selectedRestId]);

  // Unified Notification Trigger
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // --- Calculations for Cart subtotal, delivery fees, discount value ---
  const cartSubtotal = useMemo(() => {
    let sub = cartItems.reduce((acc, current) => acc + (current.item.priceINR * current.quantity), 0);
    const hasRisotto = cartItems.some(c => c.item.id === 'm1_risotto');
    if (hasRisotto) {
      if (selectedCustomizations.includes('Parmesan Dusting')) {
        sub += 45;
      }
      if (selectedCustomizations.includes('Burrata Top')) {
        sub += 120;
      }
    }
    return sub;
  }, [cartItems, selectedCustomizations]);

  const cartDeliveryFee = useMemo(() => {
    if (!selectedRestaurant) return 0;
    const dist = sampleAddresses[selectedAddressIndex].distance;
    return Math.round(baseDeliveryFee + (dist * feePerKm));
  }, [selectedRestaurant, selectedAddressIndex, baseDeliveryFee, feePerKm]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (cartSubtotal < appliedPromo.minOrderValueINR) return 0;
    
    if (appliedPromo.discountType === 'fixed') {
      return appliedPromo.discountValue;
    } else {
      const percentageDeduction = (cartSubtotal * appliedPromo.discountValue) / 100;
      return appliedPromo.maxDiscountINR ? Math.min(percentageDeduction, appliedPromo.maxDiscountINR) : percentageDeduction;
    }
  }, [appliedPromo, cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Math.max(0, (cartSubtotal + cartDeliveryFee) - discountAmount);
  }, [cartSubtotal, cartDeliveryFee, discountAmount]);

  // Zero Commission Savings calculations.
  // Aggregated across all completed simulated orders
  const savingsSummary = useMemo(() => {
    const completed = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const totalEarnings = completed.reduce((sum, o) => sum + o.subtotal, 0);
    // Typical Aggregator models charge ~25% direct commission on the subtotal.
    const approximateCommissionCharged = Math.round(totalEarnings * 0.25);
    const subscriptionCostPaid = restaurants.reduce((sum, r) => {
      if (r.subscriptionTier === SubscriptionTier.BASIC) return sum + 199;
      if (r.subscriptionTier === SubscriptionTier.PRO) return sum + 399;
      if (r.subscriptionTier === SubscriptionTier.ADVANCED) return sum + 699;
      return sum; // Trials are free
    }, 0);
    return {
      restaurantVolume: totalEarnings,
      commissionSaved: approximateCommissionCharged,
      nibzoSubscriptions: subscriptionCostPaid,
      percentFavorable: approximateCommissionCharged > 0 ? Math.round(((approximateCommissionCharged - subscriptionCostPaid) / approximateCommissionCharged) * 100) : 0
    };
  }, [orders, restaurants]);

  // Apply promo
  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code && p.active);
    if (!found) {
      triggerNotification('Invalid checkout coupon code or expired.');
      return;
    }
    if (cartSubtotal < found.minOrderValueINR) {
      triggerNotification(`Coupon requires a minimum order value of ₹${found.minOrderValueINR}.`);
      return;
    }
    setAppliedPromo(found);
    triggerNotification(`Coupon Code ${found.code} applied successfully! Saved ₹${found.discountType === 'percentage' ? found.discountValue + '%' : '₹' + found.discountValue}.`);
  };

  // Placed Order trigger
  const handlePlaceOrder = () => {
    if (!selectedRestaurant) return;
    if (cartItems.length === 0) return;

    // A restaurant becomes inactive until they activate subscription
    if (selectedRestaurant.status === 'inactive' || selectedRestaurant.status === 'suspended') {
      triggerNotification(`Unable to book. This restaurant's subscription has expired.`);
      return;
    }

    // Generate completion token
    const verificationPIN = Math.floor(1000 + Math.random() * 9000).toString();

    const orderPayload: Order = {
      id: `ORD_${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: 'cust_wasim',
      customerName: 'Wasim Ilyas',
      customerPhone: '+91 94821 00382',
      customerAddress: sampleAddresses[selectedAddressIndex].address,
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      items: cartItems.map(c => ({
        itemId: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        pricePerUnit: c.item.priceINR,
        selectedCustomizations: c.item.id === 'm1_risotto' 
          ? selectedCustomizations.map(name => ({
              groupName: 'Extra Cheese',
              optionName: name,
              extraPrice: name === 'Parmesan Dusting' ? 45 : 120
            })) 
          : []
      })),
      subtotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      promoDiscount: discountAmount,
      totalINR: cartTotal,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'success',
      status: OrderStatus.PLACED,
      deliveryToken: verificationPIN,
      placedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeLine: [{ status: OrderStatus.PLACED, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
    };

    setOrders([orderPayload, ...orders]);
    setTrackOrderId(orderPayload.id);
    setCustomerScreen('track');
    
    // Clear cart
    setCartItems([]);
    setSelectedCustomizations([]);
    setAppliedPromo(null);
    setPromoInput('');
    
    triggerNotification(`Order Placed successfully! Verification Code to give rider at destination is: ${verificationPIN}`);
  };

  // Restaurant Menu Action
  const handleAddDish = () => {
    const price = parseFloat(newDishPrice);
    if (!newDishName || isNaN(price) || price <= 0) {
      triggerNotification('Please provide a descriptive food name and positive price.');
      return;
    }

    // Check menu limits based on subscriptions
    const activeRest = currentRestaurantObj;
    const currentMenuCount = menuItems.filter(m => m.restaurantId === activeRest.id).length;
    let limit = 50;
    if (activeRest.subscriptionTier === SubscriptionTier.PRO || activeRest.subscriptionTier === SubscriptionTier.TRIAL) limit = 200;
    if (activeRest.subscriptionTier === SubscriptionTier.ADVANCED) limit = 9999999;

    if (currentMenuCount >= limit) {
      triggerNotification(`Limit reached! Your subscription tier (${activeRest.subscriptionTier}) allows up to ${limit} active items. Upgrade to insert more.`);
      return;
    }

    const newItem: MenuItem = {
      id: `m_${Date.now()}`,
      restaurantId: activeRest.id,
      category: newDishCategory,
      name: newDishName,
      description: newDishDescription || 'Tenderly cooked using local, sustainable herbs and farm-fresh ingredients.',
      priceINR: price,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
      isVeg: newDishVeg,
      isAvailable: true
    };

    setMenuItems([...menuItems, newItem]);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDescription('');
    triggerNotification(`"${newItem.name}" added to menu! Count is now ${currentMenuCount + 1}/${limit === 9999999 ? 'Unlimited' : limit}`);
  };

  // Simulation of free trial signup
  const handleStartTrial = () => {
    if (!trialPhone || !trialEmail) {
      triggerNotification('Provide email and mobile to trigger double-registration check.');
      return;
    }
    setOtpSent(true);
    setOtpCode('');
    triggerNotification('Simulating Secure Trial Registration: Verification OTP routed to phone.');
  };

  const handleVerifyOtp = () => {
    if (otpCode !== '481023' && otpCode.trim() !== '') {
      triggerNotification('OTP Verified successfully. Lock mechanism records verified phone status.');
    }
    setOtpVerified(true);
    
    // Update active restaurant to have TRIAL state
    setRestaurants(prev => prev.map(r => {
      if (r.id === selectedRestId) {
        return {
          ...r,
          subscriptionTier: SubscriptionTier.TRIAL,
          trialDaysRemaining: 30,
          status: 'active'
        };
      }
      return r;
    }));
    triggerNotification('30-day Free Trial activated! Check the banner at checkout.');
  };

  // Complete Order Flow via Delivery Rider OTP entry
  const handleDeliveryComplete = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (enteredOtp !== order.deliveryToken) {
      setOtpError('Invalid Dropoff Verification PIN! Please ask the customer for their device code.');
      return;
    }

    setOtpError('');
    setEnteredOtp('');

    // Update order status to DELIVERED
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: OrderStatus.DELIVERED,
          paymentStatus: 'success',
          timeLine: [...o.timeLine, { status: OrderStatus.DELIVERED, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
        };
      }
      return o;
    }));

    // Pay Rider 100% of delivery fee
    setRiders(prev => prev.map(r => {
      if (r.id === selectedRiderId) {
        return {
          ...r,
          earningsINR: r.earningsINR + order.deliveryFee,
          completedDeliveries: r.completedDeliveries + 1
        };
      }
      return r;
    }));

    triggerNotification(`Order ${orderId} successfully completed! ₹${order.deliveryFee} compensation added to driver's balance.`);
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden font-sans">
      
      {/* Toast Alert Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-slate-900 text-white font-medium text-xs px-5 py-4 rounded-xl border border-slate-800 shadow-2xl max-w-sm">
          <Sparkles className="h-4.5 w-4.5 text-yellow-400 shrink-0" />
          <p className="leading-snug">{notification}</p>
        </div>
      )}

      {/* Role Navigation Dashboard header */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-6 py-4 gap-4">
          <div>
            <h4 className="text-slate-900 font-bold text-lg flex items-center gap-2">
              <span className="bg-emerald-500 text-white font-extrabold tracking-widest text-xs px-2.5 py-1 rounded">NIBZO</span>
              Live Product Lifecycle Simulator
            </h4>
            <p className="text-xs text-slate-500">Conduct real-time transactions and map commission savings across 4 user terminals</p>
          </div>

          {/* Interactive Role Switch buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              id="role-btn-customer"
              onClick={() => setActiveRole(UserRole.CUSTOMER)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeRole === UserRole.CUSTOMER 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <User className="h-3.5 w-3.5" /> Customer App
            </button>
            <button
              id="role-btn-restaurant"
              onClick={() => setActiveRole(UserRole.RESTAURANT_OWNER)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeRole === UserRole.RESTAURANT_OWNER 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Store className="h-3.5 w-3.5" /> Merchant Panel
            </button>
            <button
              id="role-btn-delivery"
              onClick={() => setActiveRole(UserRole.DELIVERY_PARTNER)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeRole === UserRole.DELIVERY_PARTNER 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Bike className="h-3.5 w-3.5" /> Driver Console
            </button>
            <button
              id="role-btn-admin"
              onClick={() => setActiveRole(UserRole.ADMIN)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeRole === UserRole.ADMIN 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Platform Admin
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Workspace Body */}
      <div className="p-6 bg-slate-50 min-h-[580px]">
         {/* ==================== 1. CUSTOMER PORTAL ==================== */}
        {activeRole === UserRole.CUSTOMER && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Polished Mobile Device Mockup Frame (8 columns) */}
            <div className="lg:col-span-8 flex justify-center">
              <div id="nibzo-phone-frame" className="w-full max-w-[395px] min-h-[740px] bg-[#fff8f6] text-[#251915] rounded-[38px] border-[10px] border-slate-900 shadow-2xl relative flex flex-col overflow-hidden">
                
                {/* Phone Notch/Speaker Header */}
                <div className="bg-slate-900 h-6 w-full relative flex items-center justify-between px-6 text-white text-[10px] font-sans shrink-0 z-50">
                  <span className="font-semibold font-mono">11:32 AM</span>
                  <div className="w-20 h-4 bg-slate-900 rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0"></div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span className="font-mono">5G • 100%</span>
                  </div>
                </div>

                {/* Mobile App Bar */}
                <header className="bg-white border-b border-[#f6ddd7] px-4 py-3 pb-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,105,114,0.02)] shrink-0 z-40">
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span className="material-symbols-outlined text-[#ac3509] font-bold text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#ac3509]">{selectedAddressIndex === 0 ? 'Home' : 'Office'}</span>
                      <span className="text-[10px] text-[#59413a] truncate max-w-[140px] leading-none">
                        {sampleAddresses[selectedAddressIndex].address}
                      </span>
                    </div>
                  </div>
                  
                  {/* Current Active Step Pill */}
                  <span className="text-[9px] bg-[#fff1ed] text-[#ac3509] font-bold font-mono px-2 py-0.5 rounded-full border border-[#f6ddd7]">
                    {customerScreen.toUpperCase()} VIEW
                  </span>
                </header>

                {/* Simulated Screen Canvas Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 pb-24 relative select-none">
                  
                  {/* STEP A: DISCOVER HOME SCREEN */}
                  {customerScreen === 'discover' && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Search Bar Utilities */}
                      <div className="relative w-full shadow-[0_2px_12px_rgba(41,105,91,0.03)] bg-white rounded-lg">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                          type="text"
                          placeholder="Search for restaurants, dishes..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full text-xs text-[#251915] placeholder-[#8d7169] pl-9 pr-3 py-2 bg-white border border-[#e0bfb6] rounded-lg outline-none focus:ring-1 focus:ring-[#ac3509]"
                        />
                      </div>

                      {/* Hero Brand Promotional Banner */}
                      <div className="bg-gradient-to-r from-[#ac3509] to-[#ff7043] rounded-xl p-4 text-white relative overflow-hidden shadow-sm">
                        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4">
                          <span className="material-symbols-outlined text-8xl">restaurant</span>
                        </div>
                        <div className="relative z-10 max-w-[200px]">
                          <span className="bg-white/20 text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Local Zero-Commission
                          </span>
                          <h4 className="text-sm font-bold mt-1.5 leading-tight text-white">Zero Commission.<br/>100% Flavor.</h4>
                          <button onClick={() => {
                            const gourmet = restaurants.find(r => r.id === 'rest_gourmet_kitchen') || restaurants[0];
                            setSelectedRestaurant(gourmet);
                            setCustomerScreen('menu');
                          }} className="bg-white text-[#ac3509] font-bold text-[9px] px-3 py-1 rounded-md mt-2 hover:bg-[#ffe9e3] transition">
                            Explore Menu Code
                          </button>
                        </div>
                      </div>

                      {/* Food Categories Horizontal list */}
                      <div>
                        <span className="text-[11px] font-bold text-[#251915] uppercase tracking-wider block mb-2.5">Categories</span>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                          {[
                            { name: 'Biryani', icon: 'rice_bowl', bg: 'bg-[#acedda]', text: 'text-[#2e6d5f]' },
                            { name: 'Pizza', icon: 'local_pizza', bg: 'bg-[#fff1ed]', text: 'text-[#ac3509]' },
                            { name: 'North Indian', icon: 'ramen_dining', bg: 'bg-[#ffdad6]', text: 'text-[#93000a]' },
                            { name: 'Healthy', icon: 'eco', bg: 'bg-[#55d8e7]/20', text: 'text-[#004f56]' },
                            { name: 'Desserts', icon: 'cake', bg: 'bg-[#f6ddd7]', text: 'text-[#59413a]' },
                            { name: 'Drinks', icon: 'local_cafe', bg: 'bg-[#ffdbd0]', text: 'text-[#852300]' }
                          ].map((cat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 duration-100" onClick={() => setCustomerSearch(cat.name)}>
                              <div className={`w-10 h-10 rounded-full ${cat.bg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-lg ${cat.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                              </div>
                              <span className="text-[9px] font-semibold text-[#59413a]">{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Popular near you section carousel */}
                      <div>
                        <span className="text-[11px] font-bold text-[#251915] uppercase tracking-wider block mb-2.5">Popular Near You</span>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                          {menuItems.filter(m => m.isPopular).map((dish) => {
                            const rObj = restaurants.find(res => res.id === dish.restaurantId) || restaurants[0];
                            return (
                              <div 
                                key={dish.id} 
                                onClick={() => {
                                  setSelectedRestaurant(rObj);
                                  setCustomerScreen('menu');
                                  // Auto add item to cart
                                  if (!cartItems.some(c => c.item.id === dish.id)) {
                                    setCartItems([{ item: dish, quantity: 1 }]);
                                  }
                                }}
                                className="min-w-[155px] max-w-[155px] bg-white rounded-xl overflow-hidden border border-[#e0bfb6]/60 shadow-[0_2px_8px_rgba(41,105,91,0.02)] cursor-pointer hover:border-[#ac3509] transition flex flex-col justify-between"
                              >
                                <div className="h-20 w-full relative">
                                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs rounded px-1 flex items-center gap-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                    <span className="text-[8px] font-bold text-[#59413a]">{dish.isVeg ? 'Veg' : 'Non-veg'}</span>
                                  </div>
                                </div>
                                <div className="p-2 space-y-1">
                                  <h4 className="text-[10px] font-bold text-[#251915] truncate leading-tight">{dish.name}</h4>
                                  <p className="text-[8px] text-[#59413a] truncate">{rObj.name}</p>
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-extrabold text-[#ac3509]">₹{dish.priceINR}</span>
                                    <span className="text-yellow-500 font-bold flex items-center text-[8px]">★ {rObj.rating}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nearby Partner Restaurants Grid */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-[#251915] uppercase tracking-wider block mb-1">Nearby Restaurants</span>
                        <div className="space-y-3">
                          {restaurants
                            .filter(r => r.name.toLowerCase().includes(customerSearch.toLowerCase()) || r.cuisine.some(c => c.toLowerCase().includes(customerSearch.toLowerCase())))
                            .map(rest => (
                              <div 
                                key={rest.id}
                                onClick={() => {
                                  setSelectedRestaurant(rest);
                                  setCustomerScreen('menu');
                                }}
                                className="bg-white rounded-xl overflow-hidden border border-[#e0bfb6] shadow-[0_3px_12px_rgba(41,105,91,0.03)] cursor-pointer hover:border-[#ac3509] transition"
                              >
                                <div className="relative aspect-video w-full h-24 bg-slate-100">
                                  <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-2 left-2 bg-[#acedda]/95 text-[#065043] text-[8px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-[#29695b]/20">
                                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    Zero Commission Partner
                                  </div>
                                  <div className="absolute top-2 right-2 bg-[#ac3509] text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded">
                                    SAVE 100% REVENUE
                                  </div>
                                </div>
                                <div className="p-3 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-xs text-[#251915] truncate pr-2">{rest.name}</h4>
                                    <span className="bg-[#fff1ed] text-[#ac3509] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                                      {rest.rating} ★
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-[#59413a] truncate">{rest.tagline}</p>
                                  <div className="flex items-center gap-3 border-t border-[#f6ddd7]/60 pt-2 mt-1.5 text-[9px] text-[#59413a] font-mono justify-between">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span> {rest.deliveryTimeMins} min</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> {rest.distanceKm} km</span>
                                    <span className="text-[#29695b] font-bold">No surge fee</span>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP B: RESTAURANT DETAIL / MENU SCREEN */}
                  {customerScreen === 'menu' && selectedRestaurant && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Back button */}
                      <button 
                        onClick={() => { setSelectedRestaurant(null); setCustomerScreen('discover'); }}
                        className="text-[10px] font-bold text-[#ac3509] flex items-center gap-0.5 hover:underline bg-[#fff1ed] px-2 py-1 rounded-md"
                      >
                        ← Back to Indiranagar Discovery
                      </button>

                      {/* Header block cover */}
                      <div className="bg-white rounded-xl border border-[#e0bfb6] shadow-sm overflow-hidden">
                        <div className="h-24 w-full bg-slate-100">
                          <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3.5 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h1 className="font-bold text-sm text-[#251915] leading-tight">{selectedRestaurant.name}</h1>
                              <p className="text-[9px] text-[#59413a] mt-0.5">{selectedRestaurant.tagline}</p>
                            </div>
                            <span className="bg-[#fff1ed] text-[#ac3509] text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {selectedRestaurant.rating} ★
                            </span>
                          </div>
                          
                          <div className="inline-flex items-center gap-1 bg-[#acedda]/95 text-[#065043] text-[9px] font-semibold px-2 py-0.5 rounded border border-[#29695b]/20">
                            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Zero Commission Partner
                          </div>
                        </div>
                      </div>

                      {/* Switch Filters Strip */}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button 
                          onClick={() => setVegOnly(!vegOnly)}
                          className={`flex items-center gap-1 bg-white text-[9px] font-bold px-3 py-1.5 rounded-full border transition shrink-0 ${
                            vegOnly ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'text-[#251915] border-[#e0bfb6]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          Veg Only
                        </button>
                        <button className="bg-[#ffbb9f]/30 border border-[#ac3509] text-[#ac3509] text-[9px] font-bold px-3 py-1.5 rounded-full shrink-0">Best Sellers</button>
                        <button className="bg-white text-[#251915] border border-[#e0bfb6] text-[9px] font-medium px-3 py-1.5 rounded-full shrink-0">Main Course</button>
                      </div>

                      {/* Items list */}
                      <div className="space-y-4">
                        {menuItems
                          .filter(m => m.restaurantId === selectedRestaurant.id)
                          .filter(m => !vegOnly || m.isVeg)
                          .map(item => {
                            const currentQty = cartItems.find(c => c.item.id === item.id)?.quantity || 0;
                            return (
                              <div key={item.id} className="bg-white rounded-xl p-3 border border-[#e0bfb6]/60 shadow-[0_2px_8px_rgba(41,105,91,0.02)] flex gap-3 items-stretch">
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`inline-block w-3.5 h-3.5 border p-0.5 leading-none shrink-0 ${item.isVeg ? 'border-emerald-500' : 'border-red-500'}`}>
                                        <span className={`inline-block w-full h-full rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                      </span>
                                      {item.isPopular && <span className="bg-[#fff1ed] text-[#ac3509] text-[8px] font-bold px-1.5 rounded">Bestseller</span>}
                                    </div>
                                    <h3 className="font-bold text-[11px] text-[#251915] mt-1 leading-tight">{item.name}</h3>
                                    <p className="font-bold text-[10px] text-[#251915] mt-0.5">₹{item.priceINR}</p>
                                    <p className="text-[9px] text-[#59413a] leading-tight line-clamp-2 mt-1">{item.description}</p>
                                  </div>
                                </div>
                                <div className="w-20 h-20 relative shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-[#e0bfb6] shadow-md rounded-md flex items-center justify-between w-16 h-6 overflow-hidden">
                                    {currentQty > 0 ? (
                                      <>
                                        <button 
                                          onClick={() => {
                                            setCartItems(prev => prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
                                          }}
                                          className="w-5 text-[#ac3509] font-black text-xs hover:bg-[#ffe9e3]"
                                        >
                                          -
                                        </button>
                                        <span className="text-[10px] font-bold text-[#251915] w-6 text-center">{currentQty}</span>
                                        <button 
                                          onClick={() => {
                                            setCartItems(prev => prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                          }}
                                          className="w-5 text-[#ac3509] font-black text-xs hover:bg-[#ffe9e3]"
                                        >
                                          +
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          setCartItems([...cartItems, { item, quantity: 1 }]);
                                          triggerNotification(`"${item.name}" added to your LocalBite basket.`);
                                        }}
                                        className="w-full text-[#ac3509] font-bold text-[9px] uppercase tracking-wide py-1"
                                      >
                                        Add
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Customization side-panel inside device mock if Truffle Mushroom Risotto added */}
                      {cartItems.some(c => c.item.id === 'm1_risotto') && (
                        <div className="bg-[#fff1ed] border border-[#ffbb9f] rounded-xl p-3 space-y-2 animate-fade-in">
                          <h4 className="font-bold text-[10px] text-[#ac3509] uppercase tracking-wide flex items-center justify-between">
                            Customize Mushroom Risotto <span>Extra Cheese</span>
                          </h4>
                          <div className="space-y-1.5">
                            {[
                              { name: 'Parmesan Dusting', price: 45 },
                              { name: 'Burrata Top', price: 120 }
                            ].map((opt) => {
                              const isChecked = selectedCustomizations.includes(opt.name);
                              return (
                                <label key={opt.name} className="flex items-center justify-between bg-white/70 p-1.5 rounded border border-[#e0bfb6]/60 cursor-pointer hover:bg-white text-[9px]">
                                  <div className="flex items-center gap-1.5">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedCustomizations(selectedCustomizations.filter(c => c !== opt.name));
                                        } else {
                                          setSelectedCustomizations([...selectedCustomizations, opt.name]);
                                        }
                                      }}
                                      className="rounded text-[#ac3509] focus:ring-[#ac3509] h-3.5 w-3.5"
                                    />
                                    <span className="font-semibold text-[#251915]">{opt.name}</span>
                                  </div>
                                  <span className="font-bold text-[#ac3509]">+₹{opt.price}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP C: CHECKOUT SCREEN */}
                  {customerScreen === 'checkout' && (
                    <div className="space-y-4 animate-fade-in text-[10px]">
                      {/* Back button */}
                      <button 
                        onClick={() => setCustomerScreen('menu')}
                        className="text-[10px] font-bold text-[#ac3509] flex items-center gap-0.5 bg-[#fff1ed] px-2 py-1 rounded"
                      >
                        ← Back to Menu Catalog
                      </button>

                      {/* Delivery Address panel */}
                      <div className="bg-[#ffffff] p-3.5 rounded-xl border border-[#e0bfb6] shadow-sm space-y-2">
                        <div className="flex justify-between items-center border-b border-[#f6ddd7] pb-1.5">
                          <span className="font-bold text-xs text-[#251915]">Delivery Address</span>
                          <button onClick={() => setSelectedAddressIndex(prev => prev === 0 ? 1 : 0)} className="text-[#ac3509] font-bold">Change</button>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[#ac3509]" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                          <div>
                            <p className="font-bold text-[#251915]">{selectedAddressIndex === 0 ? 'Home' : 'Office'}</p>
                            <p className="text-[#59413a] leading-relaxed mt-0.5">{sampleAddresses[selectedAddressIndex].address}</p>
                            <p className="text-[#006972] font-semibold mt-1">Delivery Time: 30 - 45 mins</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-[#ffffff] p-3.5 rounded-xl border border-[#e0bfb6] shadow-sm space-y-3">
                        <span className="font-bold text-xs text-[#251915] block border-b border-[#f6ddd7] pb-1.5">Your Order</span>
                        
                        {cartItems.length === 0 ? (
                          <p className="text-[#59413a] italic text-center py-2">No items selected. Go back to add delicacies!</p>
                        ) : (
                          <div className="space-y-3">
                            {cartItems.map((cart, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 border border-[#29695b] flex items-center justify-center rounded-sm">
                                    <div className="w-1.5 h-1.5 bg-[#29695b] rounded-full"></div>
                                  </div>
                                  <div>
                                    <p className="font-bold text-[#251915]">{cart.item.name}</p>
                                    <p className="text-[8px] text-[#59413a]">₹{cart.item.priceINR} each</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-[#ffe9e3] px-2 py-0.5 rounded">
                                  <button onClick={() => {
                                    setCartItems(prev => prev.map(c => c.item.id === cart.item.id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
                                  }} className="text-[#ac3509] font-bold">-</button>
                                  <span className="font-bold">{cart.quantity}</span>
                                  <button onClick={() => {
                                    setCartItems(prev => prev.map(c => c.item.id === cart.item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                  }} className="text-[#ac3509] font-bold">+</button>
                                </div>
                                <span className="font-bold font-mono">₹{cart.item.priceINR * cart.quantity}</span>
                              </div>
                            ))}

                            {/* Customization Extra additions line */}
                            {selectedCustomizations.length > 0 && (
                              <div className="bg-[#fff1ed] p-2 rounded text-[8px] text-[#ac3509] space-y-0.5">
                                <p className="font-bold uppercase tracking-wider">Custom Extra Cheese Add-ons:</p>
                                {selectedCustomizations.map(cName => {
                                  const cPrice = cName === 'Parmesan Dusting' ? 45 : 120;
                                  return (
                                    <div key={cName} className="flex justify-between font-medium">
                                      <span>+ {cName}</span>
                                      <span>+ ₹{cPrice}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Cooking Instructions input field */}
                            <div className="pt-2 border-t border-[#f6ddd7]">
                              <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-lg border border-[#e0bfb6]">
                                <span className="material-symbols-outlined text-[#59413a] text-xs">notes</span>
                                <input 
                                  type="text" 
                                  placeholder="Add cooking / dropoff instructions..." 
                                  value={cookingInstructions}
                                  onChange={(e) => setCookingInstructions(e.target.value)}
                                  className="w-full bg-transparent border-none text-[9px] p-0 focus:ring-0 outline-none placeholder-[#8d7169]"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bill details */}
                      <div className="bg-[#ffffff] p-3.5 rounded-xl border border-[#e0bfb6] shadow-sm space-y-2">
                        <span className="font-bold text-xs text-[#251915] block mb-2">Bill Details</span>
                        <div className="space-y-1.5 text-[#59413a]">
                          <div className="flex justify-between">
                            <span>Item Total</span>
                            <span className="text-[#251915]">₹{cartSubtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className="text-[#251915]">₹{cartDeliveryFee}</span>
                          </div>
                          <p className="text-[8px] text-[#006972] leading-none italic">- Transferred directly to Alex M. (100%)</p>
                          <div className="flex justify-between items-center text-[9px]">
                            <span>Platform Fee</span>
                            <span className="text-[#29695b] font-bold">₹0 <span className="line-through text-slate-400 font-normal ml-1">₹15</span></span>
                          </div>
                          <p className="text-[8px] bg-[#acedda] text-[#2e6d5f] font-bold px-2 py-0.5 rounded-full w-fit">LocalBite Guarantee</p>
                        </div>
                        <div className="border-t border-[#f6ddd7] pt-2 mt-2 flex justify-between font-bold text-xs text-[#251915]">
                          <span>Grand Total</span>
                          <span className="text-[#ac3509] font-mono">₹{cartTotal}</span>
                        </div>
                      </div>

                      {/* Payment Method checkboxes */}
                      <div className="bg-[#ffffff] p-3.5 rounded-xl border border-[#e0bfb6] shadow-sm space-y-2">
                        <span className="font-bold text-xs text-[#251915] block">Payment Method</span>
                        <div className="space-y-1.5">
                          {[
                            { id: 'UPI', label: 'UPI payments (PhonePe / GPay)', icon: 'account_balance_wallet' },
                            { id: 'CARD', label: 'Credit Card (•••• 4242)', icon: 'credit_card' },
                            { id: 'COD', label: 'Cash on Delivery', icon: 'payments' }
                          ].map(pay => (
                            <label key={pay.id} className="flex items-center gap-2 p-2 border border-[#e0bfb6]/60 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                              <input 
                                type="radio" 
                                name="pay-method" 
                                checked={paymentMethod === pay.id}
                                onChange={() => setPaymentMethod(pay.id as any)}
                                className="text-[#ac3509] focus:ring-[#ac3509] w-3.5 h-3.5" 
                              />
                              <span className="material-symbols-outlined text-slate-500 text-xs">{pay.icon}</span>
                              <span className="font-semibold text-[#251915] flex-grow text-[9px]">{pay.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Place Order checkout CTA */}
                      <button
                        onClick={handlePlaceOrder}
                        disabled={cartItems.length === 0}
                        className="w-full bg-[#ff7043] text-white font-bold text-xs py-3 rounded-xl shadow-md hover:bg-[#ac3509] transition flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        Place Order • ₹{cartTotal}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  )}

                  {/* STEP D: LIVE TRACKING SCREEN */}
                  {customerScreen === 'track' && (
                    <div className="space-y-4 animate-fade-in text-[10px]">
                      
                      {/* Active MOCK order info lookup */}
                      {(() => {
                        const activeOrder = orders[0] || { id: 'ORD_X', deliveryToken: '8429', status: OrderStatus.PLACED };
                        return (
                          <>
                            {/* Live Interactive Map SVG Segment */}
                            <div className="relative w-full h-44 bg-slate-900 rounded-xl overflow-hidden border border-[#e0bfb6] shadow-inner shrink-0 leading-none">
                              <svg className="absolute inset-0 w-full h-full text-slate-800" xmlns="http://www.w3.org/2000/svg">
                                <pattern id="mock-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,112,67,0.06)" strokeWidth="1"/>
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#mock-grid)" />
                                {/* Route streets lines */}
                                <path d="M -20,40 L 400,110" stroke="rgba(255,112,67,0.12)" strokeWidth="5" fill="none" />
                                <path d="M 100,-20 L 120,240" stroke="rgba(255,112,67,0.12)" strokeWidth="4" fill="none" />
                                <path d="M 40,110 Q 180,60 320,150" stroke="rgba(255,112,67,0.16)" strokeWidth="4" fill="none" />
                                <path d="M 0,180 L 400,180" stroke="rgba(255,112,67,0.08)" strokeWidth="6" fill="none" />
                                {/* Dash route line */}
                                <path d="M 60,50 L 130,70 Q 180,95 240,130" stroke="#ac3509" strokeWidth="2.5" strokeDasharray="4,3" fill="none" className="animate-pulse" />
                              </svg>

                              {/* Restaurant location pin */}
                              <div className="absolute top-[40px] left-[55px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="bg-[#29695b] text-white p-1 rounded-full shadow-lg border border-white">
                                  <span className="material-symbols-outlined text-[10px]">soup_kitchen</span>
                                </div>
                                <span className="text-[7.5px] font-bold text-white bg-slate-900 border border-slate-800 px-1 py-0.5 rounded shadow mt-0.5">Kitchen</span>
                              </div>

                              {/* Home pin */}
                              <div className="absolute top-[130px] left-[235px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="bg-[#ac3509] text-white p-1 rounded-full shadow-lg border border-white">
                                  <span className="material-symbols-outlined text-[10px]">home</span>
                                </div>
                                <span className="text-[7.5px] font-bold text-slate-800 bg-white border border-[#e0bfb6] px-1 py-0.5 rounded shadow mt-0.5">Your Home</span>
                              </div>

                              {/* Courier Bike position */}
                              <div className="absolute top-[90px] left-[155px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                                <div className="bg-[#ff7043] text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-xs">two_wheeler</span>
                                </div>
                                <span className="text-[8px] font-bold text-white bg-slate-900 border border-slate-800 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap flex items-center gap-0.5">
                                  Alex M. <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                                </span>
                              </div>
                            </div>

                            {/* Lives order tracker status badge */}
                            <div className="text-center py-2 bg-white rounded-xl border border-[#e0bfb6] shadow-sm">
                              <h2 className="text-lg font-bold text-[#251915] leading-none mb-0.5">12 mins</h2>
                              <p className="text-[9px] text-[#59413a]">Estimated arrival time</p>
                            </div>

                            {/* DELIVERY SECURITY OTP PANEL */}
                            <div className="bg-[#ff7043] text-white rounded-xl p-3.5 flex items-center justify-between shadow-md">
                              <div>
                                <span className="text-[8px] text-white/80 font-bold uppercase tracking-wider block font-mono">DELIVERY CONFIRMATION OTP PIN:</span>
                                <span className="font-mono text-xl font-bold tracking-widest block text-white mt-0.5">{activeOrder.deliveryToken}</span>
                                <p className="text-[8px] text-white/90 leading-tight mt-1">Provide this code to Alex M. at dropoff to unlock payout transfer</p>
                              </div>
                              <div className="bg-white/20 p-2 rounded-full text-white">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              </div>
                            </div>

                            {/* Driver detail profile card */}
                            <div className="bg-white p-3 rounded-xl border border-[#e0bfb6] shadow-sm flex items-center gap-3">
                              <img className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#f6ddd7]" src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=150" alt="Rider Alex M" />
                              <div className="flex-grow">
                                <h4 className="font-bold text-xs text-[#251915]">Alex M.</h4>
                                <div className="text-[8px] text-[#59413a] flex items-center gap-1 font-mono">
                                  <span className="material-symbols-outlined text-[10px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                  4.9 Rating (120+ verified trips)
                                </div>
                                <span className="text-[8px] text-slate-400 font-mono">KA-03-HL-9201</span>
                              </div>
                              <button onClick={() => triggerNotification('Dialing Rider Alex M... "+91 98451 00312"')} className="w-8 h-8 rounded-full bg-[#acedda] text-[#065043] flex items-center justify-center hover:bg-emerald-100 transition active:scale-95 shrink-0">
                                <span className="material-symbols-outlined text-xs">call</span>
                              </button>
                            </div>

                            {/* Custom Step-by-Step progress timeline */}
                            <div className="bg-white p-3.5 rounded-xl border border-[#e0bfb6] shadow-[0_2px_8px_rgba(41,105,91,0.02)] space-y-3.5">
                              <span className="text-[9px] font-bold text-[#251915] uppercase tracking-wider block">Live Delivery Progress Logs:</span>
                              {[
                                { key: OrderStatus.PLACED, label: 'Order Registered with Restaurant' },
                                { key: OrderStatus.ACCEPTED, label: 'Approved by The Gourmet Kitchen' },
                                { key: OrderStatus.PREPARING, label: 'Chef slow-cooking ingredients' },
                                { key: OrderStatus.READY_FOR_PICKUP, label: 'Awaiting Rider Pick-up at Counter' },
                                { key: OrderStatus.RIDER_ASSIGNED, label: 'Delivery Partner Assigned (Alex M.)' },
                                { key: OrderStatus.PICKED_UP, label: 'Rider Out for Delivery on Scooter' },
                                { key: OrderStatus.DELIVERED, label: 'Delivered Safeguarded by OTP Release' }
                              ].map((step, idx) => {
                                const steps = [
                                  OrderStatus.PLACED, 
                                  OrderStatus.ACCEPTED, 
                                  OrderStatus.PREPARING, 
                                  OrderStatus.READY_FOR_PICKUP,
                                  OrderStatus.RIDER_ASSIGNED,
                                  OrderStatus.PICKED_UP,
                                  OrderStatus.DELIVERED
                                ];
                                const orderIdx = steps.indexOf(activeOrder.status);
                                const currentIdx = steps.indexOf(step.key);
                                const isDone = currentIdx <= orderIdx;
                                const isCurrent = step.key === activeOrder.status;

                                return (
                                  <div key={idx} className="flex items-center gap-3">
                                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                      isCurrent ? 'bg-[#ff7043] ring-4 ring-[#ff7043]/30 animate-pulse' : 
                                      isDone ? 'bg-[#29695b]' : 'bg-slate-200'
                                    }`} />
                                    <span className={`text-[9px] ${
                                      isCurrent ? 'color-[#ac3509] font-bold' : isDone ? 'text-[#251915] font-semibold' : 'text-slate-400'
                                    }`}>
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Empty search results fallback */}
                  {customerScreen === 'discover' && customerSearch && restaurants.filter(r => r.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl border border-[#e0bfb6]/60 p-4">
                      <span className="material-symbols-outlined text-[#ac3509] text-3xl">sentiment_dissatisfied</span>
                      <p className="text-xs text-[#251915] font-bold mt-2">No matching eateries found</p>
                      <button onClick={() => setCustomerSearch('')} className="text-[#ac3509] text-[10px] font-bold underline mt-1">Clear search parameters</button>
                    </div>
                  )}
                </div>

                {/* Persistent Navigation app bar mockup (Phone Navigation Bottom style) */}
                <nav className="absolute bottom-0 w-full bg-white border-t border-[#f6ddd7] h-14 shrink-0 flex justify-around items-center px-2 z-40">
                  <button 
                    onClick={() => { setSelectedRestaurant(null); setCustomerScreen('discover'); }}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg ${customerScreen === 'discover' ? 'text-[#ac3509]' : 'text-[#8d7169] hover:text-[#ac3509]'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span className="text-[8px] font-bold">Home</span>
                  </button>
                  <button 
                    onClick={() => {
                      const gourmet = restaurants.find(r => r.id === 'rest_gourmet_kitchen') || restaurants[0];
                      setSelectedRestaurant(gourmet);
                      setCustomerScreen('menu');
                    }}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg ${customerScreen === 'menu' ? 'text-[#ac3509]' : 'text-[#8d7169] hover:text-[#ac3509]'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                    <span className="text-[8px] font-bold">Menu</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (cartItems.length > 0) {
                        setCustomerScreen('checkout');
                      } else {
                        triggerNotification('Add local delicacies first to view the checkout bill summary.');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg ${customerScreen === 'checkout' ? 'text-[#ac3509]' : 'text-[#8d7169] hover:text-[#ac3509]'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    <span className="text-[8px] font-bold">Checkout</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (orders.length > 0) {
                        setCustomerScreen('track');
                      } else {
                        triggerNotification('Place a live order to track real-time delivery status.');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-1 rounded-lg ${customerScreen === 'track' ? 'text-[#ac3509]' : 'text-[#8d7169] hover:text-[#ac3509]'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                    <span className="text-[8px] font-bold">Tracking</span>
                  </button>
                </nav>

                {/* Floating "View Cart" sticky banner on restaurant menu view */}
                {customerScreen === 'menu' && cartItems.length > 0 && (
                  <div className="absolute bottom-14 left-0 right-0 p-3 bg-transparent z-40 animate-bounce">
                    <button 
                      onClick={() => setCustomerScreen('checkout')}
                      className="w-full bg-[#ac3509] text-white py-2.5 px-4 rounded-xl flex items-center justify-between shadow-lg text-[10px] font-bold hover:bg-[#ff7043] transition"
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span>{cartItems.reduce((acc, c) => acc + c.quantity, 0)} Items | ₹{cartSubtotal}</span>
                        <span className="opacity-80 text-[8px] font-light">Extra cheese customizer applied</span>
                      </div>
                      <div className="flex items-center gap-1">
                        View Cart <span className="material-symbols-outlined text-sm">shopping_bag</span>
                      </div>
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Live Testing Operations Control Console (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Interactive Preset Simulator Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff7043] inline-block animate-ping"></span>
                  Sandbox Quick Debugger
                </span>
                
                <p className="text-slate-600 text-xs leading-relaxed">
                  Use these testing presets to instantly mock customer actions and restaurant delivery events, saving you from manual clicking work.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      // Autofill cart with Risotto of gourmet kitchen
                      const res = restaurants.find(r => r.id === 'rest_gourmet_kitchen') || restaurants[0];
                      const item = menuItems.find(m => m.id === 'm1_risotto') || menuItems[0];
                      setSelectedRestaurant(res);
                      setCartItems([{ item, quantity: 1 }]);
                      setSelectedCustomizations(['Parmesan Dusting', 'Burrata Top']);
                      setCustomerScreen('menu');
                      triggerNotification('Auto-filled: Truffle Mushroom Risotto with Extra Cheese added to cart.');
                    }}
                    className="bg-[#fff1ed] hover:bg-[#ffe9e3] text-[#ac3509] text-xs font-semibold py-2 px-4 rounded-lg border border-[#ffbb9f] text-left flex justify-between items-center transition"
                  >
                    <span>🍔 Presell Risotto + Addons</span>
                    <span className="text-[10px] font-mono opacity-80">Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      // Autoplace active order
                      const res = restaurants.find(r => r.id === 'rest_gourmet_kitchen') || restaurants[0];
                      const item = menuItems.find(m => m.id === 'm1_risotto') || menuItems[0];
                      setSelectedRestaurant(res);
                      
                      const verificationPIN = '8429';
                      const mockOrder: Order = {
                        id: 'ORD_899201',
                        customerId: 'cust_wasim',
                        customerName: 'Wasim Ilyas',
                        customerPhone: '+91 94821 00382',
                        customerAddress: sampleAddresses[0].address,
                        restaurantId: res.id,
                        restaurantName: res.name,
                        items: [{ itemId: item.id, name: item.name, quantity: 1, pricePerUnit: item.priceINR, selectedCustomizations: [{ groupName: 'Extra Cheese', optionName: 'Parmesan Dusting', extraPrice: 45 }, { groupName: 'Extra Cheese', optionName: 'Burrata Top', extraPrice: 120 }] }],
                        subtotal: 495 + 45 + 120,
                        deliveryFee: 40,
                        promoDiscount: 0,
                        totalINR: 700,
                        paymentMethod: 'UPI',
                        paymentStatus: 'success',
                        status: OrderStatus.RIDER_ASSIGNED,
                        deliveryToken: verificationPIN,
                        assignedRiderId: 'rider_alex',
                        placedAt: '11:15 AM',
                        timeLine: [{ status: OrderStatus.PLACED, time: '11:15 AM' }, { status: OrderStatus.RIDER_ASSIGNED, time: '11:20 AM' }]
                      };

                      setOrders([mockOrder, ...orders]);
                      setTrackOrderId(mockOrder.id);
                      setCustomerScreen('track');
                      triggerNotification('Order placed and Alex M. assigned as courier! Dropoff PIN is 8429.');
                    }}
                    className="bg-[#29695b]/10 hover:bg-[#29695b]/20 text-[#29695b] text-xs font-semibold py-2 px-4 rounded-lg border border-[#29695b]/20 text-left flex justify-between items-center transition"
                  >
                    <span>🛵 Mock Active Delivery (OTP: 8429)</span>
                    <span className="text-[10px] font-mono opacity-80">Force Tracking</span>
                  </button>
                </div>
              </div>

              {/* Live Status transition stream */}
              {orders.length > 0 && (
                <div className="bg-slate-900 rounded-xl text-white border border-slate-800 p-5 space-y-3.5 shadow-md">
                  <span className="text-emerald-400 font-mono text-4xs font-bold uppercase tracking-wider block">Live Delivery Event Controller</span>
                  <p className="text-slate-400 text-xs">Fast-forward active orders through status events on the platform.</p>
                  
                  {orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.REJECTED).map(o => (
                    <div key={o.id} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-4xs">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{o.id} (Current: {o.status})</span>
                        <span className="text-yellow-400">PIN: {o.deliveryToken}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {[
                          { next: OrderStatus.ACCEPTED, label: 'Kitchen Accepts' },
                          { next: OrderStatus.PREPARING, label: 'Chefs Cooking' },
                          { next: OrderStatus.READY_FOR_PICKUP, label: 'Order Packed' },
                          { next: OrderStatus.RIDER_ASSIGNED, label: 'Assign Alex M.' },
                          { next: OrderStatus.PICKED_UP, label: 'Scooter Leaves' }
                        ].map((evt) => (
                          <button
                            key={evt.next}
                            disabled={o.status === evt.next}
                            onClick={() => {
                              setOrders(prev => prev.map(ord => {
                                if (ord.id === o.id) {
                                  return {
                                    ...ord,
                                    status: evt.next,
                                    assignedRiderId: evt.next === OrderStatus.RIDER_ASSIGNED ? 'rider_alex' : ord.assignedRiderId,
                                    timeLine: [...ord.timeLine, { status: evt.next, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
                                  };
                                }
                                return ord;
                              }));
                              triggerNotification(`Simulated status updated for ${o.id}: ${evt.next}`);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded transition disabled:bg-slate-950 disabled:text-slate-600 disabled:border-slate-850"
                          >
                            {evt.label}
                          </button>
                        ))}
                      </div>

                      {/* Dropoff complete verification trigger */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-slate-400">Rider Alex needs PIN ({o.deliveryToken}):</span>
                        <button
                          onClick={() => {
                            setEnteredOtp(o.deliveryToken);
                            // Complete delivery
                            setOrders(prev => prev.map(ord => {
                              if (ord.id === o.id) {
                                return {
                                  ...ord,
                                  status: OrderStatus.DELIVERED,
                                  paymentStatus: 'success',
                                  timeLine: [...ord.timeLine, { status: OrderStatus.DELIVERED, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
                                };
                              }
                              return ord;
                            }));

                            // Pay Rider 100% of delivery fee
                            setRiders(prev => prev.map(r => {
                              if (r.id === 'rider_alex') {
                                return {
                                  ...r,
                                  earningsINR: r.earningsINR + o.deliveryFee,
                                  completedDeliveries: r.completedDeliveries + 1
                                };
                              }
                              return r;
                            }));

                            triggerNotification(`Order ${o.id} successfully completed via OTP verification! Rider Alex M. paid ₹${o.deliveryFee} instantly.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded transition text-center shrink-0"
                        >
                          Complete Dropoff ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================== 2. MERCHANT PORTAL ==================== */}
        {activeRole === UserRole.RESTAURANT_OWNER && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column: Trial signup and subscription status management */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Active Restaurant Context</span>
                
                <div className="space-y-2">
                  <span className="text-4xs text-slate-400 font-mono uppercase block">Select Simulated Restaurant:</span>
                  <select 
                    id="merchant-rest-select"
                    value={selectedRestId}
                    onChange={(e) => setSelectedRestId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.subscriptionTier})</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Subscription Level:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-4xs font-bold px-2 py-0.5 rounded uppercase">
                      {currentRestaurantObj.subscriptionTier}
                    </span>
                  </div>
                  
                  {currentRestaurantObj.subscriptionTier === SubscriptionTier.TRIAL ? (
                    <div className="space-y-2 text-4xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trial Days Remaining:</span>
                        <span className="text-orange-600 font-bold">{currentRestaurantObj.trialDaysRemaining} Days</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${(currentRestaurantObj.trialDaysRemaining || 30) / 30 * 100}%` }}></div>
                      </div>
                      <p className="text-slate-400 leading-normal italic">Trial is active under Pro Plan capabilities. Expiring will mark restaurant as inactive until subscription is activated.</p>
                    </div>
                  ) : (
                    <div className="text-4xs text-slate-500 font-medium">
                      Plan Status: <span className="text-emerald-600 font-bold uppercase">Paid / Active 30-Day Billing Cycle</span>
                    </div>
                  )}

                  {/* Manual trigger buttons */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setRestaurants(prev => prev.map(r => r.id === selectedRestId ? { ...r, subscriptionTier: SubscriptionTier.ADVANCED, status: 'active', trialDaysRemaining: undefined } : r));
                        triggerNotification('Upgraded subscription context to ADVANCED PLAN! Cap elevated to unlimited menu dishes.');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-4xs font-bold py-1.5 px-3 rounded text-center transition"
                    >
                      Activate Paid Advanced Plan (₹699)
                    </button>
                    <button
                      onClick={() => {
                        setRestaurants(prev => prev.map(r => r.id === selectedRestId ? { ...r, subscriptionTier: SubscriptionTier.BASIC, status: 'active', trialDaysRemaining: undefined } : r));
                        triggerNotification('Downgraded plan to Basic. Capacity capped to 50 items.');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-4xs font-medium py-1 px-3 rounded text-center transition"
                    >
                      Downgrade to Basic (₹199/m)
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Free 30-Day trial Simulation Form */}
              {currentRestaurantObj.subscriptionTier !== SubscriptionTier.TRIAL && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-slate-800 font-bold text-xs uppercase block">Secure 30-Day Trial Signup</span>
                    <p className="text-5xs text-slate-400 mt-0.5 font-medium leading-none">OTP and email checks protect platform from duplication issues</p>
                  </div>

                  {!otpVerified ? (
                    <div className="space-y-3 text-4xs">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium">Owner Mobile Number:</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={trialPhone}
                          onChange={(e) => setTrialPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium">Merchant Business Email:</label>
                        <input
                          type="email"
                          placeholder="owner@dhaba.com"
                          value={trialEmail}
                          onChange={(e) => setTrialEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      {otpSent ? (
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-2 animate-pulse mt-2">
                          <label className="text-emerald-700 font-bold block">SMS Verification OTP Code:</label>
                          <input
                            type="text"
                            placeholder="Enter any random values (e.g., 481023)"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 text-center font-mono tracking-widest outline-none focus:border-emerald-500"
                          />
                          <button
                            id="trial-verify-btn"
                            onClick={handleVerifyOtp}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full py-1 rounded text-center block"
                          >
                            Verify Credentials
                          </button>
                        </div>
                      ) : (
                        <button
                          id="trial-otp-btn"
                          onClick={handleStartTrial}
                          className="bg-slate-930 text-white hover:bg-slate-800 font-bold w-full py-1.5 rounded text-center block mt-2 transition"
                        >
                          Trigger Verification Tokens
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 text-center text-4xs">
                      ✓ Owner Phone and Email combination has been verified. Abuse prevention schema has registered hardware locks.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle Main Column: Menu item management logs */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Restaurant Menu Builder Tool</span>

                {/* Add dynamic Dish form */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-4xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Food Dish Title:</label>
                    <input
                      type="text"
                      placeholder="e.g. Garlic Naan Double Cheese"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Dish Price (INR):</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={newDishPrice}
                      onChange={(e) => setNewDishPrice(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium font-sans">Dish category:</label>
                    <select
                      value={newDishCategory}
                      onChange={(e) => setNewDishCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none"
                    >
                      <option value="Main Course">Main Course</option>
                      <option value="Recommended Specials">Recommended Specials</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Pure Desi Butter">Pure Desi Butter</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="text-slate-500 font-medium block mb-1">Vegetarian Category:</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setNewDishVeg(true)}
                        className={`px-3 py-1 border rounded text-5xs font-sans transition ${newDishVeg ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-white text-slate-500'}`}
                      >
                        Vegetarian
                      </button>
                      <button 
                        onClick={() => setNewDishVeg(false)}
                        className={`px-3 py-1 border rounded text-5xs font-sans transition ${!newDishVeg ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white text-slate-500'}`}
                      >
                        Non-Vegetarian
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-slate-500 font-medium">Description (Optional):</label>
                    <input 
                      type="text"
                      placeholder="List ingredients and servings quantities..."
                      value={newDishDescription}
                      onChange={(e) => setNewDishDescription(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    id="add-dish-btn"
                    onClick={handleAddDish}
                    className="md:col-span-2 bg-slate-900 text-white hover:bg-slate-800 font-bold p-2 rounded-lg text-center mt-1 transition"
                  >
                    ADD ITEM TO RESTAURANT
                  </button>
                </div>

                {/* Items preview table list */}
                <div className="space-y-2">
                  <span className="text-4xs text-slate-400 font-mono uppercase block">Active Kitchen items ({menuItems.filter(m => m.restaurantId === currentRestaurantObj.id).length}):</span>
                  
                  <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {menuItems
                      .filter(m => m.restaurantId === currentRestaurantObj.id)
                      .map((item, idx) => (
                        <div key={idx} className="p-2.5 flex justify-between items-center text-4xs hover:bg-slate-25 transition">
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <span className={`inline-block w-2.5 h-2.5 border p-0.5 leading-none shrink-0 ${item.isVeg ? 'border-emerald-500' : 'border-red-500'}`}>
                                <span className={`inline-block w-full h-full rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              </span>
                              {item.name}
                            </p>
                            <span className="text-slate-400 text-5xs font-mono">{item.category}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-slate-900">₹{item.priceINR}</span>
                            <button
                              onClick={() => {
                                setMenuItems(prev => prev.filter(m => m.id !== item.id));
                                triggerNotification(`Discharged "${item.name}" from active kitchen offerings.`);
                              }}
                              className="text-slate-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Order Management Panel */}
            <div className="xl:col-span-3 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Active Kitchen Pipeline</span>
                
                {orders.filter(o => o.restaurantId === currentRestaurantObj.id).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs leading-normal">
                    No active tasks currently. Open the Customer Terminal and place order payload to view dynamic alerts.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .filter(o => o.restaurantId === currentRestaurantObj.id)
                      .map(order => (
                        <div key={order.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-4xs space-y-2.5 hover:border-slate-300 transition">
                          <div className="flex justify-between font-bold border-b border-slate-100 pb-1.5">
                            <div>
                              <span>{order.id}</span>
                              <span className="text-slate-400 block font-normal">{order.customerName}</span>
                            </div>
                            <span className="text-slate-700 font-mono font-bold">₹{order.totalINR}</span>
                          </div>

                          <div className="space-y-1 pl-1">
                            {order.items.map((it, rid) => (
                              <p key={rid} className="text-slate-600">
                                <b>{it.quantity}x</b> {it.name}
                              </p>
                            ))}
                          </div>

                          {/* Order State controls */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <span className="text-slate-500 font-semibold block">Cycle Control:</span>
                            
                            {order.status === OrderStatus.PLACED && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: OrderStatus.ACCEPTED } : o));
                                    triggerNotification(`Order Accepted. Preparing stage started on merchant system.`);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1 py-1 rounded text-center transition"
                                >
                                  Accept Order
                                </button>
                                <button
                                  onClick={() => {
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: OrderStatus.REJECTED } : o));
                                    triggerNotification(`Order Declined. Subtotal sent back to customer wallet.`);
                                  }}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold flex-1 py-1 rounded text-center transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {order.status === OrderStatus.ACCEPTED && (
                              <button
                                onClick={() => {
                                  setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: OrderStatus.PREPARING } : o));
                                  triggerNotification(`Kitchen changed status to: PREPARING.`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full py-1 rounded text-center transition"
                              >
                                Set Preparing
                              </button>
                            )}

                            {order.status === OrderStatus.PREPARING && (
                              <button
                                onClick={() => {
                                  setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: OrderStatus.READY_FOR_PICKUP } : o));
                                  triggerNotification(`Status changed to: READY_FOR_PICKUP.`);
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-full py-1.5 rounded text-center transition"
                              >
                                Packaging Completed (Ready)
                              </button>
                            )}

                            {order.status === OrderStatus.READY_FOR_PICKUP && (
                              <div className="text-slate-500 font-mono text-center bg-white border border-slate-200 py-1.5 rounded p-1 italic uppercase">
                                Awaiting Driver assignment
                              </div>
                            )}

                            {order.status === OrderStatus.RIDER_ASSIGNED && (
                              <div className="text-amber-700 font-mono text-center bg-amber-50 border border-amber-200 py-1.5 rounded p-1 font-semibold uppercase">
                                Driver assigned - waiting pick up
                              </div>
                            )}

                            {[OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY].includes(order.status) && (
                              <div className="text-slate-500 font-mono text-center bg-white border border-slate-200 py-1.5 rounded p-1 italic uppercase">
                                Out for transit delivery
                              </div>
                            )}

                            {order.status === OrderStatus.DELIVERED && (
                              <div className="bg-emerald-50 text-emerald-800 border-emerald-250 py-1 rounded text-center font-bold font-mono">
                                COMPLETED
                              </div>
                            )}

                            {order.status === OrderStatus.REJECTED && (
                              <div className="bg-red-50 text-red-800 border-red-250 py-1 rounded text-center font-bold font-mono">
                                REJECTED / CANCELED
                              </div>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 3. DELIVERY PARTNER PORTAL ==================== */}
        {activeRole === UserRole.DELIVERY_PARTNER && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Config Panel */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Active Rider Profile Profile</span>
                
                <div className="space-y-2">
                  <span className="text-4xs text-slate-400 font-mono uppercase block">Choose Active Driver:</span>
                  <select 
                    id="driver-rider-select"
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  >
                    {riders.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.vehicleNumber})</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const riderObj = riders.find(r => r.id === selectedRiderId)!;
                  return (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium font-sans">Toggle working status:</span>
                        <button
                          onClick={() => {
                            setRiders(prev => prev.map(r => r.id === selectedRiderId ? { ...r, isOnline: !r.isOnline } : r));
                            triggerNotification(`Online working toggle updated.`);
                          }}
                          className={`px-3 py-1 text-5xs font-mono font-bold rounded-full ${riderObj.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {riderObj.isOnline ? '● ONLINE' : '○ OFFLINE'}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-4xs">
                        <span className="text-slate-500">Delivered Volume:</span>
                        <span className="font-mono text-slate-900 font-bold">{riderObj.completedDeliveries} Deliveries</span>
                      </div>

                      <div className="flex justify-between items-center text-4xs">
                        <span className="text-slate-500">Accumulated Wallet Balance:</span>
                        <span className="font-mono text-emerald-600 font-extrabold">₹{riderObj.earningsINR}</span>
                      </div>

                      <p className="text-5xs text-slate-400 leading-normal border-t border-slate-200/80 pt-2">
                        Courier fees collected from checkout calculations are deposited 100% straight into the active partner pocket. Platform commissions set back to 0%.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right main board: Active Assignments feed */}
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Rider Command Center Feed</span>

                {(() => {
                  const activeRiderObj = riders.find(r => r.id === selectedRiderId)!;
                  
                  // Pending delivery tasks nearby
                  const pendingAssign = orders.filter(o => o.status === OrderStatus.READY_FOR_PICKUP);
                  const activeJob = orders.find(o => 
                    o.assignedRiderId === selectedRiderId && 
                    ![OrderStatus.DELIVERED, OrderStatus.REJECTED].includes(o.status)
                  );

                  if (!activeRiderObj.isOnline) {
                    return (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        Change the working working status to ONLINE in the left configuration card to stream nearby route assignments logs.
                      </div>
                    );
                  }

                  if (activeJob) {
                    return (
                      <div className="bg-slate-930 text-white rounded-xl p-5 space-y-4 border border-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-emerald-400 text-4xs font-mono font-bold uppercase tracking-wider block">ROUTE TASK CURRENTLY IN TRANSACTION</span>
                            <h6 className="font-bold text-sm text-slate-100">{activeJob.id}</h6>
                          </div>
                          
                          <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                            Payout Earned: ₹{activeJob.deliveryFee}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-4xs">
                          <div className="space-y-1">
                            <span className="text-slate-400 uppercase font-mono">Restaurant Pickup Address:</span>
                            <p className="text-slate-200 font-bold">{activeJob.restaurantName}</p>
                            <p className="text-slate-450 italic">{restaurants.find(r => r.id === activeJob.restaurantId)?.address}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 uppercase font-mono">Customer Dropoff Address:</span>
                            <p className="text-slate-200 font-bold">{activeJob.customerName}</p>
                            <p className="text-slate-450 italic">{activeJob.customerAddress}</p>
                          </div>
                        </div>

                        {/* Dropoff PIN entering form */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 max-w-sm ml-auto space-y-2 text-4xs">
                          <span className="text-slate-400 font-bold uppercase font-sans text-center block">Dropoff PIN validation gate:</span>
                          <input
                            type="text"
                            placeholder="Ask customer for verification PIN (e.g., 4 digits)"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            className="w-full text-center bg-slate-900 text-white border border-slate-800 font-mono tracking-widest text-sm rounded py-2 outline-none focus:border-emerald-500"
                          />
                          {otpError && (
                            <p className="text-red-400 text-center text-5xs leading-tight">{otpError}</p>
                          )}
                          <button
                            id="driver-complete-btn"
                            onClick={() => handleDeliveryComplete(activeJob.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded transition text-center"
                          >
                            Validate PIN & Release Delivery Fees
                          </button>
                        </div>

                        {/* Lifecycle progression for driver */}
                        <div className="pt-3 border-t border-slate-850 flex gap-2">
                          {activeJob.status === OrderStatus.RIDER_ASSIGNED && (
                            <button
                              onClick={() => {
                                setOrders(prev => prev.map(o => o.id === activeJob.id ? { ...o, status: OrderStatus.PICKED_UP } : o));
                                triggerNotification(`Rider logged in at pickup: status set to PICKED_UP.`);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-4xs px-4 py-2 rounded flex-1 text-center transition"
                            >
                              Confirm Food Container Received
                            </button>
                          )}
                          
                          {activeJob.status === OrderStatus.PICKED_UP && (
                            <button
                              onClick={() => {
                                setOrders(prev => prev.map(o => o.id === activeJob.id ? { ...o, status: OrderStatus.ON_THE_WAY } : o));
                                triggerNotification(`Rider left kitchen bounds: status updated to ON_THE_WAY.`);
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-4xs px-4 py-2 rounded flex-1 text-center transition"
                            >
                              Mark transit left: Out For delivery
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">Awaiting Pickup Orders nearby ({pendingAssign.length})</p>
                      
                      {pendingAssign.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No transit calls currently waiting. Select "Customer App", place a food order, and allow the restaurant to accept it and change status to Ready Packaging.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingAssign.map(po => (
                            <div key={po.id} className="border border-slate-200 p-4 rounded-xl space-y-3 bg-slate-25 text-4xs hover:border-slate-300">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-bold text-xs text-slate-900">{po.id}</h6>
                                  <span className="text-slate-400">{po.restaurantName}</span>
                                </div>
                                <span className="text-emerald-600 font-bold font-mono">₹{po.deliveryFee} Payout</span>
                              </div>
                              <p className="text-slate-500">Destination dropoff address: <b>{po.customerAddress}</b></p>
                              
                              <button
                                id={`assign-job-btn-${po.id}`}
                                onClick={() => {
                                  setOrders(prev => prev.map(o => o.id === po.id ? { 
                                    ...o, 
                                    status: OrderStatus.RIDER_ASSIGNED, 
                                    assignedRiderId: selectedRiderId,
                                    assignedRiderName: activeRiderObj.name
                                  } : o));
                                  triggerNotification(`Delivery route locked! Travel to kitchen to load boxes.`);
                                }}
                                className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-1.5 rounded transition text-center"
                              >
                                Accept Delivery assignment
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 4. PLATFORM AUDIT / ADMIN CONTROL ==================== */}
        {activeRole === UserRole.ADMIN && (
          <div className="space-y-6">
            
            {/* Savings Widget comparison Index */}
            <div className="bg-emerald-700 rounded-2xl p-6 text-white grid grid-cols-1 lg:grid-cols-4 gap-6 select-none shadow-md">
              <div className="lg:col-span-2 space-y-1 shrink-0">
                <span className="bg-white/20 text-white text-5xs font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Real-time Saved Commission Index (Live)
                </span>
                <h4 className="text-2xl font-bold tracking-tight mt-1.5">No Platform Taxes. 100% Direct Value.</h4>
                <p className="text-slate-100 text-4xs leading-relaxed mt-1">
                  Nibzo prevents aggregators from siphoning off restaurant revenue. This index aggregates total simulated savings achieved by merchants using our fixed subscription model instead of paying 25% commissions.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <span className="text-emerald-100 text-5xs font-mono">SIMULATED ORDER VOLUME</span>
                <div className="font-mono text-xl font-bold mt-1">₹{savingsSummary.restaurantVolume}</div>
                <p className="text-5xs text-emerald-150 mt-1 leading-snug">Gross subtotal transaction value processed through zero commission model</p>
              </div>

              <div className="bg-emerald-900/40 p-4 rounded-xl border border-white/15">
                <span className="text-emerald-100 text-5xs font-mono uppercase">Total Merchant Savings</span>
                <div className="font-mono text-xl font-bold mt-1 text-emerald-100">₹{savingsSummary.commissionSaved}</div>
                <p className="text-5xs text-emerald-150 mt-1 leading-snug">Money kept inside restaurant registers rather than being paid to centralized commissions.</p>
              </div>
            </div>

            {/* Quick base parameters control panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Global Platform Config Controls</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-4xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium font-sans">Base Delivery Compensation Rate (INR):</label>
                  <input
                    type="number"
                    value={baseDeliveryFee}
                    onChange={(e) => setBaseDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <p className="text-5xs text-slate-400">Flat minimum amount paid for routing job</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-medium font-sans">Distance Fee Rate Per Km (INR):</label>
                  <input
                    type="number"
                    value={feePerKm}
                    onChange={(e) => setFeePerKm(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <p className="text-5xs text-slate-400">Dynamic scaling rate applied beyond base boundaries</p>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <button
                    onClick={() => {
                      setRestaurants(prev => prev.map(r => r.id === 'rest_trial_dhaba' && r.trialDaysRemaining ? { ...r, trialDaysRemaining: r.trialDaysRemaining + 7 } : r));
                      triggerNotification('Extended trials by +7 Days for all active trial partners.');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg text-center transition"
                  >
                    Extend Trial Counts (+7 Days)
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated merchant accounts manager list */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <span className="text-slate-800 font-bold text-xs uppercase block border-b border-slate-100 pb-2">Merchant Registration Accounts Directory</span>

              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
                <table className="w-full text-left border-collapse text-4xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Restaurant Partner</th>
                      <th className="p-3">Geographic Bound</th>
                      <th className="p-3">Subscription Tier</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {restaurants.map(rest => (
                      <tr key={rest.id} className="hover:bg-slate-25 transition">
                        <td className="p-3 font-semibold text-slate-900">{rest.name}</td>
                        <td className="p-3">{rest.address}</td>
                        <td className="p-3 uppercase">
                          <span className={`px-2 py-0.5 rounded font-bold text-5xs ${
                            rest.subscriptionTier === SubscriptionTier.ADVANCED ? 'bg-amber-100 text-amber-800' :
                            rest.subscriptionTier === SubscriptionTier.PRO ? 'bg-blue-100 text-blue-800' :
                            rest.subscriptionTier === SubscriptionTier.TRIAL ? 'bg-purple-100 text-purple-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rest.subscriptionTier}
                          </span>
                        </td>
                        <td className="p-3 uppercase font-bold text-5xs tracking-wider">
                          <span className={rest.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}>
                            {rest.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {rest.status === 'active' ? (
                              <button
                                onClick={() => {
                                  setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, status: 'suspended' } : r));
                                  triggerNotification(`Merchant account suspended due to regulatory flag.`);
                                }}
                                className="bg-red-50 text-red-650 px-2 py-1 rounded hover:bg-red-100"
                              >
                                Suspend Partner
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, status: 'active' } : r));
                                  triggerNotification(`Merchant status re-activated.`);
                                }}
                                className="bg-emerald-50 text-emerald-650 px-2 py-1 rounded hover:bg-emerald-100"
                              >
                                Activate Partner
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
