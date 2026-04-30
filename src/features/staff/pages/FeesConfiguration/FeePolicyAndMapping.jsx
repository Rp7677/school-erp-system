import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  Scale, GitMerge, ChevronRight, 
  ShieldCheck, Sparkles, Command, Settings2, FileText
} from "lucide-react";

// Components
import CreateLateFeePolicy from "./PolicyAndMapping/CreateLateFeePolicy";
import CreateLateFeeMapping from "./PolicyAndMapping/CreateLateFeeMapping";

const FeePolicyAndMapping = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  // Updated default state to match your IDs
  const [activeTab, setActiveTab] = useState("LateFeePolicy");

  const menuItems = [
    { 
      id: "LateFeePolicy", 
      label: "Late Fee Policy", 
      sub: "Define Rules", 
      icon: Scale 
    },
    { 
      id: "LateFeeMapping", 
      label: "Late Fee Mapping", 
      sub: "Assign to Fees", 
      icon: GitMerge 
    },
  ];

  const renderManager = () => {
    switch (activeTab) {
      case "LateFeePolicy": return <CreateLateFeePolicy />;
      case "LateFeeMapping": return <CreateLateFeeMapping />;
      default: return <CreateLateFeePolicy />;
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
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 block">
                  Policy Framework
                </span>
                <h1 className="text-4xl font-black tracking-tight">
                  Late Fee <span className="text-primary italic">Engine</span>
                </h1>
              </div>
            </div>
          </div> */}

          {/* NAVIGATION TAB HUB */}
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


        {/* --- 3. MAIN CONTENT ARCHITECTURE --- */}
        <main>
          
          {/* Top Decorative highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Component Container */}
          <div>
            <div 
              key={activeTab} 
              className="animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-8 duration-700 ease-out"
            >
              <div className="min-h-[600px] w-full">
                {renderManager()}
              </div>
            </div>
          </div>
        </main>

        {/* --- 4. FOOTER --- */}
        <footer className="mt-10 px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-slate-500">
             <ShieldCheck size={16} className="text-primary/50" />
             <p className="text-[10px] font-bold uppercase tracking-widest">Auto-Audit Log Enabled</p>
          </div>
          <div className="flex items-center gap-1">
             <Sparkles size={12} className="text-yellow-500" />
             <p className="text-[10px] font-medium text-slate-400 tracking-[0.2em] uppercase">
               Regulatory Compliance Verified
             </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FeePolicyAndMapping;