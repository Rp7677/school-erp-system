import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../../config/api"; 
import { 
  Wallet, Plus, Search, 
  Bus, GraduationCap, Home, Coffee, 
  Edit3, ShieldCheck, Fingerprint,
  Loader2, XCircle, Info, AlertCircle,
  ShieldAlert, Save, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Trash2, HelpCircle
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const FeesCategoryManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({ fetch: true, save: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  
  // Updated confirmModal to handle ALL CRUD operations
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    actionType: "", // CREATE, UPDATE, DELETE, TOGGLE_STATUS
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await api.get("/api/fee-categories/all");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const filteredData = useMemo(() => {
    return categories.filter(cat => 
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cat.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Trigger Confirmation for Form Submission (Create/Update)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return toast.error("Please fill all fields");
    setConfirmModal({ 
      show: true, 
      actionType: editId ? "UPDATE" : "CREATE", 
      data: formData 
    });
  };

  // Trigger Confirmation for Delete
  const handleDeleteClick = (cat) => {
    setConfirmModal({ show: true, actionType: "DELETE", data: cat });
  };

  // Trigger Confirmation for Status Toggle
  const handleToggleClick = (cat) => {
    setConfirmModal({ show: true, actionType: "TOGGLE_STATUS", data: cat });
  };

  // Centralized Execution logic for all operations
  const executeOperation = async () => {
    const { actionType, data } = confirmModal;
    setConfirmModal({ show: false, actionType: "", data: null });
    setLoading(prev => ({ ...prev, save: true }));

    try {
      if (actionType === "DELETE") {
        await api.delete(`/api/fee-categories/${data.id}`);
        setCategories(prev => prev.filter(c => c.id !== data.id));
        toast.success("Category Deleted Successfully");
      } 
      else if (actionType === "TOGGLE_STATUS") {
        const newStatus = !data.isActive;
        await api.patch(`/api/fee-categories/${data.id}/status?isActive=${newStatus}`);
        setCategories(prev => prev.map(c => c.id === data.id ? { ...c, isActive: newStatus } : c));
        toast.success(`Marked as ${newStatus ? 'Active' : 'Inactive'}`);
      }
      else {
        // Handle CREATE or UPDATE
        const payload = {
          code: data.code.toUpperCase().trim(),
          name: data.name.trim()
        };

        if (actionType === "UPDATE") {
          const res = await api.put(`/api/fee-categories/${editId}`, payload);
          toast.success("Category Updated");
          setCategories(prev => prev.map(cat => cat.id === editId ? res.data : cat));
        } else {
          const res = await api.post("/api/fee-categories", payload);
          toast.success("Category Created");
          setCategories(prev => [res.data, ...prev]);
        }
        // Reset form after success for Create/Update
        setFormData({ name: "", code: "" });
        setEditId(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const getIcon = (code) => {
    const c = code?.toUpperCase() || "";
    if (c.includes("TUT") || c.includes("EDU")) return <GraduationCap size={20}/>;
    if (c.includes("TRA")) return <Bus size={20}/>;
    if (c.includes("HOS")) return <Home size={20}/>;
    if (c.includes("MES") || c.includes("CAF")) return <Coffee size={20}/>;
    return <Wallet size={20}/>;
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* --- CENTRALIZED CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${confirmModal.actionType === 'DELETE' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                <ShieldAlert className={confirmModal.actionType === 'DELETE' ? 'text-red-500' : 'text-primary'} size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Confirm {confirmModal.actionType.replace('_', ' ')}</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Financial System Protocol</p>
              </div>
            </div>
            
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to <span className={`font-black underline underline-offset-4 ${confirmModal.actionType === 'DELETE' ? 'text-red-500' : 'text-primary'}`}>{confirmModal.actionType.replace('_', ' ')}</span> category 
              <span className="font-bold"> {confirmModal.data?.name || "this record"}</span>? {confirmModal.actionType === 'DELETE' ? 'This action cannot be undone.' : 'This will affect global fee structures.'}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, actionType: "", data: null })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all text-current">Cancel</button>
              <button onClick={executeOperation} className={`flex-1 h-12 rounded-xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all ${confirmModal.actionType === 'DELETE' ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'}`}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Wallet className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Fees <span className="text-primary not-italic">Category</span>
            </h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Financial Control Terminal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}>
            <Info size={20} />
          </button>
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
            <div className="px-5 py-2 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total Records</p>
              <p className="text-sm font-black">{categories.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className=" mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {/* Form Card */}
          <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
            <div className="p-8 border-b border-white/5 bg-primary/5">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{editId ? "Edit Category" : "Register Category"}</h2>
              <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mt-1">Configure global fee types</p>
            </div>
            <form onSubmit={handleFormSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</label>
                <input 
                  type="text"
                  placeholder="E.G. TUITION FEES"
                  className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unique Code</label>
                <input 
                  type="text"
                  placeholder="E.G. TUI_01"
                  className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`}
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading.save} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {loading.save ? <Loader2 className="animate-spin" /> : editId ? <Edit3 size={18}/> : <Save size={18} />}
                  {editId ? "Update Category" : "Finalize Category"}
                </button>
                {editId && (
                  <button type="button" onClick={() => {setEditId(null); setFormData({name:"", code:""})}} className="px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 transition-all">Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Table Card */}
          <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-primary/5">
              <h3 className="font-black uppercase text-xs tracking-widest">Financial Registry</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                <input 
                  type="text"
                  placeholder="FILTER RECORDS..."
                  className={`w-full h-10 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                    <th className="px-8 py-5">Identity</th>
                    <th className="px-8 py-5">System Code</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading.fetch ? (
                    <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
                  ) : paginatedData.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">No matching records found</td></tr>
                  ) : (
                    paginatedData.map((cat) => (
                      <tr key={cat.id} className={`transition-colors ${theme.rowHover}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">{getIcon(cat.code)}</div>
                            <span className="font-black text-[11px] uppercase tracking-tight">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-mono text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                            {cat.code}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <button onClick={() => handleToggleClick(cat)} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all active:scale-95 ${cat.isActive ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-red-500/30 text-red-500 bg-red-500/5"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{cat.isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button onClick={() => { setEditId(cat.id); setFormData({name: cat.name, code: cat.code}); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-3 rounded-xl hover:bg-primary/10 text-gray-400 hover:text-primary transition-all">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(cat)} className="p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all">
                            <Trash2 size={18} />
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all">
                    <ChevronsLeft size={16} />
                  </button>
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                        if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="opacity-20">.</span>;
                        return null;
                      }
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === pageNum ? 'bg-primary text-white' : 'hover:bg-white/5 opacity-50'}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all">
                    <ChevronRight size={16} />
                  </button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all">
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`rounded-3xl border p-8 sticky top-10 ${theme.panel}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <HelpCircle className="text-primary" size={20} />
                </div>
                <h4 className="font-black uppercase text-xs tracking-widest">Manager Guide</h4>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Workflow Overview</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    The **Fees Category Manager** is the backbone of your financial setup. Categories created here act as headers for specific fee heads.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                    <ShieldCheck size={12} /> Critical Operations
                  </h5>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    All **Create**, **Update**, **Status Changes** and **Delete** actions require confirmation to prevent accidental changes to existing fee collections.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase opacity-40 px-1">Quick Instructions</h5>
                  {[
                    { t: 'Assigning Codes', d: 'Use meaningful abbreviations (e.g., TRANS for Transport) for easier filtering.' },
                    { t: 'Status Toggle', d: 'Inactive categories won\'t appear in new fee structure creation forms.' },
                    { t: 'Smart Icons', d: 'Icons adapt based on codes (TUT, EDU, TRA, HOS, MES).' }
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

                <button onClick={() => setShowInfo(false)} className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all text-current">Dismiss Panel</button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default FeesCategoryManager;