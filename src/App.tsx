/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Terminal, 
  Cpu, 
  Database, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  ArrowUpRight, 
  Zap, 
  Compass, 
  Award,
  Globe, 
  ExternalLink, 
  Activity,
  Heart
} from 'lucide-react';
import BlueprintExplorer from './components/BlueprintExplorer';
import InteractiveSandbox from './components/InteractiveSandbox';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'simulator' | 'blueprints' | 'operations'>('simulator');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Dynamic Background Noise Accent */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-950/20 to-transparent pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Block Section */}
        <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-5xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/25">
              <Zap className="h-3.5 w-3.5 animate-pulse" /> Local Food. Delivered Better.
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
              Nibzo <span className="text-emerald-500 text-sm font-medium tracking-normal font-mono border-l border-slate-800 pl-3">v1.2.0 Launch Cockpit</span>
            </h1>
            <p className="text-slate-400 text-xs max-w-2xl">
              Zero-Commission. Fixed Subscription Pricing. Helping independent restaurants bypass legacy aggregator commission pools while compensating delivery riders 100% of delivery fees.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950/60 border border-slate-800 text-slate-300 text-4xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sandbox Database Connected
            </div>
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-4xs px-4 py-3 rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/20"
            >
              Export System Configs <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* Global Business Model KPI Banner */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/85">
            <span className="text-slate-500 text-5xs font-mono tracking-wider block uppercase">Platform Commission</span>
            <div className="font-mono text-lg font-bold mt-1 text-emerald-400">0% Absolute</div>
            <p className="text-5xs text-slate-400 mt-1">Restaurants pay zero percentage on orders. Flat subscriptive billing only.</p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/85">
            <span className="text-slate-500 text-5xs font-mono tracking-wider block uppercase">Free Trial Duration</span>
            <div className="font-mono text-lg font-bold mt-1 text-white">30 Days Pro</div>
            <p className="text-5xs text-slate-400 mt-1">One free trial per restaurant. Locked via hardware and phone tokens.</p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/85">
            <span className="text-slate-500 text-5xs font-mono tracking-wider block uppercase">Rider Payout Transfer</span>
            <div className="font-mono text-lg font-bold mt-1 text-white">100% of Delivery Fee</div>
            <p className="text-5xs text-slate-400 mt-1">Distance and base fees go directly to driver wallets. Zero platform take.</p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/85">
            <span className="text-slate-500 text-5xs font-mono tracking-wider block uppercase">Starting City</span>
            <div className="font-mono text-lg font-bold mt-1 text-white">Bengaluru (HSR/Kor)</div>
            <p className="text-5xs text-slate-400 mt-1">Tailored for a high-density, rich restaurant ecosystem start before nationwide scaling.</p>
          </div>
        </section>

        {/* Workspace Operations Selection Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl max-w-lg select-none">
          <button
            id="tab-btn-sim"
            onClick={() => setActiveWorkspaceTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeWorkspaceTab === 'simulator' 
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4" /> Interactive Core Simulator
          </button>
          
          <button
            id="tab-btn-blue"
            onClick={() => setActiveWorkspaceTab('blueprints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeWorkspaceTab === 'blueprints' 
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="h-4 w-4" /> DB Schema & APIs Specs
          </button>

          <button
            id="tab-btn-ops"
            onClick={() => setActiveWorkspaceTab('operations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeWorkspaceTab === 'operations' 
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" /> Launch Operations Guide
          </button>
        </div>

        {/* Workspace Active Segment Panel */}
        <main className="space-y-6">
          
          {/* A. PLATFORM USER JOURNEYS SIMULATOR */}
          {activeWorkspaceTab === 'simulator' && (
            <div className="space-y-6">
              <InteractiveSandbox />
            </div>
          )}

          {/* B. DETAILED BLUEPRINT CONFIG DATABASE & APIS EXPLORER */}
          {activeWorkspaceTab === 'blueprints' && (
            <BlueprintExplorer />
          )}

          {/* C. LAUNCH ROADMAP & OPERATIONAL ARCHITECTURE GUIDE */}
          {activeWorkspaceTab === 'operations' && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-8 space-y-8 shadow-xl">
              
              <div className="border-b border-slate-800 pb-5">
                <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-400" /> Operational Launch Manual: City-1 (Bengaluru)
                </h3>
                <p className="text-slate-400 text-xs mt-1.5">
                  Detailed strategic playbook defining technical infrastructure, regulatory compliance, payment paths, and scalable expansion scopes.
                </p>
              </div>

              {/* Three Column Roadmap Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Infrastructure Roadmap column */}
                <div className="bg-slate-900 border border-slate-800/70 p-5 rounded-xl space-y-4">
                  <div className="text-emerald-400 font-mono text-4xs font-bold uppercase tracking-wider">PHASE 1: TECHNICAL LAUNCH SETUP</div>
                  <h5 className="text-white font-bold text-sm">Google Cloud Production Deployment</h5>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Deploy native backends in clustered containers on **Google Cloud Run** to enjoy automated elastic horizontal expansion. Connect **Cloud SQL PostgreSQL** with high-availability master replicas for absolute durability. 
                  </p>
                  <ul className="text-4xs text-slate-300 space-y-2 pt-2 border-t border-slate-850">
                    <li>✓ **Geospatial GeoHashing**: Utilize PostGIS indexing for distance bounding calculations.</li>
                    <li>✓ **Cache Management**: Store merchant catalog menus inside Memorystore Redis for sub-5ms lookup performance.</li>
                    <li>✓ **Microservices Isolation**: Ensure billing engines run separated from order event streams to keep transactional loops bulletproof.</li>
                  </ul>
                </div>

                {/* 2. Zero Leak Payment settlements column */}
                <div className="bg-slate-900 border border-slate-800/70 p-5 rounded-xl space-y-4">
                  <div className="text-emerald-400 font-mono text-4xs font-bold uppercase tracking-wider">PHASE 2: SETTLEMENT SECURITY</div>
                  <h5 className="text-white font-bold text-sm">Automated Direct Payout Integrations</h5>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Integrate **Razorpay Route** or **PhonePe Business** APIs. Split and route delivery fees directly from checkouts to the rider’s UPI VPA instantaneously, completely bypassing platform bank accounts.
                  </p>
                  <ul className="text-4xs text-slate-300 space-y-2 pt-2 border-t border-slate-850">
                    <li>✓ **Rider Wallets**: Instant daily or per-trip UPI payouts to keep partners incentivized.</li>
                    <li>✓ **Subscription Auto-Billed**: Fixed monthly merchant collections handled strictly through automated e-mandates.</li>
                    <li>✓ **Reconciliation Logs**: Inviolable audit logs record transaction statuses for GST calculations.</li>
                  </ul>
                </div>

                {/* 3. Scalability expansion model column */}
                <div className="bg-slate-900 border border-slate-800/70 p-5 rounded-xl space-y-4">
                  <div className="text-emerald-400 font-mono text-4xs font-bold uppercase tracking-wider">PHASE 3: SUSTAINED EXPANSION</div>
                  <h5 className="text-white font-bold text-sm">Scaling Beyond the Initial Launch City</h5>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Move beyond the initial HSR-Koramangala sandbox by deploying regional node configurations. The zero-commission business model allows rapid marketing scaling due to restaurant direct support.
                  </p>
                  <ul className="text-4xs text-slate-300 space-y-2 pt-2 border-t border-slate-850">
                    <li>✓ **National Expansion**: Easily spin up secondary cities by entering coordinates in the general Admin dashboard.</li>
                    <li>✓ **Partner Program**: Restaurants invite neighboring stores, lowering acquisition costs (CAC) to zero.</li>
                    <li>✓ **Rider Co-ops**: Commission-free delivery fees ensure organic, consistent courier partner supplies.</li>
                  </ul>
                </div>

              </div>
              
              {/* Comprehensive visual summary footer notes */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between text-4xs text-slate-400 gap-4">
                <span>© 2026 Nibzo Technologies Pvt Ltd. All rights reserved. Zero Commission delivery solutions.</span>
                <span className="flex items-center gap-1.5">Created with care for local restaurants <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /></span>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
