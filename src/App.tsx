/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  Zap, 
  Compass, 
  Heart,
  CheckCircle
} from 'lucide-react';
import BlueprintExplorer from './components/BlueprintExplorer';
import InteractiveSandbox from './components/InteractiveSandbox';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'simulator' | 'blueprints' | 'operations'>('simulator');

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-gray-800 font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
      
      {/* Background Accent */}
      <div className="absolute top-0 w-full h-[40vh] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Header Block Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-6">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <Zap className="h-3.5 w-3.5" /> Local Food. Delivered Better.
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              Nibzo 
              <span className="text-gray-400 text-lg sm:text-2xl font-light tracking-tight sm:border-l sm:border-gray-300 sm:pl-4">Launch Cockpit</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              Zero-Commission. Fixed Subscription Pricing. Helping independent restaurants bypass legacy aggregator commission pools while compensating delivery riders 100% of delivery fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sandbox DB Connected
            </div>
          </div>
        </header>

        {/* Global Business Model KPI Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-500 text-xs font-semibold tracking-wide uppercase">Platform Commission</span>
            <div className="text-2xl font-bold mt-1 text-emerald-600">0% Absolute</div>
            <p className="text-xs text-gray-500 mt-2">Restaurants pay zero percentage on orders. Flat subscriptive billing only.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-500 text-xs font-semibold tracking-wide uppercase">Free Trial Duration</span>
            <div className="text-2xl font-bold mt-1 text-gray-900">30 Days Pro</div>
            <p className="text-xs text-gray-500 mt-2">One free trial per restaurant. Locked via hardware and phone tokens.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-500 text-xs font-semibold tracking-wide uppercase">Rider Payout Transfer</span>
            <div className="text-2xl font-bold mt-1 text-gray-900">100% of Fee</div>
            <p className="text-xs text-gray-500 mt-2">Distance and base fees go directly to driver wallets. Zero platform take.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-gray-500 text-xs font-semibold tracking-wide uppercase">Starting City</span>
            <div className="text-2xl font-bold mt-1 text-gray-900">Bengaluru</div>
            <p className="text-xs text-gray-500 mt-2">Tailored for a high-density, rich restaurant ecosystem start before scaling.</p>
          </div>
        </section>

        {/* Workspace Operations Selection Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
          <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-xl shrink-0 shadow-sm">
            <button
              onClick={() => setActiveWorkspaceTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeWorkspaceTab === 'simulator' 
                  ? 'bg-gray-900 text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'
              }`}
            >
              <Compass className="h-4 w-4" /> Interactive Simulator
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('blueprints')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeWorkspaceTab === 'blueprints' 
                  ? 'bg-gray-900 text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'
              }`}
            >
              <Database className="h-4 w-4" /> DB & APIs Specs
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('operations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeWorkspaceTab === 'operations' 
                  ? 'bg-gray-900 text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-[#FCFCFD]'
              }`}
            >
              <Layers className="h-4 w-4" /> Launch Operations
            </button>
          </div>
        </div>

        {/* Workspace Active Segment Panel */}
        <main className="space-y-6">
          
          {/* A. PLATFORM USER JOURNEYS SIMULATOR */}
          {activeWorkspaceTab === 'simulator' && (
            <div className="animate-fade-in">
              <InteractiveSandbox />
            </div>
          )}

          {/* B. DETAILED BLUEPRINT CONFIG DATABASE & APIS EXPLORER */}
          {activeWorkspaceTab === 'blueprints' && (
            <div className="animate-fade-in bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <BlueprintExplorer />
            </div>
          )}

          {/* C. LAUNCH ROADMAP & OPERATIONAL ARCHITECTURE GUIDE */}
          {activeWorkspaceTab === 'operations' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-10 space-y-8 shadow-sm text-gray-800 animate-fade-in">
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-gray-900 font-bold text-xl flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-600" /> Operational Launch Manual: City-1 (Bengaluru)
                </h3>
                <p className="text-gray-500 text-sm mt-2 max-w-3xl">
                  Detailed strategic playbook defining technical infrastructure, regulatory compliance, payment paths, and scalable expansion scopes.
                </p>
              </div>

              {/* Three Column Roadmap Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Infrastructure Roadmap column */}
                <div className="bg-[#FCFCFD] border border-gray-200 p-6 rounded-xl space-y-4">
                  <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Phase 1: Setup</div>
                  <h5 className="text-gray-900 font-bold">Google Cloud Production Deployment</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Deploy native backends in clustered containers on Google Cloud Run to enjoy automated elastic horizontal expansion. Connect Cloud SQL PostgreSQL with high-availability master replicas. 
                  </p>
                  <ul className="text-sm text-gray-600 space-y-3 pt-3 border-t border-gray-200">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Geospatial GeoHashing</strong>: Utilize PostGIS indexing for distance bounding calculations.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Cache Management</strong>: Store merchant catalogs inside Memorystore Redis for sub-5ms lookups.</span>
                    </li>
                  </ul>
                </div>

                {/* 2. Zero Leak Payment settlements column */}
                <div className="bg-[#FCFCFD] border border-gray-200 p-6 rounded-xl space-y-4">
                  <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Phase 2: Settlements</div>
                  <h5 className="text-gray-900 font-bold">Automated Direct Payouts</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Integrate Razorpay Route or PhonePe APIs. Split and route delivery fees directly from checkouts to the rider’s UPI VPA instantaneously.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-3 pt-3 border-t border-gray-200">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Rider Wallets</strong>: Instant daily or per-trip UPI payouts to keep partners incentivized.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Auto-Billing</strong>: Fixed monthly merchant collections handled via e-mandates.</span>
                    </li>
                  </ul>
                </div>

                {/* 3. Scalability expansion model column */}
                <div className="bg-[#FCFCFD] border border-gray-200 p-6 rounded-xl space-y-4">
                  <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Phase 3: Expansion</div>
                  <h5 className="text-gray-900 font-bold">Scaling Beyond Initial City</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Move beyond the initial HSR-Koramangala sandbox by deploying regional node configurations. The zero-commission business model allows rapid marketing scaling due to restaurant direct support.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-3 pt-3 border-t border-gray-200">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>National Expansion</strong>: Easily spin up secondary cities by entering coordinates.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Partner Program</strong>: Restaurants invite neighboring stores, lowering CAC.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-center items-center gap-2 pt-6 border-t border-gray-200">
                <span>© 2026 Nibzo Technologies. Zero Commission delivery solutions.</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">Created with care <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for local restaurants</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
