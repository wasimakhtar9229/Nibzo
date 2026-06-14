/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubscriptionPlan, SubscriptionTier, Restaurant, MenuItem, DeliveryPartner, PromoCode } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub_basic',
    name: 'BASIC PLAN',
    tier: SubscriptionTier.BASIC,
    priceINR: 199,
    maxMenuItems: 50,
    features: [
      'Restaurant listing on customer map & list',
      'Restaurant profile page with branding',
      'Up to 50 active menu items',
      'Order management controls (Accept/Reject)',
      'Basic analytics (Daily revenue, order counting)',
      'Customer ratings & reviews display',
      'Automatic renewal reminders',
      'Standard email support (24h SLA)'
    ]
  },
  {
    id: 'sub_pro',
    name: 'PRO PLAN',
    tier: SubscriptionTier.PRO,
    priceINR: 399,
    maxMenuItems: 200,
    features: [
      'Everything in Basic Plan',
      'Up to 200 active menu items',
      'Promotional banners placement',
      'Advanced analytics (Hourly peaks, customer retention)',
      'Featured "Popular Dishes" spotlighting',
      'Priority search visibility in matching cuisines',
      'Promo code creation & control dashboard',
      'Business insights dashboard & export',
      'Direct WhatsApp chat support (2h SLA)'
    ]
  },
  {
    id: 'sub_advance',
    name: 'ADVANCE PLAN',
    tier: SubscriptionTier.ADVANCED,
    priceINR: 699,
    maxMenuItems: 999999, // Unlimited
    features: [
      'Everything in Pro Plan',
      'Unlimited menu items listings',
      'Featured homepage placement rotating banner',
      'Exclusive "Premium Restaurant Badge" on profile',
      'Multiple staff accounts controls',
      'Advanced reporting (Tax logs, rider SLA stats)',
      'AI-powered sales forecasting insights',
      'Customer segmentation analytics & heatmaps',
      'Priority phone support (24/7, live agent)',
      'Beta early access to brand-new tools'
    ]
  }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_gourmet_kitchen',
    name: 'The Gourmet Kitchen',
    tagline: 'Artisanal Italian, Continental & Decadent Desserts',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
    cuisine: ['Italian', 'Continental'],
    rating: 4.8,
    reviewsCount: 240,
    deliveryTimeMins: 35,
    baseDeliveryFee: 40,
    distanceKm: 2.1,
    address: 'Indiranagar, Bangalore',
    status: 'active',
    subscriptionTier: SubscriptionTier.ADVANCED,
    operatingHours: '11:30 AM - 11:00 PM',
    isHoliday: false,
    deliveryRadiusKm: 6.5
  },
  {
    id: 'rest_spice_room',
    name: 'The Spice Room',
    tagline: 'Gourmet Indian Clay Oven & Authentic Handi Curries',
    image: 'https://images.unsplash.com/photo-1585938338392-50a59990d4e5?auto=format&fit=crop&q=80&w=400',
    cuisine: ['North Indian', 'Mughlai', 'Biryani'],
    rating: 4.5,
    reviewsCount: 188,
    deliveryTimeMins: 28,
    baseDeliveryFee: 30,
    distanceKm: 1.2,
    address: 'Koramangala, Bangalore',
    status: 'active',
    subscriptionTier: SubscriptionTier.PRO,
    operatingHours: '11:00 AM - 11:30 PM',
    isHoliday: false,
    deliveryRadiusKm: 5.0
  },
  {
    id: 'rest_crust_co',
    name: 'Crust & Co.',
    tagline: 'Neapolitan Wood-fired Hand-stretched Dough Pizzas & Pasta',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400',
    cuisine: ['Italian', 'Pizzas', 'Pasta'],
    rating: 4.7,
    reviewsCount: 310,
    deliveryTimeMins: 38,
    baseDeliveryFee: 45,
    distanceKm: 2.5,
    address: 'HSR Layout, Bangalore',
    status: 'active',
    subscriptionTier: SubscriptionTier.ADVANCED,
    operatingHours: '12:00 PM - 12:00 AM',
    isHoliday: false,
    deliveryRadiusKm: 7.0
  },
  {
    id: 'rest_green_leaf',
    name: 'Green Leaf Cafe',
    tagline: 'Clean-eating Bowls, Freshly Squeezed Juices & Vegan Bites',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    cuisine: ['Healthy Food', 'Salads', 'Juices'],
    rating: 4.2,
    reviewsCount: 95,
    deliveryTimeMins: 18,
    baseDeliveryFee: 25,
    distanceKm: 0.8,
    address: 'Hal 2nd Stage, Bangalore',
    status: 'active',
    subscriptionTier: SubscriptionTier.BASIC,
    operatingHours: '08:00 AM - 10:00 PM',
    isHoliday: false,
    deliveryRadiusKm: 4.0
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // The Gourmet Kitchen Menu Items
  {
    id: 'm1_risotto',
    restaurantId: 'rest_gourmet_kitchen',
    category: 'Best Sellers',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy arborio rice slow-cooked with wild mushrooms, finished with white truffle oil and aged parmesan.',
    priceINR: 495,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    customizationOptions: [
      {
        name: 'Add Extra Cheese',
        type: 'multiple',
        options: [
          { name: 'Parmesan Dusting', extraPriceINR: 45 },
          { name: 'Burrata Top', extraPriceINR: 120 }
        ]
      }
    ]
  },
  {
    id: 'm2_pepperoni',
    restaurantId: 'rest_gourmet_kitchen',
    category: 'Best Sellers',
    name: 'Classic Pepperoni Pizza',
    description: 'Wood-fired crust topped with San Marzano tomato sauce, fresh mozzarella, and spicy pepperoni slices.',
    priceINR: 550,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300',
    isVeg: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'm3_salad',
    restaurantId: 'rest_gourmet_kitchen',
    category: 'Best Sellers',
    name: 'Burrata Caprese Salad',
    description: 'Fresh burrata cheese, heirloom tomatoes, basil pesto, and balsamic glaze.',
    priceINR: 380,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=300',
    isVeg: true,
    isAvailable: true,
    isPopular: false
  },

  // The Spice Room Menu Items
  {
    id: 'm4_biryani',
    restaurantId: 'rest_spice_room',
    category: 'Popular Near You',
    name: 'Classic Chicken Biryani',
    description: 'Authentic rich slow-cooked Hyderabadi chicken biryani with pure saffron, marinated meat & fried scallions.',
    priceINR: 280,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300',
    isVeg: false,
    isAvailable: true,
    isPopular: true
  },

  // Crust & Co. Menu Items
  {
    id: 'm5_pepperoni_crust',
    restaurantId: 'rest_crust_co',
    category: 'Main Course',
    name: 'Classic Pepperoni Pizza',
    description: 'Woodfired charred Neapolitan crust with premium Italian pepperoni slices and melting fresh mozzarella.',
    priceINR: 550,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300',
    isVeg: false,
    isAvailable: true,
    isPopular: true
  },

  // Green Leaf Menu Items
  {
    id: 'm6_quinoa',
    restaurantId: 'rest_green_leaf',
    category: 'Popular Near You',
    name: 'Quinoa Power Bowl',
    description: 'Mixed crisp wild salad, roasted warm sweet potato chunks, rich avocado toppings, diced cherry tomatoes and organic quinoa.',
    priceINR: 220,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
    isVeg: true,
    isAvailable: true,
    isPopular: true
  }
];

export const INITIAL_RIDERS: DeliveryPartner[] = [
  {
    id: 'rider_alex',
    name: 'Alex M.',
    phone: '+91 98451 00312',
    vehicleNumber: 'KA-03-HL-9201',
    isOnline: true,
    status: 'approved',
    earningsINR: 1840,
    completedDeliveries: 124
  },
  {
    id: 'rider_pavan',
    name: 'Pavan Kumar',
    phone: '+91 98765 00123',
    vehicleNumber: 'KA-05-EX-4201',
    isOnline: true,
    status: 'approved',
    earningsINR: 1120,
    completedDeliveries: 14
  }
];

export const EX_PROMO_CODES: PromoCode[] = [
  {
    code: 'NIBZOFEST',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValueINR: 200,
    maxDiscountINR: 100,
    description: 'Enjoy 15% off up to ₹100! Zero hidden platform costs.',
    active: true
  },
  {
    code: 'EATLOCAL',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValueINR: 250,
    description: 'Flat ₹50 direct discount to support local restaurants!',
    active: true
  }
];
