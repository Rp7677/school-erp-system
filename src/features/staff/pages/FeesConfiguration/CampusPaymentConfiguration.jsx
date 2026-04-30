import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import { 
  Settings, School, CreditCard, Zap, ShieldCheck, Loader2, 
  ChevronDown, Save, Globe, Cpu, Info, ShieldAlert, 
  Fingerprint, Activity
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const CampusPaymentConfig = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  // --- STATE ---
  const [loading, setLoading] = useState({ submitting: false });
  const [formData, setFormData] = useState({
    campusId: "",
    paymentMode: "NACH",
    gatewayProvider: "",
    autoDebitEnabled: false
  });
  const [confirmModal, setConfirmModal] = useState({ show: false });

  // --- STYLES ---
  const theme = {
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200 shadow-xl",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
  };

  const cardClass = `rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${theme.panel}`;
  const inputClass = `w-full h-14 px-6 rounded-2xl border outline-none font-bold text-sm transition-all appearance-none ${theme.input} focus:border-primary focus:ring-4 focus:ring-primary/10`;

  // --- ACTIONS ---
  const handleTriggerSubmit = (e) => {
    e.preventDefault();
    if (!formData.campusId) return toast.error("Select Campus Authority");
    setConfirmModal({ show: true });
  };

  const executeAction = async () => {
    setConfirmModal({ show: false });
    setLoading(prev => ({ ...prev, submitting: true }));
    
    try {
      const payload = {
        ...formData,
        gatewayProvider: formData.paymentMode === "NACH" ? null : formData.gatewayProvider
      };
      await api.post("/api/admin/campus-payment-config", payload);
      toast.success("Protocol Updated Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation Interrupted");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className={`min-h-screen p-6 lg:p-10 max-w-[800px] mx-auto space-y-8 ${isDark ? "text-gray-100" : "text-slate-800"}`}>
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-[2.5rem] border p-10 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Security Protocol</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Authorization Required</p>
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-10 opacity-70">
              Are you sure you want to push this <span className="text-primary font-black">Gateway Configuration</span>? This will immediately override checkout logic for the selected campus.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] border border-white/10 hover:bg-white/5 transition-colors">Abort</button>
              <button onClick={executeAction} className="flex-1 h-14 rounded-2xl text-white font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform">Confirm Push</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary rounded-[1.8rem] shadow-2xl shadow-primary/30 text-white transform">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-4xl lg:text-3xl font-black tracking-tighter uppercase italic">
              Payment <span className="text-primary not-italic">Bridge</span>
            </h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Middleware Config</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONFIGURATION FORM --- */}
      <div className={cardClass}>
        <div className="p-8 border-b border-white/5 bg-primary/5">
          <h2 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
            <Activity size={18} className="text-primary" /> Configuration Terminal
          </h2>
        </div>
        <form onSubmit={handleTriggerSubmit} className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 flex items-center gap-2">
              <School size={14}/> Campus Authority
            </label>
            <div className="relative">
              <select className={inputClass} value={formData.campusId} onChange={(e) => setFormData({...formData, campusId: e.target.value})} required>
                <option value="">Select Campus...</option>
                {campuses?.map(c => <option key={c.campusId} value={c.campusId}>{c.campusName}</option>)}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 flex items-center gap-2">
                <CreditCard size={14}/> Protocol Mode
              </label>
              <div className="relative">
                <select className={inputClass} value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value, gatewayProvider: e.target.value === 'NACH' ? "" : formData.gatewayProvider})}>
                  <option value="NACH">NACH Only</option>
                  <option value="GATEWAY">Gateway Only</option>
                  <option value="BOTH">Hybrid (Both)</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
              </div>
            </div>

            <div className={`space-y-2 transition-opacity ${formData.paymentMode === 'NACH' ? 'opacity-20' : 'opacity-100'}`}>
              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 flex items-center gap-2">
                <Globe size={14}/> Aggregator
              </label>
              <div className="relative">
                <select className={inputClass} disabled={formData.paymentMode === 'NACH'} value={formData.gatewayProvider} onChange={(e) => setFormData({...formData, gatewayProvider: e.target.value})} required={formData.paymentMode !== 'NACH'}>
                  <option value="">Select Provider...</option>
                  <option value="CASHFREE">Cashfree Payments</option>
                  <option value="RAZORPAY">Razorpay Alpha</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Auto Debit Toggle */}
          <div className={`p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${formData.autoDebitEnabled ? "border-primary bg-primary/5" : "border-white/5"}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.autoDebitEnabled ? "bg-primary text-white" : "bg-gray-500/20 text-gray-500"}`}>
                <Zap size={20} className={formData.autoDebitEnabled ? "animate-pulse" : ""} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase">Auto-Debit</p>
                <p className="text-[8px] font-bold opacity-40 uppercase">Recurring Collection</p>
              </div>
            </div>
            <button type="button" onClick={() => setFormData({...formData, autoDebitEnabled: !formData.autoDebitEnabled})} className={`w-14 h-7 rounded-full p-1 transition-colors ${formData.autoDebitEnabled ? "bg-primary" : "bg-gray-600"}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.autoDebitEnabled ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>

          <button type="submit" disabled={loading.submitting} className="w-full h-16 bg-primary text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50">
            {loading.submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} Push Configuration
          </button>
        </form>
      </div>

      {/* --- INFO TERMINAL --- */}
      <div className={`${cardClass} p-8 border-l-8 border-primary`}>
        <div className="flex items-center gap-4 mb-4 text-primary">
          <Info size={24} />
          <h4 className="font-black uppercase text-xs italic">System Intelligence</h4>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-40 italic">Logic Layer</p>
            <p className="text-xs font-medium leading-relaxed">
              Hybrid mode enables both <span className="text-primary font-black">NACH (Manual)</span> and <span className="text-primary font-black">Instant Gateway</span> options for the parents. Ensure the provider is onboarded before deployment.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
            <ShieldCheck size={16} className="text-primary" />
            <p className="text-[9px] font-bold text-primary uppercase">AES-256 Validated Encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusPaymentConfig;