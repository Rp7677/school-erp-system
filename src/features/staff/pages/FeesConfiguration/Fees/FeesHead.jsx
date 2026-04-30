import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../../config/api"; 
import { 
  Tag, Plus, Search, Globe, Building2, 
  Edit3, ShieldCheck, Fingerprint, Loader2, 
  XCircle, Info, AlertCircle, ShieldAlert, 
  Save, ChevronLeft, ChevronRight, ChevronsLeft, 
  ChevronsRight, Trash2, HelpCircle, RefreshCw, Layers
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const FeesHeadManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);
  
  // --- DATA STATES ---
  const [heads, setHeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({ fetch: true, save: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // --- FORM STATE ---
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", code: "", categoryId: "", global: true, campusId: "", ledgerCode: ""
  });
  
  // --- MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    actionType: "", // CREATE, UPDATE, TOGGLE_STATUS
    data: null 
  });

  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
  };

  const fetchInitialData = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [headsRes, catRes] = await Promise.all([
        api.get("/api/fees/heads"),
        api.get("/api/fee-categories/all")
      ]);
      setHeads(Array.isArray(headsRes.data) ? headsRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (error) {
      toast.error("Failed to sync financial ledger");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // --- SEARCH & PAGINATION LOGIC ---
  const filteredData = useMemo(() => {
    return heads.filter(h => 
      h.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [heads, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // --- HANDLERS ---
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.categoryId) {
      return toast.error("Essential fields missing");
    }
    setConfirmModal({ 
      show: true, 
      actionType: editId ? "UPDATE" : "CREATE", 
      data: formData 
    });
  };

  const handleToggleClick = (head) => {
    setConfirmModal({ 
      show: true, 
      actionType: "TOGGLE_STATUS", 
      data: head 
    });
  };

  const executeOperation = async () => {
    const { actionType, data } = confirmModal;
    setConfirmModal({ show: false, actionType: "", data: null });
    
    if (actionType === "TOGGLE_STATUS") {
      const newStatus = !data.active;
      try {
        await api.patch(`/api/fees/heads/${data.id}/status`, { active: newStatus });
        setHeads(prev => prev.map(h => h.id === data.id ? { ...h, active: newStatus } : h));
        toast.success(`Head marked as ${newStatus ? 'Active' : 'Inactive'}`);
      } catch (error) {
        toast.error("Status update failed");
      }
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    const payload = {
      ...data,
      code: data.code.toUpperCase().trim(),
      campusId: data.global ? null : parseInt(data.campusId),
      categoryId: parseInt(data.categoryId)
    };

    try {
      if (actionType === "UPDATE") {
        await api.put(`/api/fees/heads/${editId}`, payload);
        toast.success("Fees Head Updated Successfully");
      } else {
        await api.post("/api/fees/heads", payload);
        toast.success("Fees Head Registered");
      }
      resetForm();
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", categoryId: "", global: true, campusId: "", ledgerCode: "" });
    setEditId(null);
  };

  const handleEdit = (head) => {
    setEditId(head.id);
    setFormData({
      name: head.name, code: head.code, categoryId: head.categoryId,
      global: head.global, campusId: head.campusId || "", ledgerCode: head.ledgerCode || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
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
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Confirm {confirmModal.actionType.replace('_', ' ')}</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Financial System Protocol</p>
              </div>
            </div>
            
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to <span className="font-black underline underline-offset-4 text-primary">{confirmModal.actionType.replace('_', ' ')}</span> the fees head 
              <span className="font-bold"> {confirmModal.data?.name}</span>? This will sync directly with the global ledger and fee structures.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, actionType: "", data: null })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all text-current">Cancel</button>
              <button onClick={executeOperation} className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className=" mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10 px-4">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 -rotate-2">
            <Tag className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Fees <span className="text-primary not-italic">Heads</span>
            </h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Revenue Identification Unit</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}>
            <Info size={20} />
          </button>
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
            <div className="px-5 py-2 text-center border-r border-white/5">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total Heads</p>
              <p className="text-sm font-black">{heads.length}</p>
            </div>
            <button onClick={fetchInitialData} className="p-2 hover:bg-white/5 rounded-lg transition-all text-primary">
                <RefreshCw size={16} className={loading.fetch ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {/* Form Card */}
          <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
            <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">{editId ? "Update Ledger Head" : "Register Ledger Head"}</h2>
                <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mt-1">Define specific revenue streams</p>
              </div>
              {editId && <button onClick={resetForm} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><XCircle size={20}/></button>}
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Head Name</label>
                  <input type="text" placeholder="E.G. ADMISSION FEE" className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unique Code</label>
                  <input type="text" placeholder="E.G. ADM_01" className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fee Category</label>
                  <select className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Select Category...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tally Ledger Code</label>
                  <input type="text" placeholder="E.G. L_ADM_101" className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={formData.ledgerCode} onChange={(e) => setFormData({...formData, ledgerCode: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Visibility Scope</label>
                  <select className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={formData.global} onChange={(e) => setFormData({...formData, global: e.target.value === "true"})}>
                    <option value="true">Global Unit</option>
                    <option value="false">Campus Specific</option>
                  </select>
                </div>
                {!formData.global && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Campus</label>
                    <select className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={formData.campusId} onChange={(e) => setFormData({...formData, campusId: e.target.value})}>
                      <option value="">Choose Campus...</option>
                      {campuses?.map(cam => <option key={cam.campusId} value={cam.campusId}>{cam.campusName}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading.save} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {loading.save ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  {editId ? "Update Ledger Unit" : "Finalize Ledger Head"}
                </button>
              </div>
            </form>
          </div>

          {/* Table Card */}
          <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-primary/5">
              <h3 className="font-black uppercase text-xs tracking-widest">Financial Ledger</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                <input type="text" placeholder="FILTER LEDGER..." className={`w-full h-10 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                    <th className="px-8 py-5">Head Details</th>
                    <th className="px-8 py-5 text-center">System Code</th>
                    <th className="px-8 py-5">Financial Scope</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading.fetch ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
                  ) : paginatedData.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">No financial units mapped</td></tr>
                  ) : (
                    paginatedData.map((head) => (
                      <tr key={head.id} className={`transition-colors ${theme.rowHover}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Tag size={20}/></div>
                            <div>
                                <p className="font-black text-[11px] uppercase tracking-tight">{head.name}</p>
                                <p className="text-[9px] font-bold text-primary opacity-60 uppercase">{head.categoryCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="font-mono text-[9px] font-black opacity-60 bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
                            {head.code}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                            {head.global ? (
                                <div className="flex items-center gap-1.5 text-blue-500/80">
                                    <Globe size={12} />
                                    <span className="text-[9px] font-black uppercase">Global Unit</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-orange-500/80">
                                    <Building2 size={12} />
                                    <span className="text-[9px] font-black uppercase truncate max-w-[100px]">
                                        {campuses.find(c => c.campusId === head.campusId)?.campusName || 'Local'}
                                    </span>
                                </div>
                            )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {/* Updated Button Design to Match Category Manager */}
                          <button 
                            onClick={() => handleToggleClick(head)} 
                            className={`flex items-center gap-2 px-3 py-1 mx-auto rounded-full border transition-all active:scale-95 ${head.active ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-red-500/30 text-red-500 bg-red-500/5"}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${head.active ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{head.active ? "Active" : "Inactive"}</span>
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button onClick={() => handleEdit(head)} className="p-2.5 rounded-xl hover:bg-primary/10 text-gray-400 hover:text-primary transition-all">
                            <Edit3 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                  Unit {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all text-primary">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}>
                          {i + 1}
                        </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all text-primary">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`rounded-3xl border p-8 sticky top-6 ${theme.panel}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><HelpCircle className="text-primary" size={20} /></div>
                <h4 className="font-black uppercase text-xs tracking-widest">Head Configuration</h4>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Heads vs Categories</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    Fees Heads are granular financial units. They must be mapped to a **Category** for structured billing and accounting.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                    <ShieldCheck size={12} /> Tally Integration
                  </h5>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    Mapping a **Ledger Code** allows the system to export transaction data directly into accounting platforms.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase opacity-40 px-1">Best Practices</h5>
                  {[
                    { t: 'Code Uniformity', d: 'Use standard suffixes like _ADM for Admission related heads.' },
                    { t: 'Campus Isolation', d: 'Use campus-specific scope for fees unique to a single location.' },
                    { t: 'Status Protocol', d: 'Deactivating a head prevents it from being used in new due date structures.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{item.t}</p>
                        <p className="text-[10px] opacity-50 leading-tight">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowInfo(false)} className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all text-current">Dismiss Information</button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default FeesHeadManager;