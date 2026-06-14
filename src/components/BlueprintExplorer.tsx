/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Terminal, 
  ShieldCheck, 
  CloudLightning, 
  Copy, 
  Check, 
  Search, 
  Key, 
  Cpu, 
  Lock,
  Layers
} from 'lucide-react';

export default function BlueprintExplorer() {
  const [activeTab, setActiveTab] = useState<'database' | 'apis' | 'security' | 'architecture'>('architecture');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sysArchitectureData = {
    title: 'Zero-Commission Scale Architecture',
    tagline: 'Multi-tenant high-throughput system configured for immediate single-city launch and rapid national scaling.',
    components: [
      {
        title: 'Frontend Tier (Native Flutter)',
        desc: 'Single unified Flutter codebase compiles to native iOS, Android, and Web applications for Customer, Restaurant, and Delivery Partner apps, utilizing lightweight WebSocket channels for low-latency live tracking.'
      },
      {
        title: 'Compute Layer (Google Cloud Run / Kubernetes)',
        desc: 'Autoscaling Node.js Express & TypeScript backend containers behind GCLB (Google Cloud Load Balancing). Scales to zero at night to reduce base operations cost.'
      },
      {
        title: 'State & Cache (Memorystore Redis)',
        desc: 'In-memory database caching OTP sessions, restaurant geolocation geospatial keys, active driver statuses, and transient rate-limit counters to maintain <40ms API response latency.'
      },
      {
        title: 'Primary Store (Cloud SQL PostgreSQL)',
        desc: 'Highly available, replicated database clustered with read-replicas. Enforces primary/foreign constraints and stores audit logs, transaction states, and subscription histories securely.'
      }
    ]
  };

  const databaseSchemas = [
    {
      table: 'users',
      description: 'Core accounts for customer, restaurant staff, delivery riders, and administrators.',
      ddl: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) CHECK (role IN ('CUSTOMER', 'RESTAURANT_OWNER', 'RESTAURANT_STAFF', 'DELIVERY_PARTNER', 'ADMIN')) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role_email ON users(role, email);
CREATE INDEX idx_users_phone ON users(phone_number);`
    },
    {
      table: 'restaurants',
      description: 'Stores business parameters, zero-commission subscription status, and operating details.',
      ddl: `CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  tagline VARCHAR(255),
  image_url VARCHAR(512),
  cuisine VARCHAR(50)[] NOT NULL,
  address_text TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  operating_hours VARCHAR(100) NOT NULL,
  is_holiday BOOLEAN DEFAULT FALSE,
  delivery_radius_km DECIMAL(4,2) DEFAULT 8.00,
  base_delivery_fee DECIMAL(6,2) DEFAULT 30.00,
  min_order_value DECIMAL(6,2) DEFAULT 100.00,
  status VARCHAR(30) CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'SUSPENDED')) DEFAULT 'PENDING_APPROVAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_restaurants_coords ON restaurants USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX idx_restaurants_status ON restaurants(status);`
    },
    {
      table: 'restaurant_staff',
      description: 'Map secondary accounts (cooks, managers) to a restaurant with ACL permissions.',
      ddl: `CREATE TABLE restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permissions VARCHAR(50)[] NOT NULL, -- e.g. ['EDIT_MENU', 'MANAGE_ORDERS']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, user_id)
);`
    },
    {
      table: 'categories',
      description: 'Menu divisions (e.g. "Main Course", "Starters") scoped by restaurant.',
      ddl: `CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(restaurant_id, name)
);`
    },
    {
      table: 'menu_items',
      description: 'The transactional dishes with vegetarian tags, pricing, and active subscription caps.',
      ddl: `CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_inr DECIMAL(8,2) NOT NULL,
  image_url VARCHAR(512),
  is_veg BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  customization_schema JSONB, -- Stores customizable modifiers (e.g., extra cheese, toppings)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id) WHERE is_available = TRUE;`
    },
    {
      table: 'orders',
      description: 'Preserves critical transaction lifecycle states, delivery logs, and settlement tokens.',
      ddl: `CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE RESTRICT,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(6,2) NOT NULL, -- Passed 100% to rider
  promo_discount DECIMAL(8,2) DEFAULT 0.00,
  total_inr DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_latitude DECIMAL(9,6) NOT NULL,
  delivery_longitude DECIMAL(9,6) NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('UPI', 'CARD', 'COD')) NOT NULL,
  payment_status VARCHAR(20) CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED')) DEFAULT 'PENDING',
  order_status VARCHAR(30) CHECK (order_status IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'REJECTED')) DEFAULT 'PLACED',
  delivery_token VARCHAR(6) NOT NULL, -- Code to be entered by delivery rider on dropoff
  assigned_rider_id UUID, -- References delivery_partners
  customer_notes TEXT,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(order_status);`
    },
    {
      table: 'order_items',
      description: 'Dishes and quantity levels bounded within a single order.',
      ddl: `CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INT CHECK (quantity > 0) NOT NULL,
  selected_customizations JSONB, -- list of selected sizes, add-ons
  price_per_unit DECIMAL(8,2) NOT NULL
);`
    },
    {
      table: 'addresses',
      description: 'Frequently saved addresses for faster customer checkouts.',
      ddl: `CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home', -- Home, Work, Other
  address_line TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      table: 'payments',
      description: 'Direct transaction status logs from payment gateway webhook captures.',
      ddl: `CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
  gateway_transaction_id VARCHAR(100) UNIQUE,
  payment_method VARCHAR(30) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, REFUNDED
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      table: 'reviews',
      description: 'Direct review stars and comments for restaurants.',
      ddl: `CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) UNIQUE,
  customer_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      table: 'notifications',
      description: 'System notification logs dispatchable to SMS, Email, and Push targets.',
      ddl: `CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(30) NOT NULL, -- ORDER_STATUS, TRIAL_EXPIRY, SUBSCRIPTION_RENEW
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      table: 'delivery_partners',
      description: 'Stores rider statistics, verification documents, and live online toggles.',
      ddl: `CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  driving_license_number VARCHAR(50) UNIQUE NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  status VARCHAR(30) CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'SUSPENDED')) DEFAULT 'PENDING_APPROVAL',
  total_earnings_inr DECIMAL(10,2) DEFAULT 0.00,
  completed_deliveries INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_riders_online ON delivery_partners(is_online) WHERE status = 'APPROVED';`
    },
    {
      table: 'deliveries',
      description: 'Maps the specific rider-to-order workflow with distance metrics.',
      ddl: `CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
  rider_id UUID REFERENCES delivery_partners(id) ON DELETE RESTRICT,
  distance_km DECIMAL(4,2) NOT NULL,
  payout_amount DECIMAL(8,2) NOT NULL, -- Always equals delivery_fee
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(30) CHECK (status IN ('ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED')) DEFAULT 'ASSIGNED'
);`
    },
    {
      table: 'subscription_plans',
      description: 'Stores definition features and configurations of Basic, Pro, Advance levels.',
      ddl: `CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'sub_basic', 'sub_pro', 'sub_advance'
  name VARCHAR(50) NOT NULL,
  price_monthly_inr DECIMAL(8,2) NOT NULL,
  max_menu_items INT NOT NULL,
  features_array TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);`
    },
    {
      table: 'subscriptions',
      description: 'Actual billing histories and plan statuses of partners.',
      ddl: `CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) REFERENCES subscription_plans(id),
  status VARCHAR(30) CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELED', 'TRIALING')) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_subscriptions_expiry ON subscriptions(expires_at, status);`
    },
    {
      table: 'trial_records',
      description: 'Secures and locks a 30-day trial per restaurant using unique hardware and key parameters.',
      ddl: `CREATE TABLE trial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  phone_verification_token VARCHAR(100) UNIQUE NOT NULL, -- Strict device fingerprint or phone lock
  email_verification_token VARCHAR(100) UNIQUE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  extended_by_days INT DEFAULT 0,
  is_abuse_blocked BOOLEAN DEFAULT FALSE
);
CREATE UNIQUE INDEX idx_trial_phone_hash ON trial_records(phone_verification_token) WHERE is_abuse_blocked = FALSE;`
    },
    {
      table: 'promo_codes',
      description: 'Used for promotional campaigns, validating threshold requirements.',
      ddl: `CREATE TABLE promo_codes (
  code VARCHAR(50) PRIMARY KEY,
  discount_type VARCHAR(20) CHECK (discount_type IN ('PERCENTAGE', 'FIXED')) NOT NULL,
  discount_value DECIMAL(8,2) NOT NULL,
  min_order_value DECIMAL(8,2) NOT NULL,
  max_discount_inr DECIMAL(8,2),
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE
);`
    },
    {
      table: 'support_tickets',
      description: 'Urgent platform resolution issues for billing or customer routing problems.',
      ddl: `CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  user_id UUID REFERENCES users(id),
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(25) CHECK (status IN ('OPEN', 'RESOLVED')) DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      table: 'audit_logs',
      description: 'Inviolable compliance logging tracing sensitive configurations, access control attempts, and subscription shifts.',
      ddl: `CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES users(id),
  action_name VARCHAR(100) NOT NULL, -- e.g. 'PLAN_UPGRADE', 'TRIAL_EXTENDED', 'RIDER_SUSPENDED'
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  metadata JSONB, -- Record state changes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_log_actions ON audit_logs(action_name, created_at);`
    }
  ];

  const apis = [
    {
      section: 'Auth & Onboarding APIs',
      endpoints: [
        {
          method: 'POST',
          url: '/api/v1/auth/register',
          auth: 'None',
          desc: 'Creates new system user with Role selection (Customer, Restaurant Owner, Delivery Partner). Enforces secure email & phone verification requirements.',
          payload: `{
  "email": "owner@restaurant.com",
  "password": "SecurePassword123!",
  "phone": "+919876543210",
  "fullName": "Rajinder Singh",
  "role": "RESTAURANT_OWNER"
}`,
          response: `{
  "success": true,
  "message": "Verification OTP sent to +919876543210",
  "tempToken": "ey...temp_sign"
}`
        },
        {
          method: 'POST',
          url: '/api/v1/auth/verify-otp',
          auth: 'Temp OTP Token',
          desc: 'Verifies phone OTP to activate account. Prevents registry spoofing.',
          payload: `{
  "otp": "481023",
  "tempToken": "ey...temp_sign"
}`,
          response: `{
  "success": true,
  "jwtToken": "ey...auth_session_token",
  "user": {
    "id": "u_9482-10a",
    "email": "owner@restaurant.com",
    "role": "RESTAURANT_OWNER"
  }
}`
        }
      ]
    },
    {
      section: 'Customer Discovery & Ordering APIs',
      endpoints: [
        {
          method: 'GET',
          url: '/api/v1/customer/restaurants/nearby',
          auth: 'JWT (Role: CUSTOMER)',
          desc: 'Gets nearby approved active restaurants, with subscription plans sorting (Advance/Pro restaurants sorted higher). Geospatial radius bounding of 10km.',
          payload: '// Param: query coordinates & radius\n/api/v1/customer/restaurants/nearby?lat=12.9348&lng=77.6189',
          response: `{
  "success": true,
  "restaurants": [
    {
      "id": "rest_spice_garden",
      "name": "The Spice Garden",
      "subscriptionTier": "ADVANCED",
      "distanceKm": 1.2,
      "baseDeliveryFee": 30.00
    }
  ]
}`
        },
        {
          method: 'POST',
          url: '/api/v1/customer/orders/create',
          auth: 'JWT (Role: CUSTOMER)',
          desc: 'Instantiates a food order, calculates 100% transparent distance fees, checks menu items availability, and locks state to PLACED.',
          payload: `{
  "restaurantId": "rest_spice_garden",
  "items": [
    { "itemId": "m1", "quantity": 2, "customizations": [] }
  ],
  "addressId": "addr_9182",
  "paymentMethod": "UPI",
  "promoCode": "NIBZOFEST"
}`,
          response: `{
  "success": true,
  "orderId": "ord_88192-bc",
  "totalPriceINR": 640.00,
  "deliveryFee": 35.00,
  "deliveryToken": "4810" // Dropoff OTP
}`
        }
      ]
    },
    {
      section: 'Restaurant & Subscriptions APIs',
      endpoints: [
        {
          method: 'POST',
          url: '/api/v1/restaurant/trial/start',
          auth: 'JWT (Role: RESTAURANT_OWNER)',
          desc: 'Initiates 30-day Free Trial. Double-checks trial_records database to verify that the phone/email hash combination has never enjoyed a trial previously.',
          payload: `{
  "restaurantName": "Gourmet Kitchen",
  "address": "4th main Road, Indiranagar, Bengaluru",
  "latitude": 12.9716,
  "longitude": 77.5946
}`,
          response: `{
  "success": true,
  "trialRecord": {
    "startedAt": "2026-06-14T08:00:00Z",
    "expiresAt": "2026-07-14T08:00:00Z",
    "tier": "PRO"
  }
}`
        },
        {
          method: 'POST',
          url: '/api/v1/restaurant/billing/upgrade',
          auth: 'JWT (Role: RESTAURANT_OWNER)',
          desc: 'Triggers subscription upgrade. Interacts with billing webhook after settlement to adjust limits and issue premium flags.',
          payload: `{
  "planId": "sub_advance",
  "paymentMethod": "UPI"
}`,
          response: `{
  "success": true,
  "status": "ACTIVE",
  "expiresAt": "2026-07-14T08:00:00Z"
}`
        }
      ]
    }
  ];

  const filteredSchemas = databaseSchemas.filter(
    item => item.table.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white text-gray-900 rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      {/* Tab Navigation header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-gray-200 bg-[#FCFCFD] px-6 py-5 gap-4">
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-orange-600" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Nibzo Architecture Blueprint</h3>
            <p className="text-xs text-gray-500 mt-0.5">Production-grade specification ready for horizontal cluster expansion</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button 
            id="tab-btn-arch"
            onClick={() => setActiveTab('architecture')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'architecture' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'}`}
          >
            <CloudLightning className="inline h-4 w-4 mr-1.5" /> System Arch
          </button>
          <button 
            id="tab-btn-db"
            onClick={() => setActiveTab('database')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'database' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'}`}
          >
            <Database className="inline h-4 w-4 mr-1.5" /> Database ({databaseSchemas.length} Tables)
          </button>
          <button 
            id="tab-btn-api"
            onClick={() => setActiveTab('apis')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'apis' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'}`}
          >
            <Terminal className="inline h-4 w-4 mr-1.5" /> API Specs
          </button>
          <button 
            id="tab-btn-sec"
            onClick={() => setActiveTab('security')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'security' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'}`}
          >
            <ShieldCheck className="inline h-4 w-4 mr-1.5" /> Security Rules
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-8">
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-[#FCFCFD] p-6 rounded-xl border border-gray-200 relative shadow-inner">
              <div className="absolute top-6 right-6 bg-green-100 text-green-700 text-[10px] px-3 py-1 rounded-full font-mono border border-green-200 font-bold uppercase tracking-wider">
                100% Commission-Free
              </div>
              <h4 className="text-gray-900 font-bold text-xl">{sysArchitectureData.title}</h4>
              <p className="text-gray-600 text-sm mt-2 max-w-2xl">{sysArchitectureData.tagline}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                {sysArchitectureData.components.map((c, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-orange-300 transition-colors">
                    <h5 className="text-gray-900 font-bold text-sm flex items-center gap-3">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">{i+1}</span>
                      {c.title}
                    </h5>
                    <p className="text-gray-600 text-xs mt-3 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance KPIs and tech stacks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full blur-xl"></div>
                <div className="text-blue-600 font-mono text-2xl font-bold relative z-10">~ 40ms SLA</div>
                <div className="text-gray-900 font-bold text-xs mt-1.5 relative z-10">API Latency Limit</div>
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed relative z-10">Redis query bypass on active menus ensures rapid screen painting in heavy density environments.</p>
              </div>
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full blur-xl"></div>
                <div className="text-green-600 font-mono text-2xl font-bold relative z-10">100% Immutable</div>
                <div className="text-gray-900 font-bold text-xs mt-1.5 relative z-10">Financial Reconciliation</div>
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed relative z-10">System separates order volume from subscription logs; 100% of delivery fee flows to rider via UPI payout gateway.</p>
              </div>
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-50 rounded-full blur-xl"></div>
                <div className="text-orange-600 font-mono text-2xl font-bold relative z-10">Scale-to-Zero</div>
                <div className="text-gray-900 font-bold text-xs mt-1.5 relative z-10">Operational Cost Efficiency</div>
                <p className="text-gray-500 text-[11px] mt-2 leading-relaxed relative z-10">Docker microservice scaling logic drops execution environments automatically during quiet regional hours.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">PostgreSQL Relational Schema. Formatted with foreign relations, optimized constraints, and multi-column indexes.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter DDL structures..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition shadow-sm"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-5 pr-2">
              {filteredSchemas.map((schema, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                  <div className="bg-[#FCFCFD] px-5 py-3 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-orange-600" />
                      <span className="font-mono text-sm font-bold text-gray-900 tracking-tight">TABLE: {schema.table}</span>
                    </div>
                    <button 
                      id={`copy-ddl-${schema.table}`}
                      onClick={() => triggerCopy(schema.ddl, schema.table)}
                      className="text-gray-500 hover:text-gray-900 transition flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm"
                    >
                      {copiedText === schema.table ? (
                        <>
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{schema.description}</p>
                    <pre className="font-mono text-xs text-gray-800 leading-relaxed bg-[#FCFCFD] p-4 rounded-lg border border-gray-100 overflow-x-auto whitespace-pre font-medium shadow-inner">
                      {schema.ddl}
                    </pre>
                  </div>
                </div>
              ))}
              {filteredSchemas.length === 0 && (
                <div className="text-center py-16 bg-[#FCFCFD] rounded-xl border border-gray-200 text-gray-500 text-sm italic">
                  No tables match your filter "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'apis' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-3xl">
              API definitions optimized for REST design principles. Enforces granular JWT token roles, sanitizes structures, and isolates merchant analytics from core transactional traffic.
            </p>

            <div className="max-h-[500px] overflow-y-auto space-y-8 pr-2">
              {apis.map((group, gIdx) => (
                <div key={gIdx} className="space-y-4">
                  <h4 className="text-gray-900 font-bold text-sm tracking-widest uppercase border-l-4 border-orange-500 pl-3">
                    {group.section}
                  </h4>
                  
                  {group.endpoints.map((api, kIdx) => (
                    <div key={kIdx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                      {/* EndPoint Head */}
                      <div className="bg-[#FCFCFD] px-5 py-4 flex flex-wrap gap-3 items-center justify-between border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase ${
                            api.method === 'POST' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {api.method}
                          </span>
                          <span className="font-mono text-sm font-bold text-gray-900">{api.url}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-gray-500 font-mono tracking-wider bg-white px-2 py-1 border border-gray-200 rounded-md">Auth: <span className="font-bold text-gray-700">{api.auth}</span></span>
                        </div>
                      </div>

                      {/* EndPoint Body */}
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{api.desc}</p>
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-gray-500 block">Payload Schema:</span>
                            <pre className="font-mono text-xs text-gray-800 leading-relaxed bg-[#FCFCFD] p-4 rounded-lg border border-gray-100 overflow-x-auto whitespace-pre shadow-inner">
                              {api.payload}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-gray-500 block">Success Mock Response (200 OK):</span>
                            <pre className="font-mono text-xs text-green-800 leading-relaxed bg-green-50/50 p-4 rounded-lg border border-green-100 overflow-x-auto whitespace-pre shadow-inner font-medium">
                              {api.response}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#FCFCFD] p-6 rounded-xl border border-gray-200 shadow-inner">
              <h4 className="text-gray-900 font-bold text-lg flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-orange-600" />
                Enterprise Security Architecture Core
              </h4>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed max-w-3xl">
                Nibzo’s backend integrates strict zero-trust parameters to safeguard transactions, verify trial records without loophole creation, and control developer/staff scopes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
                    <Key className="h-5 w-5 text-blue-600" />
                    Strict Multi-Factor Registry Security
                  </div>
                  <p className="text-gray-600 text-xs mt-2.5 leading-relaxed">
                    OTP authentication relies on an encrypted token binding. A restaurant trial requires matching SMS verification via gateway hook BEFORE subscription is flagged active, validating phone device locks.
                  </p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
                    <Lock className="h-5 w-5 text-blue-600" />
                    SQL Injection & SSRF Protection
                  </div>
                  <p className="text-gray-600 text-xs mt-2.5 leading-relaxed">
                    Uses prepared SQL statements or fully typed ORMs (e.g. Drizzle/Prisma) with strict binding. Address geocoding requests validate parameters inside secure sandbox APIs before external routing.
                  </p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    Rate Limiting & Abuse Prevention
                  </div>
                  <p className="text-gray-600 text-xs mt-2.5 leading-relaxed">
                    Sliding window logs implemented via AWS WAF and Redis counters:
                    <br />• Auth Routes: Max 5 attempts/15 mins per IP.
                    <br />• Order Booking: Max 3 checkout attempts/min per user.
                  </p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Double Trial Evasion Lock
                  </div>
                  <p className="text-gray-600 text-xs mt-2.5 leading-relaxed">
                    Verification maps unique GSTIN hashes, verified phone number arrays, and merchant geographic boundaries. Multiple trial enrollments referencing equivalent elements are suspended automatically with alert flags sent to Admin.
                  </p>
                </div>
              </div>
            </div>

            {/* JWT Scope Verification Rule Code block snippet */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono uppercase font-bold tracking-widest text-gray-500 block">Typical MiddleWare Token Evaluation Code (Node/Express):</span>
              <pre className="font-mono text-xs text-gray-800 leading-relaxed bg-[#FCFCFD] p-5 rounded-xl border border-gray-200 overflow-x-auto whitespace-pre shadow-inner">
{`// Express Middleware matching permissions with JWT payloads
export const authenticateRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!allowedRoles.includes(decodedPayload.role)) {
        return res.status(403).json({ error: 'Permission denied for this role' });
      }
      req.user = decodedPayload; // Inject user details
      next();
    } catch {
      return res.status(403).json({ error: 'Stale or corrupted credential session' });
    }
  };
};`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
