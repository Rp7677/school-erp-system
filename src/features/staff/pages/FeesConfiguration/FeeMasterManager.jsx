import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  LayoutGrid, ListChecks, Landmark, Link2, Layers, 
  ChevronRight, ShieldCheck, Sparkles, Command
} from "lucide-react";

// Components
import FeesCategoryManager from "./Fees/FeesCategory";
import FeesHeadManager from "./Fees/FeesHead";
import BankAccount from "./Fees/BankAccount";
import FeesBankMapping from "./Fees/FeesBankMapping";
import FeeStructureType from "./Fees/FeeStructureType";

const FeeMasterManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const [activeTab, setActiveTab] = useState("FeesCategoryManager");

  const menuItems = [
    { id: "FeesCategoryManager", label: "Category", sub: "Setup Groups", icon: LayoutGrid },
    { id: "FeesHeadManager", label: "Fees Head", sub: "Define Types", icon: ListChecks },
    { id: "BankManager", label: "Banks", sub: "Accounts", icon: Landmark },
    { id: "FeeBankMapping", label: "Mapping", sub: "Linkage", icon: Link2 },
    { id: "FeeStructureTypeManager", label: "Structures", sub: "Config", icon: Layers },
  ];

  const renderManager = () => {
    switch (activeTab) {
      case "FeesCategoryManager": return <FeesCategoryManager />;
      case "FeesHeadManager": return <FeesHeadManager />;
      case "BankManager": return <BankAccount />;
      case "FeeBankMapping": return <FeesBankMapping />;
      case "FeeStructureTypeManager": return <FeeStructureType />;
      default: return <FeesCategoryManager />;
    }
  };

//   const renderManager = () => {
//     switch (activeTab) {
//       case "FeesCategoryManager":
//         return <FeesCategoryManager />;
//       case "FeesHeadManager":
//         return <Placeholder name="FeesHeadManager" />; // Replace with <FeesHeadManager />
//       case "BankManager":
//         return <Placeholder name="BankManager" />; // Replace with <BankManager />
//       case "FeeBankMapping":
//         return <Placeholder name="FeeBankMapping" />; // Replace with <FeeBankMapping />
//       case "FeeStructureTypeManager":
//         return <Placeholder name="FeeStructureTypeManager" />; // Replace with <FeeStructureTypeManager />
//       default:
//         return <FeesCategoryManager />;
//     }
//   };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark ? "text-slate-200" : "bg-[#F8FAFC] text-slate-900"
    }`}>
      
      {/* 1. ULTRA-MODERN HEADER */}
      <div>
      {/* <div className="max-w-[1600px] mx-auto px-5 py-5"> */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          {/* <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
                <Command size={14} />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                Finance Terminal v2.0
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Fee Master <span className="text-primary underline decoration-4 underline-offset-8">Control</span>
            </h1>
          </div> */}

          {/* Tab Navigation Hub */}
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

        {/* 2. MAIN WORKSPACE CONTAINER */}
        <main className="relative">
          {/* Breadcrumb / Sub-header */}
          {/* <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 bg-primary rounded-full`} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Module</p>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {menuItems.find(m => m.id === activeTab)?.label} Manager
                  <Sparkles size={14} className="text-yellow-500" />
                </h3>
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${
              isDark ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-green-50 border-green-100 text-green-600"
            }`}>
              • LIVE SYSTEM
            </div>
          </div> */}

          {/* CONTENT CARD: This is where your imported files render */}
          <div>
          {/* <div className={`min-h-[600px] w-full rounded-[2.5rem] border transition-all duration-700 ease-in-out overflow-hidden ${
            isDark 
            ? "bg-[#0F0F0F] border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]" 
            : "bg-white border-slate-200 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]"
          }`}> */}
            
            {/* Subtle Gradient Overlay */}
            <div/>
            {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" /> */}

            <div>
            {/* <div className="relative p-4 md:p-8 lg:p-10"> */}
              <div 
                key={activeTab} 
                className="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500"
              >
                {/* IMPORTANT: Ensure your child components (FeesCategoryManager, etc.) 
                   don't have rigid 'width: 100vw' or 'height: 100vh' styles. 
                   They should occupy 100% of this container.
                */}
                {renderManager()}
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer info */}
        <footer className="mt-8 flex justify-center">
           <p className="text-[10px] font-medium text-slate-500 tracking-[0.2em] uppercase">
             Secure Encryption Active • Session: Automated
           </p>
        </footer>
      </div>
    </div>
  );
};

export default FeeMasterManager;