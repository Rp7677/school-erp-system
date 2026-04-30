import React from "react";
import { useSelector } from "react-redux";
import { 
  BookOpen, Target, Activity, 
  CheckCircle2, AlertCircle, 
  Search, Edit3, Plus,
  GraduationCap, Bus, Home, Coffee, Wallet,
  ArrowLeft
} from "lucide-react";

const FeesCategoryGuide = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  const Section = ({ icon: Icon, title, children, highlight = false }) => (
    <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${
      isDark 
        ? "bg-[#1A1A1A] border-white/5 shadow-black/40" 
        : "bg-white border-gray-100 shadow-gray-200/50"
    } ${highlight ? "border-t-4 border-t-primary" : ""}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl ${isDark ? "bg-white/5 text-primary" : "bg-primary/10 text-primary"}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div>
    {/* <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-12 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}> */}
      {/* Header - Matching Manager Style */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter italic">Guide Center</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Operational Documentation • Version 1.0
          </p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black shadow-lg shadow-primary/30 hover:scale-105 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          BACK TO MANAGER
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Core Logic & Icons */}
        <div className="lg:col-span-5 space-y-10">
          <Section icon={Target} title="Financial Anchors" highlight>
            <p className="text-sm leading-relaxed text-gray-500 font-bold uppercase tracking-wide">
              Categories act as the <span className="text-primary font-black">Primary Ledger</span> for all student transactions.
            </p>
            <div className="mt-8 space-y-4">
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">Unique Code Policy</h4>
                    <p className="text-[11px] text-gray-500 font-bold mt-1 leading-relaxed">System-wide uniqueness prevents duplicate billing errors.</p>
                  </div>
                </div>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">Global Status Switch</h4>
                    <p className="text-[11px] text-gray-500 font-bold mt-1 leading-relaxed">Disabling a category preserves history but halts future usage.</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section icon={Activity} title="Visual Intelligence">
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-6">Auto-assigned iconography based on Code keywords:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { i: GraduationCap, l: "TUT / EDU", d: "Academic" },
                { i: Bus, l: "TRA / BUS", d: "Transport" },
                { i: Home, l: "HOS / ROOM", d: "Boarding" },
                { i: Coffee, l: "MES / CAF", d: "Catering" },
                { i: Wallet, l: "OTHER", d: "General" },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl flex items-center gap-4 border ${isDark ? "bg-[#242424] border-white/5" : "bg-white border-gray-100"}`}>
                  <div className="p-2 bg-primary/10 rounded-xl text-primary"><item.i size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black tracking-tighter">{item.l}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Right Column: Steps */}
        <div className="lg:col-span-7">
          <Section icon={BookOpen} title="Standard Procedures">
            <div className="space-y-12 py-4">
              <div className="relative pl-12 border-l-2 border-primary/20">
                <div className="absolute -left-[13px] top-0 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-primary/10">1</div>
                <h4 className="font-black text-xl mb-2">Category Creation</h4>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  Enter a descriptive name. Codes should be <span className="text-primary underline">SNAKE_CASE</span> (e.g., <code className="bg-primary/5 px-2 rounded font-black italic text-primary">TUT_FEE_2026</code>).
                </p>
              </div>

              <div className="relative pl-12 border-l-2 border-primary/20">
                <div className="absolute -left-[13px] top-0 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-primary/10">2</div>
                <h4 className="font-black text-xl mb-2">Modification Flow</h4>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  Click the <Edit3 size={16} className="inline mx-1 text-primary"/> icon to load the category into the Editor. Updates apply instantly across all financial modules.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute -left-[13px] top-0 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-primary/10">3</div>
                <h4 className="font-black text-xl mb-2">Discovery & Search</h4>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  Use the <Search size={16} className="inline mx-1 text-primary"/> live filter to isolate categories. Filters work by combining keywords and status states.
                </p>
              </div>
            </div>
          </Section>

          {/* Tips Footer Section */}
          <div className={`mt-10 p-8 rounded-[2.5rem] border-4 border-dashed flex items-start gap-6 ${
            isDark ? "border-white/5 bg-primary/5" : "border-gray-100 bg-primary/[0.02]"
          }`}>
            <div className="p-4 bg-primary text-white rounded-[1.5rem] shadow-xl shadow-primary/30 shrink-0">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black italic tracking-tighter text-primary">Admin Warning</h4>
              <p className="text-sm font-bold text-gray-500 leading-relaxed italic">
                "Ensure no 'Pending' invoices are linked to a category before disabling it. 
                System safeguards will prevent new bills, but existing collections must be settled manually."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesCategoryGuide;