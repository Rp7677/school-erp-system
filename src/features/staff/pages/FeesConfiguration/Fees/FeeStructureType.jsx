import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Layers, School, Plus, Search, Loader2, 
  ArrowLeft, LayoutGrid, List, Filter, 
  CheckCircle2, Hash, FileText, Calendar,
  RefreshCcw, ShieldCheck, Info, HelpCircle, 
  ShieldAlert, Save, XCircle, ChevronLeft, 
  ChevronRight, ChevronsLeft, ChevronsRight,
  Fingerprint, ChevronDown
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../../config/api"; 
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const FeeStructureTypeManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  // --- STATE ---
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, process: false });
  const [showInfo, setShowInfo] = useState(false);
  const [structureTypes, setStructureTypes] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    name: "",
    code: ""
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    actionType: "", 
    data: null 
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

  // --- DATA FETCHING ---
  useEffect(() => {
    if (campuses?.length > 0 && !selectedCampusId) {
      setSelectedCampusId(campuses[0].campusId.toString());
    }
  }, [campuses, selectedCampusId]);

  const fetchStructureTypes = useCallback(async (campusId) => {
    if (!campusId) return;
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await api.get(`/api/fees/structure-types?campus_id=${campusId}`);
      setStructureTypes(res.data || []);
    } catch (err) {
      setStructureTypes([]); 
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => {
    if (selectedCampusId) fetchStructureTypes(selectedCampusId);
  }, [selectedCampusId, fetchStructureTypes]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(structureTypes.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return structureTypes.slice(start, start + itemsPerPage);
  }, [structureTypes, currentPage]);

  // --- CRUD TRIGGERS ---
  const handleCreateTrigger = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return toast.error("Please fill all fields");
    setConfirmModal({ show: true, actionType: "CREATE", data: formData });
  };

  const executeOperation = async () => {
    const { data } = confirmModal;
    setConfirmModal({ show: false, actionType: "", data: null });
    setLoading(prev => ({ ...prev, process: true }));

    try {
      const payload = { ...data, campusId: parseInt(selectedCampusId) };
      await api.post("/api/fees/structure-types", payload);
      toast.success("Structure Type Initialized");
      setFormData({ name: "", code: "" });
      setIsCreating(false);
      fetchStructureTypes(selectedCampusId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
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
              Are you sure you want to initialize the <span className="text-primary font-black">{confirmModal.data?.name}</span> fee structure type? This category will be used for global student billing.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={executeOperation} className="flex-1 h-12 rounded-xl text-white font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20 transition-all">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className=" mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Layers className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Structure <span className="text-primary not-italic">Types</span></h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Fee Classification Registry</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : 'opacity-50 ' + theme.panel}`}>
            <Info size={20} />
          </button>
          <div className={`px-6 py-3 rounded-2xl border text-center ${theme.panel}`}>
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Active Types</p>
            <p className="text-sm font-black">{structureTypes.length}</p>
          </div>
        </div>
      </header>

      <main className=" mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {isCreating ? (
            <div className={`${cardClass} animate-in slide-in-from-top-4`}>
              <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Initialize Type</h2>
                <button onClick={() => setIsCreating(false)} className="opacity-40 hover:opacity-100 transition-transform active:scale-90"><XCircle size={20}/></button>
              </div>
              
              <form onSubmit={handleCreateTrigger} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Context Campus</label>
                  <div className="relative">
                    <select className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}>
                      {campuses?.map(c => <option key={c.campusId} value={c.campusId} className="bg-[#0D0D0D]">{c.campusName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2"><FileText size={10}/> Type Name</label>
                  <input required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} placeholder="E.G. SCHOLARSHIP" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2"><Hash size={10}/> Short Identifier</label>
                  <input required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} placeholder="E.G. SCH_01" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_')})} />
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" disabled={loading.process} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    {loading.process ? <Loader2 className="animate-spin" /> : <Save size={18} />} Finalize Registration
                  </button>
                  <button type="button" onClick={() => setIsCreating(false)} className="px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* --- CONTROL BAR --- */}
              <div className={`${cardClass} p-4 flex flex-wrap items-center justify-between gap-4`}>
                <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border ${theme.input}`}>
                  <School size={14} className="text-primary shrink-0" />
                  <select value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer pr-6 appearance-none">
                    {campuses?.map(c => <option key={c.campusId} value={c.campusId} className="bg-[#0D0D0D]">{c.campusName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" size={12} />
                </div>
                <button onClick={() => setIsCreating(true)} className="bg-primary text-white px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Plus size={18} /> New Category
                </button>
              </div>

              {/* --- REGISTRY TABLE --- */}
              <div className={cardClass}>
                <div className="p-6 border-b border-white/5 bg-primary/5">
                  <h3 className="font-black uppercase text-[10px] tracking-widest opacity-70 italic">Classification Registry</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                        <th className="px-8 py-6">Type Identity</th>
                        <th className="px-8 py-6">System Code</th>
                        <th className="px-8 py-6">Created On</th>
                        <th className="px-8 py-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading.fetch ? (
                        <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin inline-block text-primary" size={40} /></td></tr>
                      ) : paginatedData.length === 0 ? (
                        <tr><td colSpan={4} className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-widest italic">No structure types found</td></tr>
                      ) : (
                        paginatedData.map((type) => (
                          <tr key={type.id} className={`transition-colors group ${theme.rowHover}`}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner transition-transform group-hover:rotate-6"><Layers size={20} /></div>
                                <span className="font-black text-[11px] uppercase tracking-tight">{type.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="font-mono text-[11px] font-black tracking-tighter text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 italic">
                                {type.code}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black">{new Date(type.createdAt).toLocaleDateString()}</span>
                                <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest">Protocol ID: #{type.id}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${type.active ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-rose-500/20 text-rose-500 bg-rose-500/5"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${type.active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                {type.active ? "Operational" : "Disabled"}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- PAGINATION --- */}
                {structureTypes.length > 0 && (
                  <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, structureTypes.length)} of {structureTypes.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronsLeft size={16} /></button>
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronLeft size={16} /></button>
                      <div className="flex items-center gap-1 mx-2">
                        {[...Array(totalPages)].map((_, i) => (
                          <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'hover:bg-white/5 opacity-50'}`}>{i + 1}</button>
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
            <div className={`${cardClass} p-8 sticky top-10`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><HelpCircle className="text-primary" size={20} /></div>
                <h4 className="font-black uppercase text-xs tracking-widest italic">Structure Guide</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Category Logic</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    Structure types act as parent categories for specific fee plans. For example, creating a **"Scholarship"** type allows you to assign different fee heads exclusively to students under that category.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2"><ShieldCheck size={12} /> Compliance</h5>
                  <p className="text-[10px] leading-relaxed opacity-70 italic">Ensure names and codes are unique to avoid ledger collisions during auditing.</p>
                </div>
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase opacity-40 px-1 italic">Protocol Checklist</h5>
                  {[
                    { t: 'Identifier Code', d: 'Used as a system key for grouping students in the billing engine.' },
                    { t: 'Context Campus', d: 'Structure types are campus-specific to allow regional billing flexibility.' }
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

export default FeeStructureTypeManager;