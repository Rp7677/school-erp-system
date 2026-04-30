import React from "react";
import { useSelector } from "react-redux";
import { 
  Target, Activity, BookOpen, 
  Globe, Building2, Tag, 
  Fingerprint, ShieldCheck, AlertCircle,
  ArrowLeft, Layers, Landmark
} from "lucide-react";

const FeesHeadGuide = () => {
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4 py-8">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">Head Logic</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Financial Granularity • Setup Guide
          </p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black shadow-lg shadow-primary/30 hover:scale-105 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          RETURN TO MANAGER
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Logic & Scope */}
        <div className="lg:col-span-5 space-y-10">
          <Section icon={Target} title="The Hierarchy" highlight>
            <p className="text-sm leading-relaxed text-gray-500 font-bold uppercase tracking-wide">
              Fees Heads are the <span className="text-primary font-black underline decoration-2">Specific Line Items</span> that appear on a student's invoice.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className={`p-6 rounded-[1.5rem] border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-4 text-primary mb-2">
                  <Layers size={20} strokeWidth={3} />
                  <span className="text-xs font-black uppercase">Parent: Category</span>
                </div>
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">Broad group like "Academic Fees" or "Hostel".</p>
              </div>

              <div className="flex justify-center py-1">
                <div className="h-6 w-0.5 bg-primary/20" />
              </div>

              <div className={`p-6 rounded-[1.5rem] border-2 border-primary/20 ${isDark ? "bg-primary/5" : "bg-primary/[0.02]"}`}>
                <div className="flex items-center gap-4 text-primary mb-2">
                  <Tag size={20} strokeWidth={3} />
                  <span className="text-xs font-black uppercase text-primary">Child: Fees Head</span>
                </div>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed italic">The specific charge like "Tuition Fee", "Late Exam Entry", or "Laundry Charge".</p>
              </div>
            </div>
          </Section>

          <Section icon={Activity} title="Scope & Visibility">
            <div className="space-y-4">
              <div className={`flex items-start gap-5 p-5 rounded-3xl ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} transition-colors group`}>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Globe size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tighter">Global Visibility</h4>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed mt-1">Available across every campus in the organization. Ideal for standardized fees.</p>
                </div>
              </div>

              <div className={`flex items-start gap-5 p-5 rounded-3xl ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} transition-colors group`}>
                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tighter">Campus Specific</h4>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed mt-1">Only visible to the selected branch. Use for localized costs like local transport.</p>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Right: Operational Procedures */}
        <div className="lg:col-span-7">
          <Section icon={BookOpen} title="Setup Workflow">
            <div className="space-y-12 py-4">
              <div className="relative pl-12 border-l-2 border-primary/20">
                <div className="absolute -left-[13px] top-0 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-primary/10">1</div>
                <h4 className="font-black text-xl mb-2">Identify the Source</h4>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  Assign the head to a <span className="text-primary underline">Fee Category</span>. This ensures the income is directed to the correct accounting department.
                </p>
              </div>

              <div className="relative pl-12 border-l-2 border-primary/20">
                <div className="absolute -left-[13px] top-0 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-primary/10">2</div>
                <h4 className="font-black text-xl mb-2">Ledger Integration</h4>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  Enter the <span className="text-primary">Ledger Code</span> (e.g., Tally Alias). This is critical for automated financial synchronization between the ERP and Accounting software.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute -left-[13px] top-0 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black ring- ring-primary/10">3</div>
                <h4 className="font-black text-xl mb-2">The Code Rule</h4>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  Like Categories, Heads require a <span className="text-primary italic">Unique Code</span>. We suggest <code className="bg-primary/5 px-2 py-0.5 rounded font-black text-primary">HEAD_CAT_YR</code> format.
                </p>
              </div>
            </div>
          </Section>

          {/* Warning Card */}
          <div className={`mt-10 p-8 rounded-[2.5rem] border-4 border-dashed flex items-start gap-6 ${
            isDark ? "border-white/5 bg-red-500/5" : "border-gray-100 bg-red-500/[0.02]"
          }`}>
            <div className="p-4 bg-red-500 text-white rounded-[1.5rem] shadow-xl shadow-red-500/30 shrink-0">
              <Landmark size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black italic tracking-tighter text-red-500">Financial Integrity</h4>
              <p className="text-sm font-bold text-gray-500 leading-relaxed italic">
                "Once a Fees Head is linked to a transaction, deleting it is restricted. 
                If a head is no longer needed, use the <b>Status Toggle</b> to 'Inactive' to prevent future billing while maintaining historical data."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesHeadGuide;