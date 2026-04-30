import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  LayoutGrid, ListChecks, ChevronRight, 
  ShieldCheck, Sparkles, Command, CalendarClock, Settings2
} from "lucide-react";

// Components
import FeeStructure from "./StructureAndDueDate/FeeStructure";
import FeesStructureAndDueDate from "./StructureAndDueDate/FeesDueDates";

const FeeStructureManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  // Default to FeeStructure
  const [activeTab, setActiveTab] = useState("FeeStructure");

  const menuItems = [
    { id: "FeeStructure", label: "Fee Structure", sub: "Core Config", icon: LayoutGrid },
    { id: "FeesHeadManager", label: "Due Date Schedule", sub: "Timeline Setup", icon: CalendarClock },
  ];

  const renderManager = () => {
    switch (activeTab) {
      case "FeeStructure": return <FeeStructure />;
      case "FeesHeadManager": return <FeesStructureAndDueDate />;
      default: return <FeeStructure />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? "text-slate-200" : "bg-[#F8FAFC] text-slate-900"
    }`}>
      
      <div>
      {/* <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-8"> */}
        {/* --- 1. GLOBAL HEADER --- */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          {/* <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Settings2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 block">
                  Configuration Suite
                </span>
                <h1 className="text-4xl font-black tracking-tight">
                  Fee <span className="text-primary italic">Architecture</span>
                </h1>
              </div>
            </div>
          </div> */}

          {/* HIGH-END SEGMENTED TAB NAVIGATION */}
          <nav className={`flex p-1 rounded-xl border backdrop-blur-md ${
              isDark ? "bg-[#0A0A0B]/80 border-white/5" : "bg-white/80 border-gray-200 shadow-sm"
            }`}>
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                      ? "bg-primary text-white shadow-sm" 
                      : "hover:bg-primary/5 text-gray-500 hover:text-primary"
                    }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold uppercase tracking-tight leading-none">
                        {item.label}
                      </p>
                      {/* Subtext is now optional/tiny to save space */}
                      <p className={`text-[9px] mt-0.5 font-medium ${isActive ? "text-white/70" : "text-gray-400"}`}>
                        {item.sub}
                      </p>
                    </div>
                    
                    {/* Subtle Indicator bar for active tab */}
                    {isActive && (
                      <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_#FBCB84]" />
                    )}
                  </button>
                );
              })}
            </nav>
        </header>

        {/* --- 2. WORKSPACE BREADCRUMBS --- */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <Command size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System</span>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {activeTab === "FeeStructure" ? "Structure Configuration" : "Date Scheduling"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Database Connected</span>
          </div>
        </div>

        {/* --- 3. MAIN CONTENT ARCHITECTURE --- */}
        <main>
          
          {/* Top Decorative bar */}
          {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-primary/20 rounded-b-full" /> */}

          {/* Module Inner Padding */}
          <div>
            <div 
              key={activeTab} 
              className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
            >
              {/* This container ensures the imported components display properly */}
              <div className="min-h-[500px] w-full">
                {renderManager()}
              </div>
            </div>
          </div>
        </main>

        {/* --- 4. FOOTER STATUS --- */}
        <footer className="mt-10 px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-slate-500">
             <ShieldCheck size={16} />
             <p className="text-[10px] font-bold uppercase tracking-widest">Compliance Mode Enabled</p>
          </div>
          <p className="text-[10px] font-medium text-slate-400 tracking-[0.2em] uppercase">
            Built for High-Precision Financial Management
          </p>
        </footer>
      </div>
    </div>
  );
};

export default FeeStructureManager;