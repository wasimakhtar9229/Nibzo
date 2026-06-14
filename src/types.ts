/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Domain Types for NIBZO Subscription delivery platform

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export enum SubscriptionTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ADVANCED = 'ADVANCED',
  TRIAL = 'TRIAL'
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  priceINR: number;
  maxMenuItems: number;
  features: string[];
}

export interface RestaurantSubscription {
  id: string;
  restaurantId: string;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'canceled' | 'trialing';
  startDate: string;
  endDate: string;
  trialDaysRemaining?: number;
  autoRenew: boolean;
  paymentDetails?: string;
}

export interface TrialRecord {
  id: string;
  restaurantId: string;
  phone: string;
  email: string;
  otpVerified: boolean;
  emailVerified: boolean;
  startedAt: string;
  expiresAt: string;
  extendedByDays: number;
  isAbuseBlocked: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  image: string;
  cuisine: string[];
  rating: number;
  reviewsCount: number;
  deliveryTimeMins: number;
  baseDeliveryFee: number;
  distanceKm: number;
  address: string;
  status: 'active' | 'pending_approval' | 'inactive' | 'suspended';
  subscriptionTier: SubscriptionTier;
  trialDaysRemaining?: number;
  operatingHours: string;
  isHoliday: boolean;
  deliveryRadiusKm: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  category: string;
  name: string;
  description: string;
  priceINR: number;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  customizationOptions?: MenuItemCustomization[];
  isPopular?: boolean;
}

export interface MenuItemCustomization {
  name: string;
  type: 'single' | 'multiple';
  options: {
    name: string;
    extraPriceINR: number;
  }[];
}

export enum OrderStatus {
  PLACED = 'PLACED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  RIDER_ASSIGNED = 'RIDER_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED'
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  selectedCustomizations: {
    groupName: string;
    optionName: string;
    extraPrice: number;
  }[];
  pricePerUnit: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  totalINR: number;
  paymentMethod: 'UPI' | 'CARD' | 'COD';
  paymentStatus: 'pending' | 'success' | 'failed';
  status: OrderStatus;
  deliveryToken: string; // Order Completion OTP
  assignedRiderId?: string;
  assignedRiderName?: string;
  placedAt: string;
  notes?: string;
  timeLine: { status: OrderStatus; time: string }[];
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  isOnline: boolean;
  status: 'approved' | 'pending_approval' | 'suspended';
  currentOrderId?: string;
  earningsINR: number;
  completedDeliveries: number;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValueINR: number;
  maxDiscountINR?: number;
  description: string;
  active: boolean;
}

export interface SupportTicket {
  id: string;
  restaurantId?: string;
  customerId?: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}
