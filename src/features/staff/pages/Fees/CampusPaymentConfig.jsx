import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import { 
  Settings, 
  School, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  Loader2, 
  ChevronDown, 
  Save,
  Globe,
  Cpu
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const CampusPaymentConfig = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  // State for Form
  const [formData, setFormData] = useState({
    campusId: "",
    paymentMode: "NACH",
    gatewayProvider: "",
    autoDebitEnabled: false
  });

  // State for Campuses
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState({
    initial: true,
    submitting: false
  });

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    try {
      const res = await api.get("/api/campuses");
      setCampuses(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch campus directory");
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.campusId) return toast.error("Please select a Campus");

    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      // Cleanup: if mode is NACH, provider must be null
      const payload = {
        ...formData,
        gatewayProvider: formData.paymentMode === "NACH" ? null : formData.gatewayProvider
      };

      const res = await api.post("/api/admin/campus-payment-config", payload);
      toast.success(`Configuration Updated for Campus ID: ${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation Failed");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // Brutalist Styles
  const glassPanel = `rounded-[2.5rem] border shadow-2xl backdrop-blur-md transition-all duration-500 ${
    isDark ? "bg-[#121212]/90 border-white/10" : "bg-white/95 border-gray-100"
  }`;

  const labelStyle = `text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 mb-3 ${
    isDark ? "text-gray-500" : "text-gray-400"
  }`;

  const selectStyle = `w-full appearance-none px-6 py-5 rounded-2xl border outline-none font-bold text-[14px] transition-all duration-300 cursor-pointer relative z-20 
    ${isDark 
      ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary focus:ring-4 focus:ring-primary/10" 
      : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5"
    } disabled:opacity-30 disabled:cursor-not-allowed`;

  if (loading.initial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-primary" size={60} strokeWidth={1.5} />
        <p className="font-black text-[10px] uppercase tracking-[0.5em] text-primary">Loading Protocol...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:p-10 max-w-[1200px] space-y-10 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-[1.5rem] bg-primary shadow-xl shadow-primary/30 text-white transform rotate-3">
              <Settings size={32} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Payment <span className="text-primary not-italic">Gateway Config</span>
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <span className="w-10 h-[2px] bg-primary rounded-full" />
            Global Transaction Middleware
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Configuration Card */}
        <div className={glassPanel}>
          <div className="p-8 lg:p-12 space-y-10">
            
            {/* Campus Selection */}
            <div className="relative group">
              <label className={labelStyle}><School size={14}/> Select Campus Authority</label>
              <div className="relative">
                <select 
                  className={selectStyle}
                  value={formData.campusId}
                  onChange={(e) => setFormData({...formData, campusId: e.target.value})}
                  required
                >
                  <option value="">Choose a campus...</option>
                  {campuses.map(campus => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name} — {campus.city} ({campus.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Payment Mode */}
              <div className="relative group">
                <label className={labelStyle}><CreditCard size={14}/> Preferred Payment Mode</label>
                <div className="relative">
                  <select 
                    className={selectStyle}
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({...formData, paymentMode: e.target.value, gatewayProvider: e.target.value === 'NACH' ? "" : formData.gatewayProvider})}
                  >
                    <option value="NACH">NACH Only</option>
                    <option value="GATEWAY">Gateway Only</option>
                    <option value="BOTH">Hybrid (Both)</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={20} />
                </div>
              </div>

              {/* Gateway Provider */}
              <div className="relative group">
                <label className={`${labelStyle} ${formData.paymentMode === 'NACH' ? 'opacity-20' : ''}`}>
                  <Globe size={14}/> Gateway Provider
                </label>
                <div className="relative">
                  <select 
                    className={selectStyle}
                    disabled={formData.paymentMode === "NACH"}
                    value={formData.gatewayProvider}
                    onChange={(e) => setFormData({...formData, gatewayProvider: e.target.value})}
                    required={formData.paymentMode !== "NACH"}
                  >
                    <option value="">Select Provider</option>
                    <option value="CASHFREE">Cashfree Payments</option>
                    <option value="RAZORPAY">Razorpay Alpha</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={20} />
                </div>
              </div>
            </div>

            {/* Auto Debit Toggle */}
            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between ${
              formData.autoDebitEnabled 
                ? "border-primary bg-primary/5" 
                : isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"
            }`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  formData.autoDebitEnabled ? "bg-primary text-white" : "bg-gray-500/20 text-gray-500"
                }`}>
                  <Zap size={24} className={formData.autoDebitEnabled ? "animate-pulse" : ""} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">Auto-Debit Protocol</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Enable automated recurring collections</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, autoDebitEnabled: !formData.autoDebitEnabled})}
                className={`relative w-20 h-10 rounded-full transition-all duration-500 p-1 ${
                  formData.autoDebitEnabled ? "bg-primary" : "bg-gray-400"
                }`}
              >
                <div className={`w-8 h-8 bg-white rounded-full transition-all duration-500 shadow-lg ${
                  formData.autoDebitEnabled ? "translate-x-10" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className={`p-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${
            isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"
          }`}>
            <div className="flex items-center gap-3 text-primary opacity-60">
              <ShieldCheck size={20} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Validated AES-256 Configuration</p>
            </div>
            
            <button 
              type="submit"
              disabled={loading.submitting}
              className="group relative w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-primary/40 disabled:opacity-50"
            >
              <div className="relative flex items-center justify-center gap-4">
                {loading.submitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Push Configuration
              </div>
            </button>
          </div>
        </div>
      </form>

      {/* Info Card */}
      <div className={`p-8 rounded-[2rem] border-l-8 border-primary flex gap-6 ${
        isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-100 shadow-xl"
      }`}>
        <div className="text-primary"><Cpu size={32} /></div>
        <div className="space-y-1">
          <p className="font-black text-xs uppercase tracking-widest">System Logic Note</p>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Changing the <span className="text-primary font-bold">Payment Mode</span> will immediately affect the user-facing checkout 
            experience for the selected campus. Ensure the <span className="text-primary font-bold">Gateway Provider</span> 
            is fully onboarded before deployment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampusPaymentConfig; 