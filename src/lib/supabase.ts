/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Restaurant, MenuItem, Order, DeliveryPartner } from '../types';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Lazy initialization wrapper to prevent crashes if credentials aren't set yet
let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return typeof supabaseUrl === 'string' && supabaseUrl.trim() !== '' &&
         typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim() !== '';
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// SQL Script generator for the user's Supabase SQL Editor
export const SUPABASE_SQL_SETUP = `-- Supabase SQL Setup for Nibzo Application
-- Paste this script inside your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    image TEXT,
    cuisine TEXT[] DEFAULT '{}',
    rating NUMERIC DEFAULT 4.0,
    reviews_count INTEGER DEFAULT 0,
    delivery_time_mins INTEGER DEFAULT 30,
    base_delivery_fee INTEGER DEFAULT 30,
    distance_km NUMERIC DEFAULT 1.5,
    address TEXT,
    status TEXT DEFAULT 'active',
    subscription_tier TEXT DEFAULT 'BASIC',
    operating_hours TEXT,
    is_holiday BOOLEAN DEFAULT false,
    delivery_radius_km NUMERIC DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_inr INTEGER NOT NULL,
    image TEXT,
    is_veg BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE SET NULL,
    restaurant_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal INTEGER,
    delivery_fee INTEGER,
    promo_discount INTEGER,
    total_inr INTEGER,
    payment_method TEXT,
    payment_status TEXT,
    status TEXT,
    delivery_token TEXT,
    assigned_rider_id TEXT,
    assigned_rider_name TEXT,
    placed_at TEXT,
    notes TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for automatic live updates
alter publication supabase_realtime add table public.restaurants;
alter publication supabase_realtime add table public.menu_items;
alter publication supabase_realtime add table public.orders;

-- Disable RLS for sandbox presentation simplicity (or adjust according to your policy requirements)
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
`;

// Helper to safely map database objects back to domain types
function mapDbToRestaurant(db: any): Restaurant {
  return {
    id: db.id,
    name: db.name,
    tagline: db.tagline || '',
    image: db.image || '',
    cuisine: Array.isArray(db.cuisine) ? db.cuisine : [],
    rating: Number(db.rating ?? 4.0),
    reviewsCount: Number(db.reviews_count ?? 0),
    deliveryTimeMins: Number(db.delivery_time_mins ?? 30),
    baseDeliveryFee: Number(db.base_delivery_fee ?? 30),
    distanceKm: Number(db.distance_km ?? 1.5),
    address: db.address || '',
    status: db.status as any || 'active',
    subscriptionTier: db.subscription_tier as any || 'BASIC',
    operatingHours: db.operating_hours || '11:00 AM - 11:00 PM',
    isHoliday: !!db.is_holiday,
    deliveryRadiusKm: Number(db.delivery_radius_km ?? 5.0)
  };
}

function mapRestaurantToDb(r: Restaurant) {
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline,
    image: r.image,
    cuisine: r.cuisine,
    rating: r.rating,
    reviews_count: r.reviewsCount,
    delivery_time_mins: r.deliveryTimeMins,
    base_delivery_fee: r.baseDeliveryFee,
    distance_km: r.distanceKm,
    address: r.address,
    status: r.status,
    subscription_tier: r.subscriptionTier,
    operating_hours: r.operatingHours,
    is_holiday: r.isHoliday,
    delivery_radius_km: r.deliveryRadiusKm
  };
}

function mapDbToMenuItem(db: any): MenuItem {
  return {
    id: db.id,
    restaurantId: db.restaurant_id,
    category: db.category,
    name: db.name,
    description: db.description || '',
    priceINR: Number(db.price_inr ?? 0),
    image: db.image || '',
    isVeg: !!db.is_veg,
    isAvailable: !!db.is_available,
    isPopular: !!db.is_popular
  };
}

function mapMenuItemToDb(m: MenuItem) {
  return {
    id: m.id,
    restaurant_id: m.restaurantId,
    category: m.category,
    name: m.name,
    description: m.description,
    price_inr: m.priceINR,
    image: m.image,
    is_veg: m.isVeg,
    is_available: m.isAvailable,
    is_popular: m.isPopular
  };
}

