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
  Plus, 
  Sparkles, 
  AlertCircle, 
  PhoneCall, 
  Send, 
  Lock, 
  Check,
  Percent,
  PlusCircle,
  Eye,
  Trash2,
  Bell,
  RefreshCw,
  Copy
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
import {
  isSupabaseConfigured,
  getSupabaseClient,
  SUPABASE_SQL_SETUP,
  dbFetchRestaurants,
  dbUpsertRestaurant,
  dbFetchMenuItems,
  dbUpsertMenuItem,
  dbDeleteMenuItem,
  dbFetchOrders,
  dbUpsertOrder,
  dbBulkSeed
} from '../lib/supabase';

export default function InteractiveSandbox() {
  // --- Persistent & In-memory Simulator States ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<DeliveryPartner[]>(INITIAL_RIDERS);
  const [promoCodes] = useState<PromoCode[]>(EX_PROMO_CODES);

  // --- Supabase State Indicators ---
  const [isDbConnected, setIsDbConnected] = useState(isSupabaseConfigured());
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showSqlDialog, setShowSqlDialog] = useState(false);
  const [justSeeded, setJustSeeded] = useState(false);

  // Auto fetch from Supabase if configured at startup
  useEffect(() => {
    async function loadSupabaseData() {
      if (isSupabaseConfigured()) {
        try {
          setDbLoading(true);
          setIsDbConnected(true);
          
          // Fetch restaurants
          const fetchedRests = await dbFetchRestaurants();
          if (fetchedRests.length > 0) {
            setRestaurants(fetchedRests);
          }
          
          // Fetch menu items
          const fetchedItems = await dbFetchMenuItems();
          if (fetchedItems.length > 0) {
            setMenuItems(fetchedItems);
          }
          
          // Fetch orders
          const fetchedOrders = await dbFetchOrders();
          if (fetchedOrders.length > 0) {
            setOrders(fetchedOrders);
          }
          
          setDbError(null);
        } catch (err: any) {
          if (err?.code !== 'PGRST205') console.error("Supabase load error:", err);
          setDbError("Schema Verification Pending (Using Local Storage)");
        } finally {
          setDbLoading(false);
        }
      } else {
        setIsDbConnected(false);
      }
    }
    loadSupabaseData();
  }, []);

  const insertOrderLocalAndDb = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);

    if (isSupabaseConfigured()) {
      setTimeout(async () => {
        try {
          await dbUpsertOrder(newOrder);
        } catch (e: any) {
          if (e?.code !== 'PGRST205') console.error('Failed to sync new order to Supabase:', e);
        }
      }, 0);
    }
  };

  // Update helper that bridges standard React states with background Supabase writes
  const updateOrderLocalAndDb = (orderId: string, updater: (o: Order) => Order) => {
    let updatedOrder: Order | null = null;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const u = updater(o);
        updatedOrder = u;
        return u;
      }
      return o;
    }));

    if (isSupabaseConfigured()) {
      setTimeout(async () => {
        if (updatedOrder) {
          try {
            await dbUpsertOrder(updatedOrder);
          } catch (e: any) { if (e?.code !== 'PGRST205') console.error('Failed to sync order update to Supabase:', e); }
        }
      }, 0);
    }
  };

  const updateRestaurantLocalAndDb = (restaurantId: string, updater: (r: Restaurant) => Restaurant) => {
    let updatedRest: Restaurant | null = null;
    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        const u = updater(r);
        updatedRest = u;
        return u;
      }
      return r;
    }));

    if (isSupabaseConfigured()) {
      setTimeout(async () => {
        if (updatedRest) {
          try {
            await dbUpsertRestaurant(updatedRest);
          } catch (e: any) { if (e?.code !== 'PGRST205') console.error('Failed to sync restaurant update to Supabase:', e); }
        }
      }, 0);
    }
  };


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
    // Include all non-cancelled orders to see volume and savings immediately as order flows through
    const completed = orders.filter(o => o.status !== OrderStatus.CANCELLED);
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

    insertOrderLocalAndDb(orderPayload);
    setTrackOrderId(orderPayload.id);
    setCustomerScreen('track');
    
    // Clear cart
    setCartItems([]);
    setSelectedCustomizations([]);
    setAppliedPromo(null);
    setPromoInput('');
    
    // Background Supabase Sync
    if (isSupabaseConfigured()) {
      dbUpsertOrder(orderPayload).catch(err => err?.code !== "PGRST205" && console.error("Failed to sync order map to Supabase:", err));
    }
    
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

    // Background Supabase Sync
    if (isSupabaseConfigured()) {
      dbUpsertMenuItem(newItem).catch(err => err?.code !== "PGRST205" && console.error("Failed to sync new dish to Supabase:", err));
    }

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
    
    // Update active restaurant to have TRIAL state with DB sync
    updateRestaurantLocalAndDb(selectedRestId, r => ({
      ...r,
      subscriptionTier: SubscriptionTier.TRIAL,
      trialDaysRemaining: 30,
      status: 'active'
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

    // Update order status to DELIVERED with DB sync
    updateOrderLocalAndDb(orderId, o => ({
      ...o,
      status: OrderStatus.DELIVERED,
      paymentStatus: 'success',
      timeLine: [...o.timeLine, { status: OrderStatus.DELIVERED, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden font-sans">
      
      {/* Toast Alert Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-gray-900 text-white font-medium text-sm px-5 py-4 rounded-xl border border-gray-800 shadow-2xl max-w-sm">
          <Sparkles className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="leading-snug">{notification}</p>
        </div>
      )}

      {/* Role Navigation Dashboard header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-6 py-4 gap-4">
          <div>
            <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <span className="bg-emerald-600 text-white font-extrabold tracking-widest text-xs px-2.5 py-1 rounded">NIBZO</span>
              Live Product Lifecycle Simulator
            </h4>
            <p className="text-sm text-gray-500 mt-1">Conduct real-time transactions and map commission savings across 4 user terminals</p>
          </div>

          {/* Interactive Role Switch buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FCFCFD] p-1.5 rounded-xl border border-gray-200">
            <button
              id="role-btn-customer"
              onClick={() => setActiveRole(UserRole.CUSTOMER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition ${
                activeRole === UserRole.CUSTOMER 
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <User className="h-4 w-4" /> Customer
            </button>
            <button
              id="role-btn-restaurant"
              onClick={() => setActiveRole(UserRole.RESTAURANT_OWNER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition ${
                activeRole === UserRole.RESTAURANT_OWNER 
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Store className="h-4 w-4" /> Merchant
            </button>
            <button
              id="role-btn-delivery"
              onClick={() => setActiveRole(UserRole.DELIVERY_PARTNER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition ${
                activeRole === UserRole.DELIVERY_PARTNER 
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bike className="h-4 w-4" /> Driver
            </button>
            <button
              id="role-btn-admin"
              onClick={() => setActiveRole(UserRole.ADMIN)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition ${
                activeRole === UserRole.ADMIN 
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4" /> Admin
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Connection Center Banner */}
      <div className="bg-[#FCFCFD] border-b border-gray-200 text-gray-800 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className={`w-3 h-3 rounded-md shrink-0 ${
            isDbConnected 
              ? (dbError ? 'bg-orange-400' : 'bg-emerald-500') 
              : 'bg-gray-400'
          }`} />
          <div>
            <span className="font-semibold block md:inline text-gray-700">
              Database Strategy:{' '}
              <span className={`font-mono font-bold ${isDbConnected ? (dbError ? 'text-gray-500' : 'text-emerald-600') : 'text-gray-500'}`}>
                {isDbConnected 
                  ? (dbError ? 'LOCAL_MEMORY_MOCK' : 'SUPABASE_CONNECTED') 
                  : 'OFFLINE_MODE'}
              </span>
            </span>
            {dbError ? (
              <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md ml-2 inline-block truncate max-w-sm shadow-sm">
                ℹ️ {dbError}
              </span>
            ) : (
              <span className="text-xs text-gray-500 ml-2">
                {!isDbConnected 
                  ? "Local storage mode." 
                  : "Database sync active."}
              </span>
            )}
          </div>
          {dbLoading && <span className="text-emerald-500 animate-spin text-xs ml-1">⌛</span>}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {isDbConnected && (
            <>
              {restaurants.length <= 1 && !justSeeded && (
                <button
                  onClick={async () => {
                    try {
                      setDbLoading(true);
                      await dbBulkSeed(INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS);
                      setJustSeeded(true);
                      setDbError(null);
                      triggerNotification("Fully seeded dishes & restaurants into your database.");
                      const r = await dbFetchRestaurants();
                      setRestaurants(r);
                      const m = await dbFetchMenuItems();
                      setMenuItems(m);
                    } catch (err: any) {
                      setDbError("Seeding failed: " + err.message);
                    } finally {
                      setDbLoading(false);
                    }
                  }}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  🌱 Seed Default Data
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    setDbLoading(true);
                    setDbError(null);
                    const fetchedRests = await dbFetchRestaurants();
                    if (fetchedRests.length > 0) setRestaurants(fetchedRests);
                    
                    const fetchedItems = await dbFetchMenuItems();
                    if (fetchedItems.length > 0) setMenuItems(fetchedItems);
                    
                    const fetchedOrders = await dbFetchOrders();
                    if (fetchedOrders.length > 0) setOrders(fetchedOrders);
                    
                    triggerNotification("Refreshed layout with active rows synchronized from database.");
                  } catch (err: any) {
                    setDbError("Sync failed: " + err.message);
                  } finally {
                    setDbLoading(false);
                  }
                }}
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className="h-3 w-3" /> Pull Updates
              </button>
            </>
          )}

          <button
            onClick={() => setShowSqlDialog(true)}
            className="bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer shadow-sm"
          >
            📋 Setup Script
          </button>
        </div>
      </div>

      {/* Supabase SQL Setup Modal */}
      {showSqlDialog && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-gray-200 text-gray-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:max-h-[85vh]">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#FCFCFD]">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-600 text-xs px-2 py-0.5 rounded font-bold uppercase text-white">Setup</span>
                  PostgreSQL Schema Configuration
                </h3>
                <p className="text-xs text-gray-500 mt-1">Execute this script inside the Supabase SQL editor</p>
              </div>
              <button
                onClick={() => setShowSqlDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-2">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">1. Credentials Check</span>
                <p className="text-sm text-gray-700 leading-relaxed font-sans">
                  Setup your <b className="text-blue-600">VITE_SUPABASE_URL</b> and <b className="text-blue-600">VITE_SUPABASE_ANON_KEY</b> in the AI Studio platform Settings.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">2. Database Schema</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
                      triggerNotification('Schema copied successfully to clipboard! Go paste it in Supabase SQL editor.');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 text-xs font-bold py-1.5 px-3 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Script
                  </button>
                </div>
                <pre className="p-4 bg-[#FCFCFD] rounded-lg text-xs font-mono text-gray-800 overflow-x-auto max-h-60 border border-gray-200 leading-relaxed shadow-inner">
                  {SUPABASE_SQL_SETUP}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-[#FCFCFD] flex justify-end">
              <button
                onClick={() => setShowSqlDialog(false)}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2 px-6 rounded-xl transition cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Workspace Body */}
      <div className="p-6 bg-gray-100 min-h-[580px]">
         {/* ==================== 1. CUSTOMER PORTAL ==================== */}
        {activeRole === UserRole.CUSTOMER && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Polished Mobile Device Mockup Frame (8 columns) */}
            <div className="lg:col-span-8 flex justify-center">
              <div id="nibzo-phone-frame" className="w-full max-w-[395px] h-[800px] max-h-[85vh] sm:max-h-none bg-white text-gray-800 rounded-[44px] border-[14px] border-gray-900 shadow-2xl relative flex flex-col overflow-hidden">
                
                {/* Phone Notch/Speaker Header */}
                <div className="bg-gray-900 h-7 w-full relative flex items-center justify-between px-6 text-white text-xs shrink-0 z-50">
                  <span className="font-semibold tracking-wide">11:32 AM</span>
                  <div className="w-24 h-5 bg-gray-900 rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold tracking-wide">5G</span>
                  </div>
                </div>

                {/* Mobile App Bar */}
                <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shadow-sm shrink-0 z-40">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <MapPin className="text-orange-600 h-5 w-5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900">{selectedAddressIndex === 0 ? 'Home' : 'Office'}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[140px] leading-tight">
                        {sampleAddresses[selectedAddressIndex].address}
                      </span>
                    </div>
                  </div>
                  
                  {/* Current Active Step Pill */}
                  <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2.5 py-1 rounded-full border border-orange-100 tracking-wider uppercase">
                    {customerScreen}
                  </span>
                </header>

                {/* Simulated Screen Canvas Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 pb-24 relative select-none">
                  
                  {/* STEP A: DISCOVER HOME SCREEN */}
                  {customerScreen === 'discover' && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Search Bar Utilities */}
                      <div className="relative w-full shadow-sm bg-[#FCFCFD] rounded-lg">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input
                          type="text"
                          placeholder="Search restaurants, dishes..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full text-sm text-gray-900 placeholder-gray-500 pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                        />
                      </div>

                      {/* Hero Brand Promotional Banner */}
                      <div className="bg-orange-600 rounded-xl p-5 text-white relative overflow-hidden shadow-md">
                        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-orange-400/30 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 max-w-[200px]">
                          <span className="bg-white/20 text-white text-[10px] font-bold font-mono px-2 py-1 rounded-full uppercase tracking-wider">
                            Local Zero-Commission
                          </span>
                          <h4 className="text-base font-bold mt-2 leading-snug">Zero Commission.<br/>100% Flavor.</h4>
                          <button onClick={() => {
                            const gourmet = restaurants.find(r => r.id === 'rest_gourmet_kitchen') || restaurants[0];
                            setSelectedRestaurant(gourmet);
                            setCustomerScreen('menu');
                          }} className="bg-white text-orange-600 font-bold text-xs px-4 py-1.5 rounded-lg mt-3 hover:bg-orange-50 transition shadow-sm">
                            Explore Menu
                          </button>
                        </div>
                      </div>

                      {/* Food Categories Horizontal list */}
                      <div>
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-3">Categories</span>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                          {[
                            { name: 'Biryani', icon: 'rice_bowl' },
                            { name: 'Pizza', icon: 'local_pizza' },
                            { name: 'North Indian', icon: 'ramen_dining' },
                            { name: 'Healthy', icon: 'eco' },
                            { name: 'Desserts', icon: 'cake' },
                            { name: 'Drinks', icon: 'local_cafe' }
                          ].map((cat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 duration-100" onClick={() => setCustomerSearch(cat.name)}>
                              <div className={`w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm`}>
                                <span className={`material-symbols-outlined text-xl text-orange-600`} style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                              </div>
                              <span className="text-[10px] font-medium text-gray-600">{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Popular near you section carousel */}
                      <div>
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-3">Popular Near You</span>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
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
                                className="min-w-[160px] max-w-[160px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition flex flex-col justify-between"
                              >
                                <div className="h-24 w-full relative">
                                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
                                    <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-[9px] font-bold text-gray-700">{dish.isVeg ? 'Veg' : 'Non-veg'}</span>
                                  </div>
                                </div>
                                <div className="p-3 space-y-1.5">
                                  <h4 className="text-sm font-bold text-gray-900 truncate">{dish.name}</h4>
                                  <p className="text-[10px] text-gray-500 truncate">{rObj.name}</p>
                                  <div className="flex justify-between items-center pt-1">
                                    <span className="font-extrabold text-gray-900">₹{dish.priceINR}</span>
                                    <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                                      {rObj.rating} ★
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nearby Partner Restaurants Grid */}
                      <div className="space-y-3 pb-8">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">Nearby Restaurants</span>
                        <div className="space-y-4">
                          {restaurants
                            .filter(r => r.name.toLowerCase().includes(customerSearch.toLowerCase()) || r.cuisine.some(c => c.toLowerCase().includes(customerSearch.toLowerCase())))
                            .map(rest => (
                              <div 
                                key={rest.id}
                                onClick={() => {
                                  setSelectedRestaurant(rest);
                                  setCustomerScreen('menu');
                                }}
                                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
                              >
                                <div className="relative aspect-video w-full h-32 bg-gray-100">
                                  <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm border border-green-100">
                                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    Zero Commission Partner
                                  </div>
                                </div>
                                <div className="p-4 space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-base text-gray-900 truncate pr-2">{rest.name}</h4>
                                    <span className="bg-orange-50 text-orange-600 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center shrink-0">
                                      {rest.rating} ★
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{rest.tagline}</p>
                                  <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rest.deliveryTimeMins} min</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {rest.distanceKm} km</span>
                                    <span className="text-green-600 font-medium ml-auto">No surge fee</span>
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
                        className="text-[11px] font-bold text-orange-600 flex items-center gap-1 hover:underline bg-orange-50 px-2.5 py-1.5 rounded-md transition"
                      >
                        ← Back to Discovery
                      </button>

                      {/* Header block cover */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-28 w-full bg-gray-100">
                          <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h1 className="font-bold text-base text-gray-900 leading-tight">{selectedRestaurant.name}</h1>
                              <p className="text-xs text-gray-500 mt-1">{selectedRestaurant.tagline}</p>
                            </div>
                            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                              {selectedRestaurant.rating} ★
                            </span>
                          </div>
                          
                          <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded border border-green-200/60 mt-1">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Zero Commission Partner
                          </div>
                        </div>
                      </div>

                      {/* Switch Filters Strip */}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button 
                          onClick={() => setVegOnly(!vegOnly)}
                          className={`flex items-center gap-1.5 bg-white text-[10px] font-bold px-3.5 py-2 rounded-lg border transition shrink-0 shadow-sm ${
                            vegOnly ? 'bg-green-50 text-green-700 border-green-500' : 'text-gray-700 border-gray-200 hover:bg-[#FCFCFD]'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          Veg Only
                        </button>
                        <button className="bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-3.5 py-2 rounded-lg shrink-0 shadow-sm">Best Sellers</button>
                        <button className="bg-white text-gray-700 border border-gray-200 hover:bg-[#FCFCFD] text-[10px] font-medium px-3.5 py-2 rounded-lg shrink-0 shadow-sm">Main Course</button>
                      </div>

                      {/* Items list */}
                      <div className="space-y-4">
                        {menuItems
                          .filter(m => m.restaurantId === selectedRestaurant.id)
                          .filter(m => !vegOnly || m.isVeg)
                          .map(item => {
                            const currentQty = cartItems.find(c => c.item.id === item.id)?.quantity || 0;
                            return (
                              <div key={item.id} className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm flex gap-3 items-stretch relative">
                                <div className="flex-1 flex flex-col justify-between pr-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-block w-3.5 h-3.5 border p-0.5 leading-none shrink-0 rounded-[3px] ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                        <span className={`inline-block w-full h-full rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      </span>
                                      {item.isPopular && <span className="bg-orange-50 text-orange-700 text-[9px] font-bold px-1.5 py-0.5 rounded text-xs">Bestseller</span>}
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900 mt-1.5 leading-tight">{item.name}</h3>
                                    <p className="font-bold text-sm text-gray-900 mt-1">₹{item.priceINR}</p>
                                    <p className="text-xs text-gray-500 leading-snug line-clamp-2 mt-1.5">{item.description}</p>
                                  </div>
                                </div>
                                <div className="w-24 h-24 relative shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
                                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-md rounded-lg flex items-center justify-between w-20 h-8 overflow-hidden">
                                    {currentQty > 0 ? (
                                      <>
                                        <button 
                                          onClick={() => {
                                            setCartItems(prev => prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
                                          }}
                                          className="w-7 text-orange-600 font-black text-sm hover:bg-orange-50 transition"
                                        >
                                          −
                                        </button>
                                        <span className="text-xs font-bold text-gray-900 w-6 text-center">{currentQty}</span>
                                        <button 
                                          onClick={() => {
                                            setCartItems(prev => prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                          }}
                                          className="w-7 text-orange-600 font-black text-sm hover:bg-orange-50 transition"
                                        >
                                          +
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          setCartItems([...cartItems, { item, quantity: 1 }]);
                                          triggerNotification(`"${item.name}" added to your basket.`);
                                        }}
                                        className="w-full h-full text-orange-600 hover:bg-orange-50 transition font-bold text-xs tracking-wide"
                                      >
                                        ADD
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
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3 animate-fade-in shadow-sm">
                          <h4 className="font-bold text-xs text-orange-700 uppercase tracking-wide flex items-center justify-between">
                            Customize Risotto <span>Extra Add-ons</span>
                          </h4>
                          <div className="space-y-2">
                            {[
                              { name: 'Parmesan Dusting', price: 45 },
                              { name: 'Burrata Top', price: 120 }
                            ].map((opt) => {
                              const isChecked = selectedCustomizations.includes(opt.name);
                              return (
                                <label key={opt.name} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-orange-100 cursor-pointer hover:border-orange-300 transition text-xs shadow-sm">
                                  <div className="flex items-center gap-2.5">
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
                                      className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                                    />
                                    <span className="font-semibold text-gray-800">{opt.name}</span>
                                  </div>
                                  <span className="font-bold text-orange-600">+₹{opt.price}</span>
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
                        className="text-[11px] font-bold text-orange-600 flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-md hover:underline transition"
                      >
                        ← Back to Menu
                      </button>

                      {/* Delivery Address panel */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <span className="font-bold text-sm text-gray-900">Delivery Address</span>
                          <button onClick={() => setSelectedAddressIndex(prev => prev === 0 ? 1 : 0)} className="text-orange-600 font-bold text-xs uppercase tracking-wide">Change</button>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-orange-600 bg-orange-50 p-1.5 rounded" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{selectedAddressIndex === 0 ? 'Home' : 'Office'}</p>
                            <p className="text-gray-500 leading-snug mt-0.5 text-xs">{sampleAddresses[selectedAddressIndex].address}</p>
                            <p className="text-green-700 font-semibold mt-1.5 text-xs">Delivery Time: 30 - 45 mins</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <span className="font-bold text-sm text-gray-900 block border-b border-gray-100 pb-2">Your Order</span>
                        
                        {cartItems.length === 0 ? (
                          <p className="text-gray-500 italic text-center py-4 text-xs bg-[#FCFCFD] rounded-lg">No items selected. Go back to add delicacies!</p>
                        ) : (
                          <div className="space-y-4">
                            {cartItems.map((cart, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-4 h-4 border border-green-600 flex items-center justify-center rounded-[3px] shrink-0">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{cart.item.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">₹{cart.item.priceINR} each</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                                  <button onClick={() => {
                                    setCartItems(prev => prev.map(c => c.item.id === cart.item.id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
                                  }} className="text-orange-600 font-black text-xs hover:bg-orange-100 w-4 h-4 flex items-center justify-center rounded">−</button>
                                  <span className="font-bold text-gray-900 text-xs">{cart.quantity}</span>
                                  <button onClick={() => {
                                    setCartItems(prev => prev.map(c => c.item.id === cart.item.id ? { ...c, quantity: c.quantity + 1 } : c));
                                  }} className="text-orange-600 font-black text-xs hover:bg-orange-100 w-4 h-4 flex items-center justify-center rounded">+</button>
                                </div>
                                <span className="font-bold font-mono text-sm text-gray-900">₹{cart.item.priceINR * cart.quantity}</span>
                              </div>
                            ))}

                            {/* Customization Extra additions line */}
                            {selectedCustomizations.length > 0 && (
                              <div className="bg-orange-50/50 p-2.5 rounded-lg text-[10px] text-orange-700 space-y-1 border border-orange-100">
                                <p className="font-bold uppercase tracking-wider text-[9px]">Included Add-ons:</p>
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
                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2 bg-[#FCFCFD] p-2.5 rounded-lg border border-gray-200 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-300 transition-shadow">
                                <span className="material-symbols-outlined text-gray-400 text-sm">notes</span>
                                <input 
                                  type="text" 
                                  placeholder="Add cooking / dropoff instructions..." 
                                  value={cookingInstructions}
                                  onChange={(e) => setCookingInstructions(e.target.value)}
                                  className="w-full bg-transparent border-none text-xs p-0 focus:ring-0 outline-none placeholder-gray-400 text-gray-700"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bill details */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <span className="font-bold text-sm text-gray-900 block mb-3 border-b border-gray-100 pb-2">Bill Details</span>
                        <div className="space-y-2 text-gray-600 text-xs">
                          <div className="flex justify-between">
                            <span>Item Total</span>
                            <span className="text-gray-900 font-medium">₹{cartSubtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className="text-gray-900 font-medium">₹{cartDeliveryFee}</span>
                          </div>
                          <p className="text-[10px] text-green-700 leading-none italic pl-2 border-l-2 border-green-200">- Transferred directly to driver (100%)</p>
                          <div className="flex justify-between items-center pt-1">
                            <span>Platform Fee</span>
                            <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">₹0 <span className="line-through text-gray-400 font-normal ml-1">₹15</span></span>
                          </div>
                          <p className="text-[9px] bg-green-50 border border-green-200 text-green-700 font-bold px-2 py-1 rounded w-fit uppercase tracking-wider">Zero Commission Guarantee</p>
                        </div>
                        <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold text-sm text-gray-900">
                          <span>Grand Total</span>
                          <span className="text-orange-600 font-mono text-base tracking-tight">₹{cartTotal}</span>
                        </div>
                      </div>

                      {/* Payment Method checkboxes */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <span className="font-bold text-sm text-gray-900 block border-b border-gray-100 pb-2">Payment Method</span>
                        <div className="space-y-2">
                          {[
                            { id: 'UPI', label: 'UPI payments (PhonePe/GPay)', icon: 'account_balance_wallet' },
                            { id: 'CARD', label: 'Credit Card (•••• 4242)', icon: 'credit_card' },
                            { id: 'COD', label: 'Cash on Delivery', icon: 'payments' }
                          ].map(pay => (
                            <label key={pay.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-[#FCFCFD] transition">
                              <input 
                                type="radio" 
                                name="pay-method" 
                                checked={paymentMethod === pay.id}
                                onChange={() => setPaymentMethod(pay.id as any)}
                                className="text-orange-600 focus:ring-orange-600 w-4 h-4 cursor-pointer" 
                              />
                              <span className="material-symbols-outlined text-gray-400 text-[18px]">{pay.icon}</span>
                              <span className="font-semibold text-gray-800 text-xs flex-grow">{pay.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Place Order checkout CTA */}
                      <button
                        onClick={handlePlaceOrder}
                        disabled={cartItems.length === 0}
                        className="w-full bg-orange-600 text-white font-bold text-sm py-4 rounded-xl shadow-md hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
                      >
                        Place Order • ₹{cartTotal}
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  )}

                  {/* STEP D: LIVE TRACKING SCREEN */}
                  {customerScreen === 'track' && (
                    <div className="space-y-5 animate-fade-in text-xs">
                      
                      {/* Active MOCK order info lookup */}
                      {(() => {
                        const activeOrder = orders[0] || { id: 'ORD_X', deliveryToken: '8429', status: OrderStatus.PLACED };
                        return (
                          <>
                            {/* Live Interactive Map SVG Segment */}
                            <div className="relative w-full h-48 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-inner shrink-0 leading-none">
                              <svg className="absolute inset-0 w-full h-full text-gray-800" xmlns="http://www.w3.org/2000/svg">
                                <pattern id="mock-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#mock-grid)" />
                                {/* Route streets lines */}
                                <path d="M -20,40 L 400,110" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                                <path d="M 100,-20 L 120,240" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="none" />
                                <path d="M 40,110 Q 180,60 320,150" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
                                <path d="M 0,180 L 400,180" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="none" />
                                {/* Dash route line */}
                                <path d="M 60,50 L 130,70 Q 180,95 240,130" stroke="#f97316" strokeWidth="3" strokeDasharray="6,4" fill="none" className="animate-pulse" />
                              </svg>

                              {/* Restaurant location pin */}
                              <div className="absolute top-[40px] left-[55px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="bg-emerald-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white/20">
                                  <span className="material-symbols-outlined text-xs">storefront</span>
                                </div>
                                <span className="text-[9px] font-bold text-white bg-gray-900/90 backdrop-blur-sm border border-gray-700 px-2 py-0.5 rounded shadow-sm mt-1">Kitchen</span>
                              </div>

                              {/* Home pin */}
                              <div className="absolute top-[130px] left-[235px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="bg-orange-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white/20">
                                  <span className="material-symbols-outlined text-xs">home</span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-900 bg-white shadow-md border border-gray-200 px-2 py-0.5 rounded mt-1">Your Home</span>
                              </div>

                              {/* Courier Bike position */}
                              <div className="absolute top-[90px] left-[155px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-sm">two_wheeler</span>
                                </div>
                                <span className="text-[10px] font-bold text-white bg-gray-900 border border-gray-700 px-2 py-1 rounded-md mt-1 whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                                  Alex M. <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                                </span>
                              </div>
                            </div>

                            {/* Lives order tracker status badge */}
                            <div className="text-center py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                              <h2 className="text-2xl font-bold text-gray-900 leading-none mb-1">12 min</h2>
                              <p className="text-xs text-gray-500 font-medium">Estimated arrival time</p>
                            </div>

                            {/* DELIVERY SECURITY OTP PANEL */}
                            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl p-4 flex items-center justify-between shadow-md">
                              <div>
                                <span className="text-[9px] text-orange-100 font-bold uppercase tracking-wider block font-mono">DELIVERY CONFIRMATION OTP</span>
                                <span className="font-mono text-2xl font-bold tracking-widest block text-white mt-1 shadow-sm">{activeOrder.deliveryToken}</span>
                                <p className="text-[10px] text-orange-50 leading-tight mt-1.5 max-w-[200px]">Provide this code to Alex M. at dropoff to unlock payout transfer</p>
                              </div>
                              <div className="bg-white/20 p-3 rounded-full text-white backdrop-blur-sm self-start">
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                              </div>
                            </div>

                            {/* Driver detail profile card */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                              <img className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-gray-100" src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=150" alt="Rider Alex M" />
                              <div className="flex-grow">
                                <h4 className="font-bold text-sm text-gray-900 mb-0.5">Alex M.</h4>
                                <div className="text-[11px] text-gray-600 flex items-center gap-1 font-medium bg-[#FCFCFD] px-1.5 py-0.5 rounded w-fit mb-1 border border-gray-100">
                                  <span className="material-symbols-outlined text-[12px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                  4.9 (120+ trips)
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono tracking-wide">KA-03-HL-9201</span>
                              </div>
                              <button onClick={() => triggerNotification('Dialing Rider Alex M... "+91 98451 00312"')} className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 border border-orange-100 transition active:scale-95 shrink-0 shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">call</span>
                              </button>
                            </div>

                            {/* Custom Step-by-Step progress timeline */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block border-b border-gray-100 pb-2">Live Delivery Progress</span>
                              <div className="space-y-3 relative pt-1 pb-1">
                                <div className="absolute left-1.5 top-2 bottom-3 w-0.5 bg-gray-100 z-0"></div>
                                {[
                                  { key: OrderStatus.PLACED, label: 'Order Registered with Restaurant' },
                                  { key: OrderStatus.ACCEPTED, label: 'Approved by Kitchen' },
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
                                    <div key={idx} className="flex items-center gap-3.5 relative z-10">
                                      <span className={`h-3.5 w-3.5 rounded-full shrink-0 border-2 ${
                                        isCurrent ? 'bg-orange-500 border-orange-200 shadow-[0_0_0_4px_rgba(249,115,22,0.2)] animate-pulse' : 
                                        isDone ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                                      }`} />
                                      <span className={`text-[11px] ${
                                        isCurrent ? 'text-orange-600 font-bold' : isDone ? 'text-gray-900 font-semibold' : 'text-gray-400 font-medium'
                                      }`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Empty search results fallback */}
                  {customerScreen === 'discover' && customerSearch && restaurants.filter(r => r.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">sentiment_dissatisfied</span>
                      <p className="text-sm text-gray-900 font-bold mt-2">No matching eateries found</p>
                      <button onClick={() => setCustomerSearch('')} className="text-orange-600 text-xs font-bold hover:underline mt-2 inline-block px-3 py-1.5 bg-orange-50 rounded-lg">Clear search parameters</button>
                    </div>
                  )}
                </div>

                {/* Persistent Navigation app bar mockup (Phone Navigation Bottom style) */}
                <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 h-16 shrink-0 flex justify-around items-center px-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] rounded-b-[38px]">
                  <button 
                    onClick={() => { setSelectedRestaurant(null); setCustomerScreen('discover'); }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${customerScreen === 'discover' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50'}`}
                  >
                    <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: customerScreen === 'discover' ? "'FILL' 1" : undefined }}>home</span>
                    <span className="text-[10px] font-bold">Home</span>
                  </button>
                  <button 
                    onClick={() => {
                      const gourmet = restaurants.find(r => r.id === 'rest_gourmet_kitchen') || restaurants[0];
                      setSelectedRestaurant(gourmet);
                      setCustomerScreen('menu');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${customerScreen === 'menu' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50'}`}
                  >
                    <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: customerScreen === 'menu' ? "'FILL' 1" : undefined }}>restaurant_menu</span>
                    <span className="text-[10px] font-bold">Menu</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (cartItems.length > 0) {
                        setCustomerScreen('checkout');
                      } else {
                        triggerNotification('Add local delicacies first to view the checkout bill summary.');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${customerScreen === 'checkout' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50'}`}
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: customerScreen === 'checkout' ? "'FILL' 1" : undefined }}>shopping_bag</span>
                      {cartItems.length > 0 && <span className="absolute -top-1 -right-1.5 bg-orange-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">{cartItems.length}</span>}
                    </div>
                    <span className="text-[10px] font-bold">Cart</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (orders.length > 0) {
                        setCustomerScreen('track');
                      } else {
                        triggerNotification('Place a live order to track real-time delivery status.');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition w-16 ${customerScreen === 'track' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50'}`}
                  >
                    <span className="material-symbols-outlined text-[24px] mb-0.5" style={{ fontVariationSettings: customerScreen === 'track' ? "'FILL' 1" : undefined }}>two_wheeler</span>
                    <span className="text-[10px] font-bold">Track</span>
                  </button>
                </nav>

                {/* Floating "View Cart" sticky banner on restaurant menu view */}
                {customerScreen === 'menu' && cartItems.length > 0 && (
                  <div className="absolute bottom-20 left-0 right-0 p-4 bg-transparent z-40 animate-slide-up">
                    <button 
                      onClick={() => setCustomerScreen('checkout')}
                      className="w-full bg-orange-600 text-white py-3.5 px-5 rounded-xl flex items-center justify-between shadow-xl shadow-orange-600/20 text-xs font-bold hover:bg-orange-700 transition"
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm">{cartItems.reduce((acc, c) => acc + c.quantity, 0)} Items | ₹{cartSubtotal}</span>
                        <span className="opacity-90 font-medium text-[10px] mt-0.5">Extra cheese customizer applied</span>
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-wide">
                        View Cart <span className="material-symbols-outlined text-lg">shopping_bag</span>
                      </div>
                    </button>
                  </div>

                )}

              </div>
            </div>

            {/* Right Column: Live Testing Operations Control Console (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Interactive Preset Simulator Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500 inline-block animate-ping"></span>
                  Sandbox Quick Debugger
                </span>
                
                <p className="text-gray-500 text-xs leading-relaxed">
                  Use these testing presets to instantly mock customer actions and restaurant delivery events, saving you from manual clicking work.
                </p>

                <div className="flex flex-col gap-3 pt-2">
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
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold py-3 px-4 rounded-xl border border-orange-200 text-left flex justify-between items-center transition"
                  >
                    <span>🍔 Presell Risotto + Addons</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase tracking-wider">Add to Cart</span>
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
                      
                      if (isSupabaseConfigured()) {
                        dbUpsertOrder(mockOrder).catch(err => err?.code !== "PGRST205" && console.error("Failed to sync mock order to Supabase:", err));
                      }

                      triggerNotification('Order placed and Alex M. assigned as courier! Dropoff PIN is 8429.');
                    }}
                    className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold py-3 px-4 rounded-xl border border-green-200 text-left flex justify-between items-center transition"
                  >
                    <span>🛵 Mock Active Delivery (OTP: 8429)</span>
                    <span className="text-[10px] font-mono opacity-80 uppercase tracking-wider">Force Tracking</span>
                  </button>
                </div>
              </div>

              {/* Live Status transition stream */}
              {orders.length > 0 && (
                <div className="bg-white rounded-xl text-gray-900 border border-gray-200 p-6 space-y-4 shadow-sm">
                  <span className="text-orange-600 font-mono text-[10px] font-bold uppercase tracking-wider block">Live Delivery Event Controller</span>
                  <p className="text-gray-500 text-xs">Fast-forward active orders through status events on the platform.</p>
                  
                  {orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.REJECTED).map(o => (
                    <div key={o.id} className="p-4 bg-[#FCFCFD] rounded-xl border border-gray-200 space-y-3 text-xs">
                      <div className="flex justify-between font-bold text-gray-900 border-b border-gray-200 pb-2">
                        <span>{o.id} (Current: {o.status})</span>
                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded shadow-sm border border-orange-100">PIN: {o.deliveryToken}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
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
                              updateOrderLocalAndDb(o.id, ord => ({
                                ...ord,
                                status: evt.next,
                                assignedRiderId: evt.next === OrderStatus.RIDER_ASSIGNED ? 'rider_alex' : ord.assignedRiderId,
                                timeLine: [...ord.timeLine, { status: evt.next, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
                              }));
                              triggerNotification(`Simulated status updated for ${o.id}: ${evt.next}`);
                            }}
                            className="bg-white hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 px-3 py-1.5 rounded-lg transition disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 shadow-sm"
                          >
                            {evt.label}
                          </button>
                        ))}
                      </div>

                      {/* Dropoff complete verification trigger */}
                      <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                        <span className="text-gray-600 font-medium">Rider Alex needs PIN ({o.deliveryToken}):</span>
                        <button
                          onClick={() => {
                            setEnteredOtp(o.deliveryToken);
                            // Complete delivery with DB logic
                            updateOrderLocalAndDb(o.id, ord => ({
                              ...ord,
                              status: OrderStatus.DELIVERED,
                              paymentStatus: 'success',
                              timeLine: [...ord.timeLine, { status: OrderStatus.DELIVERED, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]
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
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition text-center shrink-0 shadow-sm flex items-center gap-1"
                        >
                          Complete Dropoff <span className="material-symbols-outlined text-[16px]">check_circle</span>
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Active Restaurant Context</span>
                
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block tracking-wider">Select Simulated Restaurant:</span>
                  <select 
                    id="merchant-rest-select"
                    value={selectedRestId}
                    onChange={(e) => setSelectedRestId(e.target.value)}
                    className="w-full text-xs bg-[#FCFCFD] border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.subscriptionTier})</option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#FCFCFD] p-4 rounded-xl border border-gray-200 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subscription Level:</span>
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {currentRestaurantObj.subscriptionTier}
                    </span>
                  </div>
                  
                  {currentRestaurantObj.subscriptionTier === SubscriptionTier.TRIAL ? (
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trial Days Remaining:</span>
                        <span className="text-orange-600 font-bold">{currentRestaurantObj.trialDaysRemaining} Days</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${(currentRestaurantObj.trialDaysRemaining || 30) / 30 * 100}%` }}></div>
                      </div>
                      <p className="text-gray-500 leading-normal italic">Trial is active under Pro Plan capabilities. Expiring will mark restaurant as inactive until subscription is activated.</p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500 font-medium">
                      Plan Status: <span className="text-green-600 font-bold uppercase tracking-wider">Paid / Active 30-Day Billing Cycle</span>
                    </div>
                  )}

                  {/* Manual trigger buttons */}
                  <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        updateRestaurantLocalAndDb(selectedRestId, r => ({ ...r, subscriptionTier: SubscriptionTier.ADVANCED, status: 'active', trialDaysRemaining: undefined }));
                        triggerNotification('Upgraded subscription context to ADVANCED PLAN! Cap elevated to unlimited menu dishes.');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg text-center transition shadow-sm uppercase tracking-wider"
                    >
                      Activate Paid Advanced Plan (₹699)
                    </button>
                    <button
                      onClick={() => {
                        updateRestaurantLocalAndDb(selectedRestId, r => ({ ...r, subscriptionTier: SubscriptionTier.BASIC, status: 'active', trialDaysRemaining: undefined }));
                        triggerNotification('Downgraded plan to Basic. Capacity capped to 50 items.');
                      }}
                      className="bg-white hover:bg-[#FCFCFD] text-gray-700 border border-gray-200 text-[10px] font-bold py-2 px-3 rounded-lg text-center transition shadow-sm uppercase tracking-wider"
                    >
                      Downgrade to Basic (₹199/m)
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Free 30-Day trial Simulation Form */}
              {currentRestaurantObj.subscriptionTier !== SubscriptionTier.TRIAL && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                  <div className="border-b border-gray-100 pb-3">
                    <span className="text-gray-900 font-bold text-sm uppercase block">Secure 30-Day Trial Signup</span>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium leading-none">OTP and email checks protect platform from duplication issues</p>
                  </div>

                  {!otpVerified ? (
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-gray-700 font-medium">Owner Mobile Number:</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={trialPhone}
                          onChange={(e) => setTrialPhone(e.target.value)}
                          className="w-full bg-[#FCFCFD] border border-gray-200 rounded-lg p-2 text-gray-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-gray-700 font-medium">Merchant Business Email:</label>
                        <input
                          type="email"
                          placeholder="owner@dhaba.com"
                          value={trialEmail}
                          onChange={(e) => setTrialEmail(e.target.value)}
                          className="w-full bg-[#FCFCFD] border border-gray-200 rounded-lg p-2 text-gray-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                        />
                      </div>

                      {otpSent ? (
                        <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-100 space-y-3 mt-4">
                          <label className="text-orange-800 font-bold block text-center">SMS Verification OTP Code:</label>
                          <input
                            type="text"
                            placeholder="Enter any randomly assigned values (e.g., 481023)"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full bg-white border border-orange-200 rounded-lg p-2.5 text-gray-900 text-center font-mono text-lg tracking-widest outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder:text-xs placeholder:tracking-normal placeholder:font-sans"
                          />
                          <button
                            id="trial-verify-btn"
                            onClick={handleVerifyOtp}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold w-full py-2.5 rounded-lg text-center block shadow-sm transition uppercase tracking-wider text-[11px]"
                          >
                            Verify Credentials
                          </button>
                        </div>
                      ) : (
                        <button
                          id="trial-otp-btn"
                          onClick={handleStartTrial}
                          className="bg-gray-900 text-white hover:bg-gray-800 font-bold w-full py-2.5 rounded-lg text-center block mt-4 transition shadow-sm uppercase tracking-wider text-[11px]"
                        >
                          Trigger Verification Tokens
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 text-center text-[10px] leading-relaxed shadow-sm">
                      <span className="material-symbols-outlined block text-2xl mb-1 text-green-600">verified</span>
                      <strong className="block text-xs mb-1">Identity Verified</strong>
                      Owner Phone and Email combination has been verified. Abuse prevention schema has registered hardware locks.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle Main Column: Menu item management logs */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Restaurant Menu Builder Tool</span>

                {/* Add dynamic Dish form */}
                <div className="bg-[#FCFCFD] p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-gray-700 font-medium">Food Dish Title:</label>
                    <input
                      type="text"
                      placeholder="e.g. Garlic Naan Double Cheese"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-700 font-medium">Dish Price (INR):</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={newDishPrice}
                      onChange={(e) => setNewDishPrice(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-700 font-medium font-sans">Dish category:</label>
                    <select
                      value={newDishCategory}
                      onChange={(e) => setNewDishCategory(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                    >
                      <option value="Main Course">Main Course</option>
                      <option value="Recommended Specials">Recommended Specials</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Pure Desi Butter">Pure Desi Butter</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="text-gray-700 font-medium block mb-1">Vegetarian Category:</label>
                    <div className="flex gap-2 h-9">
                      <button 
                        onClick={() => setNewDishVeg(true)}
                        className={`flex-1 flex items-center justify-center border rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${newDishVeg ? 'bg-green-50 border-green-300 text-green-700 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-[#FCFCFD]'}`}
                      >
                        Vegetarian
                      </button>
                      <button 
                        onClick={() => setNewDishVeg(false)}
                        className={`flex-1 flex items-center justify-center border rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${!newDishVeg ? 'bg-red-50 border-red-300 text-red-700 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-[#FCFCFD]'}`}
                      >
                        Non-Veg
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-1.5 pt-1">
                    <label className="text-gray-700 font-medium">Description (Optional):</label>
                    <input 
                      type="text"
                      placeholder="List ingredients and servings quantities..."
                      value={newDishDescription}
                      onChange={(e) => setNewDishDescription(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                    />
                  </div>

                  <button
                    id="add-dish-btn"
                    onClick={handleAddDish}
                    className="md:col-span-2 bg-gray-900 text-white hover:bg-gray-800 font-bold p-3 rounded-lg text-center mt-2 transition shadow-sm tracking-wider"
                  >
                    ADD ITEM TO RESTAURANT CATALOG
                  </button>
                </div>

                {/* Items preview table list */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block tracking-wider font-bold">Active Kitchen items ({menuItems.filter(m => m.restaurantId === currentRestaurantObj.id).length}):</span>
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto shadow-inner bg-[#FCFCFD]/50">
                    {menuItems
                      .filter(m => m.restaurantId === currentRestaurantObj.id)
                      .map((item, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-xs hover:bg-[#FCFCFD] transition border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              <span className={`inline-block w-2.5 h-2.5 border p-0.5 leading-none shrink-0 rounded-[3px] ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                <span className={`inline-block w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                              </span>
                              {item.name}
                            </p>
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{item.category}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-gray-900">₹{item.priceINR}</span>
                            <button
                              onClick={() => {
                                setMenuItems(prev => prev.filter(m => m.id !== item.id));
                                if (isSupabaseConfigured()) {
                                  dbDeleteMenuItem(item.id).catch(err => err?.code !== "PGRST205" && console.error("Failed to delete menu item from Supabase:", err));
                                }
                                triggerNotification(`Discharged "${item.name}" from active kitchen offerings.`);
                              }}
                              className="text-gray-400 hover:text-red-500 transition cursor-pointer p-1 rounded-sm hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Active Kitchen Pipeline</span>
                
                {orders.filter(o => o.restaurantId === currentRestaurantObj.id).length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs leading-normal bg-[#FCFCFD] rounded-xl border border-gray-100 italic">
                    No active tasks currently. Open the Customer Terminal and place order payload to view dynamic alerts.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .filter(o => o.restaurantId === currentRestaurantObj.id)
                      .map(order => (
                        <div key={order.id} className="bg-white border border-gray-200 p-4 rounded-xl text-xs space-y-3 hover:border-orange-300 hover:shadow-md transition shadow-sm">
                          <div className="flex justify-between font-bold border-b border-gray-100 pb-2">
                            <div>
                              <span className="text-gray-900">{order.id}</span>
                              <span className="text-gray-500 block font-normal text-[10px] mt-0.5">{order.customerName}</span>
                            </div>
                            <span className="text-gray-900 font-mono font-bold">₹{order.totalINR}</span>
                          </div>

                          <div className="space-y-1.5 px-1 py-1 bg-[#FCFCFD] rounded-lg">
                            {order.items.map((it, rid) => (
                              <p key={rid} className="text-gray-700">
                                <b>{it.quantity}x</b> {it.name}
                              </p>
                            ))}
                          </div>

                          {/* Order State controls */}
                          <div className="pt-3 border-t border-gray-100 space-y-2">
                            <span className="text-gray-600 font-semibold block text-[10px] uppercase tracking-wider">Cycle Control:</span>
                            
                            {order.status === OrderStatus.PLACED && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    updateOrderLocalAndDb(order.id, o => ({ ...o, status: OrderStatus.ACCEPTED }));
                                    triggerNotification(`Order Accepted. Preparing stage started on merchant system.`);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1 py-2 rounded-lg text-center transition shadow-sm"
                                >
                                  Accept Order
                                </button>
                                <button
                                  onClick={() => {
                                    updateOrderLocalAndDb(order.id, o => ({ ...o, status: OrderStatus.REJECTED }));
                                    triggerNotification(`Order Declined. Subtotal sent back to customer wallet.`);
                                  }}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold flex-1 py-2 rounded-lg text-center transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {order.status === OrderStatus.ACCEPTED && (
                              <button
                                onClick={() => {
                                  updateOrderLocalAndDb(order.id, o => ({ ...o, status: OrderStatus.PREPARING }));
                                  triggerNotification(`Kitchen changed status to: PREPARING.`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full py-2 rounded-lg text-center transition shadow-sm"
                              >
                                  Set Preparing
                              </button>
                            )}

                            {order.status === OrderStatus.PREPARING && (
                              <button
                                onClick={() => {
                                  updateOrderLocalAndDb(order.id, o => ({ ...o, status: OrderStatus.READY_FOR_PICKUP }));
                                  triggerNotification(`Status changed to: READY_FOR_PICKUP.`);
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold w-full py-2.5 rounded-lg text-center transition shadow-sm"
                              >
                                Packaging Completed (Ready)
                              </button>
                            )}

                            {order.status === OrderStatus.READY_FOR_PICKUP && (
                              <div className="text-gray-500 font-mono text-center bg-[#FCFCFD] border border-gray-200 py-2 rounded-lg px-2 italic uppercase text-[10px] tracking-wider font-bold">
                                Awaiting Driver assignment
                              </div>
                            )}

                            {order.status === OrderStatus.RIDER_ASSIGNED && (
                              <div className="text-yellow-700 font-mono text-center bg-yellow-50 border border-yellow-200 py-2 rounded-lg px-2 font-bold uppercase text-[10px] tracking-wider">
                                Driver assigned - waiting pick up
                              </div>
                            )}

                            {[OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY].includes(order.status) && (
                              <div className="text-blue-700 font-mono text-center bg-blue-50 border border-blue-200 py-2 rounded-lg px-2 font-bold uppercase text-[10px] tracking-wider">
                                Out for transit delivery
                              </div>
                            )}

                            {order.status === OrderStatus.DELIVERED && (
                              <div className="bg-green-50 text-green-800 border border-green-200 py-2 rounded-lg text-center font-bold font-mono text-[10px] tracking-widest uppercase">
                                COMPLETED
                              </div>
                            )}

                            {order.status === OrderStatus.REJECTED && (
                              <div className="bg-red-50 text-red-800 border border-red-200 py-2 rounded-lg text-center font-bold font-mono text-[10px] tracking-widest uppercase">
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Active Rider Profile Profile</span>
                
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block tracking-wider font-bold">Choose Active Driver:</span>
                  <select 
                    id="driver-rider-select"
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full text-xs bg-[#FCFCFD] border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                  >
                    {riders.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.vehicleNumber})</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const riderObj = riders.find(r => r.id === selectedRiderId)!;
                  return (
                    <div className="bg-[#FCFCFD] p-5 rounded-xl border border-gray-200 space-y-4 text-xs shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium font-sans">Toggle working status:</span>
                        <button
                          onClick={() => {
                            setRiders(prev => prev.map(r => r.id === selectedRiderId ? { ...r, isOnline: !r.isOnline } : r));
                            triggerNotification(`Online working toggle updated.`);
                          }}
                          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-full border transition-colors ${riderObj.isOnline ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'}`}
                        >
                          {riderObj.isOnline ? '● ONLINE' : '○ OFFLINE'}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Delivered Volume:</span>
                        <span className="font-mono text-gray-900 font-bold text-[14px]">{riderObj.completedDeliveries} Deliveries</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Accumulated Wallet Balance:</span>
                        <span className="font-mono text-green-600 font-extrabold text-[14px]">₹{riderObj.earningsINR}</span>
                      </div>

                      <p className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
                        Courier fees collected from checkout calculations are deposited 100% straight into the active partner pocket. Platform commissions set back to 0%.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right main board: Active Assignments feed */}
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Rider Command Center Feed</span>

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
                      <div className="text-center py-16 bg-[#FCFCFD] rounded-xl border border-gray-200 text-gray-500 text-sm italic shadow-inner">
                        <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">cloud_off</span>
                        Change the working status to ONLINE in the left configuration card to stream nearby route assignments logs.
                      </div>
                    );
                  }

                  if (activeJob) {
                    return (
                      <div className="bg-gray-900 text-white rounded-xl p-6 space-y-5 border border-gray-800 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
                          <div>
                            <span className="text-green-400 text-[10px] font-mono font-bold uppercase tracking-widest block mb-0.5">ROUTE TASK CURRENTLY IN TRANSACTION</span>
                            <h6 className="font-bold text-lg text-white">{activeJob.id}</h6>
                          </div>
                          
                          <span className="bg-green-600 text-white font-mono font-bold text-sm px-3 py-1.5 rounded-lg shadow-sm">
                            Payout: ₹{activeJob.deliveryFee}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          <div className="space-y-1.5 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <span className="text-gray-400 uppercase font-mono tracking-wider text-[10px] font-bold block mb-2">Pickup Address:</span>
                            <p className="text-white font-bold text-sm">{activeJob.restaurantName}</p>
                            <p className="text-gray-400 italic leading-relaxed">{restaurants.find(r => r.id === activeJob.restaurantId)?.address}</p>
                          </div>
                          <div className="space-y-1.5 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <span className="text-gray-400 uppercase font-mono tracking-wider text-[10px] font-bold block mb-2">Dropoff Address:</span>
                            <p className="text-white font-bold text-sm">{activeJob.customerName}</p>
                            <p className="text-gray-400 italic leading-relaxed">{activeJob.customerAddress}</p>
                          </div>
                        </div>

                        {/* Dropoff PIN entering form */}
                        <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 max-w-md ml-auto space-y-3 text-xs shadow-inner">
                          <span className="text-gray-400 font-bold uppercase tracking-wider font-sans text-center block text-[10px]">Dropoff PIN validation gate:</span>
                          <input
                            type="text"
                            placeholder="Ask customer for verification PIN (e.g., 4 digits)"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            className="w-full text-center bg-gray-900 focus:bg-white focus:text-gray-900 border border-gray-800 font-mono tracking-widest text-lg rounded-lg py-3 outline-none focus:border-orange-500 transition-colors placeholder:text-[10px] placeholder:tracking-normal placeholder:font-sans"
                          />
                          {otpError && (
                            <p className="text-red-400 text-center text-[10px] leading-tight font-bold">{otpError}</p>
                          )}
                          <button
                            id="driver-complete-btn"
                            onClick={() => handleDeliveryComplete(activeJob.id)}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg transition text-center shadow-lg uppercase tracking-wider text-[11px]"
                          >
                            Validate PIN & Release Delivery Fees
                          </button>
                        </div>

                        {/* Lifecycle progression for driver */}
                        <div className="pt-4 border-t border-gray-800 flex gap-3">
                          {activeJob.status === OrderStatus.RIDER_ASSIGNED && (
                            <button
                              onClick={() => {
                                setOrders(prev => prev.map(o => o.id === activeJob.id ? { ...o, status: OrderStatus.PICKED_UP } : o));
                                triggerNotification(`Rider logged in at pickup: status set to PICKED_UP.`);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-xl flex-1 text-center transition shadow-md uppercase tracking-wider"
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
                              className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-3 rounded-xl flex-1 text-center transition shadow-md uppercase tracking-wider"
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
                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Awaiting Pickup Orders nearby ({pendingAssign.length})</p>
                      
                      {pendingAssign.length === 0 ? (
                        <div className="text-center py-12 bg-[#FCFCFD] rounded-xl border border-gray-200 text-gray-400 text-xs italic">
                          <span className="material-symbols-outlined block text-3xl mb-2 opacity-50">shopping_basket</span>
                          No transit calls currently waiting. Select "Customer App", place a food order, and allow the restaurant to accept it and change status to Ready Packaging.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingAssign.map(po => (
                            <div key={po.id} className="border border-gray-200 p-5 rounded-xl space-y-4 bg-white shadow-sm text-xs hover:border-orange-300 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-bold text-sm text-gray-900 mb-0.5">{po.id}</h6>
                                  <span className="text-gray-500 font-medium">{po.restaurantName}</span>
                                </div>
                                <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 font-bold font-mono shadow-sm">₹{po.deliveryFee} Payout</span>
                              </div>
                              <p className="text-gray-600 bg-[#FCFCFD] p-2.5 rounded-lg border border-gray-100">Destination dropoff address: <b className="block mt-0.5 text-gray-900">{po.customerAddress}</b></p>
                              
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
                                className="w-full bg-gray-900 text-white hover:bg-orange-600 font-bold py-2.5 rounded-lg transition text-center shadow-md uppercase tracking-wider text-[11px]"
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
            <div className="bg-gray-900 rounded-xl p-8 text-white grid grid-cols-1 lg:grid-cols-4 gap-8 select-none shadow-xl border border-gray-800">
              <div className="lg:col-span-2 space-y-2 shrink-0">
                <span className="bg-orange-500 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
                  Real-time Saved Commission Index (Live)
                </span>
                <h4 className="text-3xl font-extrabold tracking-tight mt-1.5 text-white">No Platform Taxes. 100% Direct Value.</h4>
                <p className="text-gray-400 text-xs leading-relaxed mt-2 max-w-lg">
                  Nibzo prevents aggregators from siphoning off restaurant revenue. This index aggregates total simulated savings achieved by merchants using our fixed subscription model instead of paying 25% commissions.
                </p>
              </div>

              <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 shadow-inner flex flex-col justify-center">
                <span className="text-gray-400 text-[10px] font-mono uppercase tracking-widest font-bold">SIMULATED ORDER VOLUME</span>
                <div className="font-mono text-3xl font-bold mt-2 text-white">₹{savingsSummary.restaurantVolume}</div>
                <p className="text-[10px] text-gray-500 mt-2 leading-snug">Gross subtotal transaction value processed through zero commission model</p>
              </div>

              <div className="bg-green-900/30 p-5 rounded-xl border border-green-800/50 shadow-inner flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <span className="text-green-400 text-[10px] font-mono uppercase tracking-widest font-bold relative z-10">Total Merchant Savings</span>
                <div className="font-mono text-3xl font-bold mt-2 text-green-400 relative z-10">₹{savingsSummary.commissionSaved}</div>
                <p className="text-[10px] text-green-200/60 mt-2 leading-snug relative z-10">Money kept inside restaurant registers rather than being paid to centralized commissions.</p>
              </div>
            </div>

            {/* Quick base parameters control panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Global Platform Config Controls</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="text-gray-700 font-medium font-sans">Base Delivery Compensation Rate (INR):</label>
                  <input
                    type="number"
                    value={baseDeliveryFee}
                    onChange={(e) => setBaseDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#FCFCFD] border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                  />
                  <p className="text-[10px] text-gray-500 font-medium">Flat minimum amount paid for routing job</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700 font-medium font-sans">Distance Fee Rate Per Km (INR):</label>
                  <input
                    type="number"
                    value={feePerKm}
                    onChange={(e) => setFeePerKm(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#FCFCFD] border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                  />
                  <p className="text-[10px] text-gray-500 font-medium">Dynamic scaling rate applied beyond base boundaries</p>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <button
                    onClick={() => {
                      setRestaurants(prev => prev.map(r => r.id === 'rest_trial_dhaba' && r.trialDaysRemaining ? { ...r, trialDaysRemaining: r.trialDaysRemaining + 7 } : r));
                      triggerNotification('Extended trials by +7 Days for all active trial partners.');
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold p-3 rounded-xl text-center transition shadow-md uppercase tracking-wider text-[11px]"
                  >
                    Extend Trial Counts (+7 Days)
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated merchant accounts manager list */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <span className="text-gray-900 font-bold text-sm uppercase block border-b border-gray-100 pb-3">Merchant Registration Accounts Directory</span>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-[#FCFCFD]/50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="p-4">Restaurant Partner</th>
                      <th className="p-4">Geographic Bound</th>
                      <th className="p-4 text-center">Subscription Tier</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {restaurants.map(rest => (
                      <tr key={rest.id} className="hover:bg-[#FCFCFD] transition-colors">
                        <td className="p-4 font-bold text-gray-900 text-sm">{rest.name}</td>
                        <td className="p-4 text-gray-600 font-medium">{rest.address}</td>
                        <td className="p-4 uppercase text-center">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] tracking-widest ${
                            rest.subscriptionTier === SubscriptionTier.ADVANCED ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            rest.subscriptionTier === SubscriptionTier.PRO ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            rest.subscriptionTier === SubscriptionTier.TRIAL ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse' : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {rest.subscriptionTier}
                          </span>
                        </td>
                        <td className="p-4 uppercase font-bold text-[10px] tracking-widest text-center">
                          <span className={rest.status === 'active' ? 'text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100' : 'text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200'}>
                            {rest.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {rest.status === 'active' ? (
                              <button
                                onClick={() => {
                                  updateRestaurantLocalAndDb(rest.id, r => ({ ...r, status: 'suspended' }));
                                  triggerNotification(`Merchant account suspended due to regulatory flag.`);
                                }}
                                className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 font-bold uppercase text-[10px] tracking-wider transition shadow-sm"
                              >
                                Suspend Partner
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  updateRestaurantLocalAndDb(rest.id, r => ({ ...r, status: 'active' }));
                                  triggerNotification(`Merchant status re-activated.`);
                                }}
                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-bold uppercase text-[10px] tracking-wider transition shadow-sm"
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