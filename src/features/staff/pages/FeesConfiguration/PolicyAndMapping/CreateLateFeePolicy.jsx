import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../../config/api"; 
import { 
  Plus, Search, Edit3, Loader2, Filter, Percent, 
  CalendarClock, Banknote, AlertCircle, ChevronDown, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowLeft, Info, HelpCircle, ShieldAlert, Save, XCircle,
  Fingerprint, ShieldCheck
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const LateFeePolicyManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  // --- STATE MANAGEMENT ---
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState({ fetch: true, save: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef(null);
  
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", calculationType: "PER_DAY", value: "", graceDays: "", maxCap: "" 
  });

  const [confirmModal, setConfirmModal] = useState({ 
    show: false, actionType: "", data: null 
  });

  // --- THEME & STYLES ---
  const theme = {
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
    select: isDark 
      ? "bg-[#141414] border-white/10 text-white appearance-none cursor-pointer focus:border-primary/50" 
      : "bg-white border-slate-200 text-slate-900 appearance-none cursor-pointer focus:border-primary",
  };

  const cardClass = `rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${theme.panel}`;

  const ENDPOINT = "/api/late-fee-policies";

  const calcOptions = [
    { id: "PER_DAY", label: "PER DAY (Fixed)", icon: <CalendarClock size={16}/> },
    { id: "PERCENTAGE", label: "PERCENTAGE (%)", icon: <Percent size={16}/> },
    { id: "FIXED", label: "ONE TIME FIXED", icon: <Banknote size={16}/> },
  ];

  useEffect(() => {
    fetchPolicies();
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsSelectOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPolicies = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await api.get(ENDPOINT);
      setPolicies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load policies");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // --- CRUD PROTOCOL ---
  const handleTriggerSave = (e) => {
    e.preventDefault();
    setConfirmModal({ show: true, actionType: editId ? "UPDATE" : "CREATE", data: formData });
  };

  const executeOperation = async () => {
    const { actionType, data } = confirmModal;
    setConfirmModal({ show: false, actionType: "", data: null });
    setLoading(prev => ({ ...prev, save: true }));
    
    const payload = {
      ...data,
      name: data.name.toUpperCase().trim(),
      value: parseFloat(data.value),
      graceDays: parseInt(data.graceDays),
      maxCap: data.maxCap && data.maxCap > 0 ? parseFloat(data.maxCap) : null
    };

    try {
      if (actionType === "UPDATE") {
        const res = await api.put(`${ENDPOINT}/${editId}`, payload);
        toast.success("Policy Updated");
        setPolicies(prev => prev.map(p => p.id === editId ? res.data : p));
      } else {
        const res = await api.post(ENDPOINT, payload);
        toast.success("Policy Created");
        setPolicies(prev => [res.data, ...prev]);
      }
      handleBackToList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleBackToList = () => {
    setFormData({ name: "", calculationType: "PER_DAY", value: "", graceDays: "", maxCap: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (policy) => {
    setEditId(policy.id);
    setFormData({
      name: policy.name,
      calculationType: policy.calculationType,
      value: policy.value,
      graceDays: policy.graceDays,
      maxCap: policy.maxCap || ""
    });
    setShowForm(true);
  };

  // Search & Pagination Logic
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [policies, searchTerm]);

  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return filteredPolicies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredPolicies, currentPage]);

  const getCalcIcon = (type) => {
    switch(type) {
      case "PERCENTAGE": return <Percent size={18}/>;
      case "PER_DAY": return <CalendarClock size={18}/>;
      default: return <Banknote size={18}/>;
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10">
                <ShieldAlert className="text-primary" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Confirm Execution</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Financial Protocol Registry</p>
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to {confirmModal.actionType === "UPDATE" ? "update" : "create"} the <span className="text-primary font-black">{confirmModal.data?.name || "this policy"}</span>? 
              This will impact penalty calculations across all pending fee collections.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={executeOperation} className="flex-1 h-12 rounded-xl text-white font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20 transition-all">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Banknote className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Late Fee <span className="text-primary not-italic">Policies</span></h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Revenue Integrity Terminal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : 'opacity-50 ' + theme.panel}`}>
            <Info size={20} />
          </button>
          <div className={`px-6 py-3 rounded-2xl border text-center ${theme.panel}`}>
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Active Rules</p>
            <p className="text-sm font-black">{policies.length}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {showForm ? (
            <div className={`${cardClass} animate-in slide-in-from-top-4`}>
              <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">{editId ? "Update Policy" : "New Rule Configuration"}</h2>
                <button onClick={handleBackToList} className="opacity-40 hover:opacity-100 transition-transform active:scale-90"><XCircle size={20}/></button>
              </div>
              
              <form onSubmit={handleTriggerSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Policy Identity (Name)</label>
                  <input required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} placeholder="E.G. OVERDUE_PENALTY_L1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Calculation Method</label>
                  <div className="relative" ref={selectRef}>
                    <button type="button" onClick={() => setIsSelectOpen(!isSelectOpen)} className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none flex items-center justify-between ${theme.input}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-primary">{calcOptions.find(o => o.id === formData.calculationType)?.icon}</span>
                        <span>{calcOptions.find(o => o.id === formData.calculationType)?.label}</span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform opacity-40 ${isSelectOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isSelectOpen && (
                      <div className={`absolute z-50 w-full mt-2 p-2 rounded-2xl shadow-2xl border animate-in fade-in zoom-in-95 ${isDark ? "bg-[#141414] border-white/10" : "bg-white border-slate-200"}`}>
                        {calcOptions.map((opt) => (
                          <button key={opt.id} type="button" 
                            onClick={() => { setFormData({...formData, calculationType: opt.id}); setIsSelectOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${formData.calculationType === opt.id ? "bg-primary text-white" : isDark ? "hover:bg-white/5 text-gray-300" : "hover:bg-slate-50 text-gray-700"}`}>
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Penalty Value</label>
                  <input type="number" step="0.01" required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Grace Period (Days)</label>
                  <input type="number" required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} value={formData.graceDays} onChange={(e) => setFormData({...formData, graceDays: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Maximum Limit (Max Cap)</label>
                  <input type="number" placeholder="Leave blank for no limit" className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} value={formData.maxCap} onChange={(e) => setFormData({...formData, maxCap: e.target.value})} />
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" disabled={loading.save} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    {loading.save ? <Loader2 className="animate-spin" /> : <Save size={18} />} {editId ? "Update Policy" : "Finalize Protocol"}
                  </button>
                  <button type="button" onClick={handleBackToList} className="px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* --- CONTROL BAR --- */}
              <div className={`${cardClass} p-4 flex flex-wrap items-center justify-between gap-4`}>
                <div className={`relative flex items-center gap-3 px-5 py-2.5 rounded-xl border ${theme.input} w-full md:w-80 group`}>
                  <Search size={16} className="text-primary shrink-0 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  <input type="text" placeholder="SEARCH POLIES..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="bg-transparent font-black text-[10px] uppercase outline-none w-full" />
                </div>
                <button onClick={() => setShowForm(true)} className="bg-primary text-white px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Plus size={18} /> New Policy
                </button>
              </div>

              {/* --- REGISTRY TABLE --- */}
              <div className={cardClass}>
                <div className="p-6 border-b border-white/5 bg-primary/5">
                  <h3 className="font-black uppercase text-[10px] tracking-widest opacity-70 italic">Penalty Registry</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                        <th className="px-8 py-6">Policy & Calculation</th>
                        <th className="px-8 py-6 text-center">Value Details</th>
                        <th className="px-8 py-6 text-center">Grace Period</th>
                        <th className="px-8 py-6 text-center">Max Cap</th>
                        <th className="px-8 py-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading.fetch ? (
                        <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin inline-block text-primary" size={32} /></td></tr>
                      ) : paginatedData.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-widest italic">No matching policies found in registry</td></tr>
                      ) : (
                        paginatedData.map((p) => (
                          <tr key={p.id} className={`transition-colors group ${theme.rowHover}`}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner group-hover:rotate-6 transition-transform">
                                  {getCalcIcon(p.calculationType)}
                                </div>
                                <div>
                                  <p className="font-black text-[11px] uppercase tracking-tight">{p.name}</p>
                                  <p className="text-[9px] font-bold text-primary opacity-50 uppercase tracking-widest mt-0.5">{p.calculationType.replace('_', ' ')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="font-mono text-[11px] font-black tracking-tighter text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 italic">
                                {p.value}{p.calculationType === 'PERCENTAGE' ? '%' : ''}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border border-white/5 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                {p.graceDays} DAYS
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{p.maxCap ? `₹${p.maxCap}` : "∞ UNLIMITED"}</p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => handleEdit(p)} className="p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-all border border-transparent hover:border-primary/20">
                                <Edit3 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- PAGINATION --- */}
                {filteredPolicies.length > itemsPerPage && (
                  <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPolicies.length)} of {filteredPolicies.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronsLeft size={16} /></button>
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronLeft size={16} /></button>
                      <div className="flex items-center gap-1 mx-2">
                        {[...Array(totalPages)].map((_, i) => (
                          <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 opacity-50'}`}>{i + 1}</button>
                        ))}
                      </div>
                      <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronRight size={16} /></button>
                      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronsRight size={16} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`${cardClass} p-8 sticky top-10 shadow-2xl shadow-black/20`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><HelpCircle className="text-primary" size={20} /></div>
                <h4 className="font-black uppercase text-xs tracking-widest italic">Penalty Guide</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Policy Mechanism</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    The Late Fee engine automatically calculates penalties once the **Grace Period** is exceeded. Rules defined here are linked to specific fee installments.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2"><ShieldCheck size={12} /> Calculation Logic</h5>
                  <p className="text-[10px] leading-relaxed opacity-70 italic">
                    <span className="text-primary font-bold">PER DAY:</span> Multiplies value by overdue days. <br/>
                    <span className="text-primary font-bold">PERCENTAGE:</span> Calculates % of total overdue amount. <br/>
                    <span className="text-primary font-bold">FIXED:</span> Applies one-time charge on first overdue day.
                  </p>
                </div>
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase opacity-40 px-1 italic">Protocol Checklist</h5>
                  {[
                    { t: 'Grace Period', d: 'Days after the due date before penalty logic is triggered.' },
                    { t: 'Maximum Cap', d: 'Protects against excessive penalty accumulation (Safety cap).' },
                    { t: 'Short Codes', d: 'Policy names must be unique and descriptive for accounting clarity.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{item.t}</p>
                        <p className="text-[10px] opacity-40 leading-tight">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowInfo(false)} className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all hover:bg-white/5">Dismiss Panel</button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default LateFeePolicyManager;