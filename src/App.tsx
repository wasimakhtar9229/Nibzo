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
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  MonitorSmartphone,
  LineChart,
  Settings
} from 'lucide-react';
import BlueprintExplorer from './components/BlueprintExplorer';
import InteractiveSandbox from './components/InteractiveSandbox';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'simulator' | 'blueprints' | 'operations'>('simulator');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => {
    const isActive = activeWorkspaceTab === id;
    
    return (
      <button
        onClick={() => {
          setActiveWorkspaceTab(id as any);
          setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100/50' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:ring-1 hover:ring-slate-100'
        }`}
      >
        <Icon className={`h-4 w-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-teal-500/20 selection:text-teal-700 flex">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white flex flex-col border-r border-slate-200 transition-transform duration-300 ease-spring ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/60 shrink-0">
          <div className="flex items-center gap-2.5 text-slate-900">
             <div className="bg-teal-700 p-1.5 rounded-lg shadow-sm">
                <Compass className="h-4 w-4 text-white" />
             </div>
             <span className="font-bold tracking-tight text-[17px] mt-0.5">NIBZO</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-1">
            <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Platform</h4>
            <NavItem id="simulator" label="Interactive Sandbox" icon={MonitorSmartphone} />
            <NavItem id="blueprints" label="DB & APIs Specs" icon={Database} />
            <NavItem id="operations" label="Launch Operations" icon={Layers} />
          </div>
        </div>

        {/* Sidebar Footer User Area */}
        <div className="p-4 border-t border-slate-200/60 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-xs border border-teal-200/50">
              WA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 leading-tight">Workspace Admin</span>
              <span className="text-xs text-slate-500">wasim1n1ly4s@gmail.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:hidden shrink-0 sticky top-0 z-30">
          <button 
            className="text-slate-500 hover:text-slate-700 p-1 -ml-1 mr-3"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-slate-900 tracking-tight text-[15px]">NIBZO</span>
        </div>

        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header Block Section */}
          <header className="flex flex-col md:flex-row md:items-start justify-between pb-6 border-b border-slate-200 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 font-medium text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                <Zap className="h-3.5 w-3.5 text-teal-600" /> Platform Cockpit
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Restaurant Reputation &amp; Customer Engagement
              </h1>
              <p className="text-slate-500 text-[15px] max-w-2xl leading-relaxed">
                Empowering hospitality businesses with comprehensive sentiment analysis, loyalty loop engineering, and real-time operations dashboards. Zero commissions. Subscription based.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="bg-white border border-slate-200 text-slate-700 text-[13px] font-medium px-4 py-2.5 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Production DB Synced
              </div>
            </div>
          </header>

          {/* Global Business Model KPI Banner */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                 <LineChart className="h-5 w-5 text-teal-600" />
              </div>
              <span className="text-slate-500 text-[11px] font-bold tracking-wider uppercase">Reputation Loop</span>
              <div className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">Automated</div>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">Turn feedback into public 5-star reviews and private constructive criticism.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                 <MonitorSmartphone className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-slate-500 text-[11px] font-bold tracking-wider uppercase">Digital Experience</span>
              <div className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">QR Driven</div>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">Customers access digital menus, feedback forms, and loyalty rewards instantly.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                 <Heart className="h-5 w-5 text-teal-600" />
              </div>
              <span className="text-slate-500 text-[11px] font-bold tracking-wider uppercase">SaaS Pricing</span>
              <div className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">Fixed Tier</div>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">Predictable monthly pricing for merchants. No hidden fees or hardware costs.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                 <Compass className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-slate-500 text-[11px] font-bold tracking-wider uppercase">Initial Launch</span>
              <div className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">Global Beta</div>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">Scaling seamlessly across diverse hospitality networks and chains.</p>
            </div>
          </section>

          {/* Workspace Active Segment Panel */}
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* A. PLATFORM USER JOURNEYS SIMULATOR */}
            {activeWorkspaceTab === 'simulator' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <InteractiveSandbox />
              </div>
            )}

            {/* B. DETAILED BLUEPRINT CONFIG DATABASE & APIS EXPLORER */}
            {activeWorkspaceTab === 'blueprints' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <BlueprintExplorer />
              </div>
            )}

            {/* C. LAUNCH ROADMAP & OPERATIONAL ARCHITECTURE GUIDE */}
            {activeWorkspaceTab === 'operations' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-8 shadow-sm flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-slate-900 font-bold text-xl flex items-center gap-2">
                    <Cpu className="h-6 w-6 text-teal-600" /> Operational Launch Details
                  </h3>
                  <p className="text-slate-500 text-[15px] mt-2 max-w-3xl">
                    Comprehensive strategic playbook defining technical infrastructure, regulatory compliance, payment routes, and scalable product modules.
                  </p>
                </div>

                {/* Three Column Roadmap Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* 1. Infrastructure Roadmap column */}
                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl space-y-4 hover:border-slate-300 transition-colors">
                    <div className="inline-flex items-center gap-1.5 bg-teal-100/50 text-teal-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                      Phase 1
                    </div>
                    <h5 className="text-slate-900 font-bold text-[15px]">Cloud Deployment Edge</h5>
                    <p className="text-slate-600 text-[13px] leading-relaxed">
                      Deploy native backends in clustered containers on edge networks. Connect PostgreSQL with high-availability read replicas.
                    </p>
                    <ul className="text-[13px] text-slate-600 space-y-3 pt-3 border-t border-slate-200/60">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                        <span><strong>Real-time Analytics</strong>: Harness rapid data indexing for metric aggregations.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                        <span><strong>Cache Layer</strong>: Store reputation catalogs in memory caches for sub-10ms UX.</span>
                      </li>
                    </ul>
                  </div>

                  {/* 2. Zero Leak Payment settlements column */}
                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl space-y-4 hover:border-slate-300 transition-colors">
                    <div className="inline-flex items-center gap-1.5 bg-orange-100/50 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                      Phase 2
                    </div>
                    <h5 className="text-slate-900 font-bold text-[15px]">Frictionless Subscriptions</h5>
                    <p className="text-slate-600 text-[13px] leading-relaxed">
                      Integrate standard billing APIs (Stripe). Automatically route subscription fees effortlessly from connected restaurants.
                    </p>
                    <ul className="text-[13px] text-slate-600 space-y-3 pt-3 border-t border-slate-200/60">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                        <span><strong>Direct Value</strong>: Seamless checkouts bypassing heavy percentage commissions.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                        <span><strong>Auto-Billing</strong>: Fixed monthly and yearly collections handled via secure mandate protocols.</span>
                      </li>
                    </ul>
                  </div>

                  {/* 3. Scalability expansion model column */}
                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl space-y-4 hover:border-slate-300 transition-colors">
                    <div className="inline-flex items-center gap-1.5 bg-blue-100/50 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                      Phase 3
                    </div>
                    <h5 className="text-slate-900 font-bold text-[15px]">Viral Aggregation Model</h5>
                    <p className="text-slate-600 text-[13px] leading-relaxed">
                      Move beyond the core initial test bed into a full scale platform network driven by restaurant self-onboarding and referrals.
                    </p>
                    <ul className="text-[13px] text-slate-600 space-y-3 pt-3 border-t border-slate-200/60">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                        <span><strong>Platform Plugs</strong>: Easily spin up secondary modular features instantly.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                        <span><strong>B2B Networks</strong>: High value B2B partner programs lowering system CAC.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 text-center text-[13px] text-slate-500 flex flex-col md:flex-row justify-center items-center gap-2 pt-6 border-t border-slate-200/60">
                  <span>© 2026 NIBZO SaaS. All rights reserved.</span>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1">Crafted for perfection</span>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}