// API functions
export async function dbFetchRestaurants(): Promise<Restaurant[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('restaurants').select('*');
  if (error) {
    if (error.code !== 'PGRST205') console.error('Error fetching restaurants:', error);
    throw error;
  }
  return (data || []).map(mapDbToRestaurant);
}

export async function dbUpsertRestaurant(restaurant: Restaurant): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const dbObj = mapRestaurantToDb(restaurant);
  const { error } = await client.from('restaurants').upsert(dbObj);
  if (error) {
    if (error.code !== 'PGRST205') console.error(`Error saving restaurant ${restaurant.id}:`, error);
    throw error;
  }
}

export async function dbFetchMenuItems(): Promise<MenuItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('menu_items').select('*');
  if (error) {
    if (error.code !== 'PGRST205') console.error('Error fetching menu items:', error);
    throw error;
  }
  return (data || []).map(mapDbToMenuItem);
}

export async function dbUpsertMenuItem(item: MenuItem): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const dbObj = mapMenuItemToDb(item);
  const { error } = await client.from('menu_items').upsert(dbObj);
  if (error) {
    if (error.code !== 'PGRST205') console.error(`Error saving menu item ${item.id}:`, error);
    throw error;
  }
}

export async function dbDeleteMenuItem(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('menu_items').delete().eq('id', id);
  if (error) {
    if (error.code !== 'PGRST205') console.error(`Error deleting menu item ${id}:`, error);
    throw error;
  }
}

export async function dbFetchOrders(): Promise<Order[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    if (error.code !== 'PGRST205') console.error('Error fetching orders:', error);
    throw error;
  }
  return (data || []).map(db => ({
    id: db.id,
    customerId: db.customer_id || '',
    customerName: db.customer_name || '',
    customerPhone: db.customer_phone || '',
    customerAddress: db.customer_address || '',
    restaurantId: db.restaurant_id || '',
    restaurantName: db.restaurant_name || '',
    items: Array.isArray(db.items) ? db.items : [],
    subtotal: Number(db.subtotal ?? 0),
    deliveryFee: Number(db.delivery_fee ?? 0),
    promoDiscount: Number(db.promo_discount ?? 0),
    totalINR: Number(db.total_inr ?? 0),
    paymentMethod: db.payment_method as any || 'UPI',
    paymentStatus: db.payment_status as any || 'pending',
    status: db.status as any || 'PLACED',
    deliveryToken: db.delivery_token || '',
    assignedRiderId: db.assigned_rider_id,
    assignedRiderName: db.assigned_rider_name,
    placedAt: db.placed_at || '',
    notes: db.notes,
    timeLine: Array.isArray(db.timeline) ? db.timeline : []
  }));
}

export async function dbUpsertOrder(order: Order): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const dbObj = {
    id: order.id,
    customer_id: order.customerId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    restaurant_id: order.restaurantId,
    restaurant_name: order.restaurantName,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    promo_discount: order.promoDiscount,
    total_inr: order.totalINR,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    status: order.status,
    delivery_token: order.deliveryToken,
    assigned_rider_id: order.assignedRiderId,
    assigned_rider_name: order.assignedRiderName,
    placed_at: order.placedAt,
    notes: order.notes,
    timeline: order.timeLine
  };
  const { error } = await client.from('orders').upsert(dbObj);
  if (error) {
    if (error.code !== 'PGRST205') console.error(`Error saving order ${order.id}:`, error);
    throw error;
  }
}

// Bulk Sync Helper when first setting up Supabase configurations, to seed database
export async function dbBulkSeed(restaurants: Restaurant[], menuItems: MenuItem[]): Promise<{ restaurantsCount: number, menuItemsCount: number }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  // 1. Seed Restaurants
  const { error: rError } = await client.from('restaurants').upsert(
    restaurants.map(mapRestaurantToDb)
  );
  if (rError) {
    throw new Error('Restaurants seeding failed: ' + rError.message);
  }

  // 2. Seed Menu Items
  const { error: mError } = await client.from('menu_items').upsert(
    menuItems.map(mapMenuItemToDb)
  );
  if (mError) {
    throw new Error('Menu items seeding failed: ' + mError.message);
  }

  return {
    restaurantsCount: restaurants.length,
    menuItemsCount: menuItems.length
  };
}
